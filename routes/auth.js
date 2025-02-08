const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Multer storage configuration for profile picture uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Registration page
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Handle registration
router.post('/register', upload.single('profilePicture'), async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (!username || !email || !password || !confirmPassword) {
    return res.render('register', { error: 'Please fill in all fields.' });
  }
  if (password !== confirmPassword) {
    return res.render('register', { error: 'Passwords do not match.' });
  }
  if (password.length < 6) {
    return res.render('register', { error: 'Password must be at least 6 characters long.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('register', { error: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      profilePicture: req.file ? '/uploads/' + req.file.filename : ''
    });
    await newUser.save();
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Registration failed. Please try again.' });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { error: 'Please fill in all fields.' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.render('login', { error: 'User not found.' });
    }

    if (user.locked) {
      return res.render('login', { error: 'Your account is locked due to too many failed login attempts.' });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= 5) {
        user.locked = true;
      }

      await user.save();
      return res.render('login', { error: 'Incorrect password.' });
    }

    user.failedLoginAttempts = 0;
    user.locked = false;
    await user.save();

    req.session.user = {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture
    };

    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;
