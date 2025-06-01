const passport = require('passport');
require('dotenv').config();
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // your user schema

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    // Find or create user
    try {
      // Find user by googleId
      let existingUser = await User.findOne({ googleId: profile.id });

      if (existingUser) {
        // User already exists, return it
        console.log("User FOUND:", existingUser);
        return done(null, existingUser);
      }

      // User not found — create new user
      const newUser = await User.create({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        photo: profile.photos[0].value
      });
      console.log("User created:", newUser);
      return done(null, newUser);
    } catch (err) {
      return done(err, false);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id); // save only ID in session
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
