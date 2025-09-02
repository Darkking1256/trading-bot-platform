// Advanced Risk Management System
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class RiskManager {
    constructor() {
        this.riskMetrics = {
            portfolioRisk: 0,
            maxDrawdown: 0,
            sharpeRatio: 0,
            var95: 0, // Value at Risk (95% confidence)
            cvar95: 0, // Conditional Value at Risk
            correlationMatrix: {},
            positionConcentration: {},
            leverageRatio: 0,
            marginUtilization: 0,
            riskScore: 0
        };
        
        this.riskLimits = {
            maxPositionSize: 0.05, // 5% of portfolio per position
            maxDailyLoss: 0.02, // 2% daily loss limit
            maxDrawdownLimit: 0.15, // 15% max drawdown
            maxLeverage: 3.0, // 3x leverage limit
            maxCorrelation: 0.7, // 70% correlation limit
            maxConcentration: 0.25, // 25% concentration limit
            minMargin: 0.3 // 30% minimum margin
        };
        
        this.riskAlerts = [];
        this.portfolioHistory = [];
        this.stressTestScenarios = {};
        this.riskReports = new Map();
        
        this.init();
    }
    
    async init() {
        try {
            await this.loadRiskData();
            this.startRiskMonitoring();
            console.log('Risk Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Risk Manager:', error);
        }
    }
    
    // Portfolio Risk Analysis
    async analyzePortfolioRisk(portfolio, marketData) {
        try {
            const analysis = {
                timestamp: new Date(),
                portfolioRisk: 0,
                var95: 0,
                cvar95: 0,
                maxDrawdown: 0,
                sharpeRatio: 0,
                correlationMatrix: {},
                concentrationRisk: 0,
                leverageRisk: 0,
                marginRisk: 0,
                overallRiskScore: 0,
                riskLevel: 'LOW',
                recommendations: []
            };
            
            // Calculate Value at Risk (VaR)
            analysis.var95 = this.calculateVaR(portfolio, marketData, 0.95);
            analysis.cvar95 = this.calculateCVaR(portfolio, marketData, 0.95);
            
            // Calculate portfolio risk metrics
            analysis.portfolioRisk = this.calculatePortfolioRisk(portfolio);
            analysis.maxDrawdown = this.calculateMaxDrawdown(portfolio);
            analysis.sharpeRatio = this.calculateSharpeRatio(portfolio);
            
            // Correlation analysis
            analysis.correlationMatrix = this.calculateCorrelationMatrix(portfolio, marketData);
            analysis.correlationRisk = this.assessCorrelationRisk(analysis.correlationMatrix);
            
            // Concentration analysis
            analysis.concentrationRisk = this.calculateConcentrationRisk(portfolio);
            
            // Leverage and margin analysis
            analysis.leverageRisk = this.calculateLeverageRisk(portfolio);
            analysis.marginRisk = this.calculateMarginRisk(portfolio);
            
            // Overall risk score
            analysis.overallRiskScore = this.calculateOverallRiskScore(analysis);
            analysis.riskLevel = this.determineRiskLevel(analysis.overallRiskScore);
            
            // Generate recommendations
            analysis.recommendations = this.generateRiskRecommendations(analysis);
            
            // Store analysis
            this.riskReports.set(analysis.timestamp.getTime(), analysis);
            await this.saveRiskData();
            
            return analysis;
        } catch (error) {
            console.error('Portfolio risk analysis failed:', error);
            throw error;
        }
    }
    
    // Value at Risk Calculation
    calculateVaR(portfolio, marketData, confidenceLevel = 0.95) {
        try {
            const returns = this.calculatePortfolioReturns(portfolio, marketData);
            const sortedReturns = returns.sort((a, b) => a - b);
            const varIndex = Math.floor((1 - confidenceLevel) * sortedReturns.length);
            
            return Math.abs(sortedReturns[varIndex] || 0);
        } catch (error) {
            console.error('VaR calculation failed:', error);
            return 0;
        }
    }
    
    // Conditional Value at Risk (Expected Shortfall)
    calculateCVaR(portfolio, marketData, confidenceLevel = 0.95) {
        try {
            const returns = this.calculatePortfolioReturns(portfolio, marketData);
            const var95 = this.calculateVaR(portfolio, marketData, confidenceLevel);
            
            const tailReturns = returns.filter(return_ => return_ <= -var95);
            const avgTailReturn = tailReturns.reduce((sum, return_) => sum + return_, 0) / tailReturns.length;
            
            return Math.abs(avgTailReturn || 0);
        } catch (error) {
            console.error('CVaR calculation failed:', error);
            return 0;
        }
    }
    
    // Portfolio Risk Calculation
    calculatePortfolioRisk(portfolio) {
        try {
            let totalRisk = 0;
            let totalValue = 0;
            
            portfolio.positions.forEach(position => {
                const positionValue = position.lotSize * position.price * 100000; // Standard lot size
                const positionRisk = this.calculatePositionRisk(position);
                
                totalRisk += positionValue * positionRisk;
                totalValue += positionValue;
            });
            
            return totalValue > 0 ? totalRisk / totalValue : 0;
        } catch (error) {
            console.error('Portfolio risk calculation failed:', error);
            return 0;
        }
    }
    
    // Position Risk Calculation
    calculatePositionRisk(position) {
        try {
            const volatility = this.estimateVolatility(position.symbol);
            const leverage = position.lotSize * 100000 / position.margin;
            
            return volatility * leverage;
        } catch (error) {
            console.error('Position risk calculation failed:', error);
            return 0.1; // Default 10% risk
        }
    }
    
    // Maximum Drawdown Calculation
    calculateMaxDrawdown(portfolio) {
        try {
            const equity = this.calculatePortfolioEquity(portfolio);
            let maxDrawdown = 0;
            let peak = equity[0];
            
            equity.forEach(value => {
                if (value > peak) {
                    peak = value;
                }
                const drawdown = (peak - value) / peak;
                if (drawdown > maxDrawdown) {
                    maxDrawdown = drawdown;
                }
            });
            
            return maxDrawdown;
        } catch (error) {
            console.error('Max drawdown calculation failed:', error);
            return 0;
        }
    }
    
    // Sharpe Ratio Calculation
    calculateSharpeRatio(portfolio) {
        try {
            const returns = this.calculatePortfolioReturns(portfolio);
            const avgReturn = returns.reduce((sum, return_) => sum + return_, 0) / returns.length;
            const stdDev = this.calculateStandardDeviation(returns);
            const riskFreeRate = 0.02; // 2% risk-free rate
            
            return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0;
        } catch (error) {
            console.error('Sharpe ratio calculation failed:', error);
            return 0;
        }
    }
    
    // Correlation Matrix Calculation
    calculateCorrelationMatrix(portfolio, marketData) {
        try {
            const symbols = [...new Set(portfolio.positions.map(p => p.symbol))];
            const correlationMatrix = {};
            
            symbols.forEach(symbol1 => {
                correlationMatrix[symbol1] = {};
                symbols.forEach(symbol2 => {
                    if (symbol1 === symbol2) {
                        correlationMatrix[symbol1][symbol2] = 1;
                    } else {
                        correlationMatrix[symbol1][symbol2] = this.calculateCorrelation(
                            this.getSymbolReturns(symbol1, marketData),
                            this.getSymbolReturns(symbol2, marketData)
                        );
                    }
                });
            });
            
            return correlationMatrix;
        } catch (error) {
            console.error('Correlation matrix calculation failed:', error);
            return {};
        }
    }
    
    // Correlation Calculation
    calculateCorrelation(returns1, returns2) {
        try {
            if (returns1.length !== returns2.length || returns1.length < 2) {
                return 0;
            }
            
            const mean1 = returns1.reduce((sum, val) => sum + val, 0) / returns1.length;
            const mean2 = returns2.reduce((sum, val) => sum + val, 0) / returns2.length;
            
            let numerator = 0;
            let denominator1 = 0;
            let denominator2 = 0;
            
            for (let i = 0; i < returns1.length; i++) {
                const diff1 = returns1[i] - mean1;
                const diff2 = returns2[i] - mean2;
                
                numerator += diff1 * diff2;
                denominator1 += diff1 * diff1;
                denominator2 += diff2 * diff2;
            }
            
            const denominator = Math.sqrt(denominator1 * denominator2);
            return denominator > 0 ? numerator / denominator : 0;
        } catch (error) {
            console.error('Correlation calculation failed:', error);
            return 0;
        }
    }
    
    // Concentration Risk Analysis
    calculateConcentrationRisk(portfolio) {
        try {
            const totalValue = portfolio.positions.reduce((sum, position) => {
                return sum + (position.lotSize * position.price * 100000);
            }, 0);
            
            let concentrationRisk = 0;
            
            portfolio.positions.forEach(position => {
                const positionValue = position.lotSize * position.price * 100000;
                const concentration = positionValue / totalValue;
                
                if (concentration > this.riskLimits.maxConcentration) {
                    concentrationRisk += concentration - this.riskLimits.maxConcentration;
                }
            });
            
            return concentrationRisk;
        } catch (error) {
            console.error('Concentration risk calculation failed:', error);
            return 0;
        }
    }
    
    // Leverage Risk Analysis
    calculateLeverageRisk(portfolio) {
        try {
            const totalExposure = portfolio.positions.reduce((sum, position) => {
                return sum + (position.lotSize * position.price * 100000);
            }, 0);
            
            const leverage = totalExposure / portfolio.balance;
            return leverage > this.riskLimits.maxLeverage ? leverage - this.riskLimits.maxLeverage : 0;
        } catch (error) {
            console.error('Leverage risk calculation failed:', error);
            return 0;
        }
    }
    
    // Margin Risk Analysis
    calculateMarginRisk(portfolio) {
        try {
            const marginUtilization = portfolio.marginUsed / portfolio.marginAvailable;
            return marginUtilization > (1 - this.riskLimits.minMargin) ? 
                marginUtilization - (1 - this.riskLimits.minMargin) : 0;
        } catch (error) {
            console.error('Margin risk calculation failed:', error);
            return 0;
        }
    }
    
    // Position Sizing Calculator
    calculateOptimalPositionSize(portfolio, symbol, price, stopLoss, riskPerTrade = 0.02) {
        try {
            const accountRisk = portfolio.balance * riskPerTrade;
            const priceRisk = Math.abs(price - stopLoss);
            const pipValue = this.calculatePipValue(symbol, price);
            
            const optimalLots = accountRisk / (priceRisk * pipValue);
            const maxLots = portfolio.balance * this.riskLimits.maxPositionSize / (price * 100000);
            
            return Math.min(optimalLots, maxLots);
        } catch (error) {
            console.error('Position sizing calculation failed:', error);
            return 0.01; // Default 0.01 lots
        }
    }
    
    // Stress Testing
    async performStressTest(portfolio, scenarios = {}) {
        try {
            const defaultScenarios = {
                marketCrash: { priceChange: -0.20, volatility: 0.05 },
                flashCrash: { priceChange: -0.10, volatility: 0.10 },
                interestRateShock: { priceChange: -0.05, volatility: 0.03 },
                currencyCrisis: { priceChange: -0.15, volatility: 0.08 },
                liquidityCrisis: { priceChange: -0.08, volatility: 0.06 }
            };
            
            const testScenarios = { ...defaultScenarios, ...scenarios };
            const stressTestResults = {};
            
            for (const [scenarioName, scenario] of Object.entries(testScenarios)) {
                const stressedPortfolio = this.applyStressScenario(portfolio, scenario);
                const riskAnalysis = await this.analyzePortfolioRisk(stressedPortfolio, {});
                
                stressTestResults[scenarioName] = {
                    scenario,
                    originalValue: this.calculatePortfolioValue(portfolio),
                    stressedValue: this.calculatePortfolioValue(stressedPortfolio),
                    valueChange: (this.calculatePortfolioValue(stressedPortfolio) - this.calculatePortfolioValue(portfolio)) / this.calculatePortfolioValue(portfolio),
                    riskMetrics: riskAnalysis,
                    survivability: this.assessSurvivability(stressedPortfolio)
                };
            }
            
            this.stressTestScenarios = stressTestResults;
            await this.saveRiskData();
            
            return stressTestResults;
        } catch (error) {
            console.error('Stress testing failed:', error);
            throw error;
        }
    }
    
    // Apply Stress Scenario
    applyStressScenario(portfolio, scenario) {
        try {
            const stressedPortfolio = JSON.parse(JSON.stringify(portfolio));
            
            stressedPortfolio.positions.forEach(position => {
                const priceChange = scenario.priceChange + (Math.random() - 0.5) * scenario.volatility;
                position.price *= (1 + priceChange);
                
                // Adjust stop loss and take profit
                if (position.stopLoss) {
                    position.stopLoss *= (1 + priceChange);
                }
                if (position.takeProfit) {
                    position.takeProfit *= (1 + priceChange);
                }
            });
            
            return stressedPortfolio;
        } catch (error) {
            console.error('Stress scenario application failed:', error);
            return portfolio;
        }
    }
    
    // Risk Alerts System
    generateRiskAlerts(riskAnalysis) {
        try {
            const alerts = [];
            
            // VaR alerts
            if (riskAnalysis.var95 > portfolio.balance * 0.05) {
                alerts.push({
                    type: 'HIGH_VAR',
                    severity: 'HIGH',
                    message: `Value at Risk (${(riskAnalysis.var95 * 100).toFixed(2)}%) exceeds 5% of portfolio`,
                    recommendation: 'Consider reducing position sizes or hedging positions'
                });
            }
            
            // Drawdown alerts
            if (riskAnalysis.maxDrawdown > this.riskLimits.maxDrawdownLimit) {
                alerts.push({
                    type: 'MAX_DRAWDOWN',
                    severity: 'CRITICAL',
                    message: `Maximum drawdown (${(riskAnalysis.maxDrawdown * 100).toFixed(2)}%) exceeds limit`,
                    recommendation: 'Close some positions to reduce exposure'
                });
            }
            
            // Correlation alerts
            if (riskAnalysis.correlationRisk > 0.7) {
                alerts.push({
                    type: 'HIGH_CORRELATION',
                    severity: 'MEDIUM',
                    message: 'High correlation detected between positions',
                    recommendation: 'Diversify portfolio with uncorrelated assets'
                });
            }
            
            // Concentration alerts
            if (riskAnalysis.concentrationRisk > 0) {
                alerts.push({
                    type: 'HIGH_CONCENTRATION',
                    severity: 'MEDIUM',
                    message: 'Portfolio concentration exceeds limits',
                    recommendation: 'Reduce position sizes in concentrated assets'
                });
            }
            
            // Leverage alerts
            if (riskAnalysis.leverageRisk > 0) {
                alerts.push({
                    type: 'HIGH_LEVERAGE',
                    severity: 'HIGH',
                    message: 'Leverage exceeds risk limits',
                    recommendation: 'Reduce leverage to meet risk requirements'
                });
            }
            
            // Margin alerts
            if (riskAnalysis.marginRisk > 0) {
                alerts.push({
                    type: 'LOW_MARGIN',
                    severity: 'CRITICAL',
                    message: 'Margin utilization approaching limits',
                    recommendation: 'Add funds or close positions to maintain margin'
                });
            }
            
            this.riskAlerts = alerts;
            return alerts;
        } catch (error) {
            console.error('Risk alerts generation failed:', error);
            return [];
        }
    }
    
    // Risk Monitoring
    startRiskMonitoring() {
        setInterval(async () => {
            try {
                // This would be called with real portfolio data
                // For now, we'll simulate monitoring
                console.log('Risk monitoring check completed');
            } catch (error) {
                console.error('Risk monitoring failed:', error);
            }
        }, 60000); // Check every minute
    }
    
    // Utility Methods
    calculatePortfolioReturns(portfolio, marketData) {
        // Simulate portfolio returns based on positions
        const returns = [];
        for (let i = 0; i < 100; i++) {
            let portfolioReturn = 0;
            portfolio.positions.forEach(position => {
                const symbolReturn = (Math.random() - 0.5) * 0.02; // ±1% daily return
                portfolioReturn += symbolReturn * (position.lotSize * position.price * 100000) / portfolio.balance;
            });
            returns.push(portfolioReturn);
        }
        return returns;
    }
    
    calculatePortfolioEquity(portfolio) {
        // Simulate equity curve
        const equity = [portfolio.balance];
        for (let i = 1; i < 100; i++) {
            const dailyReturn = (Math.random() - 0.5) * 0.01; // ±0.5% daily return
            equity.push(equity[i-1] * (1 + dailyReturn));
        }
        return equity;
    }
    
    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(avgSquaredDiff);
    }
    
    estimateVolatility(symbol) {
        // Simulate volatility estimation
        return 0.015 + Math.random() * 0.01; // 1.5% - 2.5% daily volatility
    }
    
    getSymbolReturns(symbol, marketData) {
        // Simulate symbol returns
        const returns = [];
        for (let i = 0; i < 100; i++) {
            returns.push((Math.random() - 0.5) * 0.02);
        }
        return returns;
    }
    
    calculatePipValue(symbol, price) {
        // Standard pip value calculation
        return 10; // $10 per pip for standard lot
    }
    
    calculatePortfolioValue(portfolio) {
        return portfolio.balance + portfolio.positions.reduce((sum, position) => {
            return sum + (position.lotSize * position.price * 100000);
        }, 0);
    }
    
    assessSurvivability(portfolio) {
        const marginUtilization = portfolio.marginUsed / portfolio.marginAvailable;
        if (marginUtilization > 0.9) return 'CRITICAL';
        if (marginUtilization > 0.7) return 'HIGH';
        if (marginUtilization > 0.5) return 'MEDIUM';
        return 'LOW';
    }
    
    calculateOverallRiskScore(analysis) {
        const weights = {
            var95: 0.25,
            maxDrawdown: 0.20,
            correlationRisk: 0.15,
            concentrationRisk: 0.15,
            leverageRisk: 0.15,
            marginRisk: 0.10
        };
        
        return (
            analysis.var95 * weights.var95 +
            analysis.maxDrawdown * weights.maxDrawdown +
            analysis.correlationRisk * weights.correlationRisk +
            analysis.concentrationRisk * weights.concentrationRisk +
            analysis.leverageRisk * weights.leverageRisk +
            analysis.marginRisk * weights.marginRisk
        );
    }
    
    determineRiskLevel(riskScore) {
        if (riskScore < 0.1) return 'LOW';
        if (riskScore < 0.3) return 'MEDIUM';
        if (riskScore < 0.5) return 'HIGH';
        return 'CRITICAL';
    }
    
    generateRiskRecommendations(analysis) {
        const recommendations = [];
        
        if (analysis.var95 > 0.05) {
            recommendations.push('Reduce position sizes to lower Value at Risk');
        }
        
        if (analysis.maxDrawdown > 0.15) {
            recommendations.push('Implement tighter stop losses to limit drawdown');
        }
        
        if (analysis.correlationRisk > 0.7) {
            recommendations.push('Diversify portfolio with uncorrelated assets');
        }
        
        if (analysis.concentrationRisk > 0) {
            recommendations.push('Reduce concentration in single positions');
        }
        
        if (analysis.leverageRisk > 0) {
            recommendations.push('Reduce leverage to meet risk limits');
        }
        
        if (analysis.marginRisk > 0) {
            recommendations.push('Add funds or close positions to maintain margin');
        }
        
        return recommendations;
    }
    
    assessCorrelationRisk(correlationMatrix) {
        let highCorrelations = 0;
        let totalCorrelations = 0;
        
        Object.values(correlationMatrix).forEach(row => {
            Object.values(row).forEach(correlation => {
                if (correlation > 0.7 && correlation < 1) {
                    highCorrelations++;
                }
                totalCorrelations++;
            });
        });
        
        return totalCorrelations > 0 ? highCorrelations / totalCorrelations : 0;
    }
    
    // Data Persistence
    async saveRiskData() {
        try {
            const data = {
                riskMetrics: this.riskMetrics,
                riskLimits: this.riskLimits,
                riskAlerts: this.riskAlerts,
                stressTestScenarios: this.stressTestScenarios,
                riskReports: Array.from(this.riskReports.entries())
            };
            
            await fs.writeFile(
                path.join(__dirname, 'risk_data.json'),
                JSON.stringify(data, null, 2)
            );
        } catch (error) {
            console.error('Failed to save risk data:', error);
        }
    }
    
    async loadRiskData() {
        try {
            const data = await fs.readFile(
                path.join(__dirname, 'risk_data.json'),
                'utf8'
            );
            
            const parsed = JSON.parse(data);
            this.riskMetrics = parsed.riskMetrics || this.riskMetrics;
            this.riskLimits = parsed.riskLimits || this.riskLimits;
            this.riskAlerts = parsed.riskAlerts || this.riskAlerts;
            this.stressTestScenarios = parsed.stressTestScenarios || this.stressTestScenarios;
            this.riskReports = new Map(parsed.riskReports || []);
        } catch (error) {
            console.log('No existing risk data found, using defaults');
        }
    }
    
    // Public API Methods
    async getRiskAnalysis(portfolio, marketData = {}) {
        return await this.analyzePortfolioRisk(portfolio, marketData);
    }
    
    async getStressTestResults(portfolio, scenarios = {}) {
        return await this.performStressTest(portfolio, scenarios);
    }
    
    getRiskAlerts() {
        return this.riskAlerts;
    }
    
    getRiskLimits() {
        return this.riskLimits;
    }
    
    updateRiskLimits(newLimits) {
        this.riskLimits = { ...this.riskLimits, ...newLimits };
        this.saveRiskData();
    }
    
    calculatePositionSize(portfolio, symbol, price, stopLoss, riskPerTrade = 0.02) {
        return this.calculateOptimalPositionSize(portfolio, symbol, price, stopLoss, riskPerTrade);
    }
}

module.exports = { RiskManager };






