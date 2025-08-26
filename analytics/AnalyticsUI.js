// Analytics UI - Advanced Analytics Dashboard
class AnalyticsUI {
    constructor(advancedAnalytics) {
        this.advancedAnalytics = advancedAnalytics;
        this.currentReport = null;
        this.currentInsights = null;
        
        this.init();
    }

    init() {
        this.createAnalyticsComponents();
        this.setupEventListeners();
        this.updateAnalyticsDisplay();
    }

    createAnalyticsComponents() {
        // Create analytics panel in sidebar
        this.createAnalyticsPanel();
        
        // Create analytics dashboard
        this.createAnalyticsDashboard();
        
        // Create report builder
        this.createReportBuilder();
    }

    createAnalyticsPanel() {
        const sidebar = document.querySelector('.sidebar');
        
        const analyticsSection = document.createElement('div');
        analyticsSection.className = 'sidebar-section';
        analyticsSection.innerHTML = `
            <h3><i class="fas fa-chart-line"></i> Analytics</h3>
            
            <div class="analytics-overview">
                <div class="metric-card">
                    <div class="metric-value" id="mlAccuracy">78%</div>
                    <div class="metric-label">ML Accuracy</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" id="predictionsCount">24</div>
                    <div class="metric-label">Active Predictions</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value" id="insightsCount">12</div>
                    <div class="metric-label">New Insights</div>
                </div>
            </div>

            <div class="analytics-actions">
                <button class="btn btn-primary btn-sm" id="openAnalyticsDashboard">
                    <i class="fas fa-tachometer-alt"></i> Dashboard
                </button>
                <button class="btn btn-secondary btn-sm" id="generateReport">
                    <i class="fas fa-file-alt"></i> New Report
                </button>
            </div>

            <div class="quick-insights" id="quickInsights">
                <h4>Quick Insights</h4>
                <div class="insight-item">
                    <i class="fas fa-lightbulb"></i>
                    <span>Price prediction accuracy improving</span>
                </div>
                <div class="insight-item">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>High volatility detected in EURUSD</span>
                </div>
            </div>
        `;

        // Insert after subscription section
        const subscriptionSection = sidebar.querySelector('.sidebar-section:nth-child(3)');
        sidebar.insertBefore(analyticsSection, subscriptionSection.nextSibling);
    }

    createAnalyticsDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'analytics-dashboard modal-hidden';
        dashboard.id = 'analyticsDashboard';
        dashboard.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Advanced Analytics Dashboard</h2>
                    <button class="close-btn" id="closeAnalyticsModal">&times;</button>
                </div>
                
                <div class="dashboard-tabs">
                    <button class="tab-btn active" data-tab="overview">Overview</button>
                    <button class="tab-btn" data-tab="predictions">Predictions</button>
                    <button class="tab-btn" data-tab="insights">ML Insights</button>
                    <button class="tab-btn" data-tab="reports">Reports</button>
                </div>

                <div class="tab-content">
                    <div class="tab-pane active" id="overview">
                        <div class="overview-grid">
                            <div class="overview-card">
                                <h3>ML Models Performance</h3>
                                <div class="model-performance">
                                    <div class="model-item">
                                        <span class="model-name">Price Prediction (LSTM)</span>
                                        <span class="model-accuracy">78%</span>
                                    </div>
                                    <div class="model-item">
                                        <span class="model-name">Sentiment Analysis (BERT)</span>
                                        <span class="model-accuracy">82%</span>
                                    </div>
                                    <div class="model-item">
                                        <span class="model-name">User Behavior (RandomForest)</span>
                                        <span class="model-accuracy">85%</span>
                                    </div>
                                    <div class="model-item">
                                        <span class="model-name">Churn Prediction (GradientBoosting)</span>
                                        <span class="model-accuracy">79%</span>
                                    </div>
                                </div>
                            </div>

