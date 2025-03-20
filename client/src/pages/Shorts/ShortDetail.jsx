// client/src/pages/Shorts/ShortDetail.jsx
// Update the relevant part to handle real videos

import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contentService } from '../../services/contentService';
import ReactPlayer from 'react-player';

const ShortDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(1);
  const [similar, setSimilar] = useState([]);
  const [comments, setComments] = useState([]);
  const playerRef = useRef(null);
  
  // Fetch video details
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await contentService.getContentById(id);
        
        // Make sure it's a video
        if (response.content.contentType !== 'short') {
          setError('This content is not a short video');
          setIsLoading(false);
          return;
        }
        
        setVideo(response.content);
        setSimilar(response.similar || []);
        setComments(response.comments || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching video details:', err);
        setError('Failed to load video details');
        setIsLoading(false);
      }
    };
    
    fetchVideoDetails();
  }, [id]);
  
  // Handle progress
  const handleProgress = (state) => {
    setProgress(state.played);
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          className="btn-primary"
          onClick={() => navigate('/shorts')}
        >
          Back to Shorts
        </button>
      </div>
    );
  }
  
  // Construct the video URL
  // In a production app, this would be a complete URL to your CDN or storage
  const videoUrl = video.fileUrl.startsWith('http') 
    ? video.fileUrl 
    : `http://localhost:5001${video.fileUrl}`;
  const handleGoBack = () => {
      navigate(-1); // This navigates back to the previous page
    };
  
  return (
    <div className="h-[calc(100vh-60px)] bg-blips-black flex">
      {/* Add back button */}
      <button 
        onClick={handleGoBack}
        className="absolute top-4 left-4 z-50 bg-blips-dark/50 hover:bg-blips-dark p-2 rounded-full backdrop-blur-sm"
        aria-label="Go back"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      {/* Main video player */}
      <main className="flex-grow flex justify-center items-center">
        <div className="relative w-full max-w-md h-full">
          <div 
            className="w-full h-full"
            onClick={togglePlayPause}
          >
            {/* Actual video player */}
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
              width="100%"
              height="100%"
              playing={isPlaying}
              loop={false}
              volume={volume}
              muted={volume === 0}
              playsinline
              onProgress={handleProgress}
              onClick={togglePlayPause}
              style={{ position: 'absolute', top: 0, left: 0 }}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                    disablePictureInPicture: true,
                  }
                }
              }}
            />
            
            {/* Play/Pause overlay */}
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <motion.button 
                  className="w-20 h-20 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm"
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlayPause}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </motion.button>
              </div>
            )}
            
            {/* Video Creator Info */}
            <div className="absolute bottom-20 left-4 right-12 z-10">
              <h3 className="text-white font-bold text-lg">{video.creator?.displayName}</h3>
              <p className="text-white/80 text-sm mb-2">@{video.creator?.username}</p>
              <p className="text-white/90 text-sm">{video.description}</p>
            </div>
            
            {/* Progress bar */}
            <div className="absolute bottom-16 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blips-purple"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            
            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <button 
                className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white"
                onClick={togglePlayPause}
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                )}
              </button>
              
              {/* Volume control */}
              <div className="flex items-center">
                <button 
                  className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white"
                  onClick={() => setVolume(volume === 0 ? 1 : 0)}
                >
                  {volume === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Right sidebar - video interactions */}
      <aside className="w-16 md:w-20 border-l border-blips-dark flex flex-col items-center">
        {/* VideoSidebar component integration would go here */}
        {/* For now, we'll include a simplified version */}
        <div className="h-full py-4 flex flex-col items-center justify-center">
          {/* Creator Avatar */}
          <div className="mb-8 relative">
            <Link
              to={`/profile/${video.creator?.username}`} 
              className="w-12 h-12 rounded-full bg-blips-purple flex items-center justify-center text-white text-xl font-bold"
            >
              {video.creator?.displayName?.[0] || 'U'}
            </Link>
          </div>
          
          {/* Like Button */}
          <div className="mb-6 flex flex-col items-center">
            <motion.button 
              className="w-12 h-12 rounded-full bg-blips-dark flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </motion.button>
            <span className="text-xs text-white mt-1">{video.stats?.likes || 0}</span>
          </div>
          
          {/* Comment Button */}
          <div className="mb-6 flex flex-col items-center">
            <motion.button 
              className="w-12 h-12 rounded-full bg-blips-dark flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </motion.button>
            <span className="text-xs text-white mt-1">{video.stats?.comments || 0}</span>
          </div>
          
          {/* Share Button */}
          <div className="mb-6 flex flex-col items-center">
            <motion.button 
              className="w-12 h-12 rounded-full bg-blips-dark flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </motion.button>
            <span className="text-xs text-white mt-1">{video.stats?.shares || 0}</span>
          </div>
          
          {/* Save Button */}
          <div className="mb-6 flex flex-col items-center">
            <motion.button 
              className="w-12 h-12 rounded-full bg-blips-dark flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </motion.button>
            <span className="text-xs text-white mt-1">{video.stats?.saves || 0}</span>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default ShortDetail;