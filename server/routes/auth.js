const express = require('express');
const router = express.Router();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  const newUser = {
    googleId: profile.id,
    displayName: profile.displayName,
    firstName: profile.name.givenName,
    lastName: profile.name.familyName,
    profileImage: profile.photos[0].value
  };

  try {
    let user = await User.findOne({ googleId: profile.id });
    if (user) {
      done(null, user);
    } else {
      user = await User.create(newUser);
      done(null, user);
    }
  } catch (error) {
    console.log(error);
  }
}));

// Google login
router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

// Callback
router.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/',
  successRedirect: '/dashboard'
}));
// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Error logging out');
    res.redirect('/');
  });
});

// Serialize / Deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = router;

module.exports = router;
