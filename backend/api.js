const express = require('express');
const passport = require('../backend/config/passport-setup');
const { getIO } = require('../backend/socket');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../backend/models/User');
const router = express.Router();

// Middleware to check if a user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ error: 'Not authenticated' });
}

router.post(
  '/login',
  [
    // Validate and sanitize the input fields
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  function (req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.status(400).json({ error: 'Invalid username or password' }); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.json({ message: 'Login successful', user });
      });
    })(req, res, next);
  }
);

router.post(
  '/register',
  [
    // Validate and sanitize the input fields
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create a new user in the database
      const newUser = new User({
        username,
        password: hashedPassword,
      });
      await newUser.save();

      return res.json({ message: 'Registration successful' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
);

router.get('/auth', (req, res) => {
  if (req.user) {
    return res.json({ isAuthenticated: true, user: req.user });
  } else {
    return res.json({ isAuthenticated: false });
  }
});


router.get('/user', checkAuthenticated, (req, res) => {
  // Handle API endpoint for fetching user data
  res.json(req.user);
});

router.post('/message', checkAuthenticated, (req, res) => {
  const { roomId, message } = req.body;

  // Emit the message to the room using socket.io
  const io = getIO();
  io.to(roomId).emit('message', message);

  res.json({ success: true });
});

module.exports = router;