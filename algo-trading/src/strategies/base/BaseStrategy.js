// Base Strategy Class - All trading strategies extend this
class BaseStrategy {
  constructor(config = {}) {
    // Basic configuration
    this.id = config.id || `strategy_${Date.now()}`;
    this.name = config.name || 'BaseStrategy';
    this.description = config.description || '';
    this.category = config.category || 'General';
    
    // Trading configuration
    this.symbols = config.symbols || ['EURUSD'];
    this.lotSize = config.lotSize || 0.1;
    this.stopLoss = config.stopLoss || 50; // pips
    this.takeProfit = config.takeProfit || 100; // pips
    this.maxPositions = config.maxPositions || 1;
    this.riskPercentage = config.riskPercentage || 2;
    
    // Strategy state
    this.isActive = false;
    this.positions = [];
    this.signals = [];
    this.performance = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    };
    
    // Data storage
    this.priceData = new Map();
    this.indicators = new Map();
    
    // Event handlers
    this.onSignal = null;
    this.onError = null;
    this.onPerformance = null;
    
    // Initialize strategy
    this.initialize(config);
  }
  
  // Initialize strategy-specific logic
  initialize(config) {
    // Override in subclasses
    console.log(`Initializing ${this.name} strategy`);
  }
  
  // Start the strategy
  start() {
    if (this.isActive) {
      console.warn(`${this.name} is already active`);
      return;
    }
    
    this.isActive = true;
    console.log(`${this.name} strategy started`);
    
    // Initialize price data for all symbols
    this.symbols.forEach(symbol => {
      this.priceData.set(symbol, []);
    });
  }
  
  // Stop the strategy
  stop() {
    if (!this.isActive) {
      console.warn(`${this.name} is not active`);
      return;
    }
    
    this.isActive = false;
    console.log(`${this.name} strategy stopped`);
  }
  
  // Update strategy with new market data
  update(symbol, data) {
    if (!this.isActive) return;
    
    // Store price data
    if (!this.priceData.has(symbol)) {
      this.priceData.set(symbol, []);
    }
    
    const priceHistory = this.priceData.get(symbol);
    priceHistory.push({
      timestamp: data.timestamp || Date.now(),
      open: data.open,
      high: data.high,
      low: data.low,
      close: data.close,
      volume: data.volume || 0
    });
    
    // Keep only recent data (last 1000 candles)
    if (priceHistory.length > 1000) {
      priceHistory.shift();
    }
    
    // Update indicators
    this.updateIndicators(symbol);
    
    // Check for signals
    this.checkSignals(symbol, data);
  }
  
  // Update technical indicators
  updateIndicators(symbol) {
    const priceHistory = this.priceData.get(symbol);
    if (!priceHistory || priceHistory.length < 20) return;
    
    // Calculate basic indicators
    const closes = priceHistory.map(candle => candle.close);
    const highs = priceHistory.map(candle => candle.high);
    const lows = priceHistory.map(candle => candle.low);
    const volumes = priceHistory.map(candle => candle.volume);
    
    // Store indicators
    this.indicators.set(symbol, {
      sma: this.calculateSMA(closes, 20),
      ema: this.calculateEMA(closes, 20),
      rsi: this.calculateRSI(closes, 14),
      macd: this.calculateMACD(closes),
      bollingerBands: this.calculateBollingerBands(closes, 20, 2),
      atr: this.calculateATR(highs, lows, closes, 14)
    });
  }
  
  // Check for trading signals (override in subclasses)
  checkSignals(symbol, data) {
    // Override in subclasses
  }
  
  // Generate trading signal
  generateSignal(type, symbol, price, confidence = 0.5, reason = '') {
    if (!this.isActive) return;
    
    // Check position limits
    if (this.positions.length >= this.maxPositions) {
      console.log(`Max positions reached (${this.maxPositions}), skipping signal`);
      return;
    }
    
    const signal = {
      id: `signal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type, // 'BUY' or 'SELL'
      symbol,
      price,
      lotSize: this.lotSize,
      stopLoss: this.calculateStopLoss(type, price),
      takeProfit: this.calculateTakeProfit(type, price),
      confidence,
      reason,
      timestamp: Date.now(),
      strategy: this.name,
      strategyId: this.id
    };
    
    // Store signal
    this.signals.push(signal);
    
    // Emit signal
    if (this.onSignal) {
      this.onSignal(signal);
    }
    
    console.log(`Signal generated: ${type} ${symbol} at ${price} (confidence: ${confidence})`);
    return signal;
  }
  
  // Calculate stop loss price
  calculateStopLoss(type, entryPrice) {
    const stopLossPips = this.stopLoss / 10000; // Convert pips to price
    if (type === 'BUY') {
      return entryPrice - stopLossPips;
    } else {
      return entryPrice + stopLossPips;
    }
  }
  
  // Calculate take profit price
  calculateTakeProfit(type, entryPrice) {
    const takeProfitPips = this.takeProfit / 10000; // Convert pips to price
    if (type === 'BUY') {
      return entryPrice + takeProfitPips;
    } else {
      return entryPrice - takeProfitPips;
    }
  }
  
  // Technical indicator calculations
  
  // Simple Moving Average
  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }
  
  // Exponential Moving Average
  calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }
  
  // Relative Strength Index
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
  
  // MACD
  calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
    if (prices.length < slowPeriod) return null;
    
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    
    if (!fastEMA || !slowEMA) return null;
    
    const macdLine = fastEMA - slowEMA;
    const signalLine = this.calculateEMA([macdLine], signalPeriod);
    const histogram = macdLine - signalLine;
    
    return {
      macd: macdLine,
      signal: signalLine,
      histogram: histogram
    };
  }
  
  // Bollinger Bands
  calculateBollingerBands(prices, period = 20, stdDev = 2) {
    if (prices.length < period) return null;
    
    const sma = this.calculateSMA(prices, period);
    if (!sma) return null;
    
    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((sum, price) => {
      return sum + Math.pow(price - sma, 2);
    }, 0) / period;
    
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev)
    };
  }
  
  // Average True Range
  calculateATR(highs, lows, closes, period = 14) {
    if (highs.length < period + 1) return null;
    
    const trueRanges = [];
    
    for (let i = 1; i < highs.length; i++) {
      const highLow = highs[i] - lows[i];
      const highClose = Math.abs(highs[i] - closes[i - 1]);
      const lowClose = Math.abs(lows[i] - closes[i - 1]);
      
      trueRanges.push(Math.max(highLow, highClose, lowClose));
    }
    
    const recentTR = trueRanges.slice(-period);
    return recentTR.reduce((sum, tr) => sum + tr, 0) / period;
  }
  
  // Update performance metrics
  updatePerformance(trade) {
    this.performance.totalTrades++;
    
    if (trade.pnl > 0) {
      this.performance.winningTrades++;
      this.performance.averageWin = 
        (this.performance.averageWin * (this.performance.winningTrades - 1) + trade.pnl) / 
        this.performance.winningTrades;
    } else {
      this.performance.losingTrades++;
      this.performance.averageLoss = 
        (this.performance.averageLoss * (this.performance.losingTrades - 1) + Math.abs(trade.pnl)) / 
        this.performance.losingTrades;
    }
    
    this.performance.totalPnL += trade.pnl;
    this.performance.winRate = this.performance.winningTrades / this.performance.totalTrades;
    
    // Emit performance update
    if (this.onPerformance) {
      this.onPerformance(this.performance);
    }
  }
  
  // Get strategy configuration
  getConfig() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      symbols: this.symbols,
      lotSize: this.lotSize,
      stopLoss: this.stopLoss,
      takeProfit: this.takeProfit,
      maxPositions: this.maxPositions,
      riskPercentage: this.riskPercentage,
      isActive: this.isActive
    };
  }
  
  // Get strategy performance
  getPerformance() {
    return { ...this.performance };
  }
  
  // Get recent signals
  getRecentSignals(limit = 10) {
    return this.signals.slice(-limit);
  }
  
  // Validate configuration
  validateConfig(config) {
    const required = ['symbols', 'lotSize', 'stopLoss', 'takeProfit'];
    const missing = required.filter(field => !config[field]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required configuration: ${missing.join(', ')}`);
    }
    
    return true;
  }
  
  // Reset strategy
  reset() {
    this.positions = [];
    this.signals = [];
    this.performance = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0,
      winRate: 0,
      averageWin: 0,
      averageLoss: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    };
    
    this.priceData.clear();
    this.indicators.clear();
    
    console.log(`${this.name} strategy reset`);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseStrategy;
}
