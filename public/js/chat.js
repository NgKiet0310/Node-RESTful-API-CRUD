const socket = io();
const chatMessages = document.getElementById("chat-messages");
const chatBox = document.getElementById("chat-box");
const toggleBtn = document.getElementById("chat-toggle");
const chatInput = document.getElementById("chat-input");
const onlineUsers = document.getElementById("online-users");

// Toggle hiển thị hộp chat
toggleBtn.addEventListener("click", () => {
  chatBox.style.display = chatBox.style.display === "none" ? "block" : "none";
});

// Hiển thị danh sách người dùng online
socket.on("online users", (users) => {
  onlineUsers.textContent = `🟢 Đang online: ${[...new Set(users)].join(", ")}`;
});

// Hiển thị lịch sử tin nhắn
socket.on("chat history", (history) => {
  history.forEach(({ sender, message, createdAt }) => {
    appendMessage(sender, message, new Date(createdAt).toLocaleTimeString());
  });
});

// Hiển thị tin nhắn mới
socket.on("chat message", ({ sender, message, time }) => {
  appendMessage(sender, message, time);
});

// ✅ Gửi tin nhắn khi nhấn nút Gửi
document.getElementById("sendBtn").addEventListener("click", sendChat);

// Gửi tin nhắn khi nhấn Enter
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendChat();
  }
});

// Gửi tin nhắn
function sendChat() {
  const msg = chatInput.value.trim();
  if (msg) {
    socket.emit("chat message", msg);
    chatInput.value = "";
  }
}

// Thêm tin nhắn vào box
function appendMessage(sender, message, time) {
  const p = document.createElement("p");
  p.innerHTML = `<strong>${sender}</strong> <em style="font-size:12px;color:gray;">${time}</em><br>${message}`;
  chatMessages.appendChild(p);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}
