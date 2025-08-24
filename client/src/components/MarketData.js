import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Activity, BarChart3, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const MarketData = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('EURUSD');
  const [timeframe, setTimeframe] = useState('1h');
  const [marketData, setMarketData] = useState({});
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [symbols, setSymbols] = useState([]);
  const [timeframes] = useState(['1m', '5m', '15m', '30m', '1h', '4h', '1d']);
  const [marketStats, setMarketStats] = useState({});
  const [serviceStatus, setServiceStatus] = useState({});
  const wsRef = useRef(null);

  // Fetch available symbols
  useEffect(() => {
    fetchSymbols();
    fetchServiceStatus();
  }, []);

  // Fetch market data for selected symbol
  useEffect(() => {
    if (selectedSymbol) {
      fetchCurrentPrice();
      fetchHistoricalData();
      fetchMarketStats();
    }
  }, [selectedSymbol, timeframe]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedSymbol]);

  const connectWebSocket = () => {
    const ws = new WebSocket(`ws://${window.location.hostname}:5000`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected');
      // Subscribe to symbol updates
      ws.send(JSON.stringify({
        type: 'subscribe',
        symbol: selectedSymbol
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'priceUpdate' && data.symbol === selectedSymbol) {
          setMarketData(prev => ({
            ...prev,
            [selectedSymbol]: data.data
          }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
  };

  const fetchSymbols = async () => {
    try {
      const response = await fetch('/api/market/symbols');
      const result = await response.json();
      if (result.success) {
        setSymbols(result.data);
      }
    } catch (error) {
      console.error('Error fetching symbols:', error);
      toast.error('Failed to fetch symbols');
    }
  };

  const fetchServiceStatus = async () => {
    try {
      const response = await fetch('/api/market/status');
      const result = await response.json();
      if (result.success) {
        setServiceStatus(result.data);
      }
    } catch (error) {
      console.error('Error fetching service status:', error);
    }
  };

  const fetchCurrentPrice = async () => {
    try {
      const response = await fetch(`/api/market/prices/${selectedSymbol}`);
      const result = await response.json();
      if (result.success) {
        setMarketData(prev => ({
          ...prev,
          [selectedSymbol]: result.data
        }));
      }
    } catch (error) {
      console.error('Error fetching current price:', error);
      toast.error('Failed to fetch current price');
    }
  };

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/market/ohlc/${selectedSymbol}?timeframe=${timeframe}&limit=100`);
      const result = await response.json();
      if (result.success) {
        setHistoricalData(result.data.ohlc);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Failed to fetch historical data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketStats = async () => {
    try {
      const response = await fetch(`/api/market/stats/${selectedSymbol}?period=24h`);
      const result = await response.json();
      if (result.success) {
        setMarketStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching market stats:', error);
    }
  };

  const refreshData = () => {
    fetchCurrentPrice();
    fetchHistoricalData();
    fetchMarketStats();
    toast.success('Data refreshed');
  };

  const currentPrice = marketData[selectedSymbol];
  const priceChange = currentPrice ? (currentPrice.bid - currentPrice.ask) / currentPrice.ask * 100 : 0;
  const isPositive = priceChange > 0;

  const formatPrice = (price) => {
    return typeof price === 'number' ? price.toFixed(5) : '0.00000';
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Market Data</h1>
          <p className="text-gray-600">Real-time market prices and analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Activity className="w-4 h-4" />
            <span>Service Status: {serviceStatus.initialized ? '🟢 Online' : '🔴 Offline'}</span>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {timeframes.map(tf => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Current Price Card */}
      {currentPrice && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedSymbol}</h2>
              <p className="text-gray-600">Current Market Price</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {formatPrice(currentPrice.bid)}
              </div>
              <div className={`flex items-center space-x-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(priceChange).toFixed(4)}%</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Bid</div>
              <div className="text-lg font-semibold text-gray-900">{formatPrice(currentPrice.bid)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Ask</div>
              <div className="text-lg font-semibold text-gray-900">{formatPrice(currentPrice.ask)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Spread</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(currentPrice.spread || (currentPrice.ask - currentPrice.bid))}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Last Update</div>
              <div className="text-sm font-semibold text-gray-900">
                {formatTime(currentPrice.timestamp)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Statistics */}
      {Object.keys(marketStats).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Statistics (24h)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-sm text-blue-600">High</div>
              <div className="text-lg font-semibold text-blue-900">{formatPrice(marketStats.high)}</div>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <div className="text-sm text-red-600">Low</div>
              <div className="text-lg font-semibold text-red-900">{formatPrice(marketStats.low)}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-green-600">Volume</div>
              <div className="text-lg font-semibold text-green-900">
                {marketStats.volume ? marketStats.volume.toLocaleString() : 'N/A'}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-sm text-purple-600">Change</div>
              <div className={`text-lg font-semibold ${marketStats.change >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {marketStats.change ? `${marketStats.change >= 0 ? '+' : ''}${marketStats.change.toFixed(4)}%` : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Price Chart</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Last updated: {currentPrice ? formatTime(currentPrice.timestamp) : 'N/A'}</span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : historicalData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis 
                domain={['dataMin - 0.0001', 'dataMax + 0.0001']}
                tickFormatter={(value) => value.toFixed(5)}
              />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleString()}
                formatter={(value) => [value.toFixed(5), 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="close" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.1}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-2" />
              <p>No historical data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Service Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Available Symbols</div>
            <div className="text-lg font-semibold text-gray-900">{serviceStatus.symbols || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Timeframes</div>
            <div className="text-lg font-semibold text-gray-900">{serviceStatus.timeframes || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Service Status</div>
            <div className="text-lg font-semibold text-gray-900">
              {serviceStatus.initialized ? '🟢 Ready' : '🔴 Initializing'}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-sm text-gray-600">Data Source</div>
            <div className="text-lg font-semibold text-gray-900">Real-time APIs</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketData;
