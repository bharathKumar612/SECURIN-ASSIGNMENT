const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getAllCveList = async (req, res) => {
  const { startIndex, resultsPerPage } = req.query;

  const cves = await prisma.cVE.findMany({
    skip: +startIndex * +resultsPerPage,
    take: +resultsPerPage,
  });

  const totalResults = await prisma.cVE.count();

  res.status(200).json({
    cves,
    totalResults,
    startIndex: +startIndex,
    resultsPerPage: +resultsPerPage,
  });
};

const getSingleCveById = async (req, res) => {
  const id = req.params.cveId;

  const cve = await prisma.cVE.findUnique({
    where: {
      id: id,
    },
    include: {
      configurations: true,
      descriptions: true,
      metrics: {
        include: {
          cvssMetricV2: true,
          cvssMetricV30: true,
          cvssMetricV31: true,
        },
      },
    },
  });

  if (!cve) {
    return res
      .status(404)
      .json({ message: "The requested resource could not be found" });
  }

  return res.status(200).json({ cve });
};

module.exports = { getAllCveList, getSingleCveById };
