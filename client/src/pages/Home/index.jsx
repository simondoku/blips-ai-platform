// client/src/pages/Home/index.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };
  
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-blips-dark overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Purple Circle */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-blips-purple opacity-20 blur-xl"></div>
          
          {/* Blue Circle */}
          <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full bg-blips-purple-dark opacity-20 blur-xl"></div>
          
          {/* Moving dots */}
          <div className="absolute inset-0">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ 
                  x: Math.random() * 100 + "%", 
                  y: Math.random() * 100 + "%", 
                  opacity: Math.random() * 0.5 + 0.3 
                }}
                animate={{ 
                  y: [null, Math.random() * 100 + "%"],
                  opacity: [null, Math.random() * 0.5 + 0.3] 
                }}
                transition={{ 
                  duration: Math.random() * 10 + 10, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
              />
            ))}
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative container mx-auto px-6 h-full flex flex-col justify-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-2xl"
          >
            <motion.p 
              variants={fadeInUp} 
              className="text-blips-purple text-lg mb-2"
            >
              BLIPS AI, SPARK YOUR IMAGINATION
            </motion.p>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl sm:text-6xl font-bold mb-2"
            >
              Next-Generation AI
            </motion.h1>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl sm:text-6xl font-bold text-blips-purple mb-6"
            >
              Creative Platform
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-blips-text-secondary text-xl mb-8 max-w-lg"
            >
              Discover, share, and explore the best AI-generated content. From stunning images to captivating short films, Blips is where AI creativity lives.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="btn-primary text-center py-3 px-6 text-lg">
                Get Started
              </Link>
              <Link to="/explore" className="btn-secondary text-center py-3 px-6 text-lg">
                Explore
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Content Categories */}
      <section className="py-16 px-6 bg-blips-black">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-12 text-center">Discover AI-Generated Content</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Short Clips Card */}
            <motion.div 
              className="card card-hover p-8 relative overflow-hidden"
              whileHover={{ y: -5, boxShadow: '0 0 20px rgba(108, 99, 255, 0.3)' }}
            >
              <div className="h-40 mb-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blips-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Short Clips</h3>
              <p className="text-blips-text-secondary mb-6">Watch bite-sized AI-generated videos and animations that captivate.</p>
              <Link to="/shorts" className="text-blips-purple hover:underline inline-flex items-center">
                Watch Shorts
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
            
            {/* Films Card */}
            <motion.div 
              className="card card-hover p-8 relative overflow-hidden"
              whileHover={{ y: -5, boxShadow: '0 0 20px rgba(108, 99, 255, 0.3)' }}
            >
              <div className="h-40 mb-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blips-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">AI Films</h3>
              <p className="text-blips-text-secondary mb-6">Immerse yourself in high-quality AI-generated short films and stories.</p>
              <Link to="/films" className="text-blips-purple hover:underline inline-flex items-center">
                Explore Films
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Featured Content Preview */}
      <section className="py-16 px-6 bg-blips-dark">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Trending Previews</h2>
            <Link to="/explore" className="text-blips-purple hover:underline inline-flex items-center">
              View More
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Preview items - These would typically be loaded from API */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="card card-hover overflow-hidden">
                <div className="relative pb-[56.25%] bg-blips-card">
                  {/* Placeholder for thumbnail */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blips-black bg-opacity-50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">AI Creation #{index + 1}</h3>
                  <p className="text-sm text-blips-text-secondary">@creator{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 px-6 bg-blips-black relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          {/* Background elements */}
          <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-blips-purple opacity-10 blur-xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-blips-purple-dark opacity-10 blur-xl"></div>
        </div>
        
        <div className="container mx-auto relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Join the AI Creative Revolution?</h2>
            <p className="text-xl text-blips-text-secondary mb-8">Sign up today and become part of the fastest growing community of AI content creators and enthusiasts.</p>
            <Link to="/register" className="btn-primary inline-block py-3 px-8 text-lg">
              Create Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;