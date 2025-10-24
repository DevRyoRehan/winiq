const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();

const app = express();

// ✅ Trust proxy for Render (important for secure cookies)
app.set('trust proxy', 1);

// ✅ CORS: allow frontend and local dev
app.use(
  cors({
    origin: ['https://winiq.onrender.com', 'http://localhost:5173'],
    credentials: true,
  })
);

// ✅ Session: secure cross-site cookie (works across subdomains)
app.use(
  session({
    name: 'winiq.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true, // Required for HTTPS
      sameSite: 'none', // Required for cross-site
      domain: '.onrender.com', // ✅ Makes cookie valid for both subdomains
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// ✅ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 🔐 Serialize / Deserialize
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// 🔐 Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

// 🔐 Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_APP_ID,
      clientSecret: process.env.FB_APP_SECRET,
      callbackURL: process.env.FB_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => done(null, profile)
  )
);

// 🏠 Health Check
app.get('/health', (req, res) => res.send('OK'));

// 🌐 Root route
app.get('/', (req, res) => res.send('WinIQ backend is running'));

// 🔗 Google OAuth routes
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // redirect to frontend dashboard after success
    res.redirect('https://winiq.onrender.com/dashboard');
  }
);

// 🔗 Facebook OAuth routes
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('https://winiq.onrender.com/dashboard');
  }
);

// 🧩 Auth check middleware
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

// 👤 Profile route
app.get('/profile', ensureAuth, (req, res) => {
  res.json({
    name: req.user.displayName || req.user.name || 'User',
    email: req.user.emails?.[0]?.value || 'N/A',
    provider: req.user.provider || 'local',
  });
});

// 🚪 Logout route (safe for Render)
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('winiq.sid', {
        domain: '.onrender.com',
        secure: true,
        sameSite: 'none',
      });
      res.redirect('https://winiq.onrender.com/login');
    });
  });
});

// 🧪 Debug route (optional)
app.get('/debug-session', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    session: req.session,
    user: req.user,
  });
});

// ✅ Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
