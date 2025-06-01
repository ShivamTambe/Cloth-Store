// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  email: {
    type: String,
    required: true
  },
  photo: String, // profile picture
  createdAt: {
    type: Date,
    default: Date.now
  },
  ordersId: Array
});

module.exports = mongoose.model('User', userSchema);
