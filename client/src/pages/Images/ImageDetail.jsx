// client/src/pages/Images/ImageDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import contentService from '../../services/contentService';
import commentService from '../../services/commentService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import userService from '../../services/userService';

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedImages, setRelatedImages] = useState([]);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch image details
  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await contentService.getContentById(id);
        
        if (response && response.content) {
          const imageData = response.content;
          
          setImage(imageData);
          setIsLiked(imageData.likedBy?.includes(currentUser?.id) || false);
          setIsSaved(imageData.savedBy?.includes(currentUser?.id) || false);
          
          // Set related images if available
          if (response.similar && response.similar.length > 0) {
            setRelatedImages(response.similar);
          } else {
            // Fallback to fetch related content
            const related = await contentService.getRelatedContent(id);
            setRelatedImages(related || []);
          }
          
          // Set comments if available
          if (response.comments && response.comments.length > 0) {
            setComments(response.comments);
          } else {
            // Fallback to fetch comments separately
            const commentsResponse = await commentService.getComments(id);
            setComments(commentsResponse.comments || []);
          }
        } else {
          setError('Failed to load image details');
        }
      } catch (err) {
        console.error('Error fetching image details:', err);
        setError('Failed to load image. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImageDetails();
  }, [id, currentUser]);
  
  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      // Optimistically update UI
      setIsLiked(!isLiked);
      setImage(prev => ({
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
      setImage(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          likes: !isLiked ? Math.max(0, prev.stats.likes - 1) : prev.stats.likes + 1
        }
      }));
      
      console.error('Error toggling like:', error);
    }
  };
  
 // Then replace or implement the handleFollowToggle function
