const express = require('express');
const router = express.Router();
const axios = require('axios');
const Order = require('../models/Order'); // ✅ Adjust path if necessary

// Base URL for Qikink APIs
const QIKINK_BASE_URL = 'https://sandbox.qikink.com/api'; // Use sandbox for development


router.post('/checkout', async (req, res) => {
  try {
    const {
      order_number,
      line_items,
      shipping_address,
      total_order_value,
      gateway,
      userId // Make sure this is passed from frontend (or use req.user._id if using auth)
    } = req.body;

    // --- Step 1: Obtain a fresh AccessToken from Qikink Authorization API ---
    const authResponse = await axios.post(`${QIKINK_BASE_URL}/token`,
      new URLSearchParams({ // Use URLSearchParams for x-www-form-urlencoded body
        ClientId: process.env.QIKINK_CLIENT_ID,
        client_secret: process.env.QIKINK_CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Important for Authorization API
        },
      }
    );

    const { Accesstoken, expires_in } = authResponse.data;

    if (!Accesstoken) {
      console.error('Qikink Authorization failed: No AccessToken received.');
      return res.status(500).json({ error: 'Failed to obtain Qikink AccessToken' });
    }

    console.log(`Qikink AccessToken obtained. Expires in: ${expires_in} seconds.`);

    // --- Step 2: Create the order in Qikink using the new AccessToken ---
    const qikinkResponse = await axios.post(`${QIKINK_BASE_URL}/order/create`, {
      order_number,
      qikink_shipping: "1",
      gateway: gateway || "COD",
      total_order_value,
      line_items,
      shipping_address
    }, {
      headers: {
        ClientId: process.env.QIKINK_CLIENT_ID,
        Accesstoken: Accesstoken, // Use the newly obtained AccessToken
        'Content-Type': 'application/json'
      }
    });

    // Check if Qikink order creation was successful
    if (qikinkResponse.status !== 200) {
      console.error('Qikink order creation failed:', qikinkResponse.data);
      return res.status(500).json({ error: 'Failed to create order with Qikink' });
    }

    // --- Step 3: Create an entry in your local Order model ---
    const newOrder = new Order({
      userId: req.user._id,
      items: line_items,
      totalAmount: total_order_value,
      status: 'Processing',
      qikinkOrderId: qikinkResponse.data.order_id, // Assuming Qikink returns an order_id
      // You might also want to store shipping_address or other details if not already part of the Order schema
      // shippingAddress: shipping_address
    });

    await newOrder.save().catch(err => {
      console.error("Mongoose save error:", err);
      if (err.name === 'ValidationError') {
        for (field in err.errors) {
          console.error(`Validation Error - ${field}: ${err.errors[field].message}`);
        }
      }
      // You might want to handle this more gracefully, e.g., by logging and still responding to the client
      // or considering a rollback of the Qikink order if local save is critical.
      // For now, we'll just log and continue to send the response.
    });

    // --- Step 4: Respond to the client ---
    res.status(200).json({
      message: 'Order placed successfully and recorded',
      qikinkData: qikinkResponse.data,
      localOrder: newOrder
    });

  } catch (error) {
    console.error('Error placing order:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

module.exports = router;
