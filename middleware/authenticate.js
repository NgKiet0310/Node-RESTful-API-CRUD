// middleware/authenticate.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export default async (req, res, next) => {
  const token =
    req.cookies?.token ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) return res.status(401).send({ error: "Token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user) return res.status(401).send({ error: "User not found" });

    next();
  } catch (error) {
    res.status(400).send({ error: "Invalid Token" });
  }
};