const handleFollowToggle = async () => {
  if (!isAuthenticated) {
    navigate('/login');
    return;
  }
  
  try {
    setIsFollowLoading(true);
    
    // Optimistically update UI
    setIsFollowing(!isFollowing);
    
    // Call API
    if (isFollowing) {
      await userService.unfollowUser(image.creator._id);
    } else {
      await userService.followUser(image.creator._id);
    }
    
    // Update follower count
    setImage(prev => ({
      ...prev,
      creator: {
        ...prev.creator,
        followerCount: isFollowing 
          ? Math.max(0, (prev.creator.followerCount || 0) - 1) 
          : (prev.creator.followerCount || 0) + 1
      }
    }));
  } catch (error) {
    console.error('Error toggling follow:', error);
    // Revert UI state on error
    setIsFollowing(!isFollowing);
  } finally {
    setIsFollowLoading(false);
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
      setImage(prev => ({
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
      setImage(prev => ({
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
      const imageUrl = getImageUrl(image.fileUrl);
      if (!imageUrl) {
        return;
      }
      
      // Create a download link
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = image.title || 'blips-image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Record the download (optional)
      try {
        await contentService.shareContent(id, 'download');
      } catch (shareError) {
        console.error('Error recording download:', shareError);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };
  
  // Handle sharing
  const handleShare = async () => {
    try {
      const url = window.location.href;
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: image.title,
          text: image.description,
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
      
      // Update comment count in image data
      setImage(prev => ({
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
      setImage(prev => ({
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
      setImage(prev => ({
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
  
  // Helper function to get correct image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's an absolute URL, return as is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it's a relative path starting with uploads
    if (imageUrl.startsWith('/uploads')) {
      return `http://localhost:5001${imageUrl}`;
    }
    
    // If it's a relative path without leading slash
    if (imageUrl.startsWith('uploads/')) {
      return `http://localhost:5001/${imageUrl}`;
    }
    
    // Default fallback
    return `http://localhost:5001/${imageUrl}`;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !image) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500 mb-4">{error || 'Image not found'}</p>
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Image Section */}
        <div className="lg:w-2/3">
          {/* Navigation */}
          <div className="mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-blips-text-secondary hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          </div>
          
          {/* Image Display */}
          <div className="bg-blips-dark rounded-lg overflow-hidden">
            {image.fileUrl ? (
              <img 
                src={getImageUrl(image.fileUrl)}
                alt={image.title} 
                className="w-full object-contain max-h-[70vh]"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="400" viewBox="0 0 800 400"><rect width="800" height="400" fill="%23242435"/><text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">Image Not Available</text></svg>`;
                }}
              />
            ) : (
              <div className="aspect-square md:aspect-[4/3] bg-gradient-to-br from-indigo-900/20 via-blips-card to-purple-900/20 flex items-center justify-center">
                <span className="text-4xl text-white opacity-30">Image Not Available</span>
              </div>
            )}
          </div>
          
          {/* Engagement actions */}
          <div className="flex justify-between items-center mt-4 mb-6">
            <div className="flex space-x-4">
              <button 
                className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-blips-text-secondary hover:text-blips-purple'}`}
                onClick={handleLikeToggle}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{image.stats?.likes || 0}</span>
              </button>
              
              <button className="flex items-center space-x-1 text-blips-text-secondary hover:text-blips-purple">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{image.stats?.comments || 0}</span>
              </button>
              
              <button 
                className="flex items-center space-x-1 text-blips-text-secondary hover:text-blips-purple"
                onClick={handleShare}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>{image.stats?.shares || 0}</span>
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button 
                className={`flex items-center space-x-1 px-3 py-1 rounded-full ${isSaved ? 'bg-blips-purple text-white' : 'bg-blips-dark text-blips-text-secondary hover:bg-blips-card'}`}
                onClick={handleSaveToggle}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>
              
              <button 
                className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blips-dark text-blips-text-secondary hover:bg-blips-card"
                onClick={handleDownload}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download</span>
              </button>
              
              <button 
                className="flex items-center space-x-1 px-3 py-1 rounded-full bg-blips-dark text-blips-text-secondary hover:bg-blips-card"
                onClick={handleShare}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
          
          {/* Comments section */}
          <div className="bg-blips-dark rounded-lg p-6 mb-8">
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
                        <Link to={`/profile/${comment.user?.username}`} className="font-medium hover:text-blips-purple">
                          {comment.user?.displayName || comment.user?.username || 'User'}
                        </Link>
                        <p className="text-xs text-blips-text-secondary">
                          {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                    </div>
                    <p className="mb-2">{comment.text}</p>
                    <div className="flex items-center mt-2 text-sm text-blips-text-secondary">
                      <button 
                        className={`flex items-center mr-4 ${comment.likedBy?.includes(currentUser?.id) ? 'text-blips-purple' : 'hover:text-blips-purple'}`}
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
        
        {/* Sidebar - Info and Related */}
        <div className="lg:w-1/3">
          {/* Image Info */}
          <div className="bg-blips-dark rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{image.title || 'Untitled'}</h1>
            
            <div className="flex items-center mb-4">
              <Link to={`/profile/${image.creator?.username || 'user'}`} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blips-purple flex items-center justify-center text-white font-bold text-sm mr-2">
                  {image.creator?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium">{image.creator?.displayName || image.creator?.username || 'User'}</p>
                  <p className="text-xs text-blips-text-secondary">@{image.creator?.username || 'user'}</p>
                </div>
              </Link>
              
              {isAuthenticated && image.creator?.username && (
                  <button 
                    className={`ml-auto ${isFollowing ? 'btn-secondary' : 'btn-primary'} py-1 px-3 text-sm ${isFollowLoading ? 'opacity-50' : ''}`}
                    onClick={handleFollowToggle}
                    disabled={isFollowLoading}
                  >
                    {isFollowLoading ? 
                      <span className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-1" /> 
                        {isFollowing ? 'Unfollowing...' : 'Following...'}
                      </span>
                      : isFollowing ? 'Following' : 'Follow'
                    }
                  </button>
                )}
            </div>
            
            {image.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Description</h3>
                <p>{image.description}</p>
              </div>
            )}
            
            {image.tags && image.tags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag, index) => (
                    <Link 
                      key={index}
                      to={`/explore?tag=${tag}`}
                      className="bg-blips-card px-3 py-1 rounded-full text-sm hover:bg-blips-purple hover:text-white transition-colors"
                    >
                      #{typeof tag === 'string' ? tag.replace(' ', '') : tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Created</h3>
              <p>{new Date(image.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Related Images */}
          {relatedImages.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">More Like This</h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedImages.map((related, index) => (
                  <Link 
                    key={related._id || related.id || index} 
                    to={`/images/${related._id || related.id}`}
                    className="card card-hover overflow-hidden"
                  >
                    <div className="aspect-square bg-gradient-to-br from-blips-dark to-blips-card flex items-center justify-center">
                      {related.fileUrl ? (
                        <img 
                          src={getImageUrl(related.fileUrl)}
                          alt={related.title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23242435"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">Image</text></svg>`;
                          }}
                        />
                      ) : (
                        <span className="text-lg text-white opacity-30">Image</span>
                      )}
                    </div>
                    <div className="p-2">
                      <h4 className="text-sm font-medium truncate">{related.title || 'Untitled'}</h4>
                      <p className="text-xs text-blips-text-secondary truncate">@{related.creator?.username || related.creator || 'unknown'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;