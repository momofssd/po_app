import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";

dotenv.config();

const app = express();
const port = 3001;

// Enable CORS for frontend access
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const uri = process.env.MONGODB_URI;

// Global variables to hold DB connection
let usersCollection;
let customerMasterCollection;

// Function to connect to MongoDB asynchronously
async function connectToMongo() {
  if (!uri) {
    console.error("❌ Error: MONGODB_URI is not defined in .env file");
    return;
  }

  const client = new MongoClient(uri);

  try {
    console.log("⏳ Attempting to connect to MongoDB...");
    await client.connect();
    console.log("✅ Connected successfully to MongoDB");

    const db = client.db("po_app");
    usersCollection = db.collection("users");
    customerMasterCollection = db.collection("customer_master");
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    console.error("   -> Please check your IP Whitelist in MongoDB Atlas.");
    console.error("   -> Ensure your credentials in .env are correct.");
  }
}

// START SERVER IMMEDIATELY
// We start listening before DB connects so the frontend doesn't get "Network Error"
app.listen(port, () => {
  console.log(`🚀 Backend server is running at http://localhost:${port}`);
  console.log(
    `   (Ensure you have installed dependencies: npm install express mongodb cors dotenv)`,
  );

  // Initiate DB connection
  connectToMongo();
});

app.post("/api/login", async (req, res) => {
  // If DB connection hasn't finished or failed
  if (!usersCollection) {
    return res.status(503).json({
      message:
        "Database not connected yet. Please check the backend terminal for errors.",
    });
  }

  const { username, password } = req.body;

  try {
    const user = await usersCollection.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Hash the input password using SHA-256
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    // Compare hashed password
    if (user.password !== hashedPassword) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Return user info
    res.json({
      username: user.username,
      role: user.role,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Customer Search Endpoint
app.get("/api/customers/search", async (req, res) => {
  if (!customerMasterCollection) {
    return res.status(503).json({ message: "Database not connected yet." });
  }

  const query = req.query.q || "";

  try {
    let filter = {};
    if (query.length >= 1) {
      filter = {
        $or: [
          { customer_id: { $regex: query, $options: "i" } },
          { customer_names: { $regex: query, $options: "i" } },
        ],
      };
    }

    const results = await customerMasterCollection
      .find(filter)
      .limit(50)
      .toArray();

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error searching customers" });
  }
});
