require('dotenv').config();
const http = require('http');
const app = require('./app');
const config = require('./config/env');

const PORT = config.PORT;
const server = http.createServer(app);

const { initializeSocket } = require('./socket');
const io = initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown: stop accepting new connections, let Socket.IO close its
// clients cleanly, and only then exit. Without this, a rolling deploy or
// container restart (SIGTERM) kills in-flight requests and open sockets
// abruptly instead of letting clients see a clean disconnect.
const shutdown = (signal) => {
  console.log(`\n${signal} received: closing server gracefully...`);
  io.close(() => {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });

  // Safety net in case something hangs (e.g. a stuck connection).
  setTimeout(() => {
    console.error('Forcing shutdown after timeout.');
    process.exit(1);
  }, 10_000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
