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

const MAX_PLAYERS_PER_ROOM = 20;

let rooms = {
  room1: {
    players: {}
  }
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function broadcastToRoom(roomId, data) {
  Object.values(rooms[roomId].players).forEach(player => {
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(JSON.stringify(data));
    }
  });
}

wss.on("connection", (ws) => {
  const playerId = generateId();
  const roomId = "room1";

  if (Object.keys(rooms[roomId].players).length >= MAX_PLAYERS_PER_ROOM) {
    ws.send(JSON.stringify({ type: "roomFull" }));
    ws.close();
    return;
  }

  rooms[roomId].players[playerId] = {
    id: playerId,
    ws: ws,
    username: null,
    x: 0,
    y: 0,
    health: 100,
    kills: 0
  };

  ws.send(JSON.stringify({
    type: "welcome",
    playerId,
    roomId,
    health: 100,
    kills: 0
  }));

  broadcastToRoom(roomId, {
    type: "aliveCount",
    total: Object.keys(rooms[roomId].players).length
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Movement
      if (data.type === "move") {
        rooms[roomId].players[playerId].x = data.x;
        rooms[roomId].players[playerId].y = data.y;

        broadcastToRoom(roomId, {
          type: "playerMove",
          playerId,
          x: data.x,
          y: data.y
        });
      }

      // Shooting
      if (data.type === "shoot") {
        const target = rooms[roomId].players[data.targetId];

        if (target && target.health > 0) {
          target.health -= data.damage;

          if (target.health < 0) target.health = 0;

          broadcastToRoom(roomId, {
            type: "playerHit",
            targetId: data.targetId,
            health: target.health
          });

          // If player dies
          if (target.health === 0) {

            rooms[roomId].players[playerId].kills += 1;

            broadcastToRoom(roomId, {
              type: "playerDead",
              targetId: data.targetId,
              killerId: playerId
            });

            broadcastToRoom(roomId, {
              type: "killUpdate",
              playerId: playerId,
              kills: rooms[roomId].players[playerId].kills
            });

            broadcastToRoom(roomId, {
              type: "aliveCount",
              total: Object.values(rooms[roomId].players)
                .filter(p => p.health > 0).length
            });
          }
        }
      }

    } catch (err) {
      console.log("Invalid message");
    }
  });

  ws.on("close", () => {
    delete rooms[roomId].players[playerId];

    broadcastToRoom(roomId, {
      type: "aliveCount",
      total: Object.keys(rooms[roomId].players).length
    });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
