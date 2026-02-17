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

let players = {};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  const playerId = generateId();
  players[playerId] = { id: playerId };

  console.log("Player connected:", playerId);

  ws.send(JSON.stringify({
    type: "welcome",
    playerId: playerId
  }));

  broadcast({
    type: "playerCount",
    total: Object.keys(players).length
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "join") {
        players[playerId].username = data.username;
        console.log("Player joined as:", data.username);
      }

    } catch (err) {
      console.log("Invalid message received");
    }
  });

  ws.on("close", () => {
    delete players[playerId];
    console.log("Player disconnected:", playerId);

    broadcast({
      type: "playerCount",
      total: Object.keys(players).length
    });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
