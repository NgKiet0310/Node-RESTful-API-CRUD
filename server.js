import dotenv from "dotenv";
import chalk from "chalk";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import app from "./app.js";
import ChatMessage from "./models/chatMessage.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookie from "cookie";
import signature from "cookie-signature";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/database-mongo";
const sessionSecret = process.env.SESSION_SECRET || "your-secret-key";

// ✅ Session middleware
const store = MongoStore.create({ mongoUrl: MONGO_URL });
const sessionMiddleware = session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 },
});
app.use(sessionMiddleware);

// ✅ Tạo HTTP server và socket
const server = http.createServer(app);
const io = new Server(server);

// ✅ Quản lý người dùng online
const onlineUsers = new Map();

// ✅ Gắn session vào socket
io.use((socket, next) => {
  const rawCookie = socket.handshake.headers.cookie || "";
  const cookies = cookie.parse(rawCookie);
  const raw = cookies["connect.sid"];
  if (!raw) return next();

  const sid = signature.unsign(raw.slice(2), sessionSecret);
  if (!sid) return next(new Error("Session ID không hợp lệ"));

  store.get(sid, (err, sessionData) => {
    if (err || !sessionData || !sessionData.user)
      return next(new Error("Không có session người dùng"));
    socket.username = sessionData.user.username;
    next();
  });
});

// ✅ Socket.io chat logic
io.on("connection", async (socket) => {
  const username = socket.username || "Ẩn danh";
  onlineUsers.set(socket.id, username);

  // Gửi danh sách người online
  io.emit("online users", Array.from(onlineUsers.values()));

  // Gửi lịch sử chat
  try {
    const history = await ChatMessage.find().sort({ createdAt: 1 }).limit(20);
    socket.emit("chat history", history);
  } catch (err) {
    console.error("❌ Lỗi tải lịch sử chat:", err.message);
  }

  // Tin nhắn mới
  socket.on("chat message", async (msg) => {
    const time = new Date().toLocaleTimeString();
    io.emit("chat message", { sender: username, message: msg, time });

    try {
      await ChatMessage.create({ sender: username, message: msg });
    } catch (err) {
      console.error("❌ Lỗi lưu tin nhắn:", err.message);
    }
  });

  // Ai đó đang gõ
  socket.on("typing", () => {
    socket.broadcast.emit("user typing", username);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("online users", Array.from(onlineUsers.values()));
    console.log("❌ Disconnected:", username);
  });
});

// ✅ MongoDB + Start
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log(chalk.green("✅ Kết nối MongoDB thành công!"));
    server.listen(PORT, () => {
      console.log(chalk.yellow(`🚀 Server đang chạy tại http://localhost:${PORT}`));
    });
  })
  .catch((err) => {
    console.error(chalk.red("❌ Kết nối MongoDB thất bại:"), err.message);
  });

