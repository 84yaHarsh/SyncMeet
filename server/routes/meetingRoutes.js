const express = require('express');
const { validateMeeting, getIceServers } = require('../controllers/meetingController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { meetingParamsSchema } = require('../validators/schemas');

const router = express.Router();

router.get('/ice-servers', requireAuth, getIceServers);
router.get('/:id/validate', requireAuth, validate({ params: meetingParamsSchema }), validateMeeting);

module.exports = router;
