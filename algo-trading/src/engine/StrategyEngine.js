// Strategy Engine - Core algorithmic trading engine
class StrategyEngine {
  constructor(config = {}) {
    this.strategies = new Map();
    this.activeStrategies = new Map();
    this.marketData = new Map();
    this.positions = new Map();
    this.orders = new Map();
    this.performance = new Map();
    
    // Configuration
    this.config = {
      maxStrategies: config.maxStrategies || 10,
      maxPositions: config.maxPositions || 5,
      riskPercentage: config.riskPercentage || 2,
      defaultLotSize: config.defaultLotSize || 0.1,
      enableRealTime: config.enableRealTime || true,
      enableBacktesting: config.enableBacktesting || true,
      ...config
    };
    
    // Event handlers
    this.eventHandlers = {
      onSignal: [],
      onOrder: [],
      onPosition: [],
      onPerformance: [],
      onError: []
    };
    
    // Performance tracking
    this.stats = {
      totalSignals: 0,
      totalOrders: 0,
      totalPositions: 0,
      totalPnL: 0,
      winRate: 0,
      startTime: Date.now()
    };
    
    this.isRunning = false;
    this.initialize();
  }
  
  // Initialize the strategy engine
  initialize() {
    console.log('Initializing Strategy Engine...');
    
    // Load built-in strategies
    this.loadBuiltinStrategies();
    
    // Initialize risk manager
    this.riskManager = new RiskManager(this.config);
    
    // Initialize performance monitor
    this.performanceMonitor = new PerformanceMonitor();
    
    // Initialize order manager
    this.orderManager = new OrderManager();
    
    console.log('Strategy Engine initialized successfully');
  }
  
  // Load built-in strategies
  loadBuiltinStrategies() {
    const builtinStrategies = {
      'moving-average-crossover': MovingAverageCrossoverStrategy,
      'rsi-divergence': RSIDivergenceStrategy,
      'macd-strategy': MACDStrategy,
      'bollinger-bands': BollingerBandsStrategy,
      'mean-reversion': MeanReversionStrategy,
      'momentum': MomentumStrategy,
      'breakout': BreakoutStrategy,
      'grid-trading': GridTradingStrategy
    };
    
    Object.entries(builtinStrategies).forEach(([name, StrategyClass]) => {
      this.registerStrategy(name, StrategyClass);
    });
  }
  
  // Register a new strategy
  registerStrategy(name, StrategyClass) {
    if (this.strategies.has(name)) {
      console.warn(`Strategy ${name} already registered, overwriting...`);
    }
    
    this.strategies.set(name, StrategyClass);
    console.log(`Strategy ${name} registered successfully`);
  }
  
  // Create and start a strategy instance
  createStrategy(strategyName, config = {}) {
    const StrategyClass = this.strategies.get(strategyName);
    if (!StrategyClass) {
      throw new Error(`Strategy ${strategyName} not found`);
    }
    
    const strategyId = `${strategyName}_${Date.now()}`;
    const strategy = new StrategyClass({
      id: strategyId,
      name: strategyName,
      ...this.config,
      ...config
    });
    
    // Set up event handlers
    strategy.onSignal = (signal) => this.handleSignal(strategyId, signal);
    strategy.onError = (error) => this.handleError(strategyId, error);
    
    this.activeStrategies.set(strategyId, strategy);
    
    console.log(`Strategy ${strategyName} created with ID: ${strategyId}`);
    return strategyId;
  }
  
  // Start a strategy
  startStrategy(strategyId) {
    const strategy = this.activeStrategies.get(strategyId);
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }
    
    if (strategy.isActive) {
      console.warn(`Strategy ${strategyId} is already active`);
      return;
    }
    
    strategy.start();
    console.log(`Strategy ${strategyId} started`);
    
