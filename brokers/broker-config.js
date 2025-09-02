// Broker Configuration - Settings for Real Broker Connections
module.exports = {
    // OANDA Configuration
    oanda: {
        demo: {
            baseUrl: 'https://api-fxpractice.oanda.com',
            streamUrl: 'https://stream-fxpractice.oanda.com'
        },
        live: {
            baseUrl: 'https://api-fxtrade.oanda.com',
            streamUrl: 'https://stream-fxtrade.oanda.com'
        },
        defaultAccount: 'demo',
        supportedInstruments: [
            'EUR_USD', 'GBP_USD', 'USD_JPY', 'AUD_USD', 'USD_CAD',
            'EUR_GBP', 'EUR_JPY', 'GBP_JPY', 'AUD_JPY', 'CAD_JPY'
        ]
    },

    // FXCM Configuration
    fxcm: {
        demo: {
            baseUrl: 'https://api-demo.fxcm.com',
            streamUrl: 'wss://streaming.fxcm.com'
        },
        live: {
            baseUrl: 'https://api.fxcm.com',
            streamUrl: 'wss://streaming.fxcm.com'
        },
        defaultAccount: 'demo',
        supportedInstruments: [
            'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD',
            'EUR/GBP', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'CAD/JPY'
        ]
    },

    // Interactive Brokers Configuration
    interactiveBrokers: {
        demo: {
            host: '127.0.0.1',
            port: 7497, // TWS demo port
            clientId: 1
        },
        live: {
            host: '127.0.0.1',
            port: 7496, // TWS live port
            clientId: 1
        },
        defaultAccount: 'demo',
        supportedInstruments: [
            'EUR.USD', 'GBP.USD', 'USD.JPY', 'AUD.USD', 'USD.CAD'
        ]
    },

    // Demo Broker Configuration
    demo: {
        defaultBalance: 10000,
        defaultCurrency: 'USD',
        supportedInstruments: [
            'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD'
        ],
        simulatedSpread: 0.0002, // 2 pips spread
        simulatedSlippage: 0.0001 // 1 pip slippage
    },

    // Risk Management Settings
    riskManagement: {
        maxPositionSize: 0.02, // 2% of account per trade
        maxDailyLoss: 0.05, // 5% daily loss limit
        maxDrawdown: 0.15, // 15% max drawdown
        correlationLimit: 0.7, // Maximum correlation between positions
        maxOpenPositions: 10,
        minStopLoss: 10, // Minimum stop loss in pips
        maxStopLoss: 500, // Maximum stop loss in pips
        minTakeProfit: 10, // Minimum take profit in pips
        maxTakeProfit: 1000 // Maximum take profit in pips
    },

    // Trading Settings
    trading: {
        defaultLotSize: 0.1,
        maxLotSize: 100,
        minLotSize: 0.01,
        lotSizeStep: 0.01,
        defaultStopLoss: 50, // pips
        defaultTakeProfit: 100, // pips
        orderTimeout: 30000, // 30 seconds
        retryAttempts: 3,
        retryDelay: 5000 // 5 seconds
    },

    // Market Data Settings
    marketData: {
        updateInterval: 1000, // 1 second
        historyLength: 1000, // Number of candles to fetch
        supportedTimeframes: ['1m', '5m', '15m', '30m', '1h', '4h', '1d'],
        defaultTimeframe: '1m',
        realTimeUpdates: true,
        cacheExpiry: 60000 // 1 minute
    },

    // Notification Settings
    notifications: {
        tradeExecuted: true,
        tradeClosed: true,
        stopLossHit: true,
        takeProfitHit: true,
        connectionLost: true,
        errorOccurred: true,
        emailNotifications: false,
        pushNotifications: false
    },

    // Logging Settings
    logging: {
        level: 'info', // debug, info, warn, error
        saveToFile: true,
        maxFileSize: '10MB',
        maxFiles: 5,
        logTrades: true,
        logErrors: true,
        logPerformance: true
    },

    // Performance Tracking
    performance: {
        trackMetrics: true,
        calculateSharpeRatio: true,
        calculateMaxDrawdown: true,
        calculateWinRate: true,
        calculateProfitFactor: true,
        saveHistory: true,
        exportReports: true
    },

    // Security Settings
    security: {
        encryptCredentials: true,
        sessionTimeout: 3600000, // 1 hour
        maxLoginAttempts: 3,
        requireTwoFactor: false,
        ipWhitelist: [],
        apiKeyRotation: false
    },

    // UI Settings
    ui: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
        currencyFormat: 'USD',
        decimalPlaces: 4,
        showPips: true,
        showPercentages: true
    }
};






