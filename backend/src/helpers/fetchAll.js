const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
const { isAxiosError } = require("axios");
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const { BASE_URL } = require("./constants");
const logger = require("./logger");
const os = require("os");

const NUM_WORKERS = Math.max(1, Math.min(os.cpus().length - 1, 4)); // Max 4 workers
const BATCH_SIZE = 2000;

const runFetchAll = () => {
  if (isMainThread) {
    const prisma = new PrismaClient();

    async function createWorker(vulnerabilitiesData) {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { vulnerabilitiesData },
        });

        worker.on("message", resolve);
        worker.on("error", reject);
        worker.on("exit", (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    }

    async function processBatchWithWorkers(vulnerabilitiesData) {
      const batchSize = Math.ceil(vulnerabilitiesData.length / NUM_WORKERS);
      const batches = [];

      for (let i = 0; i < vulnerabilitiesData.length; i += batchSize) {
        batches.push(vulnerabilitiesData.slice(i, i + batchSize));
      }

      const workers = batches.map((batch) => createWorker(batch));
      await Promise.all(workers);
    }

    const generateUrl = async (resultsPerPage, startIndex) => {
      const url = `${BASE_URL}?resultsPerPage=${resultsPerPage}&startIndex=${startIndex}`;
      logger.log(`Generated URL: ${url}`);
      return url;
    };

    const fetchDataFromServer = async (url) => {
      logger.log(`Fetching data from: ${url}`);
      const startTime = Date.now();
      const response = await axios.get(url);
      const endTime = Date.now();
      logger.log(`Fetch completed in ${endTime - startTime}ms`);
      return response.data;
    };

    const fetchAll = async () => {
      try {
        logger.log(`Starting data fetch process with ${NUM_WORKERS} workers`);
        let totalResults;
        let index = 0;

        const url = await generateUrl(BATCH_SIZE, index);
        const data = await fetchDataFromServer(url);

        if (!data?.vulnerabilities) {
          throw new Error("Invalid response format");
        }

        await processBatchWithWorkers(data.vulnerabilities);
        totalResults = data.totalResults - BATCH_SIZE;

        while (totalResults > 0) {
          index += BATCH_SIZE;
          logger.log(`Remaining records: ${totalResults}`);
          const newUrl = await generateUrl(BATCH_SIZE, index);
          const data = await fetchDataFromServer(newUrl);

          if (!data?.vulnerabilities) {
            throw new Error("Invalid response format");
          }

          await processBatchWithWorkers(data.vulnerabilities);
          totalResults -= BATCH_SIZE;
        }

        logger.log("Data fetch process completed successfully");
        await prisma.$disconnect();
      } catch (error) {
        if (isAxiosError(error)) {
          logger.error(
            `HTTP Error ${error.response?.status}:`,
            error.response?.data
          );
        } else {
          logger.error("Error during fetch process:", error);
        }
        await prisma.$disconnect();
      }
    };

    fetchAll();
  } else {
    // Worker thread code
    const prisma = new PrismaClient();

    async function processVulnerability(vulnerability) {
      const { cve } = vulnerability;
      logger.log(`Worker ${process.pid} processing CVE ID: ${cve.id}`);

      try {
        await prisma.cVE.upsert({
          where: { id: cve.id },
          update: {},
          create: {
            id: cve.id,
            sourceIdentifier: cve.sourceIdentifier,
            published: new Date(cve.published),
            lastModified: new Date(cve.lastModified),
            vulnStatus: cve.vulnStatus,
            descriptions: {
              create: cve.descriptions.map((desc) => ({
                lang: desc.lang,
                value: desc.value,
              })),
            },
            metrics: cve.metrics
              ? {
                  create: {
                    cvssMetricV2: {
                      create:
                        cve.metrics.cvssMetricV2?.map((metric) => ({
                          source: metric.source,
                          type: metric.type,
                          vectorString: metric.cvssData.vectorString,
                          baseScore: metric.cvssData.baseScore,
                          accessVector: metric.cvssData.accessVector,
                          accessComplexity: metric.cvssData.accessComplexity,
                          authentication: metric.cvssData.authentication,
                          confidentialityImpact:
                            metric.cvssData.confidentialityImpact,
                          integrityImpact: metric.cvssData.integrityImpact,
                          availabilityImpact:
                            metric.cvssData.availabilityImpact,
                          baseSeverity: metric.baseSeverity,
                          exploitabilityScore: metric.exploitabilityScore,
                          impactScore: metric.impactScore,
                        })) || [],
                    },
                    cvssMetricV31: {
                      create:
                        cve.metrics.cvssMetricV31?.map((metric) => ({
                          source: metric.source,
                          type: metric.type,
                          vectorString: metric.cvssData.vectorString,
                          baseScore: metric.cvssData.baseScore,
                          baseSeverity: metric.cvssData.baseSeverity,
                          attackVector: metric.cvssData.attackVector,
                          attackComplexity: metric.cvssData.attackComplexity,
                          confidentialityImpact:
                            metric.cvssData.confidentialityImpact,
                          integrityImpact: metric.cvssData.integrityImpact,
                          availabilityImpact:
                            metric.cvssData.availabilityImpact,
                          accessVector: metric.cvssData.attackVector,
                          exploitabilityScore: metric.exploitabilityScore,
                          impactScore: metric.impactScore,
                        })) || [],
                    },
                  },
                }
              : undefined,
            weaknesses: {
              create:
                cve.weaknesses?.map((weakness) => ({
                  source: weakness.source,
                  type: weakness.type,
                  descriptions: {
                    create: weakness.description.map((desc) => ({
                      lang: desc.lang,
                      value: desc.value,
                    })),
                  },
                })) || [],
            },
            configurations: {
              create:
                cve.configurations?.map((config) => ({
                  nodes: {
                    create: config.nodes.map((node) => ({
                      operator: node.operator,
                      negate: node.negate,
                      cpeMatches: {
                        create: node.cpeMatch.map((match) => ({
                          vulnerable: match.vulnerable,
                          criteria: match.criteria,
                          matchCriteriaId: match.matchCriteriaId,
                        })),
                      },
                    })),
                  },
                })) || [],
            },
            references: {
              create:
                cve.references?.map((ref) => ({
                  url: ref.url,
                  source: ref.source,
                })) || [],
            },
          },
        });
      } catch (error) {
        logger.error(
          `Worker ${process.pid} error processing CVE ID ${cve.id}:`,
          error
        );
      }
    }

    async function processWorkerData() {
      try {
        for (const vulnerability of workerData.vulnerabilitiesData) {
          await processVulnerability(vulnerability);
        }
        await prisma.$disconnect();
        parentPort.postMessage("done");
      } catch (error) {
        logger.error(`Worker ${process.pid} error:`, error);
        await prisma.$disconnect();
        throw error;
      }
    }

    processWorkerData();
  }
};

module.exports = { runFetchAll };
