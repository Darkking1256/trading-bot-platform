const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Account = sequelize.define('Account', {
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
  accountNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  accountType: {
    type: DataTypes.ENUM('demo', 'live', 'paper'),
    defaultValue: 'demo'
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 10000.00,
    validate: {
      min: 0
    }
  },
  equity: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 10000.00
  },
  margin: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00
  },
  freeMargin: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 10000.00
  },
  marginLevel: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'USD'
  },
  leverage: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    validate: {
      min: 1,
      max: 1000
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  broker: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  brokerAccountId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      maxPositions: 10,
      maxLotSize: 10.0,
      allowedSymbols: ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'],
      riskManagement: {
        maxRiskPerTrade: 2.0, // percentage
        maxDailyLoss: 5.0, // percentage
        maxDrawdown: 20.0 // percentage
      }
    }
  },
  lastSync: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'accounts',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['accountNumber']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['accountType']
    }
  ]
});

// Instance methods
Account.prototype.updateEquity = function() {
  // This would be calculated based on open positions
  // For now, we'll keep it simple
  this.equity = this.balance;
  this.freeMargin = this.equity - this.margin;
  this.marginLevel = this.margin > 0 ? (this.equity / this.margin) * 100 : 0;
};

Account.prototype.canOpenPosition = function(lotSize, symbol) {
  const requiredMargin = this.calculateRequiredMargin(lotSize, symbol);
  return this.freeMargin >= requiredMargin;
};

Account.prototype.calculateRequiredMargin = function(lotSize, symbol) {
  // Simplified margin calculation
  // In real implementation, this would use current market prices
  const standardLotValue = 100000; // Standard lot = 100,000 units
  const marginRequirement = 0.01; // 1% margin requirement
  return (lotSize * standardLotValue * marginRequirement) / this.leverage;
};

module.exports = Account;
