// Trading Bot Pro - Professional Trading Interface
class TradingBotPro {
    constructor() {
        this.isRunning = false;
        this.currentSymbol = 'EURUSD';
        this.currentTimeframe = '1';
        this.tradingViewWidget = null;
        this.priceUpdateInterval = null;
        this.performance = {
            pnl: 0,
            winRate: 0,
            totalTrades: 0,
            balance: 10000,
            wins: 0,
            losses: 0
        };
        this.trades = [];
        this.strategyPerformance = {
            'ma-crossover': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'rsi': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'macd': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'bollinger': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'stochastic': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'fibonacci': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'support-resistance': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'volume-price': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'machine-learning': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'multi-timeframe': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 },
            'combined': { trades: 0, wins: 0, successRate: 0, avgConfidence: 0 }
        };
        this.symbols = {
            'EURUSD': { price: 1.0850, change: 0.12 },
            'GBPUSD': { price: 1.2650, change: -0.08 },
            'USDJPY': { price: 148.50, change: 0.25 },
            'AUDUSD': { price: 0.6580, change: -0.15 },
            'USDCAD': { price: 1.3520, change: 0.05 }
        };
        
        // Initialize broker manager
        this.brokerManager = null;
        this.brokerUI = null;
        
        // Business features
        this.businessManager = null;
        this.businessUI = null;
        this.currentUser = null;
        
        // Advanced Analytics
        this.advancedAnalytics = null;
        this.analyticsUI = null;
        
        // Risk Management
        this.riskManager = null;
        this.riskUI = null;
        this.advancedOrderTypes = null;
        this.advancedOrderTypesUI = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTradingView();
        this.initializeBrokerManager();
        this.initializeBusinessManager();
        this.initializeAdvancedAnalytics();
        this.initializeRiskManager();
        this.initializeAdvancedOrderTypes();
        this.updateTime();
        this.updatePerformance();
        this.updateStrategyDisplay();
        this.addLogEntry('Trading Bot Pro initialized successfully', 'info');
        
        // Update time every second
        setInterval(() => this.updateTime(), 1000);
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('startDemo').addEventListener('click', () => this.startDemo());
        document.getElementById('startLive').addEventListener('click', () => this.startLive());
        document.getElementById('stopTrading').addEventListener('click', () => this.stopTrading());
        document.getElementById('backtest').addEventListener('click', () => this.startBacktest());

