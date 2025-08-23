import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  Shield, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  BarChart3, 
  Settings,
  Zap,
  Target,
  DollarSign,
  Percent,
  Clock,
  Activity,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Play,
  Square,
  Pause,
  CheckCircle,
  XCircle,
  Info,
  Calculator,
  Gauge,
  Lock,
  Unlock
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

const RiskManagement = () => {
  const [riskData, setRiskData] = useState({});
  const [riskSettings, setRiskSettings] = useState({});
  const [stressTestResults, setStressTestResults] = useState({});
  const [positionSizing, setPositionSizing] = useState({});
  const [riskAlerts, setRiskAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { socket, isConnected } = useSocket();

  const tabs = [
    { id: 'overview', label: 'Risk Overview', icon: Shield },
    { id: 'position-sizing', label: 'Position Sizing', icon: Calculator },
    { id: 'stress-testing', label: 'Stress Testing', icon: Zap },
    { id: 'alerts', label: 'Risk Alerts', icon: AlertTriangle },
    { id: 'settings', label: 'Risk Settings', icon: Settings }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load risk data
    socket.emit('getRiskData');
    socket.once('riskData', (data) => {
      setRiskData(data);
    });

    // Load risk settings
    socket.emit('getRiskSettings');
    socket.once('riskSettings', (data) => {
      setRiskSettings(data);
    });

    // Load stress test results
    socket.emit('getStressTestResults');
    socket.once('stressTestResults', (data) => {
      setStressTestResults(data);
    });

    // Load position sizing data
    socket.emit('getPositionSizing');
    socket.once('positionSizing', (data) => {
      setPositionSizing(data);
    });

    // Load risk alerts
    socket.emit('getRiskAlerts');
    socket.once('riskAlerts', (data) => {
      setRiskAlerts(data);
    });

    setIsLoading(false);

    return () => {
      socket.off('riskData');
      socket.off('riskSettings');
      socket.off('stressTestResults');
      socket.off('positionSizing');
      socket.off('riskAlerts');
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

  const getRiskLevel = (riskScore) => {
    if (riskScore < 0.3) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500' };
    if (riskScore < 0.6) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { level: 'High', color: 'text-red-500', bg: 'bg-red-500' };
  };

  const getAlertSeverity = (severity) => {
    switch (severity) {
      case 'critical': return { color: 'text-red-500', bg: 'bg-red-900/20', border: 'border-red-700' };
      case 'high': return { color: 'text-orange-500', bg: 'bg-orange-900/20', border: 'border-orange-700' };
      case 'medium': return { color: 'text-yellow-500', bg: 'bg-yellow-900/20', border: 'border-yellow-700' };
      case 'low': return { color: 'text-blue-500', bg: 'bg-blue-900/20', border: 'border-blue-700' };
      default: return { color: 'text-gray-500', bg: 'bg-gray-900/20', border: 'border-gray-700' };
    }
  };

  const runStressTest = () => {
    socket.emit('runStressTest');
    socket.once('stressTestResult', (result) => {
      if (result.success) {
        setStressTestResults(result.data);
        toast.success('Stress test completed successfully');
      } else {
        toast.error(result.error || 'Failed to run stress test');
      }
    });
  };

  const updateRiskSettings = (settings) => {
    socket.emit('updateRiskSettings', settings);
    socket.once('updateRiskSettingsResult', (result) => {
      if (result.success) {
        setRiskSettings(settings);
        toast.success('Risk settings updated successfully');
      } else {
        toast.error(result.error || 'Failed to update risk settings');
      }
    });
  };

  const acknowledgeAlert = (alertId) => {
    socket.emit('acknowledgeRiskAlert', { alertId });
    socket.once('acknowledgeRiskAlertResult', (result) => {
      if (result.success) {
        setRiskAlerts(prev => prev.filter(alert => alert.id !== alertId));
        toast.success('Alert acknowledged');
      } else {
        toast.error(result.error || 'Failed to acknowledge alert');
      }
    });
  };

  const calculatePositionSize = (riskAmount, stopLossPips, accountBalance) => {
    const riskPerPip = riskAmount / stopLossPips;
    const positionSize = (riskAmount / (stopLossPips * 10)) * 100000; // Standard lot size
    const maxPositionSize = accountBalance * 0.02; // 2% max risk per trade
    
    return Math.min(positionSize, maxPositionSize);
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
          <h1 className="text-2xl font-bold text-white">Risk Management</h1>
          <p className="text-gray-400">Advanced risk analytics and portfolio protection</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runStressTest}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Zap className="h-4 w-4 mr-2" />
            Run Stress Test
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Auto Risk
          </button>
        </div>
      </div>

      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Portfolio Risk</h4>
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <div className={`text-2xl font-bold ${getRiskLevel(riskData.portfolioRisk || 0).color}`}>
            {getRiskLevel(riskData.portfolioRisk || 0).level}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Score: {(riskData.portfolioRisk || 0).toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Max Drawdown</h4>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatPercentage(riskData.maxDrawdown || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Current: {formatPercentage(riskData.currentDrawdown || 0)}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">VaR (95%)</h4>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(riskData.var95 || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Daily risk limit
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Sharpe Ratio</h4>
            <BarChart3 className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(riskData.sharpeRatio || 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Risk-adjusted return
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
          {/* Risk Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Risk Metrics Chart */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riskData.riskHistory || []}>
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
                      dataKey="portfolioRisk" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Portfolio Risk"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Drawdown"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="var95" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="VaR (95%)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Risk Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskData.riskDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(riskData.riskDistribution || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Correlation Matrix</h3>
                  <div className="space-y-3">
                    {(riskData.correlations || []).map((correlation) => (
                      <div key={correlation.pair} className="flex items-center justify-between p-3 bg-gray-600 rounded">
                        <span className="text-white font-medium">{correlation.pair}</span>
                        <span className={`font-semibold ${
                          Math.abs(correlation.value) > 0.7 ? 'text-red-500' :
                          Math.abs(correlation.value) > 0.5 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {correlation.value.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Position Sizing Tab */}
          {activeTab === 'position-sizing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Position Size Calculator</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Account Balance
                      </label>
                      <input
                        type="number"
                        value={positionSizing.accountBalance || 10000}
                        onChange={(e) => setPositionSizing(prev => ({ ...prev, accountBalance: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Account balance"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Risk Amount (USD)
                      </label>
                      <input
                        type="number"
                        value={positionSizing.riskAmount || 100}
                        onChange={(e) => setPositionSizing(prev => ({ ...prev, riskAmount: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Risk amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Stop Loss (Pips)
                      </label>
                      <input
                        type="number"
                        value={positionSizing.stopLossPips || 50}
                        onChange={(e) => setPositionSizing(prev => ({ ...prev, stopLossPips: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Stop loss in pips"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Recommended Position Size</h4>
                    <div className="text-2xl font-bold text-blue-400">
                      {calculatePositionSize(
                        positionSizing.riskAmount || 100,
                        positionSizing.stopLossPips || 50,
                        positionSizing.accountBalance || 10000
                      ).toFixed(2)} lots
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Risk per trade: {formatPercentage(((positionSizing.riskAmount || 100) / (positionSizing.accountBalance || 10000)) * 100)}%
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Position Sizing Rules</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-600 rounded">
                      <span className="text-white">Max Risk per Trade</span>
                      <span className="text-green-400 font-semibold">2%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-600 rounded">
                      <span className="text-white">Max Total Risk</span>
                      <span className="text-yellow-400 font-semibold">6%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-600 rounded">
                      <span className="text-white">Max Position Size</span>
                      <span className="text-blue-400 font-semibold">5%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-600 rounded">
                      <span className="text-white">Min Stop Loss</span>
                      <span className="text-red-400 font-semibold">20 pips</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Position Sizing History */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Position Sizing History</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={positionSizing.history || []}>
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
                    <Bar dataKey="positionSize" fill="#3b82f6" name="Position Size" />
                    <Bar dataKey="riskAmount" fill="#ef4444" name="Risk Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Stress Testing Tab */}
          {activeTab === 'stress-testing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Market Crash Scenario</h3>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {formatCurrency(stressTestResults.marketCrash?.potentialLoss || 0)}
                      </div>
                      <div className="text-sm text-gray-400">Potential Loss</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {formatPercentage(stressTestResults.marketCrash?.drawdown || 0)}
                      </div>
                      <div className="text-sm text-gray-400">Max Drawdown</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Volatility Spike</h3>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">
                        {formatCurrency(stressTestResults.volatilitySpike?.potentialLoss || 0)}
                      </div>
                      <div className="text-sm text-gray-400">Potential Loss</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {formatPercentage(stressTestResults.volatilitySpike?.drawdown || 0)}
                      </div>
                      <div className="text-sm text-gray-400">Max Drawdown</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Correlation Breakdown</h3>
                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-500">
                        {formatCurrency(stressTestResults.correlationBreakdown?.potentialLoss || 0)}
                      </div>
                      <div className="text-sm text-gray-400">Potential Loss</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {formatPercentage(stressTestResults.correlationBreakdown?.drawdown || 0)}
                      </div>
                      <div className="text-sm text-gray-400">Max Drawdown</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stress Test Results Chart */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Stress Test Results</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={stressTestResults.scenarios || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="scenario" stroke="#9ca3af" />
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
                      dataKey="potentialLoss" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.3}
                      name="Potential Loss"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.3}
                      name="Drawdown"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Risk Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Active Risk Alerts</h3>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                  </button>
                  <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {riskAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getAlertSeverity(alert.severity).bg} ${getAlertSeverity(alert.severity).border}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`mt-1 ${getAlertSeverity(alert.severity).color}`}>
                          {alert.severity === 'critical' && <AlertTriangle className="h-5 w-5" />}
                          {alert.severity === 'high' && <TrendingDown className="h-5 w-5" />}
                          {alert.severity === 'medium' && <Info className="h-5 w-5" />}
                          {alert.severity === 'low' && <CheckCircle className="h-5 w-5" />}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{alert.title}</h4>
                          <p className="text-gray-300 text-sm mt-1">{alert.message}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                            <span>{alert.timestamp}</span>
                            <span>•</span>
                            <span className={`capitalize ${getAlertSeverity(alert.severity).color}`}>
                              {alert.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors"
                        >
                          Acknowledge
                        </button>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                          Action
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Limits</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Daily Loss (%)
                      </label>
                      <input
                        type="number"
                        value={riskSettings.maxDailyLoss || 5}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, maxDailyLoss: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="20"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Weekly Loss (%)
                      </label>
                      <input
                        type="number"
                        value={riskSettings.maxWeeklyLoss || 15}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, maxWeeklyLoss: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="5"
                        max="50"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Drawdown (%)
                      </label>
                      <input
                        type="number"
                        value={riskSettings.maxDrawdown || 25}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, maxDrawdown: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="10"
                        max="50"
                        step="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Position Limits</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Risk per Trade (%)
                      </label>
                      <input
                        type="number"
                        value={riskSettings.maxRiskPerTrade || 2}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, maxRiskPerTrade: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0.5"
                        max="5"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Open Positions
                      </label>
                      <input
                        type="number"
                        value={riskSettings.maxOpenPositions || 10}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, maxOpenPositions: parseInt(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Max Position Size (%)
                      </label>
                      <input
                        type="number"
                        value={riskSettings.maxPositionSize || 5}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, maxPositionSize: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        max="20"
                        step="0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Automated Controls</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={riskSettings.autoStopLoss || false}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, autoStopLoss: e.target.checked }))}
                        className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">Auto Stop Loss</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={riskSettings.autoTakeProfit || false}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, autoTakeProfit: e.target.checked }))}
                        className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">Auto Take Profit</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={riskSettings.autoClosePositions || false}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, autoClosePositions: e.target.checked }))}
                        className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">Auto Close on Limit</span>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={riskSettings.riskAlerts || false}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, riskAlerts: e.target.checked }))}
                        className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">Risk Alerts</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={riskSettings.autoHedging || false}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, autoHedging: e.target.checked }))}
                        className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">Auto Hedging</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={riskSettings.portfolioRebalancing || false}
                        onChange={(e) => setRiskSettings(prev => ({ ...prev, portfolioRebalancing: e.target.checked }))}
                        className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-gray-300">Portfolio Rebalancing</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setRiskSettings({})}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </button>
                <button
                  onClick={() => updateRiskSettings(riskSettings)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;
