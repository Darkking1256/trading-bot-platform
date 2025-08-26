// Business UI - Subscription and Monetization Interface
class BusinessUI {
    constructor(businessManager) {
        this.businessManager = businessManager;
        this.currentUser = null;
        this.currentPlan = 'free';
        
        this.init();
    }

    init() {
        this.createBusinessComponents();
        this.setupEventListeners();
        this.updatePlanDisplay();
    }

    createBusinessComponents() {
        // Create subscription panel in sidebar
        this.createSubscriptionPanel();
        
        // Create upgrade prompts
        this.createUpgradePrompts();
        
        // Create admin dashboard (if admin)
        this.createAdminDashboard();
    }

    createSubscriptionPanel() {
        const sidebar = document.querySelector('.sidebar');
        
        const subscriptionSection = document.createElement('div');
        subscriptionSection.className = 'sidebar-section';
        subscriptionSection.innerHTML = `
            <h3><i class="fas fa-crown"></i> Subscription</h3>
            
            <div class="current-plan" id="currentPlanDisplay">
                <div class="plan-badge">
                    <span class="plan-name" id="planName">Free</span>
                    <span class="plan-price" id="planPrice">$0/month</span>
                </div>
            </div>

            <div class="plan-features" id="planFeatures">
                <div class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>Basic trading strategies</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>Demo trading only</span>
                </div>
                <div class="feature-item">
                    <i class="fas fa-check"></i>
                    <span>Limited market data</span>
                </div>
            </div>

            <div class="upgrade-cta">
                <button class="btn btn-primary btn-sm" id="upgradeBtn">
                    <i class="fas fa-arrow-up"></i> Upgrade Plan
                </button>
            </div>

            <div class="usage-limits" id="usageLimits">
                <h4>Usage Limits</h4>
                <div class="limit-item">
                    <span class="limit-label">Strategies:</span>
                    <span class="limit-value" id="strategyLimit">3/3</span>
                </div>
                <div class="limit-item">
                    <span class="limit-label">Daily Trades:</span>
                    <span class="limit-value" id="tradeLimit">0/10</span>
                </div>
                <div class="limit-item">
                    <span class="limit-label">Symbols:</span>
                    <span class="limit-value" id="symbolLimit">5/5</span>
                </div>
            </div>
        `;

        // Insert after broker connection section
        const brokerSection = sidebar.querySelector('.sidebar-section:nth-child(2)');
        sidebar.insertBefore(subscriptionSection, brokerSection.nextSibling);
    }

