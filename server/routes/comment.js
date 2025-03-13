// server/routes/comment.js
const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

// Get comments for content
router.get('/content/:contentId', commentController.getComments);

// Protected routes
router.use(authenticateToken);
router.post('/content/:contentId', commentController.addComment);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);
router.post('/:id/like', commentController.likeComment);
router.post('/:id/unlike', commentController.unlikeComment);

module.exports = router;