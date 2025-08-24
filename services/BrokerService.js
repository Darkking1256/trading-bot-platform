const axios = require('axios');
const WebSocket = require('ws');

class BrokerService {
  constructor() {
    this.brokers = {
      oanda: {
        name: 'OANDA',
        baseUrl: 'https://api-fxtrade.oanda.com',
        streamUrl: 'https://stream-fxtrade.oanda.com',
        enabled: !!process.env.OANDA_API_KEY,
        apiKey: process.env.OANDA_API_KEY,
        accountId: process.env.OANDA_ACCOUNT_ID
      },
      fxcm: {
        name: 'FXCM',
        baseUrl: 'https://api-demo.fxcm.com',
        streamUrl: 'wss://api-demo.fxcm.com/',
        enabled: !!process.env.FXCM_API_KEY,
        apiKey: process.env.FXCM_API_KEY,
        token: process.env.FXCM_TOKEN
      },
      alpaca: {
        name: 'Alpaca',
        baseUrl: 'https://paper-api.alpaca.markets',
        streamUrl: 'wss://paper-api.alpaca.markets/stream',
        enabled: !!process.env.ALPACA_API_KEY,
        apiKey: process.env.ALPACA_API_KEY,
        secretKey: process.env.ALPACA_SECRET_KEY
      },
      interactiveBrokers: {
        name: 'Interactive Brokers',
        baseUrl: 'https://localhost:5000/v1/portal',
        enabled: !!process.env.IB_PORT,
        port: process.env.IB_PORT || 5000
      }
    };

    this.activeConnections = new Map();
    this.accounts = new Map();
    this.positions = new Map();
    this.orders = new Map();
    this.isConnected = false;
  }

  // Initialize broker service
  async initialize() {
    try {
      console.log('🏦 Initializing Broker Service...');

      // Check available brokers
      const availableBrokers = Object.entries(this.brokers)
        .filter(([key, broker]) => broker.enabled)
        .map(([key, broker]) => ({ key, ...broker }));

      if (availableBrokers.length === 0) {
        console.log('⚠️  No broker API keys configured. Running in demo mode.');
        console.log('📋 To enable live trading, add broker API keys to your .env file:');
        console.log('   OANDA_API_KEY=your_oanda_key');
        console.log('   OANDA_ACCOUNT_ID=your_account_id');
        console.log('   FXCM_API_KEY=your_fxcm_key');
        console.log('   ALPACA_API_KEY=your_alpaca_key');
        return false;
      }

      console.log(`🔗 Found ${availableBrokers.length} configured broker(s):`);
      availableBrokers.forEach(broker => {
        console.log(`   - ${broker.name} (${broker.key})`);
      });

      // Connect to first available broker
      const primaryBroker = availableBrokers[0];
      await this.connectToBroker(primaryBroker.key);

      this.isConnected = true;
      console.log('✅ Broker Service initialized successfully');
      return true;

    } catch (error) {
      console.error('❌ Failed to initialize Broker Service:', error);
      return false;
    }
  }

  // Connect to specific broker
  async connectToBroker(brokerKey) {
    const broker = this.brokers[brokerKey];
    if (!broker || !broker.enabled) {
      throw new Error(`Broker ${brokerKey} not available or not configured`);
    }

    try {
      console.log(`🔗 Connecting to ${broker.name}...`);

      switch (brokerKey) {
        case 'oanda':
          await this.connectOANDA(broker);
          break;
        case 'fxcm':
          await this.connectFXCM(broker);
          break;
        case 'alpaca':
          await this.connectAlpaca(broker);
          break;
        case 'interactiveBrokers':
          await this.connectInteractiveBrokers(broker);
          break;
        default:
          throw new Error(`Unsupported broker: ${brokerKey}`);
      }

      this.activeConnections.set(brokerKey, {
        broker,
        connectedAt: new Date(),
        status: 'connected'
      });

      console.log(`✅ Connected to ${broker.name} successfully`);

    } catch (error) {
      console.error(`❌ Failed to connect to ${broker.name}:`, error);
      throw error;
    }
  }

