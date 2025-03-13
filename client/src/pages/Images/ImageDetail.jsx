// client/src/pages/Images/ImageDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedImages, setRelatedImages] = useState([]);
  
  // Mock data for demo
  useEffect(() => {
    setTimeout(() => {
      setImage({
        id,
        title: `AI Artwork #${id}`,
        description: "This AI-generated artwork explores themes of futurism and nature. Created using a combination of diffusion models and GANs with custom fine-tuning.",
        creator: {
          id: 'creator1',
          username: 'ai_artisan',
          displayName: 'AI Artisan',
          isFollowing: false
        },
        stats: {
          likes: 1024,
          comments: 86,
          shares: 42,
          saves: 128
        },
        tags: ['digital art', 'surreal', 'landscape', 'futurism'],
        createdAt: new Date().toISOString(),
        imageUrl: null // In a real app this would be a URL
      });
      
      // Generate some related images
      setRelatedImages(
        Array.from({ length: 6 }).map((_, index) => ({
          id: `related-${index}`,
          title: `Related Artwork #${index + 1}`,
          creator: `creator${index % 5}`,
          stats: {
            likes: Math.floor(Math.random() * 1000)
          }
        }))
      );
      
      setIsLoading(false);
    }, 1000);
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Image Section */}
        <div className="lg:w-2/3">
          {/* Navigation */}
          <div className="mb-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center text-blips-text-secondary hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back
            </button>
          </div>
          
          {/* Image Display */}
          <div className="bg-blips-dark rounded-lg overflow-hidden">
            {/* This would be an actual image in production */}
            <div className="aspect-square md:aspect-[4/3] bg-gradient-to-br from-indigo-900/20 via-blips-card to-purple-900/20 flex items-center justify-center">
              <span className="text-4xl text-white opacity-30">AI Artwork</span>
            </div>
          </div>
          
          {/* Image Actions */}
          <div className="flex justify-between items-center mt-4 mb-6">
            <div className="flex space-x-4">
              <button className="flex items-center space-x-1 text-blips-text-secondary hover:text-blips-purple">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{image.stats.likes}</span>
              </button>
              
              <button className="flex items-center space-x-1 text-blips-text-secondary hover:text-blips-purple">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{image.stats.comments}</span>
              </button>
              
              <button className="flex items-center space-x-1 text-blips-text-secondary hover:text-blips-purple">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>{image.stats.shares}</span>
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button className="btn-secondary py-1 px-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save
              </button>
              
              <button className="btn-primary py-1 px-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        </div>
        
        {/* Sidebar - Info and Related */}
        <div className="lg:w-1/3">
          {/* Image Info */}
          <div className="bg-blips-dark rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{image.title}</h1>
            
            <div className="flex items-center mb-4">
              <Link to={`/profile/${image.creator.username}`} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blips-purple flex items-center justify-center text-white font-bold text-sm mr-2">
                  {image.creator.displayName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{image.creator.displayName}</p>
                  <p className="text-xs text-blips-text-secondary">@{image.creator.username}</p>
                </div>
              </Link>
              
              <button className="ml-auto btn-secondary py-1 px-3 text-sm">
                {image.creator.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Description</h3>
              <p>{image.description}</p>
            </div>
            
            <div className="mb-4">
              <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {image.tags.map((tag, index) => (
                  <Link 
                    key={index}
                    to={`/explore?tag=${tag}`}
                    className="bg-blips-card px-3 py-1 rounded-full text-sm hover:bg-blips-purple hover:text-white transition-colors"
                  >
                    #{tag.replace(' ', '')}
                  </Link>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Created</h3>
              <p>{new Date(image.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Related Images */}
          <div>
            <h3 className="text-xl font-bold mb-4">More Like This</h3>
            <div className="grid grid-cols-2 gap-3">
              {relatedImages.map((related, index) => (
                <Link 
                  key={related.id} 
                  to={`/images/${related.id}`}
                  className="card card-hover overflow-hidden"
                >
                  <div className="aspect-square bg-gradient-to-br from-blips-dark to-blips-card flex items-center justify-center">
                    <span className="text-lg text-white opacity-30">Image</span>
                  </div>
                  <div className="p-2">
                    <h4 className="text-sm font-medium truncate">{related.title}</h4>
                    <p className="text-xs text-blips-text-secondary truncate">@{related.creator}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;