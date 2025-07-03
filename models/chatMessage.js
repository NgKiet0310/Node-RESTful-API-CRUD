import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },  // ví dụ: "Admin" hoặc tên user
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("ChatMessage", chatMessageSchema);
