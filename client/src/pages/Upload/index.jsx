// client/src/pages/Upload/index.jsx
import { useState } from 'react';
import { motion } from 'framer-motion';

const Upload = () => {
  const [selectedTab, setSelectedTab] = useState('image');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    setSelectedFile(file);
    
    // Create preview for image files
    if (selectedTab === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      // For video files, we'll use a placeholder
      setFilePreview(null);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a file to upload');
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, this would submit to an API
    // Simulate API call with timeout
    setTimeout(() => {
      console.log({
        type: selectedTab,
        file: selectedFile,
        title,
        description,
        tags: tags.split(',').map(tag => tag.trim())
      });
      
      // Reset form
      setSelectedFile(null);
      setFilePreview(null);
      setTitle('');
      setDescription('');
      setTags('');
      setIsSubmitting(false);
      
      // Show success message
      alert('Upload successful! In a real app, this would save to the server.');
    }, 2000);
  };
  
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Upload Your AI Creation</h1>
        
        {/* Content type tabs */}
        <div className="flex space-x-2 mb-8">
          {['image', 'video', 'film'].map((tab) => (
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
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Upload Zone */}
          <div 
            className={`upload-zone mb-8 ${dragActive ? 'border-blips-purple' : 'border-blips-text-secondary'}`}
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
                  // Show file name for other types
                  <div className="mb-4 w-16 h-16 rounded-full bg-blips-purple/20 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blips-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                    </svg>
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
                <label className="btn-primary cursor-pointer">
                  Browse Files
                  <input 
                    type="file" 
                    className="hidden" 
                    accept={selectedTab === 'image' ? 'image/*' : 'video/*'}
                    onChange={handleFileChange}
                  />
                </label>
              </>
            )}
          </div>
          
          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-white mb-2">Title</label>
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
              <button 
                type="submit"
                className="btn-primary py-3 px-8 w-full md:w-auto flex items-center justify-center"
                disabled={isSubmitting || !selectedFile}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;