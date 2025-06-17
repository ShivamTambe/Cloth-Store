const mongoose = require('mongoose');
const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Assuming a user must be associated with an order
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      name: { // Add name for easier display without populating Product always
        type: String,
        required: true
      },
      image: { // Add image for easier display without populating Product always
        type: String,
        required: false
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: { // Price *at the time of order* for this specific item
        type: Number,
        required: true,
        min: 0
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: { // Qikink will update this, but you can have initial status
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] // Example statuses
  },
  qikinkOrderId: { // <-- NEW FIELD: To store the order ID from Qikink
    type: String,
    unique: true, // Should be unique per Qikink order
    sparse: true // Allows null/undefined if not a Qikink order, or if initially not set
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);