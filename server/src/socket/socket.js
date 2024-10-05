import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://socialloop-by-shovan.onrender.com",
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {}; //this object stores socket id of the user id

const getReceiverSocketId = (recieverId) => userSocketMap[recieverId];

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log(`User connected, userId: ${userId}, socketId : ${socket.id}`);
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) {
      console.log(
        `User disconnected, userId: ${userId}, socketId : ${socket.id}`
      );
      delete userSocketMap[userId];
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io, getReceiverSocketId };
