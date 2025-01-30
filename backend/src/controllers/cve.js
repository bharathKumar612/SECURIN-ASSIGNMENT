const { PrismaClient } = require("@prisma/client");

const createControllers = (prisma) => ({
  async getAllCveList(req, res) {
    try {
      const startIndex = parseInt(req.query.startIndex) || 0;
      const resultsPerPage = parseInt(req.query.resultsPerPage) || 10;

      if (startIndex < 0 || resultsPerPage < 1) {
        return res.status(400).json({
          message: "Invalid pagination parameters",
        });
      }

      // Parse date filter parameters
      const publishedStartDate = req.query.publishedStartDate
        ? new Date(req.query.publishedStartDate)
        : null;
      const publishedEndDate = req.query.publishedEndDate
        ? new Date(req.query.publishedEndDate)
        : null;
      const modifiedStartDate = req.query.modifiedStartDate
        ? new Date(req.query.modifiedStartDate)
        : null;
      const modifiedEndDate = req.query.modifiedEndDate
        ? new Date(req.query.modifiedEndDate)
        : null;

      // Validate dates if provided
      const dateParams = [
        { date: publishedStartDate, name: "publishedStartDate" },
        { date: publishedEndDate, name: "publishedEndDate" },
        { date: modifiedStartDate, name: "modifiedStartDate" },
        { date: modifiedEndDate, name: "modifiedEndDate" },
      ];

      for (const { date, name } of dateParams) {
        if (date && isNaN(date.getTime())) {
          return res.status(400).json({
            message: `Invalid date format for ${name}`,
          });
        }
      }

      // Build where clause dynamically
      const whereClause = {};

      if (publishedStartDate || publishedEndDate) {
        whereClause.published = {};
        if (publishedStartDate) {
          whereClause.published.gte = publishedStartDate;
        }
        if (publishedEndDate) {
          whereClause.published.lte = publishedEndDate;
        }
      }

      if (modifiedStartDate || modifiedEndDate) {
        whereClause.lastModified = {};
        if (modifiedStartDate) {
          whereClause.lastModified.gte = modifiedStartDate;
        }
        if (modifiedEndDate) {
          whereClause.lastModified.lte = modifiedEndDate;
        }
      }

      const cves = await prisma.cVE.findMany({
        where: whereClause,
        skip: startIndex,
        take: resultsPerPage,
      });

      const totalResults = await prisma.cVE.count({
        where: whereClause,
      });

      return res.status(200).json({
        cves,
        totalResults,
        startIndex,
        resultsPerPage,
        filters: {
          publishedStartDate: publishedStartDate?.toISOString() || null,
          publishedEndDate: publishedEndDate?.toISOString() || null,
          modifiedStartDate: modifiedStartDate?.toISOString() || null,
          modifiedEndDate: modifiedEndDate?.toISOString() || null,
        },
      });
    } catch (error) {
      throw error; // Let it propagate for error boundary/middleware
    }
  },

  async getSingleCveById(req, res) {
    try {
      const id = req.params.cveId;

      if (!id) {
        return res.status(400).json({
          message: "CVE ID is required",
        });
      }

      const cve = await prisma.cVE.findUnique({
        where: { id },
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
        return res.status(404).json({
          message: "The requested resource could not be found",
        });
      }

      return res.status(200).json({ cve });
    } catch (error) {
      throw error; // Let it propagate for error boundary/middleware
    }
  },
});

// For backwards compatibility
const prisma = new PrismaClient();
const { getAllCveList, getSingleCveById } = createControllers(prisma);

module.exports = { getAllCveList, getSingleCveById, createControllers };
