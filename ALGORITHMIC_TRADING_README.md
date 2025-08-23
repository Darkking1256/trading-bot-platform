# Algorithmic Trading System

## Overview

The Algorithmic Trading system provides automated trading capabilities with a modular, extensible architecture. It includes a core strategy engine, base strategy framework, and multiple pre-built trading strategies.

## Architecture

### Core Components

1. **StrategyEngine** (`strategies/engine/StrategyEngine.js`)
   - Central orchestrator for all trading strategies
   - Manages strategy lifecycle (create, start, stop, delete)
   - Handles market data distribution
   - Processes trading signals with risk management
   - Monitors performance and generates reports

2. **BaseStrategy** (`strategies/base/BaseStrategy.js`)
   - Foundation class for all trading strategies
   - Provides common functionality and technical indicators
   - Manages strategy state and configuration
   - Handles signal generation and position management

3. **Trading Strategies**
   - **MovingAverageCrossoverStrategy**: Trend-following strategy based on MA crossovers
   - **RSIDivergenceStrategy**: Mean reversion strategy using RSI divergence
   - **BollingerBandsStrategy**: Volatility-based strategy using Bollinger Bands

## Features

### Strategy Engine Features
- **Multi-Strategy Management**: Run multiple strategies simultaneously
- **Real-time Market Data**: Live price feeds and technical indicators
- **Risk Management**: Built-in position sizing and risk controls
- **Performance Monitoring**: Real-time P&L tracking and statistics
- **Event System**: Comprehensive event handling for signals, orders, and positions

### Strategy Features
- **Modular Design**: Easy to create new strategies by extending BaseStrategy
- **Technical Indicators**: Built-in calculations for common indicators
- **Signal Generation**: Automated trading signal detection
- **Position Management**: Automatic stop-loss and take-profit handling
- **Configuration Management**: Flexible parameter configuration

### UI Features
- **Strategy Dashboard**: Overview of all active strategies
- **Performance Metrics**: Real-time P&L, win rate, and trade statistics
- **Signal Monitoring**: Live trading signal feed
- **Order Tracking**: Real-time order execution monitoring
- **Strategy Configuration**: Easy setup and parameter adjustment

## Technical Indicators

The system includes comprehensive technical indicator calculations:

### Trend Indicators
- **Simple Moving Average (SMA)**
- **Exponential Moving Average (EMA)**
- **Moving Average Convergence Divergence (MACD)**

### Momentum Indicators
- **Relative Strength Index (RSI)**
- **Stochastic Oscillator**
- **Williams %R**

### Volatility Indicators
- **Bollinger Bands**
- **Average True Range (ATR)**
- **Standard Deviation**

### Volume Indicators
- **Volume SMA**
- **Volume Rate of Change**
- **On-Balance Volume (OBV)**

## Trading Strategies

### 1. Moving Average Crossover Strategy

**Type**: Trend Following
**Description**: Generates signals when fast and slow moving averages cross

**Parameters**:
- `fastPeriod`: Fast MA period (default: 10)
- `slowPeriod`: Slow MA period (default: 30)
- `maType`: MA type - 'SMA' or 'EMA' (default: 'SMA')
- `confirmationPeriod`: Number of confirmations required (default: 1)

**Signals**:
- **BUY**: Fast MA crosses above slow MA
- **SELL**: Fast MA crosses below slow MA

### 2. RSI Divergence Strategy

**Type**: Mean Reversion
**Description**: Detects RSI divergence patterns for reversal signals

**Parameters**:
- `rsiPeriod`: RSI calculation period (default: 14)
- `overbought`: Overbought threshold (default: 70)
- `oversold`: Oversold threshold (default: 30)
- `divergenceLookback`: Bars to look back for divergence (default: 10)
- `confirmationPeriod`: Number of confirmations required (default: 2)

**Signals**:
- **BUY**: Bullish divergence (price lower low, RSI higher low)
- **SELL**: Bearish divergence (price higher high, RSI lower high)

