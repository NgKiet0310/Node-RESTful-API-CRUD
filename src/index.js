import chalk from "chalk";
import express from "express";
import mongoose from "mongoose";
import { hideBin } from "yargs/helpers";
import dotenv from 'dotenv';
import Product from "./models/product.js";
import yargs from "yargs";
import {validateProduct, validateUpdateProduct, validateId} from "./middlewares/validate.js";

// LOAD BIẾN MÔI TRƯỜNG
dotenv.config();


// Cấu hình yargs cho server
const argv = yargs(hideBin(process.argv)) // ✅ Khởi tạo đúng
  .option("port", {
    type: "number",
    default: process.env.PORT || 3000,
    describe: "Port để chạy server",
  })
  .option("mongo-url", {
    type: "string",
    default: process.env.MONGO_URL || "mongodb://localhost:27017/database-mongo",
    describe: "MongoDB connection URL",
  })
  .help()
  .parse();
const app = express(); // khởi tạo express app
app.use(express.json()); // // sử dụng middleware parse JSON

// Kết nối tới mongodb
// mongoose.connect('mongodb://localhost:27017/database-mongo')
// .then(() => {
//     console.log(chalk.blue('Kết nối thành công tới MongoDB'));
// }).catch(err => {
//     console.log('Lỗi kết nối:', err.message);
// });

// Kết nối tới MongoDB kiểu yagrs
mongoose
  .connect(argv["mongo-url"]) // Dùng argv["mongo-url"] vì key có dấu gạch ngang
  .then(() => {
    console.log(chalk.blue(`✅ Kết nối MongoDB thành công: ${argv["mongo-url"]}`));
  })
  .catch((err) => {
    console.log(chalk.red(`❌ Lỗi kết nối MongoDB: ${err.message}`));
  });

// API: Tạo sản phẩm
app.post("/api/products", validateProduct ,async( req, res)=>{
    try {
        const product = new Product(req.body);
        await product.save();
        console.log(chalk.green(`Product created: ${product.name}`));
        res.status(201).send(product);
    } catch (error) {
        console.log(chalk.red(`Lỗi: ${error.message}`));
        res.status(400).send({error: error.message});
    }
});

// API: Lấy tất cả sản phẩm
app.get("/api/products", async(req, res)=>{
try {
    const products = await Product.find();
    console.log(chalk.blue(`Fetched ${products.length} products`));
    res.send(products);
} catch (error) {
    console.log(chalk.red(`Lỗi: ${error.message}`));
    res.status(500).send({error: error.message});
}
});

// API: Thống kê sản phẩm cho category
app.get("/api/products/stats", async(req, res, next)=>{
    try {
        const stats = await Product.aggregate([
            { $group: {_id :"$category", count: { $sum: 1}}}, // Nhóm theo category
            { $sort: {count: -1 }} // sắp xếp giảm dần
        ]);
        console.log(chalk.blue(`Fetched stats for ${stats.length} categories`));
        res.send(stats);
    } catch (error) {
        next(error);
    }
});

// Thêm route lọc theo khoảng giá
app.get("/api/products/filter", async (req, res) => {
  try {
    const { minPrice, maxPrice } = req.query;

    // Tạo điều kiện lọc
    const filter = {};
    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

    const products = await Product.find(filter).select("name price category");

    res.json({ count: products.length, products });
  } catch (error) {
    res.status(500).json({ error: "Server Error: " + error.message });
  }
});


// API: Import sản phầm từ bên ngoài
app.get("/api/products/import", async(req, res)=>{
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos"); // Gọi API
        const todos = await response.json();
        const products = todos.slice(0,5).map((todo)=> ({
            name: todo.title,
            price: Math.floor(Math.random() * 1000) + 100, // giá ngẫu nhiên
            description: `Import todo ${todo.id}`,
            category: todo.completed ? "Completed" : "Pending",
        }));
        await Product.insertMany(products); // lưu nhiều document
        console.log(chalk.green(`Imported ${products.length} products`));
        res.send(products);
    } catch (error) {
        console.log(chalk.red(`Error: ${error.message}`));
        res.status(500).send({error: error.message})
    }
});


// API: Tìm kiếm sản phẩm theo tên với phân trang
app.get("/api/products/search", async(req, res)=>{
    try {
        const {name, page = 1, limit = 10} = req.query;
        if(!name){
            console.log(chalk.red(`Search Error: Name query is required`));
            return res.status(400).send({error: "Name query is required"});
        }
        const skip = (page - 1) * limit;
        const products = await Product.find({
            name: {$regex: name, $options: "i"},
        })
        .skip(skip) // bỏ qua doccument
        .limit(parseInt(limit)) // giới hạn số document
        .select("name price category") // chỉ lấy các trường cần thiết
        .lean(); // trả về plain object
        const total = await Product.countDocuments({
            name: {$regex: name, $options: "i"},
        });
        console.log(chalk.blue(`Found ${products.length} products matching: ${name}`));
        res.send(products, total, page, limit);
    } catch (error) {
        console.log(chalk.red(`Error: ${error.message}`));
        res.status(500).send({ error: error.message})
    }
})

// API: Lấy sản phẩm theo id
app.get("/api/products/:id", async(req, res)=>{
    try {
        const product = await Product.findById(req.params.id);
        if(!product){
            console.log(chalk.red(`Product not found: ${req.params,id}`));
            res.status(404).send({ error: "Product not found"});
        }
        console.log(chalk.blue(`Fetched product: ${product.name}`));
        res.send(product);
    } catch (error) {
        console.log(chalk.red(`Lỗi: ${error.message}`));
         res.status(500).send({error: error.message});
    }
});

//API: Cập nhật sản phẩm
app.put("/api/products/:id", validateUpdateProduct, validateId ,async(req, res)=>{
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // trả về document đã cập nhật
            runValidators: true // chạy validate của schema
        });
        if(!product){
            console.log(chalk.red(`Product not found: ${req.params.id}`));
            return res.status(400).send({ error: 'Product not found'});           
        }
        console.log(chalk.green(`Product update: ${product.name}`));
        res.send(product);
    } catch (error) {
        console.log(chalk.red(`Lỗi: ${error.message}`));
        res.status(500).send({error: error.message});
    }
});

// API: Xóa sản phẩm
app.delete("api/products/:id", validateId, async(req, res)=>{
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product){
            console.log(chalk.red(`Product not found: ${req.params.id}`));
            return res.status(400).send({error: 'Product not found'});
        }
    } catch (error) {
        console.log(chalk.red(`Lỗi: ${error.message}`));
        res.status(500).send({error: error.message});
    }
});

// Middleware xử lý lỗi chung
app.use(( err, req, res, next) =>{
    console.log(chalk.red(`Global error: ${err.message}`));
    res.status(500).send({ error: "Something wen wrong"});
});


const PORT = 3000; // CỔNG SERVER
app.listen(PORT, ()=>{
    console.log(chalk.yellow(`Server chạy tại http://localhost:${PORT}`));
});