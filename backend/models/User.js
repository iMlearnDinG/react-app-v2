const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  lobbyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lobby'
  },
}, {
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password;
      return ret;
    },
  },
});


// isValidPassword method
userSchema.methods.isValidPassword = function(password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, isMatch) => {
      if (err) return reject({ success: false, data: null, error: err });
      resolve({ success: true, data: { isMatch }, error: null });
    });
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
