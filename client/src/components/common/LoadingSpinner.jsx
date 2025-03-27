// client/src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  // Size classes
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4'
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <div className={`${sizeClass} border-blips-purple rounded-full animate-spin border-t-transparent ${className}`}></div>
  );
};

export default LoadingSpinner;