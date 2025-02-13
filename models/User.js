const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    profilePicture: String,
    failedLoginAttempts: { type: Number, default: 0 },
    locked: { type: Boolean, default: false },
    twoFASecret: String,
    is2FAEnabled: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
