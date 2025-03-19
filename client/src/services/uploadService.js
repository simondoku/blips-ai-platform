// client/src/services/uploadService.js
import api from './api';

export const uploadService = {
  uploadContent: async (formData, onProgress) => {
    try {
      // Extract content type from formData to use in URL query parameter
      const contentType = formData.get('contentType');
      
      // Remove contentType from formData since we'll pass it as query parameter
      formData.delete('contentType');
      
      // Add the /api prefix to the endpoint
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
      console.error('Upload error:', error);
      throw error;
    }
  }
};