const express = require('express');
const { googleLogin } = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/google', googleLogin);

// Example protected route for verification
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user }
  });
});

module.exports = router;
