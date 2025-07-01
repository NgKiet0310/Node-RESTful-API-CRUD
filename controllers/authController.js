import logger from "../middleware/logger.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";



export const register = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).send({ error: "Username and Password required" });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send({ error: "Username exists" });

    // Không hash ở đây, truyền password thẳng vào model
    const user = new User({ username, password });

    await user.save();
    logger.info(`User registered: ${username}`);
    res.status(201).send({ message: "User registered" });
  } catch (error) {
    next(error);
  }
};
export const login = async (req, res, next) => {
  console.log("[LOGIN] Attempt");

  try {
    const { username, password } = req.body;
    console.log("[LOGIN] username:", username);
    console.log("[LOGIN] password (raw):", password);

    const user = await User.findOne({ username });
    if (!user) {
      console.log("[LOGIN] ❌ User not found");
      return res.status(401).send({ error: "Invalid credentials (user not found)" });
    }

    console.log("[LOGIN] Found user:", user.username);
    console.log("[LOGIN] Stored hashed password:", user.password);

    const isMatch = await user.comparePassword(password);
    console.log("[LOGIN] ✅ Password match result:", isMatch);

    if (!isMatch) {
      console.log("[LOGIN] ❌ Incorrect password");
      return res.status(401).send({ error: "Invalid credentials (wrong password)" });
    }

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7h",
    });

    user.refreshToken = refreshToken;
    await user.save();

    console.log("[LOGIN] 🎉 Login success");

    res.send({ accessToken, refreshToken });
  } catch (error) {
    console.error("[LOGIN] ❗Error:", error.message);
    next(error);
  }
};


export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).send({ error: "Refresh token required" });

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken)
      return res.status(401).send({ error: "Invalid refresh token" });

    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  // API logout – xoá token ở frontend là chủ yếu
  res.status(200).send({ message: "Logout success" });
};