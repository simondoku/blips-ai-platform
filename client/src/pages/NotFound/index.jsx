// client/src/pages/NotFound/index.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] py-16 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-9xl font-bold text-blips-purple mb-4">404</h1>
        
        <h2 className="text-4xl font-bold mb-6">Page Not Found</h2>
        
        <p className="text-blips-text-secondary text-xl max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/" 
            className="btn-primary px-6 py-3"
          >
            Go Home
          </Link>
          
          <Link 
            to="/explore" 
            className="btn-secondary px-6 py-3"
          >
            Explore Content
          </Link>
        </div>
      </motion.div>
      
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blips-purple opacity-10 blur-xl"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 rounded-full bg-blips-purple-dark opacity-10 blur-xl"></div>
      </div>
    </div>
  );
};

export default NotFound;