// client/src/pages/Shorts/components/VideoPlayer.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ video, isAutoplay, onEnded }) => {
  const [isPlaying, setIsPlaying] = useState(isAutoplay);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const playerRef = useRef(null);
  const navigate = useNavigate();
  
  // Reset state when video changes
  useEffect(() => {
    setIsPlaying(isAutoplay);
    setProgress(0);
    setIsVideoReady(false);
  }, [video, isAutoplay]);
  
  // Function to navigate to detail page
  const handleVideoClick = (e) => {
    // Check if the click was on a control button (to prevent navigation)
    if (e.target.closest('button')) {
      return;
    }
    
    // Navigate to detail page
    navigate(`/shorts/${video._id || video.id}`);
  };
  
  // Toggle play/pause on button click
  const togglePlayPause = (e) => {
    e.stopPropagation(); // Prevent navigation
    setIsPlaying(!isPlaying);
  };
  
  // Update progress
  const handleProgress = (state) => {
    setProgress(state.played);
  };
  
  // Toggle mute
  const toggleMute = (e) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    e.stopPropagation();
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };
  
  // Format time display
  const formatTime = (seconds) => {
    const date = new Date(seconds * 1000);
    const mm = date.getUTCMinutes();
    const ss = date.getUTCSeconds().toString().padStart(2, '0');
    return `${mm}:${ss}`;
  };
  
  // Calculate current time
  const currentTime = video?.duration ? Math.floor(progress * video.duration) : 0;
  
  // Video is ready to play
  const handleReady = () => {
    setIsVideoReady(true);
  };
  
  return (
    <div className="relative w-full h-full bg-blips-black overflow-hidden">
      {/* Video player */}
      {video.fileUrl ? (
        <ReactPlayer
          ref={playerRef}
          url={video.fileUrl}
          width="100%"
          height="100%"
          playing={isPlaying}
          loop={false}
          volume={volume}
          muted={isMuted}
          playsinline
          onEnded={onEnded}
          onProgress={handleProgress}
          onReady={handleReady}
          onClick={handleVideoClick}
          style={{ position: 'absolute', top: 0, left: 0 }}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload'
              }
            }
          }}
        />
      ) : (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blips-purple/20 to-blips-dark flex items-center justify-center cursor-pointer"
          onClick={handleVideoClick}
        >
          <div className="text-4xl text-white opacity-50">AI Video</div>
        </div>
      )}
      
      {/* Play/Pause overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-20 h-20 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm">
            <button onClick={togglePlayPause}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Video Creator Info */}
      <div className="absolute bottom-20 left-4 right-12 z-10" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-white font-bold text-lg">{video.creator?.displayName || video.creator?.username}</h3>
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
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center space-x-4">
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
          
          <span className="text-white/80 text-xs">
            {formatTime(currentTime)} / {formatTime(video?.duration || 0)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
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
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-16 accent-blips-purple"
          />
        </div>
      </div>
      
      {/* Loading indicator */}
      {!isVideoReady && video.fileUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-blips-purple/30 border-t-blips-purple rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;