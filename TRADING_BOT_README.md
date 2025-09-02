# 🤖 Real Trading Bot

A professional automated trading bot with real broker integration, risk management, and multiple trading strategies.

## ⚠️ **IMPORTANT WARNINGS**

### **Risk Disclosure**
- **Trading involves substantial risk of loss**
- **You can lose more than your initial investment**
- **Past performance does not guarantee future results**
- **Automated trading can amplify losses quickly**
- **Always start with demo accounts and small amounts**

### **Legal & Regulatory**
- **Check your local trading regulations**
- **Some jurisdictions require trading licenses**
- **Ensure compliance with financial regulations**
- **Consult with a financial advisor before live trading**

## 🚀 **Features**

### **Core Components**
- ✅ **Real Broker Integration** (OANDA, FXCM, Interactive Brokers)
- ✅ **Moving Average Crossover Strategy**
- ✅ **Risk Management System**
- ✅ **Position Sizing & Money Management**
- ✅ **Real-time Price Feeds**
- ✅ **Performance Tracking**
- ✅ **Demo & Live Trading Modes**

### **Risk Management**
- 🔒 **Maximum Position Limits**
- 🔒 **Daily Loss Limits**
- 🔒 **Per-Trade Risk Percentage**
- 🔒 **Stop Loss & Take Profit**
- 🔒 **Correlation Limits**
- 🔒 **Emergency Stop Functions**

### **Trading Strategies**
- 📊 **Moving Average Crossover**
- 📊 **RSI Overbought/Oversold** (planned)
- 📊 **MACD Signal Cross** (planned)
- 📊 **Multi-Strategy Combination** (planned)

## 📋 **Prerequisites**

### **Required Software**
- Node.js (v16 or higher)
- npm or yarn
- Git

### **Required Accounts**
- **OANDA Demo Account** (recommended to start)
- **FXCM Demo Account** (alternative)
- **Interactive Brokers Paper Trading** (advanced)

### **API Keys & Credentials**
You'll need to obtain API keys from your chosen broker:

