// client/src/pages/Images/index.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { contentService } from '../../services/contentService';
import ImageGrid from './components/ImageGrid';
import CategoryFilter from './components/CategoryFilter';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const CATEGORY_OPTIONS = [
  { id: 'for-you', name: 'For You', active: true },
  { id: 'digital-art', name: 'Digital Art', active: false },
  { id: 'portraits', name: 'Portraits', active: false },
  { id: 'environments', name: 'Environments', active: false },
  { id: 'characters', name: 'Characters', active: false },
  { id: 'illustrations', name: 'Illustrations', active: false },
  { id: 'abstract', name: 'Abstract', active: false }
];

const Images = () => {
  const [categories, setCategories] = useState(CATEGORY_OPTIONS);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('for-you');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Fetch images from API
  const fetchImages = async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newPage = reset ? 1 : page;
      const params = {
        page: newPage,
        limit: 20,
        category: activeCategory !== 'for-you' ? activeCategory : undefined
      };
      
      const response = await contentService.getImages(params);
      
      if (reset) {
        setImages(response.images);
        setFilteredImages(response.images);
      } else {
        setImages(prev => [...prev, ...response.images]);
        setFilteredImages(prev => [...prev, ...response.images]);
      }
      
      setHasMore(response.pagination.page < response.pagination.pages);
      setPage(newPage + 1);
    } catch (err) {
      setError('Failed to load images. Please try again later.');
      console.error('Error fetching images:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchImages(true);
  }, [activeCategory]);
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
    setPage(1);
    setHasMore(true);
    
    setCategories(prevCategories => 
      prevCategories.map(cat => ({
        ...cat,
        active: cat.id === categoryId
      }))
    );
  };
  
  // Handle load more
  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchImages();
    }
  };
  
  return (
    <div className="min-h-screen bg-blips-black pb-12">
      {/* Category filter pills */}
      <div className="sticky top-15 bg-blips-black z-40 py-4 border-b border-blips-dark">
        <div className="container mx-auto px-4">
          <CategoryFilter 
            categories={categories}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-8">
        {error ? (
          <div className="text-center py-12">
            <h3 className="text-2xl font-bold mb-4 text-red-500">{error}</h3>
            <button 
              onClick={() => fetchImages(true)}
              className="btn-primary"
            >
              Try Again
            </button>
          </div>
        ) : images.length > 0 ? (
          <>
            <ImageGrid images={filteredImages} />
            
            {/* Load more button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="btn-secondary py-2 px-6 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
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
      <Link 
        to="/upload"
        className="fixed bottom-6 right-6 md:hidden w-14 h-14 rounded-full bg-blips-purple text-white flex items-center justify-center shadow-lg"
        aria-label="Upload new content"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
};

export default Images;