// client/src/pages/Films/index.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HeroFilm from './components/HeroFilm';
import FilmRow from './components/FilmRow';

// Mock data for initial development
const MOCK_CATEGORIES = [
  { id: 'trending', name: 'Trending Now' },
  { id: 'sci-fi', name: 'Science Fiction' },
  { id: 'fantasy', name: 'Fantasy Worlds' },
  { id: 'animation', name: 'AI Animation' },
  { id: 'abstract', name: 'Abstract Concepts' }
];

// Generate some mock films
const generateMockFilms = (categoryId, count = 8) => {
  return Array.from({ length: count }).map((_, index) => ({
    id: `${categoryId}-film-${index}`,
    title: `${categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Film ${index + 1}`,
    description: `An AI-generated film exploring ${categoryId} themes and visuals.`,
    duration: Math.floor(Math.random() * 20) + 5, // 5-25 minutes
    year: 2025,
    creator: {
      id: `creator-${index % 10}`,
      name: `AI Creator ${index % 10}`
    },
    matchPercentage: Math.floor(Math.random() * 30) + 70, // 70-99%
    tags: ['ai', categoryId, index % 2 === 0 ? 'featured' : 'new']
  }));
};

const Films = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [featuredFilm, setFeaturedFilm] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filmsByCategory, setFilmsByCategory] = useState({});
  
  // Simulate fetching data from API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // In a real app, this would be API calls
      setTimeout(() => {
        // Create film data by category
        const filmData = {};
        MOCK_CATEGORIES.forEach(category => {
          filmData[category.id] = generateMockFilms(category.id);
        });
        
        // Set random featured film
        const randomCategory = MOCK_CATEGORIES[Math.floor(Math.random() * MOCK_CATEGORIES.length)];
        const randomFilm = filmData[randomCategory.id][0];
        
        setCategories(MOCK_CATEGORIES);
        setFilmsByCategory(filmData);
        setFeaturedFilm(randomFilm);
        setIsLoading(false);
      }, 1500);
    };
    
    fetchData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-blips-black">
      {/* Hero Section */}
      {featuredFilm && <HeroFilm film={featuredFilm} />}
      
      {/* Film Categories */}
      <div className="relative z-10 -mt-16 pb-20">
        {categories.map((category, index) => (
          <FilmRow 
            key={category.id}
            title={category.name}
            films={filmsByCategory[category.id] || []}
            delay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
};

export default Films;