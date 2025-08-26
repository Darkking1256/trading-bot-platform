// Broker Manager - Real Broker Connections for Live Trading
const axios = require('axios');
const WebSocket = require('ws');

class BrokerManager {
    constructor() {
        this.brokers = {
            'oanda': new OANDABroker(),
            'fxcm': new FXCMBroker(),
            'interactive-brokers': new InteractiveBrokersBroker(),
            'demo': new DemoBroker()
        };
        
        this.activeBroker = null;
        this.connections = {};
        this.marketDataStreams = {};
        this.orderCallbacks = {};
    }

    // Initialize broker connection
    async connectBroker(brokerName, credentials) {
        try {
            if (!this.brokers[brokerName]) {
                throw new Error(`Broker ${brokerName} not supported`);
            }

            const broker = this.brokers[brokerName];
            await broker.connect(credentials);
            
            this.activeBroker = broker;
            this.connections[brokerName] = broker;
            
            console.log(`✅ Connected to ${brokerName} successfully`);
            return { success: true, broker: brokerName };
            
        } catch (error) {
            console.error(`❌ Failed to connect to ${brokerName}:`, error.message);
            return { success: false, error: error.message };
        }
    }

    // Get account information
    async getAccountInfo() {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        return await this.activeBroker.getAccountInfo();
    }

    // Get current positions
    async getPositions() {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        return await this.activeBroker.getPositions();
    }

    // Place market order
    async placeMarketOrder(symbol, side, quantity, stopLoss = null, takeProfit = null) {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        
        const order = {
            symbol: symbol,
            side: side.toUpperCase(),
            quantity: quantity,
            type: 'MARKET',
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            timestamp: new Date()
        };

        try {
            const result = await this.activeBroker.placeOrder(order);
            
            // Register callback for order updates
            if (result.orderId) {
                this.orderCallbacks[result.orderId] = {
                    order: order,
                    timestamp: new Date()
                };
            }
            
            return result;
        } catch (error) {
            console.error('Order placement failed:', error);
            throw error;
        }
    }

    // Place limit order
    async placeLimitOrder(symbol, side, quantity, price, stopLoss = null, takeProfit = null) {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        
        const order = {
            symbol: symbol,
            side: side.toUpperCase(),
            quantity: quantity,
            type: 'LIMIT',
            price: price,
            stopLoss: stopLoss,
            takeProfit: takeProfit,
            timestamp: new Date()
        };

        return await this.activeBroker.placeOrder(order);
    }

    // Close position
    async closePosition(positionId, quantity = null) {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        return await this.activeBroker.closePosition(positionId, quantity);
    }

    // Modify order
    async modifyOrder(orderId, modifications) {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        return await this.activeBroker.modifyOrder(orderId, modifications);
    }

    // Cancel order
    async cancelOrder(orderId) {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        return await this.activeBroker.cancelOrder(orderId);
    }

    // Get market data
    async getMarketData(symbol, timeframe = '1m', count = 100) {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        return await this.activeBroker.getMarketData(symbol, timeframe, count);
    }

    // Subscribe to real-time market data
    async subscribeMarketData(symbols, callback) {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        return await this.activeBroker.subscribeMarketData(symbols, callback);
    }

    // Get order history
    async getOrderHistory(symbol = null, from = null, to = null) {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        return await this.activeBroker.getOrderHistory(symbol, from, to);
    }

    // Get trade history
    async getTradeHistory(symbol = null, from = null, to = null) {
        if (!this.activeBroker) {
            throw new Error('No active broker connection');
        }
        return await this.activeBroker.getTradeHistory(symbol, from, to);
    }

    // Disconnect broker
    async disconnectBroker() {
        if (this.activeBroker) {
            await this.activeBroker.disconnect();
            this.activeBroker = null;
            console.log('✅ Disconnected from broker');
        }
    }

    // Get supported brokers
    getSupportedBrokers() {
        return Object.keys(this.brokers);
    }

    // Get broker status
    getBrokerStatus() {
        if (!this.activeBroker) {
            return { connected: false, broker: null };
        }
        return {
            connected: this.activeBroker.isConnected(),
            broker: this.activeBroker.name,
            account: this.activeBroker.accountInfo
        };
    }
}

// OANDA Broker Implementation
class OANDABroker {
    constructor() {
        this.name = 'OANDA';
        this.baseUrl = 'https://api-fxtrade.oanda.com';
        this.streamUrl = 'https://stream-fxtrade.oanda.com';
        this.apiKey = null;
        this.accountId = null;
        this.isConnected = false;
        this.accountInfo = null;
        this.ws = null;
    }

    async connect(credentials) {
        this.apiKey = credentials.apiKey;
        this.accountId = credentials.accountId;
        
        // Test connection by getting account info
        await this.getAccountInfo();
        this.isConnected = true;
    }

