const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Serve static files from the React app (only in production)
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'demo_mode',
    marketData: 'active',
    port: process.env.PORT || 5000,
    uptime: process.uptime(),
    message: 'Ultra-minimal server running successfully!'
  });
});

// Market data endpoint
app.get('/api/market-data', (req, res) => {
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
  res.json({
    status: 'demo_mode',
    message: 'Running in demo mode - no live broker connection',
    available: false
  });
});

// Trading endpoints
app.post('/api/trading/start', (req, res) => {
  res.json({ success: true, message: 'Trading started in demo mode' });
});

app.post('/api/trading/stop', (req, res) => {
  res.json({ success: true, message: 'Trading stopped' });
});

app.get('/api/trading/status', (req, res) => {
  res.json({ 
    status: 'demo_mode', 
    message: 'Running in demo mode',
    isRunning: false,
    strategy: 'none'
  });
});

app.get('/api/trading/strategies', (req, res) => {
  res.json([
    { id: 'random_walk', name: 'Random Walk', description: 'Simple random walk strategy' },
    { id: 'ma_crossover', name: 'Moving Average Crossover', description: 'MA crossover strategy' },
    { id: 'rsi', name: 'RSI Strategy', description: 'RSI-based trading strategy' }
  ]);
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Ultra-minimal server is working!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000
  });
});

// Serve React app (only in production)
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Ultra-minimal server running on port ${PORT}`);
  console.log(`📱 React app will be served from http://localhost:${PORT}`);
  console.log(`🔌 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});

module.exports = { app, server };
