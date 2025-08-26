// Broker Connection UI - User Interface for Real Broker Connections
class BrokerConnectionUI {
    constructor(brokerManager) {
        this.brokerManager = brokerManager;
        this.currentBroker = null;
        this.connectionStatus = 'disconnected';
        this.accountInfo = null;
        this.positions = [];
        
        this.init();
    }

    init() {
        this.createBrokerConnectionPanel();
        this.setupEventListeners();
        this.updateConnectionStatus();
    }

    createBrokerConnectionPanel() {
        const sidebar = document.querySelector('.sidebar');
        
        // Create broker connection section
        const brokerSection = document.createElement('div');
        brokerSection.className = 'sidebar-section';
        brokerSection.innerHTML = `
            <h3><i class="fas fa-plug"></i> Broker Connection</h3>
            
            <div class="connection-status">
                <div class="status-indicator">
                    <span class="status-dot" id="brokerStatusDot"></span>
                    <span class="status-text" id="brokerStatusText">Disconnected</span>
                </div>
            </div>

            <div class="broker-selector">
                <label>Select Broker:</label>
                <select id="brokerSelect">
                    <option value="demo">Demo Account</option>
                    <option value="oanda">OANDA</option>
                    <option value="fxcm">FXCM</option>
                    <option value="interactive-brokers">Interactive Brokers</option>
                </select>
            </div>

            <div class="credentials-form" id="credentialsForm" style="display: none;">
                <div class="credential-group">
                    <label>API Key:</label>
                    <input type="password" id="apiKey" placeholder="Enter API Key">
                </div>
                <div class="credential-group">
                    <label>Account ID:</label>
                    <input type="text" id="accountId" placeholder="Enter Account ID">
                </div>
                <div class="credential-group">
                    <label>Environment:</label>
                    <select id="environment">
                        <option value="demo">Demo</option>
                        <option value="live">Live</option>
                    </select>
                </div>
            </div>

            <div class="connection-actions">
                <button class="btn btn-primary btn-sm" id="connectBroker">
                    <i class="fas fa-link"></i> Connect
                </button>
                <button class="btn btn-danger btn-sm" id="disconnectBroker" style="display: none;">
                    <i class="fas fa-unlink"></i> Disconnect
                </button>
            </div>

            <div class="account-info" id="accountInfo" style="display: none;">
                <div class="info-item">
                    <span class="info-label">Balance:</span>
                    <span class="info-value" id="accountBalance">$0.00</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Equity:</span>
                    <span class="info-value" id="accountEquity">$0.00</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Margin:</span>
                    <span class="info-value" id="accountMargin">$0.00</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Free Margin:</span>
                    <span class="info-value" id="accountFreeMargin">$0.00</span>
                </div>
            </div>

            <div class="positions-summary" id="positionsSummary" style="display: none;">
                <h4>Open Positions</h4>
                <div class="positions-list" id="positionsList"></div>
            </div>
        `;

        // Insert after the first section
        const firstSection = sidebar.querySelector('.sidebar-section');
        sidebar.insertBefore(brokerSection, firstSection.nextSibling);
    }

    setupEventListeners() {
        // Broker selection
        document.getElementById('brokerSelect').addEventListener('change', (e) => {
            this.onBrokerSelect(e.target.value);
        });

        // Connect button
        document.getElementById('connectBroker').addEventListener('click', () => {
            this.connectToBroker();
        });

        // Disconnect button
        document.getElementById('disconnectBroker').addEventListener('click', () => {
            this.disconnectFromBroker();
        });

        // Environment change
        document.getElementById('environment').addEventListener('change', (e) => {
            this.onEnvironmentChange(e.target.value);
        });
    }

    onBrokerSelect(brokerName) {
        const credentialsForm = document.getElementById('credentialsForm');
        const connectBtn = document.getElementById('connectBroker');
        
        if (brokerName === 'demo') {
            credentialsForm.style.display = 'none';
            connectBtn.textContent = 'Connect to Demo';
        } else {
            credentialsForm.style.display = 'block';
            connectBtn.textContent = `Connect to ${brokerName.toUpperCase()}`;
        }
    }

