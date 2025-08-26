// Advanced Order Types UI Component
class AdvancedOrderTypesUI {
    constructor(advancedOrderTypes) {
        this.advancedOrderTypes = advancedOrderTypes;
        this.currentOrderType = 'MARKET';
        this.orderFormData = {};
        this.init();
    }

    init() {
        this.createAdvancedOrderPanel();
        this.setupEventListeners();
        this.updateOrderDisplay();
    }

    createAdvancedOrderPanel() {
        // Create main container
        const container = document.createElement('div');
        container.id = 'advanced-orders-panel';
        container.className = 'advanced-orders-panel';
        container.innerHTML = `
            <div class="advanced-orders-header">
                <h3>Advanced Order Types</h3>
                <div class="order-type-selector">
                    <select id="order-type-select">
                        <option value="MARKET">Market Order</option>
                        <option value="LIMIT">Limit Order</option>
                        <option value="STOP">Stop Order</option>
                        <option value="ICEBERG">Iceberg Order</option>
                        <option value="TWAP">TWAP Order</option>
                        <option value="VWAP">VWAP Order</option>
                        <option value="BRACKET">Bracket Order</option>
                        <option value="TRAILING_STOP">Trailing Stop</option>
                        <option value="OCO">OCO Order</option>
                        <option value="CONDITIONAL">Conditional Order</option>
                    </select>
                </div>
            </div>

            <div class="order-form-container">
                <div id="market-order-form" class="order-form active">
                    <h4>Market Order</h4>
                    <div class="form-row">
                        <label>Symbol:</label>
                        <input type="text" id="market-symbol" placeholder="EURUSD" value="EURUSD">
                    </div>
                    <div class="form-row">
                        <label>Side:</label>
                        <select id="market-side">
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Quantity:</label>
                        <input type="number" id="market-quantity" placeholder="0.1" step="0.01" min="0.01">
                    </div>
                </div>

                <div id="limit-order-form" class="order-form">
                    <h4>Limit Order</h4>
                    <div class="form-row">
                        <label>Symbol:</label>
                        <input type="text" id="limit-symbol" placeholder="EURUSD" value="EURUSD">
                    </div>
                    <div class="form-row">
                        <label>Side:</label>
                        <select id="limit-side">
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Quantity:</label>
                        <input type="number" id="limit-quantity" placeholder="0.1" step="0.01" min="0.01">
                    </div>
                    <div class="form-row">
                        <label>Price:</label>
                        <input type="number" id="limit-price" placeholder="1.2000" step="0.0001">
                    </div>
                </div>

                <div id="iceberg-order-form" class="order-form">
                    <h4>Iceberg Order</h4>
                    <p class="form-description">Large order split into smaller visible portions</p>
                    <div class="form-row">
                        <label>Symbol:</label>
                        <input type="text" id="iceberg-symbol" placeholder="EURUSD" value="EURUSD">
                    </div>
                    <div class="form-row">
                        <label>Side:</label>
                        <select id="iceberg-side">
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Total Quantity:</label>
                        <input type="number" id="iceberg-total-quantity" placeholder="1.0" step="0.01" min="0.01">
                    </div>
                    <div class="form-row">
                        <label>Visible Quantity:</label>
                        <input type="number" id="iceberg-visible-quantity" placeholder="0.1" step="0.01" min="0.01">
                    </div>
                    <div class="form-row">
                        <label>Price:</label>
                        <input type="number" id="iceberg-price" placeholder="1.2000" step="0.0001">
                    </div>
                    <div class="form-row">
                        <label>Max Slices:</label>
                        <input type="number" id="iceberg-max-slices" placeholder="10" min="1" max="50" value="10">
                    </div>
                    <div class="form-row">
                        <label>Slice Interval (ms):</label>
                        <input type="number" id="iceberg-slice-interval" placeholder="30000" min="1000" value="30000">
                    </div>
                </div>

                <div id="twap-order-form" class="order-form">
                    <h4>TWAP Order</h4>
                    <p class="form-description">Time Weighted Average Price execution</p>
                    <div class="form-row">
                        <label>Symbol:</label>
                        <input type="text" id="twap-symbol" placeholder="EURUSD" value="EURUSD">
                    </div>
                    <div class="form-row">
                        <label>Side:</label>
                        <select id="twap-side">
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Quantity:</label>
                        <input type="number" id="twap-quantity" placeholder="1.0" step="0.01" min="0.01">
                    </div>
                    <div class="form-row">
                        <label>Start Time:</label>
                        <input type="datetime-local" id="twap-start-time">
                    </div>
                    <div class="form-row">
                        <label>End Time:</label>
                        <input type="datetime-local" id="twap-end-time">
                    </div>
                </div>

                <div id="bracket-order-form" class="order-form">
                    <h4>Bracket Order</h4>
                    <p class="form-description">Entry with automatic take profit and stop loss</p>
                    <div class="form-row">
                        <label>Symbol:</label>
                        <input type="text" id="bracket-symbol" placeholder="EURUSD" value="EURUSD">
                    </div>
                    <div class="form-row">
                        <label>Side:</label>
                        <select id="bracket-side">
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Quantity:</label>
                        <input type="number" id="bracket-quantity" placeholder="0.1" step="0.01" min="0.01">
                    </div>
                    <div class="form-row">
                        <label>Entry Price:</label>
                        <input type="number" id="bracket-entry-price" placeholder="1.2000" step="0.0001">
                    </div>
                    <div class="form-row">
                        <label>Take Profit:</label>
                        <input type="number" id="bracket-take-profit" placeholder="1.2100" step="0.0001">
                    </div>
                    <div class="form-row">
                        <label>Stop Loss:</label>
                        <input type="number" id="bracket-stop-loss" placeholder="1.1900" step="0.0001">
                    </div>
                </div>

                <div id="trailing-stop-form" class="order-form">
                    <h4>Trailing Stop</h4>
                    <p class="form-description">Dynamic stop loss that follows price movement</p>
                    <div class="form-row">
                        <label>Symbol:</label>
                        <input type="text" id="trailing-symbol" placeholder="EURUSD" value="EURUSD">
                    </div>
                    <div class="form-row">
                        <label>Side:</label>
                        <select id="trailing-side">
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Quantity:</label>
                        <input type="number" id="trailing-quantity" placeholder="0.1" step="0.01" min="0.01">
                    </div>
                    <div class="form-row">
                        <label>Trailing Distance:</label>
                        <input type="number" id="trailing-distance" placeholder="0.0050" step="0.0001" min="0.0001">
                    </div>
                    <div class="form-row">
                        <label>Activation Price:</label>
                        <input type="number" id="trailing-activation-price" placeholder="1.2000" step="0.0001">
                    </div>
                </div>

                <div id="oco-order-form" class="order-form">
                    <h4>OCO Order</h4>
                    <p class="form-description">One-Cancels-Other: Limit and Stop orders</p>
                    <div class="form-row">
                        <label>Symbol:</label>
                        <input type="text" id="oco-symbol" placeholder="EURUSD" value="EURUSD">
                    </div>
                    <div class="form-row">
                        <label>Side:</label>
                        <select id="oco-side">
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Quantity:</label>
                        <input type="number" id="oco-quantity" placeholder="0.1" step="0.01" min="0.01">
                    </div>
                    <div class="form-row">
                        <label>Limit Price:</label>
                        <input type="number" id="oco-limit-price" placeholder="1.2100" step="0.0001">
                    </div>
                    <div class="form-row">
                        <label>Stop Price:</label>
                        <input type="number" id="oco-stop-price" placeholder="1.1900" step="0.0001">
                    </div>
                </div>

                <div id="conditional-order-form" class="order-form">
                    <h4>Conditional Order</h4>
                    <p class="form-description">Execute when specific conditions are met</p>
                    <div class="form-row">
                        <label>Symbol:</label>
                        <input type="text" id="conditional-symbol" placeholder="EURUSD" value="EURUSD">
                    </div>
                    <div class="form-row">
                        <label>Side:</label>
                        <select id="conditional-side">
                            <option value="BUY">Buy</option>
                            <option value="SELL">Sell</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Quantity:</label>
                        <input type="number" id="conditional-quantity" placeholder="0.1" step="0.01" min="0.01">
                    </div>
                    <div class="form-row">
                        <label>Condition Type:</label>
                        <select id="conditional-type">
                            <option value="PRICE_ABOVE">Price Above</option>
                            <option value="PRICE_BELOW">Price Below</option>
                            <option value="PRICE_CROSSES_ABOVE">Price Crosses Above</option>
                            <option value="PRICE_CROSSES_BELOW">Price Crosses Below</option>
                        </select>
                    </div>
                    <div class="form-row">
                        <label>Condition Value:</label>
                        <input type="number" id="conditional-value" placeholder="1.2000" step="0.0001">
                    </div>
                    <div class="form-row">
                        <label>Order Type:</label>
                        <select id="conditional-order-type">
                            <option value="MARKET">Market</option>
                            <option value="LIMIT">Limit</option>
                        </select>
                    </div>
                    <div class="form-row" id="conditional-price-row" style="display: none;">
                        <label>Price:</label>
                        <input type="number" id="conditional-price" placeholder="1.2000" step="0.0001">
                    </div>
                </div>
            </div>

            <div class="order-actions">
                <button id="place-order-btn" class="btn btn-primary">Place Order</button>
                <button id="preview-order-btn" class="btn btn-secondary">Preview</button>
                <button id="clear-form-btn" class="btn btn-outline">Clear</button>
            </div>

            <div class="order-preview" id="order-preview" style="display: none;">
                <h4>Order Preview</h4>
                <div id="preview-content"></div>
            </div>
        `;

        // Insert into the main trading area
        const tradingArea = document.querySelector('.main-trading-area');
        if (tradingArea) {
            tradingArea.appendChild(container);
        }

        // Add styles
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .advanced-orders-panel {
                background: #1e1e1e;
                border: 1px solid #333;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                color: #fff;
            }

            .advanced-orders-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 1px solid #333;
            }

