const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Failed to create product", error: err.message });
  }
});

module.exports = router;
