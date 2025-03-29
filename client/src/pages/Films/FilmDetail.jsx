// client/src/pages/Films/FilmDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import contentService from '../../services/contentService';
import commentService from '../../services/commentService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Safe stringify helper function
const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return `[Object cannot be stringified: ${e.message}]`;
  }
};

const FilmDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [film, setFilm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false); 
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const playerRef = useRef(null);
  
  // Fetch film details
  useEffect(() => {
    const fetchFilmDetails = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await contentService.getContentById(id);
        
        if (!response || !response.content) {
          setError('Failed to load film details');
          setIsLoading(false);
          return;
        }
        
        const filmData = response.content;
        
        // Log safely
        console.log('Film data:', safeStringify(filmData));
        
        // Make sure it's a film
        if (filmData.contentType !== 'film') {
          setError('This content is not a film');
          setIsLoading(false);
          return;
        }
        
        setFilm(filmData);
        setIsLiked(filmData.likedBy?.includes(currentUser?.id) || false);
        setIsSaved(filmData.savedBy?.includes(currentUser?.id) || false);
        
        // Check if following the creator
        if (filmData.creator && currentUser) {
          // Check if the creator has a isFollowing property
          if (filmData.creator.isFollowing !== undefined) {
            setIsFollowing(filmData.creator.isFollowing);
          }
        }
        
        // Set recommendations if available
        if (response.similar && response.similar.length > 0) {
          setRecommendations(response.similar);
        }
        
        // Set comments if available
        if (response.comments && response.comments.length > 0) {
          setComments(response.comments);
        } else {
          // Fallback to fetch comments separately
          try {
            const commentsResponse = await commentService.getComments(id);
            setComments(commentsResponse.comments || []);
          } catch (commentError) {
            console.error('Error fetching comments:', commentError.message || 'Unknown error');
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching film details:', err.message || 'Unknown error');
        try {
          console.error('Error object:', JSON.stringify(err, null, 2)); // Better error logging
        } catch (stringifyErr) {
          console.error('Could not stringify error:', stringifyErr.message);
        }
        setError('Failed to load film details. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchFilmDetails();
  }, [id, currentUser]);
  
  // Format time from seconds to MM:SS or HH:MM:SS
  const formatTime = (timeInSeconds) => {
    if (!timeInSeconds || isNaN(timeInSeconds)) return '00:00';
    
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    } else {
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
  };
  
  // Toggle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  // Handle progress change (seeking)
  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    
    // This is the correct way to seek with ReactPlayer
    if (playerRef.current) {
      try {
        // ReactPlayer does have a seekTo method
        playerRef.current.seekTo(newProgress / 100, 'fraction');
      } catch (err) {
        console.error('Error seeking:', err.message || 'Unknown error');
      }
    }
  };
  // Handle progress updates from ReactPlayer
  const handlePlayerProgress = (state) => {
    // Update progress without triggering a seek
    setProgress(state.played * 100);
  };


  
  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      // Optimistically update UI
      setIsLiked(!isLiked);
      setFilm(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          likes: isLiked ? Math.max(0, prev.stats.likes - 1) : prev.stats.likes + 1
        }
      }));
      
      // Call API
      const endpoint = isLiked ? 'unlikeContent' : 'likeContent';
      await contentService[endpoint](id);
    } catch (error) {
      // Revert UI state on error
      setIsLiked(!isLiked);
      setFilm(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          likes: !isLiked ? Math.max(0, prev.stats.likes - 1) : prev.stats.likes + 1
        }
      }));
      
      console.error('Error toggling like:', error.message || 'Unknown error');
    }
  };
  
  // Handle save/unsave
  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      // Optimistically update UI
      setIsSaved(!isSaved);
      setFilm(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          saves: isSaved ? Math.max(0, prev.stats.saves - 1) : prev.stats.saves + 1
        }
      }));
      
      // Call API
      const endpoint = isSaved ? 'unsaveContent' : 'saveContent';
      await contentService[endpoint](id);
    } catch (error) {
      // Revert UI state on error
      setIsSaved(!isSaved);
      setFilm(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          saves: !isSaved ? Math.max(0, prev.stats.saves - 1) : prev.stats.saves + 1
        }
      }));
      
      console.error('Error toggling save:', error.message || 'Unknown error');
    }
  };
  
  // Handle follows
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!film || !film.creator || !film.creator._id) {
      console.error('Creator information is missing');
      return;
    }
    
    setIsFollowLoading(true);
    
    try {
      // Optimistically update UI
      setIsFollowing(!isFollowing);
      
      // Call API
      const endpoint = isFollowing ? 'unfollowUser' : 'followUser';
      await userService[endpoint](film.creator._id);
    } catch (error) {
      console.error('Error toggling follow:', error.message || 'Unknown error');
      // Revert UI state on error
      setIsFollowing(!isFollowing);
    } finally {
      setIsFollowLoading(false);
    }
  };
  
  // Handle downloads
  const handleDownload = async () => {
    try {
      const videoUrl = getUrl(film.fileUrl);
      if (!videoUrl) {
        return;
      }
      
      // Create a download link
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = film.title || 'blips-film';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Record the download
      try {
        await contentService.shareContent(id, 'download');
      } catch (shareError) {
        console.error('Error recording download:', shareError.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error downloading video:', error.message || 'Unknown error');
    }
  };
  
  // Handle sharing
  const handleShare = async () => {
    try {
      const url = window.location.href;
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: film.title,
          text: film.description,
          url: url
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        // Show toast or notification
        alert('Link copied to clipboard!');
      }
      
      // Record the share
      try {
        await contentService.shareContent(id);
      } catch (shareError) {
        console.error('Error recording share:', shareError.message || 'Unknown error');
      }
    } catch (error) {
      console.error('Error sharing:', error.message || 'Unknown error');
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!commentText.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      const response = await commentService.addComment(id, { text: commentText });
      
      // Add the new comment to the list
      setComments(prev => [response, ...prev]);
      setCommentText('');
      
      // Update comment count in film data
      setFilm(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          comments: prev.stats.comments + 1
        }
      }));
    } catch (error) {
      console.error('Error adding comment:', error.message || 'Unknown error');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Handle comment like/unlike
  const handleCommentLike = async (commentId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const comment = comments.find(c => c._id === commentId);
      const isLiked = comment?.likedBy?.includes(currentUser?.id);
      
      // Optimistically update UI
      setComments(prev => prev.map(c => {
        if (c._id === commentId) {
          const newLikedBy = isLiked 
            ? c.likedBy.filter(id => id !== currentUser?.id)
            : [...(c.likedBy || []), currentUser?.id];
          
          return {
            ...c,
            likedBy: newLikedBy,
            likes: newLikedBy.length
          };
        }
        return c;
      }));
      
      // Call API
      if (isLiked) {
        await commentService.unlikeComment(commentId);
      } else {
        await commentService.likeComment(commentId);
      }
    } catch (error) {
      console.error('Error toggling comment like:', error.message || 'Unknown error');
      // Refresh comments to reset UI
      try {
        const commentsResponse = await commentService.getComments(id);
        setComments(commentsResponse.comments || []);
      } catch (refreshError) {
        console.error('Error refreshing comments:', refreshError.message || 'Unknown error');
      }
    }
  };
  
  // Handle reply button click
  const handleReplyClick = (commentId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
    setReplyText('');
  };
  
  // Handle reply submission
  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!replyText.trim()) return;
    
    setIsSubmittingReply(true);
    
    try {
      const response = await commentService.addComment(id, { 
        text: replyText,
        parentCommentId 
      });
      
      // Update the comment list
      setComments(prev => prev.map(c => {
        if (c._id === parentCommentId) {
          return {
            ...c,
            replies: [...(c.replies || []), response]
          };
        }
        return c;
      }));
      
      // Reset form and close reply box
      setReplyText('');
      setActiveReplyId(null);
      
      // Update comment count
      setFilm(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          comments: prev.stats.comments + 1
        }
      }));
    } catch (error) {
      console.error('Error adding reply:', error.message || 'Unknown error');
    } finally {
      setIsSubmittingReply(false);
    }
  };
  
  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) {
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      await commentService.deleteComment(commentId);
      
      // Remove from UI
      setComments(prev => prev.filter(c => c._id !== commentId));
      
      // Update comment count
      setFilm(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          comments: Math.max(0, prev.stats.comments - 1)
        }
      }));
    } catch (error) {
      console.error('Error deleting comment:', error.message || 'Unknown error');
    }
  };
  
  // Helper function to get correct URL
  const getUrl = (url) => {
    if (!url) return null;
    
    // Make sure url is a string
    if (typeof url !== 'string') {
      console.error('Invalid URL type:', typeof url);
      return null;
    }
    
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
  
  // Handle controls visibility
  useEffect(() => {
    let timeout;
    
    if (isPlaying) {
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    } else {
      setShowControls(true);
    }
    
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);
  
  // Function to navigate back
  const handleGoBack = () => {
    try {
      navigate(-1); // This should navigate to the previous page
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback if the history navigation fails
      navigate('/films');
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !film) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500 mb-4">{error || 'Film not found'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-blips-black min-h-screen">
      {/* Video Player Section (Full Width) */}
      <div className="relative bg-black" 
        onMouseMove={() => setShowControls(true)}
        onMouseLeave={() => isPlaying && setShowControls(false)}
      >
        {/* Video Player */}
        <div className="aspect-video w-full">
        {film.fileUrl && typeof film.fileUrl === 'string' ? (
          <ReactPlayer
            ref={playerRef}
            url={getUrl(film.fileUrl)}
            width="100%"
            height="100%"
            playing={isPlaying}
            volume={volume}
            muted={isMuted}
            onProgress={handlePlayerProgress}
            progressInterval={500} // Update progress every 500ms
            config={{
              file: {
                attributes: {
                  controlsList: 'nodownload',
                }
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blips-card to-purple-900/20 flex items-center justify-center cursor-pointer">
            <span className="text-4xl text-white opacity-30">Film Preview</span>
          </div>
        )}
        </div>
        
        {/* Video Controls Overlay */}
        <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Bar - Back button and title */}
          <div className="p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="container mx-auto flex items-center">
              <button 
                onClick={handleGoBack}
                className="flex items-center text-white mr-4"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-white text-lg font-medium">{film.title}</h1>
            </div>
          </div>
          
          {/* Center Play/Pause Button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button 
                className="w-20 h-20 rounded-full bg-blips-purple/80 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={togglePlayPause}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          )}
          
          {/* Bottom Controls */}
          <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="container mx-auto">
              {/* Progress Bar */}
              <div className="flex items-center mb-2">
                <span className="text-white text-sm mr-2">
                  {formatTime(Math.floor((film.duration || 0) * (progress / 100)))}
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleProgressChange}
                  className="flex-grow h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blips-purple"
                />
                <span className="text-white text-sm ml-2">
                  {formatTime(film.duration || 0)}
                </span>
              </div>
              
              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button 
                    className="text-white hover:text-blips-purple"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </button>
                  
                  <button className="text-white hover:text-blips-purple">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                    </svg>
                  </button>
                  
                  <button className="text-white hover:text-blips-purple">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                    </svg>
                  </button>
                  
                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <button 
                      className="text-white hover:text-blips-purple"
                      onClick={toggleMute}
                    >
                      {isMuted ? (
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
                      className="w-24 h-1 bg-white/30 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blips-purple"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button className="text-white hover:text-blips-purple">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  
                  <button 
                    className="text-white hover:text-blips-purple"
                    onClick={handleSaveToggle}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill={isSaved ? "currentColor" : "none"} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Film Details and Recommendations */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Film Info */}
          <div className="lg:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{film.title}</h1>
            
            <div className="flex items-center mb-6">
              <div className="flex items-center text-blips-text-secondary">
                <span className="mr-2">{film.createdAt ? new Date(film.createdAt).getFullYear() : new Date().getFullYear()}</span>
                <span className="mx-2">•</span>
                <span className="mx-2">{formatTime(film.duration || 0)}</span>
                <span className="mx-2">•</span>
                <span className="mx-2">{film.category || 'Other'}</span>
              </div>
              
              {/* Match percentage based on tags or category match */}
              <div className="ml-auto flex items-center">
                <span className="text-green-500 font-bold mr-2">95% Match</span>
                <div className="flex space-x-1">
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-yellow-400">★</span>
                  <span className="text-blips-text-secondary">★</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blips-dark rounded-lg p-6 mb-8">
              <p className="mb-6">{film.description || 'No description available.'}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-blips-text-secondary mb-1">Director</h3>
                  <p>{film.creator?.displayName || film.creator?.username || 'Unknown'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blips-text-secondary mb-1">Release Year</h3>
                  <p>{film.createdAt ? new Date(film.createdAt).getFullYear() : new Date().getFullYear()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blips-text-secondary mb-1">Creator</h3>
                  <Link to={`/profile/${film.creator?.username || 'unknown'}`} className="text-blips-purple hover:underline">
                    @{film.creator?.username || 'unknown'}
                  </Link>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blips-text-secondary mb-1">Genre</h3>
                  <p>{film.category || 'Other'}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {/* Use real cast data if available, otherwise show placeholder */}
                  {film.cast && Array.isArray(film.cast) ? (
                    film.cast.map((actor, index) => (
                      <span key={index} className="bg-blips-card px-3 py-1 rounded-full text-sm">
                        {actor}
                      </span>
                    ))
                  ) : (
                    <span className="bg-blips-card px-3 py-1 rounded-full text-sm">
                      AI Generated Cast
                    </span>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {film.tags && Array.isArray(film.tags) && film.tags.length > 0 ? (
                    film.tags.map((tag, index) => (
                      <Link 
                        key={index}
                        to={`/explore?tag=${tag}`}
                        className="bg-blips-card px-3 py-1 rounded-full text-sm hover:bg-blips-purple hover:text-white transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))
                  ) : (
                    <span className="text-blips-text-secondary">No tags</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Engagement Actions */}
            <div className="bg-blips-dark rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center">
                <div className="flex space-x-6">
                  <button 
                    className="flex flex-col items-center text-blips-text-secondary hover:text-blips-purple"
                    onClick={() => {
                      // Open comments section
                      const commentsSection = document.getElementById('comments-section');
                      if (commentsSection) {
                        commentsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm mt-1">{film.stats?.comments || 0}</span>
                  </button>
                  
                  <button 
                    className="flex flex-col items-center text-blips-text-secondary hover:text-blips-purple"
                    onClick={handleShare}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-sm mt-1">{film.stats?.shares || 0}</span>
                  </button>
                  
                  <button 
                    className={`flex flex-col items-center ${isLiked ? 'text-red-500' : 'text-blips-text-secondary hover:text-red-500'}`}
                    onClick={handleLikeToggle}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-6 w-6" 
                      fill={isLiked ? "currentColor" : "none"} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span className="text-sm mt-1">{film.stats?.likes || 0}</span>
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    className={`btn-secondary py-2 px-4 flex items-center ${isSaved ? 'bg-blips-purple text-white' : ''}`}
                    onClick={handleSaveToggle}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 mr-1" 
                      fill={isSaved ? "currentColor" : "none"} 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {isSaved ? 'Saved' : 'Add to List'}
                  </button>
                  
                  <button 
                    className="btn-primary py-2 px-4 flex items-center"
                    onClick={togglePlayPause}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Play
                  </button>
                </div>
              </div>
            </div>
            
            {/* Comments Section */}
            <div id="comments-section" className="bg-blips-dark rounded-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>
              
              {/* Comment form */}
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <div className="flex">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-grow bg-blips-card rounded-l-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blips-purple"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !commentText.trim()}
                      className="bg-blips-purple px-4 py-2 rounded-r-md text-white disabled:opacity-50"
                    >
                      {isSubmittingComment ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Post'
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mb-6 p-4 bg-blips-card rounded-md text-center">
                  <p className="text-blips-text-secondary mb-2">Sign in to join the conversation</p>
                  <Link to="/login" className="btn-primary inline-block">Sign In</Link>
                </div>
              )}
              
              {/* Comments list */}
              <div className="space-y-4">
                {comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment._id} className="bg-blips-card p-4 rounded-md">
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 rounded-full bg-blips-purple flex items-center justify-center text-white font-bold mr-2">
                          {comment.user?.displayName?.[0] || comment.user?.username?.[0] || 'U'}
                        </div>
                        <div>
                          <Link to={`/profile/${comment.user?.username || 'unknown'}`} className="font-medium hover:text-blips-purple">
                            {comment.user?.displayName || comment.user?.username || 'User'}
                          </Link>
                          <p className="text-xs text-blips-text-secondary">
                            {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recently'} at {comment.createdAt ? new Date(comment.createdAt).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}) : ''}
                          </p>
                        </div>
                      </div>
                      <p className="mb-2">{comment.text || ''}</p>
                      <div className="flex items-center mt-2 text-sm text-blips-text-secondary">
                        <button 
                          className={`flex items-center mr-4 ${
                            (comment.likedBy && Array.isArray(comment.likedBy) && currentUser && comment.likedBy.includes(currentUser.id)) ? 'text-blips-purple' : 'hover:text-blips-purple'
                          }`}
                          onClick={() => handleCommentLike(comment._id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" 
                              className="h-4 w-4 mr-1" 
                              fill={(comment.likedBy && Array.isArray(comment.likedBy) && currentUser && comment.likedBy.includes(currentUser.id)) ? "currentColor" : "none"} 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {comment.likes || 0}
                        </button>
                        <button 
                          className="hover:text-blips-purple"
                          onClick={() => handleReplyClick(comment._id)}
                        >
                          Reply
                        </button>
                        
                        {/* Show delete button for user's own comments */}
                        {isAuthenticated && currentUser && comment.user && currentUser.id === comment.user._id && (
                          <button 
                            className="ml-4 hover:text-red-500"
                            onClick={() => handleDeleteComment(comment._id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      
                      {/* Reply section if enabled */}
                      {activeReplyId === comment._id && (
                        <div className="mt-3 pl-6 border-l-2 border-blips-dark">
                          <form onSubmit={(e) => handleReplySubmit(e, comment._id)} className="flex">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write a reply..."
                              className="flex-grow bg-blips-dark rounded-l-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-blips-purple"
                            />
                            <button
                              type="submit"
                              disabled={isSubmittingReply || !replyText.trim()}
                              className="bg-blips-purple px-4 py-2 rounded-r-md text-white disabled:opacity-50"
                            >
                              {isSubmittingReply ? <LoadingSpinner size="sm" /> : 'Reply'}
                            </button>
                          </form>
                        </div>
                      )}
                      
                      {/* Display replies if any */}
                      {comment.replies && Array.isArray(comment.replies) && comment.replies.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-blips-dark">
                          {comment.replies.map(reply => (
                            <div key={reply._id} className="bg-blips-black/20 p-3 rounded-md mb-2">
                              <div className="flex items-center mb-1">
                                <div className="w-6 h-6 rounded-full bg-blips-purple/70 flex items-center justify-center text-white text-xs font-bold mr-2">
                                  {reply.user?.displayName?.[0] || reply.user?.username?.[0] || 'U'}
                                </div>
                                <div>
                                  <Link to={`/profile/${reply.user?.username || 'unknown'}`} className="font-medium text-sm hover:text-blips-purple">
                                    {reply.user?.displayName || reply.user?.username || 'User'}
                                  </Link>
                                  <p className="text-xs text-blips-text-secondary">
                                    {reply.createdAt ? new Date(reply.createdAt).toLocaleDateString() : 'Recently'}
                                  </p>
                                </div>
                              </div>
                              <p className="text-sm">{reply.text || ''}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-blips-text-secondary text-center">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="lg:w-1/3">
            <h3 className="text-xl font-bold mb-4">More Like This</h3>
            <div className="space-y-4">
              {recommendations && recommendations.length > 0 ? (
                recommendations.map((rec) => (
                  <Link
                    key={rec._id || rec.id || `rec-${Math.random()}`}
                    to={`/films/${rec._id || rec.id}`}
                    className="flex gap-4 p-2 rounded-lg hover:bg-blips-dark transition-colors"
                  >
                    <div className="w-32 aspect-video bg-gradient-to-br from-blips-dark to-blips-card rounded-lg flex items-center justify-center relative flex-shrink-0">
                      {/* Display thumbnail if available */}
                      {rec.thumbnailUrl && typeof rec.thumbnailUrl === 'string' ? (
                        <img 
                          src={getUrl(rec.thumbnailUrl)} 
                          alt={rec.title}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 128 72"><rect width="128" height="72" fill="%23242435"/><text x="50%" y="50%" font-family="Arial" font-size="12" fill="white" text-anchor="middle" dominant-baseline="middle">Film</text></svg>`;
                          }}
                        />
                      ) : (
                        <span className="text-sm text-white opacity-30">Film</span>
                      )}
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                        {formatTime(rec.duration || 0)}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">{rec.title || 'Untitled'}</h4>
                      <p className="text-sm text-blips-text-secondary">@{rec.creator?.username || (typeof rec.creator === 'string' ? rec.creator : 'unknown')}</p>
                      <span className="text-xs text-green-500">{Math.floor(Math.random() * 30) + 70}% Match</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-blips-text-secondary text-center">No recommendations available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmDetail;