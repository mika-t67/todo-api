const http = require("http");
const { Server } = require("socket.io");
const app = require("./app");
const { startScheduler } = require("./jobs/scheduler");
const { connectMongo } = require("./config/mongoClient");
const { setupChatSocket } = require("./socket/chatSocket");

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

setupChatSocket(io);

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  startScheduler();
  await connectMongo();
});