            .advanced-orders-header h3 {
                margin: 0;
                color: #00d4aa;
                font-size: 18px;
            }

            .order-type-selector select {
                background: #2a2a2a;
                color: #fff;
                border: 1px solid #444;
                border-radius: 4px;
                padding: 8px 12px;
                font-size: 14px;
                min-width: 150px;
            }

            .order-form-container {
                margin-bottom: 20px;
            }

            .order-form {
                display: none;
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 6px;
                padding: 20px;
                margin-bottom: 15px;
            }

            .order-form.active {
                display: block;
            }

            .order-form h4 {
                margin: 0 0 15px 0;
                color: #00d4aa;
                font-size: 16px;
            }

            .form-description {
                color: #888;
                font-size: 12px;
                margin-bottom: 15px;
                font-style: italic;
            }

            .form-row {
                display: flex;
                align-items: center;
                margin-bottom: 12px;
                gap: 10px;
            }

            .form-row label {
                min-width: 120px;
                font-size: 14px;
                color: #ccc;
            }

            .form-row input,
            .form-row select {
                flex: 1;
                background: #1a1a1a;
                border: 1px solid #444;
                border-radius: 4px;
                padding: 8px 12px;
                color: #fff;
                font-size: 14px;
            }

            .form-row input:focus,
            .form-row select:focus {
                outline: none;
                border-color: #00d4aa;
            }

