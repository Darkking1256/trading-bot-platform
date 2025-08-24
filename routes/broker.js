const express = require('express');
const router = express.Router();
const BrokerService = require('../services/BrokerService');

// Initialize broker service
const brokerService = new BrokerService();

// Initialize service on startup (don't fail if it doesn't work)
brokerService.initialize().catch(error => {
  console.log(`⚠️  Broker service initialization failed: ${error.message}`);
  console.log(`📊 Running in demo mode - no live trading available`);
});

// Get broker connection status
router.get('/status', (req, res) => {
  try {
    const status = brokerService.getConnectionStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Connect to broker
router.post('/connect/:broker', async (req, res) => {
  try {
    const { broker } = req.params;
    await brokerService.connectToBroker(broker);
    
    const status = brokerService.getConnectionStatus();
    res.json({
      success: true,
      message: `Connected to ${broker} successfully`,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get account information
router.get('/account', (req, res) => {
  try {
    const accountInfo = brokerService.getAccountInfo();
    if (!accountInfo) {
      return res.status(404).json({
        success: false,
        error: 'No account information available'
      });
    }
    
    res.json({
      success: true,
      data: accountInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get open positions
router.get('/positions', (req, res) => {
  try {
    const positions = brokerService.getOpenPositions();
    res.json({
      success: true,
      data: positions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get open orders
router.get('/orders', (req, res) => {
  try {
    const orders = brokerService.getOpenOrders();
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get order history
router.get('/orders/history', (req, res) => {
  try {
    const orders = brokerService.getOrderHistory();
    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Place market order
router.post('/orders/market', async (req, res) => {
  try {
    const { symbol, side, quantity, stopLoss, takeProfit } = req.body;
    
    if (!symbol || !side || !quantity) {
      return res.status(400).json({
        success: false,
        error: 'Symbol, side, and quantity are required'
      });
    }

    const options = {};
    if (stopLoss) options.stopLoss = stopLoss;
    if (takeProfit) options.takeProfit = takeProfit;

    const order = await brokerService.placeMarketOrder(symbol, side, quantity, options);
    
    res.json({
      success: true,
      message: 'Market order placed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Place limit order
router.post('/orders/limit', async (req, res) => {
  try {
    const { symbol, side, quantity, price, stopLoss, takeProfit } = req.body;
    
    if (!symbol || !side || !quantity || !price) {
      return res.status(400).json({
        success: false,
        error: 'Symbol, side, quantity, and price are required'
      });
    }

    const options = {};
    if (stopLoss) options.stopLoss = stopLoss;
    if (takeProfit) options.takeProfit = takeProfit;

    const order = await brokerService.placeLimitOrder(symbol, side, quantity, price, options);
    
    res.json({
      success: true,
      message: 'Limit order placed successfully',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel order
router.delete('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await brokerService.cancelOrder(orderId);
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available brokers
router.get('/brokers', (req, res) => {
  try {
    const brokers = Object.entries(brokerService.brokers).map(([key, broker]) => ({
      key,
      name: broker.name,
      enabled: broker.enabled,
      configured: !!broker.apiKey || !!broker.token
    }));
    
    res.json({
      success: true,
      data: brokers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test broker connection
router.post('/test/:broker', async (req, res) => {
  try {
    const { broker } = req.params;
    
    // Test connection without actually connecting
    const brokerConfig = brokerService.brokers[broker];
    if (!brokerConfig) {
      return res.status(404).json({
        success: false,
        error: `Broker ${broker} not found`
      });
    }

    if (!brokerConfig.enabled) {
      return res.status(400).json({
        success: false,
        error: `Broker ${broker} not configured`
      });
    }

    res.json({
      success: true,
      message: `Broker ${broker} is properly configured`,
      data: {
        name: brokerConfig.name,
        configured: true
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
