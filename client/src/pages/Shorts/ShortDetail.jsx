// client/src/pages/Shorts/ShortDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import contentService from '../../services/contentService';
import commentService from '../../services/commentService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const ShortDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const playerRef = useRef(null);
  
  // Fetch video details
  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        const response = await contentService.getContentById(id);
        
        if (!response || !response.content) {
          setError('Failed to load video details');
          setIsLoading(false);
          return;
        }
        
        const videoData = response.content;
        
        // Make sure it's a video
        if (videoData.contentType !== 'short') {
          setError('This content is not a short video');
          setIsLoading(false);
          return;
        }
        
        setVideo(videoData);
        setIsLiked(videoData.likedBy?.includes(currentUser?.id) || false);
        setIsSaved(videoData.savedBy?.includes(currentUser?.id) || false);
        
        // Set similar videos if available
        if (response.similar && response.similar.length > 0) {
          setSimilar(response.similar);
        } else {
          // Fallback to fetch related content
          const relatedVideos = await contentService.getRelatedContent(id);
          setSimilar(relatedVideos || []);
        }
        
        // Set comments if available
        if (response.comments && response.comments.length > 0) {
          setComments(response.comments);
        } else {
          // Fallback to fetch comments separately
          const commentsResponse = await commentService.getComments(id);
          setComments(commentsResponse.comments || []);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching video details:', err);
        setError('Failed to load video details');
        setIsLoading(false);
      }
    };
    
    fetchVideoDetails();
  }, [id, currentUser]);
  
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
    setIsMuted(newVolume === 0);
    
    if (playerRef.current) {
      playerRef.current.volume = newVolume;
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (playerRef.current) {
      playerRef.current.muted = !isMuted;
    }
  };
  
  // Handle seeking
  const handleSeek = (e) => {
    const newProgress = parseFloat(e.target.value) / 100;
    setProgress(newProgress);
    
    if (playerRef.current && playerRef.current.seekTo) {
      playerRef.current.seekTo(newProgress);
    }
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
      setVideo(prev => ({
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
      setVideo(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          likes: !isLiked ? Math.max(0, prev.stats.likes - 1) : prev.stats.likes + 1
        }
      }));
      
      console.error('Error toggling like:', error);
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
      setVideo(prev => ({
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
      setVideo(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          saves: !isSaved ? Math.max(0, prev.stats.saves - 1) : prev.stats.saves + 1
        }
      }));
      
      console.error('Error toggling save:', error);
    }
  };
  
  // Handle downloads
  const handleDownload = async () => {
    try {
      const videoUrl = getUrl(video.fileUrl);
      if (!videoUrl) {
        return;
      }
      
      // Create a download link
      const link = document.createElement('a');
      link.href = videoUrl;
      link.download = video.title || 'blips-short';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Record the download
      try {
        await contentService.shareContent(id, 'download');
      } catch (shareError) {
        console.error('Error recording download:', shareError);
      }
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };
  
  // Handle sharing
  const handleShare = async () => {
    try {
      const url = window.location.href;
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
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
        
        // Update UI
        setVideo(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            shares: prev.stats.shares + 1
          }
        }));
      } catch (shareError) {
        console.error('Error recording share:', shareError);
      }
    } catch (error) {
      console.error('Error sharing:', error);
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
      
      // Update comment count in video data
      setVideo(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          comments: prev.stats.comments + 1
        }
      }));
    } catch (error) {
      console.error('Error adding comment:', error);
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
      console.error('Error toggling comment like:', error);
      // Refresh comments to reset UI
      const commentsResponse = await commentService.getComments(id);
      setComments(commentsResponse.comments || []);
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
      setVideo(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          comments: prev.stats.comments + 1
        }
      }));
    } catch (error) {
      console.error('Error adding reply:', error);
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
      setVideo(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          comments: Math.max(0, prev.stats.comments - 1)
        }
      }));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  // Helper function to get correct URL
  const getUrl = (url) => {
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
  
  // Function to navigate back
  const handleGoBack = () => {
    navigate(-1);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-500 mb-4">{error || 'Video not found'}</div>
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
  const videoUrl = getUrl(video.fileUrl);
  
  return (
    <div className="h-[calc(100vh-60px)] bg-blips-black flex">
      {/* Back button */}
      <button 
        onClick={handleGoBack}
        className="absolute top-20 left-4 z-50 bg-blips-dark/50 hover:bg-blips-dark p-2 rounded-full backdrop-blur-sm"
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
            {videoUrl ? (
              <ReactPlayer
                ref={playerRef}
                url={videoUrl}
                width="100%"
                height="100%"
                playing={isPlaying}
                loop={false}
                volume={volume}
                muted={isMuted}
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
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blips-purple/20 to-blips-dark flex items-center justify-center">
                <div className="text-4xl text-white opacity-50">Video Unavailable</div>
              </div>
            )}
            
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
              <h3 className="text-white font-bold text-lg">{video.title || 'Untitled'}</h3>
              <Link to={`/profile/${video.creator?.username}`} className="text-white/80 text-sm mb-2 hover:text-blips-purple">
                @{video.creator?.username}
              </Link>
              <p className="text-white/90 text-sm">{video.description || ''}</p>
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
                  className="w-16 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Right sidebar - video interactions */}
      <aside className="w-16 md:w-20 border-l border-blips-dark flex flex-col items-center">
        <div className="h-full py-4 flex flex-col items-center justify-center">
          {/* Creator Avatar */}
          <div className="mb-8 relative">
            <Link
              to={`/profile/${video.creator?.username}`} 
              className="w-12 h-12 rounded-full bg-blips-purple flex items-center justify-center text-white text-xl font-bold"
            >
              {video.creator?.displayName?.[0] || video.creator?.username?.[0] || 'U'}
            </Link>
            
            {isAuthenticated && video.creator?.username && (
              <motion.button 
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center bg-blips-dark hover:bg-blips-purple transition-colors"
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Follow/unfollow functionality would go here
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </motion.button>
            )}
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
                fill={isLiked ? "currentColor" : "none"}
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                />
              </svg>
            </motion.button>
            <span className="text-xs text-white mt-1">{video.stats?.likes || 0}</span>
          </div>
          
          {/* Comment Button */}
          <div className="mb-6 flex flex-col items-center">
            <motion.button 
              className="w-12 h-12 rounded-full bg-blips-dark flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                // Toggle comment drawer visibility
                const drawer = document.getElementById('comments-drawer');
                if (drawer) {
                  drawer.classList.toggle('translate-y-full');
                  drawer.classList.toggle('translate-y-0');
                }
              }}
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
              onClick={handleShare}
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
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isSaved ? 'bg-blips-purple bg-opacity-20' : 'bg-blips-dark'
              }`}
              whileTap={{ scale: 0.9 }}
              onClick={handleSaveToggle}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-6 w-6 ${isSaved ? 'text-blips-purple' : 'text-white'}`}
                fill={isSaved ? "currentColor" : "none"}
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
            <span className="text-xs text-white mt-1">{video.stats?.saves || 0}</span>
          </div>
          
          {/* Download Button */}
          <div className="mb-6 flex flex-col items-center">
            <motion.button 
              className="w-12 h-12 rounded-full bg-blips-dark flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              onClick={handleDownload}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </motion.button>
            <span className="text-xs text-white mt-1">Download</span>
          </div>
        </div>
      </aside>
      
      {/* Comment section - sliding drawer */}
      <div className="fixed bottom-0 left-0 right-0 transform translate-y-full bg-blips-dark rounded-t-lg shadow-lg transition-transform duration-300 ease-in-out z-50" id="comments-drawer">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Comments ({comments.length})</h3>
            <button className="text-blips-text-secondary" onClick={() => {
              const drawer = document.getElementById('comments-drawer');
              if (drawer) {
                drawer.classList.add('translate-y-full');
                drawer.classList.remove('translate-y-0');
              }
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Comment form */}
          {isAuthenticated ? (
            <form onSubmit={handleCommentSubmit} className="mb-4">
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
            <div className="mb-4 p-4 bg-blips-card rounded-md text-center">
              <p className="text-blips-text-secondary mb-2">Sign in to join the conversation</p>
              <Link to="/login" className="btn-primary inline-block">Sign In</Link>
            </div>
          )}
          
          {/* Comments list */}
          <div className="max-h-96 overflow-y-auto">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment._id} className="bg-blips-card p-4 rounded-md mb-2">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-blips-purple flex items-center justify-center text-white font-bold mr-2">
                      {comment.user?.displayName?.[0] || comment.user?.username?.[0] || 'U'}
                    </div>
                    <div>
                      <Link to={`/profile/${comment.user?.username}`} className="font-medium hover:text-blips-purple">
                        {comment.user?.displayName || comment.user?.username || 'User'}
                      </Link>
                      <p className="text-xs text-blips-text-secondary">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p>{comment.text}</p>
                  <div className="flex items-center mt-2 text-sm text-blips-text-secondary">
                    <button 
                      className={`flex items-center hover:text-blips-purple mr-4 ${
                        comment.likedBy?.includes(currentUser?.id) ? 'text-blips-purple' : ''
                      }`}
                      onClick={() => handleCommentLike(comment._id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-1" 
                        fill={comment.likedBy?.includes(currentUser?.id) ? "currentColor" : "none"} 
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
                    {isAuthenticated && currentUser?.id === comment.user?._id && (
                      <button 
                        className="ml-4 hover:text-red-500"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  
                  {/* Reply form */}
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
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-blips-dark">
                      {comment.replies.map(reply => (
                        <div key={reply._id} className="bg-blips-black/20 p-3 rounded-md mb-2">
                          <div className="flex items-center mb-1">
                            <div className="w-6 h-6 rounded-full bg-blips-purple/70 flex items-center justify-center text-white text-xs font-bold mr-2">
                              {reply.user?.displayName?.[0] || reply.user?.username?.[0] || 'U'}
                            </div>
                            <div>
                              <Link to={`/profile/${reply.user?.username}`} className="font-medium text-sm hover:text-blips-purple">
                                {reply.user?.displayName || reply.user?.username || 'User'}
                              </Link>
                              <p className="text-xs text-blips-text-secondary">
                                {new Date(reply.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm">{reply.text}</p>
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
    </div>
  );
};

export default ShortDetail;