import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./backend/config/db.js";
import authRoutes from "./backend/routes/auth.js";
import customerRoutes from "./backend/routes/customers.js";

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

// Routes
app.use("/api", authRoutes);
app.use("/api/customers", customerRoutes);

// START SERVER IMMEDIATELY
app.listen(port, () => {
  console.log(`🚀 Backend server is running at http://localhost:${port}`);
  console.log(
    `   (Ensure you have installed dependencies: npm install express mongodb cors dotenv)`,
  );

  // Initiate DB connection
  connectDB();
});
