// src/app.js
import chalk from "chalk";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import Product from "./models/product.js";
import User from "./models/user.js";
import logger from "./middlewares/logger.js";
import { validateProduct, validateUpdateProduct, validateId } from "./middlewares/validate.js";
import setupSwagger from "./swagger.js";
import authorize from "./middlewares/authorize.js";
import { getCache, setCache, deleteCache, deleteCacheByPrefix } from "./cache.js";
import helmet from "helmet";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000" }));
setupSwagger(app);

// Giới hạn số lượng request trong 15 phút: tối đa 100 request
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// Middleware xác thực người dùng qua JWT
const authenticate = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).send({ error: "Token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = await User.findById(decoded.id);
    if (!req.user) return res.status(401).send({ error: "User not found" });
    next();
  } catch (error) {
    res.status(400).send({ error: "Invalid Token" });
  }
};

// ================= AUTH ROUTES =================

// Đăng ký tài khoản
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send({ error: "Username and Password required" });
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).send({ error: "Username exists" });
    const user = new User({ username, password });
    await user.save();
    logger.info(`User registered: ${username}`);
    res.status(201).send({ message: "User registered" });
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    next(error);
  }
});

// Đăng nhập
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).send({ error: "Invalid credentials" });
    }
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7h" });
    user.refreshToken = refreshToken;
    await user.save();
    res.send({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

// Làm mới token
app.post("/api/auth/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).send({ error: "Refresh token required" });
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) return res.status(401).send({ error: "Invalid refresh token" });
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.send({ accessToken });
  } catch (error) {
    next(error);
  }
});

// ================= PRODUCT ROUTES =================

// Tạo sản phẩm mới (có xoá cache sau khi thêm)
app.post("/api/products", authenticate, validateProduct, async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();
    await deleteCache("products_all");
    await deleteCacheByPrefix("search:");
    res.status(201).send(product);
  } catch (error) {
    next(error);
  }
});

// Lấy danh sách tất cả sản phẩm (có cache Redis)
app.get("/api/products", async (req, res, next) => {
  try {
    const cacheKey = "products_all";
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Fetched from cache");
      return res.send(cached);
    }

    const products = await Product.find().select("name price category").lean();
    await setCache(cacheKey, products);
    res.send(products);
  } catch (error) {
    next(error);
  }
});

// Tìm kiếm sản phẩm theo tên (có cache theo từ khoá tìm kiếm)
app.get("/api/products/search", async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    if (!name) return res.status(400).send({ error: "Name query is required" });

    const cacheKey = `search:${name}:${page}:${limit}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      console.log("✅ Search result from cache");
      return res.send(cached);
    }

    const skip = (page - 1) * limit;
    const products = await Product.find({ name: { $regex: name, $options: "i" } })
      .skip(skip)
      .limit(parseInt(limit))
      .select("name price category")
      .lean();
    const total = await Product.countDocuments({ name: { $regex: name, $options: "i" } });

    const result = { products, total, page, limit };
    await setCache(cacheKey, result);
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Cập nhật sản phẩm (có xoá cache sau khi cập nhật)
app.put("/api/products/:id", validateUpdateProduct, validateId, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).maxTimeMS(5000);

    if (!product) return res.status(400).send({ error: "Product not found" });

    await deleteCache("products_all");
    await deleteCacheByPrefix("search:");

    res.send(product);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Xoá sản phẩm (có xoá cache sau khi xoá)
app.delete("/api/products/:id", authenticate, authorize("admin"), validateId, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    await deleteCache("products_all");
    await deleteCacheByPrefix("search:");

    logger.info(`Product deleted: ${product.name}`);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
  console.log(chalk.red(`Global error: ${err.message}`));
  res.status(500).send({ error: "Something went wrong" });
});

export default app;
