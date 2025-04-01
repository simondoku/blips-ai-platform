// client/src/components/common/Logo.jsx
import React from 'react';
import logoImage from './LogoNoText.png'; // Import the image

const Logo = ({ size = 'default' }) => {
  // Define sizes
  const sizes = {
    small: {
      container: 'h-6',
      logo: 'w-6 h-6',
      text: 'text-base ml-2'
    },
    default: {
      container: 'h-8',
      logo: 'w-8 h-8',
      text: 'text-xl ml-2 font-bold'
    },
    large: {
      container: 'h-12',
      logo: 'w-12 h-12',
      text: 'text-3xl ml-3 font-bold'
    }
  };
  
  const { container, logo, text } = sizes[size] || sizes.default;
  
  return (
    <div className={`flex items-center ${container}`}>
      {/* Logo Image */}
      <div className={`${logo} flex items-center justify-center`}>
        <img 
          src={logoImage} 
          alt="Blips AI Logo" 
          className="w-full h-full object-contain"
        />
      </div>
      
      {/* Logo Text */}
      <span className={`${text} text-white`}>BLIPS AI</span>
    </div>
  );
};

export default Logo;