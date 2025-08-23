// Trading Bot Configuration
module.exports = {
  // Bot Settings
  bot: {
    name: 'MA_Crossover_Bot',
    isDemo: true, // Set to false for live trading
    closePositionsOnStop: true
  },

  // Broker Configuration
  broker: {
    // OANDA Configuration
    oanda: {
      broker: 'OANDA',
      apiKey: process.env.OANDA_API_KEY || 'your_oanda_api_key_here',
      accountId: process.env.OANDA_ACCOUNT_ID || 'your_oanda_account_id_here',
      baseUrl: 'https://api-fxtrade.oanda.com/v3',
      isDemo: true
    },

    // FXCM Configuration
    fxcm: {
      broker: 'FXCM',
      apiKey: process.env.FXCM_API_KEY || 'your_fxcm_api_key_here',
      accountId: process.env.FXCM_ACCOUNT_ID || 'your_fxcm_account_id_here',
      baseUrl: 'https://api-demo.fxcm.com',
      isDemo: true
    },

    // Interactive Brokers Configuration
    ib: {
      broker: 'IB',
      apiKey: process.env.IB_API_KEY || 'your_ib_api_key_here',
      accountId: process.env.IB_ACCOUNT_ID || 'your_ib_account_id_here',
      baseUrl: 'https://localhost:5000/v1/portal',
      isDemo: true
    }
  },

  // Strategy Configuration
  strategy: {
    // Moving Average Crossover
    maCrossover: {
      fastPeriod: 10,
      slowPeriod: 30,
      maType: 'SMA', // 'SMA' or 'EMA'
      lotSize: 0.1,
      stopLoss: 50, // pips
      takeProfit: 100, // pips
      maxPositions: 3
    },

    // RSI Strategy
    rsi: {
      period: 14,
      overbought: 70,
      oversold: 30,
      lotSize: 0.1,
      stopLoss: 50,
      takeProfit: 100,
      maxPositions: 2
    },

    // MACD Strategy
    macd: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      lotSize: 0.1,
      stopLoss: 50,
      takeProfit: 100,
      maxPositions: 2
    }
  },

  // Risk Management
  risk: {
    maxPositions: 3,
    maxDailyLoss: 200, // USD
    maxRiskPerTrade: 1, // % of account
    maxDrawdown: 10, // % of account
    correlationLimit: 0.7 // Maximum correlation between positions
  },

  // Trading Pairs
  symbols: [
    'EUR_USD',
    'GBP_USD', 
    'USD_JPY',
    'USD_CHF',
    'AUD_USD',
    'USD_CAD',
    'NZD_USD'
  ],

  // Time Filters
  timeFilter: {
    enabled: true,
    startHour: 8, // UTC
    endHour: 20, // UTC
    excludeWeekends: true,
    excludeHolidays: true
  },

  // Performance Tracking
  performance: {
    trackMetrics: true,
    saveTrades: true,
    generateReports: true,
    alertOnDrawdown: true,
    drawdownThreshold: 5 // %
  },

  // Notifications
  notifications: {
    enabled: true,
    email: {
      enabled: false,
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      },
      recipients: ['your-email@example.com']
    },
    telegram: {
      enabled: false,
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID
    }
  },

  // Logging
  logging: {
    level: 'info', // 'debug', 'info', 'warn', 'error'
    saveToFile: true,
    logFile: 'trading-bot.log',
    maxFileSize: '10MB',
    maxFiles: 5
  }
};




