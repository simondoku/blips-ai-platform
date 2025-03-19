// server/controllers/contentController.js
const mongoose = require('mongoose');
const Content = require('../models/Content');
const User = require('../models/User');
const path = require('path');
const fs = require('fs').promises;
const { createCanvas } = require('canvas'); // You'll need to install this: npm install canvas

// Get Images
exports.getImages = async (req, res) => {
  try {
    const { category, limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { contentType: 'image', isPublic: true };
    if (category && category !== 'for-you') {
      query.category = category;
    }
    
    const images = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username displayName profileImage');
    
    const total = await Content.countDocuments(query);
    
    res.json({
      images,
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

// Explore Content
exports.exploreContent = async (req, res) => {
  try {
    const { sort = 'trending', category, tag, limit = 20, page = 1, following } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublic: true };
    
    // Apply category filter if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Apply tag filter if provided
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // If following is true and user is authenticated, filter by followed creators
    if (following === 'true' && req.user) {
      // This assumes you have a User model with a 'following' array
      // You'll need to adapt this to your actual data model
      const User = require('../models/User');
      const currentUser = await User.findById(req.user.id);
      if (currentUser && currentUser.following && currentUser.following.length > 0) {
        query.creator = { $in: currentUser.following };
      } else {
        // If user isn't following anyone, return empty array
        return res.json({ content: [] });
      }
    }
    
    // Determine sort order
    let sortOptions = {};
    switch (sort) {
      case 'trending':
        sortOptions = { 'stats.views': -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { 'stats.likes': -1 };
        break;
      case 'recommended':
        // This would ideally use a recommendation algorithm
        // For now, just use a mix of popularity and recency
        sortOptions = { 
          'stats.views': -1,
          createdAt: -1
        };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }
    
    // Execute query
    const content = await Content.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username displayName profileImage');
    
    // Get total count for pagination
    const total = await Content.countDocuments(query);
    
    res.json({
      content,
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

// server/controllers/contentController.js
exports.getContentById = async (req, res) => {
  try {
    // Find content without updating it first
    const content = await Content.findById(req.params.id)
      .populate('creator', 'username displayName profileImage bio');
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Increment view count using findByIdAndUpdate instead of modifying and saving
    await Content.findByIdAndUpdate(
      req.params.id,
      { $inc: { 'stats.views': 1 } },
      { new: true }
    );
    
    // Find similar content
    const similar = await Content.find({
      _id: { $ne: content._id },
      contentType: content.contentType,
      $or: [
        { category: content.category },
        { tags: { $in: content.tags } }
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
      error: error.message 
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
      // If validation fails, delete the uploaded file
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'Title and content type are required' });
    }
    
    // Create file URL relative to server
    let fileUrl = req.file.path.split('uploads')[1]; // Normalize path for all OSes
    if (fileUrl.startsWith('/')) {
      fileUrl = fileUrl.substring(1); // Remove leading slash
    }
    fileUrl = 'uploads/' + fileUrl;
    
    // Ensure path uses forward slashes for consistency across platforms
    fileUrl = fileUrl.replace(/\\/g, '/')

    // Handle thumbnails for different content types
    let thumbnailUrl = '';
    if (contentType === 'image') {
      thumbnailUrl = fileUrl; // For images, use the same file as thumbnail
    } else if (contentType === 'short' || contentType === 'film') {
      // For videos, create a separate thumbnail file
      // Generate a unique thumbnail filename
      const thumbFilename = `thumb_${Date.now()}_${path.basename(fileUrl, path.extname(fileUrl))}.png`;
      const thumbnailDir = path.join(path.dirname(req.file.path), '..', 'thumbnails');
      
      // Create thumbnails directory if it doesn't exist
      try {
        await fs.mkdir(thumbnailDir, { recursive: true });
      } catch (mkdirErr) {
        console.error('Error creating thumbnails directory:', mkdirErr);
      }
      
      const thumbnailPath = path.join(thumbnailDir, thumbFilename);
      
      try {
        // Create a simple canvas with the video title as a placeholder thumbnail
        const canvas = createCanvas(480, 320);
        const ctx = canvas.getContext('2d');
        
        // Draw a gradient background
        const gradient = ctx.createLinearGradient(0, 0, 480, 320);
        gradient.addColorStop(0, '#1A1A25');
        gradient.addColorStop(1, '#6C63FF');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 480, 320);
        
        // Add video title
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(title, 240, 160);
        
        // Add a play button icon
        ctx.beginPath();
        ctx.arc(240, 120, 40, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(225, 100);
        ctx.lineTo(265, 120);
        ctx.lineTo(225, 140);
        ctx.closePath();
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Save the canvas as a PNG
        const buffer = canvas.toBuffer('image/png');
        await fs.writeFile(thumbnailPath, buffer);
        
        // Create a relative URL for the thumbnail
        thumbnailUrl = thumbnailPath.split('uploads')[1];
        if (thumbnailUrl.startsWith('/')) {
          thumbnailUrl = thumbnailUrl.substring(1);
        }
        thumbnailUrl = 'uploads/' + thumbnailUrl;
        thumbnailUrl = thumbnailUrl.replace(/\\/g, '/'); // Ensure forward slashes
        
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
      duration: contentType === 'image' ? 0 : parseInt(duration || 0, 10),
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
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if user is the creator
    if (content.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this content' });
    }
    
    await content.remove();
    
    // In a real app, you'd also remove the file from S3/cloud storage
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
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