// server/controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Submit feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { type, subject, message, email } = req.body;
    
    // Create new feedback
    const feedbackData = {
      type,
      subject,
      message,
      // Collect some useful metadata
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    };
    
    // Add user if authenticated
    if (req.user) {
      feedbackData.user = req.user.id;
    } else if (email) {
      // If not authenticated, email is required
      feedbackData.email = email;
    } else {
      return res.status(400).json({ 
        message: 'Email is required when not logged in'
      });
    }
    
    const feedback = new Feedback(feedbackData);
    await feedback.save();
    
    // Send email notification
    try {
      // If user is authenticated, retrieve user details
      let userDetails = null;
      if (req.user) {
        userDetails = await User.findById(req.user.id).select('username email displayName');
      }
      await emailService.sendFeedbackNotification(feedback, userDetails);
    } catch (emailError) {
      console.error('Failed to send feedback notification email:', emailError);
      // Continue with the response since the feedback was still saved
    }
    
    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: {
        id: feedback._id,
        type: feedback.type,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      message: 'Failed to submit feedback',
      error: error.message 
    });
  }
};

// Get user's feedback submissions (authenticated users only)
exports.getUserFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const feedback = await Feedback.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('type subject status createdAt adminResponse');
    
    res.json({ feedback });
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    res.status(500).json({
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// Admin: Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    // Ensure user is admin
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access admin features' });
    }
    
    const { type, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    
    const feedback = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'username displayName email');
    
    const total = await Feedback.countDocuments(query);
    
    res.json({
      feedback,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      message: 'Error fetching feedback',
      error: error.message
    });
  }
};

// Admin: Update feedback status
exports.updateFeedbackStatus = async (req, res) => {
  try {
    // Ensure user is admin
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access admin features' });
    }
    
    const { id } = req.params;
    const { status, adminResponse } = req.body;
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    
    if (status) feedback.status = status;
    if (adminResponse) feedback.adminResponse = adminResponse;
    
    await feedback.save();
    
    res.json({ 
      message: 'Feedback updated',
      feedback: {
        id: feedback._id,
        status: feedback.status,
        adminResponse: feedback.adminResponse
      }
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      message: 'Error updating feedback',
      error: error.message
    });
  }
};

// Test email configuration (admin only)
exports.testEmailConfig = async (req, res) => {
  try {
    // Ensure user is admin
    const user = await User.findById(req.user.id);
    if (!user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to access admin features' });
    }
    
    const result = await emailService.testEmailConfig();
    
    res.json({
      message: 'Test email sent successfully',
      result
    });
  } catch (error) {
    console.error('Error testing email configuration:', error);
    res.status(500).json({
      message: 'Error testing email configuration',
      error: error.message
    });
  }
};