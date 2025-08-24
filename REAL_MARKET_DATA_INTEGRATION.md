# Real Market Data Integration

## Overview

The Real Market Data Integration feature provides access to live market data from multiple providers, replacing the simulated data with real-time price feeds, historical data, and market statistics. This enables users to make informed trading decisions based on actual market conditions.

## Features

### 🔥 Core Features
- **Real-time Price Feeds**: Live bid/ask prices from multiple data providers
- **Historical Data**: OHLCV data across multiple timeframes (1m to 1d)
- **Market Statistics**: 24h high/low, volume, price changes
- **Multiple Providers**: Alpha Vantage, Polygon.io, OANDA support
- **WebSocket Streaming**: Real-time price updates via WebSocket
- **Database Storage**: Persistent storage of market data
- **REST API**: Comprehensive API endpoints for data access

### 📊 Data Coverage
- **Forex Pairs**: EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD, etc.
- **Timeframes**: 1m, 5m, 15m, 30m, 1h, 4h, 1d
- **Data Types**: OHLCV, bid/ask, spread, volume, market statistics

## Architecture

### Backend Components

#### 1. MarketDataService (`services/MarketDataService.js`)
```javascript
class MarketDataService {
  // Core functionality
  - initialize(): Initialize service and data feeds
  - getCurrentPrice(symbol): Get current price for symbol
  - getHistoricalData(symbol, timeframe, limit): Get historical OHLCV data
  - getMarketStats(symbol, period): Get market statistics
  - subscribeToUpdates(symbol, callback): Subscribe to real-time updates
  
  // Data providers
  - fetchFromAlphaVantage(symbol, timeframe)
  - fetchFromPolygon(symbol, timeframe)
  - fetchFromOANDA(symbol, timeframe)
  
  // WebSocket management
  - startRealTimeFeeds()
  - handleWebSocketMessage(data)
}
```

#### 2. MarketData Model (`models/MarketData.js`)
```javascript
const MarketData = sequelize.define('MarketData', {
  symbol: STRING(20),           // Trading symbol (e.g., EURUSD)
  timeframe: ENUM(...),         // Timeframe (1m, 5m, 15m, etc.)
  open: DECIMAL(15, 5),         // Opening price
  high: DECIMAL(15, 5),         // Highest price
  low: DECIMAL(15, 5),          // Lowest price
  close: DECIMAL(15, 5),        // Closing price
  volume: DECIMAL(20, 2),       // Trading volume
  timestamp: DATE,              // Data timestamp
  bid: DECIMAL(15, 5),          // Current bid price
  ask: DECIMAL(15, 5),          // Current ask price
  spread: DECIMAL(10, 5),       // Bid-ask spread
  source: STRING(50),           // Data source
  metadata: JSONB               // Additional metadata
});
```

#### 3. API Routes (`routes/marketData.js`)
```javascript
// REST API endpoints
GET  /api/market/prices              // All current prices
GET  /api/market/prices/:symbol      // Current price for symbol
GET  /api/market/historical/:symbol  // Historical data
GET  /api/market/stats/:symbol       // Market statistics
GET  /api/market/ohlc/:symbol        // OHLC data for charts
GET  /api/market/symbols             // Available symbols
GET  /api/market/timeframes          // Available timeframes
GET  /api/market/status              // Service status
POST /api/market/refresh/:symbol     // Force data refresh
```

### Frontend Components

#### 1. MarketData Component (`client/src/components/MarketData.js`)
```javascript
const MarketData = () => {
  // State management
  - selectedSymbol: Current selected trading pair
  - timeframe: Selected timeframe for charts
  - marketData: Current price data
  - historicalData: Historical OHLCV data
  - marketStats: Market statistics
  
  // Features
  - Real-time price display
  - Interactive price charts
  - Market statistics dashboard
  - Symbol and timeframe selection
  - WebSocket connection for live updates
  - Data refresh functionality
};
```

## Setup Instructions

### 1. Environment Variables
Add the following to your `.env` file:

```bash
# Market Data API Keys
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
POLYGON_API_KEY=your_polygon_api_key
OANDA_API_KEY=your_oanda_api_key

# Database (already configured)
DATABASE_URL=postgresql://username:password@localhost:5432/trading_platform

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379
```

### 2. API Key Setup

#### Alpha Vantage
1. Visit [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free API key
3. Add to environment variables

#### Polygon.io
1. Visit [Polygon.io](https://polygon.io/)
2. Create an account and get API key
3. Add to environment variables

#### OANDA
1. Visit [OANDA](https://www.oanda.com/)
2. Create a demo account
3. Get API key from account settings
4. Add to environment variables

### 3. Database Setup
```bash
# Run database setup
npm run setup-db

# Or manually
node scripts/setup-database.js
```

### 4. Start the Application
```bash
# Install dependencies
npm install

# Start the server
npm start
```

## API Usage Examples

### 1. Get Current Prices
```javascript
// Get all current prices
const response = await fetch('/api/market/prices');
const data = await response.json();
console.log(data.data); // { EURUSD: { bid: 1.0850, ask: 1.0851, ... } }

// Get specific symbol price
const response = await fetch('/api/market/prices/EURUSD');
const data = await response.json();
console.log(data.data); // { symbol: 'EURUSD', bid: 1.0850, ask: 1.0851, ... }
```

### 2. Get Historical Data
```javascript
// Get 1-hour historical data
const response = await fetch('/api/market/historical/EURUSD?timeframe=1h&limit=100');
const data = await response.json();
console.log(data.data); // Array of OHLCV data points

// Get OHLC data for charts
const response = await fetch('/api/market/ohlc/EURUSD?timeframe=1h&limit=100');
const data = await response.json();
console.log(data.data.ohlc); // Formatted for charting libraries
```

### 3. Get Market Statistics
```javascript
// Get 24h market statistics
const response = await fetch('/api/market/stats/EURUSD?period=24h');
const data = await response.json();
console.log(data.data); // { high, low, volume, change, ... }
```

### 4. WebSocket Real-time Updates
```javascript
const ws = new WebSocket('ws://localhost:5000');

ws.onopen = () => {
  // Subscribe to symbol updates
  ws.send(JSON.stringify({
    type: 'subscribe',
    symbol: 'EURUSD'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'priceUpdate') {
    console.log('Price update:', data.data);
  }
};
```

## Frontend Integration

### 1. Using the MarketData Component
```javascript
import MarketData from './components/MarketData';

// In your React component
<MarketData />
```

### 2. Custom Market Data Usage
```javascript
import { useState, useEffect } from 'react';

const CustomMarketWidget = () => {
  const [price, setPrice] = useState(null);
  
  useEffect(() => {
    const fetchPrice = async () => {
      const response = await fetch('/api/market/prices/EURUSD');
      const data = await response.json();
      setPrice(data.data);
    };
    
    fetchPrice();
    const interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <h3>EUR/USD</h3>
      <p>Bid: {price?.bid}</p>
      <p>Ask: {price?.ask}</p>
    </div>
  );
};
```

## Data Providers

### 1. Alpha Vantage
- **Coverage**: Forex, stocks, crypto
- **Rate Limits**: 5 calls/minute (free), 500/minute (paid)
- **Data Quality**: Good for historical data
- **Cost**: Free tier available

### 2. Polygon.io
- **Coverage**: Stocks, forex, crypto
- **Rate Limits**: 5 calls/minute (free), higher with paid plans
- **Data Quality**: High-quality real-time data
- **Cost**: Free tier available

### 3. OANDA
- **Coverage**: Forex only
- **Rate Limits**: 120 calls/minute
- **Data Quality**: Professional-grade forex data
- **Cost**: Free with demo account

## Performance Considerations

### 1. Caching Strategy
```javascript
// Redis caching for frequently accessed data
const cacheKey = `market_data:${symbol}:${timeframe}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Cache for 1 minute
await redis.setex(cacheKey, 60, JSON.stringify(data));
```

### 2. Rate Limiting
```javascript
// Implement rate limiting for API calls
const rateLimiter = {
  alphaVantage: { calls: 0, lastReset: Date.now() },
  polygon: { calls: 0, lastReset: Date.now() },
  oanda: { calls: 0, lastReset: Date.now() }
};
```

### 3. Data Cleanup
```javascript
// Clean up old data periodically
cron.schedule('0 2 * * *', async () => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
  await MarketData.destroy({
    where: {
      timestamp: { [Op.lt]: cutoff }
    }
  });
});
```

## Error Handling

### 1. API Failures
```javascript
try {
  const data = await fetchFromProvider(symbol, timeframe);
  return data;
} catch (error) {
  console.error(`Failed to fetch from ${provider}:`, error);
  // Fallback to another provider
  return await fetchFromFallbackProvider(symbol, timeframe);
}
```

### 2. WebSocket Reconnection
```javascript
const connectWebSocket = () => {
  const ws = new WebSocket(url);
  
  ws.onclose = () => {
    console.log('WebSocket disconnected, reconnecting...');
    setTimeout(connectWebSocket, 5000);
  };
  
  return ws;
};
```

## Monitoring and Logging

### 1. Service Health Checks
```javascript
// Monitor service status
app.get('/api/market/health', (req, res) => {
  const health = {
    status: 'healthy',
    providers: {
      alphaVantage: marketDataService.isProviderHealthy('alphaVantage'),
      polygon: marketDataService.isProviderHealthy('polygon'),
      oanda: marketDataService.isProviderHealthy('oanda')
    },
    lastUpdate: marketDataService.getLastUpdateTime()
  };
  res.json(health);
});
```

### 2. Data Quality Monitoring
```javascript
// Monitor data quality
const validateData = (data) => {
  const issues = [];
  
  if (!data.bid || !data.ask) {
    issues.push('Missing bid/ask prices');
  }
  
  if (data.bid >= data.ask) {
    issues.push('Invalid spread (bid >= ask)');
  }
  
  return issues;
};
```

## Security Considerations

### 1. API Key Protection
```javascript
// Store API keys securely
const providers = {
  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY,
    enabled: !!process.env.ALPHA_VANTAGE_API_KEY
  }
};
```

### 2. Rate Limiting
```javascript
// Implement rate limiting
const rateLimit = require('express-rate-limit');

const marketDataLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/market', marketDataLimiter);
```

## Future Enhancements

### 1. Additional Data Sources
- **Yahoo Finance**: For stock data
- **CoinGecko**: For cryptocurrency data
- **TradingView**: For technical analysis data

### 2. Advanced Features
- **News Integration**: Real-time news feeds
- **Economic Calendar**: Economic events and releases
- **Sentiment Analysis**: Social media sentiment
- **Correlation Analysis**: Cross-asset correlations

### 3. Performance Improvements
- **WebSocket Clustering**: Multiple WebSocket servers
- **Data Compression**: Compress historical data
- **Predictive Caching**: Pre-fetch likely requested data

## Troubleshooting

### Common Issues

#### 1. API Rate Limits
```bash
# Error: Rate limit exceeded
# Solution: Implement proper rate limiting and caching
```

#### 2. WebSocket Connection Issues
```bash
# Error: WebSocket connection failed
# Solution: Check server status and firewall settings
```

#### 3. Database Connection Issues
```bash
# Error: Database connection failed
# Solution: Check DATABASE_URL and PostgreSQL service
```

### Debug Mode
```javascript
// Enable debug logging
process.env.DEBUG = 'market-data:*';
```

## Support

For issues and questions:
1. Check the logs for error messages
2. Verify API keys are correctly set
3. Test individual provider endpoints
4. Check database connectivity
5. Review WebSocket connection status

---

**Note**: This feature requires valid API keys from the respective data providers. Free tiers have rate limits that may affect real-time data availability.
