# Blips AI Media Platform

A platform for hosting AI-generated media including images, short clips, and films.

## Overview

Blips is a full-stack web application for hosting and sharing AI-generated media content including images, short videos, and films. The platform allows users to upload, browse, and interact with various types of AI-generated content.

## Features

- User authentication (register, login, profile management)
- Upload and manage AI-generated content (images, shorts, films)
- Content browsing and discovery
- Content interaction (comments, likes)
- Responsive design for mobile and desktop

## Tech Stack

### Frontend
- React 19 with Vite
- TailwindCSS for styling
- React Router for navigation
- Framer Motion for animations
- React Hook Form with Zod validation

### Backend
- Express.js on Node.js
- MongoDB with Mongoose ODM
- JWT authentication
- Multer for file uploads

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/blips
JWT_SECRET=your_jwt_secret_here
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```
VITE_API_URL=http://localhost:5001/api
```

4. Start the development server:
```bash
npm run dev
```

## Deployment

### Docker Deployment

1. Build and run the application using Docker Compose:
```bash
docker-compose up -d
```

2. Access the application at http://localhost:5001

### Manual Deployment

#### Backend Deployment

1. Set up environment variables for production:
```
NODE_ENV=production
PORT=5001
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=your_frontend_url
```

2. Build and start the server:
```bash
cd server
npm install
npm start
```

#### Frontend Deployment

1. Set up environment variables for production:
```
VITE_API_URL=your_backend_api_url
```

2. Build the frontend:
```bash
cd client
npm install
npm run build
```

3. Serve the built files using a web server like Nginx

## Nginx Configuration

A sample nginx.conf file is provided for hosting the application with Nginx. Update the domain name and SSL certificate paths before using.

## Notes

- The backend server runs on port 5001 by default
- The frontend development server runs on port 5173 by default
- Make sure MongoDB is running locally or update the MONGODB_URI in the `.env` file with your MongoDB Atlas connection string
- The uploads directory will be created automatically in the server directory

## Folder Structure

```
blips-platform/
├── client/             # Frontend React application
├── server/             # Backend Express application
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # API routes
│   ├── uploads/        # Uploaded media files
│   └── server.js       # Main server file
├── Dockerfile          # Docker build configuration
├── docker-compose.yml  # Docker Compose configuration
├── nginx.conf          # Sample Nginx configuration
├── .env.example        # Example environment variables
└── README.md
```