# 🗄️ Database Integration Guide

## 📋 Overview

The trading platform now uses **PostgreSQL** with **Sequelize ORM** for persistent data storage, replacing the previous in-memory storage system. This provides:

- ✅ **Data Persistence** - All data survives server restarts
- ✅ **Scalability** - Can handle multiple users and large datasets
- ✅ **ACID Compliance** - Reliable transactions and data integrity
- ✅ **Advanced Queries** - Complex filtering, sorting, and aggregation
- ✅ **Relationships** - Proper foreign key relationships between entities

---

## 🏗️ Database Architecture

### **Core Models**

1. **User** - User accounts and authentication
2. **Account** - Trading accounts with balances and settings
3. **Trade** - All trading transactions and positions
4. **Strategy** - Algorithmic trading strategies

### **Relationships**

```
User (1) ──── (N) Account
User (1) ──── (N) Trade
User (1) ──── (N) Strategy
Account (1) ──── (N) Trade
Strategy (1) ──── (N) Trade
```

---

## 🚀 Quick Setup

### **1. Install PostgreSQL**

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**macOS:**
```bash
# Using Homebrew:
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### **2. Create Database**

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE trading_platform_dev;
CREATE USER trading_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trading_platform_dev TO trading_user;
\q
```

### **3. Configure Environment**

Copy the example environment file:
```bash
cp env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=trading_user
DB_PASSWORD=your_password
DB_NAME=trading_platform_dev
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### **4. Install Dependencies**

```bash
npm install
```

### **5. Initialize Database**

```bash
npm run setup-db
```

### **6. Start Application**

```bash
npm start
```

---

## 📊 Database Models

### **User Model**

```javascript
{
  id: UUID (Primary Key),
  username: STRING(50) UNIQUE,
  email: STRING(255) UNIQUE,
  password: STRING(255) HASHED,
  firstName: STRING(100),
  lastName: STRING(100),
  avatar: STRING(500),
  isActive: BOOLEAN,
  isVerified: BOOLEAN,
  role: ENUM('user', 'admin', 'moderator'),
  lastLogin: DATE,
  preferences: JSONB,
  apiKey: STRING(255),
  apiSecret: STRING(255),
  createdAt: DATE,
  updatedAt: DATE
}
```

### **Account Model**

```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key),
  accountNumber: STRING(50) UNIQUE,
  accountType: ENUM('demo', 'live', 'paper'),
  balance: DECIMAL(15,2),
  equity: DECIMAL(15,2),
  margin: DECIMAL(15,2),
  freeMargin: DECIMAL(15,2),
  marginLevel: DECIMAL(10,2),
  currency: STRING(3),
  leverage: INTEGER,
  isActive: BOOLEAN,
  broker: STRING(100),
  brokerAccountId: STRING(100),
  settings: JSONB,
  lastSync: DATE,
  createdAt: DATE,
  updatedAt: DATE
}
```

### **Trade Model**

```javascript
{
  id: UUID (Primary Key),
  accountId: UUID (Foreign Key),
  userId: UUID (Foreign Key),
  ticket: STRING(50) UNIQUE,
  symbol: STRING(20),
  type: ENUM('BUY', 'SELL'),
  orderType: ENUM('MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT', 'TRAILING_STOP'),
  lotSize: DECIMAL(10,2),
  openPrice: DECIMAL(15,5),
  closePrice: DECIMAL(15,5),
  currentPrice: DECIMAL(15,5),
  stopLoss: DECIMAL(15,5),
  takeProfit: DECIMAL(15,5),
  swap: DECIMAL(15,2),
  commission: DECIMAL(15,2),
  profit: DECIMAL(15,2),
  status: ENUM('OPEN', 'CLOSED', 'PENDING', 'CANCELLED', 'EXPIRED'),
  openTime: DATE,
  closeTime: DATE,
  comment: TEXT,
  magicNumber: INTEGER,
  strategyId: UUID (Foreign Key),
  strategyName: STRING(100),
  tags: JSONB,
  metadata: JSONB,
  createdAt: DATE,
  updatedAt: DATE
}
```

### **Strategy Model**

```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key),
  name: STRING(100),
  description: TEXT,
  category: ENUM('TREND_FOLLOWING', 'MEAN_REVERSION', 'SCALPING', 'GRID', 'ARBITRAGE', 'NEWS', 'CUSTOM'),
  type: ENUM('MOVING_AVERAGE_CROSSOVER', 'RSI_DIVERGENCE', 'BOLLINGER_BANDS', 'GRID_TRADING', 'SCALPING', 'CUSTOM'),
  isActive: BOOLEAN,
  symbols: JSONB,
  config: JSONB,
  parameters: JSONB,
  performance: JSONB,
  riskSettings: JSONB,
  schedule: JSONB,
  isPublic: BOOLEAN,
  rating: DECIMAL(3,2),
  totalRatings: INTEGER,
  followers: INTEGER,
  lastExecuted: DATE,
  nextExecution: DATE,
  metadata: JSONB,
  createdAt: DATE,
  updatedAt: DATE
}
```

---

## 🔧 Services

### **UserService**

Handles all user-related operations:

```javascript
// Create new user
const user = await UserService.createUser({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'secure_password'
});

