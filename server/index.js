// server/index.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { nanoid } from "nanoid";
import 'dotenv/config'
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = new Map(); // roomId => { type, password, users: Map<username, socketId>, admin }

io.on("connection", (socket) => {
  socket.on("create-room", ({ type, username }, callback) => {
    const roomId = nanoid(6);
    const password = type === "private" ? nanoid(8) : null;

    rooms.set(roomId, {
      type,
      password,
      users: new Map([[username, socket.id]]),
      admin: username,
    });
    socket.join(roomId);

    callback({ roomId, password });
    io.to(roomId).emit("system-message", `${username} created the room`);
    io.to(roomId).emit(
      "room-users",
      Array.from(rooms.get(roomId).users.keys())
    );
  });

  socket.on("join-room", ({ roomId, username, password }, callback) => {
    const room = rooms.get(roomId);
    if (!room) return callback({ error: "Room not found" });
    if (room.users.has(username)) return callback({ error: "Username taken" });
    if (room.type === "private" && room.password !== password)
      return callback({ error: "Wrong password" });

    room.users.set(username, socket.id);
    socket.join(roomId);

    io.to(roomId).emit("system-message", `${username} joined the room`);
    io.to(roomId).emit("room-users", Array.from(room.users.keys()));
    callback({ success: true });
  });

  socket.on("chat-message", ({ roomId, username, message }) => {
    if (!message || message.length > 300) return;
    io.to(roomId).emit("chat-message", { username, message });
  });

  socket.on("typing", ({ roomId, username }) => {
    socket.to(roomId).emit("typing", username);
  });

  socket.on("kick-user", ({ roomId, username, admin }) => {
    const room = rooms.get(roomId);
    if (!room || room.admin !== admin) return;
    const kickSocketId = room.users.get(username);
    if (kickSocketId) io.to(kickSocketId).emit("kicked");
    room.users.delete(username);
    io.to(roomId).emit("system-message", `${username} was kicked`);
    io.to(roomId).emit("room-users", Array.from(room.users.keys()));
  });

  socket.on("disconnect", () => {
    rooms.forEach((room, roomId) => {
      for (const [username, id] of room.users) {
        if (id === socket.id) {
          room.users.delete(username);
          io.to(roomId).emit("system-message", `${username} left`);
          io.to(roomId).emit("room-users", Array.from(room.users.keys()));
        }
      }
    });
  });
});

// make ready for deployment
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist/")));

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}

server.listen(5000, () => console.log('Server running on 5000'));
