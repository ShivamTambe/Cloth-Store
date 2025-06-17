const express = require('express');
const router = express.Router();
const Order = require('../models/Order'); // Adjust path if necessary

// Middleware to protect routes (example - replace with your actual auth middleware)
// Assuming you have a way to get req.user._id from a session or JWT
function ensureAuthenticated(req, res, next) {
    // This is a placeholder. You need to implement actual user authentication.
    // For testing, you might hardcode req.user._id or pass it via body/params temporarily.
    // In a real app, this would come from a session or JWT payload.
    if (req.isAuthenticated && req.isAuthenticated()) { // Example using Passport.js
        return next();
    }
    // If not authenticated, redirect to login or send an error
    res.redirect('/login'); // Or res.status(401).json({ error: 'Unauthorized' });
}

// Route to display all orders for the logged-in user
router.get('/orders', async (req, res) => {
    try {
        // --- IMPORTANT: Replace with your actual user ID retrieval ---
        // For development, you might hardcode a userId if you don't have auth yet
        // const userId = "60c72b2f9f1b2c001c8e4d5f"; // Example hardcoded user ID
        
        // In a real application, you'd get userId from session or JWT token
        // e.g., if you use Passport.js: const userId = req.user._id;
        // Or if you pass it via a custom middleware: const userId = req.session.userId;
        
        // For demonstration, let's assume userId is coming from req.query or a session (if not using ensureAuthenticated yet)
        // If no auth, you might fetch all orders or default to a specific user
        const userId = req.user._id; // Example: if you store userId in session
        if (!userId) {
            console.warn('No user ID found in session for /orders route. Cannot fetch user-specific orders.');
            // You might want to redirect to login or show an empty orders page
            return res.render('orders', { orders: [], error: 'Please log in to view your orders.' });
        }


        // Find orders for the specific user and populate product details within each item
        const orders = await Order.find({ userId: userId })
                                  .populate('items.productId') // Populates the productId field with actual Product documents
                                  .sort({ createdAt: -1 }); // Sort by newest first

         console.log("Fetched orders:", orders); // For debugging
        // console.log(orders[0].populated('items.productId'));
        
        res.render('orders', { orders: orders }); // Pass the fetched orders to the EJS template
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).render('orders', { orders: [], error: 'Failed to load orders. Please try again later.' });
    }
});

module.exports = router;