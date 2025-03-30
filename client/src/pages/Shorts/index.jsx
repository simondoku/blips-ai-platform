// client/src/pages/Shorts/index.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoPlayer from './components/VideoPlayer';
import VideoSidebar from './components/VideoSidebar';
import RecommendedVideos from './components/RecommendedVideos';

// Mock data for initial development
const MOCK_VIDEOS = Array.from({ length: 10 }).map((_, index) => ({
  id: `video-${index}`,
  title: `AI Short #${index + 1}`,
  description: `Amazing AI-generated short clip #${index + 1} with cool effects ${index % 2 === 0 ? '#animation #ai #realistic' : '#stylized #futuristic #concept'}`,
  creator: {
    id: `creator-${index % 5}`,
    username: `ai_creator_${index % 5}`,
    displayName: `AI Creator ${index % 5}`,
    isFollowing: index % 3 === 0
  },
  stats: {
    likes: Math.floor(Math.random() * 100000),
    comments: Math.floor(Math.random() * 10000),
    shares: Math.floor(Math.random() * 5000),
    saves: Math.floor(Math.random() * 2000)
  },
  duration: 30, // in seconds
}));

const Shorts = () => {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch shorts from API
  useEffect(() => {
    const fetchShorts = async () => {
      setIsLoading(true);
      try {
        const response = await contentService.getShorts({ limit: 20 });
        
        if (response && response.shorts && response.shorts.length > 0) {
          setVideos(response.shorts);
        } else {
          setError('No shorts available');
        }
      } catch (err) {
        console.error('Error fetching shorts:', err);
        setError('Failed to load shorts. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShorts();
  }, []);
  
  // Current video based on index
  const currentVideo = videos[currentVideoIndex] || null;
  
  // Handle navigation between videos
  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    }
  };
  
  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
    }
  };
  
  const handleSelectVideo = (index) => {
    setCurrentVideoIndex(index);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        handleNextVideo();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        handlePreviousVideo();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentVideoIndex, videos.length]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">No videos available</h2>
        <p className="text-blips-text-secondary">Check back later for new content</p>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-60px)] bg-blips-black flex">
      {/* Left sidebar - Recommended videos */}
      <aside className="hidden md:block w-64 border-r border-blips-dark overflow-y-auto">
        <RecommendedVideos 
          videos={videos} 
          currentIndex={currentVideoIndex}
          onSelectVideo={handleSelectVideo}
        />
      </aside>
      
      {/* Main video player */}
      <main className="flex-grow flex justify-center items-center">
        <div className="relative w-full max-w-md h-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentVideoIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <VideoPlayer 
                video={currentVideo} 
                isAutoplay={isAutoplay}
                onEnded={handleNextVideo}
              />
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation buttons (on sides) */}
          <button 
            className={`absolute top-1/2 left-4 -translate-y-1/2 w-10 h-20 flex items-center justify-center bg-black/20 rounded-md backdrop-blur-sm ${currentVideoIndex === 0 ? 'opacity-0 cursor-default' : 'opacity-50 hover:opacity-80'}`}
            onClick={handlePreviousVideo}
            disabled={currentVideoIndex === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            className={`absolute top-1/2 right-4 -translate-y-1/2 w-10 h-20 flex items-center justify-center bg-black/20 rounded-md backdrop-blur-sm ${currentVideoIndex === videos.length - 1 ? 'opacity-0 cursor-default' : 'opacity-50 hover:opacity-80'}`}
            onClick={handleNextVideo}
            disabled={currentVideoIndex === videos.length - 1}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </main>
      
      {/* Right sidebar - video interactions */}
      <aside className="w-16 md:w-20 border-l border-blips-dark flex flex-col items-center">
        <VideoSidebar video={currentVideo} />
      </aside>
    </div>
  );
};

export default Shorts;