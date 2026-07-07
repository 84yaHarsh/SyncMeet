const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const config = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoutes');
const { errorHandler } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

const app = express();

// Trust the first hop in front of this server (reverse proxy / load
// balancer, e.g. Nginx, Render, Heroku). Must be set before any middleware
// that relies on req.ip (rate limiters), or every client behind the proxy
// gets rate-limited as if it were a single IP. In local dev there is no
// proxy in front of the server, so this has no effect there — Express
// simply falls back to the direct socket address when X-Forwarded-For is
// absent.
app.set('trust proxy', 1);

const allowedOrigins = config.CLIENT_URL ? config.CLIENT_URL.split(',') : ['http://localhost:5173'];

// Security headers. CSP is scoped to allow the Google Identity Services
// script/frame (accounts.google.com) used by @react-oauth/google on the
// client, plus Google profile picture images. COEP is disabled because
// `require-corp` breaks the Google OAuth popup/postMessage flow.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://accounts.google.com/gsi/client'],
        frameSrc: ["'self'", 'https://accounts.google.com'],
        connectSrc: ["'self'", 'https://accounts.google.com'],
        imgSrc: ["'self'", 'data:', 'https://lh3.googleusercontent.com', 'https://*.googleusercontent.com'],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Default 'same-origin' COOP isolates the browsing context group and can
    // silently block the postMessage handshake the Google Identity Services
    // popup/GSI flow relies on. 'same-origin-allow-popups' keeps the
    // isolation benefit for same-origin popups we open ourselves while still
    // allowing the OAuth popup to communicate back.
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  })
);

app.use(compression());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// Body size limit: our largest legitimate JSON body is the Google ID token
// (~1-2KB); capping well above that blunts oversized-payload abuse.
app.use(express.json({ limit: '10kb' }));

// Blanket rate limit on all API routes; auth has its own tighter limiter.
app.use('/api', generalLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use(errorHandler);

module.exports = app;
