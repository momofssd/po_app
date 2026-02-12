import express from "express";
import { getCollection } from "../config/db.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  const customerMasterCollection = getCollection("customer_master");
  if (!customerMasterCollection) {
    return res.status(503).json({ message: "Database not connected yet." });
  }

  const query = (req.query.q || "").toString();

  try {
    let filter = {};
    if (query.length >= 1) {
      // Split by any character that is NOT a letter or number (punctuation, spaces, etc.)
      const tokens = query.split(/[^a-zA-Z0-9]+/);

      // Filter out empty tokens
      const validTokens = tokens.filter((t) => t.length > 0);

      if (validTokens.length > 0) {
        const flexibleRegex = validTokens.join(".*");

        filter = {
          $or: [
            { customer_id: { $regex: flexibleRegex, $options: "i" } },
            { customer_names: { $regex: flexibleRegex, $options: "i" } },
          ],
        };
      }
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

export default router;
