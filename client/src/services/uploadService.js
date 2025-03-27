// client/src/services/uploadService.js
import api from './api';

export const uploadService = {
  uploadContent: async (formData, onProgress) => {
    // Extract content type from formData to use in URL query parameter
    const contentType = formData.get('contentType');
    
    // We'll keep contentType in formData as well as pass it in the URL
    // This ensures it's available in both req.body and req.query
    
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
  }
};