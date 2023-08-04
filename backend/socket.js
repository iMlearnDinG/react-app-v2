require('dotenv').config({ path: "C:\\codeProjects\\react-app-v2\\.env" });

const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY2;

function initSocket(server) {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.REACT_APP_CORS_ORIGIN,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // Join room event
    socket.on('join room', ({ roomId, token }) => {
      try {
        const decoded = jwt.verify(token, SECRET_KEY);
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
        socket.emit('authenticated', { success: true, data: null, error: null });
      } catch (err) {
        socket.emit('authenticated', { success: false, data: null, error: 'Invalid token' });
        socket.disconnect(); // Disconnect the socket if authentication fails
      }
    });

    // Socket authentication
    socket.on('authenticate', (token) => {
      try {
        const decoded = jwt.verify(token, SECRET_KEY);
        socket.emit('authenticated', { success: true, data: null, error: null });
      } catch (err) {
        socket.emit('authenticated', { success: false, data: null, error: 'Invalid token' });
        socket.disconnect(); // Disconnect the socket if authentication fails
      }
    });

    // Example socket events
    socket.on('message', (data) => {
      // Check if the socket is authenticated
      if (!socket.auth) {
        console.log('Socket not authenticated');
        socket.emit('error', { success: false, data: null, error: 'Not authenticated' });
        return;
      }

      const { roomId, message } = data;
      console.log('Received message:', message);

      // Handle the message with authenticated user data
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
}

module.exports = { initSocket };
