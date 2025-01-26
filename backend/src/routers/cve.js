const { Router } = require("express");
const { getAllCveList, getSingleCveById } = require("../controllers/cve");

const cveRouter = Router();

cveRouter.get("/list", getAllCveList);

cveRouter.get("/:cveId", getSingleCveById);

cveRouter.get("/health", (req, res) => {
  res.status(200).send("hello world!");
});

module.exports = { cveRouter };
