// client/src/pages/Films/index.jsx
// With fixes for object to primitive conversion errors

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroFilm from './components/HeroFilm';
import FilmRow from './components/FilmRow';
import contentService from '../../services/contentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Define categories for film content
const FILM_CATEGORIES = [
  { id: 'trending', name: 'Trending Now' },
  { id: 'sci-fi', name: 'Science Fiction' },
  { id: 'fantasy', name: 'Fantasy Worlds' },
  { id: 'experimental', name: 'Experimental' },
  { id: 'animation', name: 'Animation' },
  { id: 'other', name: 'Other Films' }
];

const Films = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredFilm, setFeaturedFilm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filmsByCategory, setFilmsByCategory] = useState({});
  
  // Helper function to get URL for images/videos - with safety checks
  const getMediaUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    
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
  
  // Format films data for component consumption - with safety checks
  const formatFilmForDisplay = (film) => {
    if (!film) return null;
    
    try {
      // Safely extract creator info
      let creatorId = 'unknown';
      let creatorUsername = 'unknown';
      let creatorDisplayName = 'Unknown Creator';
      let isFollowing = false;
      
      if (film.creator) {
        if (typeof film.creator === 'object') {
          creatorId = film.creator._id || 'unknown';
          creatorUsername = film.creator.username || 'unknown';
          creatorDisplayName = film.creator.displayName || film.creator.username || 'Unknown Creator';
          isFollowing = !!film.creator.isFollowing;
        } else if (typeof film.creator === 'string') {
          creatorId = film.creator;
          creatorUsername = 'unknown';
        }
      }
      
      // Ensure tags is an array
      const tags = Array.isArray(film.tags) ? film.tags : [];
      
      // Ensure duration is a number
      const duration = typeof film.duration === 'number' ? film.duration : 0;
      
      // Safely construct stat object
      const stats = {
        views: typeof film.stats?.views === 'number' ? film.stats.views : 0,
        likes: typeof film.stats?.likes === 'number' ? film.stats.likes : 0,
        comments: typeof film.stats?.comments === 'number' ? film.stats.comments : 0,
        shares: typeof film.stats?.shares === 'number' ? film.stats.shares : 0
      };
      
      return {
        id: film._id || 'unknown',
        title: film.title || 'Untitled Film',
        description: film.description || 'No description available',
        duration: duration,
        year: film.createdAt ? new Date(film.createdAt).getFullYear() : new Date().getFullYear(),
        creator: {
          id: creatorId,
          username: creatorUsername,
          displayName: creatorDisplayName,
          isFollowing: isFollowing
        },
        thumbnailUrl: getMediaUrl(film.thumbnailUrl),
        fileUrl: getMediaUrl(film.fileUrl),
        category: film.category || 'other',
        tags: tags,
        stats: stats,
        matchPercentage: Math.floor(Math.random() * 30) + 70 // 70-99% for demo purposes
      };
    } catch (error) {
      console.error('Error formatting film data:', film?._id || 'unknown film');
      // Return a safe fallback object
      return {
        id: film?._id || 'error',
        title: 'Error displaying film',
        description: 'There was an error processing this film',
        duration: 0,
        year: new Date().getFullYear(),
        creator: {
          id: 'unknown',
          username: 'unknown',
          displayName: 'Unknown Creator',
          isFollowing: false
        },
        thumbnailUrl: null,
        fileUrl: null,
        category: 'other',
        tags: [],
        stats: { views: 0, likes: 0, comments: 0, shares: 0 },
        matchPercentage: 70
      };
    }
  };
  
  // Fetch data from API
  useEffect(() => {
    const fetchFilmsData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch trending films for featured film and trending category
        const trendingResponse = await contentService.exploreContent({
          contentType: 'film',
          sort: 'trending',
          limit: 12
        });
        
        // Only proceed if we have films
        if (!trendingResponse || !trendingResponse.content || trendingResponse.content.length === 0) {
          setError('No films available.');
          setIsLoading(false);
          return;
        }
        
        // Set first trending film as featured
        setFeaturedFilm(trendingResponse.content[0]);
        
        // Set up categories and fetch films for each category
        const categoryData = {};
        const fetchPromises = [];
        
        // Add trending films first
        categoryData['trending'] = trendingResponse.content;
        
        // Fetch films for each other category
        for (const category of FILM_CATEGORIES) {
          if (category.id !== 'trending') {
            fetchPromises.push(
              contentService.exploreContent({
                contentType: 'film',
                category: category.id !== 'other' ? category.id : undefined,
                limit: 12
              }).then(response => {
                if (response && response.content && response.content.length > 0) {
                  categoryData[category.id] = response.content;
                  return true;
                }
                return false;
              }).catch(err => {
                console.error(`Error fetching ${category.name} films:`, String(err.message || err));
                return false;
              })
            );
          }
        }
        
        // Wait for all fetches to complete
        await Promise.all(fetchPromises);
        
        // Filter out categories with no films
        const availableCategories = FILM_CATEGORIES.filter(cat => 
          categoryData[cat.id] && categoryData[cat.id].length > 0
        );
        
        setCategories(availableCategories);
        setFilmsByCategory(categoryData);
      } catch (err) {
        console.error('Error fetching films data:', String(err.message || err));
        setError('Failed to load films. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFilmsData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4 text-red-500">{error}</h2>
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
    <div className="min-h-screen bg-blips-black">
      {/* Hero Section with Featured Film */}
      {featuredFilm && <HeroFilm film={formatFilmForDisplay(featuredFilm)} />}
      
      {/* Film Categories */}
      <div className="relative z-10 -mt-16 pb-20">
        {categories.map((category, index) => {
          const filmsInCategory = filmsByCategory[category.id] || [];
          
          // Don't render empty categories
          if (filmsInCategory.length === 0) return null;
          
          // Format each film for the row component
          const formattedFilms = filmsInCategory
            .map(film => formatFilmForDisplay(film))
            .filter(film => film !== null); // Filter out any null results
          
          // Only render if we have films after formatting
          if (formattedFilms.length === 0) return null;
          
          return (
            <FilmRow 
              key={category.id}
              title={category.name}
              films={formattedFilms}
              delay={index * 0.1}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Films;