const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

// Import database and services
const { initializeDatabase, testConnection } = require('./config/database');
const UserService = require('./services/UserService');
const TradeService = require('./services/TradeService');
const MarketDataService = require('./services/MarketDataService');
const marketDataRoutes = require('./routes/marketData');

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
app.use(express.static(path.join(__dirname, 'client/build')));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize market data service
const marketDataService = new MarketDataService();

// Market data (will be replaced with real data from service)
let marketData = {};
let symbols = [];
let positions = []; // Initialize positions array to prevent errors

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

// Authentication routes
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
    const { username, password } = req.body;

    // Authenticate user
    const user = await UserService.authenticate(username, password);
    
    // Generate token
    const token = UserService.generateToken(user);

    res.json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message || 'Login failed' });
  }
});

app.post('/api/auth/verify', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  // In a real application, you might want to blacklist the token
  res.json({ success: true, message: 'Logged out successfully' });
});

// User routes
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const profile = await UserService.getUserProfile(req.user.id);
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: error.message || 'Failed to get profile' });
  }
});

app.put('/api/user/preferences', authenticateToken, async (req, res) => {
  try {
    const user = await UserService.updatePreferences(req.user.id, req.body);
    res.json({ success: true, user });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: error.message || 'Failed to update preferences' });
  }
});

