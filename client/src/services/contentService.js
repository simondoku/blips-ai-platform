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
    try {
      const response = await api.get(`/content/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error getting content by ID:', error);
      throw error;
    }
  },

  // Get related content
  getRelatedContent: async (id, limit = 6) => {
    try {
      const response = await api.get(`/content/${id}/related?limit=${limit}`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error getting related content:', error);
      return []; // Return empty array instead of throwing
    }
  },
  
// Explore content
exploreContent: async (params = {}) => {
  try {
    const response = await api.get('/content/explore', { params });
    return response.data;
  } catch (error) {
    console.error('Error exploring content:', error);
    // Return a default structure that matches what your component expects
    return { content: [] };
  }
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
  },
  
  generateThumbnailUrl: (contentItem) => {
    if (!contentItem) return null;
    
    // Ensure the URL is properly formatted
    if (contentItem.thumbnailUrl) {
      return contentItem.thumbnailUrl.startsWith('http') 
        ? contentItem.thumbnailUrl 
        : `http://localhost:5001/${contentItem.thumbnailUrl}`;
    } else if (contentItem.fileUrl && contentItem.contentType === 'image') {
      // For images, use the image itself as the thumbnail
      return contentItem.fileUrl.startsWith('http')
        ? contentItem.fileUrl
        : `http://localhost:5001/${contentItem.fileUrl}`;
    }
    
    // Return a placeholder for videos without thumbnails
    return '/placeholder-thumbnail.jpg';
  }

};
export default contentService;