const { Router } = require("express");
const { cveRouter } = require("./cve");

const mainRouter = Router();

mainRouter.use("/cve", cveRouter);

module.exports = { mainRouter };
