# 🏦 Broker Integration Guide

## Overview

This guide explains how to connect your trading platform to live brokers for real trading. The platform supports multiple brokers including OANDA, FXCM, Alpaca, and Interactive Brokers.

## 🔗 Supported Brokers

### 1. **OANDA** (Recommended for Forex)
- **Type**: Forex & CFD Trading
- **Demo Account**: Available
- **API**: REST API with WebSocket streaming
- **Features**: Real-time pricing, order management, position tracking

### 2. **FXCM** 
- **Type**: Forex & CFD Trading
- **Demo Account**: Available
- **API**: REST API with WebSocket streaming
- **Features**: Advanced order types, market analysis tools

### 3. **Alpaca**
- **Type**: Stock Trading
- **Demo Account**: Paper trading available
- **API**: REST API with WebSocket streaming
- **Features**: Commission-free trading, real-time market data

### 4. **Interactive Brokers**
- **Type**: Multi-asset trading
- **Demo Account**: Available
- **API**: TWS API (requires TWS Gateway)
- **Features**: Global markets, advanced order types

## 🚀 Quick Setup

### Step 1: Choose Your Broker

1. **For Forex Trading**: Use OANDA or FXCM
2. **For Stock Trading**: Use Alpaca
3. **For Multi-asset**: Use Interactive Brokers

### Step 2: Get API Keys

#### OANDA Setup:
1. Go to [OANDA](https://www.oanda.com/)
2. Create a demo account
3. Navigate to "My Account" → "API Access"
4. Generate API key
5. Note your Account ID

#### FXCM Setup:
1. Go to [FXCM](https://www.fxcm.com/)
2. Create a demo account
3. Navigate to "Trading Station" → "API"
4. Generate API key and token

#### Alpaca Setup:
1. Go to [Alpaca](https://alpaca.markets/)
2. Create a paper trading account
3. Navigate to "API Keys"
4. Generate API key and secret key

### Step 3: Configure Environment Variables

Add your broker API keys to the `.env` file:

```bash
# OANDA Configuration
OANDA_API_KEY=your_oanda_api_key_here
OANDA_ACCOUNT_ID=your_oanda_account_id_here

# FXCM Configuration
FXCM_API_KEY=your_fxcm_api_key_here
FXCM_TOKEN=your_fxcm_token_here

# Alpaca Configuration
ALPACA_API_KEY=your_alpaca_api_key_here
ALPACA_SECRET_KEY=your_alpaca_secret_key_here

# Interactive Brokers Configuration
IB_PORT=5000
```

### Step 4: Restart the Server

After adding your API keys, restart the server:

```bash
npm start
```

## 📊 Using the Broker Connection

### 1. Access Broker Connection
- Navigate to "Broker Connection" in the sidebar
- View connection status and available brokers

### 2. Connect to Broker
- Click "Connect" on your configured broker
- View account information and balance
- Check open positions and orders

### 3. Place Orders
- Select symbol (EUR/USD, GBP/USD, etc.)
- Choose order type (Market or Limit)
- Set quantity and price
- Click "Place Order"

### 4. Monitor Positions
- View real-time position updates
- Track P&L and margin usage
- Cancel pending orders

## 🔧 API Endpoints

### Broker Status
```bash
GET /api/broker/status
```

### Connect to Broker
```bash
POST /api/broker/connect/:broker
```

### Account Information
```bash
GET /api/broker/account
```

### Open Positions
```bash
GET /api/broker/positions
```

### Open Orders
```bash
GET /api/broker/orders
```

### Place Market Order
```bash
POST /api/broker/orders/market
{
  "symbol": "EURUSD",
  "side": "BUY",
  "quantity": 1000,
  "stopLoss": 1.0800,
  "takeProfit": 1.0900
}
```

### Place Limit Order
```bash
POST /api/broker/orders/limit
{
  "symbol": "EURUSD",
  "side": "BUY",
  "quantity": 1000,
  "price": 1.0850
}
```

### Cancel Order
```bash
DELETE /api/broker/orders/:orderId
```

## 🛡️ Safety Features

### Demo Mode
- All brokers support demo/paper trading
- Test strategies without real money
- Same features as live trading

### Risk Management
- Position size limits
- Stop-loss and take-profit orders
- Margin monitoring
- Real-time P&L tracking

### Error Handling
- Connection monitoring
- Automatic reconnection
- Order validation
- Error notifications

## 📈 Trading Features

### Order Types
- **Market Orders**: Immediate execution
- **Limit Orders**: Price-based execution
- **Stop Orders**: Trigger-based execution
- **Stop-Loss**: Automatic loss protection
- **Take-Profit**: Automatic profit taking

### Position Management
- Real-time position tracking
- P&L calculation
- Margin monitoring
- Position sizing

### Risk Controls
- Maximum position size
- Daily loss limits
- Margin call alerts
- Position concentration limits

## 🔍 Troubleshooting

### Connection Issues
1. **Check API Keys**: Verify keys are correct
2. **Network**: Ensure internet connection
3. **Broker Status**: Check broker maintenance
4. **Rate Limits**: Respect API rate limits

### Order Issues
1. **Market Hours**: Check trading hours
2. **Symbol**: Verify symbol is available
3. **Quantity**: Check minimum/maximum sizes
4. **Margin**: Ensure sufficient margin

### Common Errors
- `401 Unauthorized`: Invalid API key
- `403 Forbidden`: Insufficient permissions
- `429 Too Many Requests`: Rate limit exceeded
- `503 Service Unavailable`: Broker maintenance

## 📞 Support

### Broker Support
- **OANDA**: [API Documentation](https://developer.oanda.com/)
- **FXCM**: [API Documentation](https://www.fxcm.com/markets/api/)
- **Alpaca**: [API Documentation](https://alpaca.markets/docs/)
- **Interactive Brokers**: [API Documentation](https://interactivebrokers.github.io/tws-api/)

### Platform Support
- Check server logs for detailed error messages
- Verify environment variable configuration
- Test with demo accounts first
- Contact support for persistent issues

## ⚠️ Important Notes

### Demo vs Live Trading
- Always test with demo accounts first
- Demo accounts have the same features as live
- No real money risk in demo mode
- Perfect for strategy testing

### Risk Disclaimer
- Trading involves substantial risk
- Past performance doesn't guarantee future results
- Only trade with money you can afford to lose
- Use proper risk management

### Legal Compliance
- Ensure compliance with local regulations
- Check broker terms and conditions
- Understand tax implications
- Follow trading best practices

## 🎯 Next Steps

1. **Start with Demo**: Use demo accounts to learn
2. **Test Strategies**: Validate your trading strategies
3. **Risk Management**: Implement proper risk controls
4. **Live Trading**: Move to live trading when ready
5. **Monitor Performance**: Track and analyze results

---

**Happy Trading! 🚀**
