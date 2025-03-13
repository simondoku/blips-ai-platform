// client/src/pages/Images/index.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageGrid from './components/ImageGrid';
import CategoryFilter from './components/CategoryFilter';

// Mock data for initial development
const MOCK_CATEGORIES = [
  { id: 'for-you', name: 'For You', active: true },
  { id: 'digital-art', name: 'Digital Art', active: false },
  { id: 'portraits', name: 'Portraits', active: false },
  { id: 'environments', name: 'Environments', active: false },
  { id: 'characters', name: 'Characters', active: false },
  { id: 'illustrations', name: 'Illustrations', active: false },
  { id: 'abstract', name: 'Abstract', active: false }
];

const MOCK_IMAGES = Array.from({ length: 30 }).map((_, index) => ({
  id: `img-${index}`,
  title: `AI Artwork #${index + 1}`,
  creator: `artist${index % 10 + 1}`,
  creatorName: `AI Artist ${index % 10 + 1}`,
  height: Math.floor(Math.random() * 300) + 200, // Random height between 200-500px
  likes: Math.floor(Math.random() * 1000),
  categoryId: MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)].id
}));

const Images = () => {
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('for-you');
  const [error, setError] = useState(null);
  
  // Simulate fetching data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // In a real app, this would be an API call
        setTimeout(() => {
          setImages(MOCK_IMAGES);
          setFilteredImages(MOCK_IMAGES);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load images. Please try again later.");
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter images when category changes
  useEffect(() => {
    if (activeCategory === 'for-you') {
      setFilteredImages(images);
    } else {
      setFilteredImages(images.filter(img => img.categoryId === activeCategory));
    }
  }, [activeCategory, images]);
  
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setCategories(prevCategories => 
      prevCategories.map(cat => ({
        ...cat,
        active: cat.id === categoryId
      }))
    );
  };
  
  return (
    <div className="min-h-screen bg-blips-black pb-12">
      {/* Category filter pills */}
      <div className="sticky top-15 bg-blips-black z-40 py-4 border-b border-blips-dark">
        <div className="container mx-auto px-4">
          {categories.length > 0 ? (
            <CategoryFilter 
              categories={categories}
              onCategoryChange={handleCategoryChange}
            />
          ) : (
            <div className="h-10 bg-blips-dark animate-pulse rounded-full w-full max-w-md"></div>
          )}
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-8">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4 text-red-500">{error}</h3>
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : filteredImages.length > 0 ? (
          <ImageGrid images={filteredImages} />
        ) : (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-2">No images found</h3>
            <p className="text-blips-text-secondary mb-4">Try selecting a different category</p>
            <button 
              onClick={() => handleCategoryChange('for-you')}
              className="btn-primary"
            >
              View All Images
            </button>
          </div>
        )}
      </div>
      
      {/* Floating upload button - mobile only */}
      <motion.div 
        className="fixed bottom-6 right-6 md:hidden"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <button 
          className="w-14 h-14 rounded-full bg-blips-purple text-white flex items-center justify-center shadow-lg"
          aria-label="Upload new content"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </motion.div>
    </div>
  );
};

export default Images;