const roomStore = require('./roomStore');

const registerSocketHandlers = (io, socket) => {
  const user = socket.user; // Added by auth middleware

  socket.on('join-room', ({ roomId }) => {
    try {
      // Add to store
      const allUsers = roomStore.joinRoom(roomId, socket.id, user);
      
      // Join socket room
      socket.join(roomId);
      
      const currentUser = allUsers.find(u => u.id === socket.id);
      
      // Send existing users to the user who just joined
      const existingUsers = allUsers.filter(u => u.id !== socket.id);
      socket.emit('room-joined', { users: existingUsers });
      
      // Notify others in room
      socket.to(roomId).emit('user-joined', { user: currentUser });
      
    } catch (error) {
      if (error.message === 'ROOM_FULL') {
        socket.emit('room-error', { message: 'Meeting is full. This meeting supports a maximum of 4 participants.' });
      } else {
        console.error('Join room error:', error);
      }
    }
  });

  socket.on('leave-room', ({ roomId }) => {
    handleLeaveRoom(io, socket, roomId);
  });

  // WebRTC Signaling
  socket.on('signal', ({ to, signal }) => {
    socket.to(to).emit('signal', {
      from: socket.id,
      signal
    });
  });

  // Media state toggle (mic/cam/screen)
  socket.on('media-state-change', ({ roomId, state }) => {
    const updatedUser = roomStore.updateMediaState(roomId, socket.id, state);
    if (updatedUser) {
      socket.to(roomId).emit('user-media-changed', {
        userId: socket.id,
        state
      });
    }
  });

  // Chat
  socket.on('chat-message', ({ roomId, text }) => {
    const message = {
      id: Date.now().toString(),
      text,
      senderId: socket.id,
      senderName: user.name,
      timestamp: new Date().toISOString()
    };
    
    // Broadcast to everyone in room including sender
    io.to(roomId).emit('chat-message', message);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    const activeRooms = roomStore.getRoomsForSocket(socket.id);
    activeRooms.forEach(roomId => {
      handleLeaveRoom(io, socket, roomId);
    });
  });
};

const handleLeaveRoom = (io, socket, roomId) => {
  socket.leave(roomId);
  roomStore.leaveRoom(roomId, socket.id);
  
  // Notify remaining users
  io.to(roomId).emit('user-left', { userId: socket.id });
};

module.exports = { registerSocketHandlers };
