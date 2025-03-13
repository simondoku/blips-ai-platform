// client/src/pages/Profile/index.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Mock user data
const mockUser = {
  id: '1',
  username: 'ai_creator',
  displayName: 'AI Creator',
  bio: 'I create AI-generated art and animations. Exploring the boundaries of artificial creativity.',
  joinDate: '2023-06-15',
  followers: 1250,
  following: 342,
  profileImage: null, // In a real app, this would be a URL
  stats: {
    uploads: 48,
    likes: 2560,
    views: 18700
  }
};

// Mock content data
const mockContent = [
  {
    id: 'img-1',
    type: 'image',
    title: 'Cybernetic Dreamscape',
    likes: 342,
    createdAt: '2023-10-28'
  },
  {
    id: 'vid-1',
    type: 'short',
    title: 'Neural Network Visualization',
    likes: 189,
    createdAt: '2023-10-15'
  },
  {
    id: 'film-1',
    type: 'film',
    title: 'Journey Through AI Mind',
    likes: 411,
    createdAt: '2023-09-22'
  },
  {
    id: 'img-2',
    type: 'image',
    title: 'Quantum Reality',
    likes: 276,
    createdAt: '2023-09-12'
  },
  {
    id: 'img-3',
    type: 'image',
    title: 'Digital Evolution',
    likes: 198,
    createdAt: '2023-08-30'
  },
  {
    id: 'vid-2',
    type: 'short',
    title: 'AI Dreams in Motion',
    likes: 254,
    createdAt: '2023-08-17'
  }
];

const Profile = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState(null);
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { username } = useParams();
  const navigate = useNavigate();
  
  // Fetch user data
  useEffect(() => {
    // In a real app, this would be an API call
    setTimeout(() => {
      setUser(mockUser);
      setContent(mockContent);
      setFilteredContent(mockContent);
      setIsLoading(false);
    }, 1000);
  }, [username]);
  
  // Filter content when tab changes
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredContent(content);
    } else {
      setFilteredContent(content.filter(item => item.type === activeTab));
    }
  }, [activeTab, content]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-12 h-12 border-4 border-blips-purple rounded-full animate-spin border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
        <p className="text-blips-text-secondary mb-6">The user you are looking for does not exist.</p>
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
          <div className="w-32 h-32 rounded-full bg-blips-purple/30 flex items-center justify-center text-4xl font-bold text-white">
            {user.displayName.charAt(0)}
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold">{user.displayName}</h1>
              <div className="text-blips-text-secondary">@{user.username}</div>
              
              <div className="ml-auto">
                <button className="btn-primary px-6">Follow</button>
              </div>
            </div>
            
            <p className="text-blips-text-secondary mb-4 max-w-2xl">{user.bio}</p>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div>
                <span className="font-bold text-white">{user.stats.uploads}</span>{" "}
                <span className="text-blips-text-secondary">uploads</span>
              </div>
              <div>
                <span className="font-bold text-white">{user.followers.toLocaleString()}</span>{" "}
                <span className="text-blips-text-secondary">followers</span>
              </div>
              <div>
                <span className="font-bold text-white">{user.following.toLocaleString()}</span>{" "}
                <span className="text-blips-text-secondary">following</span>
              </div>
              <div className="text-blips-text-secondary">
                Joined {new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Tabs */}
      <div className="border-b border-blips-dark mb-8">
        <div className="flex overflow-x-auto scrollbar-hide">
          {[
            { id: 'all', label: 'All Content' },
            { id: 'image', label: 'Images' },
            { id: 'short', label: 'Short Clips' },
            { id: 'film', label: 'Films' },
            { id: 'liked', label: 'Liked' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blips-purple text-blips-purple' 
                  : 'border-transparent text-blips-text-secondary hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content Grid */}
      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredContent.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="card card-hover overflow-hidden"
            >
              {/* Content Thumbnail */}
              <div className="relative aspect-video bg-blips-card">
                {/* This would be an actual thumbnail in production */}
                <div className="absolute inset-0 flex items-center justify-center text-blips-text-secondary text-lg">
                  {item.type === 'image' ? 'Image' : item.type === 'short' ? 'Short' : 'Film'}
                </div>
                
                {/* Play button for videos */}
                {(item.type === 'short' || item.type === 'film') && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Content Info */}
              <div className="p-4">
                <h3 className="font-medium mb-1 truncate">{item.title}</h3>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blips-text-secondary">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center text-blips-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {item.likes}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
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
              : `This user has not uploaded any ${activeTab === 'image' ? 'images' : activeTab === 'short' ? 'short clips' : 'films'} yet.`}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;