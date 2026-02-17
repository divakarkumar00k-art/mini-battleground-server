const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// ✅ Serve public folder
app.use(express.static(path.join(__dirname, "public")));

// Root check
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// Basic WebSocket
wss.on("connection", (ws) => {
  console.log("Player connected");
  ws.send(JSON.stringify({ type: "welcome" }));
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
