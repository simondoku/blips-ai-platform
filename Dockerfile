FROM node:20-alpine as base

# Build stage for client
FROM base as client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Build stage for server
FROM base as server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci

# Final stage
FROM base
WORKDIR /app

# Copy built client files
COPY --from=client-builder /app/client/dist /app/client/dist

# Copy server files
COPY --from=server-builder /app/server/node_modules /app/server/node_modules
COPY server/ /app/server/

WORKDIR /app/server

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5001

# Command to run the app
CMD ["npm", "start"]