### 3. Bollinger Bands Strategy

**Type**: Volatility
**Description**: Trades on Bollinger Bands breakouts and reversals

**Parameters**:
- `period`: BB calculation period (default: 20)
- `stdDev`: Standard deviation multiplier (default: 2)
- `confirmationPeriod`: Number of confirmations required (default: 1)
- `volumeThreshold`: Volume multiplier for confirmation (default: 1.5)

**Signals**:
- **BUY**: Price breaks above upper band with volume
- **SELL**: Price breaks below lower band with volume
- **BUY**: Price bounces off lower band toward middle
- **SELL**: Price bounces off upper band toward middle

## API Reference

### StrategyEngine Methods

```javascript
// Initialize the engine
const engine = new StrategyEngine(config);

// Start/stop the engine
engine.start();
engine.stop();

// Strategy management
engine.createStrategy(strategyName, config);
engine.startStrategy(strategyId);
engine.stopStrategy(strategyId);
engine.deleteStrategy(strategyId);

// Market data
engine.updateMarketData(symbol, data);

// Performance
engine.getPerformance();
engine.getStrategyPerformance(strategyId);
```

### BaseStrategy Methods

```javascript
// Initialize strategy
strategy.initialize(config);

// Check for signals
strategy.checkSignals(symbol, data);

// Generate signal
strategy.generateSignal(type, symbol, price, confidence, reason);

// Calculate indicators
strategy.calculateSMA(data, period);
strategy.calculateEMA(data, period);
strategy.calculateRSI(data, period);
strategy.calculateMACD(data, fastPeriod, slowPeriod, signalPeriod);
strategy.calculateBollingerBands(data, period, stdDev);
```

## Configuration

### Strategy Engine Configuration

```javascript
const engineConfig = {
  maxStrategies: 10,
  maxPositions: 5,
  riskPercentage: 2,
  defaultLotSize: 0.1,
  enableRealTime: true,
  enableBacktesting: true
};
```

### Strategy Configuration

```javascript
const strategyConfig = {
  symbols: ['EURUSD', 'GBPUSD'],
  lotSize: 0.1,
  stopLoss: 50, // pips
  takeProfit: 100, // pips
  maxPositions: 1,
  riskPercentage: 2
};
```

## Risk Management

### Built-in Risk Controls

1. **Position Sizing**: Automatic lot size calculation based on risk percentage
2. **Stop Loss**: Automatic stop-loss placement
3. **Take Profit**: Automatic take-profit placement
4. **Maximum Positions**: Limit concurrent open positions
5. **Risk Percentage**: Maximum risk per trade as percentage of account

### Risk Parameters

```javascript
const riskConfig = {
  maxRiskPerTrade: 2, // percentage
  maxDailyLoss: 5, // percentage
  maxDrawdown: 10, // percentage
  correlationLimit: 0.7, // maximum correlation between positions
  volatilityFilter: true // filter trades based on volatility
};
```

## Performance Metrics

### Strategy Performance

- **Total Trades**: Number of completed trades
- **Winning Trades**: Number of profitable trades
- **Win Rate**: Percentage of winning trades
- **Total P&L**: Overall profit/loss
- **Average Win**: Average profit per winning trade
- **Average Loss**: Average loss per losing trade
- **Max Drawdown**: Maximum peak-to-trough decline
- **Sharpe Ratio**: Risk-adjusted return measure

### Engine Performance

- **Overall P&L**: Combined P&L from all strategies
- **Active Strategies**: Number of currently running strategies
- **Total Signals**: Number of signals generated
- **Signal Quality**: Average signal confidence
- **Execution Rate**: Percentage of signals executed

## Event System

### Available Events