    onEnvironmentChange(environment) {
        // Update API endpoints based on environment
        console.log(`Environment changed to: ${environment}`);
    }

    async connectToBroker() {
        const brokerName = document.getElementById('brokerSelect').value;
        const connectBtn = document.getElementById('connectBroker');
        
        try {
            connectBtn.disabled = true;
            connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            
            let credentials = {};
            
            if (brokerName !== 'demo') {
                credentials = {
                    apiKey: document.getElementById('apiKey').value,
                    accountId: document.getElementById('accountId').value,
                    environment: document.getElementById('environment').value
                };
                
                if (!credentials.apiKey || !credentials.accountId) {
                    throw new Error('Please enter API Key and Account ID');
                }
            }
            
            const result = await this.brokerManager.connectBroker(brokerName, credentials);
            
            if (result.success) {
                this.currentBroker = brokerName;
                this.connectionStatus = 'connected';
                this.updateConnectionStatus();
                this.showAccountInfo();
                this.showPositions();
                
                // Update UI
                document.getElementById('connectBroker').style.display = 'none';
                document.getElementById('disconnectBroker').style.display = 'inline-block';
                
                // Add success message to log
                this.addLogEntry(`Connected to ${brokerName.toUpperCase()} successfully`, 'success');
                
            } else {
                throw new Error(result.error);
            }
            
        } catch (error) {
            console.error('Connection failed:', error);
            this.addLogEntry(`Connection failed: ${error.message}`, 'error');
            
        } finally {
            connectBtn.disabled = false;
            connectBtn.innerHTML = '<i class="fas fa-link"></i> Connect';
        }
    }

    async disconnectFromBroker() {
        try {
            await this.brokerManager.disconnectBroker();
            
            this.currentBroker = null;
            this.connectionStatus = 'disconnected';
            this.updateConnectionStatus();
            
            // Update UI
            document.getElementById('connectBroker').style.display = 'inline-block';
            document.getElementById('disconnectBroker').style.display = 'none';
            document.getElementById('accountInfo').style.display = 'none';
            document.getElementById('positionsSummary').style.display = 'none';
            
            this.addLogEntry('Disconnected from broker', 'info');
            
        } catch (error) {
            console.error('Disconnect failed:', error);
            this.addLogEntry(`Disconnect failed: ${error.message}`, 'error');
        }
    }

    updateConnectionStatus() {
        const statusDot = document.getElementById('brokerStatusDot');
        const statusText = document.getElementById('brokerStatusText');
        
        if (this.connectionStatus === 'connected') {
            statusDot.style.background = '#4caf50';
            statusText.textContent = `Connected to ${this.currentBroker.toUpperCase()}`;
        } else {
            statusDot.style.background = '#f44336';
            statusText.textContent = 'Disconnected';
        }
    }

    async showAccountInfo() {
        try {
            const accountInfo = await this.brokerManager.getAccountInfo();
            this.accountInfo = accountInfo;
            
            // Update display
            document.getElementById('accountBalance').textContent = `$${accountInfo.balance?.toFixed(2) || '0.00'}`;
            document.getElementById('accountEquity').textContent = `$${accountInfo.equity?.toFixed(2) || '0.00'}`;
            document.getElementById('accountMargin').textContent = `$${accountInfo.margin?.toFixed(2) || '0.00'}`;
            document.getElementById('accountFreeMargin').textContent = `$${accountInfo.freeMargin?.toFixed(2) || '0.00'}`;
            
            document.getElementById('accountInfo').style.display = 'block';
            
        } catch (error) {
            console.error('Failed to get account info:', error);
        }
    }

