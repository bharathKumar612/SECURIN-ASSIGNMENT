import { createControllers } from "../controllers/cve";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";

const mockPrisma = mockDeep<PrismaClient>();

const { getAllCveList, getSingleCveById } = createControllers(mockPrisma);

vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

describe("CVE Controllers", () => {
  let req;
  let res;
  let statusSpy;
  let jsonSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    statusSpy = vi.fn().mockReturnThis();
    jsonSpy = vi.fn();

    req = {
      query: {},
      params: {},
    };
    res = {
      status: statusSpy,
      json: jsonSpy,
    };

    mockPrisma.cVE.findMany.mockResolvedValue([]);
    mockPrisma.cVE.count.mockResolvedValue(0);
    mockPrisma.cVE.findUnique.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getAllCveList", () => {
    it("should return paginated CVE list successfully", async () => {
      const mockCves = [
        {
          id: "CVE-2023-1234",
          published: new Date("2023-01-01"),
          lastModified: new Date("2023-01-02"),
          sourceIdentifier: "testing@gmail.com",
          vulnStatus: "MODIFIED",
        },
        {
          id: "CVE-2023-5678",
          published: new Date("2023-01-01"),
          lastModified: new Date("2023-01-02"),
          sourceIdentifier: "testing@gmail.com",
          vulnStatus: "MODIFIED",
        },
      ];

      const totalResults = 100;
      const startIndex = 0;
      const resultsPerPage = 10;

      req.query = { startIndex, resultsPerPage };
      mockPrisma.cVE.findMany.mockResolvedValueOnce(mockCves);
      mockPrisma.cVE.count.mockResolvedValueOnce(totalResults);

      await getAllCveList(req, res);

      expect(mockPrisma.cVE.findMany).toHaveBeenCalledWith({
        skip: startIndex,
        take: resultsPerPage,
      });
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        cves: mockCves,
        totalResults,
        startIndex,
        resultsPerPage,
      });
    });

    it("should handle empty results", async () => {
      const startIndex = 0;
      const resultsPerPage = 10;
      req.query = { startIndex, resultsPerPage };

      mockPrisma.cVE.findMany.mockResolvedValueOnce([]);
      mockPrisma.cVE.count.mockResolvedValueOnce(0);

      await getAllCveList(req, res);

      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({
        cves: [],
        totalResults: 0,
        startIndex,
        resultsPerPage,
      });
    });

    it("should use default pagination values when not provided", async () => {
      req.query = {};

      await getAllCveList(req, res);

      expect(mockPrisma.cVE.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      });
    });

    it("should handle negative startIndex", async () => {
      req.query = { startIndex: -1, resultsPerPage: 10 };

      await getAllCveList(req, res);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: "Invalid pagination parameters",
      });
    });

    it("should handle invalid resultsPerPage", async () => {
      req.query = { startIndex: 0, resultsPerPage: 0 };

      await getAllCveList(req, res);
    });

    it("should handle database errors gracefully", async () => {
      req.query = { startIndex: 0, resultsPerPage: 10 };
      const dbError = new Error("Database error");
      mockPrisma.cVE.findMany.mockRejectedValueOnce(dbError);

      await expect(getAllCveList(req, res)).rejects.toThrow("Database error");
    });
  });

  describe("getSingleCveById", () => {
    it("should return a single CVE by ID successfully", async () => {
      const mockCve = {
        id: "CVE-2023-1234",
        published: new Date("2023-01-01"),
        lastModified: new Date("2023-01-02"),
        descriptions: [],
        configurations: [],
        metrics: {
          cvssMetricV2: [],
          cvssMetricV30: [],
          cvssMetricV31: [],
        },
        vulnStatus: "MODIFIED",
        sourceIdentifier: "testing@gmail.com",
      };

      req.params = { cveId: "CVE-2023-1234" };
      mockPrisma.cVE.findUnique.mockResolvedValueOnce(mockCve);

      await getSingleCveById(req, res);

      expect(mockPrisma.cVE.findUnique).toHaveBeenCalledWith({
        where: { id: "CVE-2023-1234" },
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
      expect(statusSpy).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith({ cve: mockCve });
    });

    it("should handle missing cveId parameter", async () => {
      req.params = {};

      await getSingleCveById(req, res);

      expect(statusSpy).toHaveBeenCalledWith(400);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: "CVE ID is required",
      });
    });

    it("should return 404 when CVE is not found", async () => {
      req.params = { cveId: "CVE-2023-9999" };
      mockPrisma.cVE.findUnique.mockResolvedValueOnce(null);

      await getSingleCveById(req, res);

      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: "The requested resource could not be found",
      });
    });

    it("should handle database errors gracefully", async () => {
      req.params = { cveId: "CVE-2023-1234" };
      const dbError = new Error("Database error");
      mockPrisma.cVE.findUnique.mockRejectedValueOnce(dbError);

      await expect(getSingleCveById(req, res)).rejects.toThrow(
        "Database error"
      );
    });

    it("should handle malformed CVE ID format", async () => {
      req.params = { cveId: "invalid-cve-format" };

      const mockCve = null;
      mockPrisma.cVE.findUnique.mockResolvedValueOnce(mockCve);

      await getSingleCveById(req, res);

      expect(mockPrisma.cVE.findUnique).toHaveBeenCalledTimes(1);
      expect(statusSpy).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith({
        message: "The requested resource could not be found",
      });
    });
  });
});
