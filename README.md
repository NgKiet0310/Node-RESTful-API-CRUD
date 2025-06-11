- Cơ bản: Joi là gì?
+ joi là thư viện xác thực dữ liệu, giúp kiểm tra dữ liệu đầu vào trước khi xử lý (ví dụ: name là string, price là số dương).
+ Dùng middleware để áp dụng Joi vào các route Express.
- Nâng cao: Xác thực phức tạp
+ Kiểm tra các trường optional, pattern (regex), hoặc điều kiện phức tạp (ví dụ: price phải là số nguyên).
+ Xử lý lỗi validate một cách thân thiện với người dùng.

/ Cấu hình yargs cho server (ESM-friendly)
const argv = yargs(hideBin(process.argv))
  .option("port", {
    type: "number",
    default: 3000,
    describe: "Port để chạy server",
  })
  .option("mongo-url", {
    type: "string",
    default: "mongodb://localhost:27017/database-mongo",
    describe: "MongoDB connection URL",
  })
  .help()
  .parse(); // ✅ Dùng .parse() thay cho .argv

// Kết nối tới MongoDB
mongoose
  .connect(argv["mongo-url"]) // Dùng argv["mongo-url"] vì key có dấu gạch ngang
  .then(() => {
    console.log(chalk.blue(`✅ Kết nối MongoDB thành công: ${argv["mongo-url"]}`));
  })
  .catch((err) => {
    console.log(chalk.red(`❌ Lỗi kết nối MongoDB: ${err.message}`));
  });

