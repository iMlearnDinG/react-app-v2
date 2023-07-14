const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

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

// isValidPassword method
userSchema.methods.isValidPassword = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};


const User = mongoose.model('User', userSchema);

module.exports = User;
