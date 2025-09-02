const axios = require('axios');
const WebSocket = require('ws');

class BrokerInterface {
  constructor(config = {}) {
    this.broker = config.broker || 'OANDA'; // OANDA, FXCM, IB, etc.
    this.apiKey = config.apiKey;
    this.accountId = config.accountId;
    this.baseUrl = config.baseUrl;
    this.isDemo = config.isDemo || false;
    this.isConnected = false;
    
    // Risk management
    this.maxPositions = config.maxPositions || 5;
    this.maxDailyLoss = config.maxDailyLoss || 500; // USD
    this.maxRiskPerTrade = config.maxRiskPerTrade || 2; // % of account
    
    // Position tracking
    this.positions = [];
    this.orders = [];
    this.accountInfo = null;
    
    // Event handlers
    this.onPriceUpdate = null;
    this.onOrderUpdate = null;
    this.onPositionUpdate = null;
    this.onAccountUpdate = null;
  }

  // Initialize connection to broker
  async connect() {
    try {
      console.log(`Connecting to ${this.broker}...`);
      
      // Test API connection
      await this.getAccountInfo();
      
      // Subscribe to price feeds
      await this.subscribeToPrices();
      
      this.isConnected = true;
      console.log(`Successfully connected to ${this.broker}`);
      
      return true;
    } catch (error) {
      console.error(`Failed to connect to ${this.broker}:`, error.message);
      return false;
    }
  }

  // Get account information
  async getAccountInfo() {
    try {
      const response = await this.makeRequest('GET', '/accounts');
      this.accountInfo = response.data;
      
      if (this.onAccountUpdate) {
        this.onAccountUpdate(this.accountInfo);
      }
      
      return this.accountInfo;
    } catch (error) {
      console.error('Failed to get account info:', error.message);
      throw error;
    }
  }

  // Place a market order
  async placeOrder(orderData) {
    try {
      // Validate order data
      this.validateOrder(orderData);
      
      // Check risk management
      if (!this.checkRiskManagement(orderData)) {
        throw new Error('Order rejected by risk management');
      }
      
      // Calculate position size based on risk
      const adjustedOrder = this.calculatePositionSize(orderData);
      
      console.log(`Placing order: ${adjustedOrder.type} ${adjustedOrder.symbol} ${adjustedOrder.volume} lots`);
      
      const response = await this.makeRequest('POST', '/orders', adjustedOrder);
      
      const order = response.data;
      this.orders.push(order);
      
      console.log(`Order placed successfully: ${order.id}`);
      
      if (this.onOrderUpdate) {
        this.onOrderUpdate(order);
      }
      
      return order;
    } catch (error) {
      console.error('Failed to place order:', error.message);
      throw error;
    }
  }

