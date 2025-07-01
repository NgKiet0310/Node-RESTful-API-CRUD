// ✅ Import thư viện và model cần thiết
import http from "http";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import User from "../models/user.js";
import Product from "../models/product.js";
import logger from "../middleware/logger.js";
import { jest } from "@jest/globals";

// ✅ Cấu hình timeout cho toàn bộ test
jest.setTimeout(20000);

// ✅ Biến dùng chung cho toàn bộ test
let server, token, adminToken, productId;

beforeAll(async () => {
  // ✅ Tắt log để tránh rác khi test
  jest.spyOn(console, "log").mockImplementation(() => {});
  jest.spyOn(console, "error").mockImplementation(() => {});
  if (logger?.info) jest.spyOn(logger, "info").mockImplementation(() => {});
  if (logger?.error) jest.spyOn(logger, "error").mockImplementation(() => {});

  // ✅ Kết nối MongoDB
  await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/database-mongo-test");

  // ✅ Khởi tạo server test
  server = http.createServer(app);
  server.listen(0);

  // ✅ Dọn dữ liệu cũ
  await User.deleteMany();
  await Product.deleteMany();

  // ✅ Tạo user thường và admin
  await User.create([
    { username: "testuser", password: "testpass" },
    { username: "adminuser", password: "adminpass", role: "admin" }
  ]);

  // ✅ Đăng nhập user thường để lấy token
  const userRes = await request(app).post("/api/auth/login").send({ username: "testuser", password: "testpass" });
  token = userRes.body.accessToken;

  // ✅ Đăng nhập admin để lấy token
  const adminRes = await request(app).post("/api/auth/login").send({ username: "adminuser", password: "adminpass" });
  adminToken = adminRes.body.accessToken;
});

afterAll(async () => {
  // ✅ Dọn dữ liệu và đóng kết nối
  await User.deleteMany();
  await Product.deleteMany();
  await mongoose.connection.close();
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
  jest.restoreAllMocks();
});

// 🔐 Test các lỗi bảo mật và quyền
describe("🔐 Bảo mật & Xác thực", () => {
  it("❌ Không tạo sản phẩm nếu không có token", async () => {
    const res = await request(app).post("/api/products").send({ name: "No token", price: 200, category: "Test" });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error", "Token required");
  });

  it("❌ Không xóa sản phẩm nếu không phải admin", async () => {
    const product = await Product.create({ name: "Không được xóa", price: 100, category: "Test" });
    const res = await request(app).delete(`/api/products/${product._id}`).set("Authorization", `Bearer ${token}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty("error", "Forbidden");
  });
});

// ✅ Tạo và cập nhật sản phẩm
describe("✅ Tạo & cập nhật sản phẩm", () => {
  it("✅ Tạo sản phẩm hợp lệ", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Test Product", price: 100, category: "Test" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("name", "Test Product");

    productId = res.body._id;
    expect(mongoose.isValidObjectId(productId)).toBe(true);
  });

  it("❌ Tạo sản phẩm với dữ liệu sai", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "", price: -10 });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  it("✅ Cập nhật sản phẩm", async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .send({ name: "Updated Product", price: 888 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("price", 888);
  });
});

// 📦 Truy vấn sản phẩm
describe("📦 Lấy sản phẩm", () => {
  it("✅ Lấy tất cả sản phẩm", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("✅ Lấy sản phẩm theo ID", async () => {
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name");
  });

  it("✅ Tìm kiếm theo tên", async () => {
    const res = await request(app).get("/api/products/search?name=Test");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("products");
  });

  it("✅ Lọc theo giá", async () => {
    const res = await request(app).get("/api/products/filter?minPrice=50&maxPrice=200");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it("✅ Thống kê theo category", async () => {
    const res = await request(app).get("/api/products/stats");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("✅ Import sản phẩm từ API ngoài", async () => {
    const res = await request(app).get("/api/products/import");
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

// 🗑️ Xóa sản phẩm
describe("🗑️ Xóa sản phẩm", () => {
  it("✅ Xóa sản phẩm với admin", async () => {
    const product = await Product.create({ name: "Xóa được", price: 200, category: "Test" });
    const res = await request(app)
      .delete(`/api/products/${product._id}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});
