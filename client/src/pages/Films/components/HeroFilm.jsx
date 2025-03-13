// client/src/pages/Films/components/HeroFilm.jsx
import { motion } from 'framer-motion';

const HeroFilm = ({ film }) => {
  return (
    <div className="relative h-[70vh] mb-20">
      {/* Background image placeholder */}
      <div className="absolute inset-0 bg-gradient-to-b from-blips-dark to-blips-black overflow-hidden">
        {/* This would be a actual background image in production */}
        <div className="absolute inset-0 bg-blips-purple/10"></div>
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-blips-black to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-blips-black via-transparent to-transparent"></div>
      </div>
      
      {/* Content */}
      <div className="relative container mx-auto h-full px-6 flex flex-col justify-end pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-xl"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{film.title.toUpperCase()}</h1>
          
          <div className="flex items-center space-x-2 text-sm text-blips-text-secondary mb-4">
            <span>{new Date().getFullYear()}</span>
            <span className="w-1 h-1 rounded-full bg-blips-text-secondary"></span>
            <span>{film.duration} min</span>
            <span className="w-1 h-1 rounded-full bg-blips-text-secondary"></span>
            <span>{film.tags[0].toUpperCase()}</span>
          </div>
          
          <p className="text-white/90 mb-6 text-sm md:text-base">{film.description}</p>
          
          <div className="flex flex-wrap gap-3">
            <motion.button 
              className="bg-blips-purple hover:bg-blips-purple-dark text-white px-6 py-3 rounded flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Play
            </motion.button>
            
            <motion.button 
              className="bg-blips-dark hover:bg-blips-card text-white px-6 py-3 rounded flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
              </svg>
              My List
            </motion.button>
            
            <motion.button 
              className="bg-blips-dark hover:bg-blips-card text-white px-6 py-3 rounded flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Info
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroFilm;