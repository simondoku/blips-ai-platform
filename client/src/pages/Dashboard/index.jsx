// client/src/pages/Dashboard/index.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import contentService from '../../services/contentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Dashboard = () => {
  const [trendingContent, setTrendingContent] = useState([]);
  const [forYouContent, setForYouContent] = useState([]);
  const [followingContent, setFollowingContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch trending content
        const trending = await contentService.exploreContent({ 
          sort: 'trending', 
          limit: 8 
        });
        
        // Fetch recommended content
        const forYou = await contentService.exploreContent({ 
          sort: 'recommended', 
          limit: 8 
        });
        
        // Fetch content from creators you follow
        const following = await contentService.exploreContent({ 
          following: true, 
          limit: 8 
        });
        
        setTrendingContent(trending.content || []);
        setForYouContent(forYou.content || []);
        setFollowingContent(following.content || []);
      } catch (error) {
        console.error('Error fetching dashboard content:', error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  // Content section component
  const ContentSection = ({ title, content, emptyMessage, link }) => (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Link to={link} className="text-blips-purple hover:underline flex items-center">
          View All
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
      
      {content && content.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.map((item, index) => {
            // Determine content type
            const contentType = item.contentType || 'content';
            
            // Handle URL paths appropriately - only for video content
            const urlPath = `/${contentType}s/${item._id || item.id}`;
            
            // Get preview image URL with proper handling
            const imageUrl = getContentImageUrl(item);
              
            return (
              <motion.div
                key={item._id || item.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="card card-hover overflow-hidden"
              >
                <Link to={urlPath}>
                  <div className="aspect-video bg-gradient-to-br from-blips-dark to-blips-card flex items-center justify-center">
                    {imageUrl ? (
                      <img 
                        src={imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="%23242435"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">${contentType.charAt(0).toUpperCase() + contentType.slice(1)}</text></svg>`;
                        }}
                      />
                    ) : (
                      <span className="text-2xl text-white opacity-30">
                        {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium truncate">{item.title || 'Untitled'}</h3>
                    <p className="text-sm text-blips-text-secondary">
                      @{item.creator?.username || 'unknown'}
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-blips-dark rounded-lg p-8 text-center">
          <p className="text-blips-text-secondary mb-4">{emptyMessage}</p>
          <Link to="/explore" className="btn-primary inline-block">Explore Content</Link>
        </div>
      )}
    </section>
  );

  // Helper function to get correct thumbnail URL
  const getContentImageUrl = (item) => {
    if (!item) return null;
    
    // For video content, use thumbnail URL
    const url = item.thumbnailUrl;
    
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blips-dark rounded-lg p-6 mb-8"
      >
        <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
        <p className="text-blips-text-secondary">Discover the latest AI-generated video content tailored for you.</p>
      </motion.div>
      
      {/* For You Section */}
      <ContentSection 
        title="For You" 
        content={forYouContent} 
        emptyMessage="We're still learning your preferences. Explore and interact with content to get personalized recommendations."
        link="/explore?tab=for-you"
      />
      
      {/* Trending Section */}
      <ContentSection 
        title="Trending Now" 
        content={trendingContent} 
        emptyMessage="No trending content available right now."
        link="/explore?tab=trending"
      />
      
      {/* Following Section */}
      <ContentSection 
        title="From Creators You Follow" 
        content={followingContent} 
        emptyMessage="You're not following any creators yet. Explore and find creators to follow."
        link="/explore?tab=following"
      />
    </div>
  );
};

export default Dashboard;