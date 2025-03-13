// server/routes/content.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/images', contentController.getImages);
router.get('/shorts', contentController.getShorts);
router.get('/films', contentController.getFilms);
router.get('/explore', contentController.exploreContent);
router.get('/:id', contentController.getContentById);

// Protected routes
router.use(authenticateToken);
router.post('/upload', upload.single('file'), contentController.uploadContent);
router.put('/:id', contentController.updateContent);
router.delete('/:id', contentController.deleteContent);
router.post('/:id/like', contentController.likeContent);
router.post('/:id/unlike', contentController.unlikeContent);
router.post('/:id/save', contentController.saveContent);
router.post('/:id/unsave', contentController.unsaveContent);

module.exports = router;