  // Close a position
  async closePosition(positionId) {
    try {
      console.log(`Closing position: ${positionId}`);
      
      const response = await this.makeRequest('PUT', `/positions/${positionId}/close`);
      
      const result = response.data;
      
      // Remove from local tracking
      this.positions = this.positions.filter(p => p.id !== positionId);
      
      console.log(`Position closed successfully: ${positionId}`);
      
      if (this.onPositionUpdate) {
        this.onPositionUpdate({ action: 'close', positionId, result });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to close position:', error.message);
      throw error;
    }
  }

  // Modify position (stop loss, take profit)
  async modifyPosition(positionId, modifications) {
    try {
      console.log(`Modifying position: ${positionId}`, modifications);
      
      const response = await this.makeRequest('PUT', `/positions/${positionId}`, modifications);
      
      const result = response.data;
      
      // Update local tracking
      const position = this.positions.find(p => p.id === positionId);
      if (position) {
        Object.assign(position, modifications);
      }
      
      console.log(`Position modified successfully: ${positionId}`);
      
      if (this.onPositionUpdate) {
        this.onPositionUpdate({ action: 'modify', positionId, result });
      }
      
      return result;
    } catch (error) {
      console.error('Failed to modify position:', error.message);
      throw error;
    }
  }

  // Get current positions
  async getPositions() {
    try {
      const response = await this.makeRequest('GET', '/positions');
      this.positions = response.data.positions || [];
      
      return this.positions;
    } catch (error) {
      console.error('Failed to get positions:', error.message);
      throw error;
    }
  }

  // Subscribe to real-time price updates
  async subscribeToPrices(symbols = ['EUR_USD', 'GBP_USD', 'USD_JPY']) {
    try {
      console.log(`Subscribing to price feeds: ${symbols.join(', ')}`);
      
      // Implementation depends on broker
      if (this.broker === 'OANDA') {
        await this.subscribeOANDA(symbols);
      } else if (this.broker === 'FXCM') {
        await this.subscribeFXCM(symbols);
      }
      
    } catch (error) {
      console.error('Failed to subscribe to prices:', error.message);
      throw error;
    }
  }

  // OANDA WebSocket subscription
  async subscribeOANDA(symbols) {
    const ws = new WebSocket('wss://stream-fxtrade.oanda.com/v3/accounts/' + this.accountId + '/pricing/stream');
    
    ws.on('open', () => {
      console.log('OANDA WebSocket connected');
      
      // Subscribe to instruments
      const subscribeMessage = {
        "instruments": symbols
      };
      
      ws.send(JSON.stringify(subscribeMessage));
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        
        if (message.type === 'PRICE') {
          const priceData = {
            symbol: message.instrument,
            bid: parseFloat(message.bids[0].price),
            ask: parseFloat(message.asks[0].price),
            timestamp: new Date(message.time).getTime()
          };
          
          if (this.onPriceUpdate) {
            this.onPriceUpdate(priceData);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('error', (error) => {
      console.error('OANDA WebSocket error:', error);
    });
    
    this.ws = ws;
  }

  // FXCM WebSocket subscription
  async subscribeFXCM(symbols) {
    // FXCM implementation would go here
    console.log('FXCM WebSocket subscription not implemented yet');
  }

  // Make HTTP request to broker API
  async makeRequest(method, endpoint, data = null) {
    const config = {
      method,
      url: this.baseUrl + endpoint,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    return axios(config);
  }

  // Validate order data
  validateOrder(orderData) {
    const { type, symbol, volume, stopLoss, takeProfit } = orderData;
    
    if (!type || !symbol || !volume) {
      throw new Error('Missing required order parameters');
    }
    
    if (volume <= 0 || volume > 100) {
      throw new Error('Invalid volume size');
    }
    
    if (stopLoss && stopLoss <= 0) {
      throw new Error('Invalid stop loss');
    }
    
    if (takeProfit && takeProfit <= 0) {
      throw new Error('Invalid take profit');
    }
  }

  // Check risk management rules
  checkRiskManagement(orderData) {
    // Check max positions
    if (this.positions.length >= this.maxPositions) {
      console.log('Max positions reached');
      return false;
    }
    
    // Check daily loss limit
    const dailyPnL = this.calculateDailyPnL();
    if (dailyPnL < -this.maxDailyLoss) {
      console.log('Daily loss limit reached');
      return false;
    }
    
    return true;
  }

  // Calculate position size based on risk
  calculatePositionSize(orderData) {
    const { type, symbol, volume, stopLoss } = orderData;
    
    if (!this.accountInfo || !stopLoss) {
      return orderData;
    }
    
    const accountBalance = this.accountInfo.balance;
    const maxRiskAmount = accountBalance * (this.maxRiskPerTrade / 100);
    
    // Calculate position size based on stop loss distance
    const stopLossDistance = Math.abs(orderData.price - stopLoss);
    const pipValue = this.getPipValue(orderData.price);
    const stopLossPips = stopLossDistance / pipValue;
    
    const maxVolume = maxRiskAmount / (stopLossPips * 10); // Assuming $10 per pip for standard lot
    
    return {
      ...orderData,
      volume: Math.min(volume, maxVolume)
    };
  }

  // Calculate daily P&L
  calculateDailyPnL() {
    // Implementation would calculate actual daily P&L
    return 0;
  }

  // Get pip value
  getPipValue(price) {
    if (price >= 100) return 0.01; // JPY pairs
    return 0.0001; // Other pairs
  }

  // Disconnect from broker
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.isConnected = false;
    console.log('Disconnected from broker');
  }

  // Get broker status
  getStatus() {
    return {
      broker: this.broker,
      isConnected: this.isConnected,
      isDemo: this.isDemo,
      positions: this.positions.length,
      maxPositions: this.maxPositions,
      accountInfo: this.accountInfo
    };
  }
}

module.exports = BrokerInterface;








