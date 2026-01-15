const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authorize.controller');

// ==================== AUTHENTICATION ROUTES ====================

// Login/Register page
router.get('/auth', (req, res) => {
  if (req.cookies.access_token) {
    return res.redirect('/main');
  }
  res.render('authentication', { error: null, showSignup: false });
});

// Auth actions
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;