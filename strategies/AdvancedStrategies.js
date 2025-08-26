// Advanced Trading Strategies for Trading Bot Pro
class AdvancedStrategies {
    constructor() {
        this.strategies = {
            'ma-crossover': this.movingAverageCrossover,
            'rsi-strategy': this.rsiStrategy,
            'macd-strategy': this.macdStrategy,
            'bollinger-bands': this.bollingerBandsStrategy,
            'stochastic': this.stochasticStrategy,
            'fibonacci': this.fibonacciStrategy,
            'support-resistance': this.supportResistanceStrategy,
            'volume-price': this.volumePriceStrategy,
            'machine-learning': this.machineLearningStrategy,
            'multi-timeframe': this.multiTimeframeStrategy
        };
        
        this.indicators = {};
        this.riskManager = new RiskManager();
        this.portfolioOptimizer = new PortfolioOptimizer();
    }

    // Moving Average Crossover Strategy
    movingAverageCrossover(data, params = {}) {
        const fastPeriod = params.fastPeriod || 10;
        const slowPeriod = params.slowPeriod || 30;
        const maType = params.maType || 'SMA';

        const fastMA = this.calculateMA(data, fastPeriod, maType);
        const slowMA = this.calculateMA(data, slowPeriod, maType);

        if (fastMA.length < 2 || slowMA.length < 2) return null;

        const currentFast = fastMA[fastMA.length - 1];
        const previousFast = fastMA[fastMA.length - 2];
        const currentSlow = slowMA[slowMA.length - 1];
        const previousSlow = slowMA[slowMA.length - 2];

        // Bullish crossover
        if (previousFast <= previousSlow && currentFast > currentSlow) {
            return {
                signal: 'BUY',
                strength: Math.abs(currentFast - currentSlow) / currentSlow * 100,
                confidence: 0.8,
                strategy: 'MA Crossover',
                reason: `Fast MA (${fastPeriod}) crossed above Slow MA (${slowPeriod})`
            };
        }
        // Bearish crossover
        else if (previousFast >= previousSlow && currentFast < currentSlow) {
            return {
                signal: 'SELL',
                strength: Math.abs(currentFast - currentSlow) / currentSlow * 100,
                confidence: 0.8,
                strategy: 'MA Crossover',
                reason: `Fast MA (${fastPeriod}) crossed below Slow MA (${slowPeriod})`
            };
        }

        return null;
    }

    // RSI Strategy with Divergence Detection
    rsiStrategy(data, params = {}) {
        const period = params.period || 14;
        const overbought = params.overbought || 70;
        const oversold = params.oversold || 30;

        const rsi = this.calculateRSI(data, period);
        if (rsi.length < 2) return null;

        const currentRSI = rsi[rsi.length - 1];
        const previousRSI = rsi[rsi.length - 2];
        const currentPrice = data[data.length - 1].close;
        const previousPrice = data[data.length - 2].close;

        // Overbought condition
        if (currentRSI > overbought && previousRSI <= overbought) {
            return {
                signal: 'SELL',
                strength: (currentRSI - overbought) / (100 - overbought),
                confidence: 0.75,
                strategy: 'RSI',
                reason: `RSI overbought (${currentRSI.toFixed(2)})`
            };
        }
        // Oversold condition
        else if (currentRSI < oversold && previousRSI >= oversold) {
            return {
                signal: 'BUY',
                strength: (oversold - currentRSI) / oversold,
                confidence: 0.75,
                strategy: 'RSI',
                reason: `RSI oversold (${currentRSI.toFixed(2)})`
            };
        }

        // Divergence detection
        const divergence = this.detectDivergence(data, rsi);
        if (divergence) {
            return {
                signal: divergence.signal,
                strength: 0.9,
                confidence: 0.85,
                strategy: 'RSI Divergence',
                reason: divergence.reason
            };
        }

        return null;
    }

