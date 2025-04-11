// server/routes/feedback.js
const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, optionalAuthToken } = require('../middleware/auth');

// Public route - allow both authenticated and anonymous users
// The optionalAuthToken middleware will set req.user if a valid token is provided
router.post('/submit', optionalAuthToken, feedbackController.submitFeedback);

// Protected routes - authenticated users only
router.use(authenticateToken);
router.get('/user', feedbackController.getUserFeedback);

// Admin routes
router.get('/all', feedbackController.getAllFeedback);
router.put('/:id', feedbackController.updateFeedbackStatus);
router.post('/test-email', feedbackController.testEmailConfig);

module.exports = router;