    this.emit('strategyStarted', { strategyId, strategy: strategy.name });
  }
  
  // Stop a strategy
  stopStrategy(strategyId) {
    const strategy = this.activeStrategies.get(strategyId);
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }
    
    if (!strategy.isActive) {
      console.warn(`Strategy ${strategyId} is not active`);
      return;
    }
    
    strategy.stop();
    console.log(`Strategy ${strategyId} stopped`);
    
    this.emit('strategyStopped', { strategyId, strategy: strategy.name });
  }
  
  // Update market data
  updateMarketData(symbol, data) {
    this.marketData.set(symbol, {
      ...data,
      timestamp: Date.now()
    });
    
    // Update all active strategies
    this.activeStrategies.forEach((strategy, strategyId) => {
      if (strategy.isActive && strategy.symbols.includes(symbol)) {
        try {
          strategy.update(symbol, data);
        } catch (error) {
          this.handleError(strategyId, error);
        }
      }
    });
  }
  
  // Handle trading signals from strategies
  handleSignal(strategyId, signal) {
    this.stats.totalSignals++;
    
    // Risk management check
    if (!this.riskManager.validateSignal(signal)) {
      console.log(`Signal rejected by risk manager: ${signal.type} ${signal.symbol}`);
      return;
    }
    
    // Create order
    const order = this.orderManager.createOrder(signal);
    this.orders.set(order.id, order);
    
    // Emit events
    this.emit('signal', { strategyId, signal });
    this.emit('order', { order });
    
    console.log(`Signal processed: ${signal.type} ${signal.symbol} at ${signal.price}`);
  }
  
  // Handle strategy errors
  handleError(strategyId, error) {
    console.error(`Strategy ${strategyId} error:`, error);
    this.emit('error', { strategyId, error: error.message });
  }
  
  // Get strategy performance
  getStrategyPerformance(strategyId) {
    const strategy = this.activeStrategies.get(strategyId);
    if (!strategy) return null;
    
    return this.performanceMonitor.getPerformance(strategyId);
  }
  
  // Get overall performance
  getOverallPerformance() {
    return {
      totalPnL: this.stats.totalPnL,
      winRate: this.stats.winRate,
      totalSignals: this.stats.totalSignals,
      totalOrders: this.stats.totalOrders,
      totalPositions: this.stats.totalPositions,
      uptime: Date.now() - this.stats.startTime
    };
  }
  
  // Get active strategies
  getActiveStrategies() {
    const active = [];
    this.activeStrategies.forEach((strategy, id) => {
      active.push({
        id,
        name: strategy.name,
        isActive: strategy.isActive,
        performance: this.getStrategyPerformance(id),
        config: strategy.config
      });
    });
    return active;
  }
  
  // Get available strategies
  getAvailableStrategies() {
    const available = [];
    this.strategies.forEach((StrategyClass, name) => {
      available.push({
        name,
        description: StrategyClass.description || '',
        parameters: StrategyClass.parameters || [],
        category: StrategyClass.category || 'General'
      });
    });
    return available;
  }
  
  // Start the engine
  start() {
    if (this.isRunning) {
      console.warn('Strategy Engine is already running');
      return;
    }
    
    this.isRunning = true;
    console.log('Strategy Engine started');
    this.emit('engineStarted');
  }
  
  // Stop the engine
  stop() {
    if (!this.isRunning) {
      console.warn('Strategy Engine is not running');
      return;
    }
    
    // Stop all active strategies
    this.activeStrategies.forEach((strategy, strategyId) => {
      if (strategy.isActive) {
        this.stopStrategy(strategyId);
      }
    });
    
    this.isRunning = false;
    console.log('Strategy Engine stopped');
    this.emit('engineStopped');
  }
  
  // Event handling
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }
  
  emit(event, data) {
    const handlers = this.eventHandlers[event] || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }
  
  // Cleanup
  destroy() {
    this.stop();
    this.activeStrategies.clear();
    this.marketData.clear();
    this.positions.clear();
    this.orders.clear();
    this.performance.clear();
    console.log('Strategy Engine destroyed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StrategyEngine;
}
