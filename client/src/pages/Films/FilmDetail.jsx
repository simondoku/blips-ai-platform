// client/src/pages/Films/FilmDetail.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FilmDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [film, setFilm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const videoRef = useRef(null);
  
  // Mock data
  useEffect(() => {
    setTimeout(() => {
      setFilm({
        id,
        title: `AI Film: Digital Dreams #${id}`,
        description: "An AI-generated short film exploring the boundary between reality and digital existence. This experimental piece combines multiple generation techniques to create a narrative-driven visual experience.",
        creator: {
          id: 'creator3',
          username: 'digital_auteur',
          displayName: 'Digital Auteur',
          isFollowing: false
        },
        stats: {
          likes: 8753,
          comments: 342,
          shares: 1267,
          saves: 3459
        },
        tags: ['film', 'narrative', 'experimental', 'scifi'],
        createdAt: new Date().toISOString(),
        duration: 720, // 12 minutes in seconds
        thumbnailUrl: null, // In a real app this would be a URL
        videoUrl: null,
        cast: ['AI Character 1', 'AI Character 2', 'AI Character 3'],
        director: 'Digital Auteur',
        genre: 'Science Fiction',
        releaseYear: new Date().getFullYear()
      });
      
      // Recommendations
      setRecommendations(
        Array.from({ length: 6 }).map((_, index) => ({
          id: `rec-${index}`,
          title: `AI Film: ${['Neon Dreams', 'Virtual Echo', 'Digital Odyssey', 'Synthetic Reality', 'Binary Visions', 'Neural Narratives'][index % 6]}`,
          creator: `creator${index % 5}`,
          duration: (Math.floor(Math.random() * 15) + 5) * 60, // 5-20 minutes
          thumbnailUrl: null,
          matchPercentage: Math.floor(Math.random() * 30) + 70 // 70-99%
        }))
      );
      
      setIsLoading(false);
    }, 1000);
  }, [id]);
  
  // Format time from seconds to MM:SS or HH:MM:SS
  const formatTime = (timeInSeconds) => {
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
    // In a real app, this would control the actual video
    // if (videoRef.current) {
    //   if (isPlaying) {
    //     videoRef.current.pause();
    //   } else {
    //     videoRef.current.play();
    //   }
    // }
  };
  
  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // if (videoRef.current) {
    //   videoRef.current.muted = !isMuted;
    // }
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    // if (videoRef.current) {
    //   videoRef.current.volume = newVolume;
    // }
  };
  
  // Handle progress change (seeking)
  const handleProgressChange = (e) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    // if (videoRef.current) {
    //   videoRef.current.currentTime = (newProgress / 100) * videoRef.current.duration;
    // }
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
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
        {/* Video Placeholder */}
        <div 
          className="aspect-video w-full bg-gradient-to-br from-blips-card to-purple-900/20 flex items-center justify-center cursor-pointer"
          onClick={togglePlayPause}
          ref={videoRef}
        >
          <span className="text-4xl text-white opacity-30">AI Film</span>
        </div>
        
        {/* Video Controls Overlay */}
        <div className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
          {/* Top Bar - Back button and title */}
          <div className="p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="container mx-auto flex items-center">
              <button 
                onClick={() => navigate(-1)}
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
                  {formatTime(Math.floor(film.duration * (progress / 100)))}
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
                  {formatTime(film.duration)}
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
                  
                  <button className="text-white hover:text-blips-purple">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <span className="mr-2">{new Date(film.createdAt).getFullYear()}</span>
                <span className="mx-2">•</span>
                <span className="mx-2">{formatTime(film.duration)}</span>
                <span className="mx-2">•</span>
                <span className="mx-2">{film.genre}</span>
              </div>
              
              {/* Match percentage */}
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
              <p className="mb-6">{film.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-blips-text-secondary mb-1">Director</h3>
                  <p>{film.director}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blips-text-secondary mb-1">Release Year</h3>
                  <p>{film.releaseYear}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blips-text-secondary mb-1">Creator</h3>
                  <Link to={`/profile/${film.creator.username}`} className="text-blips-purple hover:underline">
                    @{film.creator.username}
                  </Link>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-blips-text-secondary mb-1">Genre</h3>
                  <p>{film.genre}</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {film.cast.map((actor, index) => (
                    <span key={index} className="bg-blips-card px-3 py-1 rounded-full text-sm">
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {film.tags.map((tag, index) => (
                    <Link 
                      key={index}
                      to={`/explore?tag=${tag}`}
                      className="bg-blips-card px-3 py-1 rounded-full text-sm hover:bg-blips-purple hover:text-white transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Engagement Actions */}
            <div className="bg-blips-dark rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center">
                <div className="flex space-x-6">
                  <button className="flex flex-col items-center text-blips-text-secondary hover:text-blips-purple">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm mt-1">{film.stats.comments.toLocaleString()}</span>
                  </button>
                  
                  <button className="flex flex-col items-center text-blips-text-secondary hover:text-blips-purple">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-sm mt-1">{film.stats.shares.toLocaleString()}</span>
                  </button>
                </div>
                
                <div className="flex space-x-2">
                  <button className="btn-secondary py-2 px-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    Add to List
                  </button>
                  
                  <button className="btn-primary py-2 px-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Play
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="lg:w-1/3">
            <h3 className="text-xl font-bold mb-4">More Like This</h3>
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  to={`/films/${rec.id}`}
                  className="flex gap-4 p-2 rounded-lg hover:bg-blips-dark transition-colors"
                >
                  <div className="w-32 aspect-video bg-gradient-to-br from-blips-dark to-blips-card rounded-lg flex items-center justify-center relative flex-shrink-0">
                    <span className="text-sm text-white opacity-30">Film</span>
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                      {formatTime(rec.duration)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium">{rec.title}</h4>
                    <p className="text-sm text-blips-text-secondary">@{rec.creator}</p>
                    <span className="text-xs text-green-500">{rec.matchPercentage}% Match</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmDetail;