// client/src/services/userService.js
import api from './api';

export const userService = {
  // Get user profile
  getUserProfile: async (username) => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },
  
  // Get user content
  getUserContent: async (params = {}) => {
    const response = await api.get('/users/content', { params });
    return response.data;
  },
  
  // Follow user
  followUser: async (userId) => {
    const response = await api.post(`/users/follow/${userId}`);
    return response.data;
  },
  
  // Unfollow user
  unfollowUser: async (userId) => {
    const response = await api.post(`/users/unfollow/${userId}`);
    return response.data;
  },
  
  // Get saved content
  getSavedContent: async (params = {}) => {
    const response = await api.get('/users/saved', { params });
    return response.data;
  }
};