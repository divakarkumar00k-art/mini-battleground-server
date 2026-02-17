const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(path.join(__dirname, "public")));

let players = {};

wss.on("connection", (ws) => {
  const playerId = Math.random().toString(36).substr(2, 9);

  players[playerId] = { x: 200, y: 200, health: 100 };

  ws.send(JSON.stringify({
    type: "welcome",
    playerId,
    health: 100
  }));

  broadcast({ type: "aliveCount", total: Object.keys(players).length });

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "move") {
      players[playerId].x = data.x;
      players[playerId].y = data.y;

      broadcast({
        type: "playerMove",
        playerId,
        x: data.x,
        y: data.y
      });
    }
  });

  ws.on("close", () => {
    delete players[playerId];
    broadcast({ type: "aliveCount", total: Object.keys(players).length });
  });
});

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
