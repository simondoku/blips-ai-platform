// server/middleware/upload.js
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const fs = require('fs');
const { s3Client, s3Config } = require('../config/s3');

// Check if we're using S3 or local storage
const useS3 = process.env.STORAGE_TYPE === 's3';

// Create upload directories if they don't exist (only for local storage)
const createUploadDirs = () => {
  if (useS3) return; // Skip if using S3
  
  const dirs = [
    'shorts', 
    'films',
    'thumbnails'
  ].map(dir => 
    path.join(__dirname, '../uploads', dir)
  );
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Configure storage based on environment
const storage = useS3 ? 
  // S3 Storage Configuration
  multerS3({
    s3: s3Client,
    bucket: s3Config.bucket,
    acl: 'private', // Keep files private, use signed URLs for access
    key: function(req, file, cb) {
      // Determine directory based on content type with default fallback
      const contentType = req.query.contentType || 'short';
      const userId = req.user ? req.user.id : 'anonymous';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      
      let folder;
      switch(contentType) {
        case 'short':
          folder = 'shorts';
          break;
        case 'film':
          folder = 'films';
          break;
        default:
          folder = 'shorts';
      }
      
      const key = `${folder}/${userId}-${uniqueSuffix}${ext}`;
      cb(null, key);
    },
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function(req, file, cb) {
      cb(null, {
        originalName: file.originalname,
        uploadedBy: req.user ? req.user.id : 'anonymous',
        contentType: req.query.contentType || 'short'
      });
    }
  }) :
  // Local Storage Configuration
  multer.diskStorage({
    destination: function(req, file, cb) {
      // Determine directory based on content type with default fallback
      const contentType = req.query.contentType || 'short';
      let uploadDir;
      
      switch(contentType) {
        case 'short':
          uploadDir = path.join(__dirname, '../uploads/shorts');
          break;
        case 'film':
          uploadDir = path.join(__dirname, '../uploads/films');
          break;
        default:
          uploadDir = path.join(__dirname, '../uploads/shorts');
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

// Modify the fileFilter function to only accept video files
const fileFilter = (req, file, cb) => {
  // Get contentType from query parameters or infer from mimetype
  let contentType = req.query.contentType;
  
  // If no contentType is specified, try to infer it from the file mimetype
  if (!contentType) {
    if (file.mimetype.startsWith('video/')) {
      contentType = 'short'; // Default to short if video
      req.query.contentType = 'short'; // Set it for later use
    } else {
      return cb(new Error('Only video files are allowed'), false);
    }
  }
  
  // Validate that only video files are accepted
  if (contentType === 'short' || contentType === 'film') {
    if (!file.mimetype.startsWith('video/')) {
      return cb(new Error('Only video files are allowed for video content types'), false);
    }
  } else {
    return cb(new Error('Invalid content type - only video content is supported'), false);
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