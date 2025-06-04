const express = require('express');
const passport = require('passport');
const router = express.Router();

let redirectUrl='/';
// Start Google Auth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Callback URL
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/failed' }),
  (req, res) => {
    // Successful login, redirect
    console.log("heehh");
    
    res.redirect(redirectUrl);
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

router.get('/google2', (req, res, next) => {
  req.session.redirectAfterLogin = req.query.redirect || '/';
  redirectUrl = req.query.redirect;
  console.log('[google2] Stored in session:', req.session.redirectAfterLogin);
  next();
}, passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google2/callback',
  (req, res, next) => {
    console.log('[callback] Session before auth:', req.session);
    next();
  },
  passport.authenticate('google', { failureRedirect: '/failed' }),
  (req, res) => {
    console.log('[callback] Session after auth:', req.session);
    const redirectPath = req.session.redirectAfterLogin || '/';
    console.log('[callback] Redirecting to:', redirectPath);
    delete req.session.redirectAfterLogin;
    res.redirect(redirectPath);
  }
);



// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

module.exports = router;
