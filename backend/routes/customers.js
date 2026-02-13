import express from "express";
import { ObjectId } from "mongodb";
import { getCollection } from "../config/db.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/search", authenticateToken, async (req, res) => {
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

    let queryLimit = 50;
    if (req.query.limit && req.query.limit === "none") {
      queryLimit = 0; // 0 means no limit in MongoDB
    } else if (req.query.limit) {
      queryLimit = parseInt(req.query.limit.toString(), 10);
    }

    const cursor = customerMasterCollection.find(filter);

    if (queryLimit > 0) {
      cursor.limit(queryLimit);
    }

    const results = await cursor.toArray();

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ message: "Error searching customers" });
  }
});

// Create new customer
router.post("/", authenticateToken, requireAdmin, async (req, res) => {
  const customerMasterCollection = getCollection("customer_master");
  if (!customerMasterCollection) {
    return res.status(503).json({ message: "Database not connected yet." });
  }

  try {
    const { customer_id, customer_names, sales_org, ship_to } = req.body;
    const result = await customerMasterCollection.insertOne({
      customer_id,
      customer_names: Array.isArray(customer_names)
        ? customer_names
        : [customer_names],
      sales_org,
      ship_to: ship_to || {},
    });

    const newCustomer = await customerMasterCollection.findOne({
      _id: result.insertedId,
    });
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Create error:", error);
    res.status(500).json({ message: "Error creating customer" });
  }
});

// Update customer
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const customerMasterCollection = getCollection("customer_master");
  if (!customerMasterCollection) {
    return res.status(503).json({ message: "Database not connected yet." });
  }

  try {
    const { id } = req.params;
    const { customer_id, customer_names, sales_org, ship_to } = req.body;

    const updateDoc = {
      $set: {
        customer_id,
        customer_names: Array.isArray(customer_names)
          ? customer_names
          : [customer_names],
        sales_org,
        ship_to: ship_to || {},
      },
    };

    await customerMasterCollection.updateOne(
      { _id: new ObjectId(id) },
      updateDoc,
    );

    const updatedCustomer = await customerMasterCollection.findOne({
      _id: new ObjectId(id),
    });
    res.json(updatedCustomer);
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Error updating customer" });
  }
});

// Delete customer
router.delete("/:id", authenticateToken, requireAdmin, async (req, res) => {
  const customerMasterCollection = getCollection("customer_master");
  if (!customerMasterCollection) {
    return res.status(503).json({ message: "Database not connected yet." });
  }

  try {
    const { id } = req.params;
    await customerMasterCollection.deleteOne({ _id: new ObjectId(id) });
    res.json({ message: "Customer deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Error deleting customer" });
  }
});

export default router;
