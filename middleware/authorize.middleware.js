const { admin } = require('../config/firebase');

/**
 * Middleware to verify Firebase ID token from cookies.
 * If valid, attaches decoded user token to req.user.
 * If invalid or expired, clears cookie and redirects to login.
 */
const verifyToken = async (req, res, next) => {
  const idToken = req.cookies.access_token;
  if (!idToken) {
    return res.redirect('/auth');
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    // Clear expired or invalid token
    res.clearCookie('access_token');
    if (error.code === 'auth/id-token-expired') {
      console.log('Token expired, redirecting to login');
    } else {
      console.error('Error verifying token:', error.code);
    }
    res.redirect('/auth');
  }
};

module.exports = verifyToken;