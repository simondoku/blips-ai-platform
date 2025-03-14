// client/src/pages/Dashboard/index.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import contentService from '../../services/contentService';

const Dashboard = () => {
  const [trendingContent, setTrendingContent] = useState([]);
  const [forYouContent, setForYouContent] = useState([]);
  const [followingContent, setFollowingContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        // In a real app, these would be separate API calls
        const trending = await contentService.exploreContent({ sort: 'trending', limit: 8 });
        const forYou = await contentService.exploreContent({ sort: 'recommended', limit: 8 });
        const following = await contentService.exploreContent({ following: true, limit: 8 });
        
        setTrendingContent(trending.content || []);
        setForYouContent(forYou.content || []);
        setFollowingContent(following.content || []);
      } catch (error) {
        console.error('Error fetching dashboard content:', error);
        // Use mock data if API fails for now
        setTrendingContent(generateMockContent(8));
        setForYouContent(generateMockContent(8));
        setFollowingContent(generateMockContent(4));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, []);

  // Mock data generator for development
  const generateMockContent = (count) => {
    return Array.from({ length: count }).map((_, index) => ({
      id: `content-${index}`,
      title: `AI Creation #${index + 1}`,
      creator: `creator${index % 5}`,
      creatorName: `Creator ${index % 5}`,
      type: ['image', 'short', 'film'][index % 3],
      thumbnailUrl: null
    }));
  };
  
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
      
      {content.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {content.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="card card-hover overflow-hidden"
            >
              <Link to={`/${item.type}s/${item.id}`}>
                <div className="aspect-video bg-gradient-to-br from-blips-dark to-blips-card flex items-center justify-center">
                  {/* This would be an actual thumbnail in production */}
                  <span className="text-2xl text-white opacity-30">{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
                </div>
                <div className="p-3">
                  <h3 className="font-medium truncate">{item.title}</h3>
                  <p className="text-sm text-blips-text-secondary">@{item.creator}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-blips-dark rounded-lg p-8 text-center">
          <p className="text-blips-text-secondary mb-4">{emptyMessage}</p>
          <Link to="/explore" className="btn-primary inline-block">Explore Content</Link>
        </div>
      )}
    </section>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
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
        <p className="text-blips-text-secondary">Discover the latest AI-generated content tailored for you.</p>
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