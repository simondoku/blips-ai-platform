// client/src/services/feedbackService.js
import api from './api';

/**
 * Submit feedback to the server
 * @param {Object} feedbackData - The feedback data
 * @param {string} feedbackData.type - The type of feedback (bug, feature, general)
 * @param {string} feedbackData.subject - The subject of the feedback
 * @param {string} feedbackData.message - The feedback message
 * @param {string} [feedbackData.email] - The email of the user (required if not authenticated)
 * @returns {Promise} - The feedback submission response
 */
export const submitFeedback = async (feedbackData) => {
  try {
    const response = await api.post('/feedback/submit', feedbackData);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get all feedback submissions for the authenticated user
 * @returns {Promise} - The user's feedback submissions
 */
export const getUserFeedback = async () => {
  try {
    const response = await api.get('/feedback/user');
    return response.data.feedback;
  } catch (error) {
    console.error('Error fetching user feedback:', error);
    throw error.response?.data || error;
  }
};

/**
 * Get all feedback submissions (admin only)
 * @param {Object} params - Query parameters
 * @param {string} [params.type] - Filter by feedback type
 * @param {string} [params.status] - Filter by feedback status
 * @param {number} [params.page=1] - Page number for pagination
 * @param {number} [params.limit=20] - Number of results per page
 * @returns {Promise} - All feedback submissions with pagination
 */
export const getAllFeedback = async (params = {}) => {
  try {
    const response = await api.get('/feedback/all', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching all feedback:', error);
    throw error.response?.data || error;
  }
};

/**
 * Update feedback status (admin only)
 * @param {string} id - The feedback ID
 * @param {Object} updateData - The data to update
 * @param {string} [updateData.status] - The new status
 * @param {string} [updateData.adminResponse] - The admin response
 * @returns {Promise} - The updated feedback
 */
export const updateFeedbackStatus = async (id, updateData) => {
  try {
    const response = await api.put(`/feedback/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating feedback status:', error);
    throw error.response?.data || error;
  }
};

/**
 * Test email configuration (admin only)
 * @returns {Promise} - The test result
 */
export const testEmailConfig = async () => {
  try {
    const response = await api.post('/feedback/test-email');
    return response.data;
  } catch (error) {
    console.error('Error testing email configuration:', error);
    throw error.response?.data || error;
  }
};

export default {
  submitFeedback,
  getUserFeedback,
  getAllFeedback,
  updateFeedbackStatus,
  testEmailConfig
};