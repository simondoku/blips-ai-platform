// client/src/pages/Shorts/components/RecommendedVideos.jsx
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const RecommendedVideos = ({ videos, currentIndex, onSelectVideo }) => {
  const navigate = useNavigate();
  
  // Add function to navigate to a video detail page
  const navigateToVideo = (id) => {
    if (!id) return;
    navigate(`/shorts/${id}`);
  };
  
  // Format duration properly
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Handle click on create button
  const handleCreateClick = (e) => {
    e.stopPropagation();
    navigate('/upload?type=short');
  };
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">For You</h2>
      
      <div className="space-y-4">
        {/* Currently playing video */}
        {videos.length > 0 && currentIndex >= 0 && currentIndex < videos.length && (
          <div className="mb-8">
            <div className="relative h-36 rounded-lg overflow-hidden border-2 border-blips-purple">
              {videos[currentIndex].thumbnailUrl ? (
                <img 
                  src={videos[currentIndex].thumbnailUrl.startsWith('http') 
                    ? videos[currentIndex].thumbnailUrl 
                    : `http://localhost:5001/${videos[currentIndex].thumbnailUrl}`}
                  alt={videos[currentIndex].title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 320 180"><rect width="320" height="180" fill="%231A1A25"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">Now Playing</text></svg>`;
                  }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blips-purple/20 to-blips-dark flex items-center justify-center">
                  <span className="text-lg text-white opacity-70">Now Playing</span>
                </div>
              )}
            </div>
            <div className="mt-2">
              <p className="font-medium text-sm truncate">
                {videos[currentIndex].title || 'Untitled Video'}
              </p>
              <p className="text-blips-text-secondary text-xs">
                @{videos[currentIndex].creator?.username || 'unknown'}
              </p>
            </div>
          </div>
        )}
        
        <h3 className="text-sm font-medium text-blips-text-secondary uppercase">Up Next</h3>
        
        {/* Recommended videos list */}
        {videos.map((video, index) => {
          // Skip the current video
          if (index === currentIndex) return null;
          
          return (
            <motion.div 
              key={video._id || video.id || index}
              className="cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectVideo(index)}
            >
              <div className="relative h-24 rounded-lg overflow-hidden">
                {video.thumbnailUrl ? (
                  <img 
                    src={video.thumbnailUrl.startsWith('http') 
                      ? video.thumbnailUrl 
                      : `http://localhost:5001/${video.thumbnailUrl}`}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 320 180"><rect width="320" height="180" fill="%231A1A25"/><text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">AI Video</text></svg>`;
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blips-dark to-blips-card flex items-center justify-center">
                    <span className="text-sm text-white opacity-50">AI Video</span>
                  </div>
                )}
                
                {/* Duration */}
                <div className="absolute bottom-1 right-1 bg-black/70 px-1 rounded text-xs text-white">
                  {formatDuration(video.duration)}
                </div>
              </div>
              <div className="mt-1">
                <p className="text-sm truncate">{video.title || 'Untitled'}</p>
                <p className="text-blips-text-secondary text-xs">@{video.creator?.username || 'unknown'}</p>
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