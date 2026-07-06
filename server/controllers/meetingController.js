const roomStore = require('../socket/roomStore');

const validateMeeting = (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Meeting ID is required' });
    }

    // Since meetings are ephemeral, if a room doesn't exist yet, it's valid to create
    // We only need to check if it's full
    if (roomStore.rooms.has(id)) {
      const room = roomStore.rooms.get(id);
      if (room.size >= 4) {
        return res.status(403).json({ 
          success: false, 
          message: 'Meeting is full. This meeting supports a maximum of 4 participants.' 
        });
      }
    }

    res.status(200).json({ success: true, message: 'Meeting is valid' });
  } catch (error) {
    console.error('Validate meeting error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  validateMeeting
};
