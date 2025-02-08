const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User');

// Middleware for authentication check
function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/auth/login');
  }
}

// Multer storage configuration for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads/'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Home page
router.get('/', (req, res) => {
  res.render('home', { user: req.session.user });
});

// Profile page (accessible only for authenticated users)
router.get('/profile', isAuthenticated, (req, res) => {
  res.render('profile', { user: req.session.user });
});

// Edit profile page
router.get('/profile/edit', isAuthenticated, (req, res) => {
  res.render('edit-profile', { user: req.session.user, error: null });
});

// Handle profile update (including avatar upload)
router.post('/profile/edit', isAuthenticated, upload.single('profilePicture'), async (req, res) => {
  const { username, email } = req.body;
  const userId = req.session.user.id;

  try {
    // Prepare update data
    let updateData = { username, email };
    if (req.file) {
      updateData.profilePicture = '/uploads/' + req.file.filename;
    }

    // Update user data in MongoDB
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.render('edit-profile', { user: req.session.user, error: 'User not found.' });
    }

    // Update session data
    req.session.user.username = updatedUser.username;
    req.session.user.email = updatedUser.email;
    req.session.user.profilePicture = updatedUser.profilePicture;

    res.redirect('/profile');
  } catch (err) {
    console.error(err);
    res.render('edit-profile', { user: req.session.user, error: 'Failed to update profile.' });
  }
});

module.exports = router;
