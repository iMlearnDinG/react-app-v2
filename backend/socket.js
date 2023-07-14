const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

function initSocket(server) {
  const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:3000', // Replace with your ngrok URL
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
        console.log('Authenticated:', decoded);
        // You can add any additional authentication logic here

        // Store the authenticated user or data in socket for later use
        socket.auth = {
          userId: decoded.id,
          username: decoded.username,
          // Add any additional authenticated data
        };

        // Emit authentication success event
        socket.emit('authenticated', { success: true });
      } catch (err) {
        console.error('Authentication failed:', err);
        // Emit authentication failure event
        socket.emit('authenticated', { success: false, error: 'Invalid token' });
      }
    });

    // Example socket events
    socket.on('message', (data) => {
      // Check if the socket is authenticated
      if (!socket.auth) {
        console.log('Socket not authenticated');
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
