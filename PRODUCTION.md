# Blips AI Media Platform Production Deployment Guide

This document provides detailed instructions specifically for deploying Blips AI (blips-ai.com) to production.

## Domain Setup

Domain name: blips-ai.com

1. DNS Configuration:
   - Set up an A record pointing to your server IP
   - Set up a CNAME record for www.blips-ai.com pointing to blips-ai.com
   - If using a subdomain for API (api.blips-ai.com), set up an A record for it

## Server Setup

1. Provision a VPS with at least:

   - 2GB RAM
   - 2 vCPUs
   - 40GB SSD storage
   - Ubuntu 22.04 LTS

2. Install Docker and Docker Compose:

   ```bash
   sudo apt update
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   sudo apt update
   sudo apt install -y docker-ce docker-compose
   sudo usermod -aG docker ${USER}
   ```

3. Install Nginx and Certbot for SSL:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```

## Production Deployment

1. Clone the repository on your server:

   ```bash
   git clone https://github.com/yourusername/blips-platform.git
   cd blips-platform
   ```

2. Create and configure the production .env file:

   ```bash
   cp .env.example .env
   nano .env
   ```

   Update with the following values:

   ```
   PORT=5001
   NODE_ENV=production
   MONGODB_URI=mongodb://mongo:27017/blips
   JWT_SECRET=<generate-a-secure-random-string>
   CLIENT_URL=https://blips-ai.com
   ```

3. Build and start the Docker containers:

   ```bash
   docker-compose up -d
   ```

4. Configure Nginx:

   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/blips-ai.com
   sudo ln -s /etc/nginx/sites-available/blips-ai.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Set up SSL certificates:
   ```bash
   sudo certbot --nginx -d blips-ai.com -d www.blips-ai.com
   ```

## Monitoring and Maintenance

1. Monitor container status:

   ```bash
   docker ps
   docker-compose logs
   ```

2. Regular database backups:

   ```bash
   # From inside the container
   docker exec -it blips-platform_mongo_1 mongodump --out=/data/backup

   # Copy to host
   docker cp blips-platform_mongo_1:/data/backup ./backup
   ```

3. Update application:
   ```bash
   git pull
   docker-compose down
   docker-compose up -d --build
   ```

## Security Measures

1. Firewall configuration:

   ```bash
   sudo ufw allow ssh
   sudo ufw allow http
   sudo ufw allow https
   sudo ufw enable
   ```

2. Secure MongoDB:

   - The MongoDB container is only accessible within the Docker network
   - For additional security, set up authentication in MongoDB

3. Set up automatic security updates:
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

## Scaling Considerations

As traffic grows, consider:

1. Moving to a managed MongoDB service like MongoDB Atlas
2. Setting up a load balancer with multiple application servers
3. Using a CDN for static assets
4. Moving file uploads to S3 or similar object storage service

## Third-party Services Integration

1. Setup monitoring with services like:

   - New Relic
   - Datadog
   - Sentry for error tracking

2. Set up analytics:
   - Google Analytics
   - Mixpanel
   - Amplitude

## Troubleshooting

Common issues and solutions:

1. **Application not accessible**: Check Nginx and Docker container status
2. **Database connection issues**: Verify MongoDB container is running
3. **SSL certificate errors**: Check certificate renewal and configuration

For additional support, refer to the project documentation or contact the development team.
