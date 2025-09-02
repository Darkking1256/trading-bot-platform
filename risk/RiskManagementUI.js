// Risk Management UI - Advanced Risk Analysis Interface
class RiskManagementUI {
    constructor(riskManager) {
        this.riskManager = riskManager;
        this.currentPortfolio = null;
        this.riskAnalysis = null;
        this.stressTestResults = null;
        this.riskAlerts = [];
        this.init();
    }
    
    init() {
        this.createRiskComponents();
        this.setupEventListeners();
        this.startRealTimeUpdates();
    }
    
    createRiskComponents() {
        this.createRiskPanel();
        this.createRiskDashboard();
        this.createStressTestPanel();
        this.createPositionSizingTool();
        this.createRiskAlertsPanel();
    }
    
    createRiskPanel() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;
        
        const riskPanel = document.createElement('div');
        riskPanel.className = 'risk-panel';
        riskPanel.innerHTML = `
            <div class="panel-header">
                <h3><i class="fas fa-shield-alt"></i> Risk Management</h3>
            </div>
            <div class="risk-overview">
                <div class="risk-score">
                    <div class="risk-indicator" id="riskIndicator">
                        <span class="risk-level" id="riskLevel">LOW</span>
                        <span class="risk-score-value" id="riskScore">0.15</span>
                    </div>
                </div>
                <div class="risk-metrics">
                    <div class="metric">
                        <span class="metric-label">VaR (95%)</span>
                        <span class="metric-value" id="varValue">2.3%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Max DD</span>
                        <span class="metric-value" id="maxDDValue">8.5%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Sharpe</span>
                        <span class="metric-value" id="sharpeValue">1.2</span>
                    </div>
                </div>
            </div>
            <div class="risk-actions">
                <button class="btn btn-primary" id="analyzeRisk">
                    <i class="fas fa-chart-line"></i> Analyze Risk
                </button>
                <button class="btn btn-secondary" id="stressTest">
                    <i class="fas fa-bomb"></i> Stress Test
                </button>
                <button class="btn btn-secondary" id="positionSizing">
                    <i class="fas fa-calculator"></i> Position Size
                </button>
            </div>
            <div class="risk-alerts-summary">
                <h4>Risk Alerts</h4>
                <div class="alerts-list" id="alertsList">
                    <div class="no-alerts">No active alerts</div>
                </div>
            </div>
        `;
        
