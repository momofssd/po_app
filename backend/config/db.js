import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URI;
let db;

export async function connectDB() {
  if (!uri) {
    console.error("❌ Error: MONGODB_URI is not defined in .env file");
    return;
  }

  const client = new MongoClient(uri);

  try {
    console.log("⏳ Attempting to connect to MongoDB...");
    await client.connect();
    console.log("✅ Connected successfully to MongoDB");
    db = client.db("po_app");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.error("   -> Please check your IP Whitelist in MongoDB Atlas.");
    console.error("   -> Ensure your credentials in .env are correct.");
  }
}

export function getCollection(name) {
  if (!db) {
    return null;
  }
  return db.collection(name);
}
