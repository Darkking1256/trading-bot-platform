const { ipcRenderer } = require('electron');

class TradingBotApp {
    constructor() {
        this.isRunning = false;
        this.startTime = null;
        this.performance = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalPnL: 0,
            winRate: 0,
            bestTrade: 0
        };
        this.simulatedPrices = {
            'EUR/USD': { bid: 1.0850, ask: 1.0852 },
            'GBP/USD': { bid: 1.2650, ask: 1.2653 },
            'USD/JPY': { bid: 148.50, ask: 148.53 },
            'AUD/USD': { bid: 0.6650, ask: 0.6653 },
            'USD/CAD': { bid: 1.3550, ask: 1.3553 }
        };
        this.priceHistory = {};
        this.selectedSymbol = 'EUR/USD';
        this.interval = null;
        this.runtimeInterval = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.initializePriceHistory();
        this.setupEventListeners();
        this.updateTimeDisplay();
        this.updateStatus('Ready', 'success');
        this.addLogEntry('Trading Bot Pro initialized and ready to start', 'info');
        
        // Update time every second
        setInterval(() => {
            this.updateTimeDisplay();
        }, 1000);
    }

    initializePriceHistory() {
        Object.keys(this.simulatedPrices).forEach(symbol => {
            this.priceHistory[symbol] = [];
            // Initialize with some historical data
            for (let i = 0; i < 50; i++) {
                this.priceHistory[symbol].push(this.simulatedPrices[symbol].bid);
            }
        });
    }

    setupEventListeners() {
        // Control buttons
        document.getElementById('startDemoBtn').addEventListener('click', () => this.startDemo());
        document.getElementById('startLiveBtn').addEventListener('click', () => this.startLive());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopTrading());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());

        // Symbol selection
        document.querySelectorAll('.symbol-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectSymbol(item.dataset.symbol);
            });
        });

        // Log controls
        document.getElementById('clearLogBtn').addEventListener('click', () => this.clearLog());
        document.getElementById('exportLogBtn').addEventListener('click', () => this.exportLog());

        // Chart controls
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());
        document.getElementById('timeframeSelect').addEventListener('change', (e) => this.changeTimeframe(e.target.value));

        // Configuration changes
        document.getElementById('brokerSelect').addEventListener('change', (e) => this.updateConfiguration());
        document.getElementById('strategySelect').addEventListener('change', (e) => this.updateConfiguration());
        document.getElementById('lotSize').addEventListener('change', (e) => this.updateConfiguration());
        document.getElementById('stopLoss').addEventListener('change', (e) => this.updateConfiguration());
        document.getElementById('takeProfit').addEventListener('change', (e) => this.updateConfiguration());

        // IPC listeners
        ipcRenderer.on('start-demo', () => this.startDemo());
        ipcRenderer.on('start-live', () => this.startLive());
        ipcRenderer.on('stop-trading', () => this.stopTrading());
        ipcRenderer.on('start-backtest', () => this.startBacktest());
    }

    selectSymbol(symbol) {
        this.selectedSymbol = symbol;
        
        // Update active symbol in UI
        document.querySelectorAll('.symbol-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-symbol="${symbol}"]`).classList.add('active');
        
        this.addLogEntry(`Selected symbol: ${symbol}`, 'info');
    }

    startDemo() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = new Date();
        this.updateStatus('Demo Mode Running', 'success');
        this.updateSessionInfo('Demo Mode');
        this.addLogEntry('Demo mode started - simulating real market conditions', 'info');
        
        // Update button states
        document.getElementById('startDemoBtn').disabled = true;
        document.getElementById('startLiveBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
        // Start runtime counter
        this.startRuntimeCounter();
        
        // Start trading simulation
        this.interval = setInterval(() => {
            this.simulatePriceMovement();
            this.generateSignals();
            this.updatePrices();
        }, 2000);
        
        this.addLogEntry('Trading bot started successfully', 'success');
    }

    startLive() {
        if (this.isRunning) return;
        
        // Show warning dialog
        const confirmed = confirm('⚠️ WARNING: Live trading mode will use real money!\n\nAre you sure you want to proceed?');
        if (!confirmed) return;
        
        this.isRunning = true;
        this.startTime = new Date();
        this.updateStatus('Live Mode Running', 'warning');
        this.updateSessionInfo('Live Mode');
        this.addLogEntry('Live mode started - REAL MONEY TRADING', 'warning');
        
        // Update button states
        document.getElementById('startDemoBtn').disabled = true;
        document.getElementById('startLiveBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
        
        // Start runtime counter
        this.startRuntimeCounter();
        
        // Start trading simulation (same as demo for now)
        this.interval = setInterval(() => {
            this.simulatePriceMovement();
            this.generateSignals();
            this.updatePrices();
        }, 2000);
        
        this.addLogEntry('Live trading bot started - monitor carefully!', 'warning');
    }

    stopTrading() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        this.updateStatus('Stopped', 'error');
        this.addLogEntry('Trading bot stopped', 'info');
        
        // Clear intervals
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.runtimeInterval) {
            clearInterval(this.runtimeInterval);
            this.runtimeInterval = null;
        }
        
        // Update button states
        document.getElementById('startDemoBtn').disabled = false;
        document.getElementById('startLiveBtn').disabled = false;
        document.getElementById('stopBtn').disabled = true;
        
        // Show final performance
        this.addLogEntry(`Final P&L: $${this.performance.totalPnL.toFixed(2)}`, 'info');
    }

    reset() {
        this.stopTrading();
        
        // Reset performance
        this.performance = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalPnL: 0,
            winRate: 0,
            bestTrade: 0
        };
        
        // Reset prices
        this.initializePriceHistory();
        
        // Update UI
        this.updatePerformance();
        this.clearLog();
        this.updateStatus('Ready', 'success');
        this.updateSessionInfo('Demo Mode');
        
        this.addLogEntry('Trading bot reset - ready to start', 'info');
    }

    simulatePriceMovement() {
        Object.keys(this.simulatedPrices).forEach(symbol => {
            const currentPrice = this.simulatedPrices[symbol];
            const volatility = 0.0002;
            
            // Random price movement
            const change = (Math.random() - 0.5) * volatility;
            const newBid = currentPrice.bid + change;
            const newAsk = newBid + 0.0002;
            
            this.simulatedPrices[symbol] = {
                bid: parseFloat(newBid.toFixed(5)),
                ask: parseFloat(newAsk.toFixed(5))
            };
            
            // Add to price history
            this.priceHistory[symbol].push(this.simulatedPrices[symbol].bid);
            
            // Keep only last 100 prices
            if (this.priceHistory[symbol].length > 100) {
                this.priceHistory[symbol].shift();
            }
        });
    }

    generateSignals() {
        Object.keys(this.simulatedPrices).forEach(symbol => {
            const prices = this.priceHistory[symbol];
            if (prices.length < 30) return;
            
            const fastMA = this.calculateSMA(prices, 10);
            const slowMA = this.calculateSMA(prices, 30);
            
            if (fastMA.length < 2 || slowMA.length < 2) return;
            
            const currentFast = fastMA[fastMA.length - 1];
            const previousFast = fastMA[fastMA.length - 2];
            const currentSlow = slowMA[slowMA.length - 1];
            const previousSlow = slowMA[slowMA.length - 2];
            
            // Bullish crossover
            if (previousFast <= previousSlow && currentFast > currentSlow) {
                this.executeSignal({
                    type: 'BUY',
                    symbol: symbol,
                    price: this.simulatedPrices[symbol].ask,
                    confidence: Math.random() * 30 + 70
                });
            }
            // Bearish crossover
            else if (previousFast >= previousSlow && currentFast < currentSlow) {
                this.executeSignal({
                    type: 'SELL',
                    symbol: symbol,
                    price: this.simulatedPrices[symbol].bid,
                    confidence: Math.random() * 30 + 70
                });
            }
        });
    }

    calculateSMA(prices, period) {
        if (prices.length < period) return [];
        const sma = [];
        for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }
        return sma;
    }

    executeSignal(signal) {
        this.addLogEntry(`Signal: ${signal.type} ${signal.symbol} at ${signal.price} (${signal.confidence.toFixed(1)}% confidence)`, 'info');
        
        // Simulate trade outcome after a delay
        setTimeout(() => {
            const isWin = Math.random() > 0.4; // 60% win rate
            const pnl = isWin ? (Math.random() * 20 + 10) : -(Math.random() * 15 + 5);
            
            this.performance.totalTrades++;
            this.performance.totalPnL += pnl;
            
            if (isWin) {
                this.performance.winningTrades++;
                this.addLogEntry(`✅ Trade closed: +$${pnl.toFixed(2)}`, 'success');
            } else {
                this.performance.losingTrades++;
                this.addLogEntry(`❌ Trade closed: $${pnl.toFixed(2)}`, 'error');
            }
            
            // Update best trade
            if (pnl > this.performance.bestTrade) {
                this.performance.bestTrade = pnl;
            }
            
            this.performance.winRate = (this.performance.winningTrades / this.performance.totalTrades) * 100;
            this.updatePerformance();
        }, Math.random() * 3000 + 2000);
    }

    updatePrices() {
        Object.keys(this.simulatedPrices).forEach(symbol => {
            const priceElement = document.getElementById(`price-${symbol}`);
            if (priceElement) {
                const price = this.simulatedPrices[symbol];
                priceElement.textContent = price.bid.toFixed(5);
            }
        });
    }

    updatePerformance() {
        document.getElementById('totalPnL').textContent = `$${this.performance.totalPnL.toFixed(2)}`;
        document.getElementById('winRate').textContent = `${this.performance.winRate.toFixed(1)}%`;
        document.getElementById('totalTrades').textContent = this.performance.totalTrades;
        document.getElementById('bestTrade').textContent = `$${this.performance.bestTrade.toFixed(2)}`;
        
        // Update change indicators
        document.getElementById('pnlChange').textContent = this.performance.totalPnL >= 0 ? '+0.00%' : '-0.00%';
        document.getElementById('winRateChange').textContent = `${this.performance.totalTrades} trades`;
        document.getElementById('tradesChange').textContent = '0 today';
        document.getElementById('bestTradeChange').textContent = this.selectedSymbol;
    }

    updateStatus(text, type) {
        const statusText = document.getElementById('statusText');
        const statusDot = document.getElementById('statusDot');
        
        statusText.textContent = text;
        statusDot.className = `status-dot ${type}`;
    }

    updateSessionInfo(session) {
        document.getElementById('sessionInfo').textContent = session;
    }

    updateTimeDisplay() {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('timeDisplay').textContent = timeString;
        document.getElementById('lastUpdate').textContent = `Last update: ${timeString}`;
    }

    startRuntimeCounter() {
        this.runtimeInterval = setInterval(() => {
            if (this.startTime) {
                const now = new Date();
                const diff = now - this.startTime;
                const hours = Math.floor(diff / 3600000);
                const minutes = Math.floor((diff % 3600000) / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                
                const runtimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                document.getElementById('runtimeInfo').textContent = runtimeString;
            }
        }, 1000);
    }

    addLogEntry(message, type = 'info') {
        const logContent = document.getElementById('logContent');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const time = new Date().toLocaleTimeString();
        logEntry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-message">${message}</span>
        `;
        
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
        
        // Keep only last 100 entries
        while (logContent.children.length > 100) {
            logContent.removeChild(logContent.firstChild);
        }
    }

    clearLog() {
        const logContent = document.getElementById('logContent');
        logContent.innerHTML = '';
        this.addLogEntry('Log cleared', 'info');
    }

    exportLog() {
        const logContent = document.getElementById('logContent');
        const logText = Array.from(logContent.children)
            .map(entry => `${entry.querySelector('.log-time').textContent} - ${entry.querySelector('.log-message').textContent}`)
            .join('\n');
        
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trading-log-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.addLogEntry('Trading log exported', 'info');
    }

    toggleFullscreen() {
        const chartArea = document.getElementById('chartArea');
        if (chartArea.requestFullscreen) {
            chartArea.requestFullscreen();
        }
    }

    changeTimeframe(timeframe) {
        this.addLogEntry(`Timeframe changed to ${timeframe}`, 'info');
        // Here you would update the chart with new timeframe data
    }

    updateConfiguration() {
        const broker = document.getElementById('brokerSelect').value;
        const strategy = document.getElementById('strategySelect').value;
        const lotSize = document.getElementById('lotSize').value;
        const stopLoss = document.getElementById('stopLoss').value;
        const takeProfit = document.getElementById('takeProfit').value;
        
        this.addLogEntry(`Configuration updated: ${broker}, ${strategy}, Lot: ${lotSize}, SL: ${stopLoss}, TP: ${takeProfit}`, 'info');
    }

    startBacktest() {
        this.addLogEntry('Backtest mode started - analyzing historical data', 'info');
        // Implement backtest functionality
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.tradingBotApp = new TradingBotApp();
});