    createUpgradePrompts() {
        // Create upgrade modal
        const modal = document.createElement('div');
        modal.className = 'upgrade-modal' + ' modal-hidden';
        modal.id = 'upgradeModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Choose Your Plan</h2>
                    <button class="close-btn" id="closeUpgradeModal">&times;</button>
                </div>
                
                <div class="plans-grid">
                    <div class="plan-card" data-plan="starter">
                        <div class="plan-header">
                            <h3>Starter</h3>
                            <div class="plan-price">$29.99<span>/month</span></div>
                        </div>
                        <div class="plan-features">
                            <div class="feature">✓ All trading strategies</div>
                            <div class="feature">✓ Live trading with 1 broker</div>
                            <div class="feature">✓ Real-time market data</div>
                            <div class="feature">✓ Email support</div>
                            <div class="feature">✓ Basic analytics</div>
                        </div>
                        <button class="btn btn-primary select-plan-btn" data-plan="starter">
                            Select Starter
                        </button>
                    </div>

                    <div class="plan-card featured" data-plan="professional">
                        <div class="plan-badge">Most Popular</div>
                        <div class="plan-header">
                            <h3>Professional</h3>
                            <div class="plan-price">$99.99<span>/month</span></div>
                        </div>
                        <div class="plan-features">
                            <div class="feature">✓ All trading strategies</div>
                            <div class="feature">✓ Live trading with all brokers</div>
                            <div class="feature">✓ Advanced analytics</div>
                            <div class="feature">✓ Priority support</div>
                            <div class="feature">✓ Custom indicators</div>
                            <div class="feature">✓ Portfolio management</div>
                        </div>
                        <button class="btn btn-primary select-plan-btn" data-plan="professional">
                            Select Professional
                        </button>
                    </div>

                    <div class="plan-card" data-plan="enterprise">
                        <div class="plan-header">
                            <h3>Enterprise</h3>
                            <div class="plan-price">$299.99<span>/month</span></div>
                        </div>
                        <div class="plan-features">
                            <div class="feature">✓ Everything in Professional</div>
                            <div class="feature">✓ White-label solution</div>
                            <div class="feature">✓ API access</div>
                            <div class="feature">✓ Dedicated support</div>
                            <div class="feature">✓ Custom development</div>
                            <div class="feature">✓ Multi-user management</div>
                        </div>
                        <button class="btn btn-primary select-plan-btn" data-plan="enterprise">
                            Select Enterprise
                        </button>
                    </div>
                </div>

                <div class="payment-section" id="paymentSection" style="display: none;">
                    <h3>Payment Information</h3>
                    <div class="payment-form">
                        <div class="form-group">
                            <label>Card Number</label>
                            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Expiry Date</label>
                                <input type="text" id="cardExpiry" placeholder="MM/YY">
                            </div>
                            <div class="form-group">
                                <label>CVC</label>
                                <input type="text" id="cardCvc" placeholder="123">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Name on Card</label>
                            <input type="text" id="cardName" placeholder="John Doe">
                        </div>
                        <button class="btn btn-success" id="processPayment">
                            <i class="fas fa-lock"></i> Secure Payment
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    createAdminDashboard() {
        // Create admin dashboard for business analytics
        const adminDashboard = document.createElement('div');
        adminDashboard.className = 'admin-dashboard modal-hidden';
        adminDashboard.id = 'adminDashboard';
        adminDashboard.innerHTML = `
            <div class="modal-content large">
                <div class="modal-header">
                    <h2>Business Analytics Dashboard</h2>
                    <button class="close-btn" id="closeAdminModal">&times;</button>
                </div>
                
                <div class="analytics-grid">
                    <div class="analytics-card">
                        <h3>User Metrics</h3>
                        <div class="metric">
                            <span class="metric-label">Total Users:</span>
                            <span class="metric-value" id="totalUsers">0</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Active Subscriptions:</span>
                            <span class="metric-value" id="activeSubscriptions">0</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Conversion Rate:</span>
                            <span class="metric-value" id="conversionRate">0%</span>
                        </div>
                    </div>

                    <div class="analytics-card">
                        <h3>Revenue</h3>
                        <div class="metric">
                            <span class="metric-label">Monthly Revenue:</span>
                            <span class="metric-value" id="monthlyRevenue">$0</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Churn Rate:</span>
                            <span class="metric-value" id="churnRate">0%</span>
                        </div>
                    </div>

                    <div class="analytics-card">
                        <h3>Subscriptions by Plan</h3>
                        <div id="subscriptionsByPlan">
                            <div class="plan-distribution">
                                <div class="plan-bar">
                                    <span>Free</span>
                                    <div class="bar" style="width: 0%"></div>
                                </div>
                                <div class="plan-bar">
                                    <span>Starter</span>
                                    <div class="bar" style="width: 0%"></div>
                                </div>
                                <div class="plan-bar">
                                    <span>Professional</span>
                                    <div class="bar" style="width: 0%"></div>
                                </div>
                                <div class="plan-bar">
                                    <span>Enterprise</span>
                                    <div class="bar" style="width: 0%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="admin-actions">
                    <button class="btn btn-primary" id="generateReport">
                        <i class="fas fa-download"></i> Generate Report
                    </button>
                    <button class="btn btn-secondary" id="exportData">
                        <i class="fas fa-file-export"></i> Export Data
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(adminDashboard);
    }

    setupEventListeners() {
        // Upgrade button
        document.getElementById('upgradeBtn').addEventListener('click', () => {
            this.showUpgradeModal();
        });

        // Close upgrade modal
        document.getElementById('closeUpgradeModal').addEventListener('click', () => {
            this.hideUpgradeModal();
        });

        // Plan selection
        document.querySelectorAll('.select-plan-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plan = e.target.dataset.plan;
                this.selectPlan(plan);
            });
        });

        // Payment processing
        document.getElementById('processPayment').addEventListener('click', () => {
            this.processPayment();
        });

        // Admin dashboard
        if (this.isAdmin()) {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                    this.showAdminDashboard();
                }
            });
        }

        // Close admin modal
        document.getElementById('closeAdminModal').addEventListener('click', () => {
            this.hideAdminDashboard();
        });
    }

    updatePlanDisplay() {
        const plan = this.businessManager.subscriptionPlans[this.currentPlan];
        
        document.getElementById('planName').textContent = plan.name;
        document.getElementById('planPrice').textContent = plan.price === 0 ? 'Free' : `$${plan.price}/month`;
        
        // Update features
        const featuresContainer = document.getElementById('planFeatures');
        featuresContainer.innerHTML = plan.features.map(feature => 
            `<div class="feature-item"><i class="fas fa-check"></i><span>${feature}</span></div>`
        ).join('');

        // Update usage limits
        this.updateUsageLimits();
    }

    updateUsageLimits() {
        const limits = this.businessManager.getUsageLimits(this.currentUser?.id);
        if (limits) {
            document.getElementById('strategyLimit').textContent = `3/${limits.maxStrategies}`;
            document.getElementById('tradeLimit').textContent = `0/${limits.maxTradesPerDay}`;
            document.getElementById('symbolLimit').textContent = `5/${limits.maxSymbols}`;
        }
    }

    showUpgradeModal() {
        document.getElementById('upgradeModal').classList.remove('modal-hidden');
    }

    hideUpgradeModal() {
        document.getElementById('upgradeModal').classList.add('modal-hidden');
        document.getElementById('paymentSection').style.display = 'none';
    }

    selectPlan(planId) {
        // Show payment section
        document.getElementById('paymentSection').style.display = 'block';
        
        // Highlight selected plan
        document.querySelectorAll('.plan-card').forEach(card => {
            card.classList.remove('selected');
        });
        document.querySelector(`[data-plan="${planId}"]`).classList.add('selected');
        
        // Store selected plan
        this.selectedPlan = planId;
    }

    async processPayment() {
        const paymentData = {
            method: 'stripe',
            transactionId: 'txn_' + Date.now()
        };

        try {
            // Process payment
            const payment = await this.businessManager.processPayment(
                this.currentUser.id,
                this.selectedPlan,
                paymentData
            );

            // Create subscription
            const subscription = await this.businessManager.createSubscription(
                this.currentUser.id,
                this.selectedPlan
            );

            // Update UI
            this.currentPlan = this.selectedPlan;
            this.updatePlanDisplay();
            this.hideUpgradeModal();

            // Show success message
            this.showNotification('Payment successful! Your subscription has been activated.', 'success');

        } catch (error) {
            this.showNotification('Payment failed: ' + error.message, 'error');
        }
    }

    showAdminDashboard() {
        this.updateAdminMetrics();
        document.getElementById('adminDashboard').classList.remove('modal-hidden');
    }

    hideAdminDashboard() {
        document.getElementById('adminDashboard').classList.add('modal-hidden');
    }

    async updateAdminMetrics() {
        const report = await this.businessManager.generateAnalyticsReport();
        
        document.getElementById('totalUsers').textContent = report.users.total;
        document.getElementById('activeSubscriptions').textContent = report.users.active;
        document.getElementById('conversionRate').textContent = report.users.conversionRate.toFixed(1) + '%';
        document.getElementById('monthlyRevenue').textContent = '$' + report.revenue.monthly.toFixed(2);
        document.getElementById('churnRate').textContent = report.subscriptions.churnRate.toFixed(1) + '%';

        // Update subscription distribution
        this.updateSubscriptionDistribution(report.subscriptions.byPlan);
    }

    updateSubscriptionDistribution(subscriptions) {
        const total = Object.values(subscriptions).reduce((sum, count) => sum + count, 0);
        
        Object.entries(subscriptions).forEach(([plan, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const bar = document.querySelector(`[data-plan="${plan}"] .bar`);
            if (bar) {
                bar.style.width = percentage + '%';
            }
        });
    }

    isAdmin() {
        // Simple admin check - in real app, check user role
        return this.currentUser?.email === 'admin@tradingbotpro.com';
    }

    showNotification(message, type = 'info') {
        // Add notification to trading log
        if (window.tradingBot && window.tradingBot.addLogEntry) {
            window.tradingBot.addLogEntry(`[BUSINESS] ${message}`, type);
        }
    }

    // Feature access checks
    checkFeatureAccess(feature) {
        if (!this.currentUser) return false;
        return this.businessManager.canAccessFeature(this.currentUser.id, feature);
    }

    // Usage tracking
    trackUsage(feature, count = 1) {
        // Track feature usage for limits
        console.log(`Usage tracked: ${feature} +${count}`);
    }
}

// Add CSS styles for business UI
const businessStyles = `
    .current-plan {
        margin-bottom: 15px;
    }

    .plan-badge {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px;
        border-radius: 8px;
        text-align: center;
    }

    .plan-name {
        display: block;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 4px;
    }

    .plan-price {
        font-size: 14px;
        opacity: 0.9;
    }

    .plan-features {
        margin-bottom: 15px;
    }

    .feature-item {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        font-size: 12px;
        color: #ccc;
    }

    .feature-item i {
        color: #4caf50;
        margin-right: 8px;
        font-size: 10px;
    }

    .upgrade-cta {
        margin-bottom: 15px;
    }

    .usage-limits {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 12px;
    }

    .usage-limits h4 {
        font-size: 14px;
        margin-bottom: 10px;
        color: #4ecdc4;
    }

    .limit-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
        font-size: 12px;
    }

    .limit-label {
        color: #ccc;
    }

    .limit-value {
        color: #4ecdc4;
        font-weight: 600;
    }

    /* Upgrade Modal */
    .upgrade-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-hidden {
        display: none;
    }

    .modal-content {
        background: #1a1a2e;
        border-radius: 12px;
        padding: 24px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-content.large {
        max-width: 1200px;
    }

    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .modal-header h2 {
        color: #4ecdc4;
        margin: 0;
    }

    .close-btn {
        background: none;
        border: none;
        color: #ccc;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .plans-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
    }

    .plan-card {
        background: rgba(255, 255, 255, 0.05);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        position: relative;
        transition: all 0.3s ease;
    }

    .plan-card:hover {
        border-color: #4ecdc4;
        transform: translateY(-2px);
    }

    .plan-card.featured {
        border-color: #4ecdc4;
        background: rgba(78, 205, 196, 0.1);
    }

    .plan-card.selected {
        border-color: #4caf50;
        background: rgba(76, 175, 80, 0.1);
    }

    .plan-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: #4ecdc4;
        color: #1a1a2e;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 600;
    }

    .plan-header h3 {
        color: #4ecdc4;
        margin: 0 0 8px 0;
        font-size: 20px;
    }

    .plan-price {
        font-size: 24px;
        font-weight: 600;
        color: white;
        margin-bottom: 16px;
    }

    .plan-price span {
        font-size: 14px;
        opacity: 0.7;
    }

    .plan-features {
        margin-bottom: 20px;
    }

    .feature {
        margin-bottom: 8px;
        font-size: 14px;
        color: #ccc;
    }

    .select-plan-btn {
        width: 100%;
        padding: 12px;
        font-size: 14px;
        font-weight: 600;
    }

    /* Payment Section */
    .payment-section {
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        padding-top: 24px;
    }

    .payment-section h3 {
        color: #4ecdc4;
        margin-bottom: 16px;
    }

    .payment-form {
        display: grid;
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
    }

    .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
    }

