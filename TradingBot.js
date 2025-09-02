const MovingAverageCrossoverStrategy = require('./strategies/MovingAverageCrossover');
const BrokerInterface = require('./brokers/BrokerInterface');

class TradingBot {
  constructor(config = {}) {
    // Bot configuration
    this.name = config.name || 'MA_Crossover_Bot';
    this.isActive = false;
    this.isDemo = config.isDemo || true; // Start with demo account
    
    // Initialize broker interface
    this.broker = new BrokerInterface({
      broker: config.broker || 'OANDA',
      apiKey: config.apiKey,
      accountId: config.accountId,
      baseUrl: config.baseUrl,
      isDemo: this.isDemo,
      maxPositions: config.maxPositions || 3,
      maxDailyLoss: config.maxDailyLoss || 200,
      maxRiskPerTrade: config.maxRiskPerTrade || 1
    });
    
    // Initialize trading strategy
    this.strategy = new MovingAverageCrossoverStrategy({
      fastPeriod: config.fastPeriod || 10,
      slowPeriod: config.slowPeriod || 30,
      maType: config.maType || 'SMA',
      lotSize: config.lotSize || 0.1,
      stopLoss: config.stopLoss || 50,
      takeProfit: config.takeProfit || 100,
      maxPositions: config.maxPositions || 3,
      riskPercentage: config.maxRiskPerTrade || 1
    });
    
    // Performance tracking
    this.performance = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      maxDrawdown: 0,
      startTime: null,
      lastTradeTime: null
    };
    
    // Set up event handlers
    this.setupEventHandlers();
    
