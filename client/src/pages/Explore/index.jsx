// client/src/pages/Explore/index.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import contentService from '../../services/contentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Content types for filter options
const CONTENT_TYPES = [
  { id: 'all', name: 'All Content' },
  { id: 'image', name: 'Images' },
  { id: 'short', name: 'Short Clips' },
  { id: 'film', name: 'Films' }
];

// Trending tags
const TRENDING_TAGS = [
  'AI Art', 'Photorealistic', 'Abstract', 'Character Design', 
  'Animation', 'Surreal', 'Landscape', 'Sci-Fi', 'Fantasy'
];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [activeFilter, setActiveFilter] = useState(searchParams.get('type') || 'all');
  const [activeTags, setActiveTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize tags from URL
  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setActiveTags([tagParam]);
    }
  }, [searchParams]);
  
  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Build query parameters
        const params = {
          page: 1,
          limit: 30
        };
        
        // Add content type filter if not 'all'
        if (activeFilter !== 'all') {
          params.contentType = activeFilter;
        }
        
        // Add tag filter if any active
        if (activeTags.length > 0) {
          params.tags = activeTags.join(',');
        }
        
        // Add search query if present
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        // Update URL params
        setSearchParams({
          ...(activeFilter !== 'all' && { type: activeFilter }),
          ...(activeTags.length > 0 && { tag: activeTags[0] }),
          ...(searchQuery && { q: searchQuery })
        });
        
        // Make API call
        const response = await contentService.exploreContent(params);
        
        setContent(response.content || []);
        setFilteredContent(response.content || []);
        setPage(2); // Set page to 2 for next load
        setHasMore(response.pagination?.pages > 1);
      } catch (error) {
        console.error('Error fetching content:', error);
        setError('Failed to load content. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContent();
  }, [activeFilter, activeTags, searchQuery, setSearchParams]);
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveFilter(categoryId);
    setPage(1);
    setHasMore(true);
  };
  
  // Toggle a tag filter
  const toggleTag = (tag) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
    setPage(1);
    setHasMore(true);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilter('all');
    setActiveTags([]);
    setSearchQuery('');
    setSearchParams({});
    setPage(1);
    setHasMore(true);
  };
  
  // Handle search input
  const handleSearchInput = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already triggered by the useEffect when searchQuery changes
  };
  
  // Handle load more
  const handleLoadMore = async () => {
    if (!isLoading && hasMore) {
      setIsLoading(true);
      
      try {
        // Build query parameters
        const params = {
          page,
          limit: 30
        };
        
        // Add content type filter if not 'all'
        if (activeFilter !== 'all') {
          params.contentType = activeFilter;
        }
        
        // Add tag filter if any active
        if (activeTags.length > 0) {
          params.tags = activeTags.join(',');
        }
        
        // Add search query if present
        if (searchQuery) {
          params.search = searchQuery;
        }
        
        // Make API call
        const response = await contentService.exploreContent(params);
        
        setContent(prev => [...prev, ...(response.content || [])]);
        setFilteredContent(prev => [...prev, ...(response.content || [])]);
        setPage(prev => prev + 1);
        setHasMore(response.pagination?.page < response.pagination?.pages);
      } catch (error) {
        console.error('Error loading more content:', error);
        setError('Failed to load more content. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Helper function to get content URL path
  const getContentPath = (item) => {
    const contentType = item.contentType || 'image';
    return contentType === 'image' 
      ? `/images/${item._id}` 
      : `/${contentType}s/${item._id}`;
  };
  
  // Helper function to get correct image URL
  const getImageUrl = (item) => {
    if (!item) return null;
    
    const url = item.contentType === 'image' ? 
      item.fileUrl : 
      item.thumbnailUrl;
    
    if (!url) return null;
    
    // If it's an absolute URL, return as is
    if (url.startsWith('http')) {
      return url;
    }
    
    // If it's a relative path starting with uploads
    if (url.startsWith('/uploads')) {
      return `http://localhost:5001${url}`;
    }
    
    // If it's a relative path without leading slash
    if (url.startsWith('uploads/')) {
      return `http://localhost:5001/${url}`;
    }
    
    // Default fallback
    return `http://localhost:5001/${url}`;
  };
  
  // Format the thumbnail based on content type
  const renderThumbnail = (item) => {
    // Color gradient based on content type
    const gradients = {
      image: 'from-pink-500/20 to-purple-500/20',
      short: 'from-blue-500/20 to-cyan-500/20',
      film: 'from-amber-500/20 to-red-500/20'
    };
    
    const contentType = item.contentType || 'image';
    const imageUrl = getImageUrl(item);
    
    return (
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${gradients[contentType]} flex items-center justify-center`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 400 225"><rect width="400" height="225" fill="%23242435"/><text x="50%" y="50%" font-family="Arial" font-size="18" fill="white" text-anchor="middle" dominant-baseline="middle">${contentType.charAt(0).toUpperCase() + contentType.slice(1)}</text></svg>`;
            }}
          />
        ) : (
          <span className="text-2xl text-white opacity-30">
            {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
          </span>
        )}
        
        {/* Duration badge for videos */}
        {(contentType === 'short' || contentType === 'film') && item.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {contentType === 'short' 
              ? `${Math.floor(item.duration)}s` 
              : `${Math.floor(item.duration / 60)}m ${item.duration % 60}s`}
          </div>
        )}
        
        {/* Play button for videos */}
        {(contentType === 'short' || contentType === 'film') && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  if (error && !content.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-blips-black py-8 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">Explore</h1>
          
          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <form onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={handleSearchInput}
                className="w-full bg-blips-dark rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blips-purple"
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blips-text-secondary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
        
        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-blips-text-secondary">Filters:</span>
            
            {/* Content type filters */}
            {CONTENT_TYPES.map((type) => (
              <button
                key={type.id}
                className={`px-4 py-1.5 rounded-full text-sm ${
                  activeFilter === type.id
                    ? 'bg-blips-purple text-white'
                    : 'bg-blips-dark text-white hover:bg-blips-card'
                }`}
                onClick={() => handleCategoryChange(type.id)}
              >
                {type.name}
              </button>
            ))}
            
            {/* Clear filters button (only show if filters are active) */}
            {(activeFilter !== 'all' || activeTags.length > 0 || searchQuery) && (
              <button
                className="px-4 py-1.5 rounded-full text-sm bg-blips-dark text-white hover:bg-blips-card"
                onClick={clearFilters}
              >
                Clear All
              </button>
            )}
          </div>
          
          {/* Trending tags */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-blips-text-secondary">Trending:</span>
            
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                className={`px-3 py-1 rounded-full text-xs ${
                  activeTags.includes(tag)
                    ? 'bg-blips-purple text-white'
                    : 'bg-blips-dark text-white hover:bg-blips-card'
                }`}
                onClick={() => toggleTag(tag)}
              >
                #{tag.replace(' ', '')}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content grid */}
        {filteredContent.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredContent.map((item, index) => (
              <motion.div
                key={item._id || item.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={getContentPath(item)} className="block card card-hover overflow-hidden">
                  {renderThumbnail(item)}
                  
                  <div className="p-3">
                    <h3 className="font-medium truncate mb-1">{item.title || 'Untitled'}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blips-text-secondary">@{item.creator?.username || 'unknown'}</span>
                      <div className="flex items-center text-sm text-blips-text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {item.stats?.likes || 0}
                      </div>
                    </div>
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span 
                            key={`${item._id || item.id}-tag-${idx}`} 
                            className="text-xs px-1.5 py-0.5 bg-blips-card rounded-full text-blips-text-secondary"
                          >
                            #{typeof tag === 'string' ? tag.replace(' ', '') : tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs px-1.5 py-0.5 bg-blips-card rounded-full text-blips-text-secondary">
                            +{item.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blips-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold mb-2">No results found</h3>
            <p className="text-blips-text-secondary mb-6">Try adjusting your filters or search query</p>
            <button 
              className="btn-primary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}
        
        {/* Load more button */}
        {hasMore && filteredContent.length > 0 && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={handleLoadMore}
              disabled={isLoading}
              className="btn-secondary py-3 px-6 flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Load More</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;