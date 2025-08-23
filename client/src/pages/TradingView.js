import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { useSocket } from '../hooks/useSocket';
import AdvancedOrderTypes from '../components/AdvancedOrderTypes';
import TechnicalIndicators from '../components/TechnicalIndicators';
import { 
  ChevronDown, 
  Plus, 
  Minus, 
  Settings, 
  Play, 
  Pause,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart
} from 'lucide-react';
import toast from 'react-hot-toast';

const TradingView = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('1H');
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [tradeForm, setTradeForm] = useState({
    type: 'BUY',
    volume: 0.1,
    stopLoss: '',
    takeProfit: ''
  });
  const [currentPrice, setCurrentPrice] = useState({ bid: 0, ask: 0 });
  const [orderHistory, setOrderHistory] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('trading');
  
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();
  const { socket, isConnected } = useSocket();

  const symbols = [
    'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD',
    'EURGBP', 'EURJPY', 'GBPJPY', 'CHFJPY', 'AUDCAD', 'AUDCHF', 'AUDJPY'
  ];

  const timeframes = [
    { label: '1M', value: '1M' },
    { label: '5M', value: '5M' },
    { label: '15M', value: '15M' },
    { label: '30M', value: '30M' },
    { label: '1H', value: '1H' },
    { label: '4H', value: '4H' },
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' }
  ];

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 500,
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#2d2d2d' },
        horzLines: { color: '#2d2d2d' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#2d2d2d',
      },
      timeScale: {
        borderColor: '#2d2d2d',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      wickUpColor: '#26a69a',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Load chart data
  const loadChartData = useCallback(async () => {
    if (!socket || !isConnected) return;

    try {
      setIsLoading(true);
      socket.emit('getChartData', { symbol: selectedSymbol, timeframe });
      socket.once('chartData', (data) => {
        setChartData(data);
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(data);
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error loading chart data:', error);
      setIsLoading(false);
    }
  }, [socket, isConnected, selectedSymbol, timeframe]);

  // Load order history
  const loadOrderHistory = useCallback(async () => {
    if (!socket || !isConnected) return;

    try {
      socket.emit('getOrderHistory', { symbol: selectedSymbol, limit: 20 });
      socket.once('orderHistory', (data) => {
        setOrderHistory(data);
      });
    } catch (error) {
      console.error('Error loading order history:', error);
    }
  }, [socket, isConnected, selectedSymbol]);

  // Subscribe to real-time data
  useEffect(() => {
    if (!socket || !isConnected) return;

    loadChartData();
    loadOrderHistory();

    // Subscribe to symbol updates
    socket.emit('subscribe', selectedSymbol);

    socket.on('priceUpdate', (data) => {
      if (data.symbol === selectedSymbol) {
        setCurrentPrice(data.data);
      }
    });

    socket.on('candleUpdate', (data) => {
      if (data.symbol === selectedSymbol && candlestickSeriesRef.current) {
        candlestickSeriesRef.current.update(data.candle);
      }
    });

    socket.on('orderUpdate', (data) => {
      setOrderHistory(prev => [data, ...prev.slice(0, 19)]);
    });

    return () => {
      socket.emit('unsubscribe', selectedSymbol);
      socket.off('priceUpdate');
      socket.off('candleUpdate');
      socket.off('orderUpdate');
    };
  }, [socket, isConnected, selectedSymbol, timeframe, loadChartData, loadOrderHistory]);

  const handleSymbolChange = (symbol) => {
    setSelectedSymbol(symbol);
    setTradeForm(prev => ({ ...prev, stopLoss: '', takeProfit: '' }));
  };

  const handleTimeframeChange = (tf) => {
    setTimeframe(tf);
  };

  const handleTradeFormChange = (field, value) => {
    setTradeForm(prev => ({ ...prev, [field]: value }));
  };

  const calculateStopLoss = () => {
    if (!currentPrice.bid || !tradeForm.stopLoss) return '';
    
    const stopLossPips = parseFloat(tradeForm.stopLoss);
    const multiplier = tradeForm.type === 'BUY' ? -1 : 1;
    const stopLossPrice = currentPrice.bid + (multiplier * stopLossPips * 0.0001);
    
    return stopLossPrice.toFixed(5);
  };

  const calculateTakeProfit = () => {
    if (!currentPrice.bid || !tradeForm.takeProfit) return '';
    
    const takeProfitPips = parseFloat(tradeForm.takeProfit);
    const multiplier = tradeForm.type === 'BUY' ? 1 : -1;
    const takeProfitPrice = currentPrice.bid + (multiplier * takeProfitPips * 0.0001);
    
    return takeProfitPrice.toFixed(5);
  };

  const handleSubmitOrder = async () => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    if (!tradeForm.volume || tradeForm.volume <= 0) {
      toast.error('Please enter a valid volume');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        symbol: selectedSymbol,
        type: tradeForm.type,
        volume: parseFloat(tradeForm.volume),
        stopLoss: tradeForm.stopLoss ? calculateStopLoss() : null,
        takeProfit: tradeForm.takeProfit ? calculateTakeProfit() : null,
        price: tradeForm.type === 'BUY' ? currentPrice.ask : currentPrice.bid
      };

      socket.emit('placeOrder', orderData);
      socket.once('orderResult', (result) => {
        if (result.success) {
          toast.success(`Order placed successfully! Order ID: ${result.orderId}`);
          setTradeForm({
            type: 'BUY',
            volume: 0.1,
            stopLoss: '',
            takeProfit: ''
          });
        } else {
          toast.error(result.error || 'Failed to place order');
        }
        setIsSubmitting(false);
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return price.toFixed(5);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Trading</h1>
          <p className="text-gray-400">Real-time charts and trading</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Live:</span>
            <button
              onClick={() => setIsLive(!isLive)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                isLive 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {isLive ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            {/* Chart Controls */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-4">
                {/* Symbol Selector */}
                <div className="relative">
                  <select
                    value={selectedSymbol}
                    onChange={(e) => handleSymbolChange(e.target.value)}
                    className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {symbols.map(symbol => (
                      <option key={symbol} value={symbol}>{symbol}</option>
                    ))}
                  </select>
                </div>

                {/* Timeframe Selector */}
                <div className="flex space-x-1">
                  {timeframes.map(tf => (
                    <button
                      key={tf.value}
                      onClick={() => handleTimeframeChange(tf.value)}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        timeframe === tf.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Price */}
              <div className="text-right">
                <div className="text-sm text-gray-400">Current Price</div>
                <div className="text-lg font-bold text-white">
                  {formatPrice(currentPrice.bid || 0)}
                </div>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative">
              <div ref={chartContainerRef} className="w-full h-96" />
              {isLoading && (
                <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Trading Panel */}
        <div className="lg:col-span-1">
          {/* Tab Navigation */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
            <div className="flex">
              <button
                onClick={() => setActiveTab('trading')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'trading'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <TrendingUp className="h-4 w-4 inline mr-2" />
                Trading
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'advanced'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                Advanced
              </button>
              <button
                onClick={() => setActiveTab('indicators')}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                  activeTab === 'indicators'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Indicators
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'trading' && (
            <>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Place Order</h2>
                
                {/* Order Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTradeFormChange('type', 'BUY')}
                      className={`px-4 py-2 rounded font-medium ${
                        tradeForm.type === 'BUY'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 inline mr-2" />
                      BUY
                    </button>
                    <button
                      onClick={() => handleTradeFormChange('type', 'SELL')}
                      className={`px-4 py-2 rounded font-medium ${
                        tradeForm.type === 'SELL'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <TrendingDown className="h-4 w-4 inline mr-2" />
                      SELL
                    </button>
                  </div>
                </div>

                {/* Volume */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Volume (Lots)</label>
                  <input
                    type="number"
                    value={tradeForm.volume}
                    onChange={(e) => handleTradeFormChange('volume', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    step="0.01"
                    min="0.01"
                  />
                </div>

                {/* Stop Loss */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss (Pips)</label>
                  <input
                    type="number"
                    value={tradeForm.stopLoss}
                    onChange={(e) => handleTradeFormChange('stopLoss', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                  {tradeForm.stopLoss && (
                    <div className="text-xs text-gray-400 mt-1">
                      Price: {calculateStopLoss()}
                    </div>
                  )}
                </div>

                {/* Take Profit */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit (Pips)</label>
                  <input
                    type="number"
                    value={tradeForm.takeProfit}
                    onChange={(e) => handleTradeFormChange('takeProfit', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Optional"
                  />
                  {tradeForm.takeProfit && (
                    <div className="text-xs text-gray-400 mt-1">
                      Price: {calculateTakeProfit()}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || !isConnected}
                  className={`w-full py-3 px-4 rounded font-medium ${
                    tradeForm.type === 'BUY'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
                  ) : (
                    `Place ${tradeForm.type} Order`
                  )}
                </button>
              </div>

              {/* Order History */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mt-6">
                <h2 className="text-lg font-semibold text-white mb-4">Order History</h2>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {orderHistory.length > 0 ? (
                    orderHistory.map((order) => (
                      <div key={order.id} className="bg-gray-700 border border-gray-600 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-white">{order.symbol}</span>
                          {getOrderStatusIcon(order.status)}
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.type === 'BUY' 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {order.type}
                          </span>
                          <span className="text-gray-400">{order.volume} lots</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatPrice(order.price)} • {new Date(order.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      No orders yet
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'advanced' && (
            <AdvancedOrderTypes 
              selectedSymbol={selectedSymbol} 
              currentPrice={currentPrice} 
            />
          )}

          {activeTab === 'indicators' && (
            <TechnicalIndicators 
              selectedSymbol={selectedSymbol} 
              chartData={chartData} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingView;
