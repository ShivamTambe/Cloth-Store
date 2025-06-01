const express = require('express');
const passport = require('passport');
const router = express.Router();

// Start Google Auth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback URL
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/failed' }),
  (req, res) => {
    // Successful login, redirect
    res.redirect('/');
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
