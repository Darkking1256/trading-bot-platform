const technicalIndicators = require('technicalindicators');
const moment = require('moment');

class ChartService {
  constructor() {
    this.historicalData = {};
    this.timeframes = {
      '1M': 1,
      '5M': 5,
      '15M': 15,
      '30M': 30,
      '1H': 60,
      '4H': 240,
      '1D': 1440,
      '1W': 10080
    };
  }

  async getChartData(request) {
    const { symbol, timeframe = '1H', limit = 1000 } = request;
    
    // Generate or retrieve historical data
    const data = await this.getHistoricalData(symbol, timeframe, limit);
    
    return {
      symbol,
      timeframe,
      data,
      lastUpdate: Date.now()
    };
  }

  async getHistoricalData(symbol, timeframe = '1H', limit = 1000) {
    const key = `${symbol}_${timeframe}`;
    
    if (!this.historicalData[key]) {
      this.historicalData[key] = this.generateHistoricalData(symbol, timeframe, limit);
    }
    
    return this.historicalData[key];
  }

  generateHistoricalData(symbol, timeframe, count) {
    const data = [];
    const basePrice = this.getBasePrice(symbol);
    let currentPrice = basePrice;
    
    for (let i = 0; i < count; i++) {
      const volatility = this.getVolatility(timeframe);
      const randomChange = (Math.random() - 0.5) * volatility * 2;
      currentPrice += randomChange;

      const open = currentPrice;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close = open + (Math.random() - 0.5) * volatility;

      const timestamp = moment().subtract(count - i, this.timeframes[timeframe], 'minutes').valueOf();

      data.push({
        timestamp,
        open: parseFloat(open.toFixed(5)),
        high: parseFloat(high.toFixed(5)),
        low: parseFloat(low.toFixed(5)),
        close: parseFloat(close.toFixed(5)),
        volume: Math.floor(Math.random() * 1000) + 100
      });
    }

    return data;
  }

  calculateIndicator(request) {
    const { indicator, data, parameters } = request;
    
    switch (indicator) {
      case 'SMA':
        return this.calculateSMA(data, parameters.period);
      case 'EMA':
        return this.calculateEMA(data, parameters.period);
      case 'RSI':
        return this.calculateRSI(data, parameters.period);
      case 'MACD':
        return this.calculateMACD(data, parameters);
      case 'BollingerBands':
        return this.calculateBollingerBands(data, parameters.period, parameters.deviation);
      case 'Stochastic':
        return this.calculateStochastic(data, parameters);
      case 'ATR':
        return this.calculateATR(data, parameters.period);
      default:
        throw new Error(`Indicator ${indicator} not supported`);
    }
  }

  calculateSMA(data, period) {
    const closes = data.map(d => d.close);
    const sma = technicalIndicators.SMA.calculate({ period, values: closes });
    
    return data.map((d, i) => ({
      timestamp: d.timestamp,
      value: sma[i] || null
    }));
  }

  calculateEMA(data, period) {
    const closes = data.map(d => d.close);
    const ema = technicalIndicators.EMA.calculate({ period, values: closes });
    
    return data.map((d, i) => ({
      timestamp: d.timestamp,
      value: ema[i] || null
    }));
  }

  calculateRSI(data, period) {
    const closes = data.map(d => d.close);
    const rsi = technicalIndicators.RSI.calculate({ period, values: closes });
    
    return data.map((d, i) => ({
      timestamp: d.timestamp,
      value: rsi[i] || null
    }));
  }

  calculateMACD(data, parameters) {
    const closes = data.map(d => d.close);
    const macd = technicalIndicators.MACD.calculate({
      values: closes,
      fastPeriod: parameters.fastPeriod || 12,
      slowPeriod: parameters.slowPeriod || 26,
      signalPeriod: parameters.signalPeriod || 9
    });
    
    return data.map((d, i) => ({
      timestamp: d.timestamp,
      MACD: macd[i]?.MACD || null,
      signal: macd[i]?.signal || null,
      histogram: macd[i]?.histogram || null
    }));
  }

  calculateBollingerBands(data, period, deviation) {
    const closes = data.map(d => d.close);
    const bb = technicalIndicators.BollingerBands.calculate({
      period,
      values: closes,
      stdDev: deviation || 2
    });
    
    return data.map((d, i) => ({
      timestamp: d.timestamp,
      upper: bb[i]?.upper || null,
      middle: bb[i]?.middle || null,
      lower: bb[i]?.lower || null
    }));
  }

  calculateStochastic(data, parameters) {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const closes = data.map(d => d.close);
    
    const stochastic = technicalIndicators.Stochastic.calculate({
      high: highs,
      low: lows,
      close: closes,
      period: parameters.period || 14,
      signalPeriod: parameters.signalPeriod || 3
    });
    
    return data.map((d, i) => ({
      timestamp: d.timestamp,
      k: stochastic[i]?.k || null,
      d: stochastic[i]?.d || null
    }));
  }

  calculateATR(data, period) {
    const highs = data.map(d => d.high);
    const lows = data.map(d => d.low);
    const closes = data.map(d => d.close);
    
    const atr = technicalIndicators.ATR.calculate({
      high: highs,
      low: lows,
      close: closes,
      period
    });
    
    return data.map((d, i) => ({
      timestamp: d.timestamp,
      value: atr[i] || null
    }));
  }

  getBasePrice(symbol) {
    const basePrices = {
      'EURUSD': 1.0850, 'GBPUSD': 1.2650, 'USDJPY': 148.50, 'USDCHF': 0.8850,
      'AUDUSD': 0.6550, 'USDCAD': 1.3550, 'NZDUSD': 0.6050, 'EURGBP': 0.8580,
      'EURJPY': 161.20, 'GBPJPY': 187.80, 'AUDCAD': 0.8870, 'AUDCHF': 0.5800,
      'AUDJPY': 97.30, 'AUDNZD': 1.0820, 'CADCHF': 0.6530, 'CADJPY': 109.60,
      'CHFJPY': 167.80, 'EURAUD': 1.6560, 'EURCAD': 1.4700, 'EURCHF': 0.9600,
      'EURNZD': 1.7930, 'GBPAUD': 1.9310, 'GBPCAD': 1.7140, 'GBPCHF': 1.1190,
      'GBPNZD': 2.0900, 'NZDCAD': 0.8200, 'NZDCHF': 0.5350, 'NZDJPY': 89.90
    };
    
    return basePrices[symbol] || 1.0000;
  }

  getVolatility(timeframe) {
    const volatilities = {
      '1M': 0.0001,   // 1 pip
      '5M': 0.0002,   // 2 pips
      '15M': 0.0003,  // 3 pips
      '30M': 0.0004,  // 4 pips
      '1H': 0.0005,   // 5 pips
      '4H': 0.001,    // 10 pips
      '1D': 0.002,    // 20 pips
      '1W': 0.005     // 50 pips
    };
    
    return volatilities[timeframe] || 0.0005;
  }

  getAvailableIndicators() {
    return [
      { name: 'SMA', description: 'Simple Moving Average', parameters: ['period'] },
      { name: 'EMA', description: 'Exponential Moving Average', parameters: ['period'] },
      { name: 'RSI', description: 'Relative Strength Index', parameters: ['period'] },
      { name: 'MACD', description: 'Moving Average Convergence Divergence', parameters: ['fastPeriod', 'slowPeriod', 'signalPeriod'] },
      { name: 'BollingerBands', description: 'Bollinger Bands', parameters: ['period', 'deviation'] },
      { name: 'Stochastic', description: 'Stochastic Oscillator', parameters: ['period', 'signalPeriod'] },
      { name: 'ATR', description: 'Average True Range', parameters: ['period'] }
    ];
  }

  getAvailableTimeframes() {
    return Object.keys(this.timeframes);
  }

  updateHistoricalData(symbol, timeframe, newData) {
    const key = `${symbol}_${timeframe}`;
    if (this.historicalData[key]) {
      this.historicalData[key].push(newData);
      // Keep only last 10000 candles
      if (this.historicalData[key].length > 10000) {
        this.historicalData[key] = this.historicalData[key].slice(-10000);
      }
    }
  }
}

module.exports = ChartService;



