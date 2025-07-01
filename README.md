# 📦 MongoDB Product API

API xây dựng với Express + MongoDB + JWT, hỗ trợ xác thực, quản lý sản phẩm, test bằng Jest, tối ưu hiệu suất với indexing MongoDB.

---

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

Server mặc định chạy tại: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Kiểm thử với Jest

```bash
npm test
```

### ✅ Các test bao gồm:

* Tạo, cập nhật, xoá sản phẩm
* Tìm kiếm, lọc, thống kê
* Phân quyền (admin/user)
* Test lỗi xác thực và bảo mật

### 📌 Performance Test (tùy chọn)

```bash
autocannon http://localhost:3000/api/products
```

* Dùng để đo hiệu suất API
* So sánh trước/sau khi tối ưu hóa (indexing, caching...)

---

## 🔐 JWT Middleware

* Một số route yêu cầu xác thực bằng token JWT
* Lấy token từ `/api/login` hoặc `/api/auth/login`
* Thêm vào header:

  ```http
  Authorization: Bearer <token>
  ```

---

## 🧰 Xác thực dữ liệu với Joi

### ✅ Cơ bản:

* Kiểm tra dữ liệu đầu vào: `name` là string, `price` là số dương...
* Dùng middleware để áp dụng Joi trong route Express

### 🔒 Nâng cao:

* Kiểm tra field optional, regex, điều kiện logic (VD: `price` phải là số nguyên)
* Trả lỗi thân thiện với người dùng nếu validate sai

---

## 🔍 Tối ưu hiệu suất MongoDB

### ✅ Sử dụng index trong schema:

```js
productSchema.index({ name: "text" });        // search theo tên
productSchema.index({ price: 1 });             // filter theo giá
productSchema.index({ category: 1 });          // thống kê theo category
productSchema.index({ createdAt: -1 });        // sort theo ngày tạo
```

### 🔬 Kiểm tra hiệu suất truy vấn:

```js
Product.find({ price: { $gte: 100 } }).explain("executionStats")
```

* Nếu thấy `IXSCAN` → ✅ đang dùng index
* Nếu thấy `COLLSCAN` → ❌ cần bổ sung index

---

## 🛠️ CLI – Quản lý qua dòng lệnh

> Sử dụng CLI để tạo, tìm kiếm, chỉnh sửa sản phẩm/user

### 🔧 Các lệnh:

```bash
npm run cli:create-user -- --username=kiet --password=888 --mongoUrl=mongodb://localhost:27017/your-db
npm run cli:create       -- --mongoUrl=mongodb://localhost:27017/your-db
npm run cli:list         -- --mongoUrl=mongodb://localhost:27017/your-db
npm run cli:search       -- --keyword=giày --mongoUrl=mongodb://localhost:27017/your-db
npm run cli:update       -- --id=<product_id> --name="Tên mới" --mongoUrl=mongodb://localhost:27017/your-db
npm run cli:delete       -- --id=<product_id> --mongoUrl=mongodb://localhost:27017/your-db
npm run cli:import       -- --mongoUrl=mongodb://localhost:27017/your-db
npm run cli:stats        -- --mongoUrl=mongodb://localhost:27017/your-db
```

---

## 📄 Swagger API Docs

Truy cập tại:

```
http://localhost:3000/api/docs
```

* Dùng để test các route trực tiếp
* Hỗ trợ nhập token, tạo user, gọi API

---

## 🚫 Test Giới hạn truy cập (Rate Limit)

```bash
for ($i = 1; $i -le 120; $i++) {
  curl -s -o $null -w "%{http_code}`n" http://localhost:3000/api/products
}
```

> Sau \~100 request bạn sẽ thấy `429 Too Many Requests`

---

## ✅ Yêu cầu hệ thống

* Node.js >= 18.x
* MongoDB local hoặc MongoDB Atlas
* PowerShell / Terminal hỗ trợ CLI

---

## ✍️ Tác giả

* Người phát triển: **Nguyễn Kiệt** 🔥
* Cập nhật tính năng: **Jest Test, MongoDB Indexing, Autocannon, Joi Validate**
