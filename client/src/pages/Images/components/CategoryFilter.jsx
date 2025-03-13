// Update to client/src/pages/Images/components/CategoryFilter.jsx
import { motion } from 'framer-motion';

const CategoryFilter = ({ categories, onCategoryChange }) => {
  if (!categories || categories.length === 0) {
    return <div className="h-10 bg-blips-dark animate-pulse rounded-full w-full max-w-md"></div>;
  }
  
  return (
    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <motion.button
          key={category.id}
          className={`px-5 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
            category.active 
              ? 'bg-blips-purple text-white' 
              : 'bg-blips-card text-white hover:bg-blips-cardHover'
          }`}
          onClick={() => onCategoryChange(category.id)}
          whileTap={{ scale: 0.95 }}
        >
          {category.name}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryFilter;