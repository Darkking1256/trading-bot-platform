const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// Production environment detection
const isProduction = process.env.NODE_ENV === 'production';

// Import database and services with error handling
let testConnection, initializeDatabase, UserService, TradeService, MarketDataService, TradingService, setIO, marketDataRoutes, brokerRoutes;

try {
  testConnection = require('./config/database').testConnection;
  initializeDatabase = require('./models/index').initializeDatabase;
  UserService = require('./services/UserService');
  TradeService = require('./services/TradeService');
  MarketDataService = require('./services/MarketDataService');
  const tradingModule = require('./services/TradingService');
  TradingService = tradingModule.TradingService;
  setIO = tradingModule.setIO;
  marketDataRoutes = require('./routes/marketData');
  brokerRoutes = require('./routes/broker');
} catch (error) {
  console.log(`⚠️  Some services not available: ${error.message}`);
  console.log(`📊 Running in minimal mode`);
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL || "*"
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app (only in production)
if (isProduction) {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize services with error handling
let marketDataService, tradingService;

try {
  if (MarketDataService) {
    marketDataService = new MarketDataService();
  }
  if (TradingService) {
    tradingService = new TradingService();
  }
} catch (error) {
  console.log(`⚠️  Service initialization failed: ${error.message}`);
}

// Market data (will be replaced with real data from service)
let marketData = {};
let symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'];
let positions = []; // Initialize positions array to prevent errors

// Initialize with simulated data
symbols.forEach(symbol => {
  marketData[symbol] = {
    bid: 1.0850 + Math.random() * 0.1,
    ask: 1.0850 + Math.random() * 0.1,
    timestamp: Date.now()
  };
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint (always available)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: 'demo_mode', // Running in demo mode without database
    marketData: symbols.length > 0 ? 'active' : 'inactive',
    port: process.env.PORT || 5000,
    uptime: process.uptime()
  });
});

// Basic API endpoints (always available)
app.get('/api/market-data', (req, res) => {
  res.json({
    symbols: symbols,
    data: marketData,
    timestamp: Date.now()
  });
});

app.get('/api/broker/status', (req, res) => {
  res.json({
    status: 'demo_mode',
    message: 'Running in demo mode - no live broker connection',
    available: false
  });
});

