import express from "express";
import jwt from "jsonwebtoken";
import { getCollection } from "../config/db.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// POST /save - Protected by auth middleware
// This saves the current table data for the specific session token
router.post("/save", authenticateToken, async (req, res) => {
  const { data } = req.body;
  if (!data) {
    return res.status(400).json({ message: "No data provided" });
  }

  // Extract token from header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  const resultsCollection = getCollection("results");
  if (!resultsCollection) {
    return res.status(503).json({ message: "Database not connected" });
  }

  try {
    // Store results associated with the specific token
    // This allows invalidating results per session
    await resultsCollection.updateOne(
      { token: token },
      {
        $set: {
          username: req.user.username,
          data: data,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    res.json({ message: "Results saved successfully" });
  } catch (error) {
    console.error("Error saving results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET / - Public endpoint but protected by token query param
// This allows external applications to fetch the data
router.get("/", async (req, res) => {
  const token = req.query.wms_session_token;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Missing wms_session_token parameter" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SEC);

    const resultsCollection = getCollection("results");
    if (!resultsCollection) {
      return res.status(503).json({ message: "Database not connected" });
    }

    // Retrieve data for the specific token
    const result = await resultsCollection.findOne({
      token: token,
    });

    if (!result || !result.data) {
      // If no data saved for this token, return empty array
      // This happens if data was never saved or token was invalidated (deleted)
      return res.json([]);
    }

    res.json(result.data);
  } catch (err) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    console.error("Error fetching results:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /clear - Clear results for current session
// Called on logout
router.delete("/clear", authenticateToken, async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not found" });
  }

  const resultsCollection = getCollection("results");
  if (!resultsCollection) {
    return res.status(503).json({ message: "Database not connected" });
  }

  try {
    await resultsCollection.deleteOne({ token: token });
    res.json({ message: "Results cleared" });
  } catch (error) {
    console.error("Error clearing results:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
