const { SMA, EMA } = require('technicalindicators');

class MovingAverageCrossoverStrategy {
  constructor(config = {}) {
    this.fastPeriod = config.fastPeriod || 10;
    this.slowPeriod = config.slowPeriod || 30;
    this.maType = config.maType || 'SMA'; // 'SMA' or 'EMA'
    this.lotSize = config.lotSize || 0.1;
    this.stopLoss = config.stopLoss || 50; // pips
    this.takeProfit = config.takeProfit || 100; // pips
    this.maxPositions = config.maxPositions || 1;
    this.riskPercentage = config.riskPercentage || 2; // % of account
    
    this.fastMA = [];
    this.slowMA = [];
    this.positions = [];
    this.isActive = false;
  }

  // Calculate moving averages
  calculateMA(prices, period, type = 'SMA') {
    if (type === 'EMA') {
      return EMA.calculate({ period, values: prices });
    } else {
      return SMA.calculate({ period, values: prices });
    }
  }

  // Update strategy with new price data
  update(priceData) {
    const { symbol, bid, ask, timestamp } = priceData;
    
    // Add new price to our data
    if (!this.priceHistory) this.priceHistory = [];
    this.priceHistory.push(bid);
    
    // Keep only recent data (last 1000 prices)
    if (this.priceHistory.length > 1000) {
      this.priceHistory.shift();
    }

    // Calculate moving averages
    if (this.priceHistory.length >= this.slowPeriod) {
      this.fastMA = this.calculateMA(this.priceHistory, this.fastPeriod, this.maType);
      this.slowMA = this.calculateMA(this.priceHistory, this.slowPeriod, this.maType);
      
      // Check for trading signals
      this.checkSignals(symbol, bid, ask, timestamp);
    }
  }

  // Check for buy/sell signals
  checkSignals(symbol, bid, ask, timestamp) {
    if (this.fastMA.length < 2 || this.slowMA.length < 2) return;

    const currentFast = this.fastMA[this.fastMA.length - 1];
    const previousFast = this.fastMA[this.fastMA.length - 2];
    const currentSlow = this.slowMA[this.slowMA.length - 1];
    const previousSlow = this.slowMA[this.slowMA.length - 2];

    // Bullish crossover (fast MA crosses above slow MA)
    if (previousFast <= previousSlow && currentFast > currentSlow) {
      this.generateSignal('BUY', symbol, ask, timestamp);
    }
    
    // Bearish crossover (fast MA crosses below slow MA)
    else if (previousFast >= previousSlow && currentFast < currentSlow) {
      this.generateSignal('SELL', symbol, bid, timestamp);
    }
  }

  // Generate trading signal
  generateSignal(type, symbol, price, timestamp) {
    // Check if we already have max positions
    if (this.positions.length >= this.maxPositions) {
      console.log(`Max positions reached (${this.maxPositions}), skipping signal`);
      return;
    }

    const signal = {
      type,
      symbol,
      price,
      timestamp,
      lotSize: this.lotSize,
      stopLoss: this.calculateStopLoss(type, price),
      takeProfit: this.calculateTakeProfit(type, price),
      strategy: 'MovingAverageCrossover',
      confidence: this.calculateConfidence()
    };

    console.log(`Signal generated: ${type} ${symbol} at ${price}`);
    console.log(`Stop Loss: ${signal.stopLoss}, Take Profit: ${signal.takeProfit}`);
    
    // Emit signal for execution
    if (this.onSignal) {
      this.onSignal(signal);
    }
  }

  // Calculate stop loss price
  calculateStopLoss(type, price) {
    const pipValue = this.getPipValue(price);
    const stopLossPips = this.stopLoss;
    
    if (type === 'BUY') {
      return price - (stopLossPips * pipValue);
    } else {
      return price + (stopLossPips * pipValue);
    }
  }

  // Calculate take profit price
  calculateTakeProfit(type, price) {
    const pipValue = this.getPipValue(price);
    const takeProfitPips = this.takeProfit;
    
    if (type === 'BUY') {
      return price + (takeProfitPips * pipValue);
    } else {
      return price - (takeProfitPips * pipValue);
    }
  }

  // Get pip value based on price
  getPipValue(price) {
    if (price >= 100) return 0.01; // JPY pairs
    return 0.0001; // Other pairs
  }

  // Calculate signal confidence (0-100)
  calculateConfidence() {
    if (this.fastMA.length < 10) return 50;
    
    // Simple confidence based on MA separation
    const currentFast = this.fastMA[this.fastMA.length - 1];
    const currentSlow = this.slowMA[this.slowMA.length - 1];
    const separation = Math.abs(currentFast - currentSlow) / currentSlow * 100;
    
    return Math.min(separation * 10, 95); // Max 95% confidence
  }

  // Start the strategy
  start() {
    this.isActive = true;
    console.log('Moving Average Crossover Strategy started');
  }

  // Stop the strategy
  stop() {
    this.isActive = false;
    console.log('Moving Average Crossover Strategy stopped');
  }

  // Add position tracking
  addPosition(position) {
    this.positions.push(position);
  }

  // Remove position
  removePosition(positionId) {
    this.positions = this.positions.filter(p => p.id !== positionId);
  }

  // Get strategy status
  getStatus() {
    return {
      isActive: this.isActive,
      fastPeriod: this.fastPeriod,
      slowPeriod: this.slowPeriod,
      maType: this.maType,
      currentPositions: this.positions.length,
      maxPositions: this.maxPositions,
      lastFastMA: this.fastMA[this.fastMA.length - 1],
      lastSlowMA: this.slowMA[this.slowMA.length - 1]
    };
  }
}

module.exports = MovingAverageCrossoverStrategy;


