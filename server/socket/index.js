const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { registerSocketHandlers } = require('./handlers');

const initializeSocket = (httpServer) => {
  const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173'];
  
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Auth Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_for_dev');
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection Handler
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (${socket.user.name})`);
    
    registerSocketHandlers(io, socket);
  });

  return io;
};

module.exports = { initializeSocket };
