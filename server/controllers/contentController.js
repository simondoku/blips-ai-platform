// server/controllers/contentController.js
const mongoose = require('mongoose');
const Content = require('../models/Content');
const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;
const { createCanvas } = require('canvas'); // You'll need to install this: npm install canvas
const s3Service = require('../services/s3Service');

// Get Shorts
exports.getShorts = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const shorts = await Content.find({ 
      contentType: 'short',
      isPublic: true
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username displayName profileImage');
    
    const total = await Content.countDocuments({ 
      contentType: 'short',
      isPublic: true
    });
    
    res.json({
      shorts,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get Films
exports.getFilms = async (req, res) => {
  try {
    const { category, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { contentType: 'film', isPublic: true };
    if (category && category !== 'all') {
      query.category = category;
    }
    
    const films = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username displayName profileImage');
    
    const total = await Content.countDocuments(query);
    
    res.json({
      films,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};


// Update the exploreContent method in contentController.js to include more robust filtering and sorting
exports.exploreContent = async (req, res) => {
  try {
    const { 
      sort = 'trending', 
      category, 
      tags, 
      contentType, 
      creator,
      search,
      limit = 20, 
      page = 1, 
      following = false
    } = req.query;
    
    const skip = (page - 1) * parseInt(limit);
    
    let query = { isPublic: true };
    
    // Apply category filter if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Apply content type filter if provided
    if (contentType && contentType !== 'all') {
      query.contentType = contentType;
    }
    
    // Apply tag filter if provided as a comma-separated list
    if (tags) {
      // Convert comma-separated tags to array
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }
    
    // Apply search query if provided
    if (search) {
      // Create a text search query
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }
    
    // Filter by creator username if provided
    if (creator) {
      // First find the user by username
      const creatorUser = await User.findOne({ username: creator });
      
      if (creatorUser) {
        query.creator = creatorUser._id;
      } else {
        // If user not found, return empty results
        return res.json({
          content: [],
          pagination: { total: 0, page: parseInt(page), pages: 0 }
        });
      }
    }
    
    // If following is true and user is authenticated, filter by followed creators
    if (following === 'true' && req.user) {
      const currentUser = await User.findById(req.user.id);
      if (currentUser && currentUser.following && currentUser.following.length > 0) {
        query.creator = { $in: currentUser.following };
      } else {
        // If user isn't following anyone, return empty array
        return res.json({ 
          content: [],
          pagination: { total: 0, page: parseInt(page), pages: 0 }
        });
      }
    }
    
    // Determine sort order
    let sortOptions = {};
    switch (sort) {
      case 'trending':
        sortOptions = { 'stats.views': -1, createdAt: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { 'stats.likes': -1, createdAt: -1 };
        break;
      case 'recommended':
        // For recommended, use a mix of recency, views, and likes
        sortOptions = { 
          'stats.likes': -1,
          'stats.views': -1,
          createdAt: -1
        };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    // Execute query with pagination
    const content = await Content.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username displayName profileImage');
    
    // Get total count for pagination
    const total = await Content.countDocuments(query);
    
    // Add isLiked and isSaved flags for authenticated users
    let enhancedContent = content;
    if (req.user) {
      enhancedContent = content.map(item => {
        const doc = item.toObject();
        doc.isLiked = item.likedBy.includes(req.user.id);
        doc.isSaved = item.savedBy.includes(req.user.id);
        return doc;
      });
    }
    
    res.json({
      content: enhancedContent,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in exploreContent:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Fix the getContentById method in contentController.js:

exports.getContentById = async (req, res) => {
  try {
    const contentId = req.params.id;
    
    // Check if the ID is a valid MongoDB ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(contentId);
    
    if (!isValidObjectId) {
      return res.status(400).json({ 
        message: 'Invalid content ID format', 
        error: 'ID must be a valid MongoDB ObjectId'
      });
    }
    
    // Find content without updating it first
    const content = await Content.findById(contentId)
      .populate('creator', 'username displayName profileImage bio');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Increment view count using findByIdAndUpdate instead of modifying and saving
    await Content.findByIdAndUpdate(
      contentId,
      { $inc: { 'stats.views': 1 } },
      { new: true }
    );
    
    // Find similar content
    const similar = await Content.find({
      _id: { $ne: content._id },
      contentType: content.contentType,
      $or: [
        { category: content.category },
        { tags: { $in: content.tags || [] } } // Add null check for tags
      ],
      isPublic: true
    })
      .limit(6)
      .populate('creator', 'username displayName');
    
    // Get comments if Comment model exists
    let comments = [];
    try {
      const Comment = mongoose.model('Comment');
      comments = await Comment.find({ content: content._id })
        .sort({ createdAt: -1 })
        .populate('user', 'username displayName profileImage');
    } catch (commentError) {
      // Comment model might not exist or other error, continue without comments
      console.log('Comment fetching error:', commentError.message);
    }
    
    res.json({
      content,
      similar,
      comments
    });
  } catch (error) {
    console.error('Error in getContentById:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message || 'An unknown error occurred'
    });
  }
};

// Upload Content
exports.uploadContent = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { 
      title, 
      description, 
      category, 
      tags,
      duration 
    } = req.body;
    
    // Get contentType from either the body or query parameters
    const contentType = req.body.contentType || req.query.contentType;
    
    // Validate required fields
    if (!title || !contentType) {
      // If validation fails, delete the uploaded file (only for local storage)
      if (!s3Service.isS3Enabled() && req.file.path) {
        await fs.unlink(req.file.path);
      }
      return res.status(400).json({ message: 'Title and content type are required' });
    }
    
    // Handle file URL based on storage type
    let fileUrl;
    if (s3Service.isS3Enabled()) {
      // For S3, use the location provided by multer-s3
      fileUrl = req.file.location || req.file.key;
    } else {
      // For local storage, create relative path
      fileUrl = req.file.path.split('uploads')[1]; // Normalize path for all OSes
      if (fileUrl.startsWith('/')) {
        fileUrl = fileUrl.substring(1); // Remove leading slash
      }
      fileUrl = 'uploads/' + fileUrl;
      // Ensure path uses forward slashes for consistency across platforms
      fileUrl = fileUrl.replace(/\\/g, '/');
    }

    // Handle thumbnails for video content only
    let thumbnailUrl = '';
    if (contentType === 'short' || contentType === 'film') {
      try {
        // Create a canvas with the video title as a placeholder thumbnail
        const canvas = createCanvas(640, 360); // 16:9 aspect ratio
        const ctx = canvas.getContext('2d');
        
        // Draw a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 640, 360);
        gradient.addColorStop(0, '#242435'); // blips-card
        gradient.addColorStop(1, '#6C63FF'); // blips-purple
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 640, 360);
        
        // Add content type indicator
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, 640, 60);
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(contentType === 'short' ? 'SHORT CLIP' : 'FILM', 30, 40);
        
        // Add video title (wrapped if too long)
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        
        // Wrap title if needed
        const maxLineWidth = 580;
        const words = title.split(' ');
        let line = '';
        let lines = [];
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i] + ' ';
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxLineWidth && i > 0) {
            lines.push(line);
            line = words[i] + ' ';
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        
        // Draw title (centered vertically based on number of lines)
        const lineHeight = 40;
        const totalHeight = lines.length * lineHeight;
        let y = (360 - totalHeight) / 2 + 10;
        
        lines.forEach(line => {
          ctx.fillText(line, 320, y);
          y += lineHeight;
        });
        
        // Add a play button icon
        ctx.beginPath();
        ctx.arc(320, 240, 50, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(300, 215);
        ctx.lineTo(350, 240);
        ctx.lineTo(300, 265);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Add creator name at bottom
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 300, 640, 60);
        
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Created by: ${req.user.username || 'User'}`, 610, 335);
        
        // Save the canvas as a PNG
        const buffer = canvas.toBuffer('image/png');
        
        if (s3Service.isS3Enabled()) {
          // For S3, we'll upload the thumbnail directly to S3
          // Note: You'll need to implement thumbnail upload to S3 separately
          // For now, we'll leave thumbnailUrl empty and handle it client-side
          thumbnailUrl = '';
        } else {
          // For local storage, save to local thumbnails directory
          const contentTypeDir = contentType === 'short' ? 'shorts' : 'films';
          const thumbnailDir = path.join(__dirname, '../uploads', contentTypeDir, 'thumbnails');
          
          // Create thumbnails directory if it doesn't exist
          try {
            await fs.mkdir(thumbnailDir, { recursive: true });
          } catch (mkdirErr) {
            console.error('Error creating thumbnails directory:', mkdirErr);
          }
          
          // Generate a unique thumbnail filename
          const thumbFilename = `thumb_${Date.now()}_${path.basename(req.file.originalname, path.extname(req.file.originalname))}.png`;
          const thumbnailPath = path.join(thumbnailDir, thumbFilename);
          
          await fs.writeFile(thumbnailPath, buffer);
          
          // Create a relative URL for the thumbnail
          let thumbUrl = path.relative(path.join(__dirname, '..'), thumbnailPath);
          thumbUrl = thumbUrl.replace(/\\/g, '/'); // Ensure forward slashes
          thumbnailUrl = thumbUrl;
          
          console.log('Generated thumbnail URL:', thumbnailUrl);
        }
        
      } catch (thumbError) {
        console.error('Error creating thumbnail:', thumbError);
        // If thumbnail creation fails, use a placeholder
        thumbnailUrl = '';
      }
    }
    
    // Parse tags
    const parsedTags = tags ? 
      tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : 
      [];
    
    // Create content record
    const content = new Content({
      title,
      description: description || '',
      contentType,
      fileUrl,
      thumbnailUrl,
      creator: req.user.id,
      duration: contentType === 'short' || contentType === 'film' ? parseInt(duration || 0, 10) : 0,
      category: category || 'other',
      tags: parsedTags,
      isPublic: true // Default to public
    });
    
    await content.save();
    
    // Get creator details to return with response
    const creator = await User.findById(req.user.id)
      .select('username displayName profileImage');
    
    // Format response
    const contentResponse = {
      ...content.toObject(),
      creator: {
        id: creator._id,
        username: creator.username,
        displayName: creator.displayName,
        profileImage: creator.profileImage
      }
    };
    
    res.status(201).json({
      message: 'Content uploaded successfully',
      content: contentResponse
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Delete the uploaded file if it exists and there was an error
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
      }
    }
    
    res.status(500).json({ 
      message: 'Server error during upload', 
      error: error.message 
    });
  }
};
// Update Content
exports.updateContent = async (req, res) => {
  try {
    const { title, description, category, tags, isPublic } = req.body;
    
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user is the creator
    if (content.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this content' });
    }
    
    // Update fields
    if (title) content.title = title;
    if (description) content.description = description;
    if (category) content.category = category;
    if (tags) content.tags = tags.split(',').map(tag => tag.trim());
    if (isPublic !== undefined) content.isPublic = isPublic;
    
    await content.save();
    
    res.json({
      message: 'Content updated successfully',
      content
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete Content
exports.deleteContent = async (req, res) => {
  try {
    const contentId = req.params.id;
    
    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ 
        message: 'Invalid content ID format'
      });
    }
    
    // Find the content first to check permissions and get file paths
    const content = await Content.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user is the creator
    if (content.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this content' });
    }
    
    // Store file paths before deleting the document
    const filePath = content.fileUrl;
    const thumbnailPath = content.thumbnailUrl;
    
    // Delete the content document
    const deleteResult = await Content.deleteOne({ _id: contentId });
    
    if (deleteResult.deletedCount === 0) {
      return res.status(500).json({ message: 'Failed to delete content' });
    }
    
    // Delete comments associated with the content
    try {
      const Comment = mongoose.model('Comment');
      await Comment.deleteMany({ content: contentId });
    } catch (commentError) {
      console.error('Error deleting associated comments:', commentError);
      // Continue even if comment deletion fails
    }
    
    // Delete the actual files
    try {
      if (s3Service.isS3Enabled()) {
        // Delete files from S3
        if (filePath) {
          const s3Key = s3Service.extractS3Key(filePath);
          await s3Service.deleteFile(s3Key);
        }
        
        // Delete thumbnail from S3 if it exists and is different from the main file
        if (thumbnailPath && thumbnailPath !== filePath) {
          const thumbnailS3Key = s3Service.extractS3Key(thumbnailPath);
          await s3Service.deleteFile(thumbnailS3Key);
        }
      } else {
        // Delete files from local storage
        if (filePath) {
          const absoluteFilePath = path.join(__dirname, '..', filePath);
          await fs.unlink(absoluteFilePath);
        }
        
        // Delete thumbnail if it exists and is different from the main file
        if (thumbnailPath && thumbnailPath !== filePath) {
          const absoluteThumbnailPath = path.join(__dirname, '..', thumbnailPath);
          await fs.unlink(absoluteThumbnailPath);
        }
      }
    } catch (fileError) {
      console.error('Error deleting files:', fileError);
      // We still consider the deletion successful if the database entry was removed,
      // even if file deletion failed (could be cleaned up later)
    }
    
    // Log the deletion for audit purposes
    console.log(`Content ${contentId} deleted by user ${req.user.id}`);
    
    res.json({ 
      message: 'Content deleted successfully',
      contentId
    });
  } catch (error) {
    console.error('Content deletion error:', error);
    res.status(500).json({ 
      message: 'Server error during content deletion', 
      error: error.message 
    });
  }
};

// Like Content
exports.likeContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user already liked this content
    if (content.likedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Content already liked' });
    }
    
    content.likedBy.push(req.user.id);
    content.stats.likes = content.likedBy.length;
    
    await content.save();
    
    res.json({
      message: 'Content liked successfully',
      likes: content.stats.likes
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Unlike Content
exports.unlikeContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user has liked this content
    if (!content.likedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Content not liked yet' });
    }
    
    content.likedBy = content.likedBy.filter(id => id.toString() !== req.user.id);
    content.stats.likes = content.likedBy.length;
    
    await content.save();
    
    res.json({
      message: 'Content unliked successfully',
      likes: content.stats.likes
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Save Content
exports.saveContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user already saved this content
    if (content.savedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Content already saved' });
    }
    
    content.savedBy.push(req.user.id);
    content.stats.saves = content.savedBy.length;
    
    await content.save();
    
    res.json({
      message: 'Content saved successfully',
      saves: content.stats.saves
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Unsave Content
exports.unsaveContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user has saved this content
    if (!content.savedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Content not saved yet' });
    }
    
    content.savedBy = content.savedBy.filter(id => id.toString() !== req.user.id);
    content.stats.saves = content.savedBy.length;
    
    await content.save();
    
    res.json({
      message: 'Content unsaved successfully',
      saves: content.stats.saves
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Share Content
exports.shareContent = async (req, res) => {
  try {
    const { platform } = req.body;
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Increment share count
    content.stats.shares += 1;
    await content.save();
    
    res.json({
      message: 'Content shared successfully',
      shares: content.stats.shares
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Download Content
exports.downloadContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    if (s3Service.isS3Enabled()) {
      // For S3, generate a signed URL for download
      try {
        const s3Key = s3Service.extractS3Key(content.fileUrl);
        const signedUrl = await s3Service.getSignedUrl(s3Key, 3600); // 1 hour expiration
        
        // Increment download count
        content.stats.downloads = (content.stats.downloads || 0) + 1;
        await content.save();
        
        // Redirect to the signed URL
        res.json({
          downloadUrl: signedUrl,
          filename: path.basename(content.fileUrl)
        });
      } catch (s3Error) {
        console.error('S3 download error:', s3Error);
        return res.status(500).json({ message: 'Failed to generate download link' });
      }
    } else {
      // For local storage, stream the file directly
      const filePath = path.join(__dirname, '..', content.fileUrl);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch (err) {
        return res.status(404).json({ message: 'File not found' });
      }
      
      // Set appropriate headers for download
      const filename = path.basename(filePath);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Stream the file to the client
      const fileStream = require('fs').createReadStream(filePath);
      fileStream.pipe(res);
      
      // Increment download count
      content.stats.downloads = (content.stats.downloads || 0) + 1;
      await content.save();
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get Stream URL (for S3 signed URLs)
exports.getStreamUrl = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    if (s3Service.isS3Enabled()) {
      // For S3, generate a signed URL for streaming
      try {
        const s3Key = s3Service.extractS3Key(content.fileUrl);
        const signedUrl = await s3Service.getSignedUrl(s3Key, 3600); // 1 hour expiration
        
        res.json({
          streamUrl: signedUrl,
          expiresIn: 3600
        });
      } catch (s3Error) {
        console.error('S3 stream URL error:', s3Error);
        return res.status(500).json({ message: 'Failed to generate stream URL' });
      }
    } else {
      // For local storage, return the direct file URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const streamUrl = `${baseUrl}/${content.fileUrl}`;
      
      res.json({
        streamUrl: streamUrl,
        expiresIn: null // Local URLs don't expire
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};