    // MACD Strategy with Signal Line
    macdStrategy(data, params = {}) {
        const fastPeriod = params.fastPeriod || 12;
        const slowPeriod = params.slowPeriod || 26;
        const signalPeriod = params.signalPeriod || 9;

        const macd = this.calculateMACD(data, fastPeriod, slowPeriod, signalPeriod);
        if (macd.length < 2) return null;

        const currentMACD = macd[macd.length - 1];
        const previousMACD = macd[macd.length - 2];
        const currentSignal = currentMACD.signal;
        const previousSignal = previousMACD.signal;

        // Bullish crossover
        if (previousMACD.macd <= previousSignal && currentMACD.macd > currentSignal) {
            return {
                signal: 'BUY',
                strength: Math.abs(currentMACD.macd - currentSignal),
                confidence: 0.8,
                strategy: 'MACD',
                reason: 'MACD crossed above signal line'
            };
        }
        // Bearish crossover
        else if (previousMACD.macd >= previousSignal && currentMACD.macd < currentSignal) {
            return {
                signal: 'SELL',
                strength: Math.abs(currentMACD.macd - currentSignal),
                confidence: 0.8,
                strategy: 'MACD',
                reason: 'MACD crossed below signal line'
            };
        }

        return null;
    }

    // Bollinger Bands Strategy
    bollingerBandsStrategy(data, params = {}) {
        const period = params.period || 20;
        const stdDev = params.stdDev || 2;

        const bb = this.calculateBollingerBands(data, period, stdDev);
        if (bb.length < 1) return null;

        const currentBB = bb[bb.length - 1];
        const currentPrice = data[data.length - 1].close;

        // Price touches lower band (oversold)
        if (currentPrice <= currentBB.lower) {
            return {
                signal: 'BUY',
                strength: (currentBB.lower - currentPrice) / currentBB.lower,
                confidence: 0.7,
                strategy: 'Bollinger Bands',
                reason: 'Price at lower Bollinger Band'
            };
        }
        // Price touches upper band (overbought)
        else if (currentPrice >= currentBB.upper) {
            return {
                signal: 'SELL',
                strength: (currentPrice - currentBB.upper) / currentBB.upper,
                confidence: 0.7,
                strategy: 'Bollinger Bands',
                reason: 'Price at upper Bollinger Band'
            };
        }

        return null;
    }

    // Stochastic Strategy
    stochasticStrategy(data, params = {}) {
        const kPeriod = params.kPeriod || 14;
        const dPeriod = params.dPeriod || 3;
        const overbought = params.overbought || 80;
        const oversold = params.oversold || 20;

        const stoch = this.calculateStochastic(data, kPeriod, dPeriod);
        if (stoch.length < 2) return null;

        const currentK = stoch[stoch.length - 1].k;
        const currentD = stoch[stoch.length - 1].d;
        const previousK = stoch[stoch.length - 2].k;
        const previousD = stoch[stoch.length - 2].d;

        // Bullish crossover in oversold
        if (currentK > currentD && previousK <= previousD && currentK < oversold) {
            return {
                signal: 'BUY',
                strength: (oversold - currentK) / oversold,
                confidence: 0.75,
                strategy: 'Stochastic',
                reason: 'Stochastic bullish crossover in oversold'
            };
        }
        // Bearish crossover in overbought
        else if (currentK < currentD && previousK >= previousD && currentK > overbought) {
            return {
                signal: 'SELL',
                strength: (currentK - overbought) / (100 - overbought),
                confidence: 0.75,
                strategy: 'Stochastic',
                reason: 'Stochastic bearish crossover in overbought'
            };
        }

        return null;
    }

    // Fibonacci Retracement Strategy
    fibonacciStrategy(data, params = {}) {
        const lookback = params.lookback || 50;
        const levels = [0.236, 0.382, 0.5, 0.618, 0.786];

        if (data.length < lookback) return null;

        const high = Math.max(...data.slice(-lookback).map(d => d.high));
        const low = Math.min(...data.slice(-lookback).map(d => d.low));
        const currentPrice = data[data.length - 1].close;

        const range = high - low;
        const fibLevels = levels.map(level => low + (range * level));

        // Find nearest support/resistance
        let nearestLevel = null;
        let distance = Infinity;

        fibLevels.forEach(level => {
            const dist = Math.abs(currentPrice - level);
            if (dist < distance) {
                distance = dist;
                nearestLevel = level;
            }
        });

        const tolerance = range * 0.01; // 1% tolerance

        if (Math.abs(currentPrice - nearestLevel) <= tolerance) {
            const isSupport = currentPrice >= nearestLevel;
            return {
                signal: isSupport ? 'BUY' : 'SELL',
                strength: 1 - (distance / range),
                confidence: 0.6,
                strategy: 'Fibonacci',
                reason: `Price at Fibonacci ${nearestLevel.toFixed(4)} level`
            };
        }

        return null;
    }

