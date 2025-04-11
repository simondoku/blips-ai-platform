// client/src/pages/Profile/Saved.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Saved = () => {
  const { isAuthenticated, currentUser } = useAuth();
  const [savedContent, setSavedContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchSavedContent(activeTab);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, activeTab]);
  
  const fetchSavedContent = async (contentType = 'all') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {};
      if (contentType !== 'all') {
        params.contentType = contentType;
      }
      
      const response = await userService.getSavedContent(params);
      setSavedContent(response.content || []);
    } catch (error) {
      console.error('Error fetching saved content:', error);
      setError(error.response?.data?.message || 'Failed to load saved content. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Helper function to get the correct URL for a content item
  const getContentUrl = (item) => {
    const contentType = item.contentType || 'image';
    return contentType === 'image' 
      ? `/images/${item._id}` 
      : `/${contentType}s/${item._id}`;
  };
  
  // Helper function to get image URL
  const getImageUrl = (item) => {
    if (!item) return null;
    
    const url = item.contentType === 'image' ? 
      item.fileUrl : 
      item.thumbnailUrl;
    
    if (!url) return null;
    
    // If it's an absolute URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a relative path starting with uploads
    if (url.startsWith('/uploads')) {
      return `http://localhost:5001${url}`;
    }
    
    // If it's a relative path without leading slash
    if (url.startsWith('uploads/')) {
      return `http://localhost:5001/${url}`;
    }
    
    // Default fallback
    return `http://localhost:5001/${url}`;
  };
  
  // If not authenticated, show login prompt
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-blips-text-secondary mb-6">Please log in to view your saved content.</p>
          <Link to="/login" className="btn-primary">Log In</Link>
        </div>
      </div>
    );
  }
  
  // If there was an error loading the content
  if (error && !isLoading) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-bold mb-2">Error Loading Content</h3>
        <p className="text-blips-text-secondary mb-6">{error}</p>
        <Link to="/profile" className="btn-primary">Return to Profile</Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Saved Content</h1>
        
        {/* Tabs */}
        <div className="border-b border-blips-dark mb-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            {[
              { id: 'all', label: 'All Saved' },
              { id: 'image', label: 'Images' },
              { id: 'short', label: 'Short Clips' },
              { id: 'film', label: 'Films' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id 
                    ? 'border-blips-purple text-blips-purple' 
                    : 'border-transparent text-blips-text-secondary hover:text-white'
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : savedContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {savedContent.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="card overflow-hidden"
              >
                <Link to={getContentUrl(item)} className="block">
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-blips-card">
                    <img 
                      src={getImageUrl(item)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 225"><rect width="400" height="225" fill="%23242435"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">${item.contentType?.charAt(0).toUpperCase() + item.contentType?.slice(1) || 'Content'}</text></svg>`;
                      }}
                    />
                    
                    {/* Play button for videos */}
                    {(item.contentType === 'short' || item.contentType === 'film') && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Content Info */}
                  <div className="p-4">
                    <h3 className="font-medium mb-1 truncate">{item.title || 'Untitled'}</h3>
                    <div className="flex items-center justify-between text-sm text-blips-text-secondary">
                      <span>{item.creator?.displayName || item.creator?.username}</span>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                        {item.stats?.likes || 0}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blips-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            <h3 className="text-xl font-bold mb-2">No saved content</h3>
            <p className="text-blips-text-secondary mb-6">
              Browse and save content to view it here later.
            </p>
            <Link to="/explore" className="btn-primary">
              Explore Content
            </Link>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Saved;