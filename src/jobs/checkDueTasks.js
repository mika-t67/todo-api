const prisma = require("../config/prismaClient");

async function checkDueTasksOnce() {
  const now = new Date();
  const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24時間以内

  const dueSoonTasks = await prisma.task.findMany({
    where: {
      status: "pending",
      dueDate: { not: null, lte: soon },
    },
  });

  return dueSoonTasks;
}

async function runCheckDueTasksJob(retries = 2) {
  try {
    const tasks = await checkDueTasksOnce();

    await prisma.taskJobLog.create({
      data: {
        status: "success",
        message: `${tasks.length}件の期限切れ間近タスクを検出`,
        checkedCount: tasks.length,
      },
    });

    console.log(`[cron] チェック完了: ${tasks.length}件`);
    return { success: true, count: tasks.length };
  } catch (err) {
    console.error("[cron] エラー発生:", err.message);

    if (retries > 0) {
      console.log(`[cron] リトライします(残り${retries}回)`);
      await new Promise((r) => setTimeout(r, 3000));
      return runCheckDueTasksJob(retries - 1);
    }

    // 失敗ログの記録自体も失敗する可能性があるので、ここも必ずtry/catchで囲む
    try {
      await prisma.taskJobLog.create({
        data: {
          status: "failed",
          message: err.message,
          checkedCount: 0,
        },
      });
    } catch (logErr) {
      console.error("[cron] 失敗ログの記録にも失敗しました:", logErr.message);
    }

    return { success: false, error: err.message };
  }
}

module.exports = { runCheckDueTasksJob };