// server/scripts/test-s3.js

// Load environment variables first
try {
  require('dotenv').config();
} catch (error) {
  console.log('No .env file found, using environment variables');
}

const { s3Client, s3Config } = require('../config/s3');
const s3Service = require('../services/s3Service');

async function testS3Configuration() {
  console.log('🔧 Testing S3 Configuration...\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('- STORAGE_TYPE:', process.env.STORAGE_TYPE || 'local');
  console.log('- AWS_REGION:', process.env.AWS_REGION || 'not set');
  console.log('- AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET || 'not set');
  console.log('- AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ set' : '✗ not set');
  console.log('- AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ set' : '✗ not set');
  console.log('');
  
  // Check if S3 is enabled
  console.log('S3 Service Status:');
  console.log('- S3 Enabled:', s3Service.isS3Enabled());
  console.log('- Bucket:', s3Config.bucket || 'not configured');
  console.log('- Region:', s3Config.region);
  console.log('');
  
  if (s3Service.isS3Enabled()) {
    try {
      // Test S3 connection by listing bucket
      const { ListObjectsV2Command } = require('@aws-sdk/client-s3');
      const command = new ListObjectsV2Command({
        Bucket: s3Config.bucket,
        MaxKeys: 1
      });
      
      console.log('🔍 Testing S3 Connection...');
      const response = await s3Client.send(command);
      console.log('✅ S3 Connection Successful!');
      console.log(`- Bucket exists and is accessible`);
      console.log(`- Objects in bucket: ${response.KeyCount || 0} (showing max 1)`);
      
    } catch (error) {
      console.error('❌ S3 Connection Failed:');
      console.error('Error:', error.message);
      
      if (error.name === 'NoSuchBucket') {
        console.error('🚨 Bucket does not exist or wrong name');
      } else if (error.name === 'AccessDenied') {
        console.error('🚨 Access denied - check IAM permissions');
      } else if (error.name === 'InvalidAccessKeyId') {
        console.error('🚨 Invalid access key ID');
      } else if (error.name === 'SignatureDoesNotMatch') {
        console.error('🚨 Invalid secret access key');
      }
    }
  } else {
    console.log('ℹ️  S3 is disabled - using local storage');
    console.log('To enable S3, set STORAGE_TYPE=s3 in your .env file');
  }
  
  console.log('\n📝 Next Steps:');
  if (!s3Service.isS3Enabled()) {
    console.log('1. Copy .env.example to .env');
    console.log('2. Set STORAGE_TYPE=s3');
    console.log('3. Add your AWS credentials and bucket information');
    console.log('4. Run this test again');
  } else {
    console.log('1. Your S3 configuration looks good!');
    console.log('2. Try uploading a video through the platform');
    console.log('3. Check your S3 bucket for uploaded files');
  }
}

// Run the test
if (require.main === module) {
  testS3Configuration()
    .then(() => {
      console.log('\n✨ S3 configuration test completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed with error:', error);
      process.exit(1);
    });
}

module.exports = testS3Configuration;
