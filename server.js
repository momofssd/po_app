import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./backend/config/db.js";
import authRoutes from "./backend/routes/auth.js";
import customerRoutes from "./backend/routes/customers.js";
import resultsRoutes from "./backend/routes/results.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

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
app.use("/api/results", resultsRoutes);

// Serve static files from the Vite build directory
app.use(express.static(path.join(__dirname, "dist")));

// CATCH-ALL MIDDLEWARE
// This replaces app.get("*") to avoid Express 5 path-to-regexp errors
app.use((req, res) => {
  // If it's an API route that wasn't caught by the above routes, return 404
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }
  // Otherwise serve the frontend
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// START SERVER IMMEDIATELY
app.listen(port, () => {
  console.log(`🚀 Backend server is running at port ${port}`);
  // Initiate DB connection
  connectDB();
});
