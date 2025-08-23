const BaseStrategy = require('../base/BaseStrategy');

class RSIDivergenceStrategy extends BaseStrategy {
  constructor(config = {}) {
    super({
      name: 'RSI Divergence',
      description: 'Trades on RSI divergence patterns',
      category: 'Mean Reversion',
      ...config
    });

    // Strategy-specific parameters
    this.rsiPeriod = config.rsiPeriod || 14;
    this.overbought = config.overbought || 70;
    this.oversold = config.oversold || 30;
    this.divergenceLookback = config.divergenceLookback || 10;
    this.confirmationPeriod = config.confirmationPeriod || 2;

    // Strategy state
    this.lastSignal = null;
    this.confirmationCount = 0;
    this.priceHighs = [];
    this.priceLows = [];
    this.rsiHighs = [];
    this.rsiLows = [];
  }

  // Initialize strategy
  initialize(config) {
    console.log(`Initializing RSI Divergence Strategy`);
    console.log(`RSI Period: ${this.rsiPeriod}, Overbought: ${this.overbought}, Oversold: ${this.oversold}`);
  }

  // Check for trading signals
  checkSignals(symbol, data) {
    const indicators = this.indicators.get(symbol);
    if (!indicators) return;

    const priceHistory = this.priceData.get(symbol);
    if (!priceHistory || priceHistory.length < this.rsiPeriod + this.divergenceLookback) return;

    const closes = priceHistory.map(candle => candle.close);
    const highs = priceHistory.map(candle => candle.high);
    const lows = priceHistory.map(candle => candle.low);

    // Calculate RSI
    const rsi = this.calculateRSI(closes, this.rsiPeriod);
    if (!rsi) return;

    const currentPrice = data.close;
    const currentRSI = rsi[rsi.length - 1];

    // Update price and RSI extremes
    this.updateExtremes(highs, lows, rsi);

    // Check for bullish divergence (price makes lower low, RSI makes higher low)
    if (this.checkBullishDivergence()) {
      this.confirmationCount++;

      if (this.confirmationCount >= this.confirmationPeriod) {
        const confidence = this.calculateConfidence(currentRSI, this.oversold);
        const reason = `Bullish RSI Divergence: Price lower low, RSI higher low at ${currentRSI.toFixed(2)}`;

        this.generateSignal('BUY', symbol, currentPrice, confidence, reason);
        this.lastSignal = 'BUY';
        this.confirmationCount = 0;
      }
    }
    // Check for bearish divergence (price makes higher high, RSI makes lower high)
    else if (this.checkBearishDivergence()) {
      this.confirmationCount++;

      if (this.confirmationCount >= this.confirmationPeriod) {
        const confidence = this.calculateConfidence(currentRSI, this.overbought);
        const reason = `Bearish RSI Divergence: Price higher high, RSI lower high at ${currentRSI.toFixed(2)}`;

        this.generateSignal('SELL', symbol, currentPrice, confidence, reason);
        this.lastSignal = 'SELL';
        this.confirmationCount = 0;
      }
    }
    // Reset confirmation count if no divergence
    else {
      this.confirmationCount = 0;
    }
  }

  // Update price and RSI extremes
  updateExtremes(highs, lows, rsi) {
    // Find recent highs and lows in price
    const recentHighs = this.findExtremes(highs, 'high', this.divergenceLookback);
    const recentLows = this.findExtremes(lows, 'low', this.divergenceLookback);

    // Find recent highs and lows in RSI
    const recentRSIHighs = this.findExtremes(rsi, 'high', this.divergenceLookback);
    const recentRSILows = this.findExtremes(rsi, 'low', this.divergenceLookback);

    // Update arrays (keep only recent extremes)
    this.priceHighs = recentHighs;
    this.priceLows = recentLows;
    this.rsiHighs = recentRSIHighs;
    this.rsiLows = recentRSILows;
  }

