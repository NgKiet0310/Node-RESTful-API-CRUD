// testAtlas.js
import { MongoClient } from "mongodb";

const url = "mongodb+srv://<user>:<pass>@cluster0.cyssml3.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(url);

client.connect()
  .then(() => {
    console.log("✅ Kết nối MongoDB Atlas thành công!");
    return client.close();
  })
  .catch((err) => {
    console.error("❌ Lỗi kết nối:", err);
  });