    console.log(`Trading Bot "${this.name}" initialized`);
  }

  // Set up event handlers for broker and strategy
  setupEventHandlers() {
    // Broker price updates
    this.broker.onPriceUpdate = (priceData) => {
      if (this.isActive) {
        this.strategy.update(priceData);
      }
    };
    
    // Strategy signals
    this.strategy.onSignal = (signal) => {
      if (this.isActive) {
        this.executeSignal(signal);
      }
    };
    
    // Order updates
    this.broker.onOrderUpdate = (order) => {
      console.log(`Order update: ${order.id} - ${order.status}`);
      this.updatePerformance(order);
    };
    
    // Position updates
    this.broker.onPositionUpdate = (update) => {
      console.log(`Position update: ${update.action} - ${update.positionId}`);
      if (update.action === 'close') {
        this.strategy.removePosition(update.positionId);
      }
    };
    
    // Account updates
    this.broker.onAccountUpdate = (accountInfo) => {
      console.log(`Account balance: $${accountInfo.balance}`);
    };
  }

  // Start the trading bot
  async start() {
    try {
      console.log('Starting Trading Bot...');
      
      // Connect to broker
      const connected = await this.broker.connect();
      if (!connected) {
        throw new Error('Failed to connect to broker');
      }
      
      // Start the strategy
      this.strategy.start();
      
      // Set bot as active
      this.isActive = true;
      this.performance.startTime = new Date();
      
      console.log('Trading Bot started successfully!');
      console.log(`Demo mode: ${this.isDemo ? 'ON' : 'OFF'}`);
      
      return true;
    } catch (error) {
      console.error('Failed to start Trading Bot:', error.message);
      return false;
    }
  }

  // Stop the trading bot
  async stop() {
    try {
      console.log('Stopping Trading Bot...');
      
      // Stop the strategy
      this.strategy.stop();
      
      // Close all positions (optional)
      if (config.closePositionsOnStop) {
        await this.closeAllPositions();
      }
      
      // Disconnect from broker
      this.broker.disconnect();
      
      // Set bot as inactive
      this.isActive = false;
      
      console.log('Trading Bot stopped successfully!');
      
      // Print performance summary
      this.printPerformanceSummary();
      
      return true;
    } catch (error) {
      console.error('Failed to stop Trading Bot:', error.message);
      return false;
    }
  }

  // Execute trading signal
  async executeSignal(signal) {
    try {
      console.log(`Executing signal: ${signal.type} ${signal.symbol}`);
      
      // Prepare order data
      const orderData = {
        type: signal.type,
        symbol: signal.symbol,
        volume: signal.lotSize,
        price: signal.price,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        comment: `Bot: ${this.name} - ${signal.strategy}`
      };
      
      // Place order through broker
      const order = await this.broker.placeOrder(orderData);
      
      // Add position to strategy tracking
      this.strategy.addPosition({
        id: order.id,
        symbol: signal.symbol,
        type: signal.type,
        volume: signal.lotSize,
        openPrice: signal.price,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        openTime: new Date()
      });
      
      console.log(`Signal executed successfully: ${order.id}`);
      
    } catch (error) {
      console.error('Failed to execute signal:', error.message);
    }
  }

  // Close all open positions
  async closeAllPositions() {
    try {
      console.log('Closing all positions...');
      
      const positions = await this.broker.getPositions();
      
      for (const position of positions) {
        await this.broker.closePosition(position.id);
      }
      
      console.log('All positions closed');
    } catch (error) {
      console.error('Failed to close all positions:', error.message);
    }
  }

  // Update performance metrics
  updatePerformance(order) {
    if (order.status === 'FILLED') {
      this.performance.totalTrades++;
      this.performance.lastTradeTime = new Date();
      
      // Calculate P&L (this would come from the broker)
      if (order.pnl) {
        this.performance.totalPnL += order.pnl;
        
        if (order.pnl > 0) {
          this.performance.winningTrades++;
        } else {
          this.performance.losingTrades++;
        }
        
        // Update win rate
        this.performance.winRate = (this.performance.winningTrades / this.performance.totalTrades) * 100;
        
        // Update averages
        this.calculateAverages();
        
        // Update max drawdown
        this.updateMaxDrawdown();
      }
    }
  }

  // Calculate average win/loss
  calculateAverages() {
    // This would be calculated from actual trade data
    // For now, using placeholder values
    this.performance.averageWin = 25; // USD
    this.performance.averageLoss = -15; // USD
  }

  // Update maximum drawdown
  updateMaxDrawdown() {
    // This would be calculated from actual equity curve
    // For now, using placeholder value
    this.performance.maxDrawdown = -50; // USD
  }

  // Print performance summary
  printPerformanceSummary() {
    console.log('\n=== PERFORMANCE SUMMARY ===');
    console.log(`Total Trades: ${this.performance.totalTrades}`);
    console.log(`Win Rate: ${this.performance.winRate.toFixed(1)}%`);
    console.log(`Total P&L: $${this.performance.totalPnL.toFixed(2)}`);
    console.log(`Average Win: $${this.performance.averageWin.toFixed(2)}`);
    console.log(`Average Loss: $${this.performance.averageLoss.toFixed(2)}`);
    console.log(`Max Drawdown: $${this.performance.maxDrawdown.toFixed(2)}`);
    
    if (this.performance.startTime) {
      const runtime = new Date() - this.performance.startTime;
      const hours = Math.floor(runtime / (1000 * 60 * 60));
      const minutes = Math.floor((runtime % (1000 * 60 * 60)) / (1000 * 60));
      console.log(`Runtime: ${hours}h ${minutes}m`);
    }
    console.log('===========================\n');
  }

  // Get bot status
  getStatus() {
    return {
      name: this.name,
      isActive: this.isActive,
      isDemo: this.isDemo,
      broker: this.broker.getStatus(),
      strategy: this.strategy.getStatus(),
      performance: this.performance
    };
  }

  // Update bot configuration
  updateConfig(newConfig) {
    // Update strategy parameters
    if (newConfig.fastPeriod) this.strategy.fastPeriod = newConfig.fastPeriod;
    if (newConfig.slowPeriod) this.strategy.slowPeriod = newConfig.slowPeriod;
    if (newConfig.lotSize) this.strategy.lotSize = newConfig.lotSize;
    if (newConfig.stopLoss) this.strategy.stopLoss = newConfig.stopLoss;
    if (newConfig.takeProfit) this.strategy.takeProfit = newConfig.takeProfit;
    
    // Update risk management
    if (newConfig.maxPositions) {
      this.broker.maxPositions = newConfig.maxPositions;
      this.strategy.maxPositions = newConfig.maxPositions;
    }
    if (newConfig.maxDailyLoss) this.broker.maxDailyLoss = newConfig.maxDailyLoss;
    if (newConfig.maxRiskPerTrade) {
      this.broker.maxRiskPerTrade = newConfig.maxRiskPerTrade;
      this.strategy.riskPercentage = newConfig.maxRiskPerTrade;
    }
    
    console.log('Bot configuration updated');
  }
}

module.exports = TradingBot;








