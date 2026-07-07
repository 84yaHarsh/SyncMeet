/**
 * Centralized environment configuration.
 * Fails fast on boot if a required secret is missing instead of silently
 * falling back to an insecure default (previously: JWT_SECRET had a
 * hardcoded fallback of 'fallback_secret_for_dev').
 */

const REQUIRED_VARS = ['JWT_SECRET', 'GOOGLE_CLIENT_ID'];

const missing = REQUIRED_VARS.filter((key) => !process.env[key] || !process.env[key].trim());

if (missing.length > 0) {
  // Intentionally loud + fatal. An app that "works" with a guessable/default
  // JWT secret is worse than an app that refuses to start.
  console.error(
    `\n[FATAL] Missing required environment variable(s): ${missing.join(', ')}.\n` +
    'Set them in server/.env before starting the server. Refusing to start ' +
    'with an insecure default.\n'
  );
  process.exit(1);
}

const parseList = (value) =>
  (value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

/**
 * Builds the ICE server list (STUN + optional TURN) from environment
 * variables. TURN credentials live server-side only and are handed to
 * authenticated clients via /api/meetings/ice-servers, rather than being
 * baked into the client bundle.
 */
const buildIceServers = () => {
  const stunUrls = parseList(process.env.STUN_URLS) || [];
  const iceServers = [
    {
      urls: stunUrls.length
        ? stunUrls
        : [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
          ],
    },
  ];

  const turnUrls = parseList(process.env.TURN_URLS);
  if (turnUrls.length > 0 && process.env.TURN_USERNAME && process.env.TURN_CREDENTIAL) {
    iceServers.push({
      urls: turnUrls,
      username: process.env.TURN_USERNAME,
      credential: process.env.TURN_CREDENTIAL,
    });
  }

  return iceServers;
};

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  getIceServers: buildIceServers,
};
