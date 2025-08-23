const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class TradingService {
  constructor() {
    this.positions = [];
    this.orders = [];
    this.accountBalance = 10000; // Starting balance
    this.equity = this.accountBalance;
    this.margin = 0;
    this.freeMargin = this.accountBalance;
    this.marginLevel = 0;
  }

  async placeTrade(tradeData) {
    const {
      symbol,
      type, // 'BUY' or 'SELL'
      volume,
      stopLoss,
      takeProfit,
      comment = ''
    } = tradeData;

    // Validate trade data
    if (!symbol || !type || !volume) {
      throw new Error('Missing required trade parameters');
    }

    if (volume <= 0 || volume > 100) {
      throw new Error('Invalid volume size');
    }

    // Check if we have enough free margin
    const requiredMargin = this.calculateRequiredMargin(symbol, volume);
    if (requiredMargin > this.freeMargin) {
      throw new Error('Insufficient free margin');
    }

    // Create position
    const position = {
      id: uuidv4(),
      symbol,
      type,
      volume: parseFloat(volume),
      openPrice: type === 'BUY' ? 1.0850 : 1.0848, // Simplified price
      openTime: moment().toISOString(),
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      takeProfit: takeProfit ? parseFloat(takeProfit) : null,
      comment,
      swap: 0,
      profit: 0,
      status: 'OPEN'
    };

    // Calculate initial margin requirement
    const margin = this.calculateRequiredMargin(symbol, volume);
    
    // Update account metrics
    this.margin += margin;
    this.freeMargin = this.accountBalance - this.margin;
    this.marginLevel = this.equity / this.margin * 100;

    // Add position to list
    this.positions.push(position);

    // Create order record
    const order = {
      id: uuidv4(),
      positionId: position.id,
      symbol,
      type,
      volume: parseFloat(volume),
      price: position.openPrice,
      time: moment().toISOString(),
      status: 'FILLED',
      comment
    };

    this.orders.push(order);

    console.log(`Trade placed: ${type} ${volume} ${symbol} at ${position.openPrice}`);

    return {
      success: true,
      position,
      order,
      accountInfo: this.getAccountInfo()
    };
  }

  async closePosition(positionId) {
    const positionIndex = this.positions.findIndex(p => p.id === positionId);
    
    if (positionIndex === -1) {
      throw new Error('Position not found');
    }

    const position = this.positions[positionIndex];
    
    // Calculate profit/loss (simplified)
    const currentPrice = position.type === 'BUY' ? 1.0848 : 1.0850;
    const priceDiff = position.type === 'BUY' ? 
      currentPrice - position.openPrice : 
      position.openPrice - currentPrice;
    
    const profit = priceDiff * position.volume * 100000; // Simplified P&L calculation

    // Update position
    position.closePrice = currentPrice;
    position.closeTime = moment().toISOString();
    position.profit = profit;
    position.status = 'CLOSED';

    // Update account
    this.equity += profit;
    this.accountBalance += profit;
    
    // Release margin
    const margin = this.calculateRequiredMargin(position.symbol, position.volume);
    this.margin -= margin;
    this.freeMargin = this.accountBalance - this.margin;
    this.marginLevel = this.equity / this.margin * 100;

    // Create close order
    const closeOrder = {
      id: uuidv4(),
      positionId: position.id,
      symbol: position.symbol,
      type: position.type === 'BUY' ? 'SELL' : 'BUY',
      volume: position.volume,
      price: currentPrice,
      time: moment().toISOString(),
      status: 'FILLED',
      comment: 'Position close'
    };

    this.orders.push(closeOrder);

    console.log(`Position closed: ${position.symbol} with P&L: ${profit}`);

    return {
      success: true,
      position,
      closeOrder,
      profit,
      accountInfo: this.getAccountInfo()
    };
  }

  async modifyPosition(positionId, stopLoss, takeProfit) {
    const position = this.positions.find(p => p.id === positionId);
    
    if (!position) {
      throw new Error('Position not found');
    }

    if (position.status !== 'OPEN') {
      throw new Error('Cannot modify closed position');
    }

    // Update stop loss and take profit
    if (stopLoss !== undefined) {
      position.stopLoss = parseFloat(stopLoss);
    }
    
    if (takeProfit !== undefined) {
      position.takeProfit = parseFloat(takeProfit);
    }

    return {
      success: true,
      position,
      accountInfo: this.getAccountInfo()
    };
  }

  getPositions() {
    const openPositions = this.positions.filter(p => p.status === 'OPEN');
    
    // Add current price and P&L information
    return openPositions.map(position => {
      // Mock current prices for demo
      const mockPrices = {
        'EURUSD': { bid: 1.0850, ask: 1.0852 },
        'GBPUSD': { bid: 1.2650, ask: 1.2652 },
        'USDJPY': { bid: 148.50, ask: 148.52 },
        'USDCHF': { bid: 0.8850, ask: 0.8852 },
        'AUDUSD': { bid: 0.6550, ask: 0.6552 },
        'USDCAD': { bid: 1.3650, ask: 1.3652 },
        'NZDUSD': { bid: 0.6050, ask: 0.6052 }
      };

      const currentPrice = mockPrices[position.symbol] || { bid: position.openPrice, ask: position.openPrice };
      const priceDiff = position.type === 'BUY' ? 
        currentPrice.bid - position.openPrice : 
        position.openPrice - currentPrice.ask;
      
      const pnl = priceDiff * position.volume * 100000;

      return {
        ...position,
        currentPrice: position.type === 'BUY' ? currentPrice.bid : currentPrice.ask,
        pnl: pnl
      };
    });
  }

  getAllPositions() {
    return this.positions;
  }

  getOrders() {
    return this.orders;
  }

  getAccountInfo() {
    return {
      balance: this.accountBalance,
      equity: this.equity,
      margin: this.margin,
      freeMargin: this.freeMargin,
      marginLevel: this.marginLevel,
      openPositions: this.positions.filter(p => p.status === 'OPEN').length
    };
  }

  calculateRequiredMargin(symbol, volume) {
    // Simplified margin calculation
    // In real trading, this would depend on leverage, symbol, and broker requirements
    const leverage = 100; // 1:100 leverage
    const contractSize = 100000; // Standard lot size
    const price = 1.0850; // Simplified price
    
    return (volume * contractSize * price) / leverage;
  }

  updatePositions(marketData) {
    // Update P&L for open positions based on current market prices
    this.positions.forEach(position => {
      if (position.status === 'OPEN') {
        const currentPrice = marketData[position.symbol];
        if (currentPrice) {
          const price = position.type === 'BUY' ? currentPrice.bid : currentPrice.ask;
          const priceDiff = position.type === 'BUY' ? 
            price - position.openPrice : 
            position.openPrice - price;
          
          position.profit = priceDiff * position.volume * 100000;
        }
      }
    });

    // Update equity
    this.equity = this.accountBalance + 
      this.positions
        .filter(p => p.status === 'OPEN')
        .reduce((sum, p) => sum + p.profit, 0);

    this.freeMargin = this.accountBalance - this.margin;
    this.marginLevel = this.margin > 0 ? (this.equity / this.margin * 100) : 0;
  }

  checkStopLossAndTakeProfit(marketData) {
    this.positions.forEach(position => {
      if (position.status === 'OPEN') {
        const currentPrice = marketData[position.symbol];
        if (currentPrice) {
          const price = position.type === 'BUY' ? currentPrice.bid : currentPrice.ask;
          
          // Check stop loss
          if (position.stopLoss && 
              ((position.type === 'BUY' && price <= position.stopLoss) ||
               (position.type === 'SELL' && price >= position.stopLoss))) {
            this.closePosition(position.id);
          }
          
          // Check take profit
          if (position.takeProfit && 
              ((position.type === 'BUY' && price >= position.takeProfit) ||
               (position.type === 'SELL' && price <= position.takeProfit))) {
            this.closePosition(position.id);
          }
        }
      }
    });
  }

  getTradeHistory(filter = {}) {
    // For demo purposes, return some mock trade history
    const mockHistory = [
      {
        id: '1',
        symbol: 'EURUSD',
        type: 'BUY',
        volume: 0.1,
        openPrice: 1.0850,
        closePrice: 1.0875,
        pnl: 25.00,
        openTime: Date.now() - 3600000, // 1 hour ago
        closeTime: Date.now() - 1800000  // 30 minutes ago
      },
      {
        id: '2',
        symbol: 'GBPUSD',
        type: 'SELL',
        volume: 0.05,
        openPrice: 1.2650,
        closePrice: 1.2630,
        pnl: 10.00,
        openTime: Date.now() - 7200000, // 2 hours ago
        closeTime: Date.now() - 5400000  // 1.5 hours ago
      },
      {
        id: '3',
        symbol: 'USDJPY',
        type: 'BUY',
        volume: 0.1,
        openPrice: 148.50,
        closePrice: 148.75,
        pnl: 25.00,
        openTime: Date.now() - 10800000, // 3 hours ago
        closeTime: Date.now() - 9000000   // 2.5 hours ago
      },
      {
        id: '4',
        symbol: 'AUDUSD',
        type: 'SELL',
        volume: 0.2,
        openPrice: 0.6550,
        closePrice: 0.6530,
        pnl: 40.00,
        openTime: Date.now() - 14400000, // 4 hours ago
        closeTime: Date.now() - 12600000  // 3.5 hours ago
      },
      {
        id: '5',
        symbol: 'USDCAD',
        type: 'BUY',
        volume: 0.15,
        openPrice: 1.3650,
        closePrice: 1.3675,
        pnl: 37.50,
        openTime: Date.now() - 18000000, // 5 hours ago
        closeTime: Date.now() - 16200000  // 4.5 hours ago
      }
    ];

    // Apply filters
    let filteredHistory = mockHistory;
    
    if (filter.symbol && filter.symbol !== 'ALL') {
      filteredHistory = filteredHistory.filter(trade => trade.symbol === filter.symbol);
    }
    
    if (filter.type && filter.type !== 'ALL') {
      filteredHistory = filteredHistory.filter(trade => trade.type === filter.type);
    }

    return filteredHistory;
  }

  getRecentTrades(limit = 5) {
    const history = this.getTradeHistory();
    return history.slice(0, limit);
  }
}

module.exports = TradingService;
