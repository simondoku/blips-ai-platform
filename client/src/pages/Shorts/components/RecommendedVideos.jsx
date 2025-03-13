// client/src/pages/Shorts/components/RecommendedVideos.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RecommendedVideos = ({ videos, currentIndex, onSelectVideo }) => {
  const navigate = useNavigate();
  
  // Add function to navigate to a video detail page
  const navigateToVideo = (id) => {
    navigate(`/shorts/${id}`);
  };
  
  // Handle click on currently playing video section
  const handleCurrentVideoClick = (e) => {
    e.stopPropagation();
    // This is the current video, so no navigation needed
  };
  
  // Handle click on create button
  const handleCreateClick = (e) => {
    e.stopPropagation();
    navigate('/upload');
  };
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">For You</h2>
      
      <div className="space-y-4">
        {/* Currently playing video */}
        <div className="mb-8" onClick={handleCurrentVideoClick}>
          <div className="relative h-36 rounded-lg overflow-hidden border-2 border-blips-purple">
            {/* Thumbnail placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-blips-purple/20 to-blips-dark flex items-center justify-center">
              <span className="text-lg text-white opacity-70">Now Playing</span>
            </div>
          </div>
          <div className="mt-2">
            <p className="font-medium text-sm truncate">{videos[currentIndex].title}</p>
            <p className="text-blips-text-secondary text-xs">@{videos[currentIndex].creator.username}</p>
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-blips-text-secondary uppercase">Up Next</h3>
        
        {/* Recommended videos list - update with onClick handler */}
        {videos.map((video, index) => {
          // Skip the current video
          if (index === currentIndex) return null;
          
          return (
            <motion.div 
              key={video.id}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigateToVideo(video.id)}
            >
              <div className="relative h-24 rounded-lg overflow-hidden">
                {/* Thumbnail placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-blips-dark to-blips-card flex items-center justify-center">
                  <span className="text-sm text-white opacity-50">AI Video</span>
                </div>
                
                {/* Duration */}
                <div className="absolute bottom-1 right-1 bg-black/70 px-1 rounded text-xs text-white">
                  {video.duration}s
                </div>
              </div>
              <div className="mt-1">
                <p className="text-sm truncate">{video.title}</p>
                <p className="text-blips-text-secondary text-xs">@{video.creator.username}</p>
              </div>
            </motion.div>
          );
        })}
        
        {/* Create button */}
        <div className="pt-6">
          <motion.button
            className="w-full py-3 bg-blips-purple rounded-lg text-white font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateClick}
          >
            Create
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default RecommendedVideos;