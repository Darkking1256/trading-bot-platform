// Socket.io will be injected from server
let io = null;

const setIO = (socketIO) => {
  io = socketIO;
};

class TradingService {
  constructor() {
    this.isRunning = false;
    this.currentStrategy = null;
    this.trades = [];
    this.positions = [];
    this.balance = 10000; // Starting balance
    this.performance = {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnL: 0,
      maxDrawdown: 0,
      sharpeRatio: 0
    };
    this.strategies = {
      'Moving Average Crossover': this.movingAverageCrossover.bind(this),
      'RSI Strategy': this.rsiStrategy.bind(this),
      'MACD Strategy': this.macdStrategy.bind(this),
      'Bollinger Bands': this.bollingerBandsStrategy.bind(this),
      'Random Walk': this.randomWalkStrategy.bind(this)
    };
    this.priceHistory = {};
    this.indicators = {};
  }

  // Initialize the service
  initialize() {
    console.log('🚀 Trading Service initialized');
    this.startPriceUpdates();
  }

  // Start trading with a specific strategy
  startTrading(strategyName, parameters = {}) {
    if (this.isRunning) {
      this.stopTrading();
    }

    this.currentStrategy = strategyName;
    this.isRunning = true;
    
    console.log(`📈 Starting ${strategyName} strategy`);
    
    // Emit status update
    io.emit('tradingStatus', {
      isRunning: true,
      strategy: strategyName,
      parameters
    });

    // Start strategy execution
    this.executeStrategy(strategyName, parameters);
  }

  // Stop trading
  stopTrading() {
    this.isRunning = false;
    this.currentStrategy = null;
    
    console.log('⏹️ Trading stopped');
    
    // Emit status update
    io.emit('tradingStatus', {
      isRunning: false,
      strategy: null
    });
  }

  // Execute the selected strategy
  executeStrategy(strategyName, parameters) {
    if (!this.isRunning) return;

    const strategy = this.strategies[strategyName];
    if (!strategy) {
      console.error(`❌ Strategy ${strategyName} not found`);
      return;
    }

    // Execute strategy and get signal
    const signal = strategy(parameters);
    
    if (signal) {
      this.executeTrade(signal);
    }

    // Schedule next execution
    setTimeout(() => {
      if (this.isRunning) {
        this.executeStrategy(strategyName, parameters);
      }
    }, 5000); // Execute every 5 seconds
  }

  // Execute a trade based on signal
  executeTrade(signal) {
    const { action, symbol, price, volume = 0.1, reason } = signal;
    
    // Check if we have enough balance
    const requiredMargin = price * volume * 100000 * 0.01; // 1% margin
    if (this.balance < requiredMargin) {
      console.log(`❌ Insufficient balance for trade: ${action} ${symbol}`);
      return;
    }

    // Create trade
    const trade = {
      id: `trade_${Date.now()}`,
      action,
      symbol,
      price,
      volume,
      timestamp: new Date().toISOString(),
      reason,
      status: 'executed'
    };

    // Add to trades history
    this.trades.push(trade);

    // Update balance
    this.balance -= requiredMargin;

    // Create or update position
    this.updatePosition(trade);

    // Update performance metrics
    this.updatePerformance();

    // Emit trade update
    io.emit('tradeExecuted', {
      trade,
      balance: this.balance,
      performance: this.performance
    });

    console.log(`✅ Trade executed: ${action} ${symbol} at ${price}`);
  }

  // Update position based on trade
  updatePosition(trade) {
    const existingPosition = this.positions.find(p => p.symbol === trade.symbol);
    
    if (existingPosition) {
      // Close existing position
      const pnl = (trade.price - existingPosition.openPrice) * 
                  (existingPosition.type === 'BUY' ? 1 : -1) * 
                  existingPosition.volume * 100000;
      
      existingPosition.closePrice = trade.price;
      existingPosition.closeTime = trade.timestamp;
      existingPosition.pnl = pnl;
      existingPosition.status = 'closed';
      
      // Update balance with P&L
      this.balance += pnl;
      
      // Remove from open positions
      this.positions = this.positions.filter(p => p.symbol !== trade.symbol);
    } else {
      // Open new position
      const position = {
        id: `pos_${Date.now()}`,
        symbol: trade.symbol,
        type: trade.action,
        openPrice: trade.price,
        volume: trade.volume,
        openTime: trade.timestamp,
        status: 'open',
        pnl: 0
      };
      
      this.positions.push(position);
    }
  }

  // Update performance metrics
  updatePerformance() {
    const closedTrades = this.trades.filter(t => t.status === 'executed');
    const winningTrades = closedTrades.filter(t => {
      const position = this.positions.find(p => p.symbol === t.symbol && p.status === 'closed');
      return position && position.pnl > 0;
    });

    this.performance = {
      totalTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: closedTrades.length - winningTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalPnL: this.positions.reduce((sum, p) => sum + (p.pnl || 0), 0),
      maxDrawdown: this.calculateMaxDrawdown(),
      sharpeRatio: this.calculateSharpeRatio()
    };
  }

