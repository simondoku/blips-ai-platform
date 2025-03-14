// client/src/services/contentService.js
import api from './api';

export const contentService = {
  // Get images
  getImages: async (params = {}) => {
    const response = await api.get('/content/images', { params });
    return response.data;
  },
  
  // Get shorts
  getShorts: async (params = {}) => {
    const response = await api.get('/content/shorts', { params });
    return response.data;
  },
  
  // Get films
  getFilms: async (params = {}) => {
    const response = await api.get('/content/films', { params });
    return response.data;
  },
  
  // Get content by ID
  getContentById: async (id) => {
    const response = await api.get(`/content/${id}`);
    return response.data;
  },
  
  // Explore content
  exploreContent: async (params = {}) => {
    const response = await api.get('/content/explore', { params });
    return response.data;
  },
  
  // Upload content
  uploadContent: async (formData) => {
    const response = await api.post('/content/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Update content
  updateContent: async (id, data) => {
    const response = await api.put(`/content/${id}`, data);
    return response.data;
  },
  
  // Delete content
  deleteContent: async (id) => {
    const response = await api.delete(`/content/${id}`);
    return response.data;
  },
  
  // Like content
  likeContent: async (id) => {
    const response = await api.post(`/content/${id}/like`);
    return response.data;
  },
  
  // Unlike content
  unlikeContent: async (id) => {
    const response = await api.post(`/content/${id}/unlike`);
    return response.data;
  },
  
  // Save content
  saveContent: async (id) => {
    const response = await api.post(`/content/${id}/save`);
    return response.data;
  },
  
  // Unsave content
  unsaveContent: async (id) => {
    const response = await api.post(`/content/${id}/unsave`);
    return response.data;
  }
};
export default contentService;