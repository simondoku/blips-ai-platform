# Deploying Blips AI Platform to Vercel

This guide provides step-by-step instructions for deploying the Blips AI Platform to Vercel for the frontend and backend.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. GitHub, GitLab, or Bitbucket account with your project repository
3. MongoDB Atlas account for the database
4. Vercel CLI installed locally (optional, for testing)

```bash
npm install -g vercel
```

## Step 1: Set Up MongoDB Atlas

1. Create a MongoDB Atlas account if you don't have one
2. Create a new cluster
3. Set up database access (create a user with password)
4. Configure network access (IP whitelist or allow access from anywhere)
5. Get your MongoDB connection string

## Step 2: Deploy the Backend API

1. Navigate to the server directory and login to Vercel CLI (optional):
```bash
cd server
vercel login
```

2. Link to an existing project (if redeploying) or create a new one:
```bash
vercel link
```

3. Set environment variables:
```bash
vercel env add MONGODB_URI
# Enter your MongoDB Atlas connection string when prompted
vercel env add JWT_SECRET
# Enter your secure random string when prompted
vercel env add CLIENT_URL
# Enter https://blips-ai.com when prompted
vercel env add NODE_ENV
# Enter production when prompted
```

4. Deploy the backend:
```bash
vercel --prod
```

5. Note the deployment URL for your backend API (e.g., https://api.blips-ai.com)

### Deployment via Vercel Dashboard

Alternatively, you can deploy through the Vercel dashboard:

1. Import your repository
2. Select the server directory as the root directory
3. Set the build settings:
   - Build Command: `npm install`
   - Output Directory: Leave empty
   - Install Command: `npm install`
4. Add the same environment variables in the project settings
5. Deploy

## Step 3: Deploy the Frontend

1. Navigate to the client directory and login to Vercel CLI (optional):
```bash
cd ../client
vercel login
```

2. Link to an existing project (if redeploying) or create a new one:
```bash
vercel link
```

3. Set environment variables:
```bash
vercel env add VITE_API_URL
# Enter the backend API URL (https://api.blips-ai.com/api) when prompted
```

4. Deploy the frontend:
```bash
vercel --prod
```

5. Note the deployment URL for your frontend (e.g., https://blips-ai.com)

### Deployment via Vercel Dashboard

Alternatively, you can deploy through the Vercel dashboard:

1. Import your repository
2. Select the client directory as the root directory
3. Set the build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
4. Add the VITE_API_URL environment variable in the project settings
5. Deploy

## Step 4: Configure Custom Domain

1. Go to your Vercel project dashboard
2. Navigate to the "Domains" section
3. Add your custom domains:
   - blips-ai.com (for frontend)
   - api.blips-ai.com (for backend)
4. Follow the instructions to set up DNS settings with your domain provider

## Step 5: Set Up File Storage

Since Vercel deployments are immutable and don't support persistent file storage, you'll need to use a cloud storage service for file uploads:

1. Create an AWS S3 bucket or similar cloud storage service
2. Update the server code to use S3 for file storage instead of local filesystem
3. Add the AWS credentials as environment variables to your Vercel backend project:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION
   - AWS_S3_BUCKET

## Handling File Uploads with Vercel

Vercel has a 50MB payload limit and doesn't support persistent file storage. Here's how to implement file uploads:

1. In `server/middleware/upload.js`, modify the multer configuration to use S3 storage:

```javascript
// Add to package.json: "multer-s3": "^3.0.0", "aws-sdk": "^2.1692.0"
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileExtension = file.originalname.split('.').pop();
      cb(null, `${file.fieldname}/${uniqueSuffix}.${fileExtension}`);
    }
  }),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

module.exports = upload;
```

2. Update the API response to return the S3 URL instead of local file path:

```javascript
// In contentController.js
const handleUpload = async (req, res) => {
  try {
    // File is already uploaded to S3 by multer-s3
    const fileUrl = req.file.location; // S3 URL of the uploaded file
    
    // Create content in database with S3 URL
    const content = new Content({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      category: req.body.category,
      url: fileUrl, // S3 URL
      creator: req.user.id
    });
    
    await content.save();
    res.status(201).json(content);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading content', error: error.message });
  }
};
```

## Step 6: Verify Deployment

1. Test the frontend application at your domain (https://blips-ai.com)
2. Test the API endpoints (https://api.blips-ai.com/api/health)
3. Verify that authentication, content browsing, and other features work as expected

## Monitoring and Maintenance

1. Use Vercel Analytics to monitor frontend performance
2. Set up MongoDB Atlas monitoring for database performance
3. Implement logging with a service like Loggly or Papertrail
4. Set up Sentry or similar service for error tracking

## Automatic Deployments

Vercel automatically deploys when you push changes to your repository:

1. Push changes to the repository
2. Vercel automatically detects changes and starts a new deployment
3. Monitor the deployment in the Vercel dashboard

## Useful Vercel CLI Commands

```bash
# Deploy with environment variables from .env.local
vercel --env-file .env.local

# View logs
vercel logs <deployment-url>

# List deployments
vercel list

# Rollback to a previous deployment
vercel rollback
```

## Troubleshooting

1. **CORS issues**: Ensure the CLIENT_URL environment variable on the backend matches your frontend domain
2. **API connection errors**: Check that VITE_API_URL points to the correct backend URL
3. **MongoDB connection issues**: Verify your MongoDB Atlas IP access settings allow connections from Vercel's servers
4. **Environment variables missing**: Check that all required environment variables are set in the Vercel project settings