// Authenticate user
const user = await UserService.authenticate('john@example.com', 'password');

// Get user profile
const profile = await UserService.getUserProfile(userId);

// Update preferences
const user = await UserService.updatePreferences(userId, {
  theme: 'dark',
  notifications: { email: true }
});
```

### **TradeService**

Handles all trading operations:

```javascript
// Create new trade
const trade = await TradeService.createTrade({
  accountId: accountId,
  userId: userId,
  symbol: 'EURUSD',
  type: 'BUY',
  lotSize: 0.1,
  openPrice: 1.0850
});

// Get user trades
const trades = await TradeService.getTradesByUserId(userId, {
  status: 'OPEN',
  symbol: 'EURUSD',
  page: 1,
  limit: 50
});

// Close trade
const closedTrade = await TradeService.closeTrade(tradeId, 1.0900);

// Get trading statistics
const stats = await TradeService.getTradingStats(userId, '30d');
```

---

## 🛠️ Database Operations

### **Creating Records**

```javascript
// Create user with account
const user = await User.create({
  username: 'trader1',
  email: 'trader1@example.com',
  password: 'password123'
});

const account = await Account.create({
  userId: user.id,
  accountNumber: 'ACC001',
  accountType: 'demo',
  balance: 10000.00
});
```

### **Querying Records**

```javascript
// Find user with accounts
const user = await User.findByPk(userId, {
  include: [{
    model: Account,
    as: 'accounts'
  }]
});

// Get trades with filtering
const trades = await Trade.findAll({
  where: {
    userId: userId,
    status: 'OPEN',
    symbol: 'EURUSD'
  },
  include: [
    { model: Account, as: 'account' },
    { model: Strategy, as: 'strategy' }
  ],
  order: [['openTime', 'DESC']]
});
```

### **Updating Records**

```javascript
// Update account balance
await account.update({
  balance: newBalance,
  equity: newEquity
});

// Update trade price
await trade.update({
  currentPrice: newPrice
});
```

### **Deleting Records**

```javascript
// Delete trade (soft delete recommended)
await trade.destroy();

// Delete user (cascades to accounts and trades)
await user.destroy();
```

---

## 🔒 Security Features

### **Password Hashing**

All passwords are automatically hashed using bcrypt:

```javascript
// Password is hashed before saving
const user = await User.create({
  username: 'user1',
  email: 'user1@example.com',
  password: 'plaintext_password' // Automatically hashed
});

// Password validation
const isValid = await user.validatePassword('plaintext_password');
```

### **JWT Authentication**

Secure token-based authentication:

```javascript
// Generate token
const token = UserService.generateToken(user);

// Verify token
const decoded = jwt.verify(token, JWT_SECRET);
```

### **Data Validation**

Comprehensive validation rules:

```javascript
// Username validation
username: {
  type: DataTypes.STRING(50),
  allowNull: false,
  unique: true,
  validate: {
    len: [3, 50],
    is: /^[a-zA-Z0-9_]+$/
  }
}