                            <div class="overview-card">
                                <h3>Real-time Metrics</h3>
                                <div class="real-time-metrics">
                                    <div class="metric">
                                        <span class="metric-label">Active Predictions:</span>
                                        <span class="metric-value" id="activePredictions">24</span>
                                    </div>
                                    <div class="metric">
                                        <span class="metric-label">Insights Generated:</span>
                                        <span class="metric-value" id="insightsGenerated">156</span>
                                    </div>
                                    <div class="metric">
                                        <span class="metric-label">Reports Created:</span>
                                        <span class="metric-value" id="reportsCreated">23</span>
                                    </div>
                                    <div class="metric">
                                        <span class="metric-label">Prediction Accuracy:</span>
                                        <span class="metric-value" id="predictionAccuracy">76.5%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="tab-pane" id="predictions">
                        <div class="predictions-controls">
                            <button class="btn btn-primary" id="generatePricePrediction">
                                <i class="fas fa-chart-line"></i> Generate Price Prediction
                            </button>
                            <button class="btn btn-secondary" id="generateSentiment">
                                <i class="fas fa-brain"></i> Market Sentiment
                            </button>
                            <button class="btn btn-info" id="predictChurn">
                                <i class="fas fa-user-times"></i> Churn Prediction
                            </button>
                        </div>
                        <div class="predictions-display" id="predictionsDisplay"></div>
                    </div>

                    <div class="tab-pane" id="insights">
                        <div class="insights-controls">
                            <button class="btn btn-primary" id="generateTradingInsights">
                                <i class="fas fa-chart-bar"></i> Trading Patterns
                            </button>
                            <button class="btn btn-secondary" id="detectAnomalies">
                                <i class="fas fa-exclamation-triangle"></i> Market Anomalies
                            </button>
                            <button class="btn btn-info" id="optimizeStrategies">
                                <i class="fas fa-cogs"></i> Strategy Optimization
                            </button>
                        </div>
                        <div class="insights-display" id="insightsDisplay"></div>
                    </div>

