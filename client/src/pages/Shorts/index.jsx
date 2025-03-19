// client/src/pages/Shorts/index.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { contentService } from '../../services/contentService';
import VideoPlayer from './components/VideoPlayer';
import VideoSidebar from './components/VideoSidebar';
import RecommendedVideos from './components/RecommendedVideos';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Shorts = () => {
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  
  // Current video based on index
  const currentVideo = videos[currentVideoIndex];
  
  // Fetch videos from API
  const fetchVideos = async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newPage = reset ? 1 : page;
      const params = {
        page: newPage,
        limit: 10
      };
      
      const response = await contentService.getShorts(params);
      
      if (reset) {
        setVideos(response.shorts);
        setCurrentVideoIndex(0);
      } else {
        setVideos(prev => [...prev, ...response.shorts]);
      }
      
      setHasMore(response.pagination.page < response.pagination.pages);
      setPage(newPage + 1);
    } catch (err) {
      setError('Failed to load videos. Please try again later.');
      console.error('Error fetching shorts:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchVideos(true);
  }, []);
  
  // Handle navigation between videos
  const handleNextVideo = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
    } else if (hasMore) {
      // Load more videos when reaching the end
      fetchVideos();
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
  }, [currentVideoIndex, videos.length, hasMore]);
  
  // Handle scroll-based navigation (for mobile)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleWheel = (e) => {
      if (e.deltaY > 0) {
        handleNextVideo();
      } else if (e.deltaY < 0) {
        handlePreviousVideo();
      }
    };
    
    container.addEventListener('wheel', handleWheel);
    return () => container.removeEventListener('wheel', handleWheel);
  }, [currentVideoIndex, videos.length, hasMore]);
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4 text-red-500">{error}</h2>
        <button 
          onClick={() => fetchVideos(true)}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (isLoading && videos.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!videos.length) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">No videos available</h2>
        <p className="text-blips-text-secondary mb-6">Check back later for new content</p>
      </div>
    );
  }
  
  return (
    <div className="h-[calc(100vh-60px)] bg-blips-black flex" ref={containerRef}>
      {/* Left sidebar - Recommended videos */}
      <aside className="hidden md:block w-64 border-r border-blips-dark overflow-y-auto">
        <RecommendedVideos 
          videos={videos} 
          currentIndex={currentVideoIndex}
          onSelectVideo={handleSelectVideo}
        />
      </aside>
      
      {/* Main video player */}
      <main className="flex-grow flex justify-center items-center relative">
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
              {currentVideo && (
                <VideoPlayer 
                  video={currentVideo} 
                  isAutoplay={isAutoplay}
                  onEnded={handleNextVideo}
                />
              )}
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
            className={`absolute top-1/2 right-4 -translate-y-1/2 w-10 h-20 flex items-center justify-center bg-black/20 rounded-md backdrop-blur-sm ${currentVideoIndex === videos.length - 1 && !hasMore ? 'opacity-0 cursor-default' : 'opacity-50 hover:opacity-80'}`}
            onClick={handleNextVideo}
            disabled={currentVideoIndex === videos.length - 1 && !hasMore}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Loading indicator for more videos */}
          {isLoading && currentVideoIndex === videos.length - 1 && (
            <div className="absolute bottom-20 left-0 right-0 flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          )}
        </div>
      </main>
      
      {/* Right sidebar - video interactions */}
      <aside className="w-16 md:w-20 border-l border-blips-dark flex flex-col items-center">
        {currentVideo && <VideoSidebar video={currentVideo} />}
      </aside>
    </div>
  );
};

export default Shorts;