const rateLimit = require('express-rate-limit');

// General API limiter: generous, just to blunt abusive scripting.
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

// Auth endpoint is a higher-value target (Google token verification is not free),
// so it gets a tighter limit.
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again shortly.' },
});

module.exports = { generalLimiter, authLimiter };
