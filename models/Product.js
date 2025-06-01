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
  }
});

module.exports = mongoose.model('Product', productSchema);
