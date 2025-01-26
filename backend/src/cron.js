const { CronJob } = require("cron");
const { runFetchAll } = require("./helpers/fetchAll");

const job = new CronJob("0 0 * * *", runFetchAll, null, false, "Asia/Kolkata");

module.exports = job;