        // Symbol selection
        document.querySelectorAll('.symbol-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectSymbol(e.currentTarget.dataset.symbol);
            });
        });

        // Timeframe buttons
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeTimeframe(e.currentTarget.dataset.timeframe);
            });
        });

        // Trading panel
        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectOrderType(e.currentTarget.dataset.type);
            });
        });

        document.getElementById('placeOrder').addEventListener('click', () => this.placeOrder());

        // Chart tools
        document.getElementById('drawingTools').addEventListener('click', () => this.toggleDrawingTools());
        document.getElementById('indicators').addEventListener('click', () => this.toggleIndicators());
        document.getElementById('fullscreen').addEventListener('click', () => this.toggleFullscreen());

        // Clear log
        document.getElementById('clearLog').addEventListener('click', () => this.clearLog());

        // Settings sync
        document.getElementById('lotSize').addEventListener('change', (e) => {
            document.getElementById('orderLotSize').value = e.target.value;
        });

        document.getElementById('stopLoss').addEventListener('change', (e) => {
            document.getElementById('orderStopLoss').value = e.target.value;
        });

        document.getElementById('takeProfit').addEventListener('change', (e) => {
            document.getElementById('orderTakeProfit').value = e.target.value;
        });

        // Strategy change listener
        document.getElementById('strategy').addEventListener('change', (e) => {
            this.updateStrategyDisplay();
        });
    }

    initializeBrokerManager() {
        try {
            // Import broker manager
            const { BrokerManager } = require('./brokers/BrokerManager');
            const { BrokerConnectionUI } = require('./brokers/BrokerConnectionUI');
            
            this.brokerManager = new BrokerManager();
            this.brokerUI = new BrokerConnectionUI(this.brokerManager);
            
            this.addLogEntry('Broker manager initialized successfully', 'success');
        } catch (error) {
            console.error('Failed to initialize broker manager:', error);
            this.addLogEntry('Broker manager initialization failed', 'error');
        }
    }

    initializeBusinessManager() {
        try {
            // Import business manager
            const { BusinessManager } = require('./business/BusinessManager');
            const { BusinessUI } = require('./business/BusinessUI');
            
            this.businessManager = new BusinessManager();
            this.businessUI = new BusinessUI(this.businessManager);
            
            // Create demo user
            this.createDemoUser();
            
            this.addLogEntry('Business manager initialized successfully', 'success');
        } catch (error) {
            console.error('Failed to initialize business manager:', error);
            this.addLogEntry('Business manager initialization failed', 'error');
        }
    }

    async createDemoUser() {
        try {
            const userData = {
                email: 'demo@tradingbotpro.com',
                name: 'Demo User',
                plan: 'free'
            };
            
            this.currentUser = await this.businessManager.createUser(userData);
            this.businessUI.currentUser = this.currentUser;
            
            console.log('Demo user created:', this.currentUser);
        } catch (error) {
            console.error('Failed to create demo user:', error);
        }
    }

    initializeAdvancedAnalytics() {
        try {
            // Import advanced analytics
            const { AdvancedAnalytics } = require('./analytics/AdvancedAnalytics');
            const { AnalyticsUI } = require('./analytics/AnalyticsUI');
            
            this.advancedAnalytics = new AdvancedAnalytics();
            this.analyticsUI = new AnalyticsUI(this.advancedAnalytics);
            
            this.addLogEntry('Advanced Analytics initialized successfully', 'success');
        } catch (error) {
            console.error('Failed to initialize Advanced Analytics:', error);
            this.addLogEntry('Advanced Analytics initialization failed', 'error');
        }
    }

    initializeRiskManager() {
        try {
            // Import risk management
            const { RiskManager } = require('./risk/RiskManager');
            const { RiskManagementUI } = require('./risk/RiskManagementUI');
            
            this.riskManager = new RiskManager();
            this.riskUI = new RiskManagementUI(this.riskManager);
            
            this.addLogEntry('Risk Management initialized successfully', 'success');
        } catch (error) {
            console.error('Failed to initialize Risk Management:', error);
            this.addLogEntry('Risk Management initialization failed', 'error');
        }
    }

    initializeAdvancedOrderTypes() {
        try {
            // Import advanced order types
            const { AdvancedOrderTypes } = require('./orders/AdvancedOrderTypes.js');
            const { AdvancedOrderTypesUI } = require('./orders/AdvancedOrderTypesUI.js');
            
            this.advancedOrderTypes = new AdvancedOrderTypes();
            this.advancedOrderTypesUI = new AdvancedOrderTypesUI(this.advancedOrderTypes);
            
            // Make it globally accessible for the UI
            window.advancedOrderTypesUI = this.advancedOrderTypesUI;
            
            this.addLogEntry('Advanced Order Types initialized successfully', 'success');
        } catch (error) {
            console.error('Failed to initialize Advanced Order Types:', error);
            this.addLogEntry('Advanced Order Types initialization failed', 'error');
        }
    }

    initializeTradingView() {
        if (typeof TradingView !== 'undefined') {
            this.tradingViewWidget = new TradingView.widget({
                "width": "100%",
                "height": "100%",
                "symbol": "FX:EURUSD",
                "interval": "1",
                "timezone": "Etc/UTC",
                "theme": "dark",
                "style": "1",
                "locale": "en",
                "toolbar_bg": "#1a1a2e",
                "enable_publishing": false,
                "hide_side_toolbar": false,
                "allow_symbol_change": true,
                "container_id": "tradingview-chart",
                "studies": [
                    "MASimple@tv-basicstudies",
                    "RSI@tv-basicstudies"
                ],
                "show_popup_button": true,
                "popup_width": "1000",
                "popup_height": "650",
                "disabled_features": [
                    "use_localstorage_for_settings"
                ],
                "enabled_features": [
                    "study_templates"
                ]
            });

            this.tradingViewWidget.onChartReady(() => {
                this.addLogEntry('TradingView chart loaded successfully', 'success');
            });
        } else {
            this.addLogEntry('TradingView library not loaded', 'error');
        }
    }

    selectSymbol(symbol) {
        // Update active symbol
        document.querySelectorAll('.symbol-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-symbol="${symbol}"]`).classList.add('active');

        this.currentSymbol = symbol;
        const symbolName = document.querySelector(`[data-symbol="${symbol}"] .symbol-name`).textContent;
        
        // Update current symbol display
        document.getElementById('currentSymbol').textContent = symbolName;
        document.getElementById('currentPrice').textContent = this.symbols[symbol].price.toFixed(4);

        // Update TradingView symbol
        if (this.tradingViewWidget) {
            const tvSymbol = `FX:${symbol}`;
            this.tradingViewWidget.setSymbol(tvSymbol, this.currentTimeframe);
        }

        this.addLogEntry(`Switched to ${symbolName}`, 'info');
    }

    changeTimeframe(timeframe) {
        // Update active timeframe button
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-timeframe="${timeframe}"]`).classList.add('active');

        this.currentTimeframe = timeframe;

        // Update TradingView timeframe
        if (this.tradingViewWidget) {
            this.tradingViewWidget.setResolution(timeframe);
        }

        this.addLogEntry(`Changed timeframe to ${timeframe}`, 'info');
    }

    selectOrderType(type) {
        // Update active order type
        document.querySelectorAll('.order-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-type="${type}"]`).classList.add('active');
    }

    startDemo() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.updateStatus('Demo Mode', 'running');
        this.addLogEntry('Started demo trading mode', 'success');

        // Start price updates
        this.priceUpdateInterval = setInterval(() => {
            this.updatePrices();
            this.simulateTrading();
        }, 2000);

        // Update button states
        document.getElementById('startDemo').disabled = true;
        document.getElementById('startLive').disabled = true;
        document.getElementById('stopTrading').disabled = false;
    }

    startLive() {
        // Check feature access for live trading
        if (this.businessUI && !this.businessUI.checkFeatureAccess('live_trading')) {
            this.addLogEntry('Live trading requires a paid subscription. Please upgrade your plan.', 'warning');
            return;
        }

        if (!this.brokerManager || !this.brokerManager.getBrokerStatus().connected) {
            this.addLogEntry('Please connect to a broker first to enable live trading', 'warning');
            return;
        }

        this.isRunning = true;
        this.updateStatus('Live Trading', 'running');
        this.addLogEntry('Started live trading mode', 'success');

        // Start real-time market data subscription
        this.subscribeToLiveMarketData();

        // Start live trading with real broker
        this.priceUpdateInterval = setInterval(() => {
            this.updateLivePrices();
            this.executeLiveTrading();
        }, 2000);

        // Update button states
        document.getElementById('startDemo').disabled = true;
        document.getElementById('startLive').disabled = true;
        document.getElementById('stopTrading').disabled = false;
    }

    subscribeToLiveMarketData() {
        if (this.brokerManager) {
            const symbols = Object.keys(this.symbols);
            this.brokerManager.subscribeMarketData(symbols, (data) => {
                // Update symbol prices with real market data
                if (this.symbols[data.symbol]) {
                    const oldPrice = this.symbols[data.symbol].price;
                    const newPrice = (data.bid + data.ask) / 2;
                    const change = ((newPrice - oldPrice) / oldPrice) * 100;
                    
                    this.symbols[data.symbol].price = newPrice;
                    this.symbols[data.symbol].change = change;
                    
                    // Update display
                    this.updateSymbolDisplay(data.symbol);
                }
            });
        }
    }

    updateLivePrices() {
        // Real-time price updates are handled by WebSocket subscription
        // This method can be used for additional processing
    }

    executeLiveTrading() {
        if (!this.isRunning || !this.brokerManager) return;

        // Generate advanced trading signals using multiple strategies
        const strategy = document.getElementById('strategy').value;
        const signal = this.generateAdvancedSignal(strategy);

        if (signal && signal.confidence > 0.7) { // Higher confidence for live trading
            const lotSize = parseFloat(document.getElementById('lotSize').value);
            const stopLoss = parseFloat(document.getElementById('stopLoss').value);
            const takeProfit = parseFloat(document.getElementById('takeProfit').value);

            this.executeLiveTrade(signal.signal, lotSize, stopLoss, takeProfit, signal);
        }
    }

    async executeLiveTrade(type, lotSize, stopLoss, takeProfit, signal = null) {
        try {
            const result = await this.brokerManager.placeMarketOrder(
                this.currentSymbol,
                type,
                lotSize,
                stopLoss,
                takeProfit
            );

            const trade = {
                id: result.orderId,
                symbol: this.currentSymbol,
                type: type,
                lotSize: lotSize,
                price: result.price,
                stopLoss: stopLoss,
                takeProfit: takeProfit,
                timestamp: new Date(),
                status: 'open',
                strategy: signal ? signal.strategy : 'Live',
                confidence: signal ? signal.confidence : 0.5,
                reason: signal ? signal.reason : 'Live trade',
                broker: this.brokerManager.getBrokerStatus().broker
            };

            this.trades.push(trade);
            this.performance.totalTrades++;

            const logMessage = signal ? 
                `LIVE ${type} ${lotSize} lots ${this.currentSymbol} @ ${result.price.toFixed(4)} (${signal.strategy}: ${signal.reason})` :
                `LIVE ${type} ${lotSize} lots ${this.currentSymbol} @ ${result.price.toFixed(4)}`;
                
            this.addLogEntry(logMessage, 'trade');
            this.updatePerformance();
            this.updateStrategyPerformance(trade);

        } catch (error) {
            this.addLogEntry(`Live trade failed: ${error.message}`, 'error');
        }
    }

    updateSymbolDisplay(symbol) {
        const priceElement = document.getElementById(`${symbol}-price`);
        const changeElement = document.getElementById(`${symbol}-change`);
        
        if (priceElement) {
            priceElement.textContent = this.symbols[symbol].price.toFixed(4);
        }
        
        if (changeElement) {
            const changePercent = this.symbols[symbol].change.toFixed(2);
            changeElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent}%`;
            changeElement.className = `symbol-change ${changePercent > 0 ? 'positive' : 'negative'}`;
        }

        // Update current price if this is the active symbol
        if (symbol === this.currentSymbol) {
            document.getElementById('currentPrice').textContent = this.symbols[symbol].price.toFixed(4);
        }
    }

    stopTrading() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.updateStatus('Stopped', 'stopped');
        this.addLogEntry('Trading stopped', 'info');

        // Stop price updates
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
            this.priceUpdateInterval = null;
        }

        // Update button states
        document.getElementById('startDemo').disabled = false;
        document.getElementById('startLive').disabled = false;
        document.getElementById('stopTrading').disabled = true;
    }

    startBacktest() {
        this.addLogEntry('Starting backtest analysis...', 'info');
        // In a real implementation, this would run historical analysis
    }

    updatePrices() {
        Object.keys(this.symbols).forEach(symbol => {
            // Simulate price movement
            const currentPrice = this.symbols[symbol].price;
            const change = (Math.random() - 0.5) * 0.002; // ±0.1% change
            const newPrice = currentPrice + change;
            
            this.symbols[symbol].price = newPrice;
            this.symbols[symbol].change = change * 100;

            // Update display
            const priceElement = document.getElementById(`${symbol}-price`);
            const changeElement = document.getElementById(`${symbol}-change`);
            
            if (priceElement) {
                priceElement.textContent = newPrice.toFixed(4);
            }
            
            if (changeElement) {
                const changePercent = (change * 100).toFixed(2);
                changeElement.textContent = `${changePercent > 0 ? '+' : ''}${changePercent}%`;
                changeElement.className = `symbol-change ${changePercent > 0 ? 'positive' : 'negative'}`;
            }

            // Update current price if this is the active symbol
            if (symbol === this.currentSymbol) {
                document.getElementById('currentPrice').textContent = newPrice.toFixed(4);
            }
        });
    }

    simulateTrading() {
        if (!this.isRunning) return;

        // Generate advanced trading signals using multiple strategies
        const strategy = document.getElementById('strategy').value;
        const signal = this.generateAdvancedSignal(strategy);

        if (signal && signal.confidence > 0.6) {
            const lotSize = parseFloat(document.getElementById('lotSize').value);
            const stopLoss = parseFloat(document.getElementById('stopLoss').value);
            const takeProfit = parseFloat(document.getElementById('takeProfit').value);

            this.executeTrade(signal.signal, lotSize, stopLoss, takeProfit, signal);
        }
    }

    generateAdvancedSignal(strategyName) {
        // Generate simulated market data for analysis
        const marketData = this.generateMarketData();
        
        // Import advanced strategies
        const { AdvancedStrategies } = require('./strategies/AdvancedStrategies');
        const strategies = new AdvancedStrategies();

        let signal = null;

        switch (strategyName) {
            case 'ma-crossover':
                signal = strategies.movingAverageCrossover(marketData, {
                    fastPeriod: 10,
                    slowPeriod: 30,
                    maType: 'SMA'
                });
                break;
            case 'rsi':
                signal = strategies.rsiStrategy(marketData, {
                    period: 14,
                    overbought: 70,
                    oversold: 30
                });
                break;
            case 'macd':
                signal = strategies.macdStrategy(marketData, {
                    fastPeriod: 12,
                    slowPeriod: 26,
                    signalPeriod: 9
                });
                break;
            case 'bollinger':
                signal = strategies.bollingerBandsStrategy(marketData, {
                    period: 20,
                    stdDev: 2
                });
                break;
            case 'stochastic':
                signal = strategies.stochasticStrategy(marketData, {
                    kPeriod: 14,
                    dPeriod: 3,
                    overbought: 80,
                    oversold: 20
                });
                break;
            case 'fibonacci':
                signal = strategies.fibonacciStrategy(marketData, {
                    lookback: 50
                });
                break;
            case 'support-resistance':
                signal = strategies.supportResistanceStrategy(marketData, {
                    lookback: 100,
                    sensitivity: 0.02
                });
                break;
            case 'volume-price':
                signal = strategies.volumePriceStrategy(marketData, {
                    period: 20,
                    volumeThreshold: 1.5
                });
                break;
            case 'machine-learning':
                signal = strategies.machineLearningStrategy(marketData);
                break;
            case 'multi-timeframe':
                signal = strategies.multiTimeframeStrategy(marketData, {
                    timeframes: ['1m', '5m', '15m', '1h']
                });
                break;
            default:
                // Use combined strategy
                signal = strategies.combineStrategies(marketData, {
                    strategies: ['ma-crossover', 'rsi-strategy', 'macd-strategy']
                });
        }

        return signal;
    }

    generateMarketData() {
        // Generate realistic market data for strategy analysis
        const data = [];
        const basePrice = this.symbols[this.currentSymbol].price;
        
        for (let i = 0; i < 100; i++) {
            const volatility = 0.001;
            const change = (Math.random() - 0.5) * volatility;
            const price = basePrice * (1 + change * i);
            
            data.push({
                open: price * (1 + (Math.random() - 0.5) * 0.0005),
                high: price * (1 + Math.random() * 0.001),
                low: price * (1 - Math.random() * 0.001),
                close: price,
                volume: Math.floor(Math.random() * 1000) + 100
            });
        }
        
        return data;
    }

    executeTrade(type, lotSize, stopLoss, takeProfit, signal = null) {
        const symbol = this.currentSymbol;
        const price = this.symbols[symbol].price;
        const symbolName = document.querySelector(`[data-symbol="${symbol}"] .symbol-name`).textContent;

        // Simulate trade execution
        const trade = {
            id: Date.now(),
            symbol: symbolName,
            type: type,
            lotSize: lotSize,
            price: price,
            stopLoss: type === 'BUY' ? price - (stopLoss * 0.0001) : price + (stopLoss * 0.0001),
            takeProfit: type === 'BUY' ? price + (takeProfit * 0.0001) : price - (takeProfit * 0.0001),
            timestamp: new Date(),
            status: 'open',
            strategy: signal ? signal.strategy : 'Manual',
            confidence: signal ? signal.confidence : 0.5,
            reason: signal ? signal.reason : 'Manual trade'
        };

        this.trades.push(trade);
        this.performance.totalTrades++;

        const logMessage = signal ? 
            `${type} ${lotSize} lots ${symbolName} @ ${price.toFixed(4)} (${signal.strategy}: ${signal.reason})` :
            `${type} ${lotSize} lots ${symbolName} @ ${price.toFixed(4)}`;
            
        this.addLogEntry(logMessage, 'trade');
        this.updatePerformance();
        this.updateStrategyPerformance(trade);
        
        // Update risk analysis after trade
        this.updateRiskAnalysis();
    }

    updateStrategyPerformance(trade) {
        const strategy = trade.strategy.toLowerCase().replace(/\s+/g, '-');
        if (this.strategyPerformance[strategy]) {
            this.strategyPerformance[strategy].trades++;
            
            // Simulate trade outcome after a delay
            setTimeout(() => {
                const isWin = Math.random() > 0.4; // 60% win rate
                if (isWin) {
                    this.strategyPerformance[strategy].wins++;
                }
                
                this.strategyPerformance[strategy].successRate = 
                    (this.strategyPerformance[strategy].wins / this.strategyPerformance[strategy].trades) * 100;
                
                this.updateStrategyDisplay();
            }, Math.random() * 5000 + 2000);
        }
    }

    updateStrategyDisplay() {
        const currentStrategy = document.getElementById('strategy').value;
        const strategyName = this.getStrategyDisplayName(currentStrategy);
        
        document.getElementById('currentStrategy').textContent = strategyName;
        
        if (this.strategyPerformance[currentStrategy]) {
            const stats = this.strategyPerformance[currentStrategy];
            document.getElementById('strategySuccessRate').textContent = `${stats.successRate.toFixed(1)}%`;
            document.getElementById('avgConfidence').textContent = `${(stats.avgConfidence * 100).toFixed(1)}%`;
        }
        
        // Find best performing strategy
        let bestStrategy = null;
        let bestRate = 0;
        
        Object.keys(this.strategyPerformance).forEach(strategy => {
            if (this.strategyPerformance[strategy].trades > 0 && 
                this.strategyPerformance[strategy].successRate > bestRate) {
                bestRate = this.strategyPerformance[strategy].successRate;
                bestStrategy = strategy;
            }
        });
        
        if (bestStrategy) {
            document.getElementById('bestStrategy').textContent = this.getStrategyDisplayName(bestStrategy);
        }
    }

    getStrategyDisplayName(strategyKey) {
        const names = {
            'ma-crossover': 'MA Crossover',
            'rsi': 'RSI Strategy',
            'macd': 'MACD Strategy',
            'bollinger': 'Bollinger Bands',
            'stochastic': 'Stochastic',
            'fibonacci': 'Fibonacci',
            'support-resistance': 'Support/Resistance',
            'volume-price': 'Volume-Price',
            'machine-learning': 'Machine Learning',
            'multi-timeframe': 'Multi-Timeframe',
            'combined': 'Combined'
        };
        return names[strategyKey] || strategyKey;
    }

    async placeOrder() {
        // Check feature access for live trading
        if (this.businessUI && !this.businessUI.checkFeatureAccess('live_trading')) {
            this.addLogEntry('Live trading requires a paid subscription. Please upgrade your plan.', 'warning');
            return;
        }

        const orderType = document.querySelector('.order-btn.active').dataset.type;
        const lotSize = parseFloat(document.getElementById('orderLotSize').value);
        const stopLoss = parseFloat(document.getElementById('orderStopLoss').value);
        const takeProfit = parseFloat(document.getElementById('orderTakeProfit').value);

        if (lotSize <= 0) {
            this.addLogEntry('Invalid lot size', 'error');
            return;
        }

        // Risk management check
        if (this.riskManager) {
            const portfolio = this.getCurrentPortfolio();
            const riskAnalysis = await this.riskManager.getRiskAnalysis(portfolio);
            
            if (riskAnalysis.riskLevel === 'CRITICAL') {
                this.addLogEntry('Risk level is CRITICAL. Trading is blocked for safety.', 'error');
                return;
            }
            
            if (riskAnalysis.overallRiskScore > 0.5) {
                this.addLogEntry('High risk detected. Consider reducing position size.', 'warning');
            }
        }

        // Track usage
        if (this.businessUI) {
            this.businessUI.trackUsage('trades', 1);
        }

        // Check if broker is connected for live trading
        if (this.brokerManager && this.brokerManager.getBrokerStatus().connected) {
            await this.executeLiveTrade(orderType.toUpperCase(), lotSize, stopLoss, takeProfit);
        } else {
            // Use demo trading
            this.executeTrade(orderType.toUpperCase(), lotSize, stopLoss, takeProfit);
        }
    }

    updatePerformance() {
        // Calculate performance metrics
        const totalTrades = this.trades.length;
        const wins = this.trades.filter(trade => trade.status === 'closed' && trade.pnl > 0).length;
        const losses = this.trades.filter(trade => trade.status === 'closed' && trade.pnl < 0).length;
        const winRate = totalTrades > 0 ? (wins / totalTrades * 100) : 0;

        // Update display
        document.getElementById('pnlValue').textContent = `$${this.performance.pnl.toFixed(2)}`;
        document.getElementById('winRate').textContent = `${winRate.toFixed(1)}%`;
        document.getElementById('winRateChange').textContent = `${wins}/${totalTrades}`;
        document.getElementById('totalTrades').textContent = totalTrades;
        document.getElementById('totalTradesChange').textContent = `Today: ${totalTrades}`;
        document.getElementById('balance').textContent = `$${this.performance.balance.toFixed(2)}`;

        // Update P&L color
        const pnlElement = document.getElementById('pnlValue');
        pnlElement.style.color = this.performance.pnl >= 0 ? '#4caf50' : '#f44336';
    }

    updateStatus(text, status) {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');
        
        statusText.textContent = text;
        
        // Update status dot color
        statusDot.className = 'status-dot';
        if (status === 'running') {
            statusDot.style.background = '#4caf50';
        } else if (status === 'stopped') {
            statusDot.style.background = '#f44336';
        } else {
            statusDot.style.background = '#4ecdc4';
        }
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('currentTime').textContent = timeString;
    }

    addLogEntry(message, type = 'info') {
        const logContent = document.getElementById('logContent');
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.innerHTML = `
            <span class="log-time">${timeString}</span>
            <span class="log-message">${message}</span>
        `;
        
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    clearLog() {
        const logContent = document.getElementById('logContent');
        logContent.innerHTML = '';
        this.addLogEntry('Log cleared', 'info');
    }

    getCurrentPortfolio() {
        return {
            balance: this.performance.balance,
            marginAvailable: this.performance.balance * 0.8, // 80% margin available
            marginUsed: this.performance.balance * 0.2, // 20% margin used
            positions: this.trades.filter(trade => trade.status === 'open').map(trade => ({
                symbol: trade.symbol,
                lotSize: trade.lotSize,
                price: trade.price,
                stopLoss: trade.stopLoss,
                takeProfit: trade.takeProfit,
                margin: trade.lotSize * trade.price * 100000 * 0.02 // 2% margin requirement
            }))
        };
    }

    async updateRiskAnalysis() {
        if (this.riskManager && this.riskUI) {
            const portfolio = this.getCurrentPortfolio();
            await this.riskUI.updateRiskAnalysis(portfolio);
        }
    }

    toggleDrawingTools() {
        this.addLogEntry('Drawing tools toggled', 'info');
        // In a real implementation, this would toggle TradingView drawing tools
    }

    toggleIndicators() {
        this.addLogEntry('Indicators panel toggled', 'info');
        // In a real implementation, this would toggle TradingView indicators
    }

    toggleFullscreen() {
        const chartContainer = document.querySelector('.chart-container');
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            chartContainer.requestFullscreen();
        }
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tradingBot = new TradingBotPro();
});

// Handle window resize for responsive design
window.addEventListener('resize', () => {
    if (window.tradingBot && window.tradingBot.tradingViewWidget) {
        // TradingView widget automatically handles resize
    }
});

// Handle beforeunload to clean up
window.addEventListener('beforeunload', () => {
    if (window.tradingBot) {
        window.tradingBot.stopTrading();
    }
});
