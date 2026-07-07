/**
 * Minimal fixed-window rate limiter for Socket.IO events.
 * No external dependency needed for this scale of app; a Map is cleaned up
 * on socket disconnect so it can't grow unbounded.
 */
class SocketRateLimiter {
  constructor() {
    // Map<socketId, Map<eventName, { count, windowStart }>>
    this.hits = new Map();
  }

  /**
   * Returns true if the call is allowed, false if it should be dropped.
   */
  allow(socketId, eventName, { limit, windowMs }) {
    const now = Date.now();
    if (!this.hits.has(socketId)) {
      this.hits.set(socketId, new Map());
    }
    const socketHits = this.hits.get(socketId);
    const entry = socketHits.get(eventName);

    if (!entry || now - entry.windowStart >= windowMs) {
      socketHits.set(eventName, { count: 1, windowStart: now });
      return true;
    }

    if (entry.count < limit) {
      entry.count += 1;
      return true;
    }

    return false;
  }

  clear(socketId) {
    this.hits.delete(socketId);
  }
}

// Per-event limits, tuned for a small (<=4 participant) meeting.
const LIMITS = {
  'join-room': { limit: 5, windowMs: 10_000 },
  'leave-room': { limit: 5, windowMs: 10_000 },
  signal: { limit: 60, windowMs: 10_000 }, // ICE candidates can be chatty
  'media-state-change': { limit: 30, windowMs: 10_000 },
  'chat-message': { limit: 10, windowMs: 10_000 },
};

module.exports = { SocketRateLimiter, LIMITS };
