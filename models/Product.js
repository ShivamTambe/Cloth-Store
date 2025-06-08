const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  company: String, // optional, for branding
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  oldPrice: Number, // original price before discount
  discount: Number, // percentage discount like 20, 50 etc.
  rating: {
    type: Number,
    default: 0
  },
  reviews: {
    type: Number,
    default: 0
  },
  image: String, // main image
  images: [String], // all images
  thumbnails: [String], // for preview thumbnails
  category: String, // optional: to filter or group (e.g., skincare, footwear)
  stock: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // --- NEW Qikink Integration Specific Fields ---
  qikinkDesignIdentifier: { // This will store the full string from the "Design" column
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  qikinkBaseCost: { // The "Product Price (Starts from)" that Qikink charges you (e.g., 199.5)
    type: Number,
    required: true,
    min: 0
  },
  qikinkProductType: { // The Qikink product type (e.g., "Cotton Apparels" or "Unisex Standard Crew T-Shirt")
    type: String,
    trim: true
  },

  // --- Variations (if each variant has a distinct QikinkDesignIdentifier) ---
  variations: [
    {
      size: { type: String, enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'One Size'], required: true },
      color: { type: String, required: true, trim: true },
      // If a specific size/color combination has a DIFFERENT qikinkDesignIdentifier:
      qikinkVariantDesignIdentifier: { type: String, trim: true }, // Use this if it differs from the base
      qikinkVariantCost: { type: Number, min: 0 },
      variantSellingPrice: { type: Number, min: 0 }
    }
  ]
});

module.exports = mongoose.model('Product', productSchema);
