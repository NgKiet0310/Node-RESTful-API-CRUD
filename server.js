// src/index.js
import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import dotenv from "dotenv";
import app from "./app.js";
import mongoose from "mongoose";

dotenv.config();

const argv = yargs(hideBin(process.argv))
  .option("port", {
    type: "number",
    default: process.env.PORT || 3000,
    describe: "Port chạy server",
  })
  .option("mongo-url", {
    type: "string",
    default: process.env.MONGO_URL || "mongodb://localhost:27017/database-mongo",
    describe: "MongoDB connection URL",
  })
  .help()
  .parse();

const PORT = argv.port;

// Kết nối Mongo
mongoose
  .connect(argv["mongo-url"])
  .then(() => {
    console.log(chalk.blue(`✅ Đã kết nối MongoDB: ${argv["mongo-url"]}`));
    app.listen(PORT, () => {
      console.log(chalk.yellow(`🚀 Server đang chạy tại http://localhost:${PORT}`));
    });
  })
  .catch((err) => {
    console.log(chalk.red(`❌ Lỗi kết nối MongoDB: ${err.message}`));
  });
