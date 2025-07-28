const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
      productSku: String,
      colorHex: String,
      colorName: String,
      size: String
    }
  ]
});

module.exports = mongoose.model('Cart', cartItemSchema);
