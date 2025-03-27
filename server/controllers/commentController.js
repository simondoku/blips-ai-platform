// server/controllers/commentController.js
const Comment = require('../models/Comment');
const Content = require('../models/Content');

// Get Comments for Content
exports.getComments = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Check if content exists
    const contentExists = await Content.exists({ _id: contentId });
    
    if (!contentExists) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Get comments for content
    const comments = await Comment.find({ 
      content: contentId,
      parentComment: null // Only get top-level comments
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username displayName profileImage')
      .populate({
        path: 'replies',
        populate: {
          path: 'user',
          select: 'username displayName profileImage'
        }
      });
    
    const total = await Comment.countDocuments({ 
      content: contentId,
      parentComment: null
    });
    
    res.json({
      comments,
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

// Add Comment
exports.addComment = async (req, res) => {
  try {
    const { contentId } = req.params;
    const { text, parentCommentId } = req.body;
    
    // Check if content exists
    const content = await Content.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Check if parent comment exists if provided
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }
    
    // Create new comment
    const comment = new Comment({
      content: contentId,
      user: req.user.id,
      text,
      parentComment: parentCommentId || null
    });
    
    await comment.save();
    
    // Increment comment count on content
    content.stats.comments += 1;
    await content.save();
    
    // Populate user info before sending response
    await comment.populate('user', 'username displayName profileImage');
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update Comment
exports.updateComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }
    
    comment.text = text;
    await comment.save();
    
    res.json(comment);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the author or content creator
    const content = await Content.findById(comment.content);
    
    if (comment.user.toString() !== req.user.id && 
        content.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    
    // Delete comment
    await Comment.deleteOne({ _id: req.params.id });
    
    // If it's a top-level comment, also delete replies
    if (!comment.parentComment) {
      await Comment.deleteMany({ parentComment: comment._id });
    }
    
    // Update comment count
    content.stats.comments = await Comment.countDocuments({ content: content._id });
    await content.save();
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Like Comment
exports.likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user already liked this comment
    if (comment.likedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Comment already liked' });
    }
    
    comment.likedBy.push(req.user.id);
    comment.likes = comment.likedBy.length;
    
    await comment.save();
    
    res.json({
      message: 'Comment liked successfully',
      likes: comment.likes
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Unlike Comment
exports.unlikeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user has liked this comment
    if (!comment.likedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Comment not liked yet' });
    }
    
    comment.likedBy = comment.likedBy.filter(id => id.toString() !== req.user.id);
    comment.likes = comment.likedBy.length;
    
    await comment.save();
    
    res.json({
      message: 'Comment unliked successfully',
      likes: comment.likes
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};