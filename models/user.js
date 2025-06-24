import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  refreshToken: { type: String },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

// Hash mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// So sánh mật khẩu người dùng nhập
userSchema.methods.comparePassword = async function (inputPassword) {
  if (typeof inputPassword !== "string" || typeof this.password !== "string") {
    throw new Error("data and hash must be strings");
  }
  return await bcrypt.compare(inputPassword, this.password);
};

export default mongoose.model("User", userSchema);
