// server/models/Content.js
const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000
  },
  contentType: {
    type: String,
    required: true,
    enum: ['image', 'short', 'film']
  },
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number,
    default: 0  // 0 for images, seconds for videos/films
  },
  tags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    default: 'other'
  },
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    saves: {
      type: Number,
      default: 0
    }
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Create compound index for efficient queries
contentSchema.index({ contentType: 1, creator: 1, createdAt: -1 });
contentSchema.index({ tags: 1 });
contentSchema.index({ category: 1 });

const Content = mongoose.model('Content', contentSchema);
module.exports = Content;