const MAX_PARTICIPANTS = 4;

class RoomStore {
  constructor() {
    // Map<roomId, Map<socketId, UserData>>
    this.rooms = new Map();
    // Map<roomId, { createdAt, hostSocketId }>
    this.roomMeta = new Map();
  }

  // Add user to room
  joinRoom(roomId, socketId, user) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Map());
      this.roomMeta.set(roomId, { createdAt: Date.now(), hostSocketId: socketId });
    }

    const room = this.rooms.get(roomId);

    // Check max participants
    if (room.size >= MAX_PARTICIPANTS && !room.has(socketId)) {
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
      joinedAt: Date.now(),
    });

    return Array.from(room.values());
  }

  // Remove user from room
  leaveRoom(roomId, socketId) {
    if (!this.rooms.has(roomId)) return null;

    const room = this.rooms.get(roomId);
    room.delete(socketId);

    // Clean up empty room (and its metadata) to avoid unbounded memory growth
    if (room.size === 0) {
      this.rooms.delete(roomId);
      this.roomMeta.delete(roomId);
    } else {
      // Reassign host if the host left, so the room always has an owner
      const meta = this.roomMeta.get(roomId);
      if (meta && meta.hostSocketId === socketId) {
        meta.hostSocketId = Array.from(room.keys())[0];
      }
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

  // Authorization helper: is this socket actually a participant of this room?
  // Used to prevent cross-room chat injection / signal spoofing.
  isMember(roomId, socketId) {
    const room = this.rooms.get(roomId);
    return !!room && room.has(socketId);
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

  getRoomMeta(roomId) {
    return this.roomMeta.get(roomId) || null;
  }

  getRoomSize(roomId) {
    return this.rooms.has(roomId) ? this.rooms.get(roomId).size : 0;
  }
}

module.exports = new RoomStore();
module.exports.MAX_PARTICIPANTS = MAX_PARTICIPANTS;
