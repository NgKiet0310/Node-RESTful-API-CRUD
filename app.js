import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import chalk from "chalk";
import rateLimit from "express-rate-limit";
import setupSwagger from "./config/swagger.js";
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";
import session from "express-session";
// Route imports
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authFormRoutes from "./routes/authFormRoutes.js";
import welcomeRoute from "./routes/welcomeRoute.js";
import sessionAuth from "./middleware/sessionAuth.js";

// Middleware bảo vệ
import authenticate from "./middleware/authenticate.js";

dotenv.config();

const app = express();

app.use(cookieParser());
// Middleware cơ bản
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000" }));

// session

app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60, // 1 giờ
    },
  })
);

// Giới hạn request API
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later" },
  })
);

// Cấu hình EJS
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.use(express.static("public"));

/* ========== ROUTES ========== */

// Trang landing (chào mừng)
app.use("/", welcomeRoute); // → / và /welcome

// Giao diện đăng nhập/đăng ký
app.use("/", authFormRoutes);

// Trang quản lý sản phẩm (chỉ cho người đăng nhập)
app.use("/admin", sessionAuth, productRoutes);

// API
app.use("/api", authRoutes);
app.use("/api", productRoutes); // nếu dùng API cho admin

// Swagger
setupSwagger(app);

/* ========== LOG & ERROR ========== */

console.log(chalk.blue("🌐 Public page:        /welcome"));
console.log(chalk.blue("🔐 Admin page:         /admin (requires login)"));
console.log(chalk.blue("🔑 Auth forms:         /auth/login, /auth/register"));
console.log(chalk.blue("📦 API base URL:       /api/..."));

app.use((err, req, res, next) => {
  console.log(chalk.red("❌ Global error:", err.message));
  res.status(500).send({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(chalk.green(`🚀 Server running on port ${PORT}`));
});

export default app;
