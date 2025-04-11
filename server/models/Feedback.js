// server/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Not required so that anonymous feedback is possible
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'general', 'other'],
    required: true,
    default: 'general'
  },
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  email: {
    type: String,
    trim: true,
    // Required only if user is not provided
    validate: {
      validator: function(v) {
        // Email is required if user is not provided
        return this.user || /^\S+@\S+\.\S+$/.test(v);
      },
      message: 'Email is required if not logged in'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'rejected'],
    default: 'pending'
  },
  adminResponse: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  // For additional info like browser, OS, etc.
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

// Add indexes for efficient querying
feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ user: 1, createdAt: -1 });
feedbackSchema.index({ type: 1, createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);
module.exports = Feedback;