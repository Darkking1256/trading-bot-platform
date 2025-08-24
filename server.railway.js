const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

console.log('🚀 Starting Railway server...');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 5000;

console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Port: ${PORT}`);

// Serve static files from the React app (only in production)
if (isProduction) {
  try {
    app.use(express.static(path.join(__dirname, 'client/build')));
    console.log('✅ Static files middleware configured');
  } catch (error) {
    console.log('⚠️ Static files middleware failed:', error.message);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check requested');
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'demo_mode',
    marketData: 'active',
    port: PORT,
    uptime: process.uptime(),
    message: 'Railway server running successfully!'
  });
});

// Market data endpoint
app.get('/api/market-data', (req, res) => {
  console.log('📈 Market data requested');
  const marketData = {
    EURUSD: { bid: 1.0850, ask: 1.0851, timestamp: Date.now() },
    GBPUSD: { bid: 1.2650, ask: 1.2651, timestamp: Date.now() },
    USDJPY: { bid: 148.50, ask: 148.51, timestamp: Date.now() },
    USDCHF: { bid: 0.8850, ask: 0.8851, timestamp: Date.now() },
    AUDUSD: { bid: 0.6580, ask: 0.6581, timestamp: Date.now() },
    USDCAD: { bid: 1.3520, ask: 1.3521, timestamp: Date.now() }
  };
  
  res.json({
    symbols: Object.keys(marketData),
    data: marketData,
    timestamp: Date.now()
  });
});

// Broker status endpoint
app.get('/api/broker/status', (req, res) => {
  console.log('🏦 Broker status requested');
  res.json({
    status: 'demo_mode',
    message: 'Running in demo mode - no live broker connection',
    available: false
  });
});

// Trading endpoints
app.post('/api/trading/start', (req, res) => {
  console.log('▶️ Trading start requested');
  res.json({ success: true, message: 'Trading started in demo mode' });
});

app.post('/api/trading/stop', (req, res) => {
  console.log('⏹️ Trading stop requested');
  res.json({ success: true, message: 'Trading stopped' });
});

app.get('/api/trading/status', (req, res) => {
  console.log('📊 Trading status requested');
  res.json({ 
    status: 'demo_mode', 
    message: 'Running in demo mode',
    isRunning: false,
    strategy: 'none'
  });
});

app.get('/api/trading/strategies', (req, res) => {
  console.log('📋 Trading strategies requested');
  res.json([
    { id: 'random_walk', name: 'Random Walk', description: 'Simple random walk strategy' },
    { id: 'ma_crossover', name: 'Moving Average Crossover', description: 'MA crossover strategy' },
    { id: 'rsi', name: 'RSI Strategy', description: 'RSI-based trading strategy' }
  ]);
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint requested');
  res.json({ 
    message: 'Railway server is working!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint requested');
  res.json({
    message: 'Trading Bot Platform API',
    status: 'running',
    endpoints: {
      health: '/api/health',
      marketData: '/api/market-data',
      broker: '/api/broker/status',
      trading: '/api/trading/status',
      test: '/api/test'
    },
    timestamp: new Date().toISOString()
  });
});

// Serve React app (only in production)
if (isProduction) {
  app.get('*', (req, res) => {
    try {
      res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    } catch (error) {
      console.log('⚠️ React app serve failed:', error.message);
      res.json({
        message: 'Trading Bot Platform - Backend Running',
        note: 'Frontend build not available, but API is working',
        endpoints: ['/api/health', '/api/market-data', '/api/test']
      });
    }
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Start server with proper error handling
server.listen(PORT, () => {
  console.log(`🚀 Railway server running on port ${PORT}`);
  console.log(`📱 React app will be served from http://localhost:${PORT}`);
  console.log(`🔌 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`🏠 Root endpoint: http://localhost:${PORT}/`);
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

module.exports = { app, server };
