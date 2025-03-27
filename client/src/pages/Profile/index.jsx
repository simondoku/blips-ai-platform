// client/src/pages/Profile/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userService } from '../../services/userService';
import contentService from '../../services/contentService';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Profile Settings Component
const ProfileSettings = () => {
  const { currentUser, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || '',
    bio: currentUser?.bio || '',
    profileImage: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, profileImage: e.target.files[0] }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      await updateProfile(formData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-blips-dark rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
      
      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium mb-2">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            className="w-full bg-blips-card rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blips-purple"
          />
        </div>
        
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full bg-blips-card rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blips-purple"
          />
        </div>
        
        <div>
          <label htmlFor="profileImage" className="block text-sm font-medium mb-2">
            Profile Image
          </label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            onChange={handleFileChange}
            accept="image/*"
            className="w-full bg-blips-card rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blips-purple"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary py-2 px-4 flex items-center"
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </form>
    </div>
  );
};

const Profile = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState(null);
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { username } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const profileUsername = username || currentUser?.username;
  const isOwnProfile = currentUser?.username === profileUsername || !username;
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // If no username is provided, use the current user's profile
        const profileUsername = username || currentUser?.username;
        
        if (!profileUsername) {
          navigate('/login');
          return;
        }
        
        const userData = await userService.getUserProfile(profileUsername);
        setUser(userData);
        setIsFollowing(userData.isFollowing || false);
        
        // Reset content state when user changes
        setContent([]);
        setFilteredContent([]);
        
        // Fetch user content
        await fetchUserContent(profileUsername, activeTab);
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError(error.response?.data?.message || 'Failed to load profile. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [username, currentUser, navigate]);
  
  // Fetch user content based on tab
  const fetchUserContent = async (profileUsername, contentType = 'all') => {
    try {
      setIsLoading(true);
      
      // Create query params
      const params = { creator: profileUsername };
      
      // Add content type filter if not 'all'
      if (contentType !== 'all' && contentType !== 'liked') {
        params.contentType = contentType;
      }
      
      let response;
      
      // For 'liked' tab, use a different endpoint
      if (contentType === 'liked' && isOwnProfile) {
        response = await userService.getSavedContent();
      } else {
        // Use the explore endpoint to get content filtered by creator
        response = await userService.getUserContent(params);
      }
      
      const userContent = response.content || [];
      
      console.log('Fetched user content:', userContent);
      
      setContent(userContent);
      setFilteredContent(userContent);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user content:', error);
      setContent([]);
      setFilteredContent([]);
      setIsLoading(false);
    }
  };
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchUserContent(username || currentUser?.username, tab);
  };
  
  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      setIsFollowing(!isFollowing);
      
      const endpoint = isFollowing ? 'unfollowUser' : 'followUser';
      await userService[endpoint](user._id);
      
      // Update follower count
      setUser(prev => ({
        ...prev,
        followerCount: isFollowing 
          ? Math.max(0, prev.followerCount - 1) 
          : prev.followerCount + 1
      }));
    } catch (error) {
      console.error(`Error ${isFollowing ? 'unfollowing' : 'following'} user:`, error);
      setIsFollowing(!isFollowing); // Revert UI state on error
    }
  };
  
  // Handle delete content
  const handleDeleteContent = async (contentId) => {
    if (!isAuthenticated || !isOwnProfile) return;
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // Mark this specific item as deleting
      setFilteredContent(prevContent => 
        prevContent.map(item => 
          (item._id === contentId || item.id === contentId) ? { ...item, isDeleting: true } : item
        )
      );
      
      // Call API to delete content
      await contentService.deleteContent(contentId);
      
      // Remove deleted content from state
      setContent(prevContent => prevContent.filter(item => 
        (item._id !== contentId && item.id !== contentId)
      ));
      setFilteredContent(prevContent => prevContent.filter(item => 
        (item._id !== contentId && item.id !== contentId)
      ));
      
      // Update content count in user data
      if (user && user.contentCount) {
        setUser(prevUser => ({
          ...prevUser,
          contentCount: Math.max(0, prevUser.contentCount - 1)
        }));
      }
      
      // Show success message
      alert('Content deleted successfully');
    } catch (error) {
      console.error('Error deleting content:', error);
      
      // Revert the deleting state on error
      setFilteredContent(prevContent => 
        prevContent.map(item => 
          (item._id === contentId || item.id === contentId) ? { ...item, isDeleting: false } : item
        )
      );
      
      alert('Failed to delete content. Please try again.');
    } finally {
      setIsDeleting(false);
    }
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
  
  // Get profile image URL
  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) return null;
    
    // If it's an absolute URL, return as is
    if (profileImage.startsWith('http')) {
      return profileImage;
    }
    
    // If it's a relative path starting with uploads
    if (profileImage.startsWith('/uploads')) {
      return `http://localhost:5001${profileImage}`;
    }
    
    // If it's a relative path without leading slash
    if (profileImage.startsWith('uploads/')) {
      return `http://localhost:5001/${profileImage}`;
    }
    
    // Default fallback
    return `http://localhost:5001/${profileImage}`;
  };
  
  if (isLoading && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-blips-text-secondary mb-6">{error || 'The user you are looking for does not exist.'}</p>
        <Link to="/explore" className="btn-primary">Explore Content</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">    
      {/* Profile Header */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Picture */}
          <div className="w-32 h-32 rounded-full bg-blips-purple/30 flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
            {user.profileImage ? (
              <img 
                src={getProfileImageUrl(user.profileImage)} 
                alt={user.displayName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.innerText = user.displayName?.charAt(0) || user.username?.charAt(0) || 'U';
                }}
              />
            ) : (
              user.displayName?.charAt(0) || user.username?.charAt(0) || 'U'
            )}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold">{user.displayName || user.username}</h1>
              <div className="text-blips-text-secondary">@{user.username}</div>
              
              <div className="ml-auto">
                {isOwnProfile ? (
                  <Link to="/profile/settings" className="btn-secondary px-6">Edit Profile</Link>
                ) : (
                  <button 
                    className={`${isFollowing ? 'btn-secondary' : 'btn-primary'} px-6`}
                    onClick={handleFollowToggle}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
            
            {user.bio && <p className="text-blips-text-secondary mb-4 max-w-2xl">{user.bio}</p>}
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-bold text-white">{user.contentCount || 0}</span>{" "}
                <span className="text-blips-text-secondary">uploads</span>
              </div>
              <div>
                <span className="font-bold text-white">{user.followerCount || 0}</span>{" "}
                <span className="text-blips-text-secondary">followers</span>
              </div>
              <div>
                <span className="font-bold text-white">{user.followingCount || 0}</span>{" "}
                <span className="text-blips-text-secondary">following</span>
              </div>
              <div className="text-blips-text-secondary">
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Routes */}
      <Routes>
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="/" element={(
          <>
            {/* Content Tabs */}
            <div className="border-b border-blips-dark mb-8">
              <div className="flex overflow-x-auto scrollbar-hide">
                {[
                  { id: 'all', label: 'All Content' },
                  { id: 'image', label: 'Images' },
                  { id: 'short', label: 'Short Clips' },
                  { id: 'film', label: 'Films' },
                  ...(isOwnProfile ? [{ id: 'liked', label: 'Liked' }] : []),
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                      activeTab === tab.id 
                        ? 'border-blips-purple text-blips-purple' 
                        : 'border-transparent text-blips-text-secondary hover:text-white'
                    }`}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Content Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredContent.map((item) => {
                  // Determine content type
                  const contentType = item.contentType || 'image';
                  
                  // Get URL path
                  const urlPath = contentType === 'image' 
                    ? `/images/${item._id || item.id}` 
                    : `/${contentType}s/${item._id || item.id}`;
                  
                  // Get image URL
                  const imageUrl = getImageUrl(item);
                  
                  return (
                    <motion.div
                      key={item._id || item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`card overflow-hidden relative ${item.isDeleting ? 'opacity-50' : ''}`}
                    >
                      {/* Dropdown menu button */}
                      {isOwnProfile && (
                        <div className="absolute top-2 right-2 z-10">
                          <button
                            className="w-10 h-10 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === (item._id || item.id) ? null : (item._id || item.id));
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          
                          {/* Dropdown menu */}
                          {openMenuId === (item._id || item.id) && (
                            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-blips-dark ring-1 ring-black ring-opacity-5 z-20">
                              <div className="py-1" role="menu" aria-orientation="vertical">
                                <button
                                  className="flex items-center w-full px-4 py-2 text-sm text-white hover:bg-blips-card"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteContent(item._id || item.id);
                                    setOpenMenuId(null);
                                  }}
                                  disabled={isDeleting || item.isDeleting}
                                >
                                  {item.isDeleting ? (
                                    <>
                                      <LoadingSpinner size="sm" className="mr-2" />
                                      <span>Deleting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      <span>Delete</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Content card link */}
                      <Link to={urlPath} className="block">
                        {/* Content Thumbnail */}
                        <div className="relative aspect-video bg-blips-card">
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
                            <div className="absolute inset-0 flex items-center justify-center text-blips-text-secondary text-lg">
                              {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
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
                          
                          {/* Duration badge for videos */}
                          {(contentType === 'short' || contentType === 'film') && item.duration && (
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              {contentType === 'short' 
                                ? `${Math.floor(item.duration)}s` 
                                : `${Math.floor(item.duration / 60)}m ${item.duration % 60}s`}
                            </div>
                          )}
                        </div>
                        
                        {/* Content Info */}
                        <div className="p-4">
                          <h3 className="font-medium mb-1 truncate">{item.title || 'Untitled'}</h3>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-blips-text-secondary">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center text-blips-text-secondary">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                              </svg>
                              {item.stats?.likes || 0}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blips-text-secondary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                </svg>
                <h3 className="text-xl font-bold mb-2">No content found</h3>
                <p className="text-blips-text-secondary mb-6">
                  {activeTab === 'all' 
                    ? 'This user has not uploaded any content yet.' 
                    : activeTab === 'liked'
                      ? 'No liked content yet. Explore and like some content!'
                      : `This user has not uploaded any ${activeTab === 'image' ? 'images' : activeTab === 'short' ? 'short clips' : 'films'} yet.`}
                </p>
                {isOwnProfile ? (
                  <Link to="/upload" className="btn-primary">Upload Something</Link>
                ) : (
                  <Link to="/explore" className="btn-primary">Explore Content</Link>
                )}
              </div>
            )}
          </>
        )} />
      </Routes>
    </div>
  );
};

export default Profile;