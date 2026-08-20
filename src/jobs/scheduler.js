const cron = require("node-cron");
const { runCheckDueTasksJob } = require("./checkDueTasks");

function startScheduler() {
  cron.schedule("* * * * *", () => {
    console.log("[cron] 期限チェックジョブ開始");
    runCheckDueTasksJob();
  });

  console.log("[cron] スケジューラー起動完了(毎分実行)");
}

module.exports = { startScheduler };