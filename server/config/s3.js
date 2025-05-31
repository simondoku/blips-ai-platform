// server/config/s3.js
const { S3Client } = require('@aws-sdk/client-s3');

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// S3 configuration
const s3Config = {
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION || 'us-east-1',
  signedUrlExpires: 60 * 60, // 1 hour
};

module.exports = {
  s3Client,
  s3Config,
};
