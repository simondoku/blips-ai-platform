// client/src/components/animations/WelcomeAnimation.jsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logoImage from '../common/LogoNoText.png';

const WelcomeAnimation = ({ onFinish }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard after animation completes
    const timer = setTimeout(() => {
      if (onFinish) {
        onFinish(); // Mark welcome as seen
      }
      navigate('/dashboard');
    }, 2200); // Animation duration + small delay

    return () => clearTimeout(timer);
  }, [navigate, onFinish]);

  return (
    <div className="fixed inset-0 bg-blips-black flex flex-col items-center justify-center z-50">
        <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="w-24 h-24">
          <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="Blips AI Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
        </div>
      </motion.div>
      
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-2xl font-bold text-white"
      >
        Welcome to Blips
      </motion.h2>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 250 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="h-1 bg-blips-purple rounded-full mt-6"
      />
    </div>
  );
};

export default WelcomeAnimation;