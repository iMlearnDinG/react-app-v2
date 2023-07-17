const express = require('express');
const passport = require('../backend/config/passport-setup');
const { getIO } = require('../backend/socket');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../backend/models/User');
const router = express.Router();

const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'myapp'});

// Middleware to check if a user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(401).json({ success: false, data: null, error: 'Not authenticated' });
}

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  function (req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.json({ success: false, data: null, error: err }); }
      if (!user) { return res.json({ success: false, data: null, error: 'Invalid username or password' }); }
      req.logIn(user, function(err) {
        if (err) { return res.json({ success: false, data: null, error: err }); }
        return res.json({ success: true, data: { message: 'Login successful', user }, error: null });
      });
    })(req, res, next);
  }
);

router.post(
  '/register',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const extractedErrors = errors.array().map(err => err.msg);
      return res.json({ success: false, data: null, error: extractedErrors });
    }


    const { username, password } = req.body;

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.json({ success: false, data: null, error: 'Username already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        username,
        password: hashedPassword,
      });
      await newUser.save();

      return res.json({ success: true, data: { message: 'Registration successful' }, error: null });
    } catch (error) {
      log.error(error);
      return res.json({ success: false, data: null, error: 'Internal Server Error' });
    }
  }
);

router.post('/logout', (req, res) => {
  if (req.session) {
    req.logout();
    req.session.destroy((err) => {
      if (err) {
        log.error(err);
        return res.status(500).json({ success: false, data: null, error: 'Internal Server Error' });
      }

      res.json({ success: true, data: { message: 'Logged out' }, error: null });
    });
  } else {
    res.status(400).json({ success: false, data: null, error: 'Not authenticated' });
  }
});



router.post('/renew-session', (req, res) => {
  if (req.session) {
    req.session.cookie.maxAge = 5 * 60 * 1000; // 5 minutes
    res.json({ success: true, data: { message: 'Session renewed' }, error: null });
  } else {
    res.status(401).json({ success: false, data: null, error: 'Not authenticated' });
  }
});

router.get('/auth', (req, res) => {
  console.log('Auth route hit'); // Add this line

  if (req.user) {
    return res.json({ success: true, data: { isAuthenticated: true, user: req.user }, error: null });
  } else {
    return res.json({ success: false, data: { isAuthenticated: false }, error: null });
  }
});



router.get('/user', checkAuthenticated, (req, res) => {
  res.json({ success: true, data: req.user, error: null });
});

router.post('/message', checkAuthenticated, (req, res) => {
  const { roomId, message } = req.body;

  const io = getIO();
  io.to(roomId).emit('message', message);

  res.json({ success: true, data: { message: 'Message sent' }, error: null });
});

module.exports = router;
