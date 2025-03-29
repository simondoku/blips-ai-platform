// client/src/pages/Films/components/FilmCard.jsx
// With fixes for object to primitive conversion errors

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FilmCard = ({ film, index }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  
  // Validate film object
  if (!film || typeof film !== 'object') {
    console.error('Invalid film object:', typeof film === 'object' ? 'Empty object' : typeof film);
    return null; // Don't render anything if film is invalid
  }

  // Ensure required properties exist
  const safeFilm = {
    id: film.id || 'unknown',
    title: film.title || 'Untitled Film',
    description: film.description || 'No description available',
    duration: typeof film.duration === 'number' ? film.duration : 0,
    year: film.year || new Date().getFullYear(),
    thumbnailUrl: typeof film.thumbnailUrl === 'string' ? film.thumbnailUrl : null,
    tags: Array.isArray(film.tags) ? film.tags : [],
    category: film.category || 'Film',
    matchPercentage: typeof film.matchPercentage === 'number' ? film.matchPercentage : 75
  };
  
  // Format duration
  const formatDuration = (durationInSeconds) => {
    if (!durationInSeconds || typeof durationInSeconds !== 'number') return '0 min';
    const minutes = Math.floor(durationInSeconds / 60);
    return `${minutes} min`;
  };
  
  // Add function to navigate to detail page
  const navigateToDetail = () => {
    navigate(`/films/${safeFilm.id}`);
  };
  
  // Prevent navigation when clicking on action buttons
  const handleButtonClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <motion.div 
      className="flex-shrink-0 relative cursor-pointer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={navigateToDetail}
    >
      {/* Base card */}
      <motion.div 
        className="w-64 h-36 rounded-md overflow-hidden bg-blips-card"
        animate={{ 
          scale: isHovered ? 1.1 : 1,
          zIndex: isHovered ? 10 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Film thumbnail */}
        <div className="w-full h-full bg-gradient-to-br from-blips-dark via-blips-card to-blips-purple/30 flex items-center justify-center relative">
          {safeFilm.thumbnailUrl ? (
            <img 
              src={safeFilm.thumbnailUrl}
              alt={safeFilm.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = null;
                e.target.parentElement.innerHTML = `<span class="text-xl text-white opacity-40">${safeFilm.title}</span>`;
              }}
            />
          ) : (
            <span className="text-xl text-white opacity-40">{safeFilm.title}</span>
          )}
          
          {/* Duration badge */}
          <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {formatDuration(safeFilm.duration)}
          </div>
        </div>
      </motion.div>
      
      {/* Expanded content on hover */}
      {isHovered && (
        <motion.div 
          className="absolute top-0 left-0 w-64 bg-blips-dark rounded-md overflow-hidden shadow-lg z-20"
          initial={{ opacity: 0, height: '9rem' /* Same as base card */ }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          {/* Thumbnail with play button overlay */}
          <div className="relative">
            <div className="w-full h-36 bg-gradient-to-br from-blips-dark via-blips-card to-blips-purple/30 flex items-center justify-center">
              {safeFilm.thumbnailUrl ? (
                <img 
                  src={safeFilm.thumbnailUrl}
                  alt={safeFilm.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = null;
                    e.target.parentElement.innerHTML = `<span class="text-xl text-white opacity-40">${safeFilm.title}</span>`;
                  }}
                />
              ) : (
                <span className="text-xl text-white opacity-40">{safeFilm.title}</span>
              )}
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button 
                className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToDetail();
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </motion.button>
            </div>
          </div>
          
          {/* Film details */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <motion.button 
                  className="w-8 h-8 rounded-full bg-blips-purple flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleButtonClick}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                
                <motion.button 
                  className="w-8 h-8 rounded-full bg-blips-dark border border-white/20 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleButtonClick}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                  </svg>
                </motion.button>
              </div>
              
              <motion.button 
                className="w-8 h-8 rounded-full bg-blips-dark border border-white/20 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleButtonClick}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </motion.button>
            </div>
            
            <div className="flex items-center text-sm mb-2">
              <span className="text-green-500 font-bold">{safeFilm.matchPercentage}% Match</span>
              <span className="mx-2 text-blips-text-secondary">{formatDuration(safeFilm.duration)}</span>
              <span className="text-blips-text-secondary">{safeFilm.year}</span>
            </div>
            
            <p className="text-xs text-white mb-2 line-clamp-2">{safeFilm.description}</p>
            
            <div className="flex flex-wrap gap-1">
              {safeFilm.tags && safeFilm.tags.length > 0 ? (
                safeFilm.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs px-2 py-1 bg-blips-card rounded-full text-blips-text-secondary"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-xs px-2 py-1 bg-blips-card rounded-full text-blips-text-secondary">
                  {safeFilm.category}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FilmCard;