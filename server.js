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
    players: {},
    matchEnded: false,
    zone: {
      centerX: 500,
      centerY: 500,
      radius: 500
    }
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

function checkWinner(roomId) {
  const alivePlayers = Object.values(rooms[roomId].players)
    .filter(p => p.health > 0);

  if (alivePlayers.length === 1 && !rooms[roomId].matchEnded) {
    rooms[roomId].matchEnded = true;

    broadcastToRoom(roomId, {
      type: "matchEnd",
      winnerId: alivePlayers[0].id
    });
  }
}

// Zone system
setInterval(() => {
  const room = rooms["room1"];
  if (room.matchEnded) return;

  if (room.zone.radius > 50) {
    room.zone.radius -= 20;

    broadcastToRoom("room1", {
      type: "zoneUpdate",
      radius: room.zone.radius
    });
  }

  Object.values(room.players).forEach(player => {
    if (player.health <= 0) return;

    const dx = player.x - room.zone.centerX;
    const dy = player.y - room.zone.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > room.zone.radius) {
      player.health -= 5;
      if (player.health < 0) player.health = 0;

      broadcastToRoom("room1", {
        type: "zoneDamage",
        playerId: player.id,
        health: player.health
      });

      if (player.health === 0) {
        broadcastToRoom("room1", {
          type: "playerDead",
          targetId: player.id,
          killerId: "zone"
        });

        checkWinner("room1");
      }
    }
  });

}, 10000);

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
    kills: 0,
    zone: rooms[roomId].zone
  }));

  broadcastToRoom(roomId, {
    type: "aliveCount",
    total: Object.keys(rooms[roomId].players).length
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      const room = rooms[roomId];

      if (room.matchEnded) return;

      if (data.type === "move") {
        room.players[playerId].x = data.x;
        room.players[playerId].y = data.y;

        broadcastToRoom(roomId, {
          type: "playerMove",
          playerId,
          x: data.x,
          y: data.y
        });
      }

      if (data.type === "shoot") {
        const target = room.players[data.targetId];

        if (target && target.health > 0) {
          target.health -= data.damage;
          if (target.health < 0) target.health = 0;

          broadcastToRoom(roomId, {
            type: "playerHit",
            targetId: data.targetId,
            health: target.health
          });

          if (target.health === 0) {

            room.players[playerId].kills += 1;

            broadcastToRoom(roomId, {
              type: "playerDead",
              targetId: data.targetId,
              killerId: playerId
            });

            broadcastToRoom(roomId, {
              type: "killUpdate",
              playerId,
              kills: room.players[playerId].kills
            });

            broadcastToRoom(roomId, {
              type: "aliveCount",
              total: Object.values(room.players)
                .filter(p => p.health > 0).length
            });

            checkWinner(roomId);
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
