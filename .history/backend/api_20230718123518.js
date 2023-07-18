const express = require('express');
const passport = require('../backend/config/passport-setup');
const { getIO } = require('../backend/socket');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../backend/models/User');
const router = express.Router();
const jwt = require('jsonwebtoken');

const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'myapp'});

function checkAuthenticated(req, res, next) {
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['authorization'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {      
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });    
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;    
        next();
      }
    });

  } else {
    // if there is no token
    // return an error
    return res.status(403).send({ 
        success: false, 
        message: 'No token provided.' 
    });
  }
}


router.post(
  '/login',
  [
    body('username').trim().notEmpty().escape().withMessage('Username is required'),
    body('password').trim().isLength({ min: 6 }).escape().withMessage('Password must be at least 6 characters long'),
  ],
  function (req, res, next) {
    passport.authenticate('local', function(err, user, info) {
      if (err) { return res.json({ success: false, data: null, error: err }); }
      if (!user) { return res.json({ success: false, data: null, error: 'Invalid username or password' }); }
      req.logIn(user, function(err) {
        if (err) { return res.json({ success: false, data: null, error: err }); }

        // User is found and authenticated now we generate a token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: '1d' // expires in 24 hours
        });

        // Return the information including token as JSON
        return res.json({ success: true, data: { message: 'Login successful', user, token }, error: null });
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
    req.logout((err) => {
      if (err) {
        log.error(err);
        // include error message in response
        return res.status(500).json({ success: false, data: null, error: `Logout Error: ${err.message}` });
      }

      req.session.destroy((err) => {
        if (err) {
          log.error(err);
          // include error message in response
          return res.status(500).json({ success: false, data: null, error: `Session Destruction Error: ${err.message}` });
        }

        // Clear the cookie
        res.clearCookie('connect.sid');
        res.json({ success: true, data: { message: 'Logged out' }, error: null });
      });
    });
  } else {
    log.error('No session found');
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
