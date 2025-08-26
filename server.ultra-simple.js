const express = require('express');
const http = require('http');
const path = require('path');

console.log('🚀 Starting ultra-simple Railway server...');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Port: ${PORT}`);
console.log(`🏭 Production mode: ${isProduction}`);

// Basic middleware
app.use(express.json());

// Serve static files from the React app (only in production)
if (isProduction) {
  console.log('📁 Serving static files from client/build');
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    uptime: process.uptime(),
    message: 'Ultra-simple Railway server running successfully!',
    production: isProduction
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint requested');
  if (isProduction) {
    // Serve the React app
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  } else {
    res.json({
      message: 'Trading Bot Platform API - Ultra Simple Server',
      status: 'running',
      endpoints: {
        health: '/api/health',
        test: '/api/test'
      },
      timestamp: new Date().toISOString()
    });
  }
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint requested');
  res.json({ 
    message: 'Ultra-simple Railway server is working!',
    timestamp: new Date().toISOString(),
    port: PORT,
    production: isProduction
  });
});

// Keep-alive endpoint to prevent Railway from stopping the container
app.get('/api/keepalive', (req, res) => {
  console.log('💓 Keep-alive ping received');
  res.json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Catch all handler for React Router (only in production)
if (isProduction) {
  app.get('*', (req, res) => {
    console.log(`🔄 Serving React app for route: ${req.path}`);
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Ultra-simple Railway server running on port ${PORT}`);
  console.log(`🔌 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🏠 Root endpoint: http://localhost:${PORT}/`);
  console.log(`💓 Keep-alive: http://localhost:${PORT}/api/keepalive`);
  if (isProduction) {
    console.log(`📱 React app served at http://localhost:${PORT}/`);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️ Port ${PORT} is already in use`);
  }
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

// Keep the process alive
setInterval(() => {
  console.log('💓 Server heartbeat - still running...');
}, 30000); // Log every 30 seconds

module.exports = { app, server };
