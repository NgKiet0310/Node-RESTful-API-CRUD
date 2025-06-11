// db.js (nếu "type": "module")
import { MongoClient } from "mongodb";

const url = "mongodb+srv://nguyenthuongkiet2005:<db_password>@cluster0.cyssml3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";


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
