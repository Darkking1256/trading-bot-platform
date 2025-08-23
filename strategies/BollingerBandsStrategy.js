const BaseStrategy = require('../base/BaseStrategy');

class BollingerBandsStrategy extends BaseStrategy {
  constructor(config = {}) {
    super({
      name: 'Bollinger Bands',
      description: 'Trades on Bollinger Bands breakouts and reversals',
      category: 'Volatility',
      ...config
    });

    // Strategy-specific parameters
    this.period = config.period || 20;
    this.stdDev = config.stdDev || 2;
    this.confirmationPeriod = config.confirmationPeriod || 1;
    this.volumeThreshold = config.volumeThreshold || 1.5; // Volume multiplier for confirmation

    // Strategy state
    this.lastSignal = null;
    this.confirmationCount = 0;
    this.lastPosition = null;
  }

  // Initialize strategy
  initialize(config) {
    console.log(`Initializing Bollinger Bands Strategy`);
    console.log(`Period: ${this.period}, StdDev: ${this.stdDev}`);
  }

  // Check for trading signals
  checkSignals(symbol, data) {
    const indicators = this.indicators.get(symbol);
    if (!indicators) return;

    const priceHistory = this.priceData.get(symbol);
    if (!priceHistory || priceHistory.length < this.period) return;

    const closes = priceHistory.map(candle => candle.close);
    const volumes = priceHistory.map(candle => candle.volume || 1000); // Default volume if not available

    // Calculate Bollinger Bands
    const bb = this.calculateBollingerBands(closes, this.period, this.stdDev);
    if (!bb) return;

    const currentPrice = data.close;
    const currentVolume = data.volume || 1000;
    const averageVolume = this.calculateAverageVolume(volumes, this.period);

    // Get current Bollinger Bands values
    const upperBand = bb.upper[bb.upper.length - 1];
    const middleBand = bb.middle[bb.middle.length - 1];
    const lowerBand = bb.lower[bb.lower.length - 1];

    // Get previous values for comparison
    const prevUpperBand = bb.upper[bb.upper.length - 2];
    const prevMiddleBand = bb.middle[bb.middle.length - 2];
    const prevLowerBand = bb.lower[bb.lower.length - 2];

    // Check for breakout signals
    this.checkBreakoutSignals(symbol, currentPrice, upperBand, lowerBand, currentVolume, averageVolume);

    // Check for reversal signals
    this.checkReversalSignals(symbol, currentPrice, upperBand, middleBand, lowerBand, 
                             prevUpperBand, prevMiddleBand, prevLowerBand, currentVolume, averageVolume);

    // Check for squeeze signals
    this.checkSqueezeSignals(symbol, bb, currentPrice, currentVolume, averageVolume);
  }

  // Check for breakout signals
  checkBreakoutSignals(symbol, price, upperBand, lowerBand, volume, avgVolume) {
    const volumeConfirmation = volume > avgVolume * this.volumeThreshold;

    // Bullish breakout (price breaks above upper band with volume)
    if (price > upperBand && volumeConfirmation) {
      this.confirmationCount++;

      if (this.confirmationCount >= this.confirmationPeriod) {
        const confidence = this.calculateBreakoutConfidence(price, upperBand, volume, avgVolume);
        const reason = `Bullish Breakout: Price broke above upper Bollinger Band with high volume`;

        this.generateSignal('BUY', symbol, price, confidence, reason);
        this.lastSignal = 'BUY';
        this.confirmationCount = 0;
      }
    }
    // Bearish breakout (price breaks below lower band with volume)
    else if (price < lowerBand && volumeConfirmation) {
      this.confirmationCount++;

      if (this.confirmationCount >= this.confirmationPeriod) {
        const confidence = this.calculateBreakoutConfidence(price, lowerBand, volume, avgVolume);
        const reason = `Bearish Breakout: Price broke below lower Bollinger Band with high volume`;

        this.generateSignal('SELL', symbol, price, confidence, reason);
        this.lastSignal = 'SELL';
        this.confirmationCount = 0;
      }
    }
    // Reset confirmation count if no breakout
    else {
      this.confirmationCount = 0;
    }
  }

  // Check for reversal signals
  checkReversalSignals(symbol, price, upperBand, middleBand, lowerBand, 
                       prevUpperBand, prevMiddleBand, prevLowerBand, volume, avgVolume) {
    const volumeConfirmation = volume > avgVolume * this.volumeThreshold;

    // Bullish reversal (price bounces off lower band and moves toward middle)
    if (price >= lowerBand && price < middleBand && volumeConfirmation) {
      const confidence = this.calculateReversalConfidence(price, lowerBand, middleBand, volume, avgVolume);
      const reason = `Bullish Reversal: Price bouncing off lower Bollinger Band`;

      this.generateSignal('BUY', symbol, price, confidence, reason);
      this.lastSignal = 'BUY';
    }
    // Bearish reversal (price bounces off upper band and moves toward middle)
    else if (price <= upperBand && price > middleBand && volumeConfirmation) {
      const confidence = this.calculateReversalConfidence(price, upperBand, middleBand, volume, avgVolume);
      const reason = `Bearish Reversal: Price bouncing off upper Bollinger Band`;

      this.generateSignal('SELL', symbol, price, confidence, reason);
      this.lastSignal = 'SELL';
    }
  }

