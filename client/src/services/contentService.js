// client/src/services/contentService.js - Updated with real API endpoints
import api from './api';

export const contentService = {
  // Get images with proper error handling
  getImages: async (params = {}) => {
    try {
      const response = await api.get('/content/images', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching images:', error);
      // Return fallback structure in case of error
      return { 
        images: [], 
        pagination: { total: 0, page: 1, pages: 0 } 
      };
    }
  },
  
  // Get shorts
  getShorts: async (params = {}) => {
    try {
      const response = await api.get('/content/shorts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching shorts:', error);
      return { 
        shorts: [], 
        pagination: { total: 0, page: 1, pages: 0 } 
      };
    }
  },
  
  // Get films
  getFilms: async (params = {}) => {
    try {
      const response = await api.get('/content/films', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching films:', error);
      return { 
        films: [], 
        pagination: { total: 0, page: 1, pages: 0 } 
      };
    }
  },

  // Explore content with better error handling
  exploreContent: async (params = {}) => {
    try {
      const response = await api.get('/content/explore', { params });
      return response.data;
    } catch (error) {
      console.error('Error exploring content:', error);
      return { content: [], pagination: { total: 0, page: 1, pages: 0 } };
    }
  },
  
  // Get content by ID with proper error handling
  getContentById: async (id) => {
    try {
      const response = await api.get(`/content/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting content by ID:', error);
      throw error;
    }
  },

  // Get related content with better error handling
  getRelatedContent: async (id, limit = 6) => {
    try {
      const response = await api.get(`/content/${id}/related?limit=${limit}`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error getting related content:', error);
      return []; // Return empty array instead of throwing
    }
  },
  
  // Content interaction methods
  likeContent: async (id) => {
    try {
      const response = await api.post(`/content/${id}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking content:', error);
      throw error;
    }
  },
  
  unlikeContent: async (id) => {
    try {
      const response = await api.post(`/content/${id}/unlike`);
      return response.data;
    } catch (error) {
      console.error('Error unliking content:', error);
      throw error;
    }
  },
  
  saveContent: async (id) => {
    try {
      const response = await api.post(`/content/${id}/save`);
      return response.data;
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  },
  
  unsaveContent: async (id) => {
    try {
      const response = await api.post(`/content/${id}/unsave`);
      return response.data;
    } catch (error) {
      console.error('Error unsaving content:', error);
      throw error;
    }
  },
  
  // Upload content with progress tracking
  uploadContent: async (formData, onProgress) => {
    try {
      const contentType = formData.get('contentType');
      
      const response = await api.post(`/content/upload?contentType=${contentType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) {
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading content:', error);
      throw error;
    }
  }
};

export default contentService;