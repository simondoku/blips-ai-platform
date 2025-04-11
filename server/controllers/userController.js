// server/controllers/userController.js
const User = require('../models/User');
const Content = require('../models/Content');

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    
    const user = await User.findOne({ username })
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's content count
    const contentCount = await Content.countDocuments({ 
      creator: user._id,
      isPublic: true
    });
    
    // Include follower and following counts
    user.followerCount = user.followers ? user.followers.length : 0;
    user.followingCount = user.following ? user.following.length : 0;
    user.contentCount = contentCount;
    
    // Check if requesting user follows this user
    if (req.user) {
      const requestingUser = await User.findById(req.user.id);
      user.isFollowing = requestingUser.following.includes(user._id);
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { displayName, bio } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields
    if (displayName) user.displayName = displayName;
    if (bio) user.bio = bio;
    
    // Update profile image if uploaded
    if (req.file) {
      // Format the path with leading slash for consistency
      const filePath = req.file.path.replace(/\\/g, '/'); // Convert Windows backslashes to forward slashes
      user.profileImage = filePath.startsWith('uploads') ? `/${filePath}` : `/${filePath.replace(/^.*?uploads/, 'uploads')}`;
      console.log('Updated profile image path:', user.profileImage);
    }
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

//getUserContent 
exports.getUserContent = async (req, res) => {
  try {
    const { username, contentType, limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Find user by username or use the current user
    let user;
    
    if (username) {
      // Log to debug
      console.log(`Looking for user with username: ${username}`);
      
      user = await User.findOne({ username });
      
      if (!user) {
        console.log(`No user found with username: ${username}`);
        return res.status(404).json({ message: 'User not found' });
      }
    } else if (req.user && req.user.id) {
      // Use authenticated user if no username provided
      user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      return res.status(400).json({ message: 'Username parameter is required' });
    }
    
    console.log(`Found user: ${user.username}, ID: ${user._id}`);
    
    // Create query
    const query = { creator: user._id };
    
    // Filter by content type if specified
    if (contentType && contentType !== 'all') {
      query.contentType = contentType;
    }
    
    // If viewing someone else's profile, only show public content
    if (username && req.user && user._id.toString() !== req.user.id) {
      query.isPublic = true;
    }
    
    console.log(`Content query:`, query);
    
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username displayName profileImage');
    
    console.log(`Found ${content.length} content items`);
    
    const total = await Content.countDocuments(query);
    
    res.json({
      content,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error in getUserContent:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};
// get Liked content
exports.getLikedContent = async (req, res) => {
  try {
    const { contentType, limit = 30, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Create query to find content liked by the user
    const query = { likedBy: req.user.id };
    
    // Filter by content type if specified
    if (contentType && contentType !== 'all') {
      query.contentType = contentType;
    }
    
    const content = await Content.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'username displayName profileImage');
    
    const total = await Content.countDocuments(query);
    
    res.json({
      content,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching liked content:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Follow User
exports.followUser = async (req, res) => {
  try {
    // Make sure user is not trying to follow themselves
    if (req.user.id === req.params.userId) {
      return res.status(400).json({ message: 'Users cannot follow themselves' });
    }
    
    const userToFollow = await User.findById(req.params.userId);
    
    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUser = await User.findById(req.user.id);
    
    // Check if already following
    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Update following array for current user
    currentUser.following.push(userToFollow._id);
    await currentUser.save();
    
    // Update followers array for the user being followed
    userToFollow.followers.push(currentUser._id);
    await userToFollow.save();
    
    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error in followUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Unfollow User
exports.unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.userId);
    
    if (!userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const currentUser = await User.findById(req.user.id);
    
    // Check if actually following
    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ message: 'Not following this user' });
    }
    
    // Update following array for current user
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();
    
    // Update followers array for the user being unfollowed
    userToUnfollow.followers = userToUnfollow.followers.filter(
      id => id.toString() !== currentUser._id.toString()
    );
    await userToUnfollow.save();
    
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error in unfollowUser:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Get Saved Content
exports.getSavedContent = async (req, res) => {
try {
  const { contentType, limit = 30, page = 1 } = req.query;
  const skip = (page - 1) * limit;
  
  const query = { savedBy: req.user.id };
  
  // Filter by content type if specified
  if (contentType && contentType !== 'all') {
    query.contentType = contentType;
  }
  
  const content = await Content.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('creator', 'username displayName profileImage');
  
  const total = await Content.countDocuments(query);
  
  res.json({
    content,
    pagination: {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    }
  });
} catch (error) {
  res.status(500).json({ 
    message: 'Server error', 
    error: error.message 
  });
}
};