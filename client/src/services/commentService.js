// client/src/services/commentService.js
import api from './api';

export const commentService = {
  // Get comments for content with error handling
  getComments: async (contentId, params = {}) => {
    try {
      const response = await api.get(`/comments/content/${contentId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return { comments: [], pagination: { total: 0, page: 1, pages: 0 } };
    }
  },
  
  // Add comment
  addComment: async (contentId, data) => {
    try {
      const response = await api.post(`/comments/content/${contentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
  
  // Update comment
  updateComment: async (id, data) => {
    try {
      const response = await api.put(`/comments/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },
  
  // Delete comment
  deleteComment: async (id) => {
    try {
      const response = await api.delete(`/comments/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },
  
  // Like comment
  likeComment: async (id) => {
    try {
      const response = await api.post(`/comments/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  },
  
  // Unlike comment
  unlikeComment: async (id) => {
    try {
      const response = await api.post(`/comments/${id}/unlike`);
      return response.data;
    } catch (error) {
      console.error('Error unliking comment:', error);
      throw error;
    }
  }
};

export default commentService;