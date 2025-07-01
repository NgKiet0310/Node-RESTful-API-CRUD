import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import { Parser } from "json2csv";
import Product from "../models/product.js";

dotenv.config();

// Kết nối MongoDB
await mongoose.connect(process.env.MONGO_URL);

// Lấy toàn bộ sản phẩm
const products = await Product.find().lean();

// Kiểm tra định dạng truyền vào: csv hoặc json
const format = process.argv[2] || "json";
const file = format === "csv" ? "products.csv" : "products.json";

// Xuất file
if (format === "csv") {
  const parser = new Parser({ fields: ["name", "price", "category"] });
  const csv = parser.parse(products);
  fs.writeFileSync(file, csv);
} else {
  fs.writeFileSync(file, JSON.stringify(products, null, 2));
}

console.log(`✅ Exported to ${file}`);
process.exit();
