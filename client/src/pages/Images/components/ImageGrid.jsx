// client/src/pages/Images/components/ImageGrid.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ImageCard from './ImageCard';

const ImageGrid = ({ images }) => {
  const [columns, setColumns] = useState(4);
  
  // Adjust column count based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumns(1);
      } else if (window.innerWidth < 768) {
        setColumns(2);
      } else if (window.innerWidth < 1024) {
        setColumns(3);
      } else {
        setColumns(4);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Distribute images into columns for masonry layout
  const getColumnImages = () => {
    if (!images || images.length === 0) {
      return Array(columns).fill([]);
    }
    
    const columnImages = Array.from({ length: columns }, () => []);
    
    images.forEach((image, i) => {
      // Find the shortest column to add the next image
      const shortestColumnIndex = columnImages
        .map(column => column.reduce((acc, img) => acc + (img.height || 300), 0))
        .reduce((minIndex, height, i, heights) => 
          height < heights[minIndex] ? i : minIndex, 0);
      
      columnImages[shortestColumnIndex].push(image);
    });
    
    return columnImages;
  };
  
  const columnImages = getColumnImages();
  
  return (
    <motion.div 
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {columnImages.map((column, columnIndex) => (
        <div key={`column-${columnIndex}`} className="flex flex-col gap-4">
          {column.map((image, imageIndex) => (
            <ImageCard 
              key={image._id || image.id} 
              image={image} 
              index={imageIndex}
            />
          ))}
        </div>
      ))}
    </motion.div>
  );
};

export default ImageGrid;