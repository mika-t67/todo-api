const mongoose = require("mongoose");

async function connectMongo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("[mongo] 接続成功");
  } catch (err) {
    console.error("[mongo] 接続エラー:", err.message);
  }
}

module.exports = { connectMongo };