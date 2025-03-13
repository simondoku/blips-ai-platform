// client/src/pages/Shorts/ShortDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ShortDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [similarVideos, setSimilarVideos] = useState([]);
  const videoRef = useRef(null);
  
  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setVideo({
        id,
        title: `AI Short #${id}`,
        description: "This AI-generated short clip explores abstract motion and color patterns. Created using neural video synthesis with custom style transfer.",
        creator: {
          id: 'creator2',
          username: 'motion_maestro',
          displayName: 'Motion Maestro',
          isFollowing: true
        },
        stats: {
          likes: 5128,
          comments: 243,
          shares: 867,
          saves: 432
        },
        tags: ['animation', 'abstract', 'motion', 'colorful'],
        createdAt: new Date().toISOString(),
        duration: 30, // seconds
        videoUrl: null // In a real app this would be a URL
      });
      
      // Mock comments
      setComments([
        {
          id: 'comment1',
          user: {
            username: 'art_enthusiast',
            displayName: 'Art Enthusiast'
          },
          text: 'This is absolutely mesmerizing! The way the colors flow is incredible.',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          likes: 24
        },
        {
          id: 'comment2',
          user: {
            username: 'tech_geek',
            displayName: 'Tech Geek'
          },
          text: 'What model did you use to generate this? The quality is top-notch!',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          likes: 12
        },
        {
          id: 'comment3',
          user: {
            username: 'digital_dreamer',
            displayName: 'Digital Dreamer'
          },
          text: 'The transitions are so smooth. Amazing work!',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          likes: 8
        }
      ]);
      
      // Similar videos
      setSimilarVideos(
        Array.from({ length: 4 }).map((_, index) => ({
          id: `similar-${index}`,
          title: `Similar Short #${index + 1}`,
          creator: `creator${index % 5}`,
          stats: {
            likes: Math.floor(Math.random() * 1000)
          },
          duration: Math.floor(Math.random() * 45) + 15 // 15-60 seconds
        }))
      );
      
      setIsLoading(false);
    }, 1000);
  }, [id]);
  
  // Handle play/pause
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control the actual video
    // if (videoRef.current) {
    //   if (isPlaying) {
    //     videoRef.current.pause();
    //   } else {
    //     videoRef.current.play();
    //   }
    // }
  };
  
  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    // Add new comment to the list
    const newComment = {
      id: `comment-${Date.now()}`,
      user: {
        username: 'current_user',
        displayName: 'You'
      },
      text: commentText,
      createdAt: new Date().toISOString(),
      likes: 0
    };
    
    setComments([newComment, ...comments]);
    setCommentText('');
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Video Section */}
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
          
          {/* Video Player */}
          <div className="relative bg-blips-dark rounded-lg overflow-hidden">
            {/* This would be an actual video in production */}
            <div 
              className="aspect-[9/16] md:aspect-video bg-gradient-to-br from-blue-900/20 via-blips-card to-purple-900/20 flex items-center justify-center cursor-pointer"
              onClick={togglePlayPause}
              ref={videoRef}
            >
              <span className="text-4xl text-white opacity-30">AI Short Clip</span>
              
              {/* Play/Pause Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              {/* Progress Bar */}
              <div className="relative h-1 bg-white/20 rounded-full mb-2">
                <div className="absolute left-0 top-0 h-full bg-blips-purple rounded-full" style={{ width: '40%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button 
                    className="text-white"
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
                  
                  <button className="text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414-3.536 5 5 0 00-1.414-3.536M2.05 16.435a9 9 0 010-12.87" />
                    </svg>
                  </button>
                </div>
                
                <div className="text-white text-sm">
                  0:12 / {Math.floor(video.duration / 60)}:{video.duration % 60 < 10 ? '0' : ''}{video.duration % 60}
                </div>
                
                <button className="text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Video Info */}
          <div className="mt-4 mb-6">
            <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
            
            <div className="flex items-center justify-between mb-4">
              <Link to={`/profile/${video.creator.username}`} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blips-purple flex items-center justify-center text-white font-bold text-sm mr-2">
                  {video.creator.displayName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{video.creator.displayName}</p>
                  <p className="text-xs text-blips-text-secondary">@{video.creator.username}</p>
                </div>
              </Link>
              
              <button className={`btn-${video.creator.isFollowing ? 'secondary' : 'primary'} py-1 px-3 text-sm`}>
                {video.creator.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
            
            <p className="mb-4">{video.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {video.tags.map((tag, index) => (
                <Link 
                  key={index}
                  to={`/explore?tag=${tag}`}
                  className="bg-blips-card px-3 py-1 rounded-full text-sm hover:bg-blips-purple hover:text-white transition-colors"
                >
                  #{tag.replace(' ', '')}
                </Link>
              ))}
            </div>
            
            {/* Engagement Stats */}
            <div className="flex justify-between items-center bg-blips-dark rounded-lg p-4">
              <div className="flex space-x-6">
                <button className="flex flex-col items-center text-blips-text-secondary hover:text-blips-purple">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  // client/src/pages/Shorts/ShortDetail.jsx (continued)
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm mt-1">{video.stats.likes.toLocaleString()}</span>
                </button>
                
                <button className="flex flex-col items-center text-blips-text-secondary hover:text-blips-purple">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="text-sm mt-1">{video.stats.comments.toLocaleString()}</span>
                </button>
                
                <button className="flex flex-col items-center text-blips-text-secondary hover:text-blips-purple">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span className="text-sm mt-1">{video.stats.shares.toLocaleString()}</span>
                </button>
              </div>
              
              <div>
                <button className="btn-primary py-1 px-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  Save
                </button>
              </div>
            </div>
          </div>
          
          {/* Comments Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">Comments ({comments.length})</h3>
            
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full bg-blips-purple flex-shrink-0 flex items-center justify-center text-white font-bold">
                  Y
                </div>
                <div className="flex-grow">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full bg-blips-dark rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blips-purple"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post
                </button>
              </div>
            </form>
            
            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-blips-purple flex-shrink-0 flex items-center justify-center text-white font-bold">
                    {comment.user.displayName.charAt(0)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-baseline">
                      <Link to={`/profile/${comment.user.username}`} className="font-medium mr-2">
                        {comment.user.displayName}
                      </Link>
                      <span className="text-xs text-blips-text-secondary">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-1">{comment.text}</p>
                    <div className="mt-1 flex items-center text-sm text-blips-text-secondary">
                      <button className="flex items-center hover:text-blips-purple">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {comment.likes}
                      </button>
                      <button className="ml-4 hover:text-blips-purple">Reply</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sidebar - Similar Videos */}
        <div className="lg:w-1/3">
          <h3 className="text-xl font-bold mb-4">Similar Shorts</h3>
          <div className="space-y-4">
            {similarVideos.map((video) => (
              <Link
                key={video.id}
                to={`/shorts/${video.id}`}
                className="flex gap-3 p-2 rounded-lg hover:bg-blips-dark transition-colors"
              >
                <div className="w-32 h-24 bg-gradient-to-br from-blips-dark to-blips-card rounded-lg flex items-center justify-center relative flex-shrink-0">
                  <span className="text-lg text-white opacity-30">Video</span>
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                    {Math.floor(video.duration / 60)}:{video.duration % 60 < 10 ? '0' : ''}{video.duration % 60}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium">{video.title}</h4>
                  <p className="text-sm text-blips-text-secondary">@{video.creator}</p>
                  <div className="flex items-center text-xs text-blips-text-secondary mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {video.stats.likes.toLocaleString()} likes
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShortDetail;