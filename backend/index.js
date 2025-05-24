const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Session setup
app.use(session({
  secret: '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',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,   // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/login', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String },         // For local login only
  googleId: { type: String }          // For Google OAuth users
}, { versionKey: false });

const User = mongoose.model('User', userSchema);

// Passport serialize/deserialize
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ============================
// 🔐 LOCAL LOGIN APIs
// ============================

// Register
app.post('/api/register', async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ msg: 'Please fill all fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ fullName, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error registering user' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Optionally set session info here (e.g., req.login(user))
    // req.login(user, err => { ... });

    res.json({ msg: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Login error' });
  }
});

// ============================
// 🌐 GOOGLE LOGIN API (token from frontend)
// ============================

app.post('/api/google-login', async (req, res) => {
  const { email, fullName } = req.body;

  if (!email || !fullName) {
    return res.status(400).json({ msg: 'Invalid Google user data' });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // Register new Google user silently
      user = new User({ email, fullName, googleId: email });
      await user.save();
    }

    // Optionally set session info here (e.g., req.login(user))
    res.json({ msg: 'Google login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Google login failed' });
  }
});

// ============================
// 🚪 LOGOUT
// ============================

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('http://localhost:3000/');
  });
});

// ============================
// Start server
// ============================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
