const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');

router.get('/setup-2fa', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const user = await User.findById(req.session.user.id);
  if (!user) return res.redirect('/auth/login');

  const secret = speakeasy.generateSecret({
    length: 20,
    name: `MyApp (${user.email})`
  });

  const otpauthUrl = speakeasy.otpauthURL({
    secret: secret.ascii,
    label: `MyApp:${user.email}`,
    issuer: 'MyApp',
    encoding: 'ascii'
  });

  qrcode.toDataURL(otpauthUrl, async (err, imageUrl) => {
    if (err) return res.send('Error generating QR code');

    user.twoFASecret = secret.base32;
    await user.save();

    res.render('setup-2fa', { qrCode: imageUrl, secret: secret.base32, error: null });
  });
});


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
      profilePicture: req.file ? '/uploads/' + req.file.filename : '',
      is2FAEnabled: false, 
      twoFASecret: '' 
    });
    await newUser.save();

    req.session.user = { id: newUser._id, email: newUser.email };

    res.redirect('/auth/setup-2fa');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Registration failed. Please try again.' });
  }
});

// Login page
router.get('/login', (req, res) => {
  res.render('login', { email: '', error: null, showOTP: false });
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.render('login', { error: 'User not found', email: email || '', showOTP: false });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.render('login', { error: 'Incorrect password', email: email || '', showOTP: false });
  }

  if (user.is2FAEnabled) {
    if (!otp) {
      return res.render('login', { email, showOTP: true, error: 'Enter OTP from Google Authenticator' });
    }

    const isValidOTP = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token: otp
    });

    if (!isValidOTP) {
      return res.render('login', { email, showOTP: true, error: 'Invalid OTP code' });
    }
  }

  req.session.user = { id: user._id, email: user.email };
  res.redirect('/profile');
});

router.post('/enable-2fa', async (req, res) => {
  if (!req.session.user) return res.redirect('/auth/login');

  const user = await User.findById(req.session.user.id);
  if (!user) return res.redirect('/auth/login');

  const { otp } = req.body;

  const isValidOTP = speakeasy.totp.verify({
    secret: user.twoFASecret, 
    encoding: 'base32',
    token: otp
  });

  if (!isValidOTP) {
    return res.render('setup-2fa', { error: 'Неверный OTP-код.', qrCode: '' });
  }

  user.is2FAEnabled = true;
  await user.save();

  res.redirect('/profile'); 
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/auth/login');
});

module.exports = router;
