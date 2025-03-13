// client/src/services/commentService.js
import api from './api';

export const commentService = {
  // Get comments for content
  getComments: async (contentId, params = {}) => {
    const response = await api.get(`/comments/content/${contentId}`, { params });
    return response.data;
  },
  
  // Add comment
  addComment: async (contentId, data) => {
    const response = await api.post(`/comments/content/${contentId}`, data);
    return response.data;
  },
  
  // Update comment
  updateComment: async (id, data) => {
    const response = await api.put(`/comments/${id}`, data);
    return response.data;
  },
  
  // Delete comment
  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },
  
  // Like comment
  likeComment: async (id) => {
    const response = await api.post(`/comments/${id}/like`);
    return response.data;
  },
  
  // Unlike comment
  unlikeComment: async (id) => {
    const response = await api.post(`/comments/${id}/unlike`);
    return response.data;
  }
};