  // Check for squeeze signals (bands contracting)
  checkSqueezeSignals(symbol, bb, price, volume, avgVolume) {
    const recentBands = bb.upper.slice(-5); // Last 5 periods
    const bandWidth = this.calculateBandWidth(recentBands, bb.lower.slice(-5));
    
    // Check if bands are contracting (squeeze)
    const isSqueeze = this.isBandSqueeze(bandWidth);
    
    if (isSqueeze && volume > avgVolume * 1.2) {
      const confidence = 0.7; // Moderate confidence for squeeze signals
      const reason = `Bollinger Band Squeeze: Bands contracting, potential breakout ahead`;

      // Generate a neutral signal to indicate squeeze
      this.generateSignal('NEUTRAL', symbol, price, confidence, reason);
    }
  }

  // Calculate Bollinger Bands
  calculateBollingerBands(data, period, stdDev) {
    if (data.length < period) return null;

    const sma = this.calculateSMA(data, period);
    if (!sma) return null;

    const upper = [];
    const middle = [];
    const lower = [];

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      
      // Calculate standard deviation
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      const upperBand = mean + (standardDeviation * stdDev);
      const lowerBand = mean - (standardDeviation * stdDev);
      
      upper.push(upperBand);
      middle.push(mean);
      lower.push(lowerBand);
    }

    return { upper, middle, lower };
  }

  // Calculate average volume
  calculateAverageVolume(volumes, period) {
    if (volumes.length < period) return 1000;
    
    const recentVolumes = volumes.slice(-period);
    return recentVolumes.reduce((sum, vol) => sum + vol, 0) / period;
  }

  // Calculate band width
  calculateBandWidth(upperBands, lowerBands) {
    if (upperBands.length !== lowerBands.length) return [];
    
    return upperBands.map((upper, i) => upper - lowerBands[i]);
  }

  // Check if bands are in squeeze (contracting)
  isBandSqueeze(bandWidth) {
    if (bandWidth.length < 3) return false;
    
    // Check if recent band widths are decreasing
    const recent = bandWidth.slice(-3);
    return recent[2] < recent[1] && recent[1] < recent[0];
  }

  // Calculate confidence for breakout signals
  calculateBreakoutConfidence(price, band, volume, avgVolume) {
    const priceDistance = Math.abs(price - band) / band;
    const volumeRatio = volume / avgVolume;
    
    // Higher confidence for stronger breakouts and higher volume
    const confidence = Math.min(0.95, 0.5 + (priceDistance * 2) + (volumeRatio - 1) * 0.1);
    
    return Math.max(0.3, confidence);
  }

  // Calculate confidence for reversal signals
  calculateReversalConfidence(price, extremeBand, middleBand, volume, avgVolume) {
    const distanceFromExtreme = Math.abs(price - extremeBand) / extremeBand;
    const distanceToMiddle = Math.abs(price - middleBand) / middleBand;
    const volumeRatio = volume / avgVolume;
    
    // Higher confidence for stronger bounces and higher volume
    const confidence = Math.min(0.9, 0.4 + (1 - distanceFromExtreme) + (volumeRatio - 1) * 0.1);
    
    return Math.max(0.3, confidence);
  }

  // Get strategy parameters for configuration
  getParameters() {
    return {
      period: {
        type: 'number',
        default: this.period,
        min: 10,
        max: 50,
        description: 'Bollinger Bands calculation period'
      },
      stdDev: {
        type: 'number',
        default: this.stdDev,
        min: 1,
        max: 3,
        description: 'Standard deviation multiplier'
      },
      confirmationPeriod: {
        type: 'number',
        default: this.confirmationPeriod,
        min: 1,
        max: 5,
        description: 'Number of confirmations required'
      },
      volumeThreshold: {
        type: 'number',
        default: this.volumeThreshold,
        min: 1.0,
        max: 3.0,
        description: 'Volume multiplier for confirmation'
      }
    };
  }

  // Get strategy statistics
  getStatistics() {
    return {
      ...super.getStatistics(),
      period: this.period,
      stdDev: this.stdDev,
      confirmationPeriod: this.confirmationPeriod,
      volumeThreshold: this.volumeThreshold,
      lastSignal: this.lastSignal
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BollingerBandsStrategy;
}
