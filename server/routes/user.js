// server/routes/user.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protected routes
router.use(authenticateToken);
router.put('/profile', upload.single('profileImage'), userController.updateProfile);
router.get('/content', userController.getUserContent);
router.post('/follow/:userId', userController.followUser);
router.post('/unfollow/:userId', userController.unfollowUser);
router.get('/saved', userController.getSavedContent);
router.get('/liked', userController.getLikedContent);

// Public routes - must be after all other specific routes to avoid conflicts
router.get('/:username', userController.getUserProfile);

module.exports = router;