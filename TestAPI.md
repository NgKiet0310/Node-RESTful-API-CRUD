
# 📦 Node.js REST API with MongoDB, Jest, Supertest (ESM version)

Dự án này là một RESTful API đơn giản sử dụng:
- Node.js + Express (ESM)
- MongoDB (Mongoose)
- Unit test và Integration test bằng Jest + Supertest
- Test các route: `/api/products`, `/api/auth`, ...

---

## ✅ 1. Cấu trúc thư mục

```
.
├── src/
│   ├── app.js                # Khởi tạo app (Express)
│   ├── index.js              # Điểm bắt đầu chính (start server)
│   ├── models/
│   │   ├── product.js
│   │   └── user.js
│   ├── routes/
│   │   ├── product.routes.js
│   │   └── auth.routes.js
│   ├── controllers/
│   ├── middlewares/
│   │   └── logger.js
│   └── __test__/
│       └── products.test.js  # Test file
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 📦 2. Cài đặt

```bash
npm install
```

---

## ⚙️ 3. Thiết lập `.env`

Tạo file `.env`:

```env
PORT=3000
MONGO_URL=mongodb://localhost:27017/database-mongo
JWT_SECRET=your_secret_key
```

Nếu test:

```env
MONGO_URL=mongodb://localhost:27017/database-mongo-test
```

---

## 🚀 4. Khởi chạy server

```bash
npm start
```

---

## 🧪 5. Chạy unit test với Jest + Supertest

> ⚠️ Nếu bạn dùng **ESM (type: "module")**, cần bật cờ `--experimental-vm-modules`:

```bash
npm test
```

Lệnh test thực tế trong `package.json`:

```json
"test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
```

---

## 🧠 6. Những thứ cần lưu ý

### a. `jest.config.js`

Tạo file `jest.config.js` để hỗ trợ ESM:

```js
export default {
  testEnvironment: "node",
  transform: {},
};
```

### b. `package.json`

Cần khai báo:

```json
"type": "module",
"scripts": {
  "start": "node src/index.js",
  "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js"
}
```

### c. `.gitignore`

```bash
node_modules/
.env
coverage/
```

---

## 📂 7. Cách viết test với Supertest

Ví dụ:

```js
import request from "supertest";
import app from "../app.js";

describe("GET /api/products", () => {
  it("should return product list", async () => {
    const res = await request(app).get("/api/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
```

---

## 🔄 8. Fix lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| `jest is not defined` | Đảm bảo test file sử dụng `.test.js` và bạn đã cài `jest` |
| `SyntaxError: Cannot use import` | Đảm bảo dùng `"type": "module"` trong `package.json` |
| `ReferenceError: app is not defined` | Xuất `default` từ `app.js`: `export default app;` |
| `Exceeded timeout` | Thêm timeout lớn hơn: `it("...", async () => {}, 10000);` |

---

## 🧪 9. Gợi ý mở rộng

- Viết test cho đăng nhập, middleware, lỗi 404,...
- Tạo coverage report:  
  ```bash
  npx jest --coverage
  ```

- Dùng GitHub Actions để CI test:
  ```yaml
  name: Run Jest Tests

  on: [push]

  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v3
        - uses: actions/setup-node@v3
          with:
            node-version: '20'
        - run: npm install
        - run: npm test
  ```

---

## ✅ Kết luận

Dự án này giúp bạn:
- Viết API sạch với Express
- Quản lý test hiệu quả với Jest + Supertest
- Tuân thủ chuẩn ESM (module)

> Nếu bạn gặp lỗi, có thể chạy lại bằng lệnh sau để debug kỹ hơn:
```bash
npm test -- --detectOpenHandles
```

---

## 🔗 Tài nguyên tham khảo

- [Jest Docs](https://jestjs.io/docs/getting-started)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [Express.js](https://expressjs.com/)
