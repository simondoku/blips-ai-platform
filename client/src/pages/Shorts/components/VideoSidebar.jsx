// client/src/pages/Shorts/components/VideoSidebar.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { contentService } from '../../../services/contentService';

const VideoSidebar = ({ video }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(video.stats?.likes || 0);
  const [saveCount, setSaveCount] = useState(video.stats?.saves || 0);
  
  // Check initial states
  useEffect(() => {
    if (video) {
      setIsLiked(video.likedBy?.includes(video.currentUser) || false);
      setIsFollowing(video.creator?.isFollowing || false);
      setIsSaved(video.savedBy?.includes(video.currentUser) || false);
      setLikeCount(video.stats?.likes || 0);
      setSaveCount(video.stats?.saves || 0);
    }
  }, [video]);
  
  // Format numbers for display (e.g. 1.2K instead of 1200)
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };
  
// First, let's fix VideoSidebar.jsx to properly use the content and user services
const handleLikeToggle = async (e) => {
  e.stopPropagation();
  try {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      navigate('/login');
      return;
    }
    
    if (isLiked) {
      await contentService.unlikeContent(video._id || video.id);
    } else {
      await contentService.likeContent(video._id || video.id);
    }
    
    // Update UI
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  } catch (error) {
    console.error('Error toggling like:', error);
    // Show an error notification or toast here
  }
};

// Follow handler
const handleFollowToggle = async (e) => {
  e.stopPropagation();
  try {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (isFollowing) {
      await userService.unfollowUser(video.creator._id);
    } else {
      await userService.followUser(video.creator._id);
    }
    
    setIsFollowing(!isFollowing);
  } catch (error) {
    console.error('Error toggling follow:', error);
  }
};
  
  // Handle save/unsave
  const handleSaveToggle = async (e) => {
    e.stopPropagation();
    try {
      if (isSaved) {
        const response = await contentService.unsaveContent(video._id || video.id);
        setSaveCount(response.saves || saveCount - 1);
      } else {
        const response = await contentService.saveContent(video._id || video.id);
        setSaveCount(response.saves || saveCount + 1);
      }
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };
  
  // Add a function to prevent event propagation for buttons
  const handleButtonClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div className="h-full py-4 flex flex-col items-center justify-center">
      {/* Creator Avatar */}
      <div className="mb-8 relative">
        <Link
          to={`/profile/${video.creator?.username}`} 
          className="w-12 h-12 rounded-full bg-blips-purple flex items-center justify-center text-white text-xl font-bold"
          onClick={handleButtonClick}
        >
          {video.creator?.displayName?.charAt(0) || 'U'}
        </Link>
        
        {/* Follow button */}
        <motion.button 
          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center ${
            isFollowing ? 'bg-blips-purple' : 'bg-white'
          }`}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {handleFollowToggle}}
        >
          {isFollowing ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blips-purple" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>
      </div>
      
      {/* Like Button */}
      <div className="mb-6 flex flex-col items-center">
        <motion.button 
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isLiked ? 'bg-red-500 bg-opacity-20' : 'bg-blips-dark'
          }`}
          whileTap={{ scale: 0.9 }}
          onClick={handleLikeToggle}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 ${isLiked ? 'text-red-500' : 'text-white'}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" 
              clipRule="evenodd" 
            />
          </svg>
        </motion.button>
        <span className="text-xs text-white mt-1">{formatNumber(likeCount)}</span>
      </div>
      
      {/* Comment Button */}
      <div className="mb-6 flex flex-col items-center">
        <motion.button 
          className="w-12 h-12 rounded-full bg-blips-dark flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          onClick={handleButtonClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </motion.button>
        <span className="text-xs text-white mt-1">{formatNumber(video.stats?.comments || 0)}</span>
      </div>
      
      {/* Share Button */}
      <div className="mb-6 flex flex-col items-center">
        <motion.button 
          className="w-12 h-12 rounded-full bg-blips-dark flex items-center justify-center"
          whileTap={{ scale: 0.9 }}
          onClick={handleButtonClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </motion.button>
        <span className="text-xs text-white mt-1">{formatNumber(video.stats?.shares || 0)}</span>
      </div>
      
      {/* Save Button */}
      <div className="mb-6 flex flex-col items-center">
        <motion.button 
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isSaved ? 'bg-blips-purple bg-opacity-20' : 'bg-blips-dark'
          }`}
          whileTap={{ scale: 0.9 }}
          onClick={handleSaveToggle}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-6 w-6 ${isSaved ? 'text-blips-purple' : 'text-white'}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
            />
          </svg>
        </motion.button>
        <span className="text-xs text-white mt-1">{formatNumber(saveCount)}</span>
      </div>
    </div>
  );
};

export default VideoSidebar;