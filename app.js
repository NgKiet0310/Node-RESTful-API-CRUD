import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import chalk from "chalk";
import rateLimit from "express-rate-limit";
import setupSwagger from "./config/swagger.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:3000" }));

app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: "Too many requests, please try again later" },
  })
);

setupSwagger(app);
app.use("/api", authRoutes);
app.use("/api", productRoutes);

console.log(chalk.blue("🌐 API products base URL: /api/products"));
console.log(chalk.blue("🌐 API auth URL: /api/auth/products"));

app.use((err, req, res, next) => {
  console.log(chalk.red("Global error:", err.message));
  res.status(500).send({ error: "Something went wrong" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;