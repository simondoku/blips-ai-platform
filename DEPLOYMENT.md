# Blips AI Media Platform Deployment Guide

This document provides detailed instructions for deploying the Blips AI Media Platform in various environments.

## Prerequisites

- Node.js v18+ (LTS recommended)
- MongoDB 6.0+ (local or cloud service like MongoDB Atlas)
- Git
- Docker and Docker Compose (for container deployment)
- A domain name and SSL certificate (for production)

## Local Development Deployment

Follow the README.md instructions for setting up the development environment.

## Production Deployment Options

### 1. Docker Deployment

The easiest way to deploy the application is using Docker and Docker Compose.

1. Clone the repository:
```bash
git clone <repository-url>
cd blips-platform
```

2. Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb://<your-mongo-uri>/blips
JWT_SECRET=<your-secure-random-string>
CLIENT_URL=https://<your-domain.com>
```

3. Build and start the containers:
```bash
docker-compose up -d
```

4. The application will be available at http://localhost:5001 (or your configured domain)

### 2. Cloud Platform Deployment

#### AWS Elastic Beanstalk

1. Create a new Elastic Beanstalk application
2. Set up the required environment variables in the Elastic Beanstalk environment
3. Deploy the application using the AWS CLI or AWS Console

#### Heroku

1. Create a new Heroku application
2. Add MongoDB add-on or configure an external MongoDB connection
3. Set the required environment variables in Heroku settings
4. Deploy using the Heroku CLI:
```bash
heroku git:remote -a your-app-name
git push heroku main
```

#### Digital Ocean App Platform

1. Create a new App Platform application
2. Connect your GitHub repository
3. Configure the build and run commands:
   - Build Command: `cd client && npm install && npm run build`
   - Run Command: `cd server && npm install && npm start`
4. Configure environment variables
5. Deploy the application

### 3. Manual VPS Deployment

#### Server Setup

1. Set up a VPS with Ubuntu or your preferred Linux distribution
2. Install Node.js, npm, and MongoDB:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y mongodb
```

#### Application Deployment

1. Clone the repository:
```bash
git clone <repository-url>
cd blips-platform
```

2. Set up environment variables:
```bash
export NODE_ENV=production
export PORT=5001
export MONGODB_URI=mongodb://localhost:27017/blips
export JWT_SECRET=<your-secure-random-string>
export CLIENT_URL=https://<your-domain.com>
```

3. Build the frontend:
```bash
cd client
npm install
npm run build
```

4. Start the backend:
```bash
cd ../server
npm install
npm start
```

5. Set up a process manager (PM2) to keep the application running:
```bash
npm install -g pm2
pm2 start server.js --name blips-server
pm2 save
pm2 startup
```

#### Web Server Configuration (Nginx)

1. Install Nginx:
```bash
sudo apt-get install nginx
```

2. Configure Nginx by copying the provided nginx.conf file:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/blips
```

3. Update the domain name and SSL certificate paths in the configuration file
4. Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/blips /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 4. Serverless Deployment

For a serverless architecture, you can deploy:

1. Frontend to AWS S3 + CloudFront, Vercel, or Netlify
2. Backend to AWS Lambda + API Gateway or similar serverless platforms
3. Use MongoDB Atlas for the database

## Database Management

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Set up a new cluster
3. Create a database user with appropriate permissions
4. Whitelist your IP address or set network access to allow access from anywhere
5. Get your connection string and update your environment variables

### Database Backups

1. Set up automated backups in MongoDB Atlas
2. Or use mongodump for local backups:
```bash
mongodump --uri="mongodb://<your-connection-string>" --out=./backup
```

## SSL Configuration

For production, always use HTTPS:

1. Obtain an SSL certificate from Let's Encrypt:
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

2. Configure automatic renewal:
```bash
sudo certbot renew --dry-run
```

## Monitoring and Logging

1. Set up application monitoring with services like:
   - PM2 monitoring
   - New Relic
   - Datadog
   - AWS CloudWatch

2. Configure log management:
   - Use a logging service like Loggly or ELK stack
   - Set up log rotation for local logs

## Scaling Considerations

1. Load balancing: Use Nginx or a cloud load balancer
2. Database scaling: Configure MongoDB replication
3. Media storage: Move media uploads to S3 or similar object storage
4. CDN: Use a CDN for static assets and media content

## Troubleshooting

1. Check application logs:
```bash
pm2 logs blips-server
```

2. Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

3. Check MongoDB logs:
```bash
sudo tail -f /var/log/mongodb/mongodb.log
```

## Security Considerations

1. Keep all packages updated:
```bash
npm audit fix
```

2. Set up a firewall (UFW):
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

3. Configure secure headers in Nginx
4. Use environment variables for all sensitive information
5. Implement rate limiting for API endpoints
6. Use strong JWT secrets and short expiration times