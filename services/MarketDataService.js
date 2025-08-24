const axios = require('axios');
const WebSocket = require('ws');
const cron = require('node-cron');
const moment = require('moment');
const { MarketData } = require('../models');
const { Op } = require('sequelize');

class MarketDataService {
  constructor() {
    this.providers = {
      alphaVantage: {
        apiKey: process.env.ALPHA_VANTAGE_API_KEY,
        baseUrl: 'https://www.alphavantage.co/query',
        enabled: !!process.env.ALPHA_VANTAGE_API_KEY
      },
      polygon: {
        apiKey: process.env.POLYGON_API_KEY,
        baseUrl: 'https://api.polygon.io',
        enabled: !!process.env.POLYGON_API_KEY
      },
      oanda: {
        apiKey: process.env.OANDA_API_KEY,
        baseUrl: 'https://api-fxtrade.oanda.com',
        enabled: !!process.env.OANDA_API_KEY
      }
    };

    this.symbols = [
      'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD',
      'EURGBP', 'EURJPY', 'GBPJPY', 'AUDNZD', 'NZDUSD', 'USDSEK'
    ];

    this.timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];
    this.currentPrices = new Map();
    this.websockets = new Map();
    this.subscribers = new Map();
    this.isInitialized = false;
  }

  // Initialize market data service
  async initialize() {
    try {
      console.log('🚀 Initializing Market Data Service...');

      // Load current prices from database
      await this.loadCurrentPrices();

      // Start real-time data feeds
      await this.startRealTimeFeeds();

      // Schedule periodic data updates
      this.scheduleDataUpdates();

      this.isInitialized = true;
      console.log('✅ Market Data Service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Market Data Service:', error);
      throw error;
    }
  }

  // Load current prices from database
  async loadCurrentPrices() {
    try {
      for (const symbol of this.symbols) {
        const latestData = await MarketData.findOne({
          where: { symbol },
          order: [['timestamp', 'DESC']]
        });

        if (latestData) {
          this.currentPrices.set(symbol, {
            bid: latestData.bid || latestData.close,
            ask: latestData.ask || latestData.close,
            close: latestData.close,
            timestamp: latestData.timestamp
          });
        }
      }
    } catch (error) {
      console.error('Error loading current prices:', error);
    }
  }

  // Start real-time data feeds
  async startRealTimeFeeds() {
    // Start WebSocket connections for real-time data
    if (this.providers.polygon.enabled) {
      this.startPolygonWebSocket();
    }

    // Start OANDA WebSocket if available
    if (this.providers.oanda.enabled) {
      this.startOandaWebSocket();
    }

    // Fallback to REST API polling
    if (!this.providers.polygon.enabled && !this.providers.oanda.enabled) {
      this.startAPIPolling();
    }
  }

  // Start Polygon WebSocket for real-time data
  startPolygonWebSocket() {
    try {
      const ws = new WebSocket(`wss://delayed.polygon.io/forex`);

      ws.on('open', () => {
        console.log('🔌 Connected to Polygon WebSocket');
        
        // Subscribe to forex symbols
        const subscribeMessage = {
          action: 'subscribe',
          params: this.symbols.map(symbol => `C:${symbol}`)
        };
        
        ws.send(JSON.stringify(subscribeMessage));
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handlePolygonMessage(message);
        } catch (error) {
          console.error('Error parsing Polygon message:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('Polygon WebSocket error:', error);
      });

      ws.on('close', () => {
        console.log('Polygon WebSocket disconnected, reconnecting...');
        setTimeout(() => this.startPolygonWebSocket(), 5000);
      });

      this.websockets.set('polygon', ws);
    } catch (error) {
      console.error('Failed to start Polygon WebSocket:', error);
    }
  }

  // Handle Polygon WebSocket messages
  handlePolygonMessage(message) {
    if (message.ev === 'C') { // Currency pair update
      const symbol = message.pair;
      const price = {
        bid: parseFloat(message.b),
        ask: parseFloat(message.a),
        close: parseFloat(message.b), // Use bid as close
        timestamp: new Date(message.t)
      };

      this.updatePrice(symbol, price);
    }
  }

  // Start OANDA WebSocket
  startOandaWebSocket() {
    try {
      const ws = new WebSocket(`wss://stream-fxtrade.oanda.com/v3/accounts/${process.env.OANDA_ACCOUNT_ID}/pricing/stream`);

      ws.on('open', () => {
        console.log('🔌 Connected to OANDA WebSocket');
        
        // Subscribe to instruments
        const subscribeMessage = {
          instruments: this.symbols
        };
        
        ws.send(JSON.stringify(subscribeMessage));
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleOandaMessage(message);
        } catch (error) {
          console.error('Error parsing OANDA message:', error);
        }
      });

      ws.on('error', (error) => {
        console.error('OANDA WebSocket error:', error);
      });

      ws.on('close', () => {
        console.log('OANDA WebSocket disconnected, reconnecting...');
        setTimeout(() => this.startOandaWebSocket(), 5000);
      });

      this.websockets.set('oanda', ws);
    } catch (error) {
      console.error('Failed to start OANDA WebSocket:', error);
    }
  }

  // Handle OANDA WebSocket messages
  handleOandaMessage(message) {
    if (message.type === 'PRICE') {
      const symbol = message.instrument;
      const price = {
        bid: parseFloat(message.bids[0].price),
        ask: parseFloat(message.asks[0].price),
        close: parseFloat(message.bids[0].price),
        timestamp: new Date(message.time)
      };

      this.updatePrice(symbol, price);
    }
  }

  // Start API polling as fallback
  startAPIPolling() {
    console.log('📡 Starting API polling for market data...');
    
    // Poll every 5 seconds
    setInterval(async () => {
      for (const symbol of this.symbols) {
        try {
          const price = await this.fetchCurrentPrice(symbol);
          if (price) {
            this.updatePrice(symbol, price);
          }
        } catch (error) {
          console.error(`Error fetching price for ${symbol}:`, error);
        }
      }
    }, 5000);
  }

  // Fetch current price from API
  async fetchCurrentPrice(symbol) {
    try {
      if (this.providers.alphaVantage.enabled) {
        return await this.fetchAlphaVantagePrice(symbol);
      } else if (this.providers.polygon.enabled) {
        return await this.fetchPolygonPrice(symbol);
      }
    } catch (error) {
      console.error(`Error fetching price for ${symbol}:`, error);
    }
    return null;
  }

  // Fetch price from Alpha Vantage
  async fetchAlphaVantagePrice(symbol) {
    try {
      const response = await axios.get(this.providers.alphaVantage.baseUrl, {
        params: {
          function: 'CURRENCY_EXCHANGE_RATE',
          from_currency: symbol.substring(0, 3),
          to_currency: symbol.substring(3, 6),
          apikey: this.providers.alphaVantage.apiKey
        }
      });

      if (response.data['Realtime Currency Exchange Rate']) {
        const data = response.data['Realtime Currency Exchange Rate'];
        return {
          bid: parseFloat(data['5. Exchange Rate']),
          ask: parseFloat(data['5. Exchange Rate']),
          close: parseFloat(data['5. Exchange Rate']),
          timestamp: new Date(data['6. Last Refreshed'])
        };
      }
    } catch (error) {
      console.error('Alpha Vantage API error:', error);
    }
    return null;
  }

  // Fetch price from Polygon
  async fetchPolygonPrice(symbol) {
    try {
      const response = await axios.get(`${this.providers.polygon.baseUrl}/v2/snapshot/locale/global/markets/forex/tickers`, {
        params: {
          apikey: this.providers.polygon.apiKey
        }
      });

      const ticker = response.data.tickers.find(t => t.ticker === symbol);
      if (ticker) {
        return {
          bid: parseFloat(ticker.last.b),
          ask: parseFloat(ticker.last.a),
          close: parseFloat(ticker.last.p),
          timestamp: new Date(ticker.last.t)
        };
      }
    } catch (error) {
      console.error('Polygon API error:', error);
    }
    return null;
  }

  // Update price and notify subscribers
  async updatePrice(symbol, price) {
    try {
      // Update current price
      this.currentPrices.set(symbol, price);

      // Save to database
      await MarketData.create({
        symbol,
        timeframe: '1m',
        open: price.close,
        high: price.close,
        low: price.close,
        close: price.close,
        bid: price.bid,
        ask: price.ask,
        timestamp: price.timestamp,
        source: 'realtime'
      });

      // Notify subscribers
      this.notifySubscribers(symbol, price);

    } catch (error) {
      console.error(`Error updating price for ${symbol}:`, error);
    }
  }

  // Notify subscribers of price updates
  notifySubscribers(symbol, price) {
    const subscribers = this.subscribers.get(symbol) || [];
    subscribers.forEach(callback => {
      try {
        callback(price);
      } catch (error) {
        console.error('Error in subscriber callback:', error);
      }
    });
  }

  // Subscribe to price updates
  subscribe(symbol, callback) {
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, []);
    }
    this.subscribers.get(symbol).push(callback);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(symbol);
      if (subscribers) {
        const index = subscribers.indexOf(callback);
        if (index > -1) {
          subscribers.splice(index, 1);
        }
      }
    };
  }

  // Get current price
  getCurrentPrice(symbol) {
    return this.currentPrices.get(symbol);
  }

  // Get all current prices
  getAllCurrentPrices() {
    const prices = {};
    for (const [symbol, price] of this.currentPrices) {
      prices[symbol] = price;
    }
    return prices;
  }

  // Get historical data
  async getHistoricalData(symbol, timeframe = '1h', limit = 100) {
    try {
      const data = await MarketData.findAll({
        where: { symbol, timeframe },
        order: [['timestamp', 'DESC']],
        limit
      });

      return data.map(item => ({
        timestamp: item.timestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume,
        bid: item.bid,
        ask: item.ask,
        spread: item.spread
      })).reverse();
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      return [];
    }
  }

  // Fetch historical data from API
  async fetchHistoricalData(symbol, timeframe = '1h', days = 30) {
    try {
      if (this.providers.alphaVantage.enabled) {
        return await this.fetchAlphaVantageHistorical(symbol, timeframe, days);
      } else if (this.providers.polygon.enabled) {
        return await this.fetchPolygonHistorical(symbol, timeframe, days);
      }
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
    }
    return [];
  }

  // Fetch historical data from Alpha Vantage
  async fetchAlphaVantageHistorical(symbol, timeframe, days) {
    try {
      const response = await axios.get(this.providers.alphaVantage.baseUrl, {
        params: {
          function: 'FX_DAILY',
          from_symbol: symbol.substring(0, 3),
          to_symbol: symbol.substring(3, 6),
          apikey: this.providers.alphaVantage.apiKey
        }
      });

      if (response.data['Time Series FX (Daily)']) {
        const timeSeries = response.data['Time Series FX (Daily)'];
        const data = [];

        for (const [date, values] of Object.entries(timeSeries)) {
          data.push({
            timestamp: new Date(date),
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseFloat(values['5. volume']) || 0
          });
        }

        return data.sort((a, b) => a.timestamp - b.timestamp);
      }
    } catch (error) {
      console.error('Alpha Vantage historical API error:', error);
    }
    return [];
  }

  // Fetch historical data from Polygon
  async fetchPolygonHistorical(symbol, timeframe, days) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await axios.get(`${this.providers.polygon.baseUrl}/v2/aggs/ticker/C:${symbol}/range/1/${timeframe}/${startDate.toISOString().split('T')[0]}/${endDate.toISOString().split('T')[0]}`, {
        params: {
          apikey: this.providers.polygon.apiKey
        }
      });

      if (response.data.results) {
        return response.data.results.map(item => ({
          timestamp: new Date(item.t),
          open: item.o,
          high: item.h,
          low: item.l,
          close: item.c,
          volume: item.v
        }));
      }
    } catch (error) {
      console.error('Polygon historical API error:', error);
    }
    return [];
  }

  // Schedule periodic data updates
  scheduleDataUpdates() {
    // Update historical data daily at 00:00 UTC
    cron.schedule('0 0 * * *', async () => {
      console.log('📅 Updating historical data...');
      for (const symbol of this.symbols) {
        try {
          const historicalData = await this.fetchHistoricalData(symbol, '1d', 30);
          await this.saveHistoricalData(symbol, historicalData);
        } catch (error) {
          console.error(`Error updating historical data for ${symbol}:`, error);
        }
      }
    });

    // Clean up old data weekly
    cron.schedule('0 2 * * 0', async () => {
      console.log('🧹 Cleaning up old market data...');
      await this.cleanupOldData();
    });
  }

  // Save historical data to database
  async saveHistoricalData(symbol, data) {
    try {
      for (const item of data) {
        await MarketData.create({
          symbol,
          timeframe: '1d',
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          timestamp: item.timestamp,
          source: 'historical'
        });
      }
    } catch (error) {
      console.error(`Error saving historical data for ${symbol}:`, error);
    }
  }

  // Clean up old data
  async cleanupOldData() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90); // Keep 90 days

      await MarketData.destroy({
        where: {
          timestamp: {
            [Op.lt]: cutoffDate
          }
        }
      });

      console.log('✅ Old market data cleaned up');
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }

  // Get market statistics
  async getMarketStats(symbol, period = '24h') {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case '1h':
          startDate.setHours(startDate.getHours() - 1);
          break;
        case '24h':
          startDate.setDate(startDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 1);
      }

      const data = await MarketData.findAll({
        where: {
          symbol,
          timestamp: {
            [Op.between]: [startDate, endDate]
          }
        },
        order: [['timestamp', 'ASC']]
      });

      if (data.length === 0) return null;

      const prices = data.map(item => parseFloat(item.close));
      const volumes = data.map(item => parseFloat(item.volume || 0));

      const stats = {
        symbol,
        period,
        startPrice: prices[0],
        endPrice: prices[prices.length - 1],
        change: prices[prices.length - 1] - prices[0],
        changePercent: ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100,
        high: Math.max(...prices),
        low: Math.min(...prices),
        volume: volumes.reduce((sum, vol) => sum + vol, 0),
        volatility: this.calculateVolatility(prices),
        dataPoints: data.length
      };

      return stats;
    } catch (error) {
      console.error(`Error calculating market stats for ${symbol}:`, error);
      return null;
    }
  }

  // Calculate volatility
  calculateVolatility(prices) {
    if (prices.length < 2) return 0;

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    
    return Math.sqrt(variance) * 100; // Return as percentage
  }

  // Get available symbols
  getAvailableSymbols() {
    return this.symbols;
  }

  // Get available timeframes
  getAvailableTimeframes() {
    return this.timeframes;
  }

  // Check if service is initialized
  isReady() {
    return this.isInitialized;
  }

  // Shutdown service
  async shutdown() {
    console.log('🛑 Shutting down Market Data Service...');
    
    // Close WebSocket connections
    for (const [name, ws] of this.websockets) {
      ws.close();
    }
    
    this.websockets.clear();
    this.subscribers.clear();
    this.currentPrices.clear();
    
    console.log('✅ Market Data Service shutdown complete');
  }
}

module.exports = MarketDataService;