  // Connect to OANDA
  async connectOANDA(broker) {
    try {
      // Get account information
      const accountResponse = await axios.get(`${broker.baseUrl}/v3/accounts`, {
        headers: {
          'Authorization': `Bearer ${broker.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (accountResponse.data.accounts && accountResponse.data.accounts.length > 0) {
        const account = accountResponse.data.accounts[0];
        this.accounts.set('oanda', {
          id: account.id,
          name: account.name,
          currency: account.currency,
          balance: parseFloat(account.balance),
          marginRate: parseFloat(account.marginRate),
          marginCallMarginUsed: parseFloat(account.marginCallMarginUsed),
          marginCallPercent: parseFloat(account.marginCallPercent),
          openTradeCount: account.openTradeCount,
          openPositionCount: account.openPositionCount,
          pendingOrderCount: account.pendingOrderCount,
          pl: parseFloat(account.pl),
          resettablePL: parseFloat(account.resettablePL),
          unrealizedPL: parseFloat(account.unrealizedPL),
          NAV: parseFloat(account.NAV),
          marginUsed: parseFloat(account.marginUsed),
          marginAvailable: parseFloat(account.marginAvailable),
          withdrawalLimit: parseFloat(account.withdrawalLimit),
          marginCallPercent: parseFloat(account.marginCallPercent)
        });

        console.log(`📊 OANDA Account: ${account.name} (${account.currency})`);
        console.log(`💰 Balance: ${account.balance} ${account.currency}`);
        console.log(`📈 P&L: ${account.pl} ${account.currency}`);
      }

      // Get open positions
      const positionsResponse = await axios.get(`${broker.baseUrl}/v3/accounts/${broker.accountId}/positions`, {
        headers: {
          'Authorization': `Bearer ${broker.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (positionsResponse.data.positions) {
        positionsResponse.data.positions.forEach(position => {
          this.positions.set(position.instrument, {
            instrument: position.instrument,
            long: {
              units: parseFloat(position.long.units),
              averagePrice: parseFloat(position.long.averagePrice),
              pl: parseFloat(position.long.pl),
              resettablePL: parseFloat(position.long.resettablePL),
              unrealizedPL: parseFloat(position.long.unrealizedPL)
            },
            short: {
              units: parseFloat(position.short.units),
              averagePrice: parseFloat(position.short.averagePrice),
              pl: parseFloat(position.short.pl),
              resettablePL: parseFloat(position.short.resettablePL),
              unrealizedPL: parseFloat(position.short.unrealizedPL)
            }
          });
        });

        console.log(`📊 Loaded ${this.positions.size} open positions`);
      }

    } catch (error) {
      console.error('OANDA connection error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Connect to FXCM
  async connectFXCM(broker) {
    try {
      // FXCM connection logic
      console.log('FXCM connection not yet implemented');
      throw new Error('FXCM integration not yet implemented');
    } catch (error) {
      throw error;
    }
  }

  // Connect to Alpaca
  async connectAlpaca(broker) {
    try {
      // Alpaca connection logic
      console.log('Alpaca connection not yet implemented');
      throw new Error('Alpaca integration not yet implemented');
    } catch (error) {
      throw error;
    }
  }

  // Connect to Interactive Brokers
  async connectInteractiveBrokers(broker) {
    try {
      // IB connection logic
      console.log('Interactive Brokers connection not yet implemented');
      throw new Error('Interactive Brokers integration not yet implemented');
    } catch (error) {
      throw error;
    }
  }

  // Place market order
  async placeMarketOrder(symbol, side, quantity, options = {}) {
    const activeConnection = Array.from(this.activeConnections.values())[0];
    if (!activeConnection) {
      throw new Error('No active broker connection');
    }

    const broker = activeConnection.broker;
    const accountId = this.accounts.get(broker.name.toLowerCase())?.id;

    if (!accountId) {
      throw new Error('No account information available');
    }

    try {
      const orderData = {
        type: 'MARKET',
        instrument: symbol,
        units: side === 'BUY' ? quantity : -quantity,
        timeInForce: options.timeInForce || 'FOK',
        positionFill: options.positionFill || 'DEFAULT'
      };

      if (options.stopLoss) {
        orderData.stopLossOnFill = {
          price: options.stopLoss
        };
      }

      if (options.takeProfit) {
        orderData.takeProfitOnFill = {
          price: options.takeProfit
        };
      }

      const response = await axios.post(`${broker.baseUrl}/v3/accounts/${accountId}/orders`, orderData, {
        headers: {
          'Authorization': `Bearer ${broker.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const order = response.data.orderFillTransaction || response.data.orderCreateTransaction;
      
      this.orders.set(order.id, {
        id: order.id,
        symbol: symbol,
        side: side,
        quantity: quantity,
        type: 'MARKET',
        status: order.state || 'FILLED',
        fillPrice: order.price,
        timestamp: new Date(order.time),
        broker: broker.name
      });

      console.log(`✅ Market order placed: ${side} ${quantity} ${symbol} @ ${order.price}`);
      return order;

    } catch (error) {
      console.error('Order placement error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Place limit order
  async placeLimitOrder(symbol, side, quantity, price, options = {}) {
    const activeConnection = Array.from(this.activeConnections.values())[0];
    if (!activeConnection) {
      throw new Error('No active broker connection');
    }

    const broker = activeConnection.broker;
    const accountId = this.accounts.get(broker.name.toLowerCase())?.id;

    if (!accountId) {
      throw new Error('No account information available');
    }

    try {
      const orderData = {
        type: 'LIMIT',
        instrument: symbol,
        units: side === 'BUY' ? quantity : -quantity,
        price: price.toString(),
        timeInForce: options.timeInForce || 'GTC',
        positionFill: options.positionFill || 'DEFAULT'
      };

      if (options.stopLoss) {
        orderData.stopLossOnFill = {
          price: options.stopLoss
        };
      }

      if (options.takeProfit) {
        orderData.takeProfitOnFill = {
          price: options.takeProfit
        };
      }

      const response = await axios.post(`${broker.baseUrl}/v3/accounts/${accountId}/orders`, orderData, {
        headers: {
          'Authorization': `Bearer ${broker.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const order = response.data.orderCreateTransaction;
      
      this.orders.set(order.id, {
        id: order.id,
        symbol: symbol,
        side: side,
        quantity: quantity,
        type: 'LIMIT',
        price: price,
        status: order.state,
        timestamp: new Date(order.time),
        broker: broker.name
      });

      console.log(`✅ Limit order placed: ${side} ${quantity} ${symbol} @ ${price}`);
      return order;

    } catch (error) {
      console.error('Order placement error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId) {
    const activeConnection = Array.from(this.activeConnections.values())[0];
    if (!activeConnection) {
      throw new Error('No active broker connection');
    }

    const broker = activeConnection.broker;
    const accountId = this.accounts.get(broker.name.toLowerCase())?.id;

    if (!accountId) {
      throw new Error('No account information available');
    }

    try {
      const response = await axios.put(`${broker.baseUrl}/v3/accounts/${accountId}/orders/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Bearer ${broker.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const order = response.data.orderCancelTransaction;
      
      if (this.orders.has(orderId)) {
        this.orders.get(orderId).status = 'CANCELLED';
      }

      console.log(`✅ Order cancelled: ${orderId}`);
      return order;

    } catch (error) {
      console.error('Order cancellation error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Get account information
  getAccountInfo() {
    const accounts = Array.from(this.accounts.values());
    return accounts.length > 0 ? accounts[0] : null;
  }

  // Get open positions
  getOpenPositions() {
    return Array.from(this.positions.values());
  }

  // Get open orders
  getOpenOrders() {
    return Array.from(this.orders.values()).filter(order => 
      ['PENDING', 'OPEN'].includes(order.status)
    );
  }

  // Get order history
  getOrderHistory() {
    return Array.from(this.orders.values());
  }

  // Check if connected to broker
  isConnectedToBroker() {
    return this.isConnected && this.activeConnections.size > 0;
  }

  // Get connection status
  getConnectionStatus() {
    const connections = Array.from(this.activeConnections.entries()).map(([key, conn]) => ({
      broker: key,
      name: conn.broker.name,
      status: conn.status,
      connectedAt: conn.connectedAt
    }));

    return {
      isConnected: this.isConnected,
      connections,
      accountInfo: this.getAccountInfo(),
      openPositions: this.getOpenPositions().length,
      openOrders: this.getOpenOrders().length
    };
  }

  // Shutdown broker service
  async shutdown() {
    console.log('🛑 Shutting down Broker Service...');
    
    // Close all connections
    for (const [key, connection] of this.activeConnections) {
      console.log(`🔌 Disconnecting from ${connection.broker.name}...`);
    }
    
    this.activeConnections.clear();
    this.accounts.clear();
    this.positions.clear();
    this.orders.clear();
    this.isConnected = false;
    
    console.log('✅ Broker Service shutdown complete');
  }
}

module.exports = BrokerService;
