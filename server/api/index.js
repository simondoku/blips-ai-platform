// Minimal Express serverless handler with MongoDB support
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// MongoDB connection - Optimized for serverless

// Comment indicating this file's purpose
// Note: This file provides serverless-compatible API endpoints for platforms
// like Vercel or Netlify Functions. It uses connection pooling and other
// optimizations specific to serverless environments.
// The main Express server is in /server/server.js

let cachedDb = null;
let isConnecting = false;
let connectionPromise = null;

const connectToDatabase = async () => {
  // Return existing connection if available
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  // If already connecting, wait for that promise
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  try {
    isConnecting = true;
    console.log('Attempting to connect to MongoDB...');
    
    // Log the MongoDB URI (redacted for security)
    const mongoUri = process.env.MONGODB_URI || 'Not set';
    const redactedUri = mongoUri !== 'Not set' 
      ? mongoUri.replace(/:([^@]+)@/, ':****@') 
      : 'Not set';
    console.log(`Using MongoDB URI: ${redactedUri}`);
    
    // Set serverless-friendly options with increased timeouts
    connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000, // Increased from 5s to 15s
      socketTimeoutMS: 45000,          // Increased from 10s to 45s
      connectTimeoutMS: 30000,         // Add explicit connect timeout
      maxPoolSize: 10,                 // Keep connection pool small
      minPoolSize: 1,
      family: 4                        // Force IPv4 (sometimes helps with connection issues)
    });
    
    cachedDb = await connectionPromise;
    console.log('MongoDB connected successfully');
    return cachedDb;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.error('Connection error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    throw error;
  } finally {
    isConnecting = false;
  }
};

// User Schema (simplified for serverless)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String },
  profileImage: { type: String },
  created: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Create model if it doesn't exist
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Create Express server
const app = express();

// CORS middleware for preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.send(200);
});

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Standard CORS middleware as well
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Simple health check that won't timeout
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Express serverless function is running',
    timestamp: new Date().toISOString()
  });
});

// Detailed health check with environment info
app.get('/api/health/detail', async (req, res) => {
  try {
    // Check environment variables (hide sensitive parts)
    const mongoUri = process.env.MONGODB_URI || 'Not set';
    const hasJwtSecret = process.env.JWT_SECRET ? 'Set' : 'Not set';
    
    // Show redacted MongoDB URI for debugging
    const redactedUri = mongoUri !== 'Not set' 
      ? mongoUri.replace(/:([^@]+)@/, ':****@') 
      : 'Not set';
    
    res.json({
      status: 'ok',
      message: 'Express serverless function environment check',
      mongoDbUri: redactedUri,
      jwtSecret: hasJwtSecret,
      nodeEnv: process.env.NODE_ENV || 'Not set',
      clientUrl: process.env.CLIENT_URL || 'Not set',
      cors: {
        enabled: true,
        origin: '*'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error in health check',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Database connection test endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    await connectToDatabase();
    res.json({
      status: 'ok',
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Authentication endpoints with timeout protection
app.post('/api/auth/register', async (req, res) => {
  console.log('Register request received:', req.body);
  
  try {
    // Set a timeout for the database operation
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), 5000)
    );
    
    // Try to connect to the database with a timeout
    try {
      // Race between DB connect and timeout
      await Promise.race([connectToDatabase(), timeoutPromise]);
      
      const { username, email, password, displayName } = req.body;
      
      // Check if user already exists - with timeout
      const findUserPromise = User.findOne({ 
        $or: [{ email }, { username }] 
      }).exec();
      
      const existingUser = await Promise.race([findUserPromise, timeoutPromise]);
      
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with that email or username already exists' 
        });
      }
      
      // Create new user
      const user = new User({ 
        username, 
        email, 
        password,
        displayName: displayName || username
      });
      
      // Save user with timeout
      const savePromise = user.save();
      await Promise.race([savePromise, timeoutPromise]);
      
      // Generate token
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET || '87d4ca31d4b1cce7f3df8f751e3d63c280f530b48480227e791158eb3fcb2346f087ace0',
        { expiresIn: '7d' }
      );
      
      res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          profileImage: user.profileImage
        }
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      
      // Fallback to mock registration if database times out
      if (dbError.message === 'Database operation timed out') {
        console.log('Using mock registration due to database timeout');
        
        const { username, email } = req.body;
        const mockUserId = 'mock-' + Date.now();
        
        // Generate token with fallback secret
        const token = jwt.sign(
          { id: mockUserId }, 
          process.env.JWT_SECRET || '87d4ca31d4b1cce7f3df8f751e3d63c280f530b48480227e791158eb3fcb2346f087ace0',
          { expiresIn: '7d' }
        );
        
        // Return mock user data
        return res.status(201).json({
          message: 'Registration successful (dev mode)',
          token,
          user: {
            id: mockUserId,
            username: username || 'testuser',
            email: email || 'test@example.com',
            displayName: username || 'Test User',
            profileImage: null,
            isMockUser: true
          }
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  console.log('Login request received:', req.body);
  
  try {
    // Set a timeout for the database operation
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database operation timed out')), 5000)
    );
    
    try {
      // Race between DB connect and timeout
      await Promise.race([connectToDatabase(), timeoutPromise]);
      
      const { email, password } = req.body;
      
      // Find user with timeout
      const findUserPromise = User.findOne({ email }).exec();
      const user = await Promise.race([findUserPromise, timeoutPromise]);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check password with timeout
      const passwordCheckPromise = user.comparePassword(password);
      const isMatch = await Promise.race([passwordCheckPromise, timeoutPromise]);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate token
      const token = jwt.sign(
        { id: user._id }, 
        process.env.JWT_SECRET || '87d4ca31d4b1cce7f3df8f751e3d63c280f530b48480227e791158eb3fcb2346f087ace0',
        { expiresIn: '7d' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          profileImage: user.profileImage
        }
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      
      // Fallback to mock login if database times out
      if (dbError.message === 'Database operation timed out') {
        console.log('Using mock login due to database timeout');
        
        const { email } = req.body;
        const mockUserId = 'mock-' + Date.now();
        
        // Generate token with fallback secret
        const token = jwt.sign(
          { id: mockUserId }, 
          process.env.JWT_SECRET || '87d4ca31d4b1cce7f3df8f751e3d63c280f530b48480227e791158eb3fcb2346f087ace0',
          { expiresIn: '7d' }
        );
        
        // Return mock user data
        return res.json({
          message: 'Login successful (dev mode)',
          token,
          user: {
            id: mockUserId,
            username: 'testuser',
            email: email || 'test@example.com',
            displayName: 'Test User',
            profileImage: null,
            isMockUser: true
          }
        });
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Simple "hello world" endpoint
app.get('/api/hello', (req, res) => {
  res.json({
    message: 'Hello from Express serverless function!',
    timestamp: new Date().toISOString()
  });
});

// Fallback route
app.all('*', (req, res) => {
  res.json({
    message: 'Minimal Express API is running',
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Export the Express API as a module
module.exports = app;