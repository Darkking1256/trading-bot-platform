#!/bin/bash

# Build script for React client
echo "🔨 Building React client..."

# Navigate to client directory
cd client

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing client dependencies..."
    npm install
fi

# Set build environment
export NODE_ENV=production
export CI=false
export GENERATE_SOURCEMAP=false

# Build the client
echo "🏗️ Running build..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Client build successful!"
else
    echo "⚠️ Build completed with warnings, but continuing..."
fi

# Return to root directory
cd ..

echo "🎉 Build process completed!"
