const jwt = require("jsonwebtoken");
const ChatMessage = require("../models/ChatMessage");

function setupChatSocket(io) {
  // Socket接続時にJWTトークンを検証(ユーザー認証)
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("認証トークンがありません"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("無効なトークンです"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`[socket] ユーザー${socket.userId}が接続しました(接続数: ${io.engine.clientsCount}`);

    socket.join("general");

    // 接続時に直近30件の履歴を送信
    try {
      const history = await ChatMessage.find({ room: "general" })
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
      socket.emit("chat:history", history.reverse());
    } catch (err) {
      console.error("[socket] 履歴取得エラー:", err.message);
    }

    // メッセージ受信・保存・全員に配信
    socket.on("chat:message", async ({ email, message }) => {
      if (!message || !message.trim()) return;

      try {
        const saved = await ChatMessage.create({
          userId: socket.userId,
          email,
          message: message.trim(),
          room: "general",
        });
        io.to("general").emit("chat:message", saved);
      } catch (err) {
        console.error("[socket] メッセージ保存エラー:", err.message);
        socket.emit("chat:error", { error: "メッセージの送信に失敗しました" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`[socket] ユーザー${socket.userId}が切断しました(接続数: ${io.engine.clientsCount})`);
    });
  });
}

module.exports = { setupChatSocket };