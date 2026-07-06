class RoomStore {
  constructor() {
    // Map<roomId, Map<socketId, UserData>>
    this.rooms = new Map();
  }

  // Add user to room
  joinRoom(roomId, socketId, user) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
    }

    const room = this.rooms.get(roomId);
    
    // Check max participants (4)
    if (room.size >= 4 && !room.has(socketId)) {
      throw new Error('ROOM_FULL');
    }

    room.set(socketId, {
      id: socketId,
      userId: user.googleId,
      name: user.name,
      picture: user.picture,
      isAudioMuted: false,
      isVideoOff: false,
      isScreenSharing: false,
      joinedAt: Date.now()
    });

    return Array.from(room.values());
  }

  // Remove user from room
  leaveRoom(roomId, socketId) {
    if (!this.rooms.has(roomId)) return null;

    const room = this.rooms.get(roomId);
    room.delete(socketId);

    // Clean up empty room
    if (room.size === 0) {
      this.rooms.delete(roomId);
    }

    return Array.from(room.values());
  }

  // Find all rooms a socket is in
  getRoomsForSocket(socketId) {
    const activeRooms = [];
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.has(socketId)) {
        activeRooms.push(roomId);
      }
    }
    return activeRooms;
  }

  // Update media state
  updateMediaState(roomId, socketId, { isAudioMuted, isVideoOff, isScreenSharing }) {
    if (!this.rooms.has(roomId)) return null;
    
    const room = this.rooms.get(roomId);
    if (!room.has(socketId)) return null;

    const user = room.get(socketId);
    
    if (isAudioMuted !== undefined) user.isAudioMuted = isAudioMuted;
    if (isVideoOff !== undefined) user.isVideoOff = isVideoOff;
    if (isScreenSharing !== undefined) user.isScreenSharing = isScreenSharing;

    return user;
  }

  getRoomUsers(roomId) {
    if (!this.rooms.has(roomId)) return [];
    return Array.from(this.rooms.get(roomId).values());
  }
}

module.exports = new RoomStore();
