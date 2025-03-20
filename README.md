# Blips AI Media Platform

A platform for hosting AI-generated media including images, short clips, and films.


# Blips AI Platform Dependencies

This README outlines all the dependencies needed to run the Blips AI platform, which is a full-stack application for hosting AI-generated media.

## Backend (Server) Dependencies

```bash
npm install --save express mongoose cors dotenv jsonwebtoken bcrypt multer path fs uuid morgan helmet express-rate-limit express-validator 
```

### Core Dependencies

- **express**: Web server framework
- **mongoose**: MongoDB ODM for database operations
- **cors**: Cross-Origin Resource Sharing middleware
- **dotenv**: Environment variable management
- **jsonwebtoken**: JWT authentication
- **bcrypt**: Password hashing
- **multer**: File upload handling
- **fs**: File system operations
- **path**: File path utilities
- **uuid**: Unique ID generation

### Additional Dependencies

- **morgan**: HTTP request logger middleware
- **helmet**: Security headers middleware
- **express-rate-limit**: Rate limiting middleware
- **express-validator**: Input validation middleware
- **react-player**: Media player for streaming video content (server-side rendering support)

### Dev Dependencies

```bash
npm install --save-dev nodemon
```

- **nodemon**: Development server with hot reload

## Frontend (Client) Dependencies

```bash
npm install axios react-router-dom react-player framer-motion tailwindcss postcss autoprefixer react-hook-form zod @hookform/resolvers canvas
```

### Core Dependencies

- **axios**: HTTP client for API requests
- **react-router-dom**: Routing for React
- **react-player**: Media player component for videos
- **framer-motion**: Animation library
- **canvas**: Canvas API for image processing and manipulation

### Styling

- **tailwindcss**: Utility-first CSS framework
- **postcss**: CSS transformation tool
- **autoprefixer**: PostCSS plugin for vendor prefixes

### Form Handling

- **react-hook-form**: Form state management and validation
- **zod**: Schema validation
- **@hookform/resolvers**: Connects Zod with React Hook Form

## Installation Instructions

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
├── .gitignore
└── README.md
```
