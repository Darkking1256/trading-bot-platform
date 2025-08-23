import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  Eye, 
  EyeOff, 
  RefreshCw,
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [marketData, setMarketData] = useState([]);
  const [accountInfo, setAccountInfo] = useState({
    balance: 10000,
    equity: 10000,
    margin: 0,
    freeMargin: 10000,
    marginLevel: 0
  });
  const [recentTrades, setRecentTrades] = useState([]);
  const [showBalance, setShowBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState([]);
  const [activePositions, setActivePositions] = useState([]);
  const { socket, isConnected } = useSocket();

  const symbols = ['EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD'];

  // Load dashboard data
  const loadDashboardData = async () => {
    if (!socket || !isConnected) return;

    try {
      // Get account info
      socket.emit('getAccountInfo');
      socket.once('accountInfo', (data) => {
        setAccountInfo(data);
      });

      // Get recent trades
      socket.emit('getRecentTrades', { limit: 10 });
      socket.once('recentTradesData', (data) => {
        setRecentTrades(data);
      });

      // Get active positions
      socket.emit('getActivePositions');
      socket.once('activePositionsData', (data) => {
        setActivePositions(data);
      });

      // Get performance data
      socket.emit('getPerformanceData');
      socket.once('performanceData', (data) => {
        setPerformanceData(data);
      });

      // Subscribe to market data for dashboard symbols
      symbols.forEach(symbol => {
        socket.emit('subscribe', symbol);
      });

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setIsLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    loadDashboardData();

    socket.on('priceUpdate', (data) => {
      setMarketData(prev => {
        const existing = prev.find(item => item.symbol === data.symbol);
        if (existing) {
          return prev.map(item => 
            item.symbol === data.symbol 
              ? { ...item, ...data.data, previousPrice: item.bid }
              : item
          );
        } else {
          return [...prev, { symbol: data.symbol, ...data.data, previousPrice: data.data.bid }];
        }
      });
    });

    socket.on('accountUpdate', (data) => {
      setAccountInfo(data);
    });

    socket.on('tradeUpdate', (data) => {
      setRecentTrades(prev => [data, ...prev.slice(0, 9)]);
    });

    socket.on('positionUpdate', (data) => {
      setActivePositions(data);
    });

    return () => {
      symbols.forEach(symbol => {
        socket.emit('unsubscribe', symbol);
      });
      socket.off('priceUpdate');
      socket.off('accountUpdate');
      socket.off('tradeUpdate');
      socket.off('positionUpdate');
    };
  }, [socket, isConnected]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatPrice = (price) => {
    return price.toFixed(5);
  };

  const getPriceChange = (current, previous) => {
    if (!previous) return { change: 0, percent: 0 };
    const change = current - previous;
    const percent = (change / previous) * 100;
    return { change, percent };
  };

  const getTradeStatusIcon = (status) => {
    switch (status) {
      case 'open':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTradeStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'text-blue-500';
      case 'closed':
        return 'text-green-500';
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const refreshData = () => {
    setIsLoading(true);
    loadDashboardData();
    toast.success('Dashboard data refreshed');
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
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your trading overview.</p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Balance</p>
              <p className="text-2xl font-bold text-white">
                {showBalance ? formatCurrency(accountInfo.balance) : '••••••'}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Equity</p>
              <p className="text-2xl font-bold text-white">
                {showBalance ? formatCurrency(accountInfo.equity) : '••••••'}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Margin Used</p>
              <p className="text-2xl font-bold text-white">
                {showBalance ? formatCurrency(accountInfo.margin) : '••••••'}
              </p>
            </div>
            <Activity className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Free Margin</p>
              <p className="text-2xl font-bold text-white">
                {showBalance ? formatCurrency(accountInfo.freeMargin) : '••••••'}
              </p>
            </div>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="text-gray-400 hover:text-white"
            >
              {showBalance ? <EyeOff className="h-8 w-8" /> : <Eye className="h-8 w-8" />}
            </button>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Market Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketData.map((symbol) => {
            const priceChange = getPriceChange(symbol.bid, symbol.previousPrice);
            return (
              <div key={symbol.symbol} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-white">{symbol.symbol}</h3>
                  <span className={`text-sm font-medium ${
                    priceChange.percent > 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {priceChange.percent > 0 ? '+' : ''}{priceChange.percent.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-white">
                    {formatPrice(symbol.bid)}
                  </span>
                  {priceChange.percent > 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
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
              <Area 
                type="monotone" 
                dataKey="equity" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Active Positions */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Active Positions</h2>
          <div className="space-y-3">
            {activePositions.length > 0 ? (
              activePositions.map((position) => (
                <div key={position.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-white">{position.symbol}</h3>
                      <p className="text-sm text-gray-400">
                        {position.type} {position.volume} lots @ {formatPrice(position.openPrice)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        position.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {formatCurrency(position.pnl)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {position.pnl >= 0 ? '+' : ''}{((position.pnl / position.openPrice) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No active positions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Trades</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Time</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Volume</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Price</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">P&L</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTrades.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-4 text-white">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 text-white font-medium">{trade.symbol}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      trade.type === 'BUY' 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">{trade.volume}</td>
                  <td className="py-3 px-4 text-white">{formatPrice(trade.price)}</td>
                  <td className={`py-3 px-4 font-medium ${
                    trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {formatCurrency(trade.pnl || 0)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      {getTradeStatusIcon(trade.status)}
                      <span className={`ml-2 text-sm ${getTradeStatusColor(trade.status)}`}>
                        {trade.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
