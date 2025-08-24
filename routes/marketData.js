const express = require('express');
const router = express.Router();
const MarketDataService = require('../services/MarketDataService');

// Initialize market data service
const marketDataService = new MarketDataService();

// Initialize service on startup
marketDataService.initialize().catch(console.error);

// Get all current prices
router.get('/prices', async (req, res) => {
  try {
    const prices = marketDataService.getAllCurrentPrices();
    res.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market prices'
    });
  }
});

// Get current price for specific symbol
router.get('/prices/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = marketDataService.getCurrentPrice(symbol.toUpperCase());
    
    if (!price) {
      return res.status(404).json({
        success: false,
        error: 'Symbol not found'
      });
    }

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        ...price
      }
    });
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch price'
    });
  }
});

// Get historical data
router.get('/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1h', limit = 100 } = req.query;

    const data = await marketDataService.getHistoricalData(
      symbol.toUpperCase(),
      timeframe,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        timeframe,
        data
      }
    });
  } catch (error) {
    console.error('Error fetching historical data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch historical data'
    });
  }
});

// Get market statistics
router.get('/stats/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '24h' } = req.query;

    const stats = await marketDataService.getMarketStats(
      symbol.toUpperCase(),
      period
    );

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'No data available for symbol'
      });
    }

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching market stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market statistics'
    });
  }
});

// Get available symbols
router.get('/symbols', (req, res) => {
  try {
    const symbols = marketDataService.getAvailableSymbols();
    res.json({
      success: true,
      data: symbols
    });
  } catch (error) {
    console.error('Error fetching symbols:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch symbols'
    });
  }
});

// Get available timeframes
router.get('/timeframes', (req, res) => {
  try {
    const timeframes = marketDataService.getAvailableTimeframes();
    res.json({
      success: true,
      data: timeframes
    });
  } catch (error) {
    console.error('Error fetching timeframes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timeframes'
    });
  }
});

// Get service status
router.get('/status', (req, res) => {
  try {
    const status = {
      initialized: marketDataService.isReady(),
      symbols: marketDataService.getAvailableSymbols().length,
      timeframes: marketDataService.getAvailableTimeframes().length,
      currentPrices: marketDataService.getAllCurrentPrices()
    };

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching service status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service status'
    });
  }
});

// Force refresh historical data
router.post('/refresh/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1d', days = 30 } = req.query;

    console.log(`Refreshing historical data for ${symbol}...`);

    const historicalData = await marketDataService.fetchHistoricalData(
      symbol.toUpperCase(),
      timeframe,
      parseInt(days)
    );

    if (historicalData.length > 0) {
      await marketDataService.saveHistoricalData(symbol.toUpperCase(), historicalData);
    }

    res.json({
      success: true,
      message: `Refreshed ${historicalData.length} data points for ${symbol}`,
      data: {
        symbol: symbol.toUpperCase(),
        timeframe,
        count: historicalData.length
      }
    });
  } catch (error) {
    console.error('Error refreshing historical data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh historical data'
    });
  }
});

// Get OHLC data for charting
router.get('/ohlc/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { timeframe = '1h', limit = 100 } = req.query;

    const data = await marketDataService.getHistoricalData(
      symbol.toUpperCase(),
      timeframe,
      parseInt(limit)
    );

    // Format data for charting libraries
    const ohlcData = data.map(item => ({
      time: new Date(item.timestamp).getTime(),
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseFloat(item.volume || 0)
    }));

    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        timeframe,
        ohlc: ohlcData
      }
    });
  } catch (error) {
    console.error('Error fetching OHLC data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch OHLC data'
    });
  }
});

// Get price alerts (placeholder for future feature)
router.get('/alerts', (req, res) => {
  res.json({
    success: true,
    message: 'Price alerts feature coming soon',
    data: []
  });
});

// Create price alert (placeholder for future feature)
router.post('/alerts', (req, res) => {
  res.json({
    success: true,
    message: 'Price alerts feature coming soon'
  });
});

module.exports = router;
