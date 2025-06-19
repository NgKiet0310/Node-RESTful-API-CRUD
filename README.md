#  Cơ bản: Joi là gì?
+ joi là thư viện xác thực dữ liệu, giúp kiểm tra dữ liệu đầu vào trước khi xử lý (ví dụ: name là string, price là số dương).
+ Dùng middleware để áp dụng Joi vào các route Express.
- Nâng cao: Xác thực phức tạp
+ Kiểm tra các trường optional, pattern (regex), hoặc điều kiện phức tạp (ví dụ: price phải là số nguyên).
+ Xử lý lỗi validate một cách thân thiện với người dùng.





# 📦 MongoDB Product API

## 🚀 Cài đặt

```bash
git clone <link-repo>
cd database-mongo
npm install
```

## ▶️ Khởi động server

```bash
npm start
```

Mặc định server chạy tại: [http://localhost:3000](http://localhost:3000)

## 📄 Swagger API

Truy cập tài liệu Swagger tại:

```bash
http://localhost:3000/api/docs
```

> Bạn có thể tạo sản phẩm, đăng ký user, test JWT ở đây.

## 🔐 JWT Middleware

- Một số route yêu cầu JWT.
- Sử dụng token từ `/api/login` để truy cập các route có bảo mật.

## 🛠️ CLI – Command Line Interface

> Sử dụng CLI để thao tác với sản phẩm và user qua terminal.

### 1. Tạo user

```bash
npm run cli:create-user -- --username=kiet --password=888 --mongoUrl=mongodb://localhost:27017/your-db
```

### 2. Tạo sản phẩm

```bash
npm run cli:create -- --mongoUrl=mongodb://localhost:27017/your-db
```

### 3. Liệt kê sản phẩm

```bash
npm run cli:list -- --mongoUrl=mongodb://localhost:27017/your-db
```

### 4. Tìm kiếm sản phẩm

```bash
npm run cli:search -- --keyword=giày --mongoUrl=mongodb://localhost:27017/your-db
```

### 5. Cập nhật sản phẩm

```bash
npm run cli:update -- --id=<product_id> --name="Tên mới" --mongoUrl=mongodb://localhost:27017/your-db
```

### 6. Xóa sản phẩm

```bash
npm run cli:delete -- --id=<product_id> --mongoUrl=mongodb://localhost:27017/your-db
```

### 7. Import sản phẩm mẫu

```bash
npm run cli:import -- --mongoUrl=mongodb://localhost:27017/your-db
```

### 8. Thống kê sản phẩm

```bash
npm run cli:stats -- --mongoUrl=mongodb://localhost:27017/your-db
```

## 🧪 Test Rate Limit

```bash
for ($i = 1; $i -le 120; $i++) {
  curl -s -o $null -w "%{http_code}`n" http://localhost:3000/api/products
}
```

> Sau khi quá giới hạn sẽ nhận được mã `429 Too Many Requests`.

## ✅ Yêu cầu hệ thống

- Node.js >= 18.x
- MongoDB local hoặc MongoDB Atlas
- Terminal hỗ trợ PowerShell (CLI)
