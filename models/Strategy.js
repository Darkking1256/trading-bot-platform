const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Strategy = sequelize.define('Strategy', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('TREND_FOLLOWING', 'MEAN_REVERSION', 'SCALPING', 'GRID', 'ARBITRAGE', 'NEWS', 'CUSTOM'),
    defaultValue: 'CUSTOM'
  },
  type: {
    type: DataTypes.ENUM('MOVING_AVERAGE_CROSSOVER', 'RSI_DIVERGENCE', 'BOLLINGER_BANDS', 'GRID_TRADING', 'SCALPING', 'CUSTOM'),
    defaultValue: 'CUSTOM'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  symbols: {
    type: DataTypes.JSONB,
    defaultValue: ['EURUSD']
  },
  config: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {
      lotSize: 0.1,
      stopLoss: 50,
      takeProfit: 100,
      maxPositions: 5,
      riskPerTrade: 2.0
    }
  },
  parameters: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  performance: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalPnL: 0.00,
      winRate: 0.00,
      averageWin: 0.00,
      averageLoss: 0.00,
      profitFactor: 0.00,
      maxDrawdown: 0.00,
      sharpeRatio: 0.00,
      totalReturn: 0.00
    }
  },
  riskSettings: {
    type: DataTypes.JSONB,
    defaultValue: {
      maxDailyLoss: 5.0,
      maxDrawdown: 20.0,
      maxPositions: 5,
      maxLotSize: 1.0,
      allowedSymbols: ['EURUSD', 'GBPUSD', 'USDJPY']
    }
  },
  schedule: {
    type: DataTypes.JSONB,
    defaultValue: {
      enabled: false,
      timezone: 'UTC',
      startTime: '00:00',
      endTime: '23:59',
      daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
    }
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  followers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastExecuted: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextExecution: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'strategies',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['category']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['isPublic']
    },
    {
      fields: ['rating']
    }
  ]
});

// Instance methods
Strategy.prototype.updatePerformance = function(trades) {
  const closedTrades = trades.filter(trade => trade.status === 'CLOSED');
  const winningTrades = closedTrades.filter(trade => trade.profit > 0);
  const losingTrades = closedTrades.filter(trade => trade.profit < 0);
  
  const totalPnL = closedTrades.reduce((sum, trade) => sum + parseFloat(trade.profit), 0);
  const totalWins = winningTrades.reduce((sum, trade) => sum + parseFloat(trade.profit), 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + parseFloat(trade.profit), 0));
  
  this.performance = {
    totalTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    totalPnL: totalPnL,
    winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
    averageWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
    averageLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
    profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0,
    maxDrawdown: this.calculateMaxDrawdown(closedTrades),
    sharpeRatio: this.calculateSharpeRatio(closedTrades),
    totalReturn: this.calculateTotalReturn(totalPnL)
  };
};

Strategy.prototype.calculateMaxDrawdown = function(trades) {
  if (trades.length === 0) return 0;
  
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;
  
  trades.forEach(trade => {
    runningPnL += parseFloat(trade.profit);
    if (runningPnL > peak) {
      peak = runningPnL;
    }
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });
  
  return maxDrawdown;
};

Strategy.prototype.calculateSharpeRatio = function(trades) {
  if (trades.length < 2) return 0;
  
  const returns = trades.map(trade => parseFloat(trade.profit));
  const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  return stdDev > 0 ? meanReturn / stdDev : 0;
};

Strategy.prototype.calculateTotalReturn = function(totalPnL) {
  // This would typically be calculated against initial capital
  // For now, we'll use a simple percentage
  return totalPnL;
};

Strategy.prototype.canExecute = function() {
  if (!this.isActive) return false;
  
  // Check schedule
  if (this.schedule.enabled) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = this.schedule.startTime.split(':').map(Number);
    const endTime = this.schedule.endTime.split(':').map(Number);
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    
    if (currentTime < startMinutes || currentTime > endMinutes) return false;
    if (!this.schedule.daysOfWeek.includes(now.getDay())) return false;
  }
  
  return true;
};

module.exports = Strategy;
