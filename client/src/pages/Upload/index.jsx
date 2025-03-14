// client/src/pages/Upload/index.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { uploadService } from '../../services/uploadService';
import { useAuth } from '../../contexts/AuthContext';

const Upload = () => {
  const [selectedTab, setSelectedTab] = useState('image');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  // Process the selected file
  const handleFile = (file) => {
    // Validate file type based on selected tab
    const isValid = validateFileType(file);
    if (!isValid) {
      setError(`Please select a valid ${selectedTab} file.`);
      return;
    }
    
    setSelectedFile(file);
    setError('');
    
    // Create preview for image files
    if (selectedTab === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      // For video files, use a generic preview
      setFilePreview(null);
    }
  };
  
  // Validate file type based on selected tab
  const validateFileType = (file) => {
    if (selectedTab === 'image') {
      return file.type.startsWith('image/');
    } else if (selectedTab === 'short' || selectedTab === 'film') {
      return file.type.startsWith('video/');
    }
    return false;
  };
  
  // Get categories based on content type
  const getCategories = () => {
    switch (selectedTab) {
      case 'image':
        return [
          { id: 'digital-art', name: 'Digital Art' },
          { id: 'portraits', name: 'Portraits' },
          { id: 'environments', name: 'Environments' },
          { id: 'characters', name: 'Characters' },
          { id: 'illustrations', name: 'Illustrations' },
          { id: 'abstract', name: 'Abstract' },
          { id: 'other', name: 'Other' }
        ];
      case 'short':
        return [
          { id: 'animation', name: 'Animation' },
          { id: 'motion-graphics', name: 'Motion Graphics' },
          { id: 'visual-effects', name: 'Visual Effects' },
          { id: 'experimental', name: 'Experimental' },
          { id: 'other', name: 'Other' }
        ];
      case 'film':
        return [
          { id: 'sci-fi', name: 'Science Fiction' },
          { id: 'fantasy', name: 'Fantasy' },
          { id: 'drama', name: 'Drama' },
          { id: 'documentary', name: 'Documentary' },
          { id: 'experimental', name: 'Experimental' },
          { id: 'other', name: 'Other' }
        ];
      default:
        return [];
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('contentType', selectedTab);
      formData.append('category', category);
      
      if (tags) {
        formData.append('tags', tags);
      }
      
      // Add duration for videos if needed
      if (selectedTab === 'short' || selectedTab === 'film') {
        // In a real app, you would calculate the video duration
        // For now, we'll set a dummy value
        formData.append('duration', '30');
      }
      
      // Upload the content
      const response = await uploadService.uploadContent(formData, (progress) => {
        setUploadProgress(progress);
      });
      
      // Set success message
      setSuccess('Your content was uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setFilePreview(null);
      setTitle('');
      setDescription('');
      setTags('');
      setCategory('');
      setUploadProgress(0);
      
      // Navigate to the content page after a delay
      setTimeout(() => {
        navigate(`/${selectedTab}s/${response.content._id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.message || 'Failed to upload content. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Trigger file input click
  const openFileDialog = () => {
    fileInputRef.current.click();
  };
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Upload Your AI Creation</h1>
        
        {/* Content type tabs */}
        <div className="flex space-x-2 mb-8">
          {['image', 'short', 'film'].map((tab) => (
            <button
              key={tab}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                selectedTab === tab 
                  ? 'bg-blips-purple text-white'
                  : 'bg-blips-dark text-white hover:bg-blips-card'
              }`}
              onClick={() => {
                setSelectedTab(tab);
                setSelectedFile(null);
                setFilePreview(null);
                setError('');
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 rounded-md">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 text-green-500 rounded-md">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Upload Zone */}
          <div 
            className={`upload-zone mb-8 transition-colors ${dragActive ? 'border-blips-purple' : 'border-blips-text-secondary'}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="w-full flex flex-col items-center">
                {filePreview ? (
                  // Show image preview for image uploads
                  <div className="mb-4 w-64 h-64 flex items-center justify-center overflow-hidden">
                    <img 
                      src={filePreview} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ) : (
                  // Show file icon for other types
                  <div className="mb-4 w-16 h-16 rounded-full bg-blips-purple/20 flex items-center justify-center">
                    {selectedTab === 'image' ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blips-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blips-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                )}
                
                <p className="text-blips-text-secondary mb-2">{selectedFile.name}</p>
                <button 
                  type="button"
                  className="text-blips-purple hover:underline"
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4 w-16 h-16 rounded-full bg-blips-dark flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blips-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-white mb-2">Drag and drop your {selectedTab} here</p>
                <p className="text-blips-text-secondary mb-4">or</p>
                <button 
                  type="button"
                  className="btn-primary cursor-pointer"
                  onClick={openFileDialog}
                >
                  Browse Files
                </button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  className="hidden" 
                  accept={selectedTab === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
          
          {/* Progress bar (only shown during upload) */}
          {isSubmitting && (
            <div className="mb-6">
              <p className="text-sm text-blips-text-secondary mb-2">Uploading: {uploadProgress}%</p>
              <div className="w-full h-2 bg-blips-dark rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blips-purple transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-white mb-2">Title *</label>
              <input 
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-blips-dark rounded-md focus:outline-none focus:ring-2 focus:ring-blips-purple"
                required
                placeholder={`Enter a title for your ${selectedTab}`}
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-white mb-2">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-blips-dark rounded-md focus:outline-none focus:ring-2 focus:ring-blips-purple"
              >
                <option value="">Select a category</option>
                {getCategories().map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-white mb-2">Description</label>
              <textarea 
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-blips-dark rounded-md focus:outline-none focus:ring-2 focus:ring-blips-purple min-h-[100px]"
                placeholder="Describe your creation"
              />
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-white mb-2">Tags (separated by commas)</label>
              <input 
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-3 bg-blips-dark rounded-md focus:outline-none focus:ring-2 focus:ring-blips-purple"
                placeholder="ai, art, digital, etc."
              />
            </div>
            
            <div className="pt-4">
              <motion.button 
                type="submit"
                className="btn-primary py-3 px-8 w-full md:w-auto flex items-center justify-center"
                disabled={isSubmitting || !selectedFile}
                whileHover={!isSubmitting && selectedFile ? { scale: 1.05 } : {}}
                whileTap={!isSubmitting && selectedFile ? { scale: 0.95 } : {}}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  'Submit'
                )}
              </motion.button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;