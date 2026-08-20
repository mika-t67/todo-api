require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// セキュリティ関連ヘッダーを自動設定(XSS対策など)
app.use(helmet());

app.use(cors());
app.use(express.json());

// リクエスト全体のレート制限(過剰アクセス・ブルートフォース対策)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 15分あたり最大100リクエスト
  message: { error: "リクエストが多すぎます。しばらくしてから再度お試しください" },
});
app.use(limiter);

// 認証系エンドポイントはより厳しく制限(ブルートフォース対策の強化)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "ログイン試行回数が多すぎます。しばらくしてから再度お試しください" },
});
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Todo API is running" });
});

module.exports = app;