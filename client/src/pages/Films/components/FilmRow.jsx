// client/src/pages/Films/components/FilmRow.jsx
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import FilmCard from './FilmCard';

const FilmRow = ({ title, films, delay = 0 }) => {
  const [showControls, setShowControls] = useState(false);
  const rowRef = useRef(null);
  
  const scroll = (direction) => {
    const { current } = rowRef;
    if (current) {
      const scrollAmount = direction === 'left' 
        ? -current.offsetWidth * 0.75 
        : current.offsetWidth * 0.75;
      
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  
  return (
    <motion.section 
      className="px-6 mb-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="container mx-auto">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        
        <div className="relative">
          {/* Left scroll button */}
          <button 
            className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-32 flex items-center justify-center z-10 bg-gradient-to-r from-blips-black to-transparent ${
              showControls ? 'opacity-100' : 'opacity-0'
            } transition-opacity`}
            onClick={() => scroll('left')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Films row */}
          <div 
            ref={rowRef}
            className="flex overflow-x-auto space-x-4 scrollbar-hide py-2"
            style={{ scrollBehavior: 'smooth' }}
          >
            {films.map((film, index) => (
              <FilmCard 
                key={film.id} 
                film={film} 
                index={index}
              />
            ))}
          </div>
          
          {/* Right scroll button */}
          <button 
            className={`absolute right-0 top-1/2 -translate-y-1/2 w-12 h-32 flex items-center justify-center z-10 bg-gradient-to-l from-blips-black to-transparent ${
              showControls ? 'opacity-100' : 'opacity-0'
            } transition-opacity`}
            onClick={() => scroll('right')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default FilmRow;