    async getAccountInfo() {
        const response = await axios.get(`${this.baseUrl}/v3/accounts/${this.accountId}`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        this.accountInfo = response.data.account;
        return this.accountInfo;
    }

    async getPositions() {
        const response = await axios.get(`${this.baseUrl}/v3/accounts/${this.accountId}/positions`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        
        return response.data.positions.map(pos => ({
            id: pos.instrument,
            symbol: pos.instrument,
            side: pos.long.units > 0 ? 'BUY' : 'SELL',
            quantity: Math.abs(pos.long.units || pos.short.units),
            price: pos.long.units > 0 ? pos.long.averagePrice : pos.short.averagePrice,
            unrealizedPnL: pos.unrealizedPL,
            marginUsed: pos.marginUsed
        }));
    }

    async placeOrder(order) {
        const orderData = {
            order: {
                type: order.type,
                instrument: order.symbol,
                units: order.side === 'BUY' ? order.quantity : -order.quantity,
                timeInForce: 'FOK',
                positionFill: 'DEFAULT'
            }
        };

        if (order.type === 'LIMIT') {
            orderData.order.price = order.price;
        }

        if (order.stopLoss) {
            orderData.order.stopLossOnFill = {
                price: order.stopLoss
            };
        }

        if (order.takeProfit) {
            orderData.order.takeProfitOnFill = {
                price: order.takeProfit
            };
        }

        const response = await axios.post(`${this.baseUrl}/v3/accounts/${this.accountId}/orders`, orderData, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            orderId: response.data.orderFillTransaction.id,
            status: response.data.orderFillTransaction.type,
            price: response.data.orderFillTransaction.price,
            quantity: response.data.orderFillTransaction.units
        };
    }

    async closePosition(positionId, quantity = null) {
        const position = await this.getPositions();
        const pos = position.find(p => p.symbol === positionId);
        
        if (!pos) {
            throw new Error('Position not found');
        }

        const closeData = {
            order: {
                type: 'MARKET',
                instrument: positionId,
                units: pos.side === 'BUY' ? -pos.quantity : pos.quantity,
                timeInForce: 'FOK'
            }
        };

        const response = await axios.post(`${this.baseUrl}/v3/accounts/${this.accountId}/orders`, closeData, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return {
            orderId: response.data.orderFillTransaction.id,
            status: 'CLOSED',
            price: response.data.orderFillTransaction.price
        };
    }

    async getMarketData(symbol, timeframe = '1m', count = 100) {
        const granularity = this.convertTimeframe(timeframe);
        const response = await axios.get(`${this.baseUrl}/v3/instruments/${symbol}/candles`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            params: {
                granularity: granularity,
                count: count
            }
        });

        return response.data.candles.map(candle => ({
            timestamp: new Date(candle.time),
            open: parseFloat(candle.mid.o),
            high: parseFloat(candle.mid.h),
            low: parseFloat(candle.mid.l),
            close: parseFloat(candle.mid.c),
            volume: candle.volume || 0
        }));
    }

    async subscribeMarketData(symbols, callback) {
        const instruments = symbols.map(s => s.replace('/', '_'));
        
        this.ws = new WebSocket(`${this.streamUrl}/v3/accounts/${this.accountId}/pricing/stream`, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`
            }
        });

        this.ws.on('open', () => {
            console.log('OANDA WebSocket connected');
            this.ws.send(JSON.stringify({
                instruments: instruments
            }));
        });

        this.ws.on('message', (data) => {
            const message = JSON.parse(data);
            if (message.type === 'PRICE') {
                callback({
                    symbol: message.instrument,
                    bid: parseFloat(message.bids[0].price),
                    ask: parseFloat(message.asks[0].price),
                    timestamp: new Date(message.time)
                });
            }
        });

        this.ws.on('error', (error) => {
            console.error('OANDA WebSocket error:', error);
        });
    }

    convertTimeframe(timeframe) {
        const mapping = {
            '1m': 'M1',
            '5m': 'M5',
            '15m': 'M15',
            '30m': 'M30',
            '1h': 'H1',
            '4h': 'H4',
            '1d': 'D'
        };
        return mapping[timeframe] || 'M1';
    }

    async disconnect() {
        if (this.ws) {
            this.ws.close();
        }
        this.isConnected = false;
    }
}

// FXCM Broker Implementation
class FXCMBroker {
    constructor() {
        this.name = 'FXCM';
        this.baseUrl = 'https://api-demo.fxcm.com'; // Use demo for testing
        this.apiKey = null;
        this.token = null;
        this.isConnected = false;
        this.accountInfo = null;
    }

    async connect(credentials) {
        this.apiKey = credentials.apiKey;
        
        // Get access token
        const response = await axios.post(`${this.baseUrl}/candles/1/m1`, {}, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Accept': 'application/json'
            }
        });
        
        this.token = response.headers['authorization'];
        this.isConnected = true;
        
        // Get account info
        await this.getAccountInfo();
    }

    async getAccountInfo() {
        const response = await axios.get(`${this.baseUrl}/trading/get_model`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json'
            }
        });
        
        this.accountInfo = response.data;
        return this.accountInfo;
    }

    async getPositions() {
        const response = await axios.get(`${this.baseUrl}/trading/get_open_positions`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json'
            }
        });
        
        return response.data.positions.map(pos => ({
            id: pos.positionId,
            symbol: pos.currency,
            side: pos.isBuy ? 'BUY' : 'SELL',
            quantity: pos.amountK,
            price: pos.openPrice,
            unrealizedPnL: pos.profitLoss,
            marginUsed: pos.margin
        }));
    }

    async placeOrder(order) {
        const orderData = {
            symbol: order.symbol,
            isBuy: order.side === 'BUY',
            amount: order.quantity,
            rate: order.type === 'LIMIT' ? order.price : 0,
            atMarket: order.type === 'MARKET',
            stopLoss: order.stopLoss,
            takeProfit: order.takeProfit
        };

        const response = await axios.post(`${this.baseUrl}/trading/open_trade`, orderData, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json'
            }
        });

        return {
            orderId: response.data.orderId,
            status: response.data.status,
            price: response.data.rate,
            quantity: response.data.amount
        };
    }

    async getMarketData(symbol, timeframe = '1m', count = 100) {
        const response = await axios.get(`${this.baseUrl}/candles/1/${this.convertTimeframe(timeframe)}`, {
            headers: {
                'Authorization': `Bearer ${this.token}`,
                'Accept': 'application/json'
            },
            params: {
                num: count,
                symbol: symbol
            }
        });

        return response.data.candles.map(candle => ({
            timestamp: new Date(candle.timestamp),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume || 0
        }));
    }

    convertTimeframe(timeframe) {
        const mapping = {
            '1m': 'm1',
            '5m': 'm5',
            '15m': 'm15',
            '30m': 'm30',
            '1h': 'h1',
            '4h': 'h4',
            '1d': 'd1'
        };
        return mapping[timeframe] || 'm1';
    }

    async disconnect() {
        this.isConnected = false;
    }
}

// Interactive Brokers Broker Implementation
class InteractiveBrokersBroker {
    constructor() {
        this.name = 'Interactive Brokers';
        this.isConnected = false;
        this.accountInfo = null;
        // Note: IB requires TWS or IB Gateway to be running
    }

    async connect(credentials) {
        // IB connection requires TWS or IB Gateway
        // This is a simplified implementation
        this.isConnected = true;
        this.accountInfo = {
            accountId: credentials.accountId,
            type: 'IB'
        };
    }

    async getAccountInfo() {
        return this.accountInfo;
    }

    async getPositions() {
        // Simplified implementation
        return [];
    }

    async placeOrder(order) {
        // Simplified implementation
        return {
            orderId: Date.now().toString(),
            status: 'SUBMITTED',
            price: order.price || 0,
            quantity: order.quantity
        };
    }

    async disconnect() {
        this.isConnected = false;
    }
}

// Demo Broker for testing
class DemoBroker {
    constructor() {
        this.name = 'Demo';
        this.isConnected = true;
        this.accountInfo = {
            balance: 10000,
            equity: 10000,
            margin: 0,
            freeMargin: 10000
        };
        this.positions = [];
        this.orders = [];
    }

    async connect(credentials) {
        this.isConnected = true;
        return this.accountInfo;
    }

    async getAccountInfo() {
        return this.accountInfo;
    }

    async getPositions() {
        return this.positions;
    }

    async placeOrder(order) {
        const orderId = Date.now().toString();
        
        if (order.type === 'MARKET') {
            // Simulate market order execution
            const position = {
                id: orderId,
                symbol: order.symbol,
                side: order.side,
                quantity: order.quantity,
                price: this.getSimulatedPrice(order.symbol),
                timestamp: new Date()
            };
            
            this.positions.push(position);
        }

        this.orders.push({
            id: orderId,
            ...order,
            status: 'FILLED'
        });

        return {
            orderId: orderId,
            status: 'FILLED',
            price: this.getSimulatedPrice(order.symbol),
            quantity: order.quantity
        };
    }

    getSimulatedPrice(symbol) {
        // Simulate realistic prices
        const basePrices = {
            'EUR/USD': 1.0850,
            'GBP/USD': 1.2650,
            'USD/JPY': 148.50,
            'AUD/USD': 0.6580,
            'USDCAD': 1.3520
        };
        
        const basePrice = basePrices[symbol] || 1.0000;
        const variation = (Math.random() - 0.5) * 0.001;
        return basePrice + variation;
    }

    async getMarketData(symbol, timeframe = '1m', count = 100) {
        const data = [];
        const basePrice = this.getSimulatedPrice(symbol);
        
        for (let i = 0; i < count; i++) {
            const change = (Math.random() - 0.5) * 0.002;
            const price = basePrice * (1 + change * i);
            
            data.push({
                timestamp: new Date(Date.now() - (count - i) * 60000),
                open: price * (1 + (Math.random() - 0.5) * 0.0005),
                high: price * (1 + Math.random() * 0.001),
                low: price * (1 - Math.random() * 0.001),
                close: price,
                volume: Math.floor(Math.random() * 1000) + 100
            });
        }
        
        return data;
    }

    async disconnect() {
        this.isConnected = false;
    }
}

module.exports = { BrokerManager, OANDABroker, FXCMBroker, InteractiveBrokersBroker, DemoBroker };



