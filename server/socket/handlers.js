const crypto = require('crypto');
const roomStore = require('./roomStore');
const { SocketRateLimiter, LIMITS } = require('./rateLimiter');
const {
  joinRoomSchema,
  leaveRoomSchema,
  signalSchema,
  mediaStateChangeSchema,
  chatMessageSchema,
} = require('../validators/schemas');

const rateLimiter = new SocketRateLimiter();

// Wraps a handler with rate limiting + Zod validation so every event goes
// through the same guardrails without repeating boilerplate.
const guardedHandler = (socket, eventName, schema, handler) => (payload) => {
  const limits = LIMITS[eventName];
  if (limits && !rateLimiter.allow(socket.id, eventName, limits)) {
    socket.emit('rate-limited', { event: eventName, message: 'Slow down — too many requests.' });
    return;
  }

  let data = payload;
  if (schema) {
    const result = schema.safeParse(payload);
    if (!result.success) {
      socket.emit('validation-error', {
        event: eventName,
        message: 'Invalid payload',
      });
      return;
    }
    data = result.data;
  }

  try {
    handler(data);
  } catch (error) {
    console.error(`Socket handler error [${eventName}]:`, error);
  }
};

const registerSocketHandlers = (io, socket) => {
  const user = socket.user; // Added by auth middleware

  socket.on(
    'join-room',
    guardedHandler(socket, 'join-room', joinRoomSchema, ({ roomId }) => {
      try {
        // Add to store
        const allUsers = roomStore.joinRoom(roomId, socket.id, user);

        // Join socket room
        socket.join(roomId);

        const currentUser = allUsers.find((u) => u.id === socket.id);

        // Send existing users to the user who just joined
        const existingUsers = allUsers.filter((u) => u.id !== socket.id);
        socket.emit('room-joined', { users: existingUsers });

        // Notify others in room
        socket.to(roomId).emit('user-joined', { user: currentUser });
      } catch (error) {
        if (error.message === 'ROOM_FULL') {
          socket.emit('room-error', {
            message: 'Meeting is full. This meeting supports a maximum of 4 participants.',
          });
        } else {
          console.error('Join room error:', error);
          socket.emit('room-error', { message: 'Could not join the meeting. Please try again.' });
        }
      }
    })
  );

  socket.on(
    'leave-room',
    guardedHandler(socket, 'leave-room', leaveRoomSchema, ({ roomId }) => {
      handleLeaveRoom(io, socket, roomId);
    })
  );

  // WebRTC Signaling
  socket.on(
    'signal',
    guardedHandler(socket, 'signal', signalSchema, ({ to, signal }) => {
      // Authorization: only relay signaling data between sockets that share
      // an active room. Without this check, any authenticated socket could
      // blind-signal an arbitrary socket ID.
      const sharedRoom = roomStore.getRoomsForSocket(socket.id).find((roomId) =>
        roomStore.isMember(roomId, to)
      );

      if (!sharedRoom) {
        console.warn(`Blocked signal from ${socket.id} to ${to}: no shared room`);
        return;
      }

      socket.to(to).emit('signal', {
        from: socket.id,
        signal,
      });
    })
  );

  // Media state toggle (mic/cam/screen)
  socket.on(
    'media-state-change',
    guardedHandler(socket, 'media-state-change', mediaStateChangeSchema, ({ roomId, state }) => {
      const updatedUser = roomStore.updateMediaState(roomId, socket.id, state);
      if (updatedUser) {
        socket.to(roomId).emit('user-media-changed', {
          userId: socket.id,
          state,
        });
      }
    })
  );

  // Chat
  socket.on(
    'chat-message',
    guardedHandler(socket, 'chat-message', chatMessageSchema, ({ roomId, text }) => {
      // Authorization: only members of the room can send/receive its chat.
      if (!roomStore.isMember(roomId, socket.id)) {
        console.warn(`Blocked chat-message from ${socket.id}: not a member of room ${roomId}`);
        return;
      }

      const message = {
        id: crypto.randomUUID(),
        text,
        senderId: socket.id,
        senderName: user.name,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to everyone in room including sender
      io.to(roomId).emit('chat-message', message);
    })
  );

  // Handle disconnect
  socket.on('disconnect', () => {
    const activeRooms = roomStore.getRoomsForSocket(socket.id);
    activeRooms.forEach((roomId) => {
      handleLeaveRoom(io, socket, roomId);
    });
    rateLimiter.clear(socket.id);
  });
};

const handleLeaveRoom = (io, socket, roomId) => {
  socket.leave(roomId);
  roomStore.leaveRoom(roomId, socket.id);

  // Notify remaining users
  io.to(roomId).emit('user-left', { userId: socket.id });
};

module.exports = { registerSocketHandlers };