// Market data routes
app.use('/api/market', marketDataRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle account info request
  socket.on('getAccountInfo', () => {
    // In a real app, get user from socket authentication
    const user = users[0]; // Demo user
    socket.emit('accountInfo', {
      balance: user.balance,
      equity: user.equity,
      margin: user.margin,
      freeMargin: user.freeMargin,
      marginLevel: user.marginLevel
    });
  });

  // Handle recent trades request
  socket.on('getRecentTrades', ({ limit = 10 }) => {
    const recentTrades = trades
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    socket.emit('recentTradesData', recentTrades);
  });

  // Handle active positions request
  socket.on('getActivePositions', () => {
    const activePositions = positions.filter(p => p.status === 'open');
    socket.emit('activePositionsData', activePositions);
  });

  // Handle performance data request
  socket.on('getPerformanceData', () => {
    // Generate sample performance data
    const performanceData = [];
    const baseEquity = 10000;
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      performanceData.push({
        date: date.toISOString().split('T')[0],
        equity: baseEquity + Math.random() * 2000 - 1000
      });
    }
    socket.emit('performanceData', performanceData);
  });

  // Handle chart data request
  socket.on('getChartData', ({ symbol, timeframe }) => {
    // Generate sample chart data
    const chartData = [];
    const basePrice = marketData[symbol]?.bid || 1.0850;
    
    for (let i = 100; i >= 0; i--) {
      const time = new Date();
      time.setMinutes(time.getMinutes() - i * 5);
      
      const volatility = 0.001;
      const change = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + change * i);
      
      chartData.push({
        time: Math.floor(time.getTime() / 1000),
        open: price * (1 + (Math.random() - 0.5) * 0.0005),
        high: price * (1 + Math.random() * 0.001),
        low: price * (1 - Math.random() * 0.001),
        close: price
      });
    }
    
    socket.emit('chartData', chartData);
  });

  // Handle order history request
  socket.on('getOrderHistory', ({ symbol, limit = 20 }) => {
    const symbolOrders = trades
      .filter(t => t.symbol === symbol)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    socket.emit('orderHistory', symbolOrders);
  });

  // Handle market data subscription
  socket.on('subscribe', (symbol) => {
      socket.join(symbol);
      console.log(`Client ${socket.id} subscribed to ${symbol}`);
  });

  // Handle market data unsubscription
  socket.on('unsubscribe', (symbol) => {
    socket.leave(symbol);
    console.log(`Client ${socket.id} unsubscribed from ${symbol}`);
  });

  // Handle order placement
  socket.on('placeOrder', (orderData) => {
    try {
      const { symbol, type, volume, stopLoss, takeProfit, price } = orderData;
      
      // Create new trade
      const trade = {
        id: Date.now(),
        symbol,
        type,
        volume: parseFloat(volume),
        price: parseFloat(price),
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        timestamp: new Date(),
        status: 'open',
        pnl: 0
      };

      trades.push(trade);

      // Create position if it's a market order
      const position = {
        id: trade.id,
        symbol,
        type,
        volume: parseFloat(volume),
        openPrice: parseFloat(price),
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        timestamp: new Date(),
        status: 'open',
        pnl: 0
      };

      positions.push(position);

      // Emit order result
      socket.emit('orderResult', {
        success: true,
        orderId: trade.id,
        message: 'Order placed successfully'
      });

      // Emit trade update to all clients
      io.emit('tradeUpdate', trade);
      io.emit('positionUpdate', positions.filter(p => p.status === 'open'));

    } catch (error) {
      console.error('Order placement error:', error);
      socket.emit('orderResult', {
        success: false,
        error: 'Failed to place order'
      });
    }
  });

  // Handle advanced order placement
  socket.on('placeAdvancedOrder', (orderData) => {
    try {
      const { symbol, orderType, type, volume, price, stopLoss, takeProfit, expiry, condition, conditionPrice } = orderData;
      
      // Create advanced order
      const order = {
        id: Date.now(),
        symbol,
        orderType,
        type,
        volume: parseFloat(volume),
        price: price ? parseFloat(price) : null,
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        takeProfit: takeProfit ? parseFloat(takeProfit) : null,
        expiry: expiry ? new Date(expiry) : null,
        condition,
        conditionPrice: conditionPrice ? parseFloat(conditionPrice) : null,
        timestamp: new Date(),
        status: 'pending'
      };

      // Add to pending orders
      if (!global.pendingOrders) global.pendingOrders = [];
      global.pendingOrders.push(order);

      // Emit order result
      socket.emit('advancedOrderResult', {
        success: true,
        orderId: order.id,
        message: 'Advanced order placed successfully'
      });

      // Emit order update to all clients
      io.emit('orderUpdate', order);

    } catch (error) {
      console.error('Advanced order placement error:', error);
      socket.emit('advancedOrderResult', {
        success: false,
        error: 'Failed to place advanced order'
      });
    }
  });

  // Handle pending orders request
  socket.on('getPendingOrders', ({ symbol }) => {
    const pendingOrders = global.pendingOrders || [];
    const filteredOrders = symbol ? pendingOrders.filter(order => order.symbol === symbol) : pendingOrders;
    socket.emit('pendingOrdersData', filteredOrders);
  });

  // Handle order cancellation
  socket.on('cancelOrder', ({ orderId }) => {
    try {
      const pendingOrders = global.pendingOrders || [];
      const orderIndex = pendingOrders.findIndex(order => order.id === orderId);
      
      if (orderIndex !== -1) {
        const order = pendingOrders[orderIndex];
        order.status = 'cancelled';
        
        socket.emit('cancelOrderResult', {
          success: true,
          message: 'Order cancelled successfully'
        });

        io.emit('orderUpdate', order);
      } else {
        socket.emit('cancelOrderResult', {
          success: false,
          error: 'Order not found'
        });
      }
    } catch (error) {
      socket.emit('cancelOrderResult', {
        success: false,
        error: 'Failed to cancel order'
      });
    }
  });

  // Handle order modification
  socket.on('modifyOrder', ({ orderId, modifications }) => {
    try {
      const pendingOrders = global.pendingOrders || [];
      const orderIndex = pendingOrders.findIndex(order => order.id === orderId);
      
      if (orderIndex !== -1) {
        Object.assign(pendingOrders[orderIndex], modifications);
        
        socket.emit('modifyOrderResult', {
          success: true,
          message: 'Order modified successfully'
        });

        io.emit('orderUpdate', pendingOrders[orderIndex]);
      } else {
        socket.emit('modifyOrderResult', {
          success: false,
          error: 'Order not found'
        });
      }
    } catch (error) {
      socket.emit('modifyOrderResult', {
        success: false,
        error: 'Failed to modify order'
      });
    }
  });

  // Handle accounts request
  socket.on('getAccounts', () => {
    const accounts = [
      {
        id: 1,
        name: 'Demo Account',
        type: 'Demo',
        balance: 10000,
        currency: 'USD',
        leverage: 100
      },
      {
        id: 2,
        name: 'Live Account',
        type: 'Live',
        balance: 50000,
        currency: 'USD',
        leverage: 50
      }
    ];
    socket.emit('accountsData', accounts);
  });

  // Handle portfolio data request
  socket.on('getPortfolioData', () => {
    const portfolioData = {
      totalBalance: 60000,
      availableBalance: 45000,
      totalPnL: 2500,
      totalPnLPercent: 4.17,
      openPositions: positions.length,
      marginUsed: 15000,
      positions: positions.map(pos => ({
        ...pos,
        currentPrice: marketData[pos.symbol]?.bid || pos.openPrice,
        pnlPercent: ((pos.pnl / (pos.openPrice * pos.volume * 100000)) * 100) || 0
      }))
    };
    socket.emit('portfolioData', portfolioData);
  });

  // Handle risk metrics request
  socket.on('getRiskMetrics', () => {
    const riskMetrics = {
      riskScore: 0.45,
      maxDrawdown: 12.5,
      sharpeRatio: 1.8,
      volatility: 15.2,
      var95: 8.5,
      warnings: []
    };

    // Add warnings based on risk level
    if (riskMetrics.riskScore > 0.7) {
      riskMetrics.warnings.push('High risk exposure detected');
    }
    if (riskMetrics.maxDrawdown > 20) {
      riskMetrics.warnings.push('Maximum drawdown exceeds recommended limits');
    }

    socket.emit('riskMetricsData', riskMetrics);
  });

  // Handle allocation data request
  socket.on('getAllocationData', () => {
    const allocationData = [
      { name: 'EUR/USD', symbol: 'EURUSD', value: 25000, percentage: 41.67 },
      { name: 'GBP/USD', symbol: 'GBPUSD', value: 15000, percentage: 25.00 },
      { name: 'USD/JPY', symbol: 'USDJPY', value: 10000, percentage: 16.67 },
      { name: 'USD/CHF', symbol: 'USDCHF', value: 7500, percentage: 12.50 },
      { name: 'AUD/USD', symbol: 'AUDUSD', value: 2500, percentage: 4.17 }
    ];
    socket.emit('allocationData', allocationData);
  });

  // Social Trading Handlers
  socket.on('getTraders', () => {
    const mockTraders = [
      {
        id: 1,
        name: 'Alex Thompson',
        username: 'alex_trader',
        performance: 15.8,
        winRate: 68.5,
        totalTrades: 156,
        riskScore: 3,
        avgTrade: 125.50,
        followers: 1247,
        copiers: 89,
        trending: true,
        verified: true,
        isFollowing: false,
        isCopying: false
      },
      {
        id: 2,
        name: 'Sarah Chen',
        username: 'sarah_fx',
        performance: 22.3,
        winRate: 72.1,
        totalTrades: 203,
        riskScore: 4,
        avgTrade: 89.75,
        followers: 2156,
        copiers: 156,
        trending: true,
        verified: true,
        isFollowing: true,
        isCopying: true
      },
      {
        id: 3,
        name: 'Mike Rodriguez',
        username: 'mike_forex',
        performance: 8.9,
        winRate: 61.2,
        totalTrades: 98,
        riskScore: 2,
        avgTrade: 67.30,
        followers: 567,
        copiers: 34,
        trending: false,
        verified: false,
        isFollowing: false,
        isCopying: false
      },
      {
        id: 4,
        name: 'Emma Wilson',
        username: 'emma_trades',
        performance: 31.2,
        winRate: 75.8,
        totalTrades: 312,
        riskScore: 5,
        avgTrade: 145.20,
        followers: 3421,
        copiers: 234,
        trending: true,
        verified: true,
        isFollowing: false,
        isCopying: false
      },
      {
        id: 5,
        name: 'David Kim',
        username: 'david_kim',
        performance: 12.7,
        winRate: 65.4,
        totalTrades: 178,
        riskScore: 3,
        avgTrade: 78.90,
        followers: 892,
        copiers: 67,
        trending: false,
        verified: true,
        isFollowing: true,
        isCopying: false
      }
    ];
    socket.emit('tradersData', mockTraders);
  });

  socket.on('getLeaderboard', () => {
    const mockLeaderboard = [
      { id: 4, name: 'Emma Wilson', performance: 31.2, trades: 312, winRate: 75.8 },
      { id: 2, name: 'Sarah Chen', performance: 22.3, trades: 203, winRate: 72.1 },
      { id: 1, name: 'Alex Thompson', performance: 15.8, trades: 156, winRate: 68.5 },
      { id: 5, name: 'David Kim', performance: 12.7, trades: 178, winRate: 65.4 },
      { id: 3, name: 'Mike Rodriguez', performance: 8.9, trades: 98, winRate: 61.2 }
    ];
    socket.emit('leaderboardData', mockLeaderboard);
  });

  socket.on('getSocialFeed', () => {
    const mockSocialFeed = [
      {
        id: 1,
        traderName: 'Alex Thompson',
        traderId: 1,
        type: 'trade',
        content: 'Just closed a profitable EURUSD trade! +$245 profit',
        timestamp: '2 hours ago',
        likes: 23,
        comments: 5,
        tradeDetails: { symbol: 'EURUSD', profit: 245, type: 'BUY' }
      },
      {
        id: 2,
        traderName: 'Sarah Chen',
        traderId: 2,
        type: 'analysis',
        content: 'GBPUSD showing strong support at 1.2500. Looking for long opportunities.',
        timestamp: '4 hours ago',
        likes: 45,
        comments: 12
      },
      {
        id: 3,
        traderName: 'Emma Wilson',
        traderId: 4,
        type: 'achievement',
        content: 'Reached 1000 followers! Thank you all for your support.',
        timestamp: '6 hours ago',
        likes: 89,
        comments: 23
      },
      {
        id: 4,
        traderName: 'David Kim',
        traderId: 5,
        type: 'trade',
        content: 'USDJPY trade closed with +$245 profit. Market analysis was spot on!',
        timestamp: '8 hours ago',
        likes: 34,
        comments: 8,
        tradeDetails: { symbol: 'USDJPY', profit: 245, type: 'SELL' }
      }
    ];
    socket.emit('socialFeedData', mockSocialFeed);
  });

  socket.on('getCopyTrades', () => {
    const mockCopyTrades = [
      {
        id: 1,
        traderId: 2,
        traderName: 'Sarah Chen',
        status: 'active',
        startDate: '2024-01-15',
        copiedTrades: 23,
        totalPnL: 456.78,
        winRate: 69.6
      }
    ];
    socket.emit('copyTradesData', mockCopyTrades);
  });

  socket.on('startCopyTrading', ({ traderId }) => {
    const mockTraders = [
      { id: 1, name: 'Alex Thompson' },
      { id: 2, name: 'Sarah Chen' },
      { id: 3, name: 'Mike Rodriguez' },
      { id: 4, name: 'Emma Wilson' },
      { id: 5, name: 'David Kim' }
    ];
    const trader = mockTraders.find(t => t.id === traderId);
    if (trader) {
      socket.emit('copyTradingResult', {
        success: true,
        traderName: trader.name,
        settings: {
          maxInvestment: 1000,
          riskPercentage: 2,
          copyPercentage: 100
        }
      });
    } else {
      socket.emit('copyTradingResult', {
        success: false,
        error: 'Trader not found'
      });
    }
  });

  socket.on('stopCopyTrading', ({ traderId }) => {
    const mockTraders = [
      { id: 1, name: 'Alex Thompson' },
      { id: 2, name: 'Sarah Chen' },
      { id: 3, name: 'Mike Rodriguez' },
      { id: 4, name: 'Emma Wilson' },
      { id: 5, name: 'David Kim' }
    ];
    const trader = mockTraders.find(t => t.id === traderId);
    if (trader) {
      socket.emit('stopCopyTradingResult', {
        success: true,
        traderName: trader.name
      });
    } else {
      socket.emit('stopCopyTradingResult', {
        success: false,
        error: 'Trader not found'
      });
    }
  });

  socket.on('followTrader', ({ traderId }) => {
    const mockTraders = [
      { id: 1, name: 'Alex Thompson' },
      { id: 2, name: 'Sarah Chen' },
      { id: 3, name: 'Mike Rodriguez' },
      { id: 4, name: 'Emma Wilson' },
      { id: 5, name: 'David Kim' }
    ];
    const trader = mockTraders.find(t => t.id === traderId);
    if (trader) {
      socket.emit('followTraderResult', {
        success: true,
        traderName: trader.name
      });
    } else {
      socket.emit('followTraderResult', {
        success: false,
        error: 'Trader not found'
      });
    }
  });

  socket.on('unfollowTrader', ({ traderId }) => {
    const mockTraders = [
      { id: 1, name: 'Alex Thompson' },
      { id: 2, name: 'Sarah Chen' },
      { id: 3, name: 'Mike Rodriguez' },
      { id: 4, name: 'Emma Wilson' },
      { id: 5, name: 'David Kim' }
    ];
    const trader = mockTraders.find(t => t.id === traderId);
    if (trader) {
      socket.emit('unfollowTraderResult', {
        success: true,
        traderName: trader.name
      });
    } else {
      socket.emit('unfollowTraderResult', {
        success: false,
        error: 'Trader not found'
      });
    }
  });

  socket.on('getCopyTradingSettings', ({ traderId }) => {
    const mockSettings = {
      maxInvestment: 1000,
      riskPercentage: 2,
      maxOpenTrades: 5,
      copyPercentage: 100,
      stopLoss: 5,
      takeProfit: 10,
      autoClose: true,
      copyOnlyWinning: false,
      excludeSymbols: [],
      includeSymbols: [],
      maxDailyLoss: 50,
      maxWeeklyLoss: 200,
      copyDelay: 0,
      reverseSignals: false
    };
    socket.emit('copyTradingSettingsData', mockSettings);
  });

  socket.on('updateCopyTradingSettings', ({ traderId, settings }) => {
    socket.emit('updateCopyTradingSettingsResult', {
      success: true,
      message: 'Settings updated successfully'
    });
  });

  // Risk Management Handlers
  socket.on('getRiskData', () => {
    const riskData = {
      portfolioRisk: 0.45,
      maxDrawdown: 12.5,
      currentDrawdown: 8.2,
      var95: 850,
      sharpeRatio: 1.8,
      riskHistory: [
        { date: '2024-01-01', portfolioRisk: 0.35, drawdown: 5.2, var95: 650 },
        { date: '2024-01-02', portfolioRisk: 0.42, drawdown: 7.8, var95: 720 },
        { date: '2024-01-03', portfolioRisk: 0.38, drawdown: 6.1, var95: 680 },
        { date: '2024-01-04', portfolioRisk: 0.45, drawdown: 8.2, var95: 850 },
        { date: '2024-01-05', portfolioRisk: 0.41, drawdown: 7.5, var95: 780 }
      ],
      riskDistribution: [
        { name: 'Low Risk', value: 35 },
        { name: 'Medium Risk', value: 45 },
        { name: 'High Risk', value: 20 }
      ],
      correlations: [
        { pair: 'EUR/USD - GBP/USD', value: 0.85 },
        { pair: 'EUR/USD - USD/JPY', value: -0.72 },
        { pair: 'GBP/USD - USD/JPY', value: -0.68 },
        { pair: 'EUR/USD - USD/CHF', value: -0.45 },
        { pair: 'GBP/USD - USD/CHF', value: -0.52 }
      ]
    };
    socket.emit('riskData', riskData);
  });

  socket.on('getRiskSettings', () => {
    const riskSettings = {
      maxDailyLoss: 5,
      maxWeeklyLoss: 15,
      maxDrawdown: 25,
      maxRiskPerTrade: 2,
      maxOpenPositions: 10,
      maxPositionSize: 5,
      autoStopLoss: true,
      autoTakeProfit: false,
      autoClosePositions: true,
      riskAlerts: true,
      autoHedging: false,
      portfolioRebalancing: true
    };
    socket.emit('riskSettings', riskSettings);
  });

  socket.on('getStressTestResults', () => {
    const stressTestResults = {
      marketCrash: {
        potentialLoss: 2500,
        drawdown: 18.5
      },
      volatilitySpike: {
        potentialLoss: 1800,
        drawdown: 12.3
      },
      correlationBreakdown: {
        potentialLoss: 3200,
        drawdown: 22.1
      },
      scenarios: [
        { scenario: 'Market Crash', potentialLoss: 2500, drawdown: 18.5 },
        { scenario: 'Volatility Spike', potentialLoss: 1800, drawdown: 12.3 },
        { scenario: 'Correlation Breakdown', potentialLoss: 3200, drawdown: 22.1 },
        { scenario: 'Liquidity Crisis', potentialLoss: 1500, drawdown: 10.2 },
        { scenario: 'Interest Rate Shock', potentialLoss: 2100, drawdown: 15.8 }
      ]
    };
    socket.emit('stressTestResults', stressTestResults);
  });

  socket.on('getPositionSizing', () => {
    const positionSizing = {
      accountBalance: 10000,
      riskAmount: 100,
      stopLossPips: 50,
      history: [
        { date: '2024-01-01', positionSize: 0.2, riskAmount: 100 },
        { date: '2024-01-02', positionSize: 0.15, riskAmount: 75 },
        { date: '2024-01-03', positionSize: 0.25, riskAmount: 125 },
        { date: '2024-01-04', positionSize: 0.18, riskAmount: 90 },
        { date: '2024-01-05', positionSize: 0.22, riskAmount: 110 }
      ]
    };
    socket.emit('positionSizing', positionSizing);
  });

  socket.on('getRiskAlerts', () => {
    const riskAlerts = [
      {
        id: 1,
        title: 'High Portfolio Risk',
        message: 'Portfolio risk level has exceeded 70% of maximum allowed',
        severity: 'high',
        timestamp: '2024-01-05 14:30:00'
      },
      {
        id: 2,
        title: 'Drawdown Warning',
        message: 'Current drawdown approaching maximum limit (20%)',
        severity: 'medium',
        timestamp: '2024-01-05 13:15:00'
      },
      {
        id: 3,
        title: 'Position Size Alert',
        message: 'EUR/USD position size exceeds recommended limits',
        severity: 'low',
        timestamp: '2024-01-05 12:45:00'
      },
      {
        id: 4,
        title: 'Correlation Risk',
        message: 'High correlation detected between GBP/USD and EUR/USD positions',
        severity: 'medium',
        timestamp: '2024-01-05 11:20:00'
      }
    ];
    socket.emit('riskAlerts', riskAlerts);
  });

  socket.on('runStressTest', () => {
    // Simulate stress test calculation
    setTimeout(() => {
      const stressTestResult = {
        success: true,
        data: {
          marketCrash: {
            potentialLoss: Math.random() * 3000 + 1000,
            drawdown: Math.random() * 25 + 10
          },
          volatilitySpike: {
            potentialLoss: Math.random() * 2000 + 800,
            drawdown: Math.random() * 20 + 8
          },
          correlationBreakdown: {
            potentialLoss: Math.random() * 3500 + 1500,
            drawdown: Math.random() * 30 + 15
          },
          scenarios: [
            { scenario: 'Market Crash', potentialLoss: Math.random() * 3000 + 1000, drawdown: Math.random() * 25 + 10 },
            { scenario: 'Volatility Spike', potentialLoss: Math.random() * 2000 + 800, drawdown: Math.random() * 20 + 8 },
            { scenario: 'Correlation Breakdown', potentialLoss: Math.random() * 3500 + 1500, drawdown: Math.random() * 30 + 15 },
            { scenario: 'Liquidity Crisis', potentialLoss: Math.random() * 1500 + 500, drawdown: Math.random() * 15 + 5 },
            { scenario: 'Interest Rate Shock', potentialLoss: Math.random() * 2500 + 1000, drawdown: Math.random() * 20 + 10 }
          ]
        }
      };
      socket.emit('stressTestResult', stressTestResult);
    }, 2000);
  });

  socket.on('updateRiskSettings', (settings) => {
    socket.emit('updateRiskSettingsResult', {
      success: true,
      message: 'Risk settings updated successfully'
    });
  });

  socket.on('acknowledgeRiskAlert', ({ alertId }) => {
    socket.emit('acknowledgeRiskAlertResult', {
      success: true,
      message: 'Alert acknowledged successfully'
    });
  });

  // Advanced Risk Analytics Handlers
  socket.on('getAdvancedRiskAnalytics', () => {
    const analyticsData = {
      expectedReturn: 12.5,
      volatility: 18.2,
      var99: 1250,
      informationRatio: 0.85,
      historicalVolatility: [
        { date: '2024-01-01', volatility: 15.2 },
        { date: '2024-01-02', volatility: 16.8 },
        { date: '2024-01-03', volatility: 14.5 },
        { date: '2024-01-04', volatility: 18.2 },
        { date: '2024-01-05', volatility: 17.9 }
      ],
      volatilityForecast: [
        { date: '2024-01-06', forecast: 18.5, confidence: 19.2 },
        { date: '2024-01-07', forecast: 17.8, confidence: 18.9 },
        { date: '2024-01-08', forecast: 16.9, confidence: 17.6 },
        { date: '2024-01-09', forecast: 17.2, confidence: 17.9 },
        { date: '2024-01-10', forecast: 16.5, confidence: 17.2 }
      ],
      assets: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD'],
      correlationMatrix: [
        [1.000, 0.850, -0.720, -0.450, 0.320],
        [0.850, 1.000, -0.680, -0.520, 0.280],
        [-0.720, -0.680, 1.000, 0.380, -0.250],
        [-0.450, -0.520, 0.380, 1.000, -0.180],
        [0.320, 0.280, -0.250, -0.180, 1.000]
      ],
      correlationScatter: [
        { x: 0.85, y: 0.72 },
        { x: -0.68, y: -0.45 },
        { x: 0.38, y: 0.32 },
        { x: -0.25, y: -0.18 },
        { x: 0.52, y: 0.48 }
      ]
    };
    socket.emit('advancedRiskAnalytics', analyticsData);
  });

  socket.on('getMonteCarloResults', () => {
    const monteCarloResults = {
      distribution: [
        { value: 55000, frequency: 0.05 },
        { value: 57500, frequency: 0.12 },
        { value: 60000, frequency: 0.25 },
        { value: 62500, frequency: 0.30 },
        { value: 65000, frequency: 0.20 },
        { value: 67500, frequency: 0.08 }
      ],
      returnDistribution: [
        { range: '-20% to -10%', probability: 0.05 },
        { range: '-10% to 0%', probability: 0.15 },
        { range: '0% to 10%', probability: 0.35 },
        { range: '10% to 20%', probability: 0.30 },
        { range: '20% to 30%', probability: 0.12 },
        { range: '30%+', probability: 0.03 }
      ],
      meanValue: 62500,
      medianValue: 62000,
      var95: 850,
      cvar95: 1200,
      paths: Array.from({ length: 30 }, (_, i) => ({
        time: i,
        path0: 60000 + i * 100 + Math.random() * 2000,
        path1: 60000 + i * 80 + Math.random() * 1800,
        path2: 60000 + i * 120 + Math.random() * 2200,
        path3: 60000 + i * 90 + Math.random() * 1900,
        path4: 60000 + i * 110 + Math.random() * 2100,
        path5: 60000 + i * 95 + Math.random() * 2000,
        path6: 60000 + i * 105 + Math.random() * 2050,
        path7: 60000 + i * 85 + Math.random() * 1850,
        path8: 60000 + i * 115 + Math.random() * 2150,
        path9: 60000 + i * 100 + Math.random() * 2000
      }))
    };
    socket.emit('monteCarloResults', monteCarloResults);
  });

  socket.on('getScenarioAnalysis', () => {
    const scenarioAnalysis = {
      scenarios: [
        {
          name: 'Bull Market',
          impact: 3500,
          probability: 25,
          drawdown: 8.5
        },
        {
          name: 'Bear Market',
          impact: -2800,
          probability: 20,
          drawdown: 22.3
        },
        {
          name: 'Sideways Market',
          impact: 500,
          probability: 35,
          drawdown: 12.1
        },
        {
          name: 'Volatility Spike',
          impact: -1500,
          probability: 15,
          drawdown: 18.7
        },
        {
          name: 'Market Crash',
          impact: -4500,
          probability: 5,
          drawdown: 35.2
        }
      ]
    };
    socket.emit('scenarioAnalysis', scenarioAnalysis);
  });

  socket.on('getRiskAttribution', () => {
    const riskAttribution = {
      byAsset: [
        { name: 'EUR/USD', value: 35 },
        { name: 'GBP/USD', value: 25 },
        { name: 'USD/JPY', value: 20 },
        { name: 'USD/CHF', value: 15 },
        { name: 'AUD/USD', value: 5 }
      ],
      byFactor: [
        { name: 'Interest Rate Risk', value: 40 },
        { name: 'Currency Risk', value: 30 },
        { name: 'Liquidity Risk', value: 15 },
        { name: 'Credit Risk', value: 10 },
        { name: 'Operational Risk', value: 5 }
      ],
      detailed: [
        {
          component: 'EUR/USD Position',
          riskContribution: 850,
          percentage: 35.0,
          riskLevel: 'medium'
        },
        {
          component: 'GBP/USD Position',
          riskContribution: 600,
          percentage: 25.0,
          riskLevel: 'high'
        },
        {
          component: 'USD/JPY Position',
          riskContribution: 480,
          percentage: 20.0,
          riskLevel: 'medium'
        },
        {
          component: 'USD/CHF Position',
          riskContribution: 360,
          percentage: 15.0,
          riskLevel: 'low'
        },
        {
          component: 'AUD/USD Position',
          riskContribution: 120,
          percentage: 5.0,
          riskLevel: 'low'
        }
      ]
    };
    socket.emit('riskAttribution', riskAttribution);
  });

  socket.on('runMonteCarloSimulation', () => {
    // Simulate Monte Carlo calculation
    setTimeout(() => {
      const simulationResult = {
        success: true,
        data: {
          distribution: Array.from({ length: 20 }, (_, i) => ({
            value: 55000 + i * 1000,
            frequency: Math.random() * 0.3 + 0.02
          })),
          returnDistribution: [
            { range: '-20% to -10%', probability: Math.random() * 0.1 },
            { range: '-10% to 0%', probability: Math.random() * 0.2 },
            { range: '0% to 10%', probability: Math.random() * 0.4 },
            { range: '10% to 20%', probability: Math.random() * 0.25 },
            { range: '20% to 30%', probability: Math.random() * 0.15 },
            { range: '30%+', probability: Math.random() * 0.05 }
          ],
          meanValue: 60000 + Math.random() * 5000,
          medianValue: 60000 + Math.random() * 4000,
          var95: 800 + Math.random() * 400,
          cvar95: 1100 + Math.random() * 600,
          paths: Array.from({ length: 30 }, (_, i) => ({
            time: i,
            path0: 60000 + i * 100 + Math.random() * 2000,
            path1: 60000 + i * 80 + Math.random() * 1800,
            path2: 60000 + i * 120 + Math.random() * 2200,
            path3: 60000 + i * 90 + Math.random() * 1900,
            path4: 60000 + i * 110 + Math.random() * 2100,
            path5: 60000 + i * 95 + Math.random() * 2000,
            path6: 60000 + i * 105 + Math.random() * 2050,
            path7: 60000 + i * 85 + Math.random() * 1850,
            path8: 60000 + i * 115 + Math.random() * 2150,
            path9: 60000 + i * 100 + Math.random() * 2000
          }))
        }
      };
      socket.emit('monteCarloSimulationResult', simulationResult);
    }, 3000);
  });

  socket.on('runScenarioAnalysis', () => {
    // Simulate scenario analysis calculation
    setTimeout(() => {
      const scenarioResult = {
        success: true,
        data: {
          scenarios: [
            {
              name: 'Bull Market',
              impact: Math.random() * 4000 + 2000,
              probability: Math.random() * 30 + 15,
              drawdown: Math.random() * 15 + 5
            },
            {
              name: 'Bear Market',
              impact: -(Math.random() * 3000 + 2000),
              probability: Math.random() * 25 + 10,
              drawdown: Math.random() * 25 + 15
            },
            {
              name: 'Sideways Market',
              impact: Math.random() * 1000 - 500,
              probability: Math.random() * 40 + 20,
              drawdown: Math.random() * 15 + 8
            },
            {
              name: 'Volatility Spike',
              impact: -(Math.random() * 2000 + 1000),
              probability: Math.random() * 20 + 10,
              drawdown: Math.random() * 20 + 12
            },
            {
              name: 'Market Crash',
              impact: -(Math.random() * 5000 + 3000),
              probability: Math.random() * 10 + 2,
              drawdown: Math.random() * 40 + 25
            }
          ]
        }
      };
      socket.emit('scenarioAnalysisResult', scenarioResult);
    }, 2000);
  });

  // Advanced Analytics Handlers
  socket.on('getMLPredictions', ({ model, horizon }) => {
    // Simulate ML predictions
    const predictions = [];
    const basePrice = 1.2350;
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      
      const actual = basePrice + (Math.random() - 0.5) * 0.01;
      const predicted = actual + (Math.random() - 0.5) * 0.005;
      const confidence = 0.7 + Math.random() * 0.25;
      
      predictions.push({
        timestamp: time.toISOString(),
        actual: i < 5 ? actual : null,
        predicted: predicted,
        confidence: confidence,
        direction: predicted > actual ? 'up' : 'down',
        confidence_upper: predicted + confidence * 0.002,
        confidence_lower: predicted - confidence * 0.002
      });
    }
    
    socket.emit('mlPredictions', {
      predictions: predictions,
      confidence: 0.85,
      sentimentHistory: [
        { timestamp: '2024-01-01T10:00:00Z', overall: 0.72, news: 0.48, social: 0.65 },
        { timestamp: '2024-01-01T11:00:00Z', overall: 0.75, news: 0.52, social: 0.68 },
        { timestamp: '2024-01-01T12:00:00Z', overall: 0.78, news: 0.55, social: 0.71 },
        { timestamp: '2024-01-01T13:00:00Z', overall: 0.73, news: 0.49, social: 0.67 },
        { timestamp: '2024-01-01T14:00:00Z', overall: 0.76, news: 0.53, social: 0.69 }
      ]
    });
  });

  socket.on('getModelPerformance', () => {
    socket.emit('modelPerformance', {
      accuracy: 87.5,
      mae: 0.00015,
      rmse: 0.00023,
      mape: 0.018,
      r2: 0.892,
      directionalAccuracy: 78.5,
      history: [
        { date: '2024-01-01', accuracy: 85.2, mae: 0.00018 },
        { date: '2024-01-02', accuracy: 86.1, mae: 0.00016 },
        { date: '2024-01-03', accuracy: 87.3, mae: 0.00014 },
        { date: '2024-01-04', accuracy: 87.8, mae: 0.00013 },
        { date: '2024-01-05', accuracy: 87.5, mae: 0.00015 }
      ]
    });
  });

  socket.on('getFeatureImportance', () => {
    socket.emit('featureImportance', {
      features: [
        { name: 'Price Momentum', importance: 0.25 },
        { name: 'Volume', importance: 0.20 },
        { name: 'RSI', importance: 0.18 },
        { name: 'MACD', importance: 0.15 },
        { name: 'Bollinger Bands', importance: 0.12 },
        { name: 'Moving Averages', importance: 0.10 }
      ],
      featureNames: ['Price Momentum', 'Volume', 'RSI', 'MACD', 'Bollinger Bands', 'Moving Averages'],
      correlationMatrix: [
        [1.000, 0.234, 0.156, 0.089, 0.123, 0.067],
        [0.234, 1.000, 0.345, 0.178, 0.234, 0.145],
        [0.156, 0.345, 1.000, 0.456, 0.234, 0.189],
        [0.089, 0.178, 0.456, 1.000, 0.345, 0.234],
        [0.123, 0.234, 0.234, 0.345, 1.000, 0.456],
        [0.067, 0.145, 0.189, 0.234, 0.456, 1.000]
      ]
    });
  });

  socket.on('trainMLModel', ({ model }) => {
    // Simulate model training
    setTimeout(() => {
      socket.emit('trainMLModelResult', {
        success: true,
        message: `${model} model trained successfully`
      });
    }, 3000);
  });

  socket.on('getBacktestResults', ({ strategy, dateRange }) => {
    socket.emit('backtestResults', {
      totalReturn: 15.3,
      benchmarkReturn: 8.7,
      sharpeRatio: 1.85,
      maxDrawdown: 8.2,
      winRate: 68.5,
      totalTrades: 245,
      winningTrades: 168,
      losingTrades: 77,
      averageTrade: 125.50,
      volatility: 12.5,
      beta: 0.95,
      alpha: 2.1,
      informationRatio: 0.78,
      calmarRatio: 1.87,
      sortinoRatio: 2.15,
      equityCurve: [
        { date: '2024-01-01', strategy: 10000, benchmark: 10000, drawdown: 0 },
        { date: '2024-01-02', strategy: 10150, benchmark: 10087, drawdown: 0 },
        { date: '2024-01-03', strategy: 10320, benchmark: 10174, drawdown: 0 },
        { date: '2024-01-04', strategy: 10180, benchmark: 10061, drawdown: 8.2 },
        { date: '2024-01-05', strategy: 10450, benchmark: 10248, drawdown: 0 }
      ],
      monthlyReturns: [
        { month: 'Jan', return: 5.2 },
        { month: 'Feb', return: 3.8 },
        { month: 'Mar', return: 4.1 },
        { month: 'Apr', return: 2.4 }
      ],
      performanceDistribution: [
        { range: '-5% to 0%', frequency: 15 },
        { range: '0% to 5%', frequency: 45 },
        { range: '5% to 10%', frequency: 25 },
        { range: '10% to 15%', frequency: 10 },
        { range: '15%+', frequency: 5 }
      ],
      trades: [
        { date: '2024-01-01', type: 'BUY', price: 1.2345, quantity: 1000, pnl: 125.50, duration: 2 },
        { date: '2024-01-03', type: 'SELL', price: 1.2470, quantity: 1000, pnl: -85.20, duration: 1 },
        { date: '2024-01-04', type: 'BUY', price: 1.2385, quantity: 1000, pnl: 165.30, duration: 3 }
      ],
      optimizationResults: [
        { param1: 10, param2: 20, sharpe: 1.2 },
        { param1: 15, param2: 25, sharpe: 1.5 },
        { param1: 20, param2: 30, sharpe: 1.8 },
        { param1: 25, param2: 35, sharpe: 1.6 }
      ],
      bestSharpe: 1.85,
      bestReturn: 15.3,
      bestParameters: 'MA1: 20, MA2: 30, RSI: 14'
    });
  });

  socket.on('getStrategyConfig', ({ strategy }) => {
    socket.emit('strategyConfig', {
      parameters: {
        short_ma: 20,
        long_ma: 50,
        rsi_period: 14,
        rsi_overbought: 70,
        rsi_oversold: 30
      },
      entryRules: 'Buy when short MA crosses above long MA and RSI < 70',
      exitRules: 'Sell when short MA crosses below long MA or RSI > 80',
      riskRules: 'Stop loss at 2% below entry, take profit at 4% above entry',
      code: `def strategy(data):
    # Strategy implementation
    signals = []
    for i in range(len(data)):
        # Entry logic
        if entry_condition(data, i):
            signals.append(1)  # Buy signal
        elif exit_condition(data, i):
            signals.append(-1)  # Sell signal
        else:
            signals.append(0)  # Hold
    return signals`
    });
  });

  socket.on('runBacktest', ({ strategy, dateRange, config }) => {
    // Simulate backtest execution
    setTimeout(() => {
      socket.emit('backtestResult', {
        success: true,
        data: {
          totalReturn: 15.3,
          benchmarkReturn: 8.7,
          sharpeRatio: 1.85,
          maxDrawdown: 8.2,
          winRate: 68.5,
          totalTrades: 245,
          winningTrades: 168,
          losingTrades: 77,
          averageTrade: 125.50,
          volatility: 12.5,
          beta: 0.95,
          alpha: 2.1,
          informationRatio: 0.78,
          calmarRatio: 1.87,
          sortinoRatio: 2.15,
          equityCurve: [
            { date: '2024-01-01', strategy: 10000, benchmark: 10000, drawdown: 0 },
            { date: '2024-01-02', strategy: 10150, benchmark: 10087, drawdown: 0 },
            { date: '2024-01-03', strategy: 10320, benchmark: 10174, drawdown: 0 },
            { date: '2024-01-04', strategy: 10180, benchmark: 10061, drawdown: 8.2 },
            { date: '2024-01-05', strategy: 10450, benchmark: 10248, drawdown: 0 }
          ],
          monthlyReturns: [
            { month: 'Jan', return: 5.2 },
            { month: 'Feb', return: 3.8 },
            { month: 'Mar', return: 4.1 },
            { month: 'Apr', return: 2.4 }
          ],
          performanceDistribution: [
            { range: '-5% to 0%', frequency: 15 },
            { range: '0% to 5%', frequency: 45 },
            { range: '5% to 10%', frequency: 25 },
            { range: '10% to 15%', frequency: 10 },
            { range: '15%+', frequency: 5 }
          ],
          trades: [
            { date: '2024-01-01', type: 'BUY', price: 1.2345, quantity: 1000, pnl: 125.50, duration: 2 },
            { date: '2024-01-03', type: 'SELL', price: 1.2470, quantity: 1000, pnl: -85.20, duration: 1 },
            { date: '2024-01-04', type: 'BUY', price: 1.2385, quantity: 1000, pnl: 165.30, duration: 3 }
          ],
          optimizationResults: [
            { param1: 10, param2: 20, sharpe: 1.2 },
            { param1: 15, param2: 25, sharpe: 1.5 },
            { param1: 20, param2: 30, sharpe: 1.8 },
            { param1: 25, param2: 35, sharpe: 1.6 }
          ],
          bestSharpe: 1.85,
          bestReturn: 15.3,
          bestParameters: 'MA1: 20, MA2: 30, RSI: 14'
        }
      });
    }, 2000);
  });

  socket.on('stopBacktest', () => {
    socket.emit('backtestStopped', { success: true });
  });

  socket.on('optimizeStrategy', ({ strategy, dateRange }) => {
    // Simulate strategy optimization
    setTimeout(() => {
      socket.emit('optimizationResult', {
        success: true,
        data: {
          optimalConfig: {
            parameters: {
              short_ma: 25,
              long_ma: 55,
              rsi_period: 12,
              rsi_overbought: 75,
              rsi_oversold: 25
            },
            entryRules: 'Buy when short MA crosses above long MA and RSI < 75',
            exitRules: 'Sell when short MA crosses below long MA or RSI > 85',
            riskRules: 'Stop loss at 1.5% below entry, take profit at 3% above entry'
          }
        }
      });
    }, 3000);
  });

  socket.on('getMarketRegime', ({ timeframe }) => {
    socket.emit('marketRegime', {
      current: {
        type: 'bull',
        confidence: 0.85,
        duration: 12,
        volatility: 15.2
      },
      history: [
        { date: '2024-01-01', bull_probability: 0.65, bear_probability: 0.20, sideways_probability: 0.15 },
        { date: '2024-01-02', bull_probability: 0.70, bear_probability: 0.18, sideways_probability: 0.12 },
        { date: '2024-01-03', bull_probability: 0.75, bear_probability: 0.15, sideways_probability: 0.10 },
        { date: '2024-01-04', bull_probability: 0.80, bear_probability: 0.12, sideways_probability: 0.08 },
        { date: '2024-01-05', bull_probability: 0.85, bear_probability: 0.10, sideways_probability: 0.05 }
      ],
      distribution: [
        { name: 'Bull Market', value: 65 },
        { name: 'Bear Market', value: 15 },
        { name: 'Sideways Market', value: 20 }
      ],
      performance: {
        bull: { duration: 15, return: 8.5 },
        bear: { duration: 8, return: -5.2 },
        sideways: { duration: 12, return: 2.1 }
      },
      regimeStats: {
        bull: { frequency: 65, avgDuration: 15, avgReturn: 8.5, volatility: 12.3 },
        bear: { frequency: 15, avgDuration: 8, avgReturn: -5.2, volatility: 18.7 },
        sideways: { frequency: 20, avgDuration: 12, avgReturn: 2.1, volatility: 8.9 }
      },
      indicators: [
        { date: '2024-01-01', trend_strength: 0.75, volatility: 0.45, momentum: 0.68, mean_reversion: 0.32 },
        { date: '2024-01-02', trend_strength: 0.78, volatility: 0.42, momentum: 0.71, mean_reversion: 0.29 },
        { date: '2024-01-03', trend_strength: 0.82, volatility: 0.38, momentum: 0.75, mean_reversion: 0.25 },
        { date: '2024-01-04', trend_strength: 0.85, volatility: 0.35, momentum: 0.78, mean_reversion: 0.22 },
        { date: '2024-01-05', trend_strength: 0.88, volatility: 0.32, momentum: 0.82, mean_reversion: 0.18 }
      ],
      indicatorWeights: {
        trend_strength: 0.35,
        volatility: 0.25,
        momentum: 0.25,
        mean_reversion: 0.15
      },
      indicatorCorrelation: {
        'trend_strength-volatility': -0.45,
        'trend_strength-momentum': 0.78,
        'trend_strength-mean_reversion': -0.32,
        'volatility-momentum': -0.28,
        'volatility-mean_reversion': 0.65,
        'momentum-mean_reversion': -0.42
      },
      forecast: [
        { date: '2024-01-06', bull_probability: 0.88, bear_probability: 0.08, sideways_probability: 0.04 },
        { date: '2024-01-07', bull_probability: 0.90, bear_probability: 0.07, sideways_probability: 0.03 },
        { date: '2024-01-08', bull_probability: 0.92, bear_probability: 0.06, sideways_probability: 0.02 }
      ],
      nextRegimePrediction: 'Bull Market',
      predictionHorizon: 3,
      predictionConfidence: 0.88,
      transitionProbability: 0.12,
      alerts: [
        { id: 1, title: 'Regime Transition Detected', message: 'Market showing signs of transitioning from sideways to bull market', severity: 'medium', timestamp: '2024-01-05T10:30:00Z' },
        { id: 2, title: 'High Confidence Bull Market', message: 'Bull market conditions strengthening with 88% confidence', severity: 'low', timestamp: '2024-01-05T09:15:00Z' }
      ],
      avgDuration: 11.7,
      regimeChanges: 3,
      mostCommonRegime: 'Bull Market',
      stability: 78.5
    });
  });

  socket.on('getSentimentAnalysis', ({ timeframe, source }) => {
    socket.emit('sentimentAnalysis', {
      overallSentiment: 0.72,
      newsSentiment: 0.48,
      socialSentiment: 0.65,
      sentimentChange: 2.5,
      newsCount: 1250,
      socialCount: 8900,
      distribution: [
        { name: 'Positive', value: 45 },
        { name: 'Neutral', value: 35 },
        { name: 'Negative', value: 20 }
      ],
      sourcePerformance: {
        news: { sentiment: 0.48, count: 1250 },
        twitter: { sentiment: 0.68, count: 4500 },
        reddit: { sentiment: 0.72, count: 2800 },
        facebook: { sentiment: 0.58, count: 1600 }
      },
      timeline: [
        { timestamp: '2024-01-01T10:00:00Z', overall: 0.68, news: 0.45, social: 0.62 },
        { timestamp: '2024-01-01T11:00:00Z', overall: 0.70, news: 0.47, social: 0.64 },
        { timestamp: '2024-01-01T12:00:00Z', overall: 0.72, news: 0.48, social: 0.65 },
        { timestamp: '2024-01-01T13:00:00Z', overall: 0.71, news: 0.49, social: 0.66 },
        { timestamp: '2024-01-01T14:00:00Z', overall: 0.73, news: 0.50, social: 0.67 }
      ],
      totalMentions: 10150,
      positiveMentions: 4568,
      negativeMentions: 2030,
      neutralMentions: 3552,
      news: [
        { title: 'Bitcoin Surges to New Highs', summary: 'Cryptocurrency reaches record levels amid institutional adoption', source: 'Reuters', publishedAt: '2024-01-05T10:00:00Z', sentiment: 0.75 },
        { title: 'Market Volatility Concerns Investors', summary: 'Analysts warn of potential market corrections', source: 'Bloomberg', publishedAt: '2024-01-05T09:30:00Z', sentiment: 0.35 },
        { title: 'Tech Stocks Lead Market Rally', summary: 'Technology sector continues strong performance', source: 'CNBC', publishedAt: '2024-01-05T09:00:00Z', sentiment: 0.68 }
      ],
      social: [
        { platform: 'twitter', author: '@cryptotrader', content: 'Bitcoin looking bullish! 🚀 #BTC #crypto', timestamp: '2024-01-05T10:15:00Z', likes: 1250, shares: 340, sentiment: 0.85 },
        { platform: 'reddit', author: 'u/marketwatcher', content: 'Market seems overvalued, expecting correction soon', timestamp: '2024-01-05T10:00:00Z', likes: 89, shares: 12, sentiment: 0.25 },
        { platform: 'twitter', author: '@stockguru', content: 'Great day for tech stocks! 📈', timestamp: '2024-01-05T09:45:00Z', likes: 567, shares: 123, sentiment: 0.72 }
      ],
      trendingKeywords: [
        { term: 'Bitcoin', sentiment: 0.78, mentions: 1250 },
        { term: 'Tech Stocks', sentiment: 0.65, mentions: 890 },
        { term: 'Market Rally', sentiment: 0.72, mentions: 650 },
        { term: 'Volatility', sentiment: 0.35, mentions: 420 }
      ],
      trendingHashtags: [
        { term: 'BTC', sentiment: 0.82, mentions: 2100 },
        { term: 'TechStocks', sentiment: 0.68, mentions: 1500 },
        { term: 'MarketRally', sentiment: 0.75, mentions: 1200 },
        { term: 'Crypto', sentiment: 0.78, mentions: 1800 }
      ],
      topicSentiment: [
        { topic: 'Cryptocurrency', sentiment: 0.78 },
        { topic: 'Tech Stocks', sentiment: 0.65 },
        { topic: 'Market Analysis', sentiment: 0.58 },
        { topic: 'Trading', sentiment: 0.72 }
      ],
      alerts: [
        { id: 1, title: 'Sentiment Shift Detected', message: 'Social media sentiment turning bearish in the last 4 hours', severity: 'medium', timestamp: '2024-01-05T10:30:00Z' },
        { id: 2, title: 'High Positive Sentiment', message: 'News sentiment showing strong bullish signals', severity: 'low', timestamp: '2024-01-05T09:15:00Z' }
      ]
    });
  });

  // Algorithmic Trading Handlers
  socket.on('getAvailableStrategies', () => {
    const availableStrategies = [
      {
        name: 'MovingAverageCrossover',
        description: 'Trades on fast and slow moving average crossovers',
        category: 'Trend Following',
        parameters: {
          fastPeriod: { type: 'number', default: 10, min: 5, max: 50 },
          slowPeriod: { type: 'number', default: 30, min: 10, max: 100 },
          maType: { type: 'select', default: 'SMA', options: ['SMA', 'EMA'] }
        }
      },
      {
        name: 'RSIDivergence',
        description: 'Trades on RSI divergence patterns',
        category: 'Mean Reversion',
        parameters: {
          rsiPeriod: { type: 'number', default: 14, min: 10, max: 30 },
          overbought: { type: 'number', default: 70, min: 60, max: 80 },
          oversold: { type: 'number', default: 30, min: 20, max: 40 }
        }
      },
      {
        name: 'BollingerBands',
        description: 'Trades on Bollinger Bands breakouts and reversals',
        category: 'Volatility',
        parameters: {
          period: { type: 'number', default: 20, min: 10, max: 50 },
          stdDev: { type: 'number', default: 2, min: 1, max: 3 }
        }
      }
    ];
    socket.emit('availableStrategies', availableStrategies);
  });

  socket.on('getActiveStrategies', () => {
    // Mock active strategies data
    const activeStrategies = [
      {
        id: 'strategy_1',
        name: 'Moving Average Crossover',
        description: 'Trades on fast and slow moving average crossovers',
        isActive: true,
        symbols: ['EURUSD', 'GBPUSD'],
        config: {
          lotSize: 0.1,
          stopLoss: 50,
          takeProfit: 100,
          fastPeriod: 10,
          slowPeriod: 30,
          maType: 'SMA'
        },
        performance: {
          totalTrades: 15,
          winningTrades: 9,
          totalPnL: 245.50,
          winRate: 60.0
        }
      },
      {
        id: 'strategy_2',
        name: 'RSI Divergence',
        description: 'Trades on RSI divergence patterns',
        isActive: false,
        symbols: ['USDJPY'],
        config: {
          lotSize: 0.05,
          stopLoss: 30,
          takeProfit: 60,
          rsiPeriod: 14,
          overbought: 70,
          oversold: 30
        },
        performance: {
          totalTrades: 8,
          winningTrades: 5,
          totalPnL: 89.25,
          winRate: 62.5
        }
      }
    ];
    socket.emit('activeStrategies', activeStrategies);
  });

  socket.on('startEngine', () => {
    console.log('Starting algorithmic trading engine...');
    // In a real implementation, this would start the strategy engine
    socket.emit('engineStatus', { isRunning: true });
    
    // Simulate engine starting
    setTimeout(() => {
      socket.emit('engineStarted', { message: 'Algorithmic trading engine started successfully' });
    }, 1000);
  });

  socket.on('stopEngine', () => {
    console.log('Stopping algorithmic trading engine...');
    // In a real implementation, this would stop the strategy engine
    socket.emit('engineStatus', { isRunning: false });
    
    // Simulate engine stopping
    setTimeout(() => {
      socket.emit('engineStopped', { message: 'Algorithmic trading engine stopped successfully' });
    }, 1000);
  });

  socket.on('createStrategy', ({ strategyName, config }) => {
    console.log('Creating strategy:', strategyName, config);
    
    const newStrategy = {
      id: `strategy_${Date.now()}`,
      name: strategyName,
      description: 'New algorithmic trading strategy',
      isActive: false,
      symbols: config.symbols || ['EURUSD'],
      config: {
        lotSize: 0.1,
        stopLoss: 50,
        takeProfit: 100,
        ...config
      },
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        totalPnL: 0,
        winRate: 0
      }
    };

    // In a real implementation, this would save to database
    socket.emit('strategyCreated', newStrategy);
  });

  socket.on('startStrategy', ({ strategyId }) => {
    console.log('Starting strategy:', strategyId);
    
    // In a real implementation, this would start the specific strategy
    socket.emit('strategyStarted', { strategyId, message: 'Strategy started successfully' });
    
    // Simulate strategy performance updates
    const interval = setInterval(() => {
      const performance = {
        strategyId,
        performance: {
          totalTrades: Math.floor(Math.random() * 20) + 1,
          winningTrades: Math.floor(Math.random() * 15) + 1,
          totalPnL: (Math.random() - 0.5) * 500,
          winRate: Math.random() * 100
        }
      };
      socket.emit('strategyPerformance', performance);
    }, 5000);

    // Store interval for cleanup
    socket.strategyIntervals = socket.strategyIntervals || {};
    socket.strategyIntervals[strategyId] = interval;
  });

  socket.on('stopStrategy', ({ strategyId }) => {
    console.log('Stopping strategy:', strategyId);
    
    // Clear performance update interval
    if (socket.strategyIntervals && socket.strategyIntervals[strategyId]) {
      clearInterval(socket.strategyIntervals[strategyId]);
      delete socket.strategyIntervals[strategyId];
    }
    
    // In a real implementation, this would stop the specific strategy
    socket.emit('strategyStopped', { strategyId, message: 'Strategy stopped successfully' });
  });

  socket.on('deleteStrategy', ({ strategyId }) => {
    console.log('Deleting strategy:', strategyId);
    
    // Clear performance update interval
    if (socket.strategyIntervals && socket.strategyIntervals[strategyId]) {
      clearInterval(socket.strategyIntervals[strategyId]);
      delete socket.strategyIntervals[strategyId];
    }
    
    // In a real implementation, this would delete from database
    socket.emit('strategyDeleted', { strategyId, message: 'Strategy deleted successfully' });
  });

  socket.on('updateStrategy', ({ strategyId, config }) => {
    console.log('Updating strategy:', strategyId, config);
    
    // In a real implementation, this would update the strategy configuration
    socket.emit('strategyUpdated', { strategyId, config, message: 'Strategy updated successfully' });
  });

  // Simulate trading signals
  setInterval(() => {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY'];
    const signal = {
      id: `signal_${Date.now()}`,
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      price: 1.0850 + Math.random() * 0.1,
      confidence: 0.6 + Math.random() * 0.4,
      reason: 'Technical indicator signal',
      timestamp: new Date().toISOString()
    };
    socket.emit('signal', { signal });
  }, 10000); // Every 10 seconds

  // Simulate order execution
  setInterval(() => {
    const symbols = ['EURUSD', 'GBPUSD', 'USDJPY'];
    const order = {
      id: `order_${Date.now()}`,
      type: Math.random() > 0.5 ? 'BUY' : 'SELL',
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      lotSize: 0.1,
      price: 1.0850 + Math.random() * 0.1,
      status: 'executed',
      timestamp: new Date().toISOString()
    };
    socket.emit('order', { order });
  }, 15000); // Every 15 seconds

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Clean up strategy intervals
    if (socket.strategyIntervals) {
      Object.values(socket.strategyIntervals).forEach(interval => {
        clearInterval(interval);
      });
    }
  });
});

