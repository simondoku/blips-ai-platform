// server/controllers/contentController.js
const Content = require('../models/Content');
const User = require('../models/User');

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

// Explore Content (mixed)
exports.exploreContent = async (req, res) => {
  try {
    const { type, tag, search, limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    let query = { isPublic: true };
    
    // Filter by content type
    if (type && type !== 'all') {
      query.contentType = type;
    }
    
    // Filter by tag
    if (tag) {
      query.tags = tag;
    }
    
    // Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username displayName profileImage');
    
    const total = await Content.countDocuments(query);
    
    res.json({
      content,
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

// Get Content by ID
exports.getContentById = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('creator', 'username displayName profileImage bio')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'username displayName profileImage'
        }
      });
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Increment view count
    content.stats.views += 1;
    await content.save();
    
    // Get similar content
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
    
    res.json({ content, similar });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Upload Content
exports.uploadContent = async (req, res) => {
  try {
    const { title, description, contentType, category, tags, duration } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // In a real app, this would be the file URL from S3/cloud storage
    const fileUrl = req.file.path;
    
    // Create content
    const content = new Content({
      title,
      description,
      contentType,
      fileUrl,
      thumbnailUrl: contentType === 'image' ? fileUrl : '', // For images, use same URL
      creator: req.user.id,
      duration: duration || 0,
      category: category || 'other',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });
    
    await content.save();
    
    res.status(201).json({
      message: 'Content uploaded successfully',
      content
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
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