// client/src/pages/Shorts/components/VideoPlayer.jsx
import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ video, isAutoplay, onEnded }) => {
  const [isPlaying, setIsPlaying] = useState(isAutoplay);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const playerRef = useRef(null);
  
  // Reset state when video changes
  useEffect(() => {
    setIsPlaying(isAutoplay);
    setProgress(0);
    setIsVideoReady(false);
  }, [video, isAutoplay]);
  
  // In a real app, this would be the actual video URL
  const videoUrl = `https://example.com/videos/${video.id}`;
  
  // Toggle play/pause on click
  const handleVideoClick = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Update progress
  const handleProgress = (state) => {
    setProgress(state.played);
  };
  
  // Video is ready to play
  const handleReady = () => {
    setIsVideoReady(true);
  };
  
  return (
    <div className="relative w-full h-full bg-blips-black overflow-hidden">
      {/* For development, we'll use a colored div instead of an actual video */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blips-purple/20 to-blips-dark flex items-center justify-center cursor-pointer"
        onClick={handleVideoClick}
      >
        {/* This would be replaced with an actual ReactPlayer in production */}
        <div className="text-4xl text-white opacity-50">AI Video</div>
        
        {/* Play/Pause overlay */}
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
      
      {/* In a real implementation, this would be uncommented */}
      {/* 
      <ReactPlayer
        ref={playerRef}
        url={videoUrl}
        width="100%"
        height="100%"
        playing={isPlaying}
        loop={false}
        volume={1}
        muted={false}
        playsinline
        onEnded={onEnded}
        onProgress={handleProgress}
        onReady={handleReady}
        onClick={handleVideoClick}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      */}
      
      {/* Video Creator Info */}
      <div className="absolute bottom-20 left-4 right-12 z-10">
        <h3 className="text-white font-bold text-lg">{video.creator.displayName}</h3>
        <p className="text-white/80 text-sm mb-2">@{video.creator.username}</p>
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
          onClick={() => setIsPlaying(!isPlaying)}
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
        
        {/* Simulate time display */}
        <div className="text-white/80 text-xs">
          {Math.floor(progress * video.duration)}s / {video.duration}s
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;