// Market data updates from service
setInterval(async () => {
  try {
    // Update market data from service
    const currentPrices = marketDataService.getAllCurrentPrices();
    
    symbols.forEach(symbol => {
      const priceData = currentPrices[symbol];
      if (priceData) {
        marketData[symbol] = priceData;

        // Emit price update to subscribed clients
        io.to(symbol).emit('priceUpdate', {
          symbol,
          data: marketData[symbol]
        });

        // Update positions P&L (only if positions array exists)
        if (typeof positions !== 'undefined' && Array.isArray(positions)) {
          positions.forEach(position => {
            if (position.symbol === symbol && position.status === 'open') {
              const priceDiff = priceData.bid - position.openPrice;
              const multiplier = position.type === 'BUY' ? 1 : -1;
              position.pnl = priceDiff * multiplier * position.volume * 100000; // 100k units per lot
            }
          });

          // Emit position updates
          io.emit('positionUpdate', positions.filter(p => p.status === 'open'));
        }
      }
    });
  } catch (error) {
    console.error('Error updating market data:', error);
  }
}, 2000); // Update every 2 seconds

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    // Try to connect to database, but don't fail if it's not available
    try {
      await testConnection();
      await initializeDatabase();
      console.log(`💾 Database connected successfully`);
    } catch (dbError) {
      console.log(`⚠️  Database not available, running in demo mode: ${dbError.message}`);
      console.log(`📊 Using simulated data for demonstration`);
    }
    
    // Initialize market data service
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
