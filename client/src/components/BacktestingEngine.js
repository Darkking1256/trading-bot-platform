import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  Play, 
  Square, 
  Pause,
  RotateCcw,
  Download,
  Upload,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Clock,
  Activity,
  Eye,
  EyeOff,
  Save,
  Plus,
  Minus,
  X,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Brain,
  LineChart,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const BacktestingEngine = () => {
  const [backtestData, setBacktestData] = useState({});
  const [strategyConfig, setStrategyConfig] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results');
  const [selectedStrategy, setSelectedStrategy] = useState('moving_average');
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-01-31' });
  const { socket, isConnected } = useSocket();

  const tabs = [
    { id: 'results', label: 'Backtest Results', icon: BarChart3 },
    { id: 'strategy', label: 'Strategy Builder', icon: Brain },
    { id: 'performance', label: 'Performance Metrics', icon: TrendingUp },
    { id: 'trades', label: 'Trade Analysis', icon: Activity },
    { id: 'optimization', label: 'Strategy Optimization', icon: Target }
  ];

  const strategies = [
    { id: 'moving_average', name: 'Moving Average Crossover', description: 'Buy when short MA crosses above long MA', type: 'trend_following' },
    { id: 'rsi_strategy', name: 'RSI Strategy', description: 'Buy oversold, sell overbought', type: 'mean_reversion' },
    { id: 'macd_strategy', name: 'MACD Strategy', description: 'MACD signal line crossover', type: 'trend_following' },
    { id: 'bollinger_bands', name: 'Bollinger Bands', description: 'Price channel breakout strategy', type: 'mean_reversion' },
    { id: 'custom', name: 'Custom Strategy', description: 'User-defined trading rules', type: 'custom' }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load backtest data
    socket.emit('getBacktestResults', { strategy: selectedStrategy, dateRange });
    socket.once('backtestResults', (data) => {
      setBacktestData(data);
    });

    // Load strategy configuration
    socket.emit('getStrategyConfig', { strategy: selectedStrategy });
    socket.once('strategyConfig', (data) => {
      setStrategyConfig(data);
    });

    setIsLoading(false);

    return () => {
      socket.off('backtestResults');
      socket.off('strategyConfig');
    };
  }, [socket, isConnected, selectedStrategy, dateRange]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const runBacktest = () => {
    setIsRunning(true);
    socket.emit('runBacktest', { strategy: selectedStrategy, dateRange, config: strategyConfig });
    socket.once('backtestResult', (result) => {
      if (result.success) {
        setBacktestData(result.data);
        toast.success('Backtest completed successfully');
      } else {
        toast.error(result.error || 'Failed to run backtest');
      }
      setIsRunning(false);
    });
  };

  const stopBacktest = () => {
    socket.emit('stopBacktest');
    setIsRunning(false);
    toast.info('Backtest stopped');
  };

  const optimizeStrategy = () => {
    socket.emit('optimizeStrategy', { strategy: selectedStrategy, dateRange });
    socket.once('optimizationResult', (result) => {
      if (result.success) {
        setStrategyConfig(result.data.optimalConfig);
        toast.success('Strategy optimization completed');
      } else {
        toast.error(result.error || 'Failed to optimize strategy');
      }
    });
  };

  const getPerformanceColor = (value, threshold) => {
    if (value > threshold) return 'text-green-500';
    if (value < -threshold) return 'text-red-500';
    return 'text-yellow-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Backtesting Engine</h1>
          <p className="text-gray-400">Test and optimize trading strategies with historical data</p>
        </div>
        <div className="flex space-x-3">
          {!isRunning ? (
            <button
              onClick={runBacktest}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Play className="h-4 w-4 mr-2" />
              Run Backtest
            </button>
          ) : (
            <button
              onClick={stopBacktest}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Backtest
            </button>
          )}
          <button
            onClick={optimizeStrategy}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Target className="h-4 w-4 mr-2" />
            Optimize
          </button>
        </div>
      </div>

      {/* Strategy Selection and Configuration */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Strategy
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {strategies.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Total Return</h4>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className={`text-2xl font-bold ${getPerformanceColor(backtestData.totalReturn || 0, 5)}`}>
            {formatPercentage(backtestData.totalReturn || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            vs {formatPercentage(backtestData.benchmarkReturn || 0)} benchmark
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Sharpe Ratio</h4>
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(backtestData.sharpeRatio || 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Risk-adjusted return
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Max Drawdown</h4>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatPercentage(backtestData.maxDrawdown || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Peak to trough decline
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Win Rate</h4>
            <Target className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatPercentage(backtestData.winRate || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Profitable trades
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg">
        <div className="border-b border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Backtest Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-6">
              {/* Equity Curve */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={backtestData.equityCurve || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="strategy" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Strategy"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Benchmark"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="#ef4444" 
                      strokeWidth={1}
                      name="Drawdown"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Performance Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Monthly Returns</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={backtestData.monthlyReturns || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="return" fill="#3b82f6" name="Return" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Volatility:</span>
                      <span className="text-white font-medium">{formatPercentage(backtestData.volatility || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Beta:</span>
                      <span className="text-white font-medium">{(backtestData.beta || 0).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Alpha:</span>
                      <span className="text-white font-medium">{formatPercentage(backtestData.alpha || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Information Ratio:</span>
                      <span className="text-white font-medium">{(backtestData.informationRatio || 0).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Calmar Ratio:</span>
                      <span className="text-white font-medium">{(backtestData.calmarRatio || 0).toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Sortino Ratio:</span>
                      <span className="text-white font-medium">{(backtestData.sortinoRatio || 0).toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Builder Tab */}
          {activeTab === 'strategy' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Strategy Parameters</h3>
                  <div className="space-y-4">
                    {strategyConfig.parameters && Object.entries(strategyConfig.parameters).map(([key, value]) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {key.replace(/_/g, ' ').toUpperCase()}
                        </label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => setStrategyConfig(prev => ({
                            ...prev,
                            parameters: {
                              ...prev.parameters,
                              [key]: parseFloat(e.target.value)
                            }
                          }))}
                          className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Strategy Rules</h3>
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-600 rounded">
                      <h4 className="text-white font-medium mb-2">Entry Conditions</h4>
                      <p className="text-gray-300 text-sm">{strategyConfig.entryRules || 'No entry rules defined'}</p>
                    </div>
                    <div className="p-3 bg-gray-600 rounded">
                      <h4 className="text-white font-medium mb-2">Exit Conditions</h4>
                      <p className="text-gray-300 text-sm">{strategyConfig.exitRules || 'No exit rules defined'}</p>
                    </div>
                    <div className="p-3 bg-gray-600 rounded">
                      <h4 className="text-white font-medium mb-2">Risk Management</h4>
                      <p className="text-gray-300 text-sm">{strategyConfig.riskRules || 'No risk rules defined'}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Strategy Code</h3>
                <div className="bg-gray-800 border border-gray-600 rounded p-4">
                  <pre className="text-green-400 text-sm overflow-x-auto">
                    {strategyConfig.code || `def strategy(data):
    # Strategy implementation
    signals = []
    for i in range(len(data)):
        # Entry logic
        if entry_condition(data, i):
            signals.append(1)  # Buy signal
        elif exit_condition(data, i):
            signals.append(-1)  # Sell signal
        else:
            signals.append(0)  # Hold
    return signals`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Performance Metrics Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Total Trades</h4>
                  <div className="text-2xl font-bold text-white">
                    {backtestData.totalTrades || 0}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Winning Trades</h4>
                  <div className="text-2xl font-bold text-green-500">
                    {backtestData.winningTrades || 0}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Losing Trades</h4>
                  <div className="text-2xl font-bold text-red-500">
                    {backtestData.losingTrades || 0}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Average Trade</h4>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(backtestData.averageTrade || 0)}
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={backtestData.performanceDistribution || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="frequency" fill="#3b82f6" name="Frequency" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Trade Analysis Tab */}
          {activeTab === 'trades' && (
            <div className="space-y-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Trade History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Quantity</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">P&L</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(backtestData.trades || []).map((trade, index) => (
                        <tr key={index} className="border-b border-gray-600 hover:bg-gray-600">
                          <td className="py-3 px-4 text-white">
                            {new Date(trade.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              trade.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                            }`}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white">{formatCurrency(trade.price)}</td>
                          <td className="py-3 px-4 text-white">{trade.quantity}</td>
                          <td className={`py-3 px-4 font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {formatCurrency(trade.pnl)}
                          </td>
                          <td className="py-3 px-4 text-white">{trade.duration} days</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Optimization Tab */}
          {activeTab === 'optimization' && (
            <div className="space-y-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Parameter Optimization</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={backtestData.optimizationResults || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="param1" stroke="#9ca3af" />
                    <YAxis dataKey="param2" stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Scatter dataKey="sharpe" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Optimization Results</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <h4 className="text-gray-400 text-sm mb-2">Best Sharpe Ratio</h4>
                    <div className="text-2xl font-bold text-green-500">
                      {(backtestData.bestSharpe || 0).toFixed(3)}
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-gray-400 text-sm mb-2">Best Total Return</h4>
                    <div className="text-2xl font-bold text-blue-500">
                      {formatPercentage(backtestData.bestReturn || 0)}
                    </div>
                  </div>
                  <div className="text-center">
                    <h4 className="text-gray-400 text-sm mb-2">Best Parameters</h4>
                    <div className="text-sm text-white">
                      {backtestData.bestParameters || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BacktestingEngine;
