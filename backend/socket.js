const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

function initSocket(server) {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    },
  });

  // Handle socket connections
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

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
