// Advanced Order Types System
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class AdvancedOrderTypes {
    constructor() {
        this.orders = new Map();
        this.orderHistory = [];
        this.activeOrders = new Map();
        this.orderTypes = {
            MARKET: 'MARKET',
            LIMIT: 'LIMIT',
            STOP: 'STOP',
            STOP_LIMIT: 'STOP_LIMIT',
            ICEBERG: 'ICEBERG',
            TWAP: 'TWAP',
            VWAP: 'VWAP',
            BRACKET: 'BRACKET',
            TRAILING_STOP: 'TRAILING_STOP',
            OCO: 'OCO',
            CONDITIONAL: 'CONDITIONAL'
        };
        this.init();
    }

    async init() {
        await this.loadOrderData();
        this.startOrderMonitoring();
    }

    // Iceberg Orders - Large order splitting
    async createIcebergOrder(orderData) {
        const {
            symbol,
            side,
            totalQuantity,
            visibleQuantity,
            price,
            timeInForce = 'DAY',
            maxSlices = 10,
            sliceInterval = 30000 // 30 seconds
        } = orderData;

        const orderId = this.generateOrderId();
        const totalSlices = Math.ceil(totalQuantity / visibleQuantity);
        const actualSlices = Math.min(totalSlices, maxSlices);

        const icebergOrder = {
            id: orderId,
            type: this.orderTypes.ICEBERG,
            symbol,
            side,
            totalQuantity,
            visibleQuantity,
            remainingQuantity: totalQuantity,
            price,
            timeInForce,
            status: 'ACTIVE',
            createdAt: new Date(),
            slices: [],
            currentSlice: 0,
            maxSlices: actualSlices,
            sliceInterval,
            lastSliceTime: Date.now()
        };

        // Create first slice
        const firstSliceQuantity = Math.min(visibleQuantity, totalQuantity);
        const firstSlice = await this.createOrderSlice(icebergOrder, firstSliceQuantity);
        icebergOrder.slices.push(firstSlice);

        this.orders.set(orderId, icebergOrder);
        this.activeOrders.set(orderId, icebergOrder);
        await this.saveOrderData();

        return {
            orderId,
            status: 'CREATED',
            message: `Iceberg order created with ${actualSlices} slices`,
            firstSlice: firstSlice
        };
    }

    // TWAP Orders - Time Weighted Average Price
    async createTWAPOrder(orderData) {
        const {
            symbol,
            side,
            quantity,
            startTime,
            endTime,
            timeInForce = 'DAY',
            minSliceSize = 0.01
        } = orderData;

        const orderId = this.generateOrderId();
        const duration = endTime - startTime;
        const sliceCount = Math.max(1, Math.floor(duration / 60000)); // 1 minute intervals
        const sliceQuantity = quantity / sliceCount;

        const twapOrder = {
            id: orderId,
            type: this.orderTypes.TWAP,
            symbol,
            side,
            quantity,
            remainingQuantity: quantity,
            startTime,
            endTime,
            timeInForce,
            status: 'ACTIVE',
            createdAt: new Date(),
            slices: [],
            currentSlice: 0,
            sliceCount,
            sliceQuantity,
            minSliceSize,
            lastSliceTime: startTime
        };

        this.orders.set(orderId, twapOrder);
        this.activeOrders.set(orderId, twapOrder);
        await this.saveOrderData();

        return {
            orderId,
            status: 'CREATED',
            message: `TWAP order created with ${sliceCount} slices over ${duration / 60000} minutes`
        };
    }

    // VWAP Orders - Volume Weighted Average Price
    async createVWAPOrder(orderData) {
        const {
            symbol,
            side,
            quantity,
            targetVWAP,
            timeInForce = 'DAY',
            volumeThreshold = 0.1 // 10% of average volume
        } = orderData;

        const orderId = this.generateOrderId();

        const vwapOrder = {
            id: orderId,
            type: this.orderTypes.VWAP,
            symbol,
            side,
            quantity,
            remainingQuantity: quantity,
            targetVWAP,
            timeInForce,
            status: 'ACTIVE',
            createdAt: new Date(),
            slices: [],
            volumeThreshold,
            totalVolume: 0,
            weightedPrice: 0
        };

        this.orders.set(orderId, vwapOrder);
        this.activeOrders.set(orderId, vwapOrder);
        await this.saveOrderData();

        return {
            orderId,
            status: 'CREATED',
            message: 'VWAP order created'
        };
    }

    // Bracket Orders - Multi-level profit/loss management
    async createBracketOrder(orderData) {
        const {
            symbol,
            side,
            quantity,
            entryPrice,
            takeProfitPrice,
            stopLossPrice,
            timeInForce = 'DAY'
        } = orderData;

        const orderId = this.generateOrderId();
        const takeProfitId = this.generateOrderId();
        const stopLossId = this.generateOrderId();

        const bracketOrder = {
            id: orderId,
            type: this.orderTypes.BRACKET,
            symbol,
            side,
            quantity,
            entryPrice,
            status: 'ACTIVE',
            createdAt: new Date(),
            takeProfit: {
                id: takeProfitId,
                type: 'LIMIT',
                side: side === 'BUY' ? 'SELL' : 'BUY',
                quantity,
                price: takeProfitPrice,
                status: 'PENDING'
            },
            stopLoss: {
                id: stopLossId,
                type: 'STOP',
                side: side === 'BUY' ? 'SELL' : 'BUY',
                quantity,
                price: stopLossPrice,
                status: 'PENDING'
            }
        };

        this.orders.set(orderId, bracketOrder);
        this.activeOrders.set(orderId, bracketOrder);
        await this.saveOrderData();

        return {
            orderId,
            status: 'CREATED',
            message: 'Bracket order created with take profit and stop loss',
            takeProfitId,
            stopLossId
        };
    }

    // Trailing Stops - Dynamic stop-loss adjustment
    async createTrailingStopOrder(orderData) {
        const {
            symbol,
            side,
            quantity,
            trailingDistance,
            activationPrice,
            timeInForce = 'DAY'
        } = orderData;

        const orderId = this.generateOrderId();

        const trailingStopOrder = {
            id: orderId,
            type: this.orderTypes.TRAILING_STOP,
            symbol,
            side,
            quantity,
            trailingDistance,
            activationPrice,
            currentStopPrice: activationPrice,
            timeInForce,
            status: 'ACTIVE',
            createdAt: new Date(),
            lastUpdateTime: Date.now(),
            priceHistory: []
        };

        this.orders.set(orderId, trailingStopOrder);
        this.activeOrders.set(orderId, trailingStopOrder);
        await this.saveOrderData();

        return {
            orderId,
            status: 'CREATED',
            message: `Trailing stop order created with ${trailingDistance} distance`
        };
    }

    // OCO Orders - One-Cancels-Other
    async createOCOOrder(orderData) {
        const {
            symbol,
            side,
            quantity,
            limitPrice,
            stopPrice,
            timeInForce = 'DAY'
        } = orderData;

        const orderId = this.generateOrderId();
        const limitOrderId = this.generateOrderId();
        const stopOrderId = this.generateOrderId();

        const ocoOrder = {
            id: orderId,
            type: this.orderTypes.OCO,
            symbol,
            side,
            quantity,
            status: 'ACTIVE',
            createdAt: new Date(),
            limitOrder: {
                id: limitOrderId,
                type: 'LIMIT',
                side,
                quantity,
                price: limitPrice,
                status: 'PENDING'
            },
            stopOrder: {
                id: stopOrderId,
                type: 'STOP',
                side,
                quantity,
                price: stopPrice,
                status: 'PENDING'
            }
        };

        this.orders.set(orderId, ocoOrder);
        this.activeOrders.set(orderId, ocoOrder);
        await this.saveOrderData();

        return {
            orderId,
            status: 'CREATED',
            message: 'OCO order created',
            limitOrderId,
            stopOrderId
        };
    }

    // Conditional Orders - Event-driven execution
    async createConditionalOrder(orderData) {
        const {
            symbol,
            side,
            quantity,
            condition,
            orderType = 'MARKET',
            price,
            timeInForce = 'DAY'
        } = orderData;

        const orderId = this.generateOrderId();

        const conditionalOrder = {
            id: orderId,
            type: this.orderTypes.CONDITIONAL,
            symbol,
            side,
            quantity,
            condition,
            orderType,
            price,
            timeInForce,
            status: 'PENDING',
            createdAt: new Date(),
            triggered: false,
            triggerTime: null
        };

        this.orders.set(orderId, conditionalOrder);
        this.activeOrders.set(orderId, conditionalOrder);
        await this.saveOrderData();

        return {
            orderId,
            status: 'CREATED',
            message: 'Conditional order created'
        };
    }

    // Order execution and monitoring
    async executeOrderSlice(orderId, currentPrice) {
        const order = this.activeOrders.get(orderId);
        if (!order) return null;

        switch (order.type) {
            case this.orderTypes.ICEBERG:
                return await this.executeIcebergSlice(order, currentPrice);
            case this.orderTypes.TWAP:
                return await this.executeTWAPSlice(order, currentPrice);
            case this.orderTypes.VWAP:
                return await this.executeVWAPSlice(order, currentPrice);
            case this.orderTypes.TRAILING_STOP:
                return await this.updateTrailingStop(order, currentPrice);
            case this.orderTypes.CONDITIONAL:
                return await this.checkConditionalOrder(order, currentPrice);
            default:
                return null;
        }
    }

    async executeIcebergSlice(order, currentPrice) {
        const now = Date.now();
        if (now - order.lastSliceTime < order.sliceInterval) {
            return null; // Not time for next slice
        }

        if (order.currentSlice >= order.maxSlices || order.remainingQuantity <= 0) {
            order.status = 'COMPLETED';
            this.activeOrders.delete(order.id);
            return { status: 'COMPLETED', message: 'Iceberg order completed' };
        }

        const sliceQuantity = Math.min(order.visibleQuantity, order.remainingQuantity);
        const slice = await this.createOrderSlice(order, sliceQuantity);
        
        order.slices.push(slice);
        order.remainingQuantity -= sliceQuantity;
        order.currentSlice++;
        order.lastSliceTime = now;

        await this.saveOrderData();
        return slice;
    }

    async executeTWAPSlice(order, currentPrice) {
        const now = Date.now();
        if (now < order.startTime || now > order.endTime) {
            return null; // Outside time window
        }

        if (order.currentSlice >= order.sliceCount || order.remainingQuantity <= 0) {
            order.status = 'COMPLETED';
            this.activeOrders.delete(order.id);
            return { status: 'COMPLETED', message: 'TWAP order completed' };
        }

        const sliceQuantity = Math.min(order.sliceQuantity, order.remainingQuantity);
        const slice = await this.createOrderSlice(order, sliceQuantity);
        
        order.slices.push(slice);
        order.remainingQuantity -= sliceQuantity;
        order.currentSlice++;

        await this.saveOrderData();
        return slice;
    }

    async executeVWAPSlice(order, currentPrice) {
        // VWAP logic would check current volume and adjust accordingly
        const slice = await this.createOrderSlice(order, order.quantity * 0.1); // 10% of remaining
        order.slices.push(slice);
        order.remainingQuantity -= slice.quantity;
        
        if (order.remainingQuantity <= 0) {
            order.status = 'COMPLETED';
            this.activeOrders.delete(order.id);
        }

        await this.saveOrderData();
        return slice;
    }

    async updateTrailingStop(order, currentPrice) {
        const now = Date.now();
        order.priceHistory.push({ price: currentPrice, time: now });

        // Keep only last 100 price points
        if (order.priceHistory.length > 100) {
            order.priceHistory.shift();
        }

        let newStopPrice = order.currentStopPrice;

        if (order.side === 'BUY') {
            // For long positions, trail upward
            if (currentPrice > order.activationPrice) {
                const potentialStop = currentPrice - order.trailingDistance;
                if (potentialStop > order.currentStopPrice) {
                    newStopPrice = potentialStop;
                }
            }
        } else {
            // For short positions, trail downward
            if (currentPrice < order.activationPrice) {
                const potentialStop = currentPrice + order.trailingDistance;
                if (potentialStop < order.currentStopPrice) {
                    newStopPrice = potentialStop;
                }
            }
        }

        if (newStopPrice !== order.currentStopPrice) {
            order.currentStopPrice = newStopPrice;
            order.lastUpdateTime = now;
            await this.saveOrderData();
        }

        // Check if stop is hit
        if ((order.side === 'BUY' && currentPrice <= order.currentStopPrice) ||
            (order.side === 'SELL' && currentPrice >= order.currentStopPrice)) {
            order.status = 'TRIGGERED';
            this.activeOrders.delete(order.id);
            return { status: 'TRIGGERED', stopPrice: order.currentStopPrice };
        }

        return null;
    }

    async checkConditionalOrder(order, currentPrice) {
        if (order.triggered) return null;

        const isTriggered = this.evaluateCondition(order.condition, currentPrice);
        if (isTriggered) {
            order.triggered = true;
            order.triggerTime = Date.now();
            order.status = 'TRIGGERED';
            
            // Execute the actual order
            const executedOrder = await this.createOrderSlice(order, order.quantity);
            this.activeOrders.delete(order.id);
            
            await this.saveOrderData();
            return { status: 'TRIGGERED', executedOrder };
        }

        return null;
    }

    evaluateCondition(condition, currentPrice) {
        // Simple condition evaluation - can be extended
        switch (condition.type) {
            case 'PRICE_ABOVE':
                return currentPrice > condition.value;
            case 'PRICE_BELOW':
                return currentPrice < condition.value;
            case 'PRICE_CROSSES_ABOVE':
                return currentPrice > condition.value && condition.previousPrice <= condition.value;
            case 'PRICE_CROSSES_BELOW':
                return currentPrice < condition.value && condition.previousPrice >= condition.value;
            default:
                return false;
        }
    }

    async createOrderSlice(parentOrder, quantity) {
        const sliceId = this.generateOrderId();
        const slice = {
            id: sliceId,
            parentOrderId: parentOrder.id,
            symbol: parentOrder.symbol,
            side: parentOrder.side,
            quantity,
            price: parentOrder.price || 0,
            status: 'EXECUTED',
            executedAt: new Date(),
            executionPrice: 0 // Would be filled by market execution
        };

        this.orderHistory.push(slice);
        return slice;
    }

    // Order management
    async cancelOrder(orderId) {
        const order = this.activeOrders.get(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        order.status = 'CANCELLED';
        order.cancelledAt = new Date();
        this.activeOrders.delete(orderId);

        // Cancel related orders (for bracket, OCO, etc.)
        if (order.type === this.orderTypes.BRACKET) {
            await this.cancelRelatedOrders([order.takeProfit.id, order.stopLoss.id]);
        } else if (order.type === this.orderTypes.OCO) {
            await this.cancelRelatedOrders([order.limitOrder.id, order.stopOrder.id]);
        }

        await this.saveOrderData();
        return { status: 'CANCELLED', orderId };
    }

    async cancelRelatedOrders(orderIds) {
        for (const orderId of orderIds) {
            const order = this.activeOrders.get(orderId);
            if (order) {
                order.status = 'CANCELLED';
                order.cancelledAt = new Date();
                this.activeOrders.delete(orderId);
            }
        }
    }

    async modifyOrder(orderId, modifications) {
        const order = this.activeOrders.get(orderId);
        if (!order) {
            throw new Error('Order not found');
        }

        // Apply modifications
        Object.assign(order, modifications);
        order.modifiedAt = new Date();

        await this.saveOrderData();
        return { status: 'MODIFIED', orderId };
    }

    // Data persistence
    async saveOrderData() {
        const data = {
            orders: Array.from(this.orders.entries()),
            orderHistory: this.orderHistory,
            activeOrders: Array.from(this.activeOrders.entries())
        };

        await fs.writeFile(
            path.join(__dirname, 'orderData.json'),
            JSON.stringify(data, null, 2)
        );
    }

    async loadOrderData() {
        try {
            const data = await fs.readFile(
                path.join(__dirname, 'orderData.json'),
                'utf8'
            );
            const parsed = JSON.parse(data);

            this.orders = new Map(parsed.orders || []);
            this.orderHistory = parsed.orderHistory || [];
            this.activeOrders = new Map(parsed.activeOrders || []);
        } catch (error) {
            // File doesn't exist or is invalid, start fresh
            console.log('Starting with fresh order data');
        }
    }

    // Utility methods
    generateOrderId() {
        return crypto.randomBytes(16).toString('hex');
    }

    startOrderMonitoring() {
        // Monitor active orders every 5 seconds
        setInterval(() => {
            this.monitorActiveOrders();
        }, 5000);
    }

    async monitorActiveOrders() {
        for (const [orderId, order] of this.activeOrders) {
            try {
                // Get current market price (simulated)
                const currentPrice = this.getSimulatedPrice(order.symbol);
                await this.executeOrderSlice(orderId, currentPrice);
            } catch (error) {
                console.error(`Error monitoring order ${orderId}:`, error);
            }
        }
    }

    getSimulatedPrice(symbol) {
        // Simulate price movement
        const basePrice = 1.2000; // EURUSD base price
        const variation = (Math.random() - 0.5) * 0.01; // ±50 pips
        return basePrice + variation;
    }

    // Getters for UI
    getActiveOrders() {
        return Array.from(this.activeOrders.values());
    }

    getOrderHistory() {
        return this.orderHistory;
    }

    getOrderById(orderId) {
        return this.orders.get(orderId);
    }

    getOrdersByType(type) {
        return Array.from(this.orders.values()).filter(order => order.type === type);
    }

    getOrderStatistics() {
        const active = this.activeOrders.size;
        const completed = this.orderHistory.length;
        const cancelled = Array.from(this.orders.values()).filter(o => o.status === 'CANCELLED').length;

        return {
            active,
            completed,
            cancelled,
            total: this.orders.size
        };
    }
}

module.exports = { AdvancedOrderTypes };


