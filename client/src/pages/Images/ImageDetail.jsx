// Update your ImageDetail.jsx:

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import contentService from '../../services/contentService';

const ImageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedImages, setRelatedImages] = useState([]);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchImageDetails = async () => {
      try {
        setIsLoading(true);
        console.log(`Fetching image with ID: ${id}`);
        
        const imageData = await contentService.getContentById(id);
        console.log('Received image data:', imageData);
        
        if (imageData) {
          setImage(imageData.content || imageData); // Handle both response formats
          
          // If related content is included in the response
          if (imageData.similar) {
            setRelatedImages(imageData.similar);
          } else {
            // Only fetch related if not included in the first response
            try {
              const relatedData = await contentService.getRelatedContent(id);
              setRelatedImages(relatedData || []);
            } catch (err) {
              console.warn('Could not fetch related content:', err);
              setRelatedImages([]);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching image details:', err);
        setError(`Failed to load image details: ${err.message || 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchImageDetails();
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  if (error || !image) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-xl text-red-500 mb-4">{error || 'Image not found'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="btn-primary"
        >
          Go Back
        </button>
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
          {image.fileUrl ? (
            <img 
              src={image.fileUrl.startsWith('/uploads') 
                ? `http://localhost:5001${image.fileUrl}` 
                : image.fileUrl.startsWith('uploads/') 
                  ? `http://localhost:5001/${image.fileUrl}` 
                  : image.fileUrl}
              alt={image.title} 
              className="w-full object-contain max-h-[70vh]"
              onError={(e) => {
                console.error('Image failed to load:', image.fileUrl);
                e.target.onerror = null;
                e.target.src = ''; // Reset src to prevent infinite retries
                e.target.classList.add('hidden');
                e.target.parentElement.innerHTML += `<div class="aspect-square md:aspect-[4/3] bg-gradient-to-br from-indigo-900/20 via-blips-card to-purple-900/20 flex items-center justify-center"><span class="text-4xl text-white opacity-30">Image Load Error</span></div>`;
              }}
            />
          ) : (
            <div className="aspect-square md:aspect-[4/3] bg-gradient-to-br from-indigo-900/20 via-blips-card to-purple-900/20 flex items-center justify-center">
              <span className="text-4xl text-white opacity-30">Image Not Available</span>
            </div>
          )}
          </div>
          
          {/* Rest of the component remains similar, just use real data */}
          <div className="flex justify-between items-center mt-4 mb-6">
            <div className="flex space-x-4">
              <button className="flex items-center space-x-1 text-blips-text-secondary hover:text-blips-purple">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{image.likes?.length || 0}</span>
              </button>
              
              {/* Other buttons... */}
            </div>
          </div>
        </div>
        
        {/* Sidebar - Info and Related */}
        <div className="lg:w-1/3">
          {/* Image Info */}
          <div className="bg-blips-dark rounded-lg p-6 mb-6">
            <h1 className="text-2xl font-bold mb-2">{image.title || 'Untitled'}</h1>
            
            <div className="flex items-center mb-4">
              <Link to={`/profile/${image.creator?.username || image.creator || 'user'}`} className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blips-purple flex items-center justify-center text-white font-bold text-sm mr-2">
                  {image.creator?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-medium">{image.creator?.displayName || 'User'}</p>
                  <p className="text-xs text-blips-text-secondary">@{image.creator?.username || 'user'}</p>
                </div>
              </Link>
            </div>
            
            {image.description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Description</h3>
                <p>{image.description}</p>
              </div>
            )}
            
            {image.tags && image.tags.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag, index) => (
                    <Link 
                      key={index}
                      to={`/explore?tag=${tag}`}
                      className="bg-blips-card px-3 py-1 rounded-full text-sm hover:bg-blips-purple hover:text-white transition-colors"
                    >
                      #{typeof tag === 'string' ? tag.replace(' ', '') : tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-sm font-medium text-blips-text-secondary mb-2">Created</h3>
              <p>{new Date(image.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          {/* Related Images */}
          {relatedImages.length > 0 && (
            <div>
              <h3 className="text-xl font-bold mb-4">More Like This</h3>
              <div className="grid grid-cols-2 gap-3">
                {relatedImages.map((related, index) => (
                  <Link 
                    key={related._id || related.id || index} 
                    to={`/images/${related._id || related.id}`}
                    className="card card-hover overflow-hidden"
                  >
                    <div className="aspect-square bg-gradient-to-br from-blips-dark to-blips-card flex items-center justify-center">
                      {related.fileUrl ? (
                        <img 
                          src={related.fileUrl.startsWith('/uploads') ? `http://localhost:5001${related.fileUrl}` : related.fileUrl}
                          alt={related.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg text-white opacity-30">Image</span>
                      )}
                    </div>
                    <div className="p-2">
                      <h4 className="text-sm font-medium truncate">{related.title || 'Untitled'}</h4>
                      <p className="text-xs text-blips-text-secondary truncate">@{related.creator?.username || related.creator || 'unknown'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageDetail;