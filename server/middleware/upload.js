// server/middleware/upload.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create upload directories if they don't exist
const createUploadDirs = () => {
  const dirs = [
    'images', 
    'shorts', 
    'films', 
    'thumbnails',
    'profiles' // Add profiles directory for user profile images
  ].map(dir => 
    path.join(__dirname, '../uploads', dir)
  );
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// For local storage
const createLocalStorage = () => {
  createUploadDirs();
  
  return multer.diskStorage({
    destination: function(req, file, cb) {
      // Check if this is a profile image upload
      if (file.fieldname === 'profileImage') {
        const uploadDir = path.join(__dirname, '../uploads/profiles');
        return cb(null, uploadDir);
      }
      
      // For content uploads, determine directory based on content type with default fallback
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
};

// Alternate implementation for S3 storage when deployed to Vercel
const createS3Storage = () => {
  // This implementation would be used in production with Vercel
  // Uncomment and complete when deploying to Vercel with AWS credentials
  try {
    // Check if required packages are installed
    const { S3Client } = require('@aws-sdk/client-s3');
    const multerS3 = require('multer-s3');
    
    console.log('Using AWS S3 storage for uploads');
    
    const s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    return multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET,
      acl: 'public-read',
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const contentType = req.query.contentType || 'image';
        let folder;
        
        switch(contentType) {
          case 'image':
            folder = 'images';
            break;
          case 'short':
            folder = 'shorts';
            break;
          case 'film':
            folder = 'films';
            break;
          default:
            folder = 'images';
        }
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const userId = req.user ? req.user.id : 'anonymous';
        
        cb(null, `${folder}/${userId}-${uniqueSuffix}${ext}`);
      }
    });
  } catch (error) {
    console.log('S3 storage setup failed, falling back to local storage:', error.message);
    return createLocalStorage();
  }
};

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
  
  // Special case for profile images 
  if (file.fieldname === 'profileImage') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed for profile pictures'), false);
    }
    return cb(null, true);
  }
  
  // For other content, validate the file mimetype against the content type
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

// Choose storage strategy based on environment
const storage = process.env.NODE_ENV === 'production' && 
                process.env.AWS_S3_BUCKET && 
                process.env.AWS_ACCESS_KEY_ID && 
                process.env.AWS_SECRET_ACCESS_KEY
  ? createS3Storage()
  : createLocalStorage();

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: process.env.NODE_ENV === 'production' ? 25 * 1024 * 1024 : 100 * 1024 * 1024, // 25MB in prod, 100MB in dev
  }
});

module.exports = upload;