    async showPositions() {
        try {
            const positions = await this.brokerManager.getPositions();
            this.positions = positions;
            
            const positionsList = document.getElementById('positionsList');
            positionsList.innerHTML = '';
            
            if (positions.length === 0) {
                positionsList.innerHTML = '<div class="no-positions">No open positions</div>';
            } else {
                positions.forEach(position => {
                    const positionElement = document.createElement('div');
                    positionElement.className = 'position-item';
                    positionElement.innerHTML = `
                        <div class="position-header">
                            <span class="position-symbol">${position.symbol}</span>
                            <span class="position-side ${position.side.toLowerCase()}">${position.side}</span>
                        </div>
                        <div class="position-details">
                            <span class="position-quantity">${position.quantity}</span>
                            <span class="position-price">${position.price?.toFixed(4) || '0.0000'}</span>
                            <span class="position-pnl ${position.unrealizedPnL >= 0 ? 'positive' : 'negative'}">
                                ${position.unrealizedPnL?.toFixed(2) || '0.00'}
                            </span>
                        </div>
                    `;
                    positionsList.appendChild(positionElement);
                });
            }
            
            document.getElementById('positionsSummary').style.display = 'block';
            
        } catch (error) {
            console.error('Failed to get positions:', error);
        }
    }

    addLogEntry(message, type = 'info') {
        // Add to trading log
        if (window.tradingBot && window.tradingBot.addLogEntry) {
            window.tradingBot.addLogEntry(`[BROKER] ${message}`, type);
        }
    }

    // Get current broker status
    getBrokerStatus() {
        return {
            connected: this.connectionStatus === 'connected',
            broker: this.currentBroker,
            accountInfo: this.accountInfo,
            positions: this.positions
        };
    }

    // Update positions periodically
    startPositionUpdates() {
        if (this.connectionStatus === 'connected') {
            setInterval(() => {
                this.showPositions();
            }, 5000); // Update every 5 seconds
        }
    }
}

// Add CSS styles for broker connection UI
const brokerStyles = `
    .connection-status {
        margin-bottom: 15px;
    }

    .broker-selector {
        margin-bottom: 15px;
    }

    .broker-selector label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #ccc;
        margin-bottom: 5px;
    }

    .broker-selector select {
        width: 100%;
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: #ffffff;
        font-size: 14px;
    }

    .credentials-form {
        margin-bottom: 15px;
    }

    .credential-group {
        margin-bottom: 10px;
    }

    .credential-group label {
        display: block;
        font-size: 12px;
        font-weight: 500;
        color: #ccc;
        margin-bottom: 3px;
    }

    .credential-group input,
    .credential-group select {
        width: 100%;
        padding: 8px 10px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: #ffffff;
        font-size: 12px;
    }

    .connection-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 15px;
    }

    .btn-sm {
        padding: 8px 16px;
        font-size: 12px;
    }

    .account-info {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 6px;
        padding: 12px;
        margin-bottom: 15px;
    }

    .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .info-item:last-child {
        margin-bottom: 0;
    }

    .info-label {
        font-size: 12px;
        color: #ccc;
    }

    .info-value {
        font-size: 12px;
        color: #4ecdc4;
        font-weight: 600;
    }

    .positions-summary h4 {
        font-size: 14px;
        font-weight: 600;
        color: #4ecdc4;
        margin-bottom: 10px;
    }

    .position-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        padding: 8px;
        margin-bottom: 6px;
    }

    .position-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .position-symbol {
        font-size: 12px;
        font-weight: 600;
        color: #ffffff;
    }

    .position-side {
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 3px;
        text-transform: uppercase;
    }

    .position-side.buy {
        background: rgba(76, 175, 80, 0.2);
        color: #4caf50;
    }

    .position-side.sell {
        background: rgba(244, 67, 54, 0.2);
        color: #f44336;
    }

    .position-details {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
    }

    .position-quantity {
        color: #ccc;
    }

    .position-price {
        color: #4ecdc4;
    }

    .position-pnl {
        font-weight: 600;
    }

    .position-pnl.positive {
        color: #4caf50;
    }

    .position-pnl.negative {
        color: #f44336;
    }

    .no-positions {
        text-align: center;
        color: #888;
        font-size: 12px;
        font-style: italic;
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = brokerStyles;
document.head.appendChild(styleSheet);

module.exports = { BrokerConnectionUI };




