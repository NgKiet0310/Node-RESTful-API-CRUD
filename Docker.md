🐳 Docker Setup for Node.js + MongoDB
This guide helps you containerize your Node.js application with MongoDB using Docker and Docker Compose.

🧱 Project Structure
bash
Sao chép
Chỉnh sửa
your-project/
│
├── Dockerfile
├── docker-compose.yml
├── .env
├── package.json
├── src/
│   ├── app.js
│   └── ...
└── README.md
📦 Files Explained
Dockerfile
Dockerfile
Sao chép
Chỉnh sửa
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
docker-compose.yml
yaml
Sao chép
Chỉnh sửa
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - MONGO_URL=mongodb://mongo:27017/database-mongo
      - JWT_SECRET=your-very-secure-secret-key
    depends_on:
      - mongo
    volumes:
      - .:/app
  mongo:
    image: mongo:7
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
.env
env
Sao chép
Chỉnh sửa
PORT=3000
MONGO_URL=mongodb://mongo:27017/database-mongo
JWT_SECRET=your-very-secure-secret-key
🚀 How to Run
Cài Docker Desktop: https://www.docker.com/products/docker-desktop

Cập nhật WSL (Windows):

bash
Sao chép
Chỉnh sửa
wsl --update
Khởi động Docker Desktop

Build & chạy ứng dụng:

bash
Sao chép
Chỉnh sửa
docker compose up --build
Truy cập tại: http://localhost:3000

🧪 Useful Commands
Lệnh	Tác dụng
docker compose up	Chạy ứng dụng
docker compose down	Tắt và xóa container
docker compose up --build	Build lại rồi chạy
docker ps	Xem container đang chạy
docker logs <container>	Xem log ứng dụng

✅ Troubleshooting
Lỗi MongoDB không kết nối: đảm bảo bạn dùng mongo làm hostname trong MONGO_URL (do Docker Compose gán tên này).

Lỗi trùng port: kiểm tra port 3000 hoặc 27017 có đang bị ứng dụng khác dùng không.