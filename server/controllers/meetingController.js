const roomStore = require('../socket/roomStore');
const config = require('../config/env');

const validateMeeting = (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Meeting ID is required' });
    }

    // Since meetings are ephemeral, if a room doesn't exist yet, it's valid to create.
    // This is a UX pre-check only — the socket layer (roomStore.joinRoom) is the
    // authoritative enforcement point and re-checks capacity itself.
    if (roomStore.rooms.has(id)) {
      const size = roomStore.getRoomSize(id);
      if (size >= roomStore.MAX_PARTICIPANTS) {
        return res.status(403).json({
          success: false,
          message: `Meeting is full. This meeting supports a maximum of ${roomStore.MAX_PARTICIPANTS} participants.`
        });
      }
    }

    res.status(200).json({ success: true, message: 'Meeting is valid' });
  } catch (error) {
    console.error('Validate meeting error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Returns STUN + (optionally) TURN server configuration for WebRTC ICE
// negotiation. Kept server-side and behind auth so TURN credentials are
// never bundled into the client's shipped JS.
const getIceServers = (req, res) => {
  try {
    const iceServers = config.getIceServers();
    res.status(200).json({ success: true, data: { iceServers } });
  } catch (error) {
    console.error('Get ICE servers error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  validateMeeting,
  getIceServers
};
