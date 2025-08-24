import React, { useState, useEffect, useRef } from 'react';
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
  Activity,
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react';
import { socket, socketStatus, tradingEvents } from '../lib/socket';
import { useDemoTicker } from '../hooks/useDemoTicker';

const TradingBot = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTrading, setIsTrading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [currentStrategy, setCurrentStrategy] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('Moving Average Crossover');
  const [strategyParams, setStrategyParams] = useState({});
  const [balance, setBalance] = useState(10000);
  const [positions, setPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [symbols, setSymbols] = useState({});
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
  const [logs, setLogs] = useState([]);

  const socketRef = useRef();

  // Demo ticker hook
  useDemoTicker(
    isDemoMode,
    (tick) => {
      setSymbols(prev => ({ ...prev, [tick.symbol]: tick }));
    },
    (perf) => {
      setPerformance(prev => ({ ...prev, ...perf }));
      setBalance(perf.balance);
      if (perf.tradeHistory) {
        setTrades(perf.tradeHistory);
      }
    }
  );

  useEffect(() => {
    // Socket connection status
    const updateConnectionStatus = () => {
      setIsConnected(socketStatus.connected);
      if (socketStatus.error) {
        setError(`Connection error: ${socketStatus.error}`);
      }
    };

    // Set up socket event listeners
    tradingEvents.onTick((tick) => {
      setSymbols(prev => ({ ...prev, [tick.symbol]: tick }));
    });

    tradingEvents.onPerformanceUpdate((perf) => {
      setPerformance(prev => ({ ...prev, ...perf }));
      setBalance(perf.balance);
      if (perf.tradeHistory) {
        setTrades(perf.tradeHistory);
      }
    });

    tradingEvents.onTradeExecuted((data) => {
      setTrades(prev => [...prev, data.trade]);
      setBalance(data.balance);
      setPerformance(data.performance);
      setSuccess(`Trade executed: ${data.trade.action} ${data.trade.symbol} at ${data.trade.price}`);
      setTimeout(() => setSuccess(''), 3000);
    });

    tradingEvents.onTradingStatus((data) => {
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

    tradingEvents.onLog((message) => {
      setLogs(prev => [...prev.slice(-9), { id: Date.now(), message, timestamp: new Date().toISOString() }]);
    });

    tradingEvents.onError((data) => {
      setError(data.error);
      setTimeout(() => setError(''), 5000);
    });

    // Initial connection status
    updateConnectionStatus();

    // Load available strategies
    fetchStrategies();

    // Cleanup
    return () => {
      tradingEvents.offTick();
      tradingEvents.offPerformanceUpdate();
      tradingEvents.offTradeExecuted();
      tradingEvents.offTradingStatus();
      tradingEvents.offLog();
      tradingEvents.offError();
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

  const startDemo = () => {
    setIsDemoMode(true);
    setSuccess('Demo mode started - simulating live trading');
    setTimeout(() => setSuccess(''), 3000);
  };

  const startLiveTrading = () => {
    if (!isConnected) {
      setError('Not connected to trading server');
      return;
    }
    setIsDemoMode(false);
    tradingEvents.startLive({ symbols: Object.keys(symbols) });
    setSuccess('Live trading started');
    setTimeout(() => setSuccess(''), 3000);
  };

  const startTrading = () => {
    if (!isConnected) {
      setError('Not connected to trading server');
      return;
    }
    if (!selectedStrategy) return;

    const parameters = getStrategyParameters(selectedStrategy);
    tradingEvents.startTrading(selectedStrategy, parameters);
  };

  const stopTrading = () => {
    setIsDemoMode(false);
    if (isConnected) {
      tradingEvents.stopTrading();
    }
    setSuccess('Trading stopped');
    setTimeout(() => setSuccess(''), 3000);
  };

  const stopAll = () => {
    setIsDemoMode(false);
    if (isConnected) {
      tradingEvents.stopAll();
    }
    setSuccess('All trading stopped');
    setTimeout(() => setSuccess(''), 3000);
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
                 {/* Demo Mode */}
                 <button
                   onClick={startDemo}
                   disabled={isDemoMode || isTrading}
                   className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                 >
                   <Zap size={16} />
                   <span>Start Demo</span>
                 </button>

                 {/* Live Trading */}
                 <button
                   onClick={startLiveTrading}
                   disabled={!isConnected || isDemoMode || isTrading}
                   className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                 >
                   <Wifi size={16} />
                   <span>Start Live</span>
                 </button>

                 {/* Strategy Trading */}
                 {!isTrading ? (
                   <button
                     onClick={startTrading}
                     disabled={!isConnected || isDemoMode}
                     className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                   >
                     <Play size={16} />
                     <span>Start Strategy</span>
                   </button>
                 ) : (
                   <button
                     onClick={stopTrading}
                     className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
                   >
                     <Square size={16} />
                     <span>Stop Strategy</span>
                   </button>
                 )}

                 {/* Stop All */}
                 {(isDemoMode || isTrading) && (
                   <button
                     onClick={stopAll}
                     className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center space-x-2"
                   >
                     <Square size={16} />
                     <span>Stop All</span>
                   </button>
                 )}
               </div>

                             {/* Current Status */}
               {(isTrading || isDemoMode) && (
                 <div className="mt-6 p-4 bg-blue-50 rounded-md">
                   <h3 className="text-sm font-medium text-blue-900 mb-2">Current Status</h3>
                   <div className="space-y-1 text-sm text-blue-800">
                     <div className="flex justify-between">
                       <span>Mode:</span>
                       <span className="font-medium">
                         {isDemoMode ? 'Demo' : isTrading ? 'Live Trading' : 'Inactive'}
                       </span>
                     </div>
                     {isTrading && (
                       <div className="flex justify-between">
                         <span>Strategy:</span>
                         <span className="font-medium">{currentStrategy}</span>
                       </div>
                     )}
                     <div className="flex justify-between">
                       <span>Connection:</span>
                       <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                         {isConnected ? 'Connected' : 'Disconnected'}
                       </span>
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

                         {/* Live Market Data */}
             <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
               <h2 className="text-lg font-semibold text-gray-900 mb-4">Live Market Data</h2>
               {Object.keys(symbols).length === 0 ? (
                 <p className="text-sm text-gray-500">No market data available. Start demo or connect to live feed.</p>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {Object.entries(symbols).map(([symbol, data]) => (
                     <div key={symbol} className="bg-gray-50 p-3 rounded-lg">
                       <div className="flex justify-between items-center">
                         <span className="font-medium text-sm">{symbol}</span>
                         <span className={`text-xs px-2 py-1 rounded ${
                           data.change > 0 ? 'bg-green-100 text-green-800' : 
                           data.change < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                         }`}>
                           {data.change > 0 ? '+' : ''}{data.change}%
                         </span>
                       </div>
                       <div className="text-lg font-semibold mt-1">
                         {data.price}
                       </div>
                     </div>
                   ))}
                 </div>
               )}
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

             {/* Trading Logs */}
             <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
               <h2 className="text-lg font-semibold text-gray-900 mb-4">Trading Logs</h2>
               {logs.length === 0 ? (
                 <p className="text-sm text-gray-500">No logs yet. Start trading to see activity.</p>
               ) : (
                 <div className="space-y-2 max-h-40 overflow-y-auto">
                   {logs.map((log) => (
                     <div key={log.id} className="text-sm text-gray-600 border-l-2 border-blue-500 pl-3">
                       <span className="text-gray-400 text-xs">
                         {new Date(log.timestamp).toLocaleTimeString()}
                       </span>
                       <span className="ml-2">{log.message}</span>
                     </div>
                   ))}
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
