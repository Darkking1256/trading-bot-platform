# Railway-optimized Dockerfile for Trading Bot
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++ git curl

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies (skip postinstall scripts to avoid build issues)
RUN npm install --ignore-scripts
RUN cd client && npm install --ignore-scripts

# Copy ALL source code (including client/public/index.html)
COPY . .

# Verify that index.html exists before building
RUN ls -la client/public/ && test -f client/public/index.html

# Now run the postinstall scripts manually after all files are copied
RUN npm run install-client && npm run build-client

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
