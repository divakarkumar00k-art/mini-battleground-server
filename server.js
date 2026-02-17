const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("Mini Battleground Server Running 🚀");
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Player connected");

  ws.send("Welcome to Mini Battleground Server");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
  });

  ws.on("close", () => {
    console.log("Player disconnected");
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
