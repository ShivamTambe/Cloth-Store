// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// POST /cart/empty — clears all items in the current user's cart
router.get('/cart/empty', async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/auth/google2');
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      return res.status(404).send('Cart not found');
    }

    // Clear all items from the cart
    cart.items = [];

    await cart.save();
    console.log(`Cart emptied for user ${req.user._id}`);

    res.redirect('/'); // or send a JSON response if it's an API
  } catch (err) {
    console.error('Error emptying cart:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
