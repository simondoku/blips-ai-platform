// client/src/pages/Images/components/ImageCard.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ImageCard = ({ image, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  // Default height for the card if not specified
  const cardHeight = image.height || 300;
  
  // Handle navigation to image detail page
  const handleClick = () => {
    navigate(`/images/${image._id || image.id}`);
  };
  
  // Handle button clicks without triggering navigation
  const handleButtonClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <motion.div 
      className="rounded-lg overflow-hidden bg-blips-card cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="relative">
        {/* Image */}
        <div 
          className="bg-gradient-to-br from-blips-dark to-blips-card"
          style={{ height: `${cardHeight}px` }}
        >
          {image.fileUrl ? (
            <img 
              src={image.fileUrl}
              alt={image.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl text-blips-purple opacity-30">AI</span>
            </div>
          )}
        </div>
        
        {/* Hover overlay with actions */}
        {isHovered && (
          <div className="absolute inset-0 flex flex-col justify-between p-3 bg-gradient-to-t from-black/70 to-transparent">
            {/* Top row with Save button */}
            <div className="self-end">
              <button 
                className="w-8 h-8 rounded-full bg-blips-purple flex items-center justify-center"
                onClick={handleButtonClick}
                aria-label="Save"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
            
            {/* Bottom row with action buttons */}
            <div className="flex justify-between items-center">
              <a 
                href="#" 
                className="text-white font-medium hover:text-blips-purple transition"
                onClick={handleButtonClick}
              >
                View
              </a>
              <div className="flex space-x-2">
                <button 
                  className="w-8 h-8 rounded-full bg-blips-dark/80 flex items-center justify-center"
                  onClick={handleButtonClick}
                  aria-label="Download"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button 
                  className="w-8 h-8 rounded-full bg-blips-dark/80 flex items-center justify-center"
                  onClick={handleButtonClick}
                  aria-label="Share"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Image metadata */}
      <div className="p-3">
        <h3 className="font-medium truncate">{image.title}</h3>
        <div className="flex items-center mt-1">
          <Link 
            to={`/profile/${image.creator?.username || 'unknown'}`}
            className="flex items-center"
            onClick={handleButtonClick}
          >
            <div className="w-6 h-6 rounded-full bg-blips-purple flex items-center justify-center text-xs text-white font-bold">
              {image.creator?.displayName?.charAt(0) || image.creator?.username?.charAt(0) || '?'}
            </div>
            <span className="ml-2 text-sm text-blips-text-secondary">
              @{image.creator?.username || 'unknown'}
            </span>
          </Link>
          <div className="ml-auto flex items-center text-sm text-blips-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {image.stats?.likes || 0}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImageCard;