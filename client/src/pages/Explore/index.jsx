// client/src/pages/Explore/index.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Mock content types for filter options
const CONTENT_TYPES = [
  { id: 'all', name: 'All Content' },
  { id: 'images', name: 'Images' },
  { id: 'shorts', name: 'Short Clips' },
  { id: 'films', name: 'Films' }
];

// Mock trends/tags for filtering
const TRENDING_TAGS = [
  'AI Art', 'Photorealistic', 'Abstract', 'Character Design', 
  'Animation', 'Surreal', 'Landscape', 'Sci-Fi', 'Fantasy'
];

// Mock data with mixed content types
const generateMockContent = () => {
  const content = [];
  
  // Generate images
  for (let i = 0; i < 15; i++) {
    content.push({
      id: `image-${i}`,
      type: 'images',
      title: `AI Artwork #${i + 1}`,
      creator: `creator${i % 10}`,
      likes: Math.floor(Math.random() * 1000),
      tags: [
        TRENDING_TAGS[Math.floor(Math.random() * TRENDING_TAGS.length)],
        TRENDING_TAGS[Math.floor(Math.random() * TRENDING_TAGS.length)]
      ]
    });
  }
  
  // Generate shorts
  for (let i = 0; i < 10; i++) {
    content.push({
      id: `short-${i}`,
      type: 'shorts',
      title: `AI Short #${i + 1}`,
      creator: `creator${i % 10}`,
      likes: Math.floor(Math.random() * 1000),
      duration: Math.floor(Math.random() * 30) + 15, // 15-45 seconds
      tags: [
        TRENDING_TAGS[Math.floor(Math.random() * TRENDING_TAGS.length)],
        TRENDING_TAGS[Math.floor(Math.random() * TRENDING_TAGS.length)]
      ]
    });
  }
  
  // Generate films
  for (let i = 0; i < 8; i++) {
    content.push({
      id: `film-${i}`,
      type: 'films',
      title: `AI Film #${i + 1}`,
      creator: `creator${i % 10}`,
      likes: Math.floor(Math.random() * 1000),
      duration: Math.floor(Math.random() * 15) + 5, // 5-20 minutes
      tags: [
        TRENDING_TAGS[Math.floor(Math.random() * TRENDING_TAGS.length)],
        TRENDING_TAGS[Math.floor(Math.random() * TRENDING_TAGS.length)]
      ]
    });
  }
  
  // Shuffle the content array
  return content.sort(() => Math.random() - 0.5);
};

const Explore = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTags, setActiveTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch mock data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        const mockData = generateMockContent();
        setContent(mockData);
        setFilteredContent(mockData);
        setIsLoading(false);
      }, 1000);
    };
    
    fetchData();
  }, []);
  
  // Filter content when filters change
  useEffect(() => {
    let results = [...content];
    
    // Filter by content type
    if (activeFilter !== 'all') {
      results = results.filter(item => item.type === activeFilter);
    }
    
    // Filter by active tags
    if (activeTags.length > 0) {
      results = results.filter(item => 
        item.tags.some(tag => activeTags.includes(tag))
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.creator.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredContent(results);
  }, [activeFilter, activeTags, searchQuery, content]);
  
  // Toggle a tag filter
  const toggleTag = (tag) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter(t => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setActiveFilter('all');
    setActiveTags([]);
    setSearchQuery('');
  };
  
  // Format the thumbnail based on content type
  const renderThumbnail = (item) => {
    // Color gradient based on content type
    const gradients = {
      images: 'from-pink-500/20 to-purple-500/20',
      shorts: 'from-blue-500/20 to-cyan-500/20',
      films: 'from-amber-500/20 to-red-500/20'
    };
    
    return (
      <div className={`relative w-full aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${gradients[item.type]} flex items-center justify-center`}>
        {/* This would be an actual image/thumbnail in production */}
        <span className="text-2xl text-white opacity-30">
          {item.type === 'images' ? 'Image' : item.type === 'shorts' ? 'Short' : 'Film'}
        </span>
        
        {/* Duration badge for videos */}
        {(item.type === 'shorts' || item.type === 'films') && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
            {item.type === 'shorts' ? `${item.duration}s` : `${item.duration}m`}
          </div>
        )}
        
        {/* Play button for videos */}
        {(item.type === 'shorts' || item.type === 'films') && (
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
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
            <input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-blips-dark rounded-full py-2 px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blips-purple"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blips-text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
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
                onClick={() => setActiveFilter(type.id)}
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
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={`/${item.type}/${item.id}`} className="block card card-hover overflow-hidden">
                  {renderThumbnail(item)}
                  
                  <div className="p-3">
                    <h3 className="font-medium truncate mb-1">{item.title}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blips-text-secondary">@{item.creator}</span>
                      <div className="flex items-center text-sm text-blips-text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {item.likes}
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span 
                          key={`${item.id}-tag-${idx}`} 
                          className="text-xs px-1.5 py-0.5 bg-blips-card rounded-full text-blips-text-secondary"
                        >
                          #{tag.replace(' ', '')}
                        </span>
                      ))}
                    </div>
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
      </div>
    </div>
  );
};

export default Explore;