    .form-group label {
        font-size: 12px;
        color: #ccc;
        margin-bottom: 4px;
    }

    .form-group input {
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: white;
        font-size: 14px;
    }

    /* Admin Dashboard */
    .admin-dashboard {
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

    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        margin-bottom: 24px;
    }

    .analytics-card {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
    }

    .analytics-card h3 {
        color: #4ecdc4;
        margin-bottom: 16px;
        font-size: 16px;
    }

    .metric {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .metric-label {
        color: #ccc;
        font-size: 14px;
    }

    .metric-value {
        color: #4ecdc4;
        font-weight: 600;
        font-size: 16px;
    }

    .plan-distribution {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .plan-bar {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .plan-bar span {
        min-width: 80px;
        font-size: 12px;
        color: #ccc;
    }

    .plan-bar .bar {
        height: 8px;
        background: #4ecdc4;
        border-radius: 4px;
        transition: width 0.3s ease;
    }

    .admin-actions {
        display: flex;
        gap: 12px;
        justify-content: center;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        .plans-grid {
            grid-template-columns: 1fr;
        }

        .form-row {
            grid-template-columns: 1fr;
        }

        .analytics-grid {
            grid-template-columns: 1fr;
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = businessStyles;
document.head.appendChild(styleSheet);

module.exports = { BusinessUI };




