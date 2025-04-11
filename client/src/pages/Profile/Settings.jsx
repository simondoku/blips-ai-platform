// client/src/pages/Profile/Settings.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const Settings = () => {
  const { currentUser, updateProfile, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    profileImage: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [previewImage, setPreviewImage] = useState(null);
  
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-blips-text-secondary mb-6">Please log in to access your settings.</p>
          <Link to="/login" className="btn-primary">Log In</Link>
        </div>
      </div>
    );
  }
  
  // Load user data
  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        bio: currentUser.bio || '',
        profileImage: null
      });
      
      // If user has a profile image, set preview
      if (currentUser.profileImage) {
        const imageUrl = getProfileImageUrl(currentUser.profileImage);
        setPreviewImage(imageUrl);
      }
    }
  }, [currentUser]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, profileImage: file }));
    
    // Create preview
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(currentUser?.profileImage ? getProfileImageUrl(currentUser.profileImage) : null);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage({ type: '', text: '' });
    
    try {
      const response = await updateProfile(formData);
      console.log('Profile updated successfully:', response);
      
      // Update preview with the new image URL if updated
      if (response?.user?.profileImage) {
        const newImageUrl = getProfileImageUrl(response.user.profileImage);
        console.log('New profile image URL:', newImageUrl);
        setPreviewImage(newImageUrl);
      }
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Reset file input
      if (document.getElementById('profileImage')) {
        document.getElementById('profileImage').value = '';
        // Clear the file input but keep the preview
        setFormData(prevData => ({
          ...prevData,
          profileImage: null
        }));
      }
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get profile image URL
  const getProfileImageUrl = (profileImage) => {
    if (!profileImage) return null;
    
    // If it's already a data URL from preview
    if (profileImage.startsWith('data:')) {
      return profileImage;
    }
    
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
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      <div className="bg-blips-dark rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        
        {message.text && (
          <div className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Preview */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-blips-purple/30 flex items-center justify-center text-4xl font-bold text-white mb-4">
              {previewImage ? (
                <img 
                  src={previewImage}
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                />
              ) : (
                formData.displayName?.charAt(0) || currentUser?.username?.charAt(0) || 'U'
              )}
            </div>
            
            <div>
              <label htmlFor="profileImage" className="btn-secondary cursor-pointer inline-block">
                Change Photo
              </label>
              <input
                type="file"
                id="profileImage"
                name="profileImage"
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
          
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
              placeholder="Tell us about yourself..."
            />
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary py-2 px-6 flex items-center"
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
          </div>
        </form>
      </div>
      
      <div className="bg-blips-dark rounded-lg p-6 shadow-lg mt-8">
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
        
        <div className="space-y-6">
          {/* Email Settings */}
          <div>
            <h3 className="text-lg font-medium mb-2">Email Address</h3>
            <p className="text-blips-text-secondary mb-4">{currentUser?.email}</p>
            <button className="btn-secondary">Change Email</button>
          </div>
          
          <hr className="border-blips-card my-6" />
          
          {/* Password Settings */}
          <div>
            <h3 className="text-lg font-medium mb-2">Password</h3>
            <p className="text-blips-text-secondary mb-4">Change your password regularly to keep your account secure.</p>
            <button className="btn-secondary">Change Password</button>
          </div>
          
          <hr className="border-blips-card my-6" />
          
          {/* Notification Settings - future feature */}
          <div>
            <h3 className="text-lg font-medium mb-2">Notification Settings</h3>
            <p className="text-blips-text-secondary mb-4">Coming soon! Control which notifications you receive.</p>
          </div>
          
          <hr className="border-blips-card my-6" />
          
          {/* Privacy Settings - future feature */}
          <div>
            <h3 className="text-lg font-medium mb-2">Privacy Settings</h3>
            <p className="text-blips-text-secondary mb-4">Coming soon! Manage your account privacy and visibility.</p>
          </div>
          
          <hr className="border-blips-card my-6" />
          
          {/* Account Deletion - future feature */}
          <div>
            <h3 className="text-lg font-medium text-red-500 mb-2">Delete Account</h3>
            <p className="text-blips-text-secondary mb-4">This will permanently delete your account and all your content.</p>
            <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;