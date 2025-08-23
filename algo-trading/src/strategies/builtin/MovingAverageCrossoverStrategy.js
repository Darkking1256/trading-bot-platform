// Moving Average Crossover Strategy
const BaseStrategy = require('../base/BaseStrategy');

class MovingAverageCrossoverStrategy extends BaseStrategy {
  constructor(config = {}) {
    super({
      name: 'Moving Average Crossover',
      description: 'Trades on fast and slow moving average crossovers',
      category: 'Trend Following',
      ...config
    });
    
    // Strategy-specific parameters
    this.fastPeriod = config.fastPeriod || 10;
    this.slowPeriod = config.slowPeriod || 30;
    this.maType = config.maType || 'SMA'; // 'SMA' or 'EMA'
    this.confirmationPeriod = config.confirmationPeriod || 1;
    
    // Strategy state
    this.lastSignal = null;
    this.confirmationCount = 0;
  }
  
  // Initialize strategy
  initialize(config) {
    console.log(`Initializing Moving Average Crossover Strategy`);
    console.log(`Fast Period: ${this.fastPeriod}, Slow Period: ${this.slowPeriod}, MA Type: ${this.maType}`);
  }
  
  // Check for trading signals
  checkSignals(symbol, data) {
    const indicators = this.indicators.get(symbol);
    if (!indicators) return;
    
    const priceHistory = this.priceData.get(symbol);
    if (!priceHistory || priceHistory.length < this.slowPeriod) return;
    
    const closes = priceHistory.map(candle => candle.close);
    
    // Calculate moving averages
    const fastMA = this.maType === 'EMA' 
      ? this.calculateEMA(closes, this.fastPeriod)
      : this.calculateSMA(closes, this.fastPeriod);
    
    const slowMA = this.maType === 'EMA'
      ? this.calculateEMA(closes, this.slowPeriod)
      : this.calculateSMA(closes, this.slowPeriod);
    
    if (!fastMA || !slowMA) return;
    
    // Get previous values for crossover detection
    const prevCloses = closes.slice(0, -1);
    const prevFastMA = this.maType === 'EMA'
      ? this.calculateEMA(prevCloses, this.fastPeriod)
      : this.calculateSMA(prevCloses, this.fastPeriod);
    
    const prevSlowMA = this.maType === 'EMA'
      ? this.calculateEMA(prevCloses, this.slowPeriod)
      : this.calculateSMA(prevCloses, this.slowPeriod);
    
    if (!prevFastMA || !prevSlowMA) return;
    
    const currentPrice = data.close;
    
    // Check for bullish crossover (fast MA crosses above slow MA)
    if (prevFastMA <= prevSlowMA && fastMA > slowMA) {
      this.confirmationCount++;
      
      if (this.confirmationCount >= this.confirmationPeriod) {
        const confidence = this.calculateConfidence(fastMA, slowMA, currentPrice);
        const reason = `${this.maType} Crossover: Fast(${this.fastPeriod}) crossed above Slow(${this.slowPeriod})`;
        
        this.generateSignal('BUY', symbol, currentPrice, confidence, reason);
        this.lastSignal = 'BUY';
        this.confirmationCount = 0;
      }
    }
    // Check for bearish crossover (fast MA crosses below slow MA)
    else if (prevFastMA >= prevSlowMA && fastMA < slowMA) {
      this.confirmationCount++;
      
      if (this.confirmationCount >= this.confirmationPeriod) {
        const confidence = this.calculateConfidence(fastMA, slowMA, currentPrice);
        const reason = `${this.maType} Crossover: Fast(${this.fastPeriod}) crossed below Slow(${this.slowPeriod})`;
        
        this.generateSignal('SELL', symbol, currentPrice, confidence, reason);
        this.lastSignal = 'SELL';
        this.confirmationCount = 0;
      }
    }
    // Reset confirmation count if no crossover
    else {
      this.confirmationCount = 0;
    }
  }
  
  // Calculate signal confidence based on MA separation and trend strength
  calculateConfidence(fastMA, slowMA, currentPrice) {
    // Base confidence
    let confidence = 0.5;
    
    // MA separation factor (wider separation = higher confidence)
    const maSeparation = Math.abs(fastMA - slowMA) / slowMA;
    confidence += Math.min(maSeparation * 10, 0.3);
    
    // Trend strength factor
    const trendStrength = Math.abs(currentPrice - slowMA) / slowMA;
    confidence += Math.min(trendStrength * 5, 0.2);
    
    // Ensure confidence is between 0.1 and 0.95
    return Math.max(0.1, Math.min(0.95, confidence));
  }
  
  // Get strategy parameters
  getParameters() {
    return {
      fastPeriod: this.fastPeriod,
      slowPeriod: this.slowPeriod,
      maType: this.maType,
      confirmationPeriod: this.confirmationPeriod
    };
  }
  
  // Update strategy parameters
  updateParameters(params) {
    if (params.fastPeriod) this.fastPeriod = params.fastPeriod;
    if (params.slowPeriod) this.slowPeriod = params.slowPeriod;
    if (params.maType) this.maType = params.maType;
    if (params.confirmationPeriod) this.confirmationPeriod = params.confirmationPeriod;
    
    console.log('Moving Average Crossover parameters updated:', this.getParameters());
  }
  
  // Get strategy description
  static get description() {
    return 'Trades on fast and slow moving average crossovers. Generates buy signals when fast MA crosses above slow MA, and sell signals when fast MA crosses below slow MA.';
  }
  
  // Get default parameters
  static get parameters() {
    return [
      {
        name: 'fastPeriod',
        type: 'number',
        default: 10,
        min: 5,
        max: 50,
        description: 'Fast moving average period'
      },
      {
        name: 'slowPeriod',
        type: 'number',
        default: 30,
        min: 10,
        max: 100,
        description: 'Slow moving average period'
      },
      {
        name: 'maType',
        type: 'select',
        default: 'SMA',
        options: ['SMA', 'EMA'],
        description: 'Moving average type'
      },
      {
        name: 'confirmationPeriod',
        type: 'number',
        default: 1,
        min: 1,
        max: 5,
        description: 'Number of candles to confirm crossover'
      }
    ];
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MovingAverageCrossoverStrategy;
}
