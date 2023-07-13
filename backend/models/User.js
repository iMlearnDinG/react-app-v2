const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Add any additional methods or middleware to the user schema

const User = mongoose.model('User', userSchema);

module.exports = User;