  // Find extremes (highs or lows) in data
  findExtremes(data, type, lookback) {
    const extremes = [];
    const startIndex = Math.max(0, data.length - lookback);

    for (let i = startIndex; i < data.length; i++) {
      const current = data[i];
      let isExtreme = false;

      if (type === 'high') {
        // Check if current point is a local high
        const left = i > 0 ? data[i - 1] : current;
        const right = i < data.length - 1 ? data[i + 1] : current;
        isExtreme = current >= left && current >= right;
      } else {
        // Check if current point is a local low
        const left = i > 0 ? data[i - 1] : current;
        const right = i < data.length - 1 ? data[i + 1] : current;
        isExtreme = current <= left && current <= right;
      }

      if (isExtreme) {
        extremes.push({
          value: current,
          index: i,
          timestamp: Date.now() - (data.length - 1 - i) * 60000 // Approximate timestamp
        });
      }
    }

    return extremes;
  }

  // Check for bullish divergence
  checkBullishDivergence() {
    if (this.priceLows.length < 2 || this.rsiLows.length < 2) return false;

    const latestPriceLow = this.priceLows[this.priceLows.length - 1];
    const previousPriceLow = this.priceLows[this.priceLows.length - 2];
    const latestRSILow = this.rsiLows[this.rsiLows.length - 1];
    const previousRSILow = this.rsiLows[this.rsiLows.length - 2];

    // Check if price made a lower low but RSI made a higher low
    const priceLowerLow = latestPriceLow.value < previousPriceLow.value;
    const rsiHigherLow = latestRSILow.value > previousRSILow.value;

    // Additional condition: RSI should be in oversold territory
    const rsiOversold = latestRSILow.value < this.oversold;

    return priceLowerLow && rsiHigherLow && rsiOversold;
  }

  // Check for bearish divergence
  checkBearishDivergence() {
    if (this.priceHighs.length < 2 || this.rsiHighs.length < 2) return false;

    const latestPriceHigh = this.priceHighs[this.priceHighs.length - 1];
    const previousPriceHigh = this.priceHighs[this.priceHighs.length - 2];
    const latestRSIHigh = this.rsiHighs[this.rsiHighs.length - 1];
    const previousRSIHigh = this.rsiHighs[this.rsiHighs.length - 2];

    // Check if price made a higher high but RSI made a lower high
    const priceHigherHigh = latestPriceHigh.value > previousPriceHigh.value;
    const rsiLowerHigh = latestRSIHigh.value < previousRSIHigh.value;

    // Additional condition: RSI should be in overbought territory
    const rsiOverbought = latestRSIHigh.value > this.overbought;

    return priceHigherHigh && rsiLowerHigh && rsiOverbought;
  }

  // Calculate confidence based on RSI value and extreme levels
  calculateConfidence(rsiValue, extremeLevel) {
    const distance = Math.abs(rsiValue - extremeLevel);
    const maxDistance = extremeLevel === this.overbought ? 100 - extremeLevel : extremeLevel;
    const confidence = Math.max(0.3, 1 - (distance / maxDistance));
    
    return Math.min(0.95, confidence);
  }

  // Get strategy parameters for configuration
  getParameters() {
    return {
      rsiPeriod: {
        type: 'number',
        default: this.rsiPeriod,
        min: 10,
        max: 30,
        description: 'RSI calculation period'
      },
      overbought: {
        type: 'number',
        default: this.overbought,
        min: 60,
        max: 80,
        description: 'Overbought threshold'
      },
      oversold: {
        type: 'number',
        default: this.oversold,
        min: 20,
        max: 40,
        description: 'Oversold threshold'
      },
      divergenceLookback: {
        type: 'number',
        default: this.divergenceLookback,
        min: 5,
        max: 20,
        description: 'Number of bars to look back for divergence'
      },
      confirmationPeriod: {
        type: 'number',
        default: this.confirmationPeriod,
        min: 1,
        max: 5,
        description: 'Number of confirmations required'
      }
    };
  }

  // Get strategy statistics
  getStatistics() {
    return {
      ...super.getStatistics(),
      rsiPeriod: this.rsiPeriod,
      overbought: this.overbought,
      oversold: this.oversold,
      divergenceLookback: this.divergenceLookback,
      confirmationPeriod: this.confirmationPeriod,
      priceHighs: this.priceHighs.length,
      priceLows: this.priceLows.length,
      rsiHighs: this.rsiHighs.length,
      rsiLows: this.rsiLows.length
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RSIDivergenceStrategy;
}
