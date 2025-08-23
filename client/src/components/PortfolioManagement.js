import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart,
  Shield,
  Target,
  DollarSign,
  Percent,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Settings,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const PortfolioManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [portfolioData, setPortfolioData] = useState({});
  const [riskMetrics, setRiskMetrics] = useState({});
  const [performanceData, setPerformanceData] = useState([]);
  const [allocationData, setAllocationData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket, isConnected } = useSocket();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load accounts
    socket.emit('getAccounts');
    socket.once('accountsData', (data) => {
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0]);
      }
    });

    // Load portfolio data
    socket.emit('getPortfolioData');
    socket.once('portfolioData', (data) => {
      setPortfolioData(data);
    });

    // Load risk metrics
    socket.emit('getRiskMetrics');
    socket.once('riskMetricsData', (data) => {
      setRiskMetrics(data);
    });

    // Load performance data
    socket.emit('getPerformanceData');
    socket.once('performanceData', (data) => {
      setPerformanceData(data);
    });

    // Load allocation data
    socket.emit('getAllocationData');
    socket.once('allocationData', (data) => {
      setAllocationData(data);
    });

    setIsLoading(false);

    return () => {
      socket.off('accountsData');
      socket.off('portfolioData');
      socket.off('riskMetricsData');
      socket.off('performanceData');
      socket.off('allocationData');
    };
  }, [socket, isConnected]);

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

  const calculateSharpeRatio = (returns, riskFreeRate = 0.02) => {
    if (returns.length === 0) return 0;
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev === 0 ? 0 : (avgReturn - riskFreeRate) / stdDev;
  };

  const calculateMaxDrawdown = (equity) => {
    let maxDrawdown = 0;
    let peak = equity[0];

    for (let i = 1; i < equity.length; i++) {
      if (equity[i] > peak) {
        peak = equity[i];
      }
      const drawdown = (peak - equity[i]) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }

    return maxDrawdown * 100;
  };

  const getRiskLevel = (riskScore) => {
    if (riskScore < 0.3) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500' };
    if (riskScore < 0.6) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { level: 'High', color: 'text-red-500', bg: 'bg-red-500' };
  };

  const exportPortfolio = () => {
    const data = {
      accounts,
      portfolioData,
      riskMetrics,
      performanceData,
      allocationData,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Portfolio data exported successfully');
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
      {/* Account Selection */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Portfolio Accounts</h3>
          <button
            onClick={exportPortfolio}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                selectedAccount?.id === account.id
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">{account.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  account.type === 'Live' ? 'bg-red-900 text-red-300' : 'bg-green-900 text-green-300'
                }`}>
                  {account.type}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(account.balance)}
              </div>
              <div className="text-sm text-gray-400">
                {account.currency} • {account.leverage}:1
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAccount && (
        <>
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-400 text-sm">Total Balance</h4>
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatCurrency(portfolioData.totalBalance || 0)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {formatCurrency(portfolioData.availableBalance || 0)} available
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-400 text-sm">Total P&L</h4>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className={`text-2xl font-bold ${
                (portfolioData.totalPnL || 0) >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatCurrency(portfolioData.totalPnL || 0)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {formatPercentage(portfolioData.totalPnLPercent || 0)} today
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-400 text-sm">Open Positions</h4>
                <Activity className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-white">
                {portfolioData.openPositions || 0}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {formatCurrency(portfolioData.marginUsed || 0)} margin used
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-gray-400 text-sm">Risk Level</h4>
                <Shield className="h-5 w-5 text-purple-500" />
              </div>
              <div className={`text-2xl font-bold ${getRiskLevel(riskMetrics.riskScore || 0).color}`}>
                {getRiskLevel(riskMetrics.riskScore || 0).level}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Score: {(riskMetrics.riskScore || 0).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Risk Metrics */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Risk Analysis</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {formatPercentage(riskMetrics.maxDrawdown || 0)}
                </div>
                <div className="text-sm text-gray-400">Max Drawdown</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {(riskMetrics.sharpeRatio || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-400">Sharpe Ratio</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {(riskMetrics.volatility || 0).toFixed(2)}%
                </div>
                <div className="text-sm text-gray-400">Volatility</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">
                  {(riskMetrics.var95 || 0).toFixed(2)}%
                </div>
                <div className="text-sm text-gray-400">VaR (95%)</div>
              </div>
            </div>

            {/* Risk Warnings */}
            {riskMetrics.warnings && riskMetrics.warnings.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-semibold text-white mb-3">Risk Warnings</h4>
                <div className="space-y-2">
                  {riskMetrics.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center p-3 bg-red-900/20 border border-red-700 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                      <span className="text-red-300">{warning}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Performance Chart */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance History</h3>
            
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [formatCurrency(value), 'Equity']}
                />
                <Line 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Asset Allocation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Asset Allocation</h3>
              
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [formatCurrency(value), 'Value']}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Allocation Details</h3>
              
              <div className="space-y-3">
                {allocationData.map((asset, index) => (
                  <div key={asset.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <div className="font-medium text-white">{asset.name}</div>
                        <div className="text-sm text-gray-400">{asset.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">{formatCurrency(asset.value)}</div>
                      <div className="text-sm text-gray-400">{formatPercentage(asset.percentage)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Position Summary */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Position Summary</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Symbol</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Volume</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Open Price</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Current Price</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">P&L</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolioData.positions?.map((position) => (
                    <tr key={position.id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 px-4 text-white font-medium">{position.symbol}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          position.type === 'BUY' 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {position.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white">{position.volume}</td>
                      <td className="py-3 px-4 text-white">{position.openPrice?.toFixed(5)}</td>
                      <td className="py-3 px-4 text-white">{position.currentPrice?.toFixed(5)}</td>
                      <td className={`py-3 px-4 font-medium ${
                        position.pnl >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {formatCurrency(position.pnl || 0)}
                      </td>
                      <td className={`py-3 px-4 font-medium ${
                        position.pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {formatPercentage(position.pnlPercent || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PortfolioManagement;
