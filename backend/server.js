const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const apiRoutes = require('../backend/api');
const { initSocket } = require('../backend/socket');
const MongoStore = require('connect-mongo');
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

const app = express();
const serverPort = process.env.SERVER_PORT;
const mongoDBURL = process.env.MONGODB_URL;

const corsOptions = {
  origin: process.env.CORS_ORIGIN, // Allow requests from the specified origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specified HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specified headers
  credentials: true // Allow sending cookies in CORS requests
};

// Set up middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: mongoDBURL }), // Use MongoDB to store session data
    cookie: {
      maxAge: 5 * 60 * 1000, // 5 minutes
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(mongoDBURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  log.info('Connected to MongoDB');
});

// Mount API routes
app.use('/api', apiRoutes); // Mount the API routes under the '/api' prefix

// Add /api/auth route
app.get('/api/auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  log.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Serve static files (optional)
app.use(express.static('public'));

// Start the server
const server = app.listen(serverPort, () => {
  log.info(`Server running on port ${serverPort}`);
});

// Initialize socket.io
initSocket(server);