// Email validation
email: {
  type: DataTypes.STRING(255),
  allowNull: false,
  unique: true,
  validate: {
    isEmail: true
  }
}
```

---

## 📈 Performance Optimization

### **Indexes**

Optimized database indexes for fast queries:

```javascript
// User indexes
indexes: [
  { unique: true, fields: ['username'] },
  { unique: true, fields: ['email'] },
  { fields: ['role'] }
]

// Trade indexes
indexes: [
  { unique: true, fields: ['ticket'] },
  { fields: ['userId'] },
  { fields: ['accountId'] },
  { fields: ['symbol'] },
  { fields: ['status'] },
  { fields: ['openTime'] }
]
```

### **Connection Pooling**

Efficient database connection management:

```javascript
pool: {
  max: 10,        // Maximum connections
  min: 2,         // Minimum connections
  acquire: 30000, // Connection timeout
  idle: 10000     // Idle timeout
}
```

---

## 🚨 Error Handling

### **Database Errors**

```javascript
try {
  const user = await UserService.createUser(userData);
} catch (error) {
  if (error.name === 'SequelizeUniqueConstraintError') {
    // Handle duplicate username/email
    res.status(400).json({ error: 'Username or email already exists' });
  } else if (error.name === 'SequelizeValidationError') {
    // Handle validation errors
    res.status(400).json({ error: error.message });
  } else {
    // Handle other errors
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### **Connection Errors**

```javascript
// Test database connection
try {
  await sequelize.authenticate();
  console.log('✅ Database connected');
} catch (error) {
  console.error('❌ Database connection failed:', error);
  process.exit(1);
}
```

---

## 🔄 Migration Strategy

### **From In-Memory to Database**

The application automatically migrates from in-memory storage:

1. **User Migration** - Creates database users from existing sessions
2. **Account Migration** - Creates demo accounts for new users
3. **Data Preservation** - Existing data is preserved during migration

### **Schema Updates**

For future schema changes:

```javascript
// Add new column
await sequelize.query(`
  ALTER TABLE users 
  ADD COLUMN phone VARCHAR(20)
`);

// Update existing data
await sequelize.query(`
  UPDATE users 
  SET preferences = '{}'::jsonb 
  WHERE preferences IS NULL
`);
```

---

## 🧪 Testing

### **Database Testing**

```javascript
// Test user creation
describe('UserService', () => {
  it('should create user with account', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = await UserService.createUser(userData);
    expect(user.username).toBe(userData.username);
    
    const accounts = await user.getAccounts();
    expect(accounts).toHaveLength(1);
  });
});
```

### **Integration Testing**

```javascript
// Test complete trading flow
describe('Trading Flow', () => {
  it('should create and close trade', async () => {
    // Create trade
    const trade = await TradeService.createTrade(tradeData);
    expect(trade.status).toBe('OPEN');
    
    // Close trade
    const closedTrade = await TradeService.closeTrade(trade.id, 1.0900);
    expect(closedTrade.status).toBe('CLOSED');
  });
});
```

---

## 📚 Additional Resources

- [Sequelize Documentation](https://sequelize.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Database Best Practices](https://nodejs.org/en/docs/guides/database/)

---

## 🆘 Troubleshooting

### **Common Issues**

1. **Connection Refused**
   - Check if PostgreSQL is running
   - Verify host and port in .env
   - Check firewall settings

2. **Authentication Failed**
   - Verify username and password
   - Check pg_hba.conf configuration
   - Ensure user has proper permissions

3. **Database Not Found**
   - Create database manually
   - Check database name in .env
   - Verify user has CREATE privileges

4. **Migration Errors**
   - Drop and recreate database
   - Check for conflicting data
   - Review migration logs

### **Debug Commands**

```bash
# Test database connection
npm run setup-db

# Check database status
psql -h localhost -U trading_user -d trading_platform_dev -c "\dt"

# View table structure
psql -h localhost -U trading_user -d trading_platform_dev -c "\d users"

# Check logs
tail -f /var/log/postgresql/postgresql-*.log
```

---

**🎉 Congratulations!** Your trading platform now has a robust, scalable database backend that will support all future features and handle real user data securely.
