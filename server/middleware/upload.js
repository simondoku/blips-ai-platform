// server/middleware/upload.js
const multer = require('multer');
const path = require('path');

// For development, we'll store files locally
// In production, you would use AWS S3 or another cloud storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const { contentType } = req.body;
  
  if (contentType === 'image') {
    // Accept only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
  } else if (contentType === 'short' || contentType === 'film') {
    // Accept only video files
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed!'), false);
    }
  } else {
    return cb(new Error('Invalid content type!'), false);
  }
  
  cb(null, true);
};

// Set up multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
  }
});

module.exports = upload;