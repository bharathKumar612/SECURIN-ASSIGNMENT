const express = require("express");
const cors = require("cors");
const { mainRouter } = require("./routers");
const job = require("./cron");

const app = express();

job.start();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", mainRouter);

module.exports = { app };

app.get("/health", (req, res) => {
  res.status(200).send("hello world");
});
