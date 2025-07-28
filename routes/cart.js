// routes/cart.js
const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');

router.post('/cart/add', async (req, res) => {
  try {
    console.log(req.user);
    
    if (!req.user) {
      return res.redirect('/auth/google2');
    }
    console.log("REQ BODY:" , req.body);
    
    const { productId, count, redirectUrl, skuDisplayInput } = req.body;
    console.log(count);
    const quantityToAdd = parseInt(count);
    
    const product = await Product.findById(productId);
    if (!product) {
        console.log("Proudct not FOuntd");
        
        return res.status(404).send('Product not found');
    }
    else{
        console.log("Product Fuond");
        
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    console.log("Cart: ",cart);
    
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [{
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: quantityToAdd,
          productSku: skuDisplayInput
        }]
      });
      console.log("Oroudt SKU: ",  skuDisplayInput);
      
      console.log("New CART Crated: ", cart);
      
    } else {
      // const existingItem = cart.items.find(item => item.productId.toString() === productId);
      const existingItem = cart.items.find(item => 
        item.productId.toString() === productId && item.productSku === skuDisplayInput
      );
      if (existingItem) {
          existingItem.quantity += quantityToAdd;
          console.log("Item already in CART: ", existingItem);
      } else {
        cart.items.push({
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: quantityToAdd,
          productSku: skuDisplayInput
        });
        console.log("New Item added in Crat", cart);
        
      }
    }

    await cart.save();
    res.redirect(redirectUrl || '/cart');
  } catch (err) {
    console.error('Error adding to cart:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
