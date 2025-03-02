import { WebSocketServer, WebSocket } from "ws";

interface RoomMap {
  [roomId: string]: Set<RoomSocket>;
}

// Extend WebSocket to store `roomId` and `username` per client
interface RoomSocket extends WebSocket {
  roomId?: string;
  username?: string;
}

const wss = new WebSocketServer({ port: 3000 });
const rooms: RoomMap = {}; // Store connected clients by room ID

wss.on("connection", (socket: RoomSocket) => {
  console.log("User connected");

  socket.on("message", (message: string) => {
    try {
      const data = JSON.parse(message.toString()); // Expecting JSON data

      if (data.type === "join" && typeof data.roomId === "string" && typeof data.username === "string") {
        // Store roomId and username at socket level
        socket.roomId = data.roomId;
        socket.username = data.username;

        if (!rooms[data.roomId]) {
          rooms[data.roomId] = new Set();
        }
        rooms[data.roomId].add(socket);

        console.log(`User ${socket.username} joined room: ${socket.roomId}`);

        // Notify all users in this room about the updated user count
        if (socket.roomId) {
          broadcastUserCount(socket.roomId);
        }
      } else if (data.type === "message") {
        if (!socket.roomId || !socket.username) {
          socket.send(
            JSON.stringify({
              error: "You must join a room with a username before sending messages.",
            })
          );
          return;
        }

        console.log(
          `Broadcasting message from ${socket.username} in room ${socket.roomId}:`,
          data.message
        );

        rooms[socket.roomId]?.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({ 
                type: "message",
                roomId: socket.roomId, 
                username: socket.username, 
                message: data.message,
                userCount: socket.roomId ? rooms[socket.roomId].size : 0 // Include total users in the room
              })
            );
          }
        });
      }
    } catch (error) {
      console.error("Invalid message format", error);
    }
  });

  socket.on("close", () => {
    if (socket.roomId && rooms[socket.roomId]) {
      rooms[socket.roomId].delete(socket);

      let usernameLeft = socket.username || "Unknown";

      if (rooms[socket.roomId].size === 0) {
        delete rooms[socket.roomId]; // Remove empty room
      }

      // Notify remaining users in the room about the updated user count and who left
      broadcastUserCount(socket.roomId, usernameLeft);
    }
  });
});

function broadcastUserCount(roomId: string, usernameLeft?: string) {
  if (!rooms[roomId]) return;

  const userCount = rooms[roomId].size;

  rooms[roomId].forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: "userCount",
          roomId,
          userCount,
          usernameLeft, // Include the username of the person who left
        })
      );
    }
  });
}

console.log("WebSocket server running on ws://localhost:3000");
