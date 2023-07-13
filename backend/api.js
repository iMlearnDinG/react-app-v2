const express = require('express');
const { getIO } = require('../backend/socket');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../backend/models/User');
const router = express.Router();

router.post(
  '/login',
  [
    // Validate and sanitize the input fields
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').trim().notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Find the user in the database
      const user = await User.findOne({ username });

      // If the user doesn't exist, return an error
      if (!user) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      // Check if the password is correct
      const isPasswordValid = await bcrypt.compare(password, user.password);

      // If the password is incorrect, return an error
      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      // Authentication successful
      // Perform any additional authentication logic here

      // Return a success message or relevant user data
      return res.json({ message: 'Login successful', user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
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

router.get('/user', (req, res) => {
  // Handle API endpoint for fetching user data
});

router.post('/message', (req, res) => {
  const { roomId, message } = req.body;

  // Emit the message to the room using socket.io
  const io = getIO();
  io.to(roomId).emit('message', message);

  res.json({ success: true });
});

module.exports = router;
