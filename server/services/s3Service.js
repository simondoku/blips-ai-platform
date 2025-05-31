// server/services/s3Service.js
const { GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { s3Client, s3Config } = require('../config/s3');

class S3Service {
  /**
   * Generate a signed URL for accessing a file in S3
   * @param {string} key - The S3 object key
   * @param {number} expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} - Signed URL
   */
  async getSignedUrl(key, expiresIn = s3Config.signedUrlExpires) {
    try {
      const command = new GetObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      console.error('Error generating signed URL:', error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   * @param {string} key - The S3 object key
   * @returns {Promise<boolean>} - Success status
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: s3Config.bucket,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      throw error;
    }
  }

  /**
   * Extract S3 key from file path/URL
   * @param {string} filePath - The file path or URL
   * @returns {string} - S3 key
   */
  extractS3Key(filePath) {
    if (filePath.includes('amazonaws.com')) {
      // Extract key from S3 URL
      const url = new URL(filePath);
      return url.pathname.substring(1); // Remove leading slash
    }
    return filePath; // Already a key
  }

  /**
   * Check if we're using S3 storage
   * @returns {boolean}
   */
  isS3Enabled() {
    return process.env.STORAGE_TYPE === 's3';
  }

  /**
   * Get the public URL for a file (for S3, returns the S3 URL)
   * @param {string} key - The S3 object key
   * @returns {string} - Public S3 URL
   */
  getPublicUrl(key) {
    return `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${key}`;
  }
}

module.exports = new S3Service();
