const TradingBot = require('./TradingBot');
const config = require('./config');

// Example 1: OANDA Demo Account with Moving Average Crossover
async function runOANDADemo() {
  console.log('=== OANDA Demo Trading Bot ===');
  
  const botConfig = {
    name: 'OANDA_MA_Bot',
    isDemo: true,
    broker: 'OANDA',
    apiKey: config.broker.oanda.apiKey,
    accountId: config.broker.oanda.accountId,
    baseUrl: config.broker.oanda.baseUrl,
    // Strategy settings
    fastPeriod: 10,
    slowPeriod: 30,
    maType: 'SMA',
    lotSize: 0.01, // Small lot size for demo
    stopLoss: 50,
    takeProfit: 100,
    // Risk management
    maxPositions: 2,
    maxDailyLoss: 50,
    maxRiskPerTrade: 1
  };

  const bot = new TradingBot(botConfig);
  
  try {
    // Start the bot
    const started = await bot.start();
    if (!started) {
      console.log('Failed to start bot');
      return;
    }

    // Monitor bot status
    setInterval(() => {
      const status = bot.getStatus();
      console.log(`Bot Status: ${status.isActive ? 'Running' : 'Stopped'}`);
      console.log(`Positions: ${status.broker.positions}`);
      console.log(`Total P&L: $${status.performance.totalPnL.toFixed(2)}`);
    }, 30000); // Check every 30 seconds

    // Run for 1 hour then stop
    setTimeout(async () => {
      console.log('Stopping bot after 1 hour...');
      await bot.stop();
    }, 3600000);

  } catch (error) {
    console.error('Error running OANDA demo:', error);
  }
}

// Example 2: FXCM Live Account (BE CAREFUL!)
async function runFXCMLive() {
  console.log('=== FXCM Live Trading Bot ===');
  console.log('⚠️  WARNING: This is LIVE trading with real money! ⚠️');
  
  const botConfig = {
    name: 'FXCM_Live_Bot',
    isDemo: false, // LIVE TRADING
    broker: 'FXCM',
    apiKey: config.broker.fxcm.apiKey,
    accountId: config.broker.fxcm.accountId,
    baseUrl: config.broker.fxcm.baseUrl,
    // Conservative settings for live trading
    fastPeriod: 20,
    slowPeriod: 50,
    maType: 'EMA',
    lotSize: 0.01, // Very small lot size
    stopLoss: 30,
    takeProfit: 60,
    // Strict risk management
    maxPositions: 1,
    maxDailyLoss: 100,
    maxRiskPerTrade: 0.5
  };

  const bot = new TradingBot(botConfig);
  
  try {
    const started = await bot.start();
    if (!started) {
      console.log('Failed to start live bot');
      return;
    }

    // Monitor more frequently for live trading
    setInterval(() => {
      const status = bot.getStatus();
      console.log(`Live Bot Status: ${status.isActive ? 'Running' : 'Stopped'}`);
      console.log(`Account Balance: $${status.broker.accountInfo?.balance || 'N/A'}`);
      console.log(`Daily P&L: $${status.performance.totalPnL.toFixed(2)}`);
      
      // Emergency stop if daily loss exceeded
      if (status.performance.totalPnL < -100) {
        console.log('🚨 EMERGENCY STOP: Daily loss limit exceeded!');
        bot.stop();
      }
    }, 10000); // Check every 10 seconds

  } catch (error) {
    console.error('Error running FXCM live:', error);
  }
}

// Example 3: Backtesting Mode
async function runBacktest() {
  console.log('=== Backtesting Mode ===');
  
  const botConfig = {
    name: 'Backtest_Bot',
    isDemo: true,
    broker: 'OANDA',
    apiKey: config.broker.oanda.apiKey,
    accountId: config.broker.oanda.accountId,
    baseUrl: config.broker.oanda.baseUrl,
    // Test different parameters
    fastPeriod: 5,
    slowPeriod: 20,
    maType: 'EMA',
    lotSize: 0.1,
    stopLoss: 40,
    takeProfit: 80,
    maxPositions: 3,
    maxDailyLoss: 200,
    maxRiskPerTrade: 2
  };

  const bot = new TradingBot(botConfig);
  
  try {
    await bot.start();
    
    // Run backtest for 24 hours
    setTimeout(async () => {
      await bot.stop();
      
      // Print detailed performance report
      const status = bot.getStatus();
      console.log('\n=== BACKTEST RESULTS ===');
      console.log(`Total Trades: ${status.performance.totalTrades}`);
      console.log(`Win Rate: ${status.performance.winRate.toFixed(1)}%`);
      console.log(`Total P&L: $${status.performance.totalPnL.toFixed(2)}`);
      console.log(`Profit Factor: ${(status.performance.averageWin / Math.abs(status.performance.averageLoss)).toFixed(2)}`);
      console.log(`Max Drawdown: $${status.performance.maxDrawdown.toFixed(2)}`);
    }, 86400000); // 24 hours

  } catch (error) {
    console.error('Error running backtest:', error);
  }
}

// Example 4: Multi-Strategy Bot
async function runMultiStrategy() {
  console.log('=== Multi-Strategy Bot ===');
  
  // This would require implementing multiple strategies
  // For now, just showing the concept
  console.log('Multi-strategy bot would combine:');
  console.log('- Moving Average Crossover');
  console.log('- RSI Overbought/Oversold');
  console.log('- MACD Signal Cross');
  console.log('- Position sizing based on volatility');
}

// Main execution
async function main() {
  const mode = process.argv[2] || 'demo';
  
  switch (mode) {
    case 'demo':
      await runOANDADemo();
      break;
    case 'live':
      await runFXCMLive();
      break;
    case 'backtest':
      await runBacktest();
      break;
    case 'multi':
      await runMultiStrategy();
      break;
    default:
      console.log('Usage: node example.js [demo|live|backtest|multi]');
      console.log('  demo     - Run OANDA demo account');
      console.log('  live     - Run FXCM live account (DANGEROUS!)');
      console.log('  backtest - Run backtesting mode');
      console.log('  multi    - Run multi-strategy bot');
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  runOANDADemo,
  runFXCMLive,
  runBacktest,
  runMultiStrategy
};





