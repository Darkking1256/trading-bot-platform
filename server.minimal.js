const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Serve static files from the React app (only in production)
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Market data simulation
let marketData = {
  EURUSD: { bid: 1.0850, ask: 1.0851, timestamp: Date.now() },
  GBPUSD: { bid: 1.2650, ask: 1.2651, timestamp: Date.now() },
  USDJPY: { bid: 148.50, ask: 148.51, timestamp: Date.now() },
  USDCHF: { bid: 0.8850, ask: 0.8851, timestamp: Date.now() },
  AUDUSD: { bid: 0.6580, ask: 0.6581, timestamp: Date.now() },
  USDCAD: { bid: 1.3520, ask: 1.3521, timestamp: Date.now() }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'demo_mode',
    marketData: 'active',
    port: process.env.PORT || 5000,
    uptime: process.uptime()
  });
});

// Market data endpoint
app.get('/api/market-data', (req, res) => {
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

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send initial market data
  socket.emit('marketData', marketData);

  // Handle trading actions
  socket.on('startTrading', (data) => {
    socket.emit('tradingStatus', { status: 'started', strategy: data.strategy || 'demo' });
  });

  socket.on('stopTrading', () => {
    socket.emit('tradingStatus', { status: 'stopped' });
  });

  socket.on('getTradingStatus', () => {
    socket.emit('tradingStatus', { status: 'demo_mode' });
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Simulate market data updates
setInterval(() => {
  Object.keys(marketData).forEach(symbol => {
    const currentPrice = marketData[symbol].bid;
    const change = (Math.random() - 0.5) * 0.001; // Small random change
    const newPrice = currentPrice + change;
    
    marketData[symbol] = {
      bid: newPrice,
      ask: newPrice + 0.0001,
      timestamp: Date.now()
    };
  });

  // Emit updates to all connected clients
  io.emit('marketData', marketData);
}, 2000); // Update every 2 seconds

// Serve React app (only in production)
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Minimal server running on port ${PORT}`);
  console.log(`📱 React app will be served from http://localhost:${PORT}`);
  console.log(`🔌 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📈 Market data service ready`);
});

module.exports = { app, server, io };
