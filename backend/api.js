const express = require('express');
const passport = require('../backend/config/passport-setup');
const { getIO } = require('../backend/socket');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../backend/models/User');
const Lobby = require('../backend/models/Lobby');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Types } = require('mongoose');
const Game = require('./models/Game');


const bunyan = require('bunyan');
const log = bunyan.createLogger({name: 'myapp'});

require('dotenv').config({ path: "C:\\codeProjects\\react-app-v2\\.env" });


// Authetication Function

function checkAuthenticated(req, res, next) {
  // check header or url parameters or post parameters for token
  const token = req.body.token || req.query.token || req.headers['authorization'];

  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, process.env.REACT_APP_JWT_SECRET, function(err, decoded) {      
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


// Login Route POST

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
        const token = jwt.sign({ id: user._id }, process.env.REACT_APP_JWT_SECRET, {
          expiresIn: '1d' // expires in 24 hours
        });

        // Return the information including token as JSON
        return res.json({ success: true, data: { message: 'Login successful', user, token }, error: null });
      });
    })(req, res, next);
  }
);


// Register Route POST

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


// Multiplayer route POST

router.post('/multiplayer', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Try to find an open lobby that has exactly 1 player
    let openLobby = await Lobby.findOne({ players: { $size: 1 } });

    if (!openLobby) {
      // If no lobby with 1 player is found, try to find a lobby with no players
      openLobby = await Lobby.findOne({ players: { $size: 0 } });
    }

    let lobby;
    let game;
    if (openLobby) {
      // If there's an open lobby, add the current user to it
      openLobby.players.push(user);
      if (openLobby.players.length === 2) {
        openLobby.status = 'in-game'; // Update status to 'in-game' if lobby is full

        // Create a new game instance when the second player joins
        game = new Game({ player1: openLobby.players[0], player2: user, dealer: openLobby.players[0], currentTurn: openLobby.players[0] });
        await game.save();
      }
      await openLobby.save();
      lobby = openLobby;
    } else {
      // If there's no open lobby, create a new one
      lobby = new Lobby({ players: [user] });
      await lobby.save();
    }

    user.lobbyId = lobby._id;
    user.inQueue = true;
    await user.save();

    res.json({ success: true, lobby, game, gameId: game? game._id : null });  // Include the gameId in the response
  } catch (error) {
    log.error('Error in /multiplayer route', error);
    res.status(500).json({ success: false, error: 'An error occurred' });
  }
});





// Logout Route POST

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


// Renew Session Route POST

router.post('/renew-session', (req, res) => {
  if (req.session) {
    req.session.cookie.maxAge = 5 * 60 * 1000; // 5 minutes
    res.json({ success: true, data: { message: 'Session renewed' }, error: null });
  } else {
    res.status(401).json({ success: false, data: null, error: 'Not authenticated' });
  }
});


// Leave waiting room route POST

router.post('/leave-waiting-room', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    // Find the lobby that the user is a part of
    let lobby = await Lobby.findById(user.lobbyId);
    
    if (lobby) {
      // Remove the user from the players array
      lobby.players = lobby.players.filter(player => player.toString() !== user._id.toString());
      
      // If after removal, the lobby has no players, delete the lobby
      if (lobby.players.length === 0) {
        await Lobby.findByIdAndRemove(lobby._id);
      } else {
        // Otherwise, save the lobby back to the database
        await lobby.save();
      }

      user.lobbyId = null;
      user.inQueue = false;
      await user.save();
    }

    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// START GAME Route POST

router.post('/games/start', async (req, res) => {
  const { players } = req.body;

  try {
    // Here I assume you have a Game model in the backend
    const newGame = new Game({ players, status: 'active' });
    await newGame.save();

    res.json({ success: true, data: { game: newGame } });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});


// Fetch game by ID

router.get('/game/:gameId', async (req, res) => {
  try {
    const gameId = req.params.gameId;
    const game = await Game.findById(gameId)
      .populate('player1')
      .populate('player2')
      .populate('dealer')
      .populate('currentTurn')
      .populate('deck')
      .populate('discardPile');
    if (!game) {
      return res.status(404).json({ success: false, error: 'Game not found' });
    }
    res.json({ success: true, game });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



router.get('/lobby/:lobbyId', async (req, res) => {
  const lobbyId = req.params.lobbyId;
  const lobby = await Lobby.findById(lobbyId).populate('players');

  if (!lobby) {
    return res.status(404).json({ success: false, error: 'Lobby not found' });
  }

  const game = await Game.findOne({ lobbyId });  // Find the game associated with the lobby
  if (game) {
    lobby.gameId = game._id;  // Add the game ID to the lobby document
  }

  res.json({ success: true, lobby });
});



// Authentication Route GET

router.get('/auth', (req, res) => {
  console.log('Auth route hit'); // Add this line

  if (req.user) {
    return res.json({ success: true, data: { isAuthenticated: true, user: req.user }, error: null });
  } else {
    return res.json({ success: false, data: { isAuthenticated: false }, error: null });
  }
});


// Multiplayer route GET

router.get('/multiplayer', async (req, res) => {
  try {
    const lobbyId = req.query.lobbyId; // get lobbyId from query params
    const lobby = await Lobby.findById(lobbyId).populate('players');
    if (!lobby) {
      return res.status(404).json({ success: false, error: 'Lobby not found' });
    }
    res.json({ success: true, data: { lobby } }); // return the full lobby object
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});




// User Model Route GET

router.get('/user', checkAuthenticated, (req, res) => {
  res.json({ success: true, data: req.user, error: null });
});


// Message Route POST

router.post('/message', checkAuthenticated, (req, res) => {
  const { roomId, message } = req.body;

  const io = getIO();
  io.to(roomId).emit('message', message);

  res.json({ success: true, data: { message: 'Message sent' }, error: null });
});




module.exports = router;