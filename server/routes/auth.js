// server/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Test route for CORS debugging
router.options('/register', (req, res) => {
  res.status(200).end();
});

// Add a simple test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/user', authenticateToken, authController.getCurrentUser);

module.exports = router;