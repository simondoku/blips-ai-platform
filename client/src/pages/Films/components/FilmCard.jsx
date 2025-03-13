// client/src/pages/Films/components/FilmCard.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

const FilmCard = ({ film, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Delay to stagger animations
  const delay = index * 0.05;
  
  return (
    <motion.div 
      className="flex-shrink-0 relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        {/* Film thumbnail placeholder */}
        <div className="w-full h-full bg-gradient-to-br from-blips-dark via-blips-card to-blips-purple/30 flex items-center justify-center">
          <span className="text-xl text-white opacity-40">{film.title}</span>
        </div>
      </motion.div>
      
      {/* Expanded content on hover */}
      {isHovered && (
        <motion.div 
          className="absolute top-0 left-0 w-64 bg-blips-dark rounded-md overflow-hidden shadow-xl z-20"
          initial={{ opacity: 0, height: '9rem' /* Same as base card */ }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
        >
          {/* Thumbnail with play button overlay */}
          <div className="relative">
            <div className="w-full h-36 bg-gradient-to-br from-blips-dark via-blips-card to-blips-purple/30 flex items-center justify-center">
              <span className="text-xl text-white opacity-40">{film.title}</span>
            </div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button 
                className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
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
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </motion.button>
                
                <motion.button 
                  className="w-8 h-8 rounded-full bg-blips-dark border border-white/20 flex items-center justify-center"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </motion.button>
            </div>
            
            <div className="flex items-center text-sm mb-2">
              <span className="text-green-500 font-bold">{film.matchPercentage}% Match</span>
              <span className="mx-2 text-blips-text-secondary">{film.duration} min</span>
              <span className="text-blips-text-secondary">{film.year}</span>
            </div>
            
            <p className="text-xs text-white mb-2 line-clamp-2">{film.description}</p>
            
            <div className="flex flex-wrap gap-1">
              {film.tags.map((tag, idx) => (
                <span key={idx} className="text-xs px-2 py-1 bg-blips-card rounded-full text-blips-text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FilmCard;