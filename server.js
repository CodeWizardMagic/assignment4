// server.js - Main server file
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('./config/db'); // Connecting to MongoDB Atlas
const authRoutes = require('./routes/auth');
const indexRoutes = require('./routes/index');
const path = require('path');
const app = express();

// Middleware for parsing request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

// Static files folder (CSS, images, uploaded files)
app.use(express.static(path.join(__dirname, 'public')));

// Setting up EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route handling
app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// Home route
app.get('/', (req, res) => {
    res.render('index'); // Express will automatically add .ejs
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

