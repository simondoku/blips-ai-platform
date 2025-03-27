// client/src/services/userService.js
import api from './api';

export const userService = {
  // Get user profile with error handling
  getUserProfile: async (username) => {
    try {
      const response = await api.get(`/users/${username}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },
  
  // Get user content
  getUserContent: async (params = {}) => {
    try {
      // Build explore parameters
      const exploreParams = {};
      
      // If creator is provided
      if (params.creator) {
        exploreParams.creator = params.creator;
      }
      
      // Add content type if specified and not 'all'
      if (params.contentType && params.contentType !== 'all') {
        exploreParams.contentType = params.contentType;
      }
      
      // Add pagination parameters
      if (params.page) exploreParams.page = params.page;
      if (params.limit) exploreParams.limit = params.limit;
      
      // Sort by newest by default
      exploreParams.sort = 'newest';
      
      // Use the explore endpoint
      const response = await api.get('/content/explore', { params: exploreParams });
      
      // Return content and pagination info
      return {
        content: response.data.content || [],
        pagination: response.data.pagination || { total: 0, page: 1, pages: 0 }
      };
    } catch (error) {
      console.error('Error fetching user content:', error);
      return { content: [], pagination: { total: 0, page: 1, pages: 0 } };
    }
  },
  
  // Follow user
  followUser: async (userId) => {
    try {
      const response = await api.post(`/users/follow/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },
  
  // Unfollow user
  unfollowUser: async (userId) => {
    try {
      const response = await api.post(`/users/unfollow/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },
  
  // Get saved content
  getSavedContent: async (params = {}) => {
    try {
      const response = await api.get('/users/saved', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching saved content:', error);
      return { content: [], pagination: { total: 0, page: 1, pages: 0 } };
    }
  },
  
  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const formData = new FormData();
      
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      const response = await api.put('/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};

export default userService;