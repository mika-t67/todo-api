const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  room: { type: String, default: "general" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);