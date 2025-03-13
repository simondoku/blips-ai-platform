// client/src/components/common/Logo.jsx
import React from 'react';

const Logo = ({ size = 'default' }) => {
  // Define sizes
  const sizes = {
    small: {
      container: 'h-6',
      circle: 'w-6 h-6',
      text: 'text-base ml-2'
    },
    default: {
      container: 'h-8',
      circle: 'w-8 h-8',
      text: 'text-xl ml-2 font-bold'
    },
    large: {
      container: 'h-12',
      circle: 'w-12 h-12',
      text: 'text-3xl ml-3 font-bold'
    }
  };
  
  const { container, circle, text } = sizes[size] || sizes.default;
  
  return (
    <div className={`flex items-center ${container}`}>
      {/* Logo Circle */}
      <div className={`${circle} rounded-full bg-blips-purple flex items-center justify-center`}>
        {/* Optional: Add an icon inside the circle */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="white" 
          className="w-4/6 h-4/6"
        >
          <path 
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16h-2v-6h2v6zm4 0h-2v-6h2v6zm0-8h-6V8h6v2z" 
          />
        </svg>
      </div>
      
      {/* Logo Text */}
      <span className={`${text} text-white`}>BLIPS AI</span>
    </div>
  );
};

export default Logo;