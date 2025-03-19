// server/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = ['images', 'shorts', 'films'].map(dir => 
    path.join(__dirname, '../uploads', dir)
  );
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Determine directory based on content type with default fallback
    const contentType = req.query.contentType || 'image';
    let uploadDir;
    
    switch(contentType) {
      case 'image':
        uploadDir = path.join(__dirname, '../uploads/images');
        break;
      case 'short':
        uploadDir = path.join(__dirname, '../uploads/shorts');
        break;
      case 'film':
        uploadDir = path.join(__dirname, '../uploads/films');
        break;
      default:
        uploadDir = path.join(__dirname, '../uploads/images');
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    
    // If req.user is undefined, use a default ID
    const userId = req.user ? req.user.id : 'anonymous';
    
    cb(null, userId + '-' + uniqueSuffix + ext);
  }
});

// Modify the fileFilter function to make contentType optional and infer from mimetype
const fileFilter = (req, file, cb) => {
  // Get contentType from query parameters or infer from mimetype
  let contentType = req.query.contentType;
  
  // If no contentType is specified, try to infer it from the file mimetype
  if (!contentType) {
    if (file.mimetype.startsWith('image/')) {
      contentType = 'image';
      req.query.contentType = 'image'; // Set it for later use
    } else if (file.mimetype.startsWith('video/')) {
      contentType = 'short'; // Default to short if video
      req.query.contentType = 'short'; // Set it for later use
    } else {
      return cb(new Error('Could not determine content type from file'), false);
    }
  }
  
  // Now validate the file mimetype against the content type
  if (contentType === 'image') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for image content type'), false);
    }
  } else if (contentType === 'short' || contentType === 'film') {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed for video content types'), false);
    }
  } else {
    return cb(new Error('Invalid content type'), false);
  }
  
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

module.exports = upload;