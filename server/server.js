// server/server.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const userRoutes = require('./routes/user');
const commentRoutes = require('./routes/comment');
const feedbackRoutes = require('./routes/feedback');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'https://blips-ai.com',  // Allow only your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true // If cookies or credentials are needed
}));


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('*', cors());

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint hit');
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Debug route
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.status(200).send('Server is running. API available at /api endpoints.');
});

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,  // 15s instead of default 30s
    socketTimeoutMS: 45000,           // 45s 
    connectTimeoutMS: 30000,          // 30s
    family: 4                         // Force IPv4
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('Could not connect to MongoDB', err);
    console.error('MongoDB URI format issue detected. Ensure your .env file contains the correct connection string.');
    console.error('The connection string should look like: mongodb+srv://username:password@clustername.mongodb.net/?retryWrites=true&w=majority');
  });

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong on the server', 
    error: process.env.NODE_ENV === 'production' ? null : err.message 
  });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying ${PORT + 1}...`);
    // Try the next port
    server.close();
    app.listen(PORT + 1, () => {
      console.log(`Server running on port ${PORT + 1}`);
    });
  } else {
    console.error('Server error:', e);
  }
});