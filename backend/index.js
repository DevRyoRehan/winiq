const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

// ✅ Middleware
app.use(express.json());
app.use(
  cors({
    origin: ['https://winiq.onrender.com', 'http://localhost:5173'],
    credentials: true,
  })
);
app.use(
  session({
    name: 'winiq.sid',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      domain: '.onrender.com',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Passport config
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

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

// ✅ Routes
app.get('/health', (req, res) => res.send('OK'));
app.get('/', (req, res) => res.send('WinIQ backend is running'));

// 🔐 Email/password login (mock)
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'test@winiq.com' && password === '123456') {
    req.login({ name: 'Test User', email, provider: 'local' }, err => {
      if (err) return res.status(500).json({ error: 'Login failed' });
      return res.json({ name: 'Test User' });
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// 🔗 Google OAuth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => res.redirect('https://winiq.onrender.com/dashboard')
);

// 🔗 Facebook OAuth
app.get('/auth/facebook', passport.authenticate('facebook'));
app.get(
  '/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => res.redirect('https://winiq.onrender.com/dashboard')
);

// 🔒 Auth check
function ensureAuth(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'Not authenticated' });
}

// 👤 Profile
app.get('/profile', ensureAuth, (req, res) => {
  res.json({
    name: req.user.displayName || req.user.name || 'User',
    email: req.user.emails?.[0]?.value || 'N/A',
    provider: req.user.provider || 'local',
  });
});

// 🚪 Logout
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

// 🧪 Debug
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