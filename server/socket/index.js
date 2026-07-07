const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const config = require('../config/env');
const { registerSocketHandlers } = require('./handlers');

const initializeSocket = (httpServer) => {
  const allowedOrigins = config.CLIENT_URL ? config.CLIENT_URL.split(',') : ['http://localhost:5173'];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Bounds any single incoming packet (e.g. a chat message or signaling
    // payload) to 100KB so a malicious/misbehaving client can't send an
    // oversized frame to exhaust server memory. Well above real payloads —
    // chat is capped at 1000 chars server-side and SDP/ICE signals are a
    // few KB at most.
    maxHttpBufferSize: 1e5,
  });

  // Auth Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
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
