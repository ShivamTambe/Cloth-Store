const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

// POST /api/products
// router.post("/", async (req, res) => {
//   try {
//     const product = new Product(req.body);
//     await product.save();
//     res.status(201).json({ message: "Product created", product });
//   } catch (err) {
//     console.error(err);
//     res.status(400).json({ message: "Failed to create product", error: err.message });
//   }
// });

router.post("/", async (req, res) => {
  try {
    const {
      name,
      company,
      description,
      price,
      oldPrice,
      discount,
      rating,
      reviews,
      image,
      images,
      thumbnails,
      category,
      stock,
      qikinkProductId,
      qikinkBaseCost,
      qikinkProductType,
      variations, // raw string
    } = req.body;

    // db.products.getIndexes()



    // console.log("Receaived variations string:", variations);
    let parsedVariations = [];

    if (variations) {
      try {
        const raw = JSON.parse(variations);
        // console.log("parsedVariations string:", variations);

        if (!Array.isArray(raw)) {
          throw new Error("Variations must be an array");
        }

        // Transform skus object into sizeSkus array
        parsedVariations = raw.map(variation => {
          const { skus, ...rest } = variation;
          const sizeSkus = Object.entries(skus).map(([size, sku]) => ({ size, sku }));
          return {
            ...rest,
            sizeSkus
          };
        });

      } catch (err) {
        return res.status(400).json({ error: "Invalid variations JSON format." });
      }
    }

    const newProduct = new Product({
      name,
      company,
      description,
      price,
      oldPrice,
      discount,
      rating,
      reviews,
      image,
      images,
      thumbnails,
      category,
      stock,
      qikinkProductId,
      qikinkBaseCost,
      qikinkProductType,
      variations: parsedVariations
    });

    const saved = await newProduct.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error("Product creation error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
