
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

// Room structure
let rooms = {
  room1: {
    players: {}
  }
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

// Broadcast only to a specific room
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

  // Room full check
  if (Object.keys(rooms[roomId].players).length >= MAX_PLAYERS_PER_ROOM) {
    ws.send(JSON.stringify({
      type: "roomFull"
    }));
    ws.close();
    return;
  }

  // Add player to room
  rooms[roomId].players[playerId] = {
    id: playerId,
    ws: ws,
    username: null
  };

  console.log(`Player ${playerId} joined ${roomId}`);

  ws.send(JSON.stringify({
    type: "welcome",
    playerId: playerId,
    roomId: roomId
  }));

  broadcastToRoom(roomId, {
    type: "playerCount",
    total: Object.keys(rooms[roomId].players).length
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === "join") {
        rooms[roomId].players[playerId].username = data.username;
        console.log("Username set:", data.username);
      }

    } catch (err) {
      console.log("Invalid message");
    }
  });

  ws.on("close", () => {
    delete rooms[roomId].players[playerId];
    console.log(`Player ${playerId} left ${roomId}`);

    broadcastToRoom(roomId, {
      type: "playerCount",
      total: Object.keys(rooms[roomId].players).length
    });
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