                    <div class="tab-pane" id="reports">
                        <div class="reports-controls">
                            <button class="btn btn-primary" id="createCustomReport">
                                <i class="fas fa-plus"></i> Create Custom Report
                            </button>
                            <button class="btn btn-secondary" id="scheduleReport">
                                <i class="fas fa-clock"></i> Schedule Report
                            </button>
                        </div>
                        <div class="reports-list" id="reportsList"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(dashboard);
    }

    createReportBuilder() {
        const reportBuilder = document.createElement('div');
        reportBuilder.className = 'report-builder modal-hidden';
        reportBuilder.id = 'reportBuilder';
        reportBuilder.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Custom Report Builder</h2>
                    <button class="close-btn" id="closeReportBuilder">&times;</button>
                </div>
                
                <div class="report-builder-content">
                    <div class="report-config">
                        <div class="form-group">
                            <label>Report Title</label>
                            <input type="text" id="reportTitle" placeholder="Enter report title">
                        </div>
                        
                        <div class="form-group">
                            <label>Report Type</label>
                            <select id="reportType">
                                <option value="trading_performance">Trading Performance</option>
                                <option value="user_analytics">User Analytics</option>
                                <option value="market_analysis">Market Analysis</option>
                                <option value="revenue_forecast">Revenue Forecast</option>
                                <option value="risk_assessment">Risk Assessment</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Time Range</label>
                            <select id="timeRange">
                                <option value="1d">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="90d">Last 90 Days</option>
                                <option value="1y">Last Year</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Metrics to Include</label>
                            <div class="metrics-checkboxes">
                                <label><input type="checkbox" value="performance" checked> Performance Metrics</label>
                                <label><input type="checkbox" value="risk" checked> Risk Metrics</label>
                                <label><input type="checkbox" value="predictions" checked> ML Predictions</label>
                                <label><input type="checkbox" value="insights" checked> AI Insights</label>
                            </div>
                        </div>
                    </div>
                    
                    <div class="report-preview" id="reportPreview">
                        <h3>Report Preview</h3>
                        <div class="preview-content">
                            <p>Configure your report settings to see a preview here.</p>
                        </div>
                    </div>
                </div>
                
                <div class="report-actions">
                    <button class="btn btn-secondary" id="previewReport">Preview</button>
                    <button class="btn btn-primary" id="generateReport">Generate Report</button>
                    <button class="btn btn-success" id="scheduleReport">Schedule Report</button>
                </div>
            </div>
        `;

        document.body.appendChild(reportBuilder);
    }

    setupEventListeners() {
        // Analytics dashboard
        document.getElementById('openAnalyticsDashboard').addEventListener('click', () => {
            this.showAnalyticsDashboard();
        });

        document.getElementById('closeAnalyticsModal').addEventListener('click', () => {
            this.hideAnalyticsDashboard();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Prediction buttons
        document.getElementById('generatePricePrediction').addEventListener('click', () => {
            this.generatePricePrediction();
        });

        document.getElementById('generateSentiment').addEventListener('click', () => {
            this.generateMarketSentiment();
        });

        document.getElementById('predictChurn').addEventListener('click', () => {
            this.predictUserChurn();
        });

        // Insights buttons
        document.getElementById('generateTradingInsights').addEventListener('click', () => {
            this.generateTradingInsights();
        });

        document.getElementById('detectAnomalies').addEventListener('click', () => {
            this.detectMarketAnomalies();
        });

        document.getElementById('optimizeStrategies').addEventListener('click', () => {
            this.optimizeStrategies();
        });

        // Report builder
        document.getElementById('generateReport').addEventListener('click', () => {
            this.showReportBuilder();
        });

        document.getElementById('closeReportBuilder').addEventListener('click', () => {
            this.hideReportBuilder();
        });

        document.getElementById('createCustomReport').addEventListener('click', () => {
            this.showReportBuilder();
        });

        // Report generation
        document.getElementById('previewReport').addEventListener('click', () => {
            this.previewReport();
        });

        document.getElementById('generateReport').addEventListener('click', () => {
            this.generateCustomReport();
        });
    }

    updateAnalyticsDisplay() {
        // Update quick metrics
        document.getElementById('mlAccuracy').textContent = '78%';
        document.getElementById('predictionsCount').textContent = '24';
        document.getElementById('insightsCount').textContent = '12';
    }

    showAnalyticsDashboard() {
        document.getElementById('analyticsDashboard').classList.remove('modal-hidden');
        this.updateDashboardMetrics();
    }

    hideAnalyticsDashboard() {
        document.getElementById('analyticsDashboard').classList.add('modal-hidden');
    }

    switchTab(tabName) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');
    }

    async generatePricePrediction() {
        try {
            const prediction = await this.advancedAnalytics.generatePricePrediction('EURUSD', '1h', 24);
            this.displayPrediction(prediction);
        } catch (error) {
            console.error('Failed to generate price prediction:', error);
        }
    }

    async generateMarketSentiment() {
        try {
            const sentiment = await this.advancedAnalytics.generateMarketSentiment();
            this.displaySentiment(sentiment);
        } catch (error) {
            console.error('Failed to generate market sentiment:', error);
        }
    }

    async predictUserChurn() {
        try {
            const userData = { /* user data */ };
            const churnPrediction = await this.advancedAnalytics.predictUserChurn('user123', userData);
            this.displayChurnPrediction(churnPrediction);
        } catch (error) {
            console.error('Failed to predict user churn:', error);
        }
    }

    async generateTradingInsights() {
        try {
            const insights = await this.advancedAnalytics.generateMLInsights('trading_patterns', []);
            this.displayInsights(insights);
        } catch (error) {
            console.error('Failed to generate trading insights:', error);
        }
    }

    async detectMarketAnomalies() {
        try {
            const insights = await this.advancedAnalytics.generateMLInsights('market_anomalies', []);
            this.displayInsights(insights);
        } catch (error) {
            console.error('Failed to detect market anomalies:', error);
        }
    }

    async optimizeStrategies() {
        try {
            const insights = await this.advancedAnalytics.generateMLInsights('strategy_optimization', []);
            this.displayInsights(insights);
        } catch (error) {
            console.error('Failed to optimize strategies:', error);
        }
    }

    showReportBuilder() {
        document.getElementById('reportBuilder').classList.remove('modal-hidden');
    }

    hideReportBuilder() {
        document.getElementById('reportBuilder').classList.add('modal-hidden');
    }

    async previewReport() {
        const reportConfig = this.getReportConfig();
        const preview = await this.advancedAnalytics.generateCustomReport(reportConfig);
        this.displayReportPreview(preview);
    }

    async generateCustomReport() {
        const reportConfig = this.getReportConfig();
        const report = await this.advancedAnalytics.generateCustomReport(reportConfig);
        this.displayReport(report);
        this.hideReportBuilder();
    }

    getReportConfig() {
        return {
            title: document.getElementById('reportTitle').value || 'Custom Report',
            type: document.getElementById('reportType').value,
            filters: {
                timeRange: document.getElementById('timeRange').value
            },
            metrics: Array.from(document.querySelectorAll('.metrics-checkboxes input:checked'))
                .map(input => input.value)
        };
    }

    displayPrediction(prediction) {
        const display = document.getElementById('predictionsDisplay');
        display.innerHTML = `
            <div class="prediction-card">
                <h3>Price Prediction: ${prediction.symbol}</h3>
                <div class="prediction-details">
                    <div class="prediction-item">
                        <span class="label">Model:</span>
                        <span class="value">${prediction.model}</span>
                    </div>
                    <div class="prediction-item">
                        <span class="label">Accuracy:</span>
                        <span class="value">${(prediction.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    <div class="prediction-item">
                        <span class="label">Timeframe:</span>
                        <span class="value">${prediction.timeframe}</span>
                    </div>
                </div>
                <div class="prediction-chart">
                    <canvas id="predictionChart"></canvas>
                </div>
            </div>
        `;
    }

    displaySentiment(sentiment) {
        const display = document.getElementById('predictionsDisplay');
        display.innerHTML = `
            <div class="sentiment-card">
                <h3>Market Sentiment Analysis</h3>
                <div class="sentiment-grid">
                    ${Object.entries(sentiment).map(([symbol, data]) => `
                        <div class="sentiment-item">
                            <h4>${symbol}</h4>
                            <div class="sentiment-metrics">
                                <div class="metric">
                                    <span class="label">Overall:</span>
                                    <span class="value ${data.overallSentiment > 0 ? 'positive' : 'negative'}">
                                        ${(data.overallSentiment * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div class="metric">
                                    <span class="label">Technical:</span>
                                    <span class="value ${data.technicalSentiment > 0 ? 'positive' : 'negative'}">
                                        ${(data.technicalSentiment * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div class="metric">
                                    <span class="label">News:</span>
                                    <span class="value ${data.newsSentiment > 0 ? 'positive' : 'negative'}">
                                        ${(data.newsSentiment * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    displayInsights(insights) {
        const display = document.getElementById('insightsDisplay');
        display.innerHTML = `
            <div class="insights-container">
                <h3>AI Insights</h3>
                <div class="insights-grid">
                    ${insights.insights.map(insight => `
                        <div class="insight-card ${insight.impact}">
                            <div class="insight-header">
                                <i class="fas fa-lightbulb"></i>
                                <h4>${insight.title}</h4>
                            </div>
                            <p>${insight.description}</p>
                            <div class="insight-meta">
                                <span class="confidence">Confidence: ${(insight.confidence * 100).toFixed(1)}%</span>
                                <span class="impact">Impact: ${insight.impact}</span>
                            </div>
                            <div class="insight-recommendation">
                                <strong>Recommendation:</strong> ${insight.recommendation}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    displayReport(report) {
        // Display the generated report
        console.log('Report generated:', report);
    }

    displayReportPreview(preview) {
        const previewContent = document.querySelector('.preview-content');
        previewContent.innerHTML = `
            <div class="report-preview-content">
                <h4>${preview.title}</h4>
                <p>Report type: ${preview.type}</p>
                <p>Generated: ${preview.generatedAt.toLocaleString()}</p>
                <div class="preview-metrics">
                    <div class="metric">Total records: ${Object.keys(preview.data).length}</div>
                </div>
            </div>
        `;
    }

    updateDashboardMetrics() {
        // Update dashboard metrics
        document.getElementById('activePredictions').textContent = '24';
        document.getElementById('insightsGenerated').textContent = '156';
        document.getElementById('reportsCreated').textContent = '23';
        document.getElementById('predictionAccuracy').textContent = '76.5%';
    }
}

// Add CSS styles for analytics UI
const analyticsStyles = `
    .analytics-overview {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 15px;
    }

    .metric-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 8px;
        text-align: center;
    }

    .metric-value {
        font-size: 18px;
        font-weight: 600;
        color: #4ecdc4;
    }

    .metric-label {
        font-size: 10px;
        color: #ccc;
        margin-top: 2px;
    }

    .analytics-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 15px;
    }

    .quick-insights {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 12px;
    }

    .quick-insights h4 {
        font-size: 12px;
        color: #4ecdc4;
        margin-bottom: 8px;
    }

    .insight-item {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
        font-size: 11px;
        color: #ccc;
    }

    .insight-item i {
        margin-right: 6px;
        font-size: 10px;
        color: #ffd700;
    }

    /* Analytics Dashboard */
    .analytics-dashboard {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .dashboard-tabs {
        display: flex;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 20px;
    }

    .tab-btn {
        background: none;
        border: none;
        color: #ccc;
        padding: 12px 20px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.3s ease;
    }

    .tab-btn.active {
        color: #4ecdc4;
        border-bottom-color: #4ecdc4;
    }

    .tab-content {
        min-height: 400px;
    }

    .tab-pane {
        display: none;
    }

    .tab-pane.active {
        display: block;
    }

    .overview-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
    }

    .overview-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
    }

    .overview-card h3 {
        color: #4ecdc4;
        margin-bottom: 16px;
        font-size: 16px;
    }

    .model-performance {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .model-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .model-name {
        font-size: 12px;
        color: #ccc;
    }

    .model-accuracy {
        font-size: 14px;
        font-weight: 600;
        color: #4ecdc4;
    }

    .real-time-metrics {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metric {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .metric-label {
        font-size: 12px;
        color: #ccc;
    }

    .metric-value {
        font-size: 14px;
        font-weight: 600;
        color: #4ecdc4;
    }

    /* Predictions Tab */
    .predictions-controls {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
    }

    .predictions-display {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        min-height: 300px;
    }

    .prediction-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 20px;
    }

    .prediction-card h3 {
        color: #4ecdc4;
        margin-bottom: 16px;
    }

    .prediction-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
    }

    .prediction-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .prediction-item .label {
        font-size: 12px;
        color: #ccc;
    }

    .prediction-item .value {
        font-size: 14px;
        font-weight: 600;
        color: #4ecdc4;
    }

    /* Sentiment Analysis */
    .sentiment-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
    }

    .sentiment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
    }

    .sentiment-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 16px;
    }

    .sentiment-item h4 {
        color: #4ecdc4;
        margin-bottom: 12px;
        font-size: 14px;
    }

    .sentiment-metrics {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

    .sentiment-metrics .metric {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 12px;
    }

    .sentiment-metrics .label {
        color: #ccc;
    }

    .sentiment-metrics .value {
        font-weight: 600;
    }

    .sentiment-metrics .value.positive {
        color: #4caf50;
    }

    .sentiment-metrics .value.negative {
        color: #f44336;
    }

    /* Insights Tab */
    .insights-controls {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
    }

    .insights-display {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        min-height: 300px;
    }

    .insights-grid {
        display: grid;
        gap: 16px;
    }

    .insight-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 16px;
        border-left: 4px solid #4ecdc4;
    }

    .insight-card.critical {
        border-left-color: #f44336;
    }

    .insight-card.high {
        border-left-color: #ff9800;
    }

    .insight-card.medium {
        border-left-color: #ffd700;
    }

    .insight-header {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
    }

    .insight-header i {
        color: #ffd700;
        margin-right: 8px;
    }

    .insight-header h4 {
        color: #4ecdc4;
        margin: 0;
        font-size: 14px;
    }

    .insight-card p {
        color: #ccc;
        font-size: 12px;
        margin-bottom: 12px;
    }

    .insight-meta {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 11px;
    }

    .insight-meta .confidence {
        color: #4ecdc4;
    }

    .insight-meta .impact {
        color: #ffd700;
    }

    .insight-recommendation {
        background: rgba(78, 205, 196, 0.1);
        border-radius: 4px;
        padding: 8px;
        font-size: 11px;
        color: #ccc;
    }

    /* Report Builder */
    .report-builder {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .report-builder-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
    }

    .report-config {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
    }

    .report-preview {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
    }

    .metrics-checkboxes {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .metrics-checkboxes label {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #ccc;
        cursor: pointer;
    }

    .metrics-checkboxes input {
        margin-right: 8px;
    }

    .report-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .overview-grid {
            grid-template-columns: 1fr;
        }

        .predictions-controls,
        .insights-controls {
            flex-direction: column;
        }

        .report-builder-content {
            grid-template-columns: 1fr;
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = analyticsStyles;
document.head.appendChild(styleSheet);

module.exports = { AnalyticsUI };




