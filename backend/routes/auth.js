import crypto from "crypto";
import express from "express";
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

export default router;