    // Support and Resistance Strategy
    supportResistanceStrategy(data, params = {}) {
        const lookback = params.lookback || 100;
        const sensitivity = params.sensitivity || 0.02;

        if (data.length < lookback) return null;

        const levels = this.findSupportResistanceLevels(data, lookback, sensitivity);
        const currentPrice = data[data.length - 1].close;

        for (const level of levels) {
            const distance = Math.abs(currentPrice - level.price);
            const tolerance = level.price * sensitivity;

            if (distance <= tolerance) {
                return {
                    signal: level.type === 'support' ? 'BUY' : 'SELL',
                    strength: 1 - (distance / tolerance),
                    confidence: 0.7,
                    strategy: 'Support/Resistance',
                    reason: `Price at ${level.type} level ${level.price.toFixed(4)}`
                };
            }
        }

        return null;
    }

    // Volume-Price Analysis Strategy
    volumePriceStrategy(data, params = {}) {
        const period = params.period || 20;
        const volumeThreshold = params.volumeThreshold || 1.5;

        if (data.length < period) return null;

        const recentData = data.slice(-period);
        const avgVolume = recentData.reduce((sum, d) => sum + d.volume, 0) / period;
        const currentVolume = data[data.length - 1].volume;
        const currentPrice = data[data.length - 1].close;
        const previousPrice = data[data.length - 2].close;

        // High volume price increase
        if (currentVolume > avgVolume * volumeThreshold && currentPrice > previousPrice) {
            return {
                signal: 'BUY',
                strength: Math.min(currentVolume / avgVolume, 3) / 3,
                confidence: 0.8,
                strategy: 'Volume-Price',
                reason: 'High volume price increase'
            };
        }
        // High volume price decrease
        else if (currentVolume > avgVolume * volumeThreshold && currentPrice < previousPrice) {
            return {
                signal: 'SELL',
                strength: Math.min(currentVolume / avgVolume, 3) / 3,
                confidence: 0.8,
                strategy: 'Volume-Price',
                reason: 'High volume price decrease'
            };
        }

        return null;
    }

    // Machine Learning Strategy (Simplified Pattern Recognition)
    machineLearningStrategy(data, params = {}) {
        const features = this.extractFeatures(data);
        const prediction = this.predictPattern(features);
        
        if (prediction.confidence > 0.6) {
            return {
                signal: prediction.signal,
                strength: prediction.confidence,
                confidence: prediction.confidence,
                strategy: 'Machine Learning',
                reason: `ML pattern recognition: ${prediction.pattern}`
            };
        }

        return null;
    }

    // Multi-Timeframe Strategy
    multiTimeframeStrategy(data, params = {}) {
        const timeframes = params.timeframes || ['1m', '5m', '15m', '1h'];
        const signals = [];

        // Get signals from multiple timeframes
        timeframes.forEach(tf => {
            const tfData = this.getTimeframeData(data, tf);
            if (tfData) {
                const signal = this.combineStrategies(tfData, params);
                if (signal) {
                    signals.push({ ...signal, timeframe: tf });
                }
            }
        });

        // Combine signals with weighted average
        if (signals.length > 0) {
            const weights = { '1m': 0.1, '5m': 0.2, '15m': 0.3, '1h': 0.4 };
            const weightedSignals = signals.map(s => ({
                ...s,
                weight: weights[s.timeframe] || 0.25
            }));

            const buySignals = weightedSignals.filter(s => s.signal === 'BUY');
            const sellSignals = weightedSignals.filter(s => s.signal === 'SELL');

            if (buySignals.length > sellSignals.length) {
                const avgStrength = buySignals.reduce((sum, s) => sum + s.strength * s.weight, 0) / 
                                  buySignals.reduce((sum, s) => sum + s.weight, 0);
                return {
                    signal: 'BUY',
                    strength: avgStrength,
                    confidence: 0.85,
                    strategy: 'Multi-Timeframe',
                    reason: `Consensus across ${buySignals.length} timeframes`
                };
            } else if (sellSignals.length > buySignals.length) {
                const avgStrength = sellSignals.reduce((sum, s) => sum + s.strength * s.weight, 0) / 
                                  sellSignals.reduce((sum, s) => sum + s.weight, 0);
                return {
                    signal: 'SELL',
                    strength: avgStrength,
                    confidence: 0.85,
                    strategy: 'Multi-Timeframe',
                    reason: `Consensus across ${sellSignals.length} timeframes`
                };
            }
        }

        return null;
    }