  // Calculate maximum drawdown
  calculateMaxDrawdown() {
    let maxDrawdown = 0;
    let peak = 10000; // Starting balance
    
    this.trades.forEach(trade => {
      const position = this.positions.find(p => p.symbol === trade.symbol);
      if (position && position.status === 'closed') {
        const currentBalance = this.balance + position.pnl;
        if (currentBalance > peak) {
          peak = currentBalance;
        }
        const drawdown = (peak - currentBalance) / peak * 100;
        if (drawdown > maxDrawdown) {
          maxDrawdown = drawdown;
        }
      }
    });
    
    return maxDrawdown;
  }

  // Calculate Sharpe ratio
  calculateSharpeRatio() {
    if (this.trades.length < 2) return 0;
    
    const returns = this.trades.map(trade => {
      const position = this.positions.find(p => p.symbol === trade.symbol);
      return position && position.status === 'closed' ? position.pnl : 0;
    }).filter(r => r !== 0);
    
    if (returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev > 0 ? avgReturn / stdDev : 0;
  }

  // Strategy implementations
  movingAverageCrossover(parameters) {
    const { symbol = 'EURUSD', shortPeriod = 10, longPeriod = 20 } = parameters;
    const prices = this.getPriceHistory(symbol);
    
    if (prices.length < longPeriod) return null;
    
    const shortMA = this.calculateSMA(prices, shortPeriod);
    const longMA = this.calculateSMA(prices, longPeriod);
    
    const currentPrice = prices[prices.length - 1];
    const previousShortMA = this.calculateSMA(prices.slice(0, -1), shortPeriod);
    const previousLongMA = this.calculateSMA(prices.slice(0, -1), longPeriod);
    
    // Buy signal: short MA crosses above long MA
    if (shortMA > longMA && previousShortMA <= previousLongMA) {
      return {
        action: 'BUY',
        symbol,
        price: currentPrice,
        reason: `MA Crossover: ${shortPeriod}MA > ${longPeriod}MA`
      };
    }
    
    // Sell signal: short MA crosses below long MA
    if (shortMA < longMA && previousShortMA >= previousLongMA) {
      return {
        action: 'SELL',
        symbol,
        price: currentPrice,
        reason: `MA Crossover: ${shortPeriod}MA < ${longPeriod}MA`
      };
    }
    
    return null;
  }

  rsiStrategy(parameters) {
    const { symbol = 'EURUSD', period = 14, overbought = 70, oversold = 30 } = parameters;
    const prices = this.getPriceHistory(symbol);
    
    if (prices.length < period) return null;
    
    const rsi = this.calculateRSI(prices, period);
    const currentPrice = prices[prices.length - 1];
    
    // Buy signal: RSI below oversold level
    if (rsi < oversold) {
      return {
        action: 'BUY',
        symbol,
        price: currentPrice,
        reason: `RSI oversold: ${rsi.toFixed(2)}`
      };
    }
    
    // Sell signal: RSI above overbought level
    if (rsi > overbought) {
      return {
        action: 'SELL',
        symbol,
        price: currentPrice,
        reason: `RSI overbought: ${rsi.toFixed(2)}`
      };
    }
    
    return null;
  }

  macdStrategy(parameters) {
    const { symbol = 'EURUSD', fastPeriod = 12, slowPeriod = 26, signalPeriod = 9 } = parameters;
    const prices = this.getPriceHistory(symbol);
    
    if (prices.length < slowPeriod) return null;
    
    const { macd, signal } = this.calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod);
    const currentPrice = prices[prices.length - 1];
    
    // Buy signal: MACD crosses above signal line
    if (macd > signal && this.getPreviousMACD(prices, fastPeriod, slowPeriod, signalPeriod).macd <= this.getPreviousMACD(prices, fastPeriod, slowPeriod, signalPeriod).signal) {
      return {
        action: 'BUY',
        symbol,
        price: currentPrice,
        reason: `MACD bullish crossover: ${macd.toFixed(4)} > ${signal.toFixed(4)}`
      };
    }
    
    // Sell signal: MACD crosses below signal line
    if (macd < signal && this.getPreviousMACD(prices, fastPeriod, slowPeriod, signalPeriod).macd >= this.getPreviousMACD(prices, fastPeriod, slowPeriod, signalPeriod).signal) {
      return {
        action: 'SELL',
        symbol,
        price: currentPrice,
        reason: `MACD bearish crossover: ${macd.toFixed(4)} < ${signal.toFixed(4)}`
      };
    }
    
    return null;
  }

