const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MarketData = sequelize.define('MarketData', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  symbol: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  timeframe: {
    type: DataTypes.ENUM('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'),
    allowNull: false
  },
  open: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: false
  },
  high: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: false
  },
  low: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: false
  },
  close: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: false
  },
  volume: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: true
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  bid: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: true
  },
  ask: {
    type: DataTypes.DECIMAL(15, 5),
    allowNull: true
  },
  spread: {
    type: DataTypes.DECIMAL(10, 5),
    allowNull: true
  },
  source: {
    type: DataTypes.STRING(50),
    defaultValue: 'api'
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'market_data',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['symbol', 'timeframe', 'timestamp']
    },
    {
      fields: ['symbol']
    },
    {
      fields: ['timeframe']
    },
    {
      fields: ['timestamp']
    }
  ]
});

// Instance methods
MarketData.prototype.calculateSpread = function() {
  if (this.bid && this.ask) {
    this.spread = this.ask - this.bid;
  }
  return this.spread;
};

MarketData.prototype.getOHLC = function() {
  return {
    open: this.open,
    high: this.high,
    low: this.low,
    close: this.close
  };
};

MarketData.prototype.getPrice = function() {
  return {
    bid: this.bid,
    ask: this.ask,
    spread: this.spread,
    mid: this.bid && this.ask ? (this.bid + this.ask) / 2 : this.close
  };
};

module.exports = MarketData;