    // Combine multiple strategies
    combineStrategies(data, params = {}) {
        const strategies = params.strategies || ['ma-crossover', 'rsi-strategy', 'macd-strategy'];
        const signals = [];

        strategies.forEach(strategyName => {
            const strategy = this.strategies[strategyName];
            if (strategy) {
                const signal = strategy.call(this, data, params);
                if (signal) {
                    signals.push(signal);
                }
            }
        });

        if (signals.length === 0) return null;

        // Weight signals by confidence
        const totalWeight = signals.reduce((sum, s) => sum + s.confidence, 0);
        const weightedSignal = signals.reduce((acc, s) => {
            const weight = s.confidence / totalWeight;
            if (s.signal === 'BUY') {
                acc.buy += s.strength * weight;
            } else {
                acc.sell += s.strength * weight;
            }
            return acc;
        }, { buy: 0, sell: 0 });

        if (weightedSignal.buy > weightedSignal.sell && weightedSignal.buy > 0.3) {
            return {
                signal: 'BUY',
                strength: weightedSignal.buy,
                confidence: Math.min(weightedSignal.buy, 0.95),
                strategy: 'Combined',
                reason: `Combined ${signals.length} strategies`
            };
        } else if (weightedSignal.sell > weightedSignal.buy && weightedSignal.sell > 0.3) {
            return {
                signal: 'SELL',
                strength: weightedSignal.sell,
                confidence: Math.min(weightedSignal.sell, 0.95),
                strategy: 'Combined',
                reason: `Combined ${signals.length} strategies`
            };
        }

        return null;
    }

    // Technical Indicators Calculations
    calculateMA(data, period, type = 'SMA') {
        if (data.length < period) return [];

        const prices = data.map(d => d.close);
        const ma = [];

        for (let i = period - 1; i < prices.length; i++) {
            let sum = 0;
            if (type === 'SMA') {
                sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
                ma.push(sum / period);
            } else if (type === 'EMA') {
                const multiplier = 2 / (period + 1);
                if (i === period - 1) {
                    sum = prices.slice(0, period).reduce((a, b) => a + b, 0);
                    ma.push(sum / period);
                } else {
                    const ema = (prices[i] * multiplier) + (ma[ma.length - 1] * (1 - multiplier));
                    ma.push(ema);
                }
            }
        }

        return ma;
    }

    calculateRSI(data, period = 14) {
        if (data.length < period + 1) return [];

        const gains = [];
        const losses = [];

        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }

        const rsi = [];
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

        for (let i = period; i < gains.length; i++) {
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

            const rs = avgGain / avgLoss;
            const rsiValue = 100 - (100 / (1 + rs));
            rsi.push(rsiValue);
        }

