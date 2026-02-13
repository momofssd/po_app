import crypto from "crypto";
import express from "express";
import jwt from "jsonwebtoken";
import { getCollection } from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  // If DB connection hasn't finished or failed
  const usersCollection = getCollection("users");
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

    // Generate JWT token
    const token = jwt.sign(
      { username: user.username, role: user.role },
      process.env.JWT_SEC,
      { expiresIn: "24h" },
    );

    // Return user info and token
    res.json({
      username: user.username,
      role: user.role,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
