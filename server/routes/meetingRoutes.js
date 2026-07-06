const express = require('express');
const { validateMeeting } = require('../controllers/meetingController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/:id/validate', requireAuth, validateMeeting);

module.exports = router;