```javascript
// Strategy events
engine.on('strategyCreated', (strategy) => {});
engine.on('strategyStarted', (strategyId) => {});
engine.on('strategyStopped', (strategyId) => {});
engine.on('strategyDeleted', (strategyId) => {});

// Trading events
engine.on('signal', (signal) => {});
engine.on('order', (order) => {});
engine.on('position', (position) => {});

// Performance events
engine.on('performance', (performance) => {});
engine.on('error', (error) => {});
```

## Creating Custom Strategies

### Step 1: Extend BaseStrategy

```javascript
const BaseStrategy = require('./base/BaseStrategy');

class CustomStrategy extends BaseStrategy {
  constructor(config = {}) {
    super({
      name: 'Custom Strategy',
      description: 'My custom trading strategy',
      category: 'Custom',
      ...config
    });
    
    // Strategy-specific parameters
    this.param1 = config.param1 || 10;
    this.param2 = config.param2 || 20;
  }

  // Initialize strategy
  initialize(config) {
    console.log('Initializing Custom Strategy');
  }

  // Check for signals
  checkSignals(symbol, data) {
    // Your signal logic here
    if (this.shouldBuy(data)) {
      this.generateSignal('BUY', symbol, data.close, 0.8, 'Custom buy signal');
    }
  }

  shouldBuy(data) {
    // Your buy condition logic
    return true;
  }
}
```

### Step 2: Register with Engine

```javascript
const engine = new StrategyEngine();
engine.registerStrategy('CustomStrategy', CustomStrategy);

// Create instance
const strategy = engine.createStrategy('CustomStrategy', {
  symbols: ['EURUSD'],
  param1: 15,
  param2: 25
});
```

## Backtesting

### Backtesting Engine

```javascript
const backtestConfig = {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  initialCapital: 10000,
  symbols: ['EURUSD'],
  timeframe: '1H'
};

const results = await engine.backtest(strategy, backtestConfig);
```

### Backtest Results

```javascript
{
  totalTrades: 150,
  winningTrades: 90,
  winRate: 60.0,
  totalPnL: 2500.50,
  maxDrawdown: -500.25,
  sharpeRatio: 1.85,
  trades: [...],
  equity: [...]
}
```

## Deployment

### Production Considerations

1. **Database Integration**: Replace in-memory storage with persistent database
2. **Market Data**: Integrate with real market data providers
3. **Order Execution**: Connect to actual broker APIs
4. **Monitoring**: Implement comprehensive logging and monitoring
5. **Security**: Add authentication and authorization
6. **Scalability**: Implement load balancing and clustering

### Environment Variables

```bash
# Database
DATABASE_URL=mongodb://localhost:27017/trading

# Market Data
MARKET_DATA_API_KEY=your_api_key
MARKET_DATA_URL=https://api.marketdata.com

# Broker
BROKER_API_KEY=your_broker_key
BROKER_SECRET=your_broker_secret

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
```

## Troubleshooting

### Common Issues

1. **Strategy Not Starting**
   - Check strategy configuration
   - Verify market data availability
   - Review error logs

2. **No Signals Generated**
   - Verify strategy parameters
   - Check market data quality
   - Review signal conditions

3. **Performance Issues**
   - Monitor system resources
   - Check database performance
   - Review strategy complexity

### Debug Mode

```javascript
const engine = new StrategyEngine({
  debug: true,
  logLevel: 'verbose'
});
```

## Future Enhancements

### Planned Features

1. **Machine Learning Integration**
   - ML-based signal generation
   - Pattern recognition
   - Predictive analytics

2. **Advanced Risk Management**
   - Portfolio-level risk controls
   - Dynamic position sizing
   - Correlation analysis

3. **Social Trading**
   - Strategy sharing
   - Copy trading
   - Community features

4. **Mobile App**
   - Strategy monitoring
   - Real-time alerts
   - Mobile trading

## Support

For technical support and questions:
- Check the documentation
- Review error logs
- Test with sample data
- Contact development team

## License

This algorithmic trading system is proprietary software. All rights reserved.
