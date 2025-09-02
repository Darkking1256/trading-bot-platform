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

# Debug: Show what files we have
RUN echo "=== Current directory structure ===" && \
    pwd && \
    ls -la && \
    echo "=== Client directory ===" && \
    ls -la client/ && \
    echo "=== Client public directory ===" && \
    ls -la client/public/ && \
    echo "=== Checking for index.html ===" && \
    test -f client/public/index.html && echo "index.html found" || echo "index.html NOT found"

# Verify that index.html exists before building
RUN test -f client/public/index.html || (echo "index.html missing!" && exit 1)

# Now run the build process manually with verbose output
RUN cd client && echo "Starting React build..." && \
    npm run build && \
    echo "React build completed" && \
    ls -la build/ && \
    test -f build/index.html && echo "build/index.html found" || echo "build/index.html missing!"

# Verify the build output
RUN test -f client/build/index.html || (echo "React build failed - index.html missing!" && exit 1)

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["npm", "start"]
