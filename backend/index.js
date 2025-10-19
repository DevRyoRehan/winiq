const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();

const app = express();

// 🔐 CORS setup for frontend
app.use(cors({
  origin: ['http://localhost:5173', 'winiq.render.com'],
  credentials: true
}));
app.use(express.json());

// 🔐 Session setup
app.use(session({
  secret: 'winiq-secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// 🔐 Passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// 🔐 Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "https://winiq-backend.onrender.com/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// 🔐 Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "https://winiq-backend.onrender.com/auth/facebook/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// 🔍 Root route
app.get('/', (req, res) => {
  res.send('WinIQ backend is running');
});

// 🔗 Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: 'winiq.render.com/dashboard',
  failureRedirect: '/login'
}));

// 🔗 Facebook OAuth routes
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: 'winiq.render.com/dashboard',
  failureRedirect: '/login'
}));

// 🔍 Health check route for Render
app.get('/health', (req, res) => {
  res.send('OK');
});

// 🔐 Auth check middleware
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

// 🔍 Profile route
app.get('/profile', ensureAuth, (req, res) => {
  res.json({
    name: req.user.displayName || req.user.name || 'User',
    email: req.user.emails?.[0]?.value || 'N/A',
    provider: req.user.provider || 'local'
  });
});

// 🔓 Logout route
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('winiq.render.com/login');
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});