        return rsi;
    }

    calculateMACD(data, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const fastEMA = this.calculateMA(data, fastPeriod, 'EMA');
        const slowEMA = this.calculateMA(data, slowPeriod, 'EMA');

        if (fastEMA.length === 0 || slowEMA.length === 0) return [];

        const macdLine = [];
        const startIndex = Math.max(fastEMA.length, slowEMA.length) - Math.min(fastEMA.length, slowEMA.length);

        for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
            const macd = fastEMA[startIndex + i] - slowEMA[i];
            macdLine.push(macd);
        }

        const signalLine = this.calculateEMA(macdLine, signalPeriod);
        const histogram = [];

        for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
            histogram.push(macdLine[i] - signalLine[i]);
        }

        return macdLine.map((macd, i) => ({
            macd: macd,
            signal: signalLine[i] || 0,
            histogram: histogram[i] || 0
        }));
    }

    calculateBollingerBands(data, period = 20, stdDev = 2) {
        const sma = this.calculateMA(data, period, 'SMA');
        const bb = [];

        for (let i = 0; i < sma.length; i++) {
            const prices = data.slice(i, i + period).map(d => d.close);
            const mean = sma[i];
            const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
            const standardDeviation = Math.sqrt(variance);

            bb.push({
                upper: mean + (standardDeviation * stdDev),
                middle: mean,
                lower: mean - (standardDeviation * stdDev)
            });
        }

        return bb;
    }

    calculateStochastic(data, kPeriod = 14, dPeriod = 3) {
        const stoch = [];

        for (let i = kPeriod - 1; i < data.length; i++) {
            const periodData = data.slice(i - kPeriod + 1, i + 1);
            const high = Math.max(...periodData.map(d => d.high));
            const low = Math.min(...periodData.map(d => d.low));
            const close = data[i].close;

            const k = ((close - low) / (high - low)) * 100;
            stoch.push({ k: k, d: 0 });
        }

        // Calculate %D (SMA of %K)
        for (let i = dPeriod - 1; i < stoch.length; i++) {
            const dSum = stoch.slice(i - dPeriod + 1, i + 1).reduce((sum, s) => sum + s.k, 0);
            stoch[i].d = dSum / dPeriod;
        }

        return stoch;
    }

    // Helper methods
    detectDivergence(priceData, indicatorData) {
        // Simplified divergence detection
        const priceHighs = this.findPeaks(priceData.map(d => d.high));
        const indicatorHighs = this.findPeaks(indicatorData);

        if (priceHighs.length >= 2 && indicatorHighs.length >= 2) {
            const priceTrend = priceHighs[priceHighs.length - 1] > priceHighs[priceHighs.length - 2];
            const indicatorTrend = indicatorHighs[indicatorHighs.length - 1] > indicatorHighs[indicatorHighs.length - 2];

            if (priceTrend !== indicatorTrend) {
                return {
                    signal: priceTrend ? 'SELL' : 'BUY',
                    reason: priceTrend ? 'Bearish divergence' : 'Bullish divergence'
                };
            }
        }

        return null;
    }

    findPeaks(data) {
        const peaks = [];
        for (let i = 1; i < data.length - 1; i++) {
            if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
                peaks.push(data[i]);
            }
        }
        return peaks;
    }

    findSupportResistanceLevels(data, lookback, sensitivity) {
        const levels = [];
        const highs = data.map(d => d.high);
        const lows = data.map(d => d.low);

        // Find resistance levels (highs)
        for (let i = 2; i < highs.length - 2; i++) {
            if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] &&
                highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
                levels.push({ price: highs[i], type: 'resistance' });
            }
        }

        // Find support levels (lows)
        for (let i = 2; i < lows.length - 2; i++) {
            if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] &&
                lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
                levels.push({ price: lows[i], type: 'support' });
            }
        }

        return levels;
    }

    extractFeatures(data) {
        // Extract technical features for ML
        const features = {
            priceChange: (data[data.length - 1].close - data[data.length - 2].close) / data[data.length - 2].close,
            volumeChange: (data[data.length - 1].volume - data[data.length - 2].volume) / data[data.length - 2].volume,
            volatility: this.calculateVolatility(data.slice(-20)),
            trend: this.calculateTrend(data.slice(-10)),
            momentum: this.calculateMomentum(data.slice(-5))
        };

        return features;
    }

    predictPattern(features) {
        // Simplified ML prediction (in real implementation, use trained model)
        const score = features.priceChange * 0.3 + 
                     features.volumeChange * 0.2 + 
                     features.trend * 0.3 + 
                     features.momentum * 0.2;

        if (score > 0.1) {
            return { signal: 'BUY', confidence: Math.min(Math.abs(score), 0.9), pattern: 'Bullish' };
        } else if (score < -0.1) {
            return { signal: 'SELL', confidence: Math.min(Math.abs(score), 0.9), pattern: 'Bearish' };
        }

        return { signal: 'HOLD', confidence: 0.5, pattern: 'Neutral' };
    }

    calculateVolatility(data) {
        const returns = [];
        for (let i = 1; i < data.length; i++) {
            returns.push((data[i].close - data[i - 1].close) / data[i - 1].close);
        }
        const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        return Math.sqrt(variance);
    }

    calculateTrend(data) {
        const prices = data.map(d => d.close);
        const n = prices.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = prices.reduce((a, b) => a + b, 0);
        const sumXY = prices.reduce((sum, price, i) => sum + (i * price), 0);
        const sumX2 = prices.reduce((sum, price, i) => sum + (i * i), 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope;
    }

    calculateMomentum(data) {
        return (data[data.length - 1].close - data[0].close) / data[0].close;
    }

    getTimeframeData(data, timeframe) {
        // Simplified timeframe conversion
        return data;
    }

    calculateEMA(data, period) {
        const ema = [];
        const multiplier = 2 / (period + 1);

        for (let i = 0; i < data.length; i++) {
            if (i === 0) {
                ema.push(data[i]);
            } else {
                ema.push((data[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
            }
        }

        return ema;
    }
}

// Risk Management System
class RiskManager {
    constructor() {
        this.maxPositionSize = 0.02; // 2% of portfolio per trade
        this.maxDailyLoss = 0.05; // 5% daily loss limit
        this.maxDrawdown = 0.15; // 15% max drawdown
        this.correlationLimit = 0.7; // Maximum correlation between positions
    }

    calculatePositionSize(portfolioValue, riskPerTrade, stopLossPips) {
        const riskAmount = portfolioValue * riskPerTrade;
        const pipValue = 10; // Simplified pip value
        const maxLots = riskAmount / (stopLossPips * pipValue);
        return Math.min(maxLots, portfolioValue * this.maxPositionSize);
    }

    checkRiskLimits(portfolio, newTrade) {
        const dailyPnL = this.calculateDailyPnL(portfolio);
        const drawdown = this.calculateDrawdown(portfolio);
        const correlation = this.calculateCorrelation(portfolio, newTrade);

        return {
            canTrade: dailyPnL > -this.maxDailyLoss && 
                     drawdown < this.maxDrawdown && 
                     correlation < this.correlationLimit,
            dailyPnL: dailyPnL,
            drawdown: drawdown,
            correlation: correlation
        };
    }

    calculateDailyPnL(portfolio) {
        const today = new Date().toDateString();
        return portfolio.trades
            .filter(trade => new Date(trade.timestamp).toDateString() === today)
            .reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    }

    calculateDrawdown(portfolio) {
        const peak = Math.max(...portfolio.trades.map(t => t.cumulativePnL || 0));
        const current = portfolio.trades[portfolio.trades.length - 1]?.cumulativePnL || 0;
        return (peak - current) / peak;
    }

    calculateCorrelation(portfolio, newTrade) {
        // Simplified correlation calculation
        return 0.3; // Placeholder
    }
}

// Portfolio Optimizer
class PortfolioOptimizer {
    constructor() {
        this.targetReturn = 0.15; // 15% annual return
        this.maxRisk = 0.10; // 10% annual risk
    }

    optimizeAllocation(assets, historicalData) {
        // Simplified portfolio optimization using Modern Portfolio Theory
        const returns = this.calculateReturns(historicalData);
        const covariance = this.calculateCovariance(returns);
        const weights = this.calculateOptimalWeights(returns, covariance);

        return {
            weights: weights,
            expectedReturn: this.calculateExpectedReturn(returns, weights),
            expectedRisk: this.calculateExpectedRisk(covariance, weights)
        };
    }

    calculateReturns(data) {
        const returns = {};
        Object.keys(data).forEach(asset => {
            returns[asset] = [];
            for (let i = 1; i < data[asset].length; i++) {
                returns[asset].push((data[asset][i].close - data[asset][i - 1].close) / data[asset][i - 1].close);
            }
        });
        return returns;
    }

    calculateCovariance(returns) {
        // Simplified covariance calculation
        return { EURUSD: 0.02, GBPUSD: 0.025, USDJPY: 0.03 };
    }

    calculateOptimalWeights(returns, covariance) {
        // Simplified optimal weight calculation
        return { EURUSD: 0.4, GBPUSD: 0.3, USDJPY: 0.3 };
    }

    calculateExpectedReturn(returns, weights) {
        return Object.keys(weights).reduce((sum, asset) => {
            const avgReturn = returns[asset].reduce((a, b) => a + b, 0) / returns[asset].length;
            return sum + (avgReturn * weights[asset]);
        }, 0);
    }

    calculateExpectedRisk(covariance, weights) {
        // Simplified risk calculation
        return 0.08;
    }
}

module.exports = { AdvancedStrategies, RiskManager, PortfolioOptimizer };




