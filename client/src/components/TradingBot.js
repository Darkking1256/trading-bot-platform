import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { 
  Play, 
  Square, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

const TradingBot = () => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('Moving Average Crossover');
  const [strategyParams, setStrategyParams] = useState({});
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [performance, setPerformance] = useState({
    totalTrades: 0,
    winningTrades: 0,
    losingTrades: 0,
    winRate: 0,
    totalPnL: 0,
    maxDrawdown: 0,
    sharpeRatio: 0
  });
  const [availableStrategies, setAvailableStrategies] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const socketRef = useRef();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    socketRef.current = newSocket;

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError('');
      console.log('Connected to trading server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      setError('Disconnected from server');
    });

    newSocket.on('tradingStatus', (data) => {
      setIsTrading(data.isRunning);
      setCurrentStrategy(data.strategy || '');
      setBalance(data.balance || 10000);
      setPositions(data.positions || []);
      setTrades(data.trades || []);
      setPerformance(data.performance || {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        maxDrawdown: 0,
        sharpeRatio: 0
      });
    });

    newSocket.on('tradeExecuted', (data) => {
      setTrades(prev => [...prev, data.trade]);
      setBalance(data.balance);
      setPerformance(data.performance);
      setSuccess(`Trade executed: ${data.trade.action} ${data.trade.symbol} at ${data.trade.price}`);
      setTimeout(() => setSuccess(''), 3000);
    });

    newSocket.on('tradingError', (data) => {
      setError(data.error);
      setTimeout(() => setError(''), 5000);
    });

    newSocket.on('tradingStarted', (data) => {
      setIsTrading(true);
      setCurrentStrategy(data.strategy);
      setSuccess(`Started ${data.strategy} strategy`);
      setTimeout(() => setSuccess(''), 3000);
    });

    newSocket.on('tradingStopped', () => {
      setIsTrading(false);
      setCurrentStrategy('');
      setSuccess('Trading stopped');
      setTimeout(() => setSuccess(''), 3000);
    });

    setSocket(newSocket);

    // Load available strategies
    fetchStrategies();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/trading/strategies');
      const data = await response.json();
      setAvailableStrategies(data.strategies || []);
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
    }
  };

  const startTrading = () => {
    if (!socket || !selectedStrategy) return;

    const parameters = getStrategyParameters(selectedStrategy);
    socket.emit('startTrading', {
      strategy: selectedStrategy,
      parameters
    });
  };

  const stopTrading = () => {
    if (!socket) return;
    socket.emit('stopTrading');
  };

  const getStrategyParameters = (strategy) => {
    switch (strategy) {
      case 'Moving Average Crossover':
        return {
          symbol: 'EURUSD',
          shortPeriod: 10,
          longPeriod: 20
        };
      case 'RSI Strategy':
        return {
          symbol: 'EURUSD',
          period: 14,
          overbought: 70,
          oversold: 30
        };
      case 'MACD Strategy':
        return {
          symbol: 'EURUSD',
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9
        };
      case 'Bollinger Bands':
        return {
          symbol: 'EURUSD',
          period: 20,
          stdDev: 2
        };
      case 'Random Walk':
        return {
          symbol: 'EURUSD'
        };
      default:
        return {};
    }
  };

  const getStrategyDescription = (strategy) => {
    switch (strategy) {
      case 'Moving Average Crossover':
        return 'Buys when short MA crosses above long MA, sells when it crosses below';
      case 'RSI Strategy':
        return 'Buys when RSI is oversold (<30), sells when overbought (>70)';
      case 'MACD Strategy':
        return 'Buys on bullish MACD crossover, sells on bearish crossover';
      case 'Bollinger Bands':
        return 'Buys when price touches lower band, sells when touching upper band';
      case 'Random Walk':
        return 'Random trading decisions for demonstration purposes';
      default:
        return '';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Trading Bot</h1>
              <p className="text-gray-600">Automated trading with advanced strategies</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              {isTrading && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  <Activity size={16} />
                  <span>Live Trading</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Control Panel</h2>
              
              {/* Strategy Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trading Strategy
                </label>
                <select
                  value={selectedStrategy}
                  onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isTrading}
                >
                  {availableStrategies.map(strategy => (
                    <option key={strategy} value={strategy}>
                      {strategy}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 mt-2">
                  {getStrategyDescription(selectedStrategy)}
                </p>
              </div>

              {/* Strategy Parameters */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Parameters</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  {Object.entries(getStrategyParameters(selectedStrategy)).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="font-mono">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trading Controls */}
              <div className="space-y-3">
                {!isTrading ? (
                  <button
                    onClick={startTrading}
                    disabled={!isConnected}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <Play size={16} />
                    <span>Start Trading</span>
                  </button>
                ) : (
                  <button
                    onClick={stopTrading}
                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
                  >
                    <Square size={16} />
                    <span>Stop Trading</span>
                  </button>
                )}
              </div>

              {/* Current Status */}
              {isTrading && (
                <div className="mt-6 p-4 bg-blue-50 rounded-md">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Current Status</h3>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Strategy:</span>
                      <span className="font-medium">{currentStrategy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Performance Dashboard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Dashboard</h2>
              
              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Balance</p>
                      <p className="text-lg font-semibold">{formatCurrency(balance)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="text-blue-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Win Rate</p>
                      <p className="text-lg font-semibold">{formatPercentage(performance.winRate)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="text-green-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Total P&L</p>
                      <p className={`text-lg font-semibold ${performance.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(performance.totalPnL)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingDown className="text-red-600" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Max Drawdown</p>
                      <p className="text-lg font-semibold">{formatPercentage(performance.maxDrawdown)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Trade Statistics */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Trade Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Trades:</span>
                      <span className="font-medium">{performance.totalTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Winning Trades:</span>
                      <span className="font-medium text-green-600">{performance.winningTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Losing Trades:</span>
                      <span className="font-medium text-red-600">{performance.losingTrades}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sharpe Ratio:</span>
                      <span className="font-medium">{performance.sharpeRatio.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Open Positions */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-3">Open Positions</h3>
                  {positions.length === 0 ? (
                    <p className="text-sm text-gray-500">No open positions</p>
                  ) : (
                    <div className="space-y-2">
                      {positions.map(position => (
                        <div key={position.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <span className="font-medium">{position.symbol}</span>
                            <span className={`ml-2 text-xs px-2 py-1 rounded ${
                              position.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {position.type}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{position.volume}</div>
                            <div className={`text-xs ${position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(position.pnl)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Trades */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Trades</h2>
              {trades.length === 0 ? (
                <p className="text-sm text-gray-500">No trades yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Symbol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Volume
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {trades.slice(-10).reverse().map(trade => (
                        <tr key={trade.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(trade.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {trade.symbol}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              trade.action === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {trade.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trade.price.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {trade.volume}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">
                            {trade.reason}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingBot;