// Authentication routes (with error handling)
if (UserService) {
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // Create user using service
      const user = await UserService.createUser({
        username,
        email,
        password
      });

      // Generate token
      const token = UserService.generateToken(user);

      res.json({ 
        success: true, 
        message: 'User registered successfully',
        token,
        user
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      // Authenticate user using service
      const result = await UserService.authenticateUser(email, password);

      if (result.success) {
        res.json(result);
      } else {
        res.status(401).json(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  });
} else {
  // Fallback authentication endpoints
  app.post('/api/auth/register', (req, res) => {
    res.status(503).json({ error: 'Authentication service not available in demo mode' });
  });

  app.post('/api/auth/login', (req, res) => {
    res.status(503).json({ error: 'Authentication service not available in demo mode' });
  });
}

// Market data routes (with error handling)
if (marketDataRoutes) {
  app.use('/api/market-data', marketDataRoutes);
}

// Broker routes (with error handling)
if (brokerRoutes) {
  app.use('/api/broker', brokerRoutes);
}

// Trading routes (with error handling)
if (tradingService) {
  app.post('/api/trading/start', (req, res) => {
    try {
      const { strategy } = req.body;
      tradingService.startTrading(strategy);
      res.json({ success: true, message: 'Trading started' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/trading/stop', (req, res) => {
    try {
      tradingService.stopTrading();
      res.json({ success: true, message: 'Trading stopped' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/trading/status', (req, res) => {
    try {
      const status = tradingService.getState();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/trading/strategies', (req, res) => {
    try {
      const strategies = tradingService.getStrategies();
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
} else {
  // Fallback trading endpoints
  app.post('/api/trading/start', (req, res) => {
    res.status(503).json({ error: 'Trading service not available in demo mode' });
  });

  app.post('/api/trading/stop', (req, res) => {
    res.status(503).json({ error: 'Trading service not available in demo mode' });
  });

  app.get('/api/trading/status', (req, res) => {
    res.json({ status: 'demo_mode', message: 'Trading service not available' });
  });

  app.get('/api/trading/strategies', (req, res) => {
    res.json([]);
  });
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send initial market data
  socket.emit('marketData', marketData);

  // Handle trading actions
  socket.on('startTrading', (data) => {
    try {
      if (tradingService) {
        tradingService.startTrading(data.strategy);
        socket.emit('tradingStatus', { status: 'started', strategy: data.strategy });
      } else {
        socket.emit('error', { message: 'Trading service not available' });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('stopTrading', () => {
    try {
      if (tradingService) {
        tradingService.stopTrading();
        socket.emit('tradingStatus', { status: 'stopped' });
      } else {
        socket.emit('error', { message: 'Trading service not available' });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('getTradingStatus', () => {
    try {
      if (tradingService) {
        const status = tradingService.getState();
        socket.emit('tradingStatus', status);
      } else {
        socket.emit('tradingStatus', { status: 'demo_mode' });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Simulate market data updates
setInterval(() => {
  try {
    symbols.forEach(symbol => {
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

    // Update positions P&L (only if positions array exists)
    if (typeof positions !== 'undefined' && Array.isArray(positions)) {
      positions.forEach(position => {
        if (position.symbol && position.status === 'open') {
          const currentPrice = marketData[position.symbol]?.bid;
          if (currentPrice) {
            const priceDiff = currentPrice - position.openPrice;
            const multiplier = position.type === 'BUY' ? 1 : -1;
            position.pnl = priceDiff * multiplier * position.volume * 100000; // 100k units per lot
          }
        }
      });

      // Emit position updates
      io.emit('positionUpdate', positions.filter(p => p.status === 'open'));
    }
  } catch (error) {
    console.error('Error updating market data:', error);
  }
}, 2000); // Update every 2 seconds

// Serve React app (only in production)
if (isProduction) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    // Try to connect to database, but don't fail if it's not available
    if (testConnection && initializeDatabase) {
      try {
        await testConnection();
        await initializeDatabase();
        console.log(`💾 Database connected successfully`);
      } catch (dbError) {
        console.log(`⚠️  Database not available, running in demo mode: ${dbError.message}`);
        console.log(`📊 Using simulated data for demonstration`);
      }
    } else {
      console.log(`⚠️  Database services not available, running in demo mode`);
      console.log(`📊 Using simulated data for demonstration`);
    }
    
    // Initialize market data service
    if (marketDataService) {
      try {
        await marketDataService.initialize();
        
        // Update symbols and market data from service
        symbols = marketDataService.getAvailableSymbols();
        marketData = marketDataService.getAllCurrentPrices();
        
        console.log(`📊 Market data service initialized with ${symbols.length} symbols`);
      } catch (marketDataError) {
        console.log(`⚠️  Market data service failed, using simulated data: ${marketDataError.message}`);
        
        // Fallback to simulated data
        symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'];
        symbols.forEach(symbol => {
          marketData[symbol] = {
            bid: 1.0850 + Math.random() * 0.1,
            ask: 1.0850 + Math.random() * 0.1,
            timestamp: Date.now()
          };
        });
      }
    } else {
      console.log(`⚠️  Market data service not available, using simulated data`);
    }

    // Initialize trading service
    if (tradingService && setIO) {
      try {
        setIO(io); // Inject socket.io instance
        tradingService.initialize();
        console.log(`🤖 Trading service initialized successfully`);
      } catch (tradingError) {
        console.log(`⚠️  Trading service failed: ${tradingError.message}`);
      }
    } else {
      console.log(`⚠️  Trading service not available`);
    }
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 React app will be served from http://localhost:${PORT}`);
      console.log(`🔌 API endpoints available at http://localhost:${PORT}/api`);
      console.log(`📈 Market data service ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
