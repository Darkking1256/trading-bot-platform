const readline = require('readline');

class TradingBotDemo {
    constructor() {
        this.isRunning = false;
        this.performance = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalPnL: 0,
            winRate: 0
        };
        this.simulatedPrices = {
            'EUR/USD': { bid: 1.0850, ask: 1.0852 },
            'GBP/USD': { bid: 1.2650, ask: 1.2653 },
            'USD/JPY': { bid: 148.50, ask: 148.53 },
            'AUD/USD': { bid: 0.6650, ask: 0.6653 },
            'USD/CAD': { bid: 1.3550, ask: 1.3553 }
        };
        this.priceHistory = {};
        this.initializePriceHistory();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
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

    calculateSMA(prices, period) {
        if (prices.length < period) return [];
        const sma = [];
        for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }
        return sma;
    }

    generateSignals() {
        const signals = [];
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
                signals.push({
                    type: 'BUY',
                    symbol: symbol,
                    price: this.simulatedPrices[symbol].ask,
                    confidence: Math.random() * 30 + 70
                });
            }
            // Bearish crossover
            else if (previousFast >= previousSlow && currentFast < currentSlow) {
                signals.push({
                    type: 'SELL',
                    symbol: symbol,
                    price: this.simulatedPrices[symbol].bid,
                    confidence: Math.random() * 30 + 70
                });
            }
        });
        
        return signals;
    }

    executeSignal(signal) {
        console.log(`🎯 Signal: ${signal.type} ${signal.symbol} at ${signal.price} (${signal.confidence.toFixed(1)}% confidence)`);
        
        // Simulate trade outcome after a delay
        setTimeout(() => {
            const isWin = Math.random() > 0.4; // 60% win rate
            const pnl = isWin ? (Math.random() * 20 + 10) : -(Math.random() * 15 + 5);
            
            this.performance.totalTrades++;
            this.performance.totalPnL += pnl;
            
            if (isWin) {
                this.performance.winningTrades++;
                console.log(`✅ Trade closed: +$${pnl.toFixed(2)}`);
            } else {
                this.performance.losingTrades++;
                console.log(`❌ Trade closed: $${pnl.toFixed(2)}`);
            }
            
            this.performance.winRate = (this.performance.winningTrades / this.performance.totalTrades) * 100;
            this.displayPerformance();
        }, Math.random() * 3000 + 2000);
    }

    displayPerformance() {
        console.log('\n📊 Performance Summary:');
        console.log(`Total Trades: ${this.performance.totalTrades}`);
        console.log(`Win Rate: ${this.performance.winRate.toFixed(1)}%`);
        console.log(`Total P&L: $${this.performance.totalPnL.toFixed(2)}`);
        console.log(`Winning Trades: ${this.performance.winningTrades}`);
        console.log(`Losing Trades: ${this.performance.losingTrades}`);
        console.log('');
    }

    displayPrices() {
        console.log('\n💰 Current Prices:');
        Object.keys(this.simulatedPrices).forEach(symbol => {
            const price = this.simulatedPrices[symbol];
            console.log(`${symbol}: ${price.bid} / ${price.ask}`);
        });
        console.log('');
    }

    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('🚀 Trading Bot Demo started - simulating real market conditions');
        console.log('Press Ctrl+C to stop the bot\n');
        
        const interval = setInterval(() => {
            if (!this.isRunning) {
                clearInterval(interval);
                return;
            }
            
            // Simulate price movements
            this.simulatePriceMovement();
            
            // Generate and execute signals
            const signals = this.generateSignals();
            signals.forEach(signal => {
                this.executeSignal(signal);
            });
            
            // Display current prices occasionally
            if (Math.random() < 0.3) {
                this.displayPrices();
            }
        }, 3000);
        
        // Handle user input
        this.rl.on('line', (input) => {
            const command = input.trim().toLowerCase();
            if (command === 'stop' || command === 'quit') {
                this.stop();
            } else if (command === 'prices') {
                this.displayPrices();
            } else if (command === 'performance') {
                this.displayPerformance();
            } else if (command === 'help') {
                console.log('\nAvailable commands:');
                console.log('prices - Show current prices');
                console.log('performance - Show performance summary');
                console.log('stop/quit - Stop the bot');
                console.log('help - Show this help\n');
            }
        });
        
        // Handle Ctrl+C
        process.on('SIGINT', () => {
            this.stop();
        });
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        console.log('\n🛑 Trading Bot Demo stopped');
        this.displayPerformance();
        this.rl.close();
        process.exit(0);
    }

    reset() {
        this.performance = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            totalPnL: 0,
            winRate: 0
        };
        this.initializePriceHistory();
        console.log('🔄 Trading Bot Demo reset');
    }
}

// Main execution
console.log('=== 🤖 Trading Bot Demo ===');
console.log('Professional Automated Trading System - Simulation Mode');
console.log('No real money involved - Educational purposes only\n');

const tradingBot = new TradingBotDemo();

console.log('Available commands:');
console.log('prices - Show current prices');
console.log('performance - Show performance summary');
console.log('stop/quit - Stop the bot');
console.log('help - Show help\n');

tradingBot.start();