#### **OANDA**
1. Create account at [OANDA](https://www.oanda.com/)
2. Go to "My Account" → "API Access"
3. Generate API key
4. Note your Account ID

#### **FXCM**
1. Create account at [FXCM](https://www.fxcm.com/)
2. Go to "My Account" → "API Access"
3. Generate API key
4. Note your Account ID

## 🛠️ **Installation**

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd trading-bot
```

### **2. Install Dependencies**
```bash
npm install
```

### **3. Install Additional Dependencies**
```bash
npm install axios ws technicalindicators moment uuid
```

### **4. Set Up Environment Variables**
Create a `.env` file in the root directory:

```env
# OANDA Configuration
OANDA_API_KEY=your_oanda_api_key_here
OANDA_ACCOUNT_ID=your_oanda_account_id_here

# FXCM Configuration (optional)
FXCM_API_KEY=your_fxcm_api_key_here
FXCM_ACCOUNT_ID=your_fxcm_account_id_here

# Interactive Brokers Configuration (optional)
IB_API_KEY=your_ib_api_key_here
IB_ACCOUNT_ID=your_ib_account_id_here

# Email Notifications (optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

# Telegram Notifications (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

## 🎯 **Quick Start**

### **1. Demo Trading (Recommended)**
```bash
# Run OANDA demo account
node example.js demo
```

### **2. Backtesting**
```bash
# Run backtesting mode
node example.js backtest
```

### **3. Live Trading (DANGEROUS!)**
```bash
# Run live trading (only after extensive testing!)
node example.js live
```

## 📊 **Configuration**

### **Strategy Parameters**
Edit `config.js` to customize your trading strategy:

```javascript
strategy: {
  maCrossover: {
    fastPeriod: 10,      // Fast MA period
    slowPeriod: 30,      // Slow MA period
    maType: 'SMA',       // 'SMA' or 'EMA'
    lotSize: 0.1,        // Position size
    stopLoss: 50,        // Stop loss in pips
    takeProfit: 100,     // Take profit in pips
    maxPositions: 3      // Maximum concurrent positions
  }
}
```

### **Risk Management**
```javascript
risk: {
  maxPositions: 3,       // Maximum open positions
  maxDailyLoss: 200,     // Maximum daily loss in USD
  maxRiskPerTrade: 1,    // Maximum risk per trade (%)
  maxDrawdown: 10,       // Maximum drawdown (%)
  correlationLimit: 0.7  // Maximum correlation between positions
}
```

## 🔧 **Customization**

### **Adding New Strategies**
1. Create a new strategy file in `strategies/`
2. Implement the required methods:
   - `update(priceData)`
   - `checkSignals()`
   - `generateSignal()`

### **Adding New Brokers**
1. Extend the `BrokerInterface` class
2. Implement broker-specific API calls
3. Add WebSocket handling for real-time data

### **Risk Management Rules**
Modify the risk management logic in `BrokerInterface.js`:
- Position size calculation
- Correlation checks
- Drawdown monitoring
- Emergency stop conditions

## 📈 **Performance Monitoring**

### **Real-time Metrics**
The bot tracks:
- Total trades
- Win rate
- Profit/Loss
- Average win/loss
- Maximum drawdown
- Sharpe ratio (planned)

### **Performance Reports**
```bash
# View performance summary
console.log(bot.getStatus().performance);
```

## 🚨 **Safety Features**

### **Emergency Stop**
The bot includes several safety mechanisms:
- **Daily Loss Limit**: Automatically stops if daily loss exceeded
- **Maximum Drawdown**: Stops if account drawdown too high
- **Position Limits**: Prevents over-leveraging
- **Correlation Checks**: Avoids highly correlated positions

### **Manual Override**
```javascript
// Emergency stop
await bot.stop();

// Close all positions
await bot.closeAllPositions();
```

## 📚 **Best Practices**

### **Before Live Trading**
1. **Extensive Demo Testing**: Test for at least 1-3 months
2. **Small Position Sizes**: Start with 0.01 lots
3. **Conservative Risk**: Use 1% risk per trade maximum
4. **Monitor Performance**: Check results daily
5. **Backup Systems**: Have manual override capabilities

### **Risk Management**
1. **Never risk more than 2% per trade**
2. **Set daily loss limits**
3. **Use stop losses on every trade**
4. **Diversify across multiple strategies**
5. **Monitor correlation between positions**

### **Technical Considerations**
1. **Stable Internet Connection**: Required for real-time data
2. **Server Uptime**: Consider VPS hosting for 24/7 operation
3. **Backup Power**: Ensure continuous operation
4. **Monitoring**: Set up alerts for system issues

## 🐛 **Troubleshooting**

### **Common Issues**

#### **Connection Problems**
```bash
# Check API credentials
console.log(config.broker.oanda.apiKey);

# Test broker connection
const bot = new TradingBot(config);
await bot.broker.connect();
```

#### **Strategy Not Trading**
- Check if strategy is active: `bot.strategy.isActive`
- Verify price data is flowing: `bot.broker.onPriceUpdate`
- Check position limits: `bot.strategy.positions.length`

#### **Performance Issues**
- Monitor memory usage
- Check for memory leaks
- Optimize strategy calculations

## 📞 **Support**

### **Getting Help**
1. Check the troubleshooting section
2. Review broker API documentation
3. Test with demo accounts first
4. Start with small amounts

### **Community**
- Join trading bot communities
- Share experiences (without revealing strategies)
- Learn from others' mistakes

## ⚖️ **Legal Disclaimer**

This software is provided "as is" without warranty. Trading involves substantial risk of loss and is not suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose.

## 📄 **License**

This project is for educational purposes. Use at your own risk.

---

## 🎯 **Next Steps**

1. **Start with Demo**: Run `node example.js demo`
2. **Test Extensively**: Use backtesting mode
3. **Learn Risk Management**: Study the risk parameters
4. **Start Small**: Use minimal position sizes
5. **Monitor Closely**: Watch performance daily
6. **Scale Gradually**: Increase size only after proven success

**Remember: The goal is consistent profits, not quick riches!** 🎯








