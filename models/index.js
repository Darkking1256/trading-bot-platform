const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
const Account = require('./Account');
const Trade = require('./Trade');
const Strategy = require('./Strategy');

// Define associations
User.hasMany(Account, {
  foreignKey: 'userId',
  as: 'accounts',
  onDelete: 'CASCADE'
});

Account.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Trade, {
  foreignKey: 'userId',
  as: 'trades',
  onDelete: 'CASCADE'
});

Trade.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Account.hasMany(Trade, {
  foreignKey: 'accountId',
  as: 'trades',
  onDelete: 'CASCADE'
});

Trade.belongsTo(Account, {
  foreignKey: 'accountId',
  as: 'account'
});

User.hasMany(Strategy, {
  foreignKey: 'userId',
  as: 'strategies',
  onDelete: 'CASCADE'
});

Strategy.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Strategy.hasMany(Trade, {
  foreignKey: 'strategyId',
  as: 'trades'
});

Trade.belongsTo(Strategy, {
  foreignKey: 'strategyId',
  as: 'strategy'
});

// Database initialization
const initializeDatabase = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized successfully');
    
    // Create default admin user if not exists
    await createDefaultAdmin();
    
    // Create demo data if in development
    if (process.env.NODE_ENV === 'development') {
      await createDemoData();
    }
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      where: { email: 'admin@tradingplatform.com' }
    });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        email: 'admin@tradingplatform.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isVerified: true,
        isActive: true
      });
      
      console.log('✅ Default admin user created');
    }
  } catch (error) {
    console.error('❌ Failed to create default admin:', error);
  }
};

// Create demo data for development
const createDemoData = async () => {
  try {
    // Create demo user
    const demoUser = await User.findOne({
      where: { email: 'demo@tradingplatform.com' }
    });
    
    if (!demoUser) {
      const user = await User.create({
        username: 'demo',
        email: 'demo@tradingplatform.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'User',
        role: 'user',
        isVerified: true,
        isActive: true
      });
      
      // Create demo account
      const account = await Account.create({
        userId: user.id,
        accountNumber: 'DEMO001',
        accountType: 'demo',
        balance: 10000.00,
        equity: 10000.00,
        freeMargin: 10000.00,
        currency: 'USD',
        leverage: 100
      });
      
      // Create demo strategy
      const strategy = await Strategy.create({
        userId: user.id,
        name: 'Demo Moving Average Crossover',
        description: 'A simple moving average crossover strategy for demonstration',
        category: 'TREND_FOLLOWING',
        type: 'MOVING_AVERAGE_CROSSOVER',
        isActive: true,
        symbols: ['EURUSD', 'GBPUSD'],
        config: {
          lotSize: 0.1,
          stopLoss: 50,
          takeProfit: 100,
          maxPositions: 3,
          riskPerTrade: 2.0
        },
        parameters: {
          fastPeriod: 10,
          slowPeriod: 30,
          maType: 'SMA'
        }
      });
      
      console.log('✅ Demo data created successfully');
    }
  } catch (error) {
    console.error('❌ Failed to create demo data:', error);
  }
};

// Export models and initialization function
module.exports = {
  sequelize,
  User,
  Account,
  Trade,
  Strategy,
  initializeDatabase
};
