const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Trade = sequelize.define('Trade', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  accountId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'accounts',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  ticket: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('BUY', 'SELL'),
    allowNull: false
  },
  orderType: {
    type: DataTypes.ENUM('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAILING_STOP'),
    defaultValue: 'MARKET'
  },
  lotSize: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  openPrice: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: false
  },
  closePrice: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: true
  },
  currentPrice: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: true
  },
  stopLoss: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: true
  },
  takeProfit: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: true
  },
  swap: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  commission: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  profit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'CLOSED', 'PENDING', 'CANCELLED', 'EXPIRED'),
    defaultValue: 'OPEN'
  },
  openTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  closeTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  magicNumber: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  strategyId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  strategyName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'trades',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['ticket']
    },
    {
      fields: ['accountId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['symbol']
    },
    {
      fields: ['status']
    },
    {
      fields: ['openTime']
    },
    {
      fields: ['strategyId']
    }
  ]
});

// Instance methods
Trade.prototype.calculateProfit = function() {
  if (!this.closePrice || this.status !== 'CLOSED') {
    // Calculate unrealized profit
    if (this.currentPrice) {
      const priceDiff = this.type === 'BUY' 
        ? this.currentPrice - this.openPrice
        : this.openPrice - this.currentPrice;
      
      this.profit = (priceDiff * this.lotSize * 100000) - this.commission - this.swap;
    }
  } else {
    // Calculate realized profit
    const priceDiff = this.type === 'BUY' 
      ? this.closePrice - this.openPrice
      : this.openPrice - this.closePrice;
    
    this.profit = (priceDiff * this.lotSize * 100000) - this.commission - this.swap;
  }
  return this.profit;
};

Trade.prototype.close = function(closePrice, closeTime = new Date()) {
  this.closePrice = closePrice;
  this.closeTime = closeTime;
  this.status = 'CLOSED';
  this.calculateProfit();
};

Trade.prototype.updateCurrentPrice = function(currentPrice) {
  this.currentPrice = currentPrice;
  if (this.status === 'OPEN') {
    this.calculateProfit();
  }
};

module.exports = Trade;
