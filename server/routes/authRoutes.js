const express = require('express');
const { googleLogin } = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validate');
const { authLimiter } = require('../middlewares/rateLimiter');
const { googleLoginBodySchema } = require('../validators/schemas');

const router = express.Router();

router.post('/google', authLimiter, validate({ body: googleLoginBodySchema }), googleLogin);

// Example protected route for verification
router.get('/me', requireAuth, (req, res) => {
  res.status(200).json({
    success: true,
    data: { user: req.user }
  });
});

module.exports = router;
