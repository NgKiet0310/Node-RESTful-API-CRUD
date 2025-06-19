import http from "http";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import logger from "../middlewares/logger.js";
import { jest } from "@jest/globals";

// Tăng timeout cho các test có MongoDB
jest.setTimeout(20000);

describe("Product API", () => {
  let token;
  let adminToken;
  let productId;
  let server;

  // Thiết lập ban đầu: tạo user, admin và đăng nhập để lấy token
  beforeAll(async () => {
    // Tắt console và logger để terminal gọn hơn
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    if (logger?.info) jest.spyOn(logger, "info").mockImplementation(() => {});
    if (logger?.error) jest.spyOn(logger, "error").mockImplementation(() => {});

    // Kết nối MongoDB
    console.log("Connecting to MongoDB...");
    try {
      await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/database-mongo-test", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000, // Giảm timeout socket để phát hiện lỗi nhanh
      });
      console.log("MongoDB connected:", mongoose.connection.readyState);
      if (mongoose.connection.readyState !== 1) {
        throw new Error("MongoDB connection failed");
      }
    } catch (error) {
      console.error("MongoDB connection error:", error.message);
      throw error;
    }

    // Khởi tạo server HTTP
    server = http.createServer(app);
    server.listen(0);
    server.on("error", (error) => {
      console.error("Server error:", error.message);
    });

    // Xóa dữ liệu cũ
    await User.deleteMany({});
    await Product.deleteMany({});

    // Tạo user thường và admin
    await User.create([
      { username: "testuser", password: "testpass" },
      { username: "adminuser", password: "adminpass", role: "admin" }
    ]);

    // Đăng nhập user
    const userRes = await request(app)
      .post("/api/auth/login")
      .send({ username: "testuser", password: "testpass" });
    token = userRes.body.accessToken;
    console.log("User token:", token);

    // Đăng nhập admin
    const adminRes = await request(app)
      .post("/api/auth/login")
      .send({ username: "adminuser", password: "adminpass" });
    adminToken = adminRes.body.accessToken;
    console.log("Admin token:", adminToken);
  });

  // Cleanup sau khi chạy test
  afterAll(async () => {
    console.log("Cleaning up...");
    await User.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("HTTP server closed");
    }
    jest.restoreAllMocks();
  });

  // ✅ Tạo sản phẩm hợp lệ
  it("should create a product with valid token", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Product",
        price: 100,
        category: "Test",
      });
    console.log("Created Product:", res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", "Test Product");
    productId = res.body._id;
    console.log("Assigned Product ID:", productId);
    if (!mongoose.isValidObjectId(productId)) {
      throw new Error("Invalid productId created");
    }
    const product = await Product.findById(productId);
    console.log("Product in DB:", product);
    if (!product) {
      throw new Error("Product not found in database after creation");
    }
  });

  // ❌ Tạo sản phẩm với dữ liệu sai
  it("should fail to create a product with invalid data", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "", price: -10 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  // ✅ Lấy tất cả sản phẩm
  it("should fetch all products", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ✅ Lấy sản phẩm theo ID
  it("should fetch product by ID", async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name");
  });

  // ✅ Tìm kiếm sản phẩm theo tên
  it("should search products by name", async () => {
    const res = await request(app).get("/api/products/search?name=Test");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("products");
  });

  // ✅ Lọc sản phẩm theo khoảng giá
  it("should filter products by price range", async () => {
    const res = await request(app).get("/api/products/filter?minPrice=50&maxPrice=200");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  // ✅ Thống kê sản phẩm theo category
  it("should return product stats", async () => {
    const res = await request(app).get("/api/products/stats");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ✅ Import sản phẩm từ API ngoài
  it("should import external products", async () => {
    const res = await request(app).get("/api/products/import");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // ✅ Cập nhật sản phẩm - cần token user
  it("should update a product", async () => {
    console.log("Product ID:", productId);
    if (!productId || !mongoose.isValidObjectId(productId)) {
      throw new Error("Invalid or missing productId");
    }
    const product = await Product.findById(productId).lean();
    console.log("Product exists:", product);
    if (!product) {
      throw new Error("Product not found in database");
    }
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({
        name: "Updated Product",
        price: 888
      });
    console.log("Response:", res.statusCode, res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("price", 888);
  }, 20000);

  // ✅ Xoá sản phẩm với token admin
  it("should delete a product with admin token", async () => {
    const product = await Product.create({
      name: "Delete by admin",
      price: 200,
      category: "Test",
    });

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });

  // ❌ Cố gắng xoá sản phẩm với token thường → bị chặn
  it("should fail to delete a product with non-admin token", async () => {
    const product = await Product.create({
      name: "Cannot delete",
      price: 100,
      category: "Test",
    });

    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
  });

  // ❌ Tạo sản phẩm không có token
  it("should fail to create a product without token", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({
        name: "No token",
        price: 200,
        category: "Test",
      });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Token required");
  });
});