        sidebar.appendChild(riskPanel);
    }
    
    createRiskDashboard() {
        const mainContent = document.querySelector('.main-trading-area');
        if (!mainContent) return;
        
        const dashboard = document.createElement('div');
        dashboard.className = 'risk-dashboard';
        dashboard.id = 'riskDashboard';
        dashboard.style.display = 'none';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h2><i class="fas fa-shield-alt"></i> Risk Management Dashboard</h2>
                <button class="btn btn-close" id="closeRiskDashboard">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="dashboard-content">
                <div class="dashboard-grid">
                    <div class="dashboard-card risk-overview-card">
                        <h3>Portfolio Risk Overview</h3>
                        <div class="risk-metrics-grid">
                            <div class="metric-card">
                                <div class="metric-header">Overall Risk Score</div>
                                <div class="metric-value" id="overallRiskScore">0.15</div>
                                <div class="metric-level" id="overallRiskLevel">LOW</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-header">Value at Risk (95%)</div>
                                <div class="metric-value" id="dashboardVar">2.3%</div>
                                <div class="metric-description">Maximum expected loss</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-header">Conditional VaR</div>
                                <div class="metric-value" id="dashboardCVar">3.1%</div>
                                <div class="metric-description">Expected loss beyond VaR</div>
                            </div>
                            <div class="metric-card">
                                <div class="metric-header">Maximum Drawdown</div>
                                <div class="metric-value" id="dashboardMaxDD">8.5%</div>
                                <div class="metric-description">Largest peak-to-trough</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card correlation-card">
                        <h3>Correlation Analysis</h3>
                        <div class="correlation-matrix" id="correlationMatrix">
                            <div class="matrix-placeholder">Loading correlation data...</div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card concentration-card">
                        <h3>Position Concentration</h3>
                        <div class="concentration-chart" id="concentrationChart">
                            <div class="chart-placeholder">Loading concentration data...</div>
                        </div>
                    </div>
                    
                    <div class="dashboard-card leverage-card">
                        <h3>Leverage & Margin</h3>
                        <div class="leverage-metrics">
                            <div class="leverage-item">
                                <span class="label">Current Leverage:</span>
                                <span class="value" id="currentLeverage">1.2x</span>
                            </div>
                            <div class="leverage-item">
                                <span class="label">Margin Used:</span>
                                <span class="value" id="marginUsed">45%</span>
                            </div>
                            <div class="leverage-item">
                                <span class="label">Free Margin:</span>
                                <span class="value" id="freeMargin">55%</span>
                            </div>
                        </div>
                        <div class="leverage-bar">
                            <div class="leverage-fill" id="leverageFill" style="width: 40%"></div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-section">
                    <h3>Risk Recommendations</h3>
                    <div class="recommendations-list" id="recommendationsList">
                        <div class="recommendation-item">
                            <i class="fas fa-info-circle"></i>
                            <span>No specific recommendations at this time</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        mainContent.appendChild(dashboard);
    }
    
    createStressTestPanel() {
        const mainContent = document.querySelector('.main-trading-area');
        if (!mainContent) return;
        
        const stressPanel = document.createElement('div');
        stressPanel.className = 'stress-test-panel';
        stressPanel.id = 'stressTestPanel';
        stressPanel.style.display = 'none';
        stressPanel.innerHTML = `
            <div class="panel-header">
                <h2><i class="fas fa-bomb"></i> Stress Testing</h2>
                <button class="btn btn-close" id="closeStressPanel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="panel-content">
                <div class="stress-scenarios">
                    <h3>Stress Test Scenarios</h3>
                    <div class="scenarios-grid">
                        <div class="scenario-card" data-scenario="marketCrash">
                            <h4>Market Crash</h4>
                            <p>20% market decline with high volatility</p>
                            <div class="scenario-params">
                                <span>Price Change: -20%</span>
                                <span>Volatility: +5%</span>
                            </div>
                        </div>
                        <div class="scenario-card" data-scenario="flashCrash">
                            <h4>Flash Crash</h4>
                            <p>Rapid 10% decline with extreme volatility</p>
                            <div class="scenario-params">
                                <span>Price Change: -10%</span>
                                <span>Volatility: +10%</span>
                            </div>
                        </div>
                        <div class="scenario-card" data-scenario="interestRateShock">
                            <h4>Interest Rate Shock</h4>
                            <p>Central bank rate changes impact</p>
                            <div class="scenario-params">
                                <span>Price Change: -5%</span>
                                <span>Volatility: +3%</span>
                            </div>
                        </div>
                        <div class="scenario-card" data-scenario="currencyCrisis">
                            <h4>Currency Crisis</h4>
                            <p>Major currency devaluation scenario</p>
                            <div class="scenario-params">
                                <span>Price Change: -15%</span>
                                <span>Volatility: +8%</span>
                            </div>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="runStressTest">
                        <i class="fas fa-play"></i> Run All Scenarios
                    </button>
                </div>
                
                <div class="stress-results" id="stressResults" style="display: none;">
                    <h3>Stress Test Results</h3>
                    <div class="results-grid" id="resultsGrid">
                        <!-- Results will be populated here -->
                    </div>
                </div>
            </div>
        `;
        
        mainContent.appendChild(stressPanel);
    }
    
    createPositionSizingTool() {
        const mainContent = document.querySelector('.main-trading-area');
        if (!mainContent) return;
        
        const sizingPanel = document.createElement('div');
        sizingPanel.className = 'position-sizing-panel';
        sizingPanel.id = 'positionSizingPanel';
        sizingPanel.style.display = 'none';
        sizingPanel.innerHTML = `
            <div class="panel-header">
                <h2><i class="fas fa-calculator"></i> Position Sizing Calculator</h2>
                <button class="btn btn-close" id="closeSizingPanel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="panel-content">
                <div class="sizing-calculator">
                    <div class="calculator-inputs">
                        <div class="input-group">
                            <label for="sizingSymbol">Symbol</label>
                            <select id="sizingSymbol">
                                <option value="EURUSD">EUR/USD</option>
                                <option value="GBPUSD">GBP/USD</option>
                                <option value="USDJPY">USD/JPY</option>
                                <option value="AUDUSD">AUD/USD</option>
                                <option value="USDCAD">USD/CAD</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label for="sizingPrice">Current Price</label>
                            <input type="number" id="sizingPrice" step="0.0001" value="1.0850">
                        </div>
                        <div class="input-group">
                            <label for="sizingStopLoss">Stop Loss</label>
                            <input type="number" id="sizingStopLoss" step="0.0001" value="1.0800">
                        </div>
                        <div class="input-group">
                            <label for="sizingRiskPerTrade">Risk Per Trade (%)</label>
                            <input type="number" id="sizingRiskPerTrade" step="0.1" value="2.0" min="0.1" max="10">
                        </div>
                        <div class="input-group">
                            <label for="sizingAccountBalance">Account Balance</label>
                            <input type="number" id="sizingAccountBalance" value="10000">
                        </div>
                    </div>
                    
                    <div class="calculator-results">
                        <h3>Position Sizing Results</h3>
                        <div class="results-grid">
                            <div class="result-item">
                                <span class="label">Optimal Lot Size:</span>
                                <span class="value" id="optimalLotSize">0.10</span>
                            </div>
                            <div class="result-item">
                                <span class="label">Position Value:</span>
                                <span class="value" id="positionValue">$10,850</span>
                            </div>
                            <div class="result-item">
                                <span class="label">Risk Amount:</span>
                                <span class="value" id="riskAmount">$200</span>
                            </div>
                            <div class="result-item">
                                <span class="label">Pip Value:</span>
                                <span class="value" id="pipValue">$10</span>
                            </div>
                            <div class="result-item">
                                <span class="label">Pips at Risk:</span>
                                <span class="value" id="pipsAtRisk">50</span>
                            </div>
                            <div class="result-item">
                                <span class="label">Max Position Size:</span>
                                <span class="value" id="maxPositionSize">0.05</span>
                            </div>
                        </div>
                        
                        <div class="risk-warnings" id="riskWarnings">
                            <!-- Risk warnings will appear here -->
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" id="calculatePositionSize">
                        <i class="fas fa-calculator"></i> Calculate Position Size
                    </button>
                </div>
            </div>
        `;
        
        mainContent.appendChild(sizingPanel);
    }
    
    createRiskAlertsPanel() {
        const mainContent = document.querySelector('.main-trading-area');
        if (!mainContent) return;
        
        const alertsPanel = document.createElement('div');
        alertsPanel.className = 'risk-alerts-panel';
        alertsPanel.id = 'riskAlertsPanel';
        alertsPanel.style.display = 'none';
        alertsPanel.innerHTML = `
            <div class="panel-header">
                <h2><i class="fas fa-exclamation-triangle"></i> Risk Alerts</h2>
                <button class="btn btn-close" id="closeAlertsPanel">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="panel-content">
                <div class="alerts-filters">
                    <button class="filter-btn active" data-severity="all">All</button>
                    <button class="filter-btn" data-severity="critical">Critical</button>
                    <button class="filter-btn" data-severity="high">High</button>
                    <button class="filter-btn" data-severity="medium">Medium</button>
                    <button class="filter-btn" data-severity="low">Low</button>
                </div>
                
                <div class="alerts-list" id="detailedAlertsList">
                    <!-- Alerts will be populated here -->
                </div>
                
                <div class="alerts-actions">
                    <button class="btn btn-secondary" id="acknowledgeAll">
                        <i class="fas fa-check"></i> Acknowledge All
                    </button>
                    <button class="btn btn-secondary" id="exportAlerts">
                        <i class="fas fa-download"></i> Export Alerts
                    </button>
                </div>
            </div>
        `;
        
        mainContent.appendChild(alertsPanel);
    }
    
    setupEventListeners() {
        // Risk panel buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'analyzeRisk') {
                this.showRiskDashboard();
            } else if (e.target.id === 'stressTest') {
                this.showStressTestPanel();
            } else if (e.target.id === 'positionSizing') {
                this.showPositionSizingTool();
            } else if (e.target.id === 'closeRiskDashboard') {
                this.hideRiskDashboard();
            } else if (e.target.id === 'closeStressPanel') {
                this.hideStressTestPanel();
            } else if (e.target.id === 'closeSizingPanel') {
                this.hidePositionSizingTool();
            } else if (e.target.id === 'runStressTest') {
                this.runStressTest();
            } else if (e.target.id === 'calculatePositionSize') {
                this.calculatePositionSize();
            }
        });
        
        // Scenario selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.scenario-card')) {
                const card = e.target.closest('.scenario-card');
                document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            }
        });
        
        // Alert filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-btn')) {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.filterAlerts(e.target.dataset.severity);
            }
        });
    }
    
    // Dashboard Management
    showRiskDashboard() {
        document.getElementById('riskDashboard').style.display = 'block';
        this.updateRiskDashboard();
    }
    
    hideRiskDashboard() {
        document.getElementById('riskDashboard').style.display = 'none';
    }
    
    showStressTestPanel() {
        document.getElementById('stressTestPanel').style.display = 'block';
    }
    
    hideStressTestPanel() {
        document.getElementById('stressTestPanel').style.display = 'none';
    }
    
    showPositionSizingTool() {
        document.getElementById('positionSizingPanel').style.display = 'block';
        this.updatePositionSizing();
    }
    
    hidePositionSizingTool() {
        document.getElementById('positionSizingPanel').style.display = 'none';
    }
    
    // Risk Analysis
    async updateRiskAnalysis(portfolio) {
        try {
            this.currentPortfolio = portfolio;
            this.riskAnalysis = await this.riskManager.getRiskAnalysis(portfolio);
            this.updateRiskDisplay();
            this.generateRiskAlerts();
        } catch (error) {
            console.error('Risk analysis update failed:', error);
        }
    }
    
    updateRiskDisplay() {
        if (!this.riskAnalysis) return;
        
        // Update sidebar metrics
        document.getElementById('riskLevel').textContent = this.riskAnalysis.riskLevel;
        document.getElementById('riskScore').textContent = this.riskAnalysis.overallRiskScore.toFixed(2);
        document.getElementById('varValue').textContent = `${(this.riskAnalysis.var95 * 100).toFixed(1)}%`;
        document.getElementById('maxDDValue').textContent = `${(this.riskAnalysis.maxDrawdown * 100).toFixed(1)}%`;
        document.getElementById('sharpeValue').textContent = this.riskAnalysis.sharpeRatio.toFixed(2);
        
        // Update risk indicator color
        const riskIndicator = document.getElementById('riskIndicator');
        riskIndicator.className = `risk-indicator ${this.riskAnalysis.riskLevel.toLowerCase()}`;
        
        // Update dashboard if visible
        if (document.getElementById('riskDashboard').style.display === 'block') {
            this.updateRiskDashboard();
        }
    }
    
    updateRiskDashboard() {
        if (!this.riskAnalysis) return;
        
        // Update dashboard metrics
        document.getElementById('overallRiskScore').textContent = this.riskAnalysis.overallRiskScore.toFixed(2);
        document.getElementById('overallRiskLevel').textContent = this.riskAnalysis.riskLevel;
        document.getElementById('dashboardVar').textContent = `${(this.riskAnalysis.var95 * 100).toFixed(1)}%`;
        document.getElementById('dashboardCVar').textContent = `${(this.riskAnalysis.cvar95 * 100).toFixed(1)}%`;
        document.getElementById('dashboardMaxDD').textContent = `${(this.riskAnalysis.maxDrawdown * 100).toFixed(1)}%`;
        
        // Update correlation matrix
        this.updateCorrelationMatrix();
        
        // Update concentration chart
        this.updateConcentrationChart();
        
        // Update leverage metrics
        this.updateLeverageMetrics();
        
        // Update recommendations
        this.updateRecommendations();
    }
    
    updateCorrelationMatrix() {
        const matrixContainer = document.getElementById('correlationMatrix');
        if (!this.riskAnalysis.correlationMatrix) return;
        
        const symbols = Object.keys(this.riskAnalysis.correlationMatrix);
        let matrixHTML = '<table class="correlation-table">';
        
        // Header row
        matrixHTML += '<tr><th></th>';
        symbols.forEach(symbol => {
            matrixHTML += `<th>${symbol}</th>`;
        });
        matrixHTML += '</tr>';
        
        // Data rows
        symbols.forEach(symbol1 => {
            matrixHTML += `<tr><td>${symbol1}</td>`;
            symbols.forEach(symbol2 => {
                const correlation = this.riskAnalysis.correlationMatrix[symbol1][symbol2];
                const colorClass = this.getCorrelationColorClass(correlation);
                matrixHTML += `<td class="${colorClass}">${correlation.toFixed(2)}</td>`;
            });
            matrixHTML += '</tr>';
        });
        
        matrixHTML += '</table>';
        matrixContainer.innerHTML = matrixHTML;
    }
    
    getCorrelationColorClass(correlation) {
        if (correlation >= 0.8) return 'high-correlation';
        if (correlation >= 0.6) return 'medium-correlation';
        if (correlation >= 0.4) return 'low-correlation';
        return 'negative-correlation';
    }
    
    updateConcentrationChart() {
        const chartContainer = document.getElementById('concentrationChart');
        if (!this.currentPortfolio) return;
        
        const positions = this.currentPortfolio.positions;
        const totalValue = positions.reduce((sum, pos) => sum + (pos.lotSize * pos.price * 100000), 0);
        
        let chartHTML = '<div class="concentration-bars">';
        positions.forEach(position => {
            const concentration = (position.lotSize * position.price * 100000) / totalValue;
            const barWidth = (concentration * 100).toFixed(1);
            chartHTML += `
                <div class="concentration-bar">
                    <div class="bar-label">${position.symbol}</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${barWidth}%"></div>
                        <span class="bar-value">${(concentration * 100).toFixed(1)}%</span>
                    </div>
                </div>
            `;
        });
        chartHTML += '</div>';
        
        chartContainer.innerHTML = chartHTML;
    }
    
    updateLeverageMetrics() {
        if (!this.currentPortfolio) return;
        
        const totalExposure = this.currentPortfolio.positions.reduce((sum, pos) => {
            return sum + (pos.lotSize * pos.price * 100000);
        }, 0);
        
        const leverage = totalExposure / this.currentPortfolio.balance;
        const marginUsed = (this.currentPortfolio.marginUsed / this.currentPortfolio.marginAvailable) * 100;
        const freeMargin = 100 - marginUsed;
        
        document.getElementById('currentLeverage').textContent = `${leverage.toFixed(1)}x`;
        document.getElementById('marginUsed').textContent = `${marginUsed.toFixed(1)}%`;
        document.getElementById('freeMargin').textContent = `${freeMargin.toFixed(1)}%`;
        
        const leverageFill = document.getElementById('leverageFill');
        const fillWidth = Math.min((leverage / 3) * 100, 100); // 3x is max
        leverageFill.style.width = `${fillWidth}%`;
        leverageFill.className = `leverage-fill ${leverage > 2 ? 'high' : leverage > 1.5 ? 'medium' : 'low'}`;
    }
    
    updateRecommendations() {
        const recommendationsList = document.getElementById('recommendationsList');
        if (!this.riskAnalysis.recommendations || this.riskAnalysis.recommendations.length === 0) {
            recommendationsList.innerHTML = `
                <div class="recommendation-item">
                    <i class="fas fa-check-circle"></i>
                    <span>Portfolio risk is within acceptable limits</span>
                </div>
            `;
            return;
        }
        
        let recommendationsHTML = '';
        this.riskAnalysis.recommendations.forEach(recommendation => {
            recommendationsHTML += `
                <div class="recommendation-item">
                    <i class="fas fa-info-circle"></i>
                    <span>${recommendation}</span>
                </div>
            `;
        });
        
        recommendationsList.innerHTML = recommendationsHTML;
    }
    
    // Stress Testing
    async runStressTest() {
        try {
            if (!this.currentPortfolio) {
                alert('Please analyze portfolio risk first');
                return;
            }
            
            const button = document.getElementById('runStressTest');
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running Tests...';
            
            this.stressTestResults = await this.riskManager.getStressTestResults(this.currentPortfolio);
            this.displayStressTestResults();
            
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-play"></i> Run All Scenarios';
        } catch (error) {
            console.error('Stress testing failed:', error);
            alert('Stress testing failed. Please try again.');
        }
    }
    
    displayStressTestResults() {
        const resultsContainer = document.getElementById('stressResults');
        const resultsGrid = document.getElementById('resultsGrid');
        
        resultsContainer.style.display = 'block';
        
        let resultsHTML = '';
        Object.entries(this.stressTestResults).forEach(([scenarioName, result]) => {
            const valueChange = (result.valueChange * 100).toFixed(1);
            const survivabilityClass = result.survivability.toLowerCase();
            
            resultsHTML += `
                <div class="result-card ${survivabilityClass}">
                    <h4>${this.formatScenarioName(scenarioName)}</h4>
                    <div class="result-metrics">
                        <div class="metric">
                            <span class="label">Portfolio Change:</span>
                            <span class="value ${valueChange < 0 ? 'negative' : 'positive'}">${valueChange}%</span>
                        </div>
                        <div class="metric">
                            <span class="label">Survivability:</span>
                            <span class="value survivability-${survivabilityClass}">${result.survivability}</span>
                        </div>
                        <div class="metric">
                            <span class="label">Risk Score:</span>
                            <span class="value">${result.riskMetrics.overallRiskScore.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        resultsGrid.innerHTML = resultsHTML;
    }
    
    formatScenarioName(name) {
        return name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
    
    // Position Sizing
    updatePositionSizing() {
        const symbol = document.getElementById('sizingSymbol').value;
        const price = parseFloat(document.getElementById('sizingPrice').value);
        const stopLoss = parseFloat(document.getElementById('sizingStopLoss').value);
        const riskPerTrade = parseFloat(document.getElementById('sizingRiskPerTrade').value) / 100;
        const accountBalance = parseFloat(document.getElementById('sizingAccountBalance').value);
        
        if (price && stopLoss && riskPerTrade && accountBalance) {
            const optimalLots = this.riskManager.calculatePositionSize(
                { balance: accountBalance },
                symbol,
                price,
                stopLoss,
                riskPerTrade
            );
            
            const positionValue = optimalLots * price * 100000;
            const riskAmount = accountBalance * riskPerTrade;
            const pipValue = 10; // Standard pip value
            const pipsAtRisk = Math.abs(price - stopLoss) * 10000;
            const maxLots = accountBalance * 0.05 / (price * 100000);
            
            document.getElementById('optimalLotSize').textContent = optimalLots.toFixed(2);
            document.getElementById('positionValue').textContent = `$${positionValue.toFixed(0)}`;
            document.getElementById('riskAmount').textContent = `$${riskAmount.toFixed(0)}`;
            document.getElementById('pipValue').textContent = `$${pipValue}`;
            document.getElementById('pipsAtRisk').textContent = pipsAtRisk.toFixed(0);
            document.getElementById('maxPositionSize').textContent = maxLots.toFixed(2);
            
            this.updatePositionSizingWarnings(optimalLots, maxLots, riskPerTrade);
        }
    }
    
    updatePositionSizingWarnings(optimalLots, maxLots, riskPerTrade) {
        const warningsContainer = document.getElementById('riskWarnings');
        let warningsHTML = '';
        
        if (optimalLots > maxLots) {
            warningsHTML += `
                <div class="warning-item high">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Position size exceeds maximum allowed (${maxLots.toFixed(2)} lots)</span>
                </div>
            `;
        }
        
        if (riskPerTrade > 0.05) {
            warningsHTML += `
                <div class="warning-item medium">
                    <i class="fas fa-info-circle"></i>
                    <span>Risk per trade is high. Consider reducing to 2-3%</span>
                </div>
            `;
        }
        
        if (warningsHTML === '') {
            warningsHTML = `
                <div class="warning-item safe">
                    <i class="fas fa-check-circle"></i>
                    <span>Position sizing parameters are within safe limits</span>
                </div>
            `;
        }
        
        warningsContainer.innerHTML = warningsHTML;
    }
    
    calculatePositionSize() {
        this.updatePositionSizing();
    }
    
    // Risk Alerts
    generateRiskAlerts() {
        if (!this.riskAnalysis) return;
        
        this.riskAlerts = this.riskManager.generateRiskAlerts(this.riskAnalysis);
        this.updateAlertsDisplay();
    }
    
    updateAlertsDisplay() {
        const alertsList = document.getElementById('alertsList');
        const detailedAlertsList = document.getElementById('detailedAlertsList');
        
        if (this.riskAlerts.length === 0) {
            alertsList.innerHTML = '<div class="no-alerts">No active alerts</div>';
            detailedAlertsList.innerHTML = '<div class="no-alerts">No active alerts</div>';
            return;
        }
        
        // Update sidebar alerts
        let sidebarHTML = '';
        this.riskAlerts.slice(0, 3).forEach(alert => {
            sidebarHTML += `
                <div class="alert-item ${alert.severity.toLowerCase()}">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>${alert.message}</span>
                </div>
            `;
        });
        
        if (this.riskAlerts.length > 3) {
            sidebarHTML += `<div class="more-alerts">+${this.riskAlerts.length - 3} more alerts</div>`;
        }
        
        alertsList.innerHTML = sidebarHTML;
        
        // Update detailed alerts
        let detailedHTML = '';
        this.riskAlerts.forEach(alert => {
            detailedHTML += `
                <div class="alert-item ${alert.severity.toLowerCase()}">
                    <div class="alert-header">
                        <span class="alert-type">${alert.type}</span>
                        <span class="alert-severity ${alert.severity.toLowerCase()}">${alert.severity}</span>
                    </div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-recommendation">${alert.recommendation}</div>
                </div>
            `;
        });
        
        detailedAlertsList.innerHTML = detailedHTML;
    }
    
    filterAlerts(severity) {
        const alertItems = document.querySelectorAll('#detailedAlertsList .alert-item');
        
        alertItems.forEach(item => {
            if (severity === 'all' || item.classList.contains(severity)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // Real-time Updates
    startRealTimeUpdates() {
        setInterval(() => {
            if (this.currentPortfolio) {
                this.updateRiskAnalysis(this.currentPortfolio);
            }
        }, 30000); // Update every 30 seconds
    }
    
    // Public API
    getRiskAlerts() {
        return this.riskAlerts;
    }
    
    getRiskAnalysis() {
        return this.riskAnalysis;
    }
    
    getStressTestResults() {
        return this.stressTestResults;
    }
}

module.exports = { RiskManagementUI };