            .order-actions {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }

            .btn {
                padding: 10px 20px;
                border: none;
                border-radius: 4px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }

            .btn-primary {
                background: #00d4aa;
                color: #000;
            }

            .btn-primary:hover {
                background: #00b894;
            }

            .btn-secondary {
                background: #3498db;
                color: #fff;
            }

            .btn-secondary:hover {
                background: #2980b9;
            }

            .btn-outline {
                background: transparent;
                color: #ccc;
                border: 1px solid #444;
            }

            .btn-outline:hover {
                background: #333;
                color: #fff;
            }

            .order-preview {
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 6px;
                padding: 15px;
                margin-top: 15px;
            }

            .order-preview h4 {
                margin: 0 0 10px 0;
                color: #00d4aa;
            }

            .preview-item {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px solid #333;
            }

            .preview-item:last-child {
                border-bottom: none;
            }

            .preview-label {
                color: #888;
                font-size: 12px;
            }

            .preview-value {
                color: #fff;
                font-size: 12px;
                font-weight: 500;
            }

            .active-orders-section {
                margin-top: 30px;
            }

            .active-orders-section h4 {
                color: #00d4aa;
                margin-bottom: 15px;
            }

            .order-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .order-item {
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 4px;
                padding: 12px;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .order-info {
                flex: 1;
            }

            .order-symbol {
                font-weight: bold;
                color: #00d4aa;
            }

            .order-details {
                font-size: 12px;
                color: #888;
                margin-top: 4px;
            }

            .order-status {
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 11px;
                font-weight: bold;
            }

            .status-active {
                background: #27ae60;
                color: #fff;
            }

            .status-pending {
                background: #f39c12;
                color: #fff;
            }

            .status-completed {
                background: #3498db;
                color: #fff;
            }

            .status-cancelled {
                background: #e74c3c;
                color: #fff;
            }

            .order-actions-small {
                display: flex;
                gap: 5px;
            }

            .btn-small {
                padding: 4px 8px;
                font-size: 11px;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            }

            .btn-cancel {
                background: #e74c3c;
                color: #fff;
            }

            .btn-modify {
                background: #f39c12;
                color: #fff;
            }
        `;
        document.head.appendChild(style);
    }

    setupEventListeners() {
        // Order type selector
        const orderTypeSelect = document.getElementById('order-type-select');
        if (orderTypeSelect) {
            orderTypeSelect.addEventListener('change', (e) => {
                this.switchOrderForm(e.target.value);
            });
        }

        // Place order button
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            placeOrderBtn.addEventListener('click', () => {
                this.placeOrder();
            });
        }

        // Preview order button
        const previewOrderBtn = document.getElementById('preview-order-btn');
        if (previewOrderBtn) {
            previewOrderBtn.addEventListener('click', () => {
                this.previewOrder();
            });
        }

        // Clear form button
        const clearFormBtn = document.getElementById('clear-form-btn');
        if (clearFormBtn) {
            clearFormBtn.addEventListener('click', () => {
                this.clearForm();
            });
        }

        // Conditional order type change
        const conditionalOrderType = document.getElementById('conditional-order-type');
        if (conditionalOrderType) {
            conditionalOrderType.addEventListener('change', (e) => {
                const priceRow = document.getElementById('conditional-price-row');
                if (e.target.value === 'LIMIT') {
                    priceRow.style.display = 'flex';
                } else {
                    priceRow.style.display = 'none';
                }
            });
        }

        // Set default times for TWAP
        this.setDefaultTWAPTimes();
    }

    switchOrderForm(orderType) {
        this.currentOrderType = orderType;
        
        // Hide all forms
        const forms = document.querySelectorAll('.order-form');
        forms.forEach(form => form.classList.remove('active'));
        
        // Show selected form
        const targetForm = document.getElementById(`${orderType.toLowerCase()}-order-form`);
        if (targetForm) {
            targetForm.classList.add('active');
        }
    }

    setDefaultTWAPTimes() {
        const startTime = document.getElementById('twap-start-time');
        const endTime = document.getElementById('twap-end-time');
        
        if (startTime && endTime) {
            const now = new Date();
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
            
            startTime.value = now.toISOString().slice(0, 16);
            endTime.value = oneHourLater.toISOString().slice(0, 16);
        }
    }

    async placeOrder() {
        try {
            const orderData = this.getOrderData();
            if (!orderData) {
                this.showNotification('Please fill in all required fields', 'error');
                return;
            }

            let result;
            switch (this.currentOrderType) {
                case 'ICEBERG':
                    result = await this.advancedOrderTypes.createIcebergOrder(orderData);
                    break;
                case 'TWAP':
                    result = await this.advancedOrderTypes.createTWAPOrder(orderData);
                    break;
                case 'VWAP':
                    result = await this.advancedOrderTypes.createVWAPOrder(orderData);
                    break;
                case 'BRACKET':
                    result = await this.advancedOrderTypes.createBracketOrder(orderData);
                    break;
                case 'TRAILING_STOP':
                    result = await this.advancedOrderTypes.createTrailingStopOrder(orderData);
                    break;
                case 'OCO':
                    result = await this.advancedOrderTypes.createOCOOrder(orderData);
                    break;
                case 'CONDITIONAL':
                    result = await this.advancedOrderTypes.createConditionalOrder(orderData);
                    break;
                default:
                    this.showNotification('Order type not implemented yet', 'warning');
                    return;
            }

            this.showNotification(`Order placed successfully: ${result.message}`, 'success');
            this.clearForm();
            this.updateOrderDisplay();
            
        } catch (error) {
            this.showNotification(`Error placing order: ${error.message}`, 'error');
        }
    }

    getOrderData() {
        const orderType = this.currentOrderType.toLowerCase();
        
        switch (this.currentOrderType) {
            case 'ICEBERG':
                return {
                    symbol: document.getElementById('iceberg-symbol').value,
                    side: document.getElementById('iceberg-side').value,
                    totalQuantity: parseFloat(document.getElementById('iceberg-total-quantity').value),
                    visibleQuantity: parseFloat(document.getElementById('iceberg-visible-quantity').value),
                    price: parseFloat(document.getElementById('iceberg-price').value),
                    maxSlices: parseInt(document.getElementById('iceberg-max-slices').value),
                    sliceInterval: parseInt(document.getElementById('iceberg-slice-interval').value)
                };
            
            case 'TWAP':
                return {
                    symbol: document.getElementById('twap-symbol').value,
                    side: document.getElementById('twap-side').value,
                    quantity: parseFloat(document.getElementById('twap-quantity').value),
                    startTime: new Date(document.getElementById('twap-start-time').value).getTime(),
                    endTime: new Date(document.getElementById('twap-end-time').value).getTime()
                };
            
            case 'BRACKET':
                return {
                    symbol: document.getElementById('bracket-symbol').value,
                    side: document.getElementById('bracket-side').value,
                    quantity: parseFloat(document.getElementById('bracket-quantity').value),
                    entryPrice: parseFloat(document.getElementById('bracket-entry-price').value),
                    takeProfitPrice: parseFloat(document.getElementById('bracket-take-profit').value),
                    stopLossPrice: parseFloat(document.getElementById('bracket-stop-loss').value)
                };
            
            case 'TRAILING_STOP':
                return {
                    symbol: document.getElementById('trailing-symbol').value,
                    side: document.getElementById('trailing-side').value,
                    quantity: parseFloat(document.getElementById('trailing-quantity').value),
                    trailingDistance: parseFloat(document.getElementById('trailing-distance').value),
                    activationPrice: parseFloat(document.getElementById('trailing-activation-price').value)
                };
            
            case 'OCO':
                return {
                    symbol: document.getElementById('oco-symbol').value,
                    side: document.getElementById('oco-side').value,
                    quantity: parseFloat(document.getElementById('oco-quantity').value),
                    limitPrice: parseFloat(document.getElementById('oco-limit-price').value),
                    stopPrice: parseFloat(document.getElementById('oco-stop-price').value)
                };
            
            case 'CONDITIONAL':
                return {
                    symbol: document.getElementById('conditional-symbol').value,
                    side: document.getElementById('conditional-side').value,
                    quantity: parseFloat(document.getElementById('conditional-quantity').value),
                    condition: {
                        type: document.getElementById('conditional-type').value,
                        value: parseFloat(document.getElementById('conditional-value').value)
                    },
                    orderType: document.getElementById('conditional-order-type').value,
                    price: document.getElementById('conditional-order-type').value === 'LIMIT' ? 
                           parseFloat(document.getElementById('conditional-price').value) : undefined
                };
            
            default:
                return null;
        }
    }

    previewOrder() {
        const orderData = this.getOrderData();
        if (!orderData) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        const preview = document.getElementById('order-preview');
        const content = document.getElementById('preview-content');
        
        let previewHTML = '';
        for (const [key, value] of Object.entries(orderData)) {
            if (typeof value === 'object') {
                previewHTML += `<div class="preview-item"><span class="preview-label">${key}:</span><span class="preview-value">${JSON.stringify(value)}</span></div>`;
            } else {
                previewHTML += `<div class="preview-item"><span class="preview-label">${key}:</span><span class="preview-value">${value}</span></div>`;
            }
        }

        content.innerHTML = previewHTML;
        preview.style.display = 'block';
    }

    clearForm() {
        const form = document.querySelector('.order-form.active');
        if (form) {
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => input.value = '');
            
            const selects = form.querySelectorAll('select');
            selects.forEach(select => select.selectedIndex = 0);
        }

        document.getElementById('order-preview').style.display = 'none';
    }

    updateOrderDisplay() {
        const activeOrders = this.advancedOrderTypes.getActiveOrders();
        const statistics = this.advancedOrderTypes.getOrderStatistics();

        // Update statistics if they exist
        const statsElement = document.querySelector('.order-statistics');
        if (statsElement) {
            statsElement.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">Active:</span>
                    <span class="stat-value">${statistics.active}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Completed:</span>
                    <span class="stat-value">${statistics.completed}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Cancelled:</span>
                    <span class="stat-value">${statistics.cancelled}</span>
                </div>
            `;
        }