  bollingerBandsStrategy(parameters) {
    const { symbol = 'EURUSD', period = 20, stdDev = 2 } = parameters;
    const prices = this.getPriceHistory(symbol);
    
    if (prices.length < period) return null;
    
    const { upper, lower } = this.calculateBollingerBands(prices, period, stdDev);
    const currentPrice = prices[prices.length - 1];
    
    // Buy signal: price touches lower band
    if (currentPrice <= lower) {
      return {
        action: 'BUY',
        symbol,
        price: currentPrice,
        reason: `Bollinger Bands: Price at lower band ${lower.toFixed(4)}`
      };
    }
    
    // Sell signal: price touches upper band
    if (currentPrice >= upper) {
      return {
        action: 'SELL',
        symbol,
        price: currentPrice,
        reason: `Bollinger Bands: Price at upper band ${upper.toFixed(4)}`
      };
    }
    
    return null;
  }

  randomWalkStrategy(parameters) {
    const { symbol = 'EURUSD' } = parameters;
    const currentPrice = this.getCurrentPrice(symbol);
    
    if (!currentPrice) return null;
    
    // Random trading decision (for demonstration)
    const random = Math.random();
    
    if (random < 0.1) { // 10% chance to buy
      return {
        action: 'BUY',
        symbol,
        price: currentPrice,
        reason: 'Random Walk: Buy signal'
      };
    } else if (random > 0.9) { // 10% chance to sell
      return {
        action: 'SELL',
        symbol,
        price: currentPrice,
        reason: 'Random Walk: Sell signal'
      };
    }
    
    return null;
  }

  // Technical indicator calculations
  calculateSMA(prices, period) {
    const slice = prices.slice(-period);
    return slice.reduce((sum, price) => sum + price, 0) / slice.length;
  }

  calculateRSI(prices, period) {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
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

  calculateMACD(prices, fastPeriod, slowPeriod, signalPeriod) {
    const fastEMA = this.calculateEMA(prices, fastPeriod);
    const slowEMA = this.calculateEMA(prices, slowPeriod);
    const macd = fastEMA - slowEMA;
    
    // Calculate signal line (EMA of MACD)
    const macdValues = [];
    for (let i = slowPeriod; i < prices.length; i++) {
      const fastEMA = this.calculateEMA(prices.slice(0, i + 1), fastPeriod);
      const slowEMA = this.calculateEMA(prices.slice(0, i + 1), slowPeriod);
      macdValues.push(fastEMA - slowEMA);
    }
    
    const signal = this.calculateEMA(macdValues, signalPeriod);
    
    return { macd, signal };
  }

  calculateEMA(prices, period) {
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }

  calculateBollingerBands(prices, period, stdDev) {
    const sma = this.calculateSMA(prices, period);
    const slice = prices.slice(-period);
    
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    return {
      upper: sma + (standardDeviation * stdDev),
      lower: sma - (standardDeviation * stdDev)
    };
  }

  // Helper methods
  getPriceHistory(symbol) {
    return this.priceHistory[symbol] || [];
  }

  getCurrentPrice(symbol) {
    const history = this.getPriceHistory(symbol);
    return history.length > 0 ? history[history.length - 1] : null;
  }

  getPreviousMACD(prices, fastPeriod, slowPeriod, signalPeriod) {
    if (prices.length < slowPeriod + 1) return { macd: 0, signal: 0 };
    return this.calculateMACD(prices.slice(0, -1), fastPeriod, slowPeriod, signalPeriod);
  }

  // Update price history
  updatePriceHistory(symbol, price) {
    if (!this.priceHistory[symbol]) {
      this.priceHistory[symbol] = [];
    }
    
    this.priceHistory[symbol].push(price);
    
    // Keep only last 100 prices
    if (this.priceHistory[symbol].length > 100) {
      this.priceHistory[symbol] = this.priceHistory[symbol].slice(-100);
    }
  }

  // Start price updates
  startPriceUpdates() {
    setInterval(() => {
      const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'];
      
      symbols.forEach(symbol => {
        // Simulate price movement
        const currentPrice = this.getCurrentPrice(symbol) || 1.0850;
        const change = (Math.random() - 0.5) * 0.001; // ±0.05% change
        const newPrice = currentPrice + change;
        
        this.updatePriceHistory(symbol, newPrice);
      });
    }, 1000); // Update every second
  }

  // Get current state
  getState() {
    return {
      isRunning: this.isRunning,
      currentStrategy: this.currentStrategy,
      balance: this.balance,
      positions: this.positions.filter(p => p.status === 'open'),
      trades: this.trades.slice(-50), // Last 50 trades
      performance: this.performance
    };
  }

  // Get available strategies
  getStrategies() {
    return Object.keys(this.strategies);
  }
}

module.exports = { TradingService, setIO };
