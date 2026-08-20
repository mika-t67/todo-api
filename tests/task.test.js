const request = require("supertest");
const app = require("../src/app");
const prisma = require("../src/config/prismaClient");

const testUser = {
  email: "jest-test@example.com",
  password: "password123",
};

let token;

beforeAll(async () => {
  // テスト用データをクリーンにする
  await prisma.task.deleteMany({ where: { user: { email: testUser.email } } });
  await prisma.user.deleteMany({ where: { email: testUser.email } });

  await request(app).post("/api/auth/register").send(testUser);
  const res = await request(app).post("/api/auth/login").send(testUser);
  token = res.body.token;
});

afterAll(async () => {
  await prisma.task.deleteMany({ where: { user: { email: testUser.email } } });
  await prisma.user.deleteMany({ where: { email: testUser.email } });
  await prisma.$disconnect();
});

describe("Task API", () => {
  let taskId;

  test("認証なしでタスク一覧を取得すると401が返る", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(401);
  });

  test("タスクを作成できる", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "テストタスク" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("テストタスク");
    expect(res.body.status).toBe("pending");

    taskId = res.body.id;
  });

  test("titleなしでタスク作成すると400が返る", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  test("タスク一覧を取得できる", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test("タスクを1件取得できる", async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(taskId);
  });

  test("タスクを更新できる", async () => {
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "done" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("done");
  });

  test("タスクを削除できる", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  test("削除済みタスクを取得すると404が返る", async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});