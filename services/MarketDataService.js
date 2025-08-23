const moment = require('moment');

class MarketDataService {
  constructor() {
    this.prices = {};
    this.simulationInterval = null;
    this.basePrices = {
      'EURUSD': 1.0850, 'GBPUSD': 1.2650, 'USDJPY': 148.50, 'USDCHF': 0.8850,
      'AUDUSD': 0.6550, 'USDCAD': 1.3550, 'NZDUSD': 0.6050, 'EURGBP': 0.8580,
      'EURJPY': 161.20, 'GBPJPY': 187.80, 'AUDCAD': 0.8870, 'AUDCHF': 0.5800,
      'AUDJPY': 97.30, 'AUDNZD': 1.0820, 'CADCHF': 0.6530, 'CADJPY': 109.60,
      'CHFJPY': 167.80, 'EURAUD': 1.6560, 'EURCAD': 1.4700, 'EURCHF': 0.9600,
      'EURNZD': 1.7930, 'GBPAUD': 1.9310, 'GBPCAD': 1.7140, 'GBPCHF': 1.1190,
      'GBPNZD': 2.0900, 'NZDCAD': 0.8200, 'NZDCHF': 0.5350, 'NZDJPY': 89.90
    };
    
    // Initialize prices
    Object.keys(this.basePrices).forEach(symbol => {
      this.prices[symbol] = {
        bid: this.basePrices[symbol],
        ask: this.basePrices[symbol] + 0.0002,
        timestamp: Date.now()
      };
    });
  }

  getCurrentPrice(symbol) {
    return this.prices[symbol] || null;
  }

  getAllPrices() {
    return this.prices;
  }

  startSimulation(io) {
    this.simulationInterval = setInterval(() => {
      Object.keys(this.prices).forEach(symbol => {
        // Simulate price movement
        const basePrice = this.basePrices[symbol];
        const volatility = 0.0001; // 1 pip volatility
        const randomChange = (Math.random() - 0.5) * volatility * 2;
        
        const newBid = basePrice + randomChange;
        const newAsk = newBid + 0.0002; // 2 pip spread
        
        this.prices[symbol] = {
          bid: newBid,
          ask: newAsk,
          timestamp: Date.now()
        };

        // Emit price update to all clients subscribed to this symbol
        io.to(symbol).emit('priceUpdate', {
          symbol,
          data: this.prices[symbol]
        });
      });
    }, 1000); // Update every second

    console.log('Market data simulation started');
  }

  stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
      console.log('Market data simulation stopped');
    }
  }

  generateOHLC(symbol, timeframe = '1H', count = 100) {
    const data = [];
    const basePrice = this.basePrices[symbol];
    let currentPrice = basePrice;

    for (let i = 0; i < count; i++) {
      const volatility = 0.001; // 10 pip volatility
      const randomChange = (Math.random() - 0.5) * volatility * 2;
      currentPrice += randomChange;

      const open = currentPrice;
      const high = open + Math.random() * volatility;
      const low = open - Math.random() * volatility;
      const close = open + (Math.random() - 0.5) * volatility;

      const timestamp = moment().subtract(count - i, timeframe).valueOf();

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

  getSpread(symbol) {
    const price = this.prices[symbol];
    if (price) {
      return (price.ask - price.bid) * 10000; // Convert to pips
    }
    return 0;
  }

  getPipValue(symbol, lotSize = 0.1) {
    // Simplified pip value calculation
    const price = this.prices[symbol];
    if (price) {
      return lotSize * 10; // Standard lot = 100,000 units, so 0.1 lot = 10,000 units
    }
    return 0;
  }
}

module.exports = MarketDataService;



