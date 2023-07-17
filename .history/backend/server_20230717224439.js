const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const apiRoutes = require('../backend/api');
const { initSocket } = require('../backend/socket');
const MongoStore = require('connect-mongo');
const path = require('path'); // Add this line
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const util = require('util');
require('dotenv').config({ path: "C:\\Users\\User\\PycharmProjects\\react-app-v2\\.env" });

const bunyan = require('bunyan');
const log = bunyan.createLogger({
    name: 'react-server',
    streams: [
        {
            level: 'info',
            path: 'C:\\logs\\server.txt'  // log INFO and above to a file
        }
    ]
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 100 requests per windowMs
  handler: (req, res, next) => {
    // if we hit the rate limit, print a message and remove the session cookie
    console.log(`Rate limit exceeded by user: ${util.inspect(req.sessionID)}`);
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
          res.status(500).json({
            success: false,
            error: 'Error destroying session',
            details: err.message
          });
        } else {
          console.log('Session destroyed due to rate limiting');
          res.clearCookie('connect.sid');
          res.status(429).json({
            success: false,
            error: 'Too many requests',
            details: 'Your session has been destroyed due to rate limiting'
          });
        }
      });
    } else {
      res.status(429).json({
        success: false,
        error: 'Too many requests',
        details: 'Please try again later'
      });
    }
  }
});


const app = express();
const serverPort = process.env.SERVER_PORT;
const mongoDBURL = process.env.MONGODB_URL;

const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);
app.use(helmet());


app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoDBURL }),
    cookie: {
      httpOnly: true, // Ensures the cookie is sent only over HTTP(S), not client JavaScript, helping to protect against cross-site scripting attacks.
      sameSite: 'strict', // Protection against cross-site request forgery attacks
      maxAge: 5 * 60 * 1000,
    },
    rolling: true, // session expiration is reset on each response
  })
);


app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(mongoDBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  log.info('Connected to MongoDB');
});

// Your API routes
app.use('/api', apiRoutes);

app.use((err, req, res, next) => {
  log.error(err);
  res.status(500).json({ success: false, data: null, error: 'Internal Server Error' });
});

const server = app.listen(serverPort, () => {
  log.info(`Server running on port ${serverPort}`);
});

app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.path}`);
  next();
});


// Serve static files from the React app
app.use(express.static('build'))

initSocket(server);
