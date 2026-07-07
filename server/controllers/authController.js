const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Token is required' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    // Check if the payload exists
    if (!payload) {
      return res.status(401).json({ success: false, message: 'Invalid token payload' });
    }

    const { sub: googleId, email, name, picture } = payload;

    // Issue JWT for the application
    const appToken = jwt.sign(
      { googleId, email, name, picture },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      data: {
        user: { googleId, email, name, picture },
        token: appToken
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
};

module.exports = {
  googleLogin
};
