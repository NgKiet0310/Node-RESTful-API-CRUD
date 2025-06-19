// // db.js (nếu "type": "module")
import { MongoClient } from "mongodb";

const url = "mongodb+srv://nguyenthuongkiet2005:kiet123@cluster0.cyssml3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


const client = new MongoClient(url);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas!");
  } catch (err) {
    console.error("❌ Connection error:", err);
  } finally {
    await client.close();
  }
}

run();


// db.js
// import { MongoClient } from "mongodb";

// const url = process.env.MONGO_URL || "mongodb://localhost:27017"; // dùng biến môi trường
// const dbName = "database-mongo";

// const client = new MongoClient(url);

// async function run() {
//   try {
//     await client.connect();
//     console.log("✅ Connected to MongoDB!");
//     const db = client.db(dbName);
//     // Bạn có thể return db ở đây nếu cần export
//   } catch (err) {
//     console.error("❌ Connection error:", err);
//   }
// }

// run();
