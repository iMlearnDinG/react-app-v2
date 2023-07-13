const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const apiRoutes = require('../backend/api');
const { initSocket } = require('../backend/socket');
require('dotenv').config({ path: "C:\\Users\\User\\PycharmProjects\\react-app-v2\\.env" });

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
    saveUninitialized: true
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
  console.log('Connected to MongoDB');
});

// Mount API routes
app.use('/api', apiRoutes); // Mount the API routes under the '/api' prefix

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Serve static files (optional)
app.use(express.static('public'));

// Start the server
const server = app.listen(serverPort, () => {
  console.log(`Server running on port ${serverPort}`);
});

// Initialize socket.io
initSocket(server);

// Graceful shutdown
process.on('SIGINT', () => {
  db.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
