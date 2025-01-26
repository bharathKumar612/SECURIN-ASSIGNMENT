const fs = require("fs");
const path = require("path");

const logsDir = path.join(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const logFile = path.join(logsDir, `cve-fetch-${timestamp}.log`);

const logger = {
  write: (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, logMessage);
  },
  log: (message) => {
    console.log(message);
    logger.write(`INFO: ${message}`);
  },
  error: (message, error) => {
    console.error(message, error);
    logger.write(`ERROR: ${message} ${error?.stack || error}`);
  },
};

module.exports = logger;
