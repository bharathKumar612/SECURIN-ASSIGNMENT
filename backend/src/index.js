const express = require("express");
const { config } = require("dotenv");
const cors = require("cors");
const { mainRouter } = require("./routers");
const job = require("./cron");

// dotenv configuration
config();

const port = process.env.PORT ?? 3000;

const app = express();

job.start();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", mainRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
