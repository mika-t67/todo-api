const prisma = require("../config/prismaClient");

async function getTasks(req, res) {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
}

async function getTaskById(req, res) {
  try {
    const task = await prisma.task.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!task) {
      return res.status(404).json({ error: "タスクが見つかりません" });
    }
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
}

async function createTask(req, res) {
  try {
    const { title, description, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: "titleは必須です" });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.userId,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
}

async function updateTask(req, res) {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "タスクが見つかりません" });
    }

    const { title, description, status, dueDate } = req.body;

    const task = await prisma.task.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
}

async function deleteTask(req, res) {
  try {
    const existing = await prisma.task.findFirst({
      where: { id: Number(req.params.id), userId: req.userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "タスクが見つかりません" });
    }

    await prisma.task.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
}
async function getJobLogs(req, res) {
  try {
    const logs = await prisma.taskJobLog.findMany({
      orderBy: { runAt: "desc" },
      take: 20,
    });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラーが発生しました" });
  }
}

module.exports = { getTasks, getTaskById, createTask, updateTask, deleteTask, getJobLogs };