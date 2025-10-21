const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();

const app = express();

// ✅ Trust proxy for secure cookies on Render
app.set('trust proxy', 1);

// ✅ CORS: allow exact frontend origin
app.use(cors({
  origin: ['https://winiq.onrender.com', 'http://localhost:5173'],
  credentials: true,
}));

// ✅ Session: secure, cross-site compatible
app.use(session({
  name: 'winiq.sid',
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }
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
  callbackURL: process.env.GOOGLE_CALLBACK_URL, // ✅ uses env var
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// 🔐 Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL, // ✅ uses env var
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

// 🔍 Root route
app.get('/', (req, res) => {
  res.send('WinIQ backend is running');
});

// 🔗 Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('https://winiq.onrender.com/dashboard');
});

// 🔗 Facebook OAuth routes
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('https://winiq.onrender.com/dashboard');
});

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
    res.redirect('https://winiq.onrender.com/login');
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});