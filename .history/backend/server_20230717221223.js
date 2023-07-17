const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const apiRoutes = require('../backend/api');
const { initSocket } = require('../backend/socket');
const MongoStore = require('connect-mongo');
const path = require('path'); // Add this line
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
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());



app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: mongoDBURL }),
    rolling: true, // the session expiry time will be reset on each client request
    cookie: {
      secure: true, // Set this to true
      httpOnly: true, // Defaults to true
      maxAge: 5 * 60 * 1000,
    },
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

// Serve static files from the React app
app.use(express.static('build'))

initSocket(server);