        // Update active orders list
        this.updateActiveOrdersList(activeOrders);
    }

    updateActiveOrdersList(orders) {
        let ordersSection = document.querySelector('.active-orders-section');
        if (!ordersSection) {
            ordersSection = document.createElement('div');
            ordersSection.className = 'active-orders-section';
            ordersSection.innerHTML = `
                <h4>Active Orders</h4>
                <div class="order-list" id="active-orders-list"></div>
            `;
            document.getElementById('advanced-orders-panel').appendChild(ordersSection);
        }

        const ordersList = document.getElementById('active-orders-list');
        if (orders.length === 0) {
            ordersList.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">No active orders</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-item">
                <div class="order-info">
                    <div class="order-symbol">${order.symbol} ${order.side}</div>
                    <div class="order-details">
                        ${order.type} • ${order.quantity} • ${order.status}
                        ${order.remainingQuantity ? `• Remaining: ${order.remainingQuantity}` : ''}
                    </div>
                </div>
                <div class="order-actions-small">
                    <button class="btn-small btn-cancel" onclick="cancelOrder('${order.id}')">Cancel</button>
                    <button class="btn-small btn-modify" onclick="modifyOrder('${order.id}')">Modify</button>
                </div>
            </div>
        `).join('');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: #fff;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = '#27ae60';
                break;
            case 'error':
                notification.style.background = '#e74c3c';
                break;
            case 'warning':
                notification.style.background = '#f39c12';
                break;
            default:
                notification.style.background = '#3498db';
        }

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Global functions for order actions
window.cancelOrder = async function(orderId) {
    try {
        await window.advancedOrderTypesUI.advancedOrderTypes.cancelOrder(orderId);
        window.advancedOrderTypesUI.showNotification('Order cancelled successfully', 'success');
        window.advancedOrderTypesUI.updateOrderDisplay();
    } catch (error) {
        window.advancedOrderTypesUI.showNotification(`Error cancelling order: ${error.message}`, 'error');
    }
};

window.modifyOrder = function(orderId) {
    window.advancedOrderTypesUI.showNotification('Modify order functionality coming soon', 'info');
};

module.exports = { AdvancedOrderTypesUI };



