// src/cli.js
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import mongoose from "mongoose";
import chalk from "chalk";
import dotenv from 'dotenv';
import Product from "../models/product.js";
import logger from "../middleware/logger.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Load biến môi trường
dotenv.config();

 // Kết nối MongoDB cho CLI
     async function connectDB(mongoUrl = process.env.MONGO_URL || "mongodb://localhost:27017/database-mongo") {
       try {
         await mongoose.connect(mongoUrl);
         console.log(chalk.blue(`CLI: Kết nối thành công tới MongoDB: ${mongoUrl}`));
       } catch (error) {
         console.log(chalk.red(`CLI Error: ${error.message}`));
         process.exit(1);
       }
     }

// Khởi tạo CLI
yargs(hideBin(process.argv))
  .command(
    "create-product",
    "Tạo sản phẩm mới",
    (yargs) => {
      return yargs
        .option("name", {
          type: "string",
          demandOption: true,
          describe: "Tên sản phẩm",
        })
        .option("price", {
          type: "number",
          demandOption: true,
          describe: "Giá sản phẩm",
        })
        .option("description", {
          type: "string",
          describe: "Mô tả sản phẩm",
        })
        .option("category", {
          type: "string",
          describe: "Danh mục sản phẩm (tùy chọn)",
        });
    },
    async (argv) => {
      await connectDB();
      try {
        const product = new Product({
          name: argv.name,
          price: argv.price,
          description: argv.description,
          category: argv.category,
        });
        await product.save();
        console.log(chalk.green(`CLI: Product created: ${product.name}`));
      } catch (error) {
        console.log(chalk.red(`CLI Error: ${error.message}`));
      } finally {
        mongoose.disconnect();
      }
    }
  )

  .command(
    "list-products",
    "Liệt kê tất cả sản phẩm",
    () => {},
    async () => {
      await connectDB();
      try {
        const products = await Product.find();
        console.log(chalk.blue(`CLI: Fetched ${products.length} products`));
        console.table(
          products.map((product, index) => ({
            STT: index + 1,
            Ảnh: product.image,
            Tên: product.name,
            Giá: product.price,
            Danh_mục: product.category || "Không có",
          }))
        );
      } catch (error) {
        console.log(chalk.red(`CLI Error: ${error.message}`));
      } finally {
        mongoose.disconnect();
      }
    }
  )

  .command(
    "update-product",
    "Cập nhật sản phẩm",
    (yargs) => {
      return yargs
        .option("id", {
          type: "string",
          demandOption: true,
          describe: "ID của sản phẩm cần cập nhật",
        })
        .option("name", {
          type: "string",
          describe: "Tên sản phẩm mới",
        })
        .option("price", {
          type: "number",
          describe: "Giá sản phẩm mới",
        })
        .option("description", {
          type: "string",
          describe: "Mô tả sản phẩm mới",
        })
        .option("category", {
          type: "string",
          describe: "Danh mục sản phẩm mới",
        });
    },
    async (argv) => {
      await connectDB();
      try {
        const updated = await Product.findByIdAndUpdate(
          argv.id,
          {
            ...(argv.name && { name: argv.name }),
            ...(argv.price && { price: argv.price }),
            ...(argv.description && { description: argv.description }),
            ...(argv.category && { category: argv.category }),
          },
          { new: true }
        );

        if (!updated) {
          console.log(chalk.red("Không tìm thấy sản phẩm để cập nhật"));
        } else {
          console.log(chalk.green(`Cập nhật thành công: ${updated.name}`));
        }
      } catch (error) {
        console.log(chalk.red(`CLI Error: ${error.message}`));
      } finally {
        mongoose.disconnect();
      }
    }
  )

  .command(
    "delete-product",
    "Xóa sản phẩm",
    (yargs) => {
      return yargs.option("id", {
        type: "string",
        demandOption: true,
        describe: "ID của sản phẩm cần xóa",
      });
    },
    async (argv) => {
      await connectDB();
      try {
        const deleted = await Product.findByIdAndDelete(argv.id);
        if (!deleted) {
          console.log(chalk.red("Không tìm thấy sản phẩm để xóa"));
        } else {
          console.log(chalk.green(`Đã xóa sản phẩm: ${deleted.name}`));
        }
      } catch (error) {
        console.log(chalk.red(`CLI Error: ${error.message}`));
      } finally {
        mongoose.disconnect();
      }
    }
  )

  .command(
    "search-products",
    "Tìm sản phẩm theo tên (có phân trang)",
    (yargs) =>
      yargs
        .option("name", {
          type: "string",
          demandOption: true,
          describe: "Tên hoặc từ khóa cần tìm trong tên sản phẩm",
        })
        .option("page", {
          type: "number",
          default: 1,
          describe: "Trang số muốn xem",
        })
        .option("limit", {
          type: "number",
          default: 5,
          describe: "Số sản phẩm mỗi trang",
        }),
    async (argv) => {
      await connectDB();
      try {
        const keyword = argv.name.trim();
        const page = argv.page || 1;
        const limit = argv.limit || 5;
        const skip = (page - 1) * limit;

        const regex = new RegExp(keyword, "i");

        const [products, total] = await Promise.all([
          Product.find({ name: { $regex: regex } })
            .skip(skip)
            .limit(limit)
            .select("name price category")
            .lean(),
          Product.countDocuments({ name: { $regex: regex } }),
        ]);

        if (products.length === 0) {
          console.log(chalk.red("❌ Không tìm thấy sản phẩm nào phù hợp."));
        } else {
          console.log(chalk.green(`✅ Trang ${page} - Hiển thị ${products.length}/${total} kết quả:`));
          console.table(
            products.map((p, i) => ({
              STT: skip + i + 1,
              Tên: p.name,
              Giá: p.price,
              Danh_mục: p.category || "Không có",
            }))
          );
          const totalPages = Math.ceil(total / limit);
          console.log(chalk.yellow(`📄 Trang ${page}/${totalPages}`));
        }
      } catch (error) {
        console.log(chalk.red(`CLI Error: ${error.message}`));
      } finally {
        mongoose.disconnect();
      }
    }
  )

  .command(
    "import-products",
    "Import sản phẩm từ API bên ngoài",
    (yargs) => {
      return yargs.option("limit", {
        type: "number",
        default: 5,
        describe: "Số lượng sản phẩm cần import",
      });
    },
    async (argv) => {
      await connectDB();

      try {
        const response = await fetch("https://jsonplaceholder.typicode.com/todos");
        const todos = await response.json();

        const products = todos.slice(0, argv.limit).map((todo) => ({
          name: todo.title,
          price: Math.floor(Math.random() * 1000) + 100,
          description: `Imported todo ${todo.id}`,
          category: todo.completed ? "Completed" : "Pending",
        }));

        await Product.insertMany(products);
        console.log(chalk.green(`CLI: Đã import ${products.length} sản phẩm`));
        console.table(
          products.map((product, index) => ({
            STT: index + 1,
            Tên: product.name,
            Giá: product.price,
            Danh_mục: product.category,
          }))
        );
      } catch (error) {
        console.log(chalk.red(`CLI Error: ${error.message}`));
      } finally {
        mongoose.disconnect();
      }
    }
  )

  .command(
  "stats-products",
  "Thống kê sản phẩm theo danh mục",
  () => {},
  async (argv) => {
    await connectDB();
    try {
      const stats = await Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);
      console.log(chalk.blue(`CLI: Fetched stats for ${stats.length} categories`));
      stats.forEach((stat) => {
        console.log(chalk.cyan(`- ${stat._id || "No category"}: ${stat.count}`));
      });
    } catch (error) {
      console.log(chalk.red(`CLI Error: ${error.message}`));
    } finally {
      mongoose.disconnect();
    }
  }
)

.command(
  "filter-products",
  "Lọc sản phẩm theo khoảng giá",
  (yargs) =>
    yargs
      .option("min", {
        type: "number",
        describe: "Giá thấp nhất",
      })
      .option("max", {
        type: "number",
        describe: "Giá cao nhất",
      }),
  async (argv) => {
    await connectDB();
    try {
      const filter = {};
      if (argv.min !== undefined) filter.price = { ...filter.price, $gte: argv.min };
      if (argv.max !== undefined) filter.price = { ...filter.price, $lte: argv.max };

      const products = await Product.find(filter).select("name price category");

      if (products.length === 0) {
        console.log(chalk.red("❌ Không có sản phẩm nào trong khoảng giá này."));
      } else {
        console.log(chalk.green(`✅ Tìm thấy ${products.length} sản phẩm:`));
        console.table(
          products.map((p, i) => ({
            STT: i + 1,
            Tên: p.name,
            Giá: p.price,
            Danh_mục: p.category || "Không có",
          }))
        );
      }
    } catch (error) {
      console.log(chalk.red(`CLI Error: ${error.message}`));
    } finally {
      mongoose.disconnect();
    }
  }
)

   .command({
    command: "create-user",
    describe: "Tạo user mới",
    builder: {
      username: { type: "string", demandOption: true, describe: "Tên user" },
      password: { type: "string", demandOption: true, describe: "Mật khẩu" },
      mongoUrl: { type: "string", demandOption: true, describe: "MongoDB URL" },
    },
    handler: async (argv) => {
      await connectDB(argv.mongoUrl);
      const { username, password } = argv;
      try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          logger.error(`CLI: Username exists: ${username}`);
          console.log(chalk.red(`CLI: Username exists: ${username}`));
          await mongoose.disconnect();
          return;
        }

        const user = new User({ username, password });
        await user.save();

        logger.info(`CLI: User created: ${username}`);
        console.log(chalk.green(`CLI: User created: ${username}`));
        await mongoose.disconnect();
      } catch (error) {
        logger.error(`CLI Error: ${error.message}`);
        console.log(chalk.red(`CLI Error: ${error.message}`));
        await mongoose.disconnect();
      }
    },
  })

    .command({
    command: "login",
    describe: "Đăng nhập và lấy token",
    builder: {
      username: { type: "string", demandOption: true, describe: "Tên user" },
      password: { type: "string", demandOption: true, describe: "Mật khẩu" },
      mongoUrl: { type: "string", demandOption: true, describe: "MongoDB URL" },
    },
    handler: async (argv) => {
      const { username, password, mongoUrl } = argv;
      await connectDB(mongoUrl);
      try {
        const user = await User.findOne({ username });
        if (!user) {
          logger.error(`CLI Login Error: User not found: ${username}`);
          console.log("❌ User không tồn tại");
          return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          logger.error("CLI Login Error: Sai mật khẩu");
          console.log("❌ Sai mật khẩu");
          return;
        }

        const token = jwt.sign(
          { id: user._id, username: user.username, role: user.role },
          "your_jwt_secret", // Đổi thành biến .env trong thực tế
          { expiresIn: "1h" }
        );

        logger.info(`CLI Login Success: ${username}`);
        console.log("✅ Đăng nhập thành công. Token:");
        console.log(token);
      } catch (error) {
        logger.error(`CLI Login Error: ${error.message}`);
        console.log("❌ Lỗi:", error.message);
      } finally {
        mongoose.disconnect();
      }
    },
  })
  .command(
  "clear-cache",
  "Xóa cache Redis",
  (yargs) =>
    yargs
      .option("key", {
        type: "string",
        describe: "Cache key cụ thể cần xoá",
      })
      .option("prefix", {
        type: "string",
        describe: "Xoá tất cả cache bắt đầu với prefix này",
      }),
  async (argv) => {
    try {
      if (!argv.key && !argv.prefix) {
        console.log("❌ Vui lòng cung cấp --key hoặc --prefix");
        return;
      }

      const { deleteCache, deleteCacheByPrefix } = await import("./cache.js");

      if (argv.key) {
        await deleteCache(argv.key);
        console.log(chalk.green(`✅ Đã xoá cache theo key: ${argv.key}`));
      }

      if (argv.prefix) {
        await deleteCacheByPrefix(argv.prefix);
        console.log(chalk.green(`✅ Đã xoá cache theo prefix: ${argv.prefix}`));
      }
    } catch (error) {
      console.log(chalk.red(`CLI Error: ${error.message}`));
    }
  }
)


  .help()
  .version("1.0.0")
  .parse();
