import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BarChart3, 
  Target,
  Zap,
  Clock,
  Activity,
  Eye,
  EyeOff,
  Play,
  Square,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Settings,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  Search,
  Plus,
  Minus as MinusIcon,
  X,
  Brain,
  LineChart,
  PieChart,
  Gauge,
  Activity as ActivityIcon,
  Target as TargetIcon
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const MarketRegimeDetection = () => {
  const [regimeData, setRegimeData] = useState({});
  const [currentRegime, setCurrentRegime] = useState({});
  const [regimeHistory, setRegimeHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('daily');
  const { socket, isConnected } = useSocket();

  const tabs = [
    { id: 'overview', label: 'Market Overview', icon: BarChart3 },
    { id: 'regimes', label: 'Regime Analysis', icon: Brain },
    { id: 'indicators', label: 'Regime Indicators', icon: Activity },
    { id: 'predictions', label: 'Regime Predictions', icon: Target },
    { id: 'alerts', label: 'Regime Alerts', icon: AlertTriangle }
  ];

  const timeframes = [
    { value: 'hourly', label: '1 Hour' },
    { value: '4hour', label: '4 Hours' },
    { value: 'daily', label: '1 Day' },
    { value: 'weekly', label: '1 Week' },
    { value: 'monthly', label: '1 Month' }
  ];

  const regimeTypes = {
    bull: { name: 'Bull Market', color: '#10b981', icon: TrendingUp, description: 'Strong upward trend with high confidence' },
    bear: { name: 'Bear Market', color: '#ef4444', icon: TrendingDown, description: 'Strong downward trend with high confidence' },
    sideways: { name: 'Sideways Market', color: '#f59e0b', icon: Minus, description: 'Consolidation phase with low volatility' },
    volatile: { name: 'Volatile Market', color: '#8b5cf6', icon: ActivityIcon, description: 'High volatility with uncertain direction' },
    transition: { name: 'Regime Transition', color: '#06b6d4', icon: TargetIcon, description: 'Market regime is changing' }
  };

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load regime data
    socket.emit('getMarketRegime', { timeframe: selectedTimeframe });
    socket.once('marketRegime', (data) => {
      setRegimeData(data);
      setCurrentRegime(data.current);
      setRegimeHistory(data.history || []);
    });

    setIsLoading(false);

    return () => {
      socket.off('marketRegime');
    };
  }, [socket, isConnected, selectedTimeframe]);

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const getRegimeIcon = (regimeType) => {
    const regime = regimeTypes[regimeType];
    return regime ? <regime.icon className="h-5 w-5" style={{ color: regime.color }} /> : null;
  };

  const getRegimeColor = (regimeType) => {
    return regimeTypes[regimeType]?.color || '#6b7280';
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence > 0.8) return { level: 'High', color: 'text-green-500', bg: 'bg-green-500' };
    if (confidence > 0.6) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { level: 'Low', color: 'text-red-500', bg: 'bg-red-500' };
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
          <h1 className="text-2xl font-bold text-white">Market Regime Detection</h1>
          <p className="text-gray-400">AI-powered market state identification and analysis</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {timeframes.map((timeframe) => (
              <option key={timeframe.value} value={timeframe.value}>
                {timeframe.label}
              </option>
            ))}
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Zap className="h-4 w-4 mr-2" />
            Update Analysis
          </button>
        </div>
      </div>

      {/* Current Market Regime */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Current Market Regime</h2>
          <div className="flex items-center space-x-2">
            {getRegimeIcon(currentRegime.type)}
            <span className="text-white font-medium">{regimeTypes[currentRegime.type]?.name || 'Unknown'}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Regime Confidence</h3>
              <Gauge className="h-4 w-4 text-blue-500" />
            </div>
            <div className={`text-2xl font-bold ${getConfidenceLevel(currentRegime.confidence || 0).color}`}>
              {formatPercentage((currentRegime.confidence || 0) * 100)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {getConfidenceLevel(currentRegime.confidence || 0).level} Confidence
            </div>
          </div>

          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Regime Duration</h3>
              <Clock className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {currentRegime.duration || 0} days
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Since regime started
            </div>
          </div>

          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-400 text-sm">Volatility</h3>
              <ActivityIcon className="h-4 w-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {formatPercentage(currentRegime.volatility || 0)}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Current market volatility
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-700 border border-gray-600 rounded-lg">
          <h3 className="text-white font-medium mb-2">Regime Description</h3>
          <p className="text-gray-300 text-sm">
            {regimeTypes[currentRegime.type]?.description || 'Market regime analysis not available'}
          </p>
        </div>
      </div>

      {/* Regime Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Regime Distribution (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={regimeData.distribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {regimeData.distribution && regimeData.distribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getRegimeColor(entry.name)} />
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

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Regime Performance</h3>
          <div className="space-y-4">
            {regimeData.performance && Object.entries(regimeData.performance).map(([regime, perf]) => (
              <div key={regime} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getRegimeIcon(regime)}
                  <div>
                    <div className="text-white font-medium">{regimeTypes[regime]?.name || regime}</div>
                    <div className="text-gray-400 text-sm">{perf.duration} days</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${perf.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatPercentage(perf.return)}
                  </div>
                  <div className="text-gray-400 text-sm">Return</div>
                </div>
              </div>
            ))}
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
          {/* Market Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Regime Timeline */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Regime Timeline</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={regimeHistory}>
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
                      dataKey="bull_probability" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.6}
                      name="Bull Market"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bear_probability" 
                      stackId="1"
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.6}
                      name="Bear Market"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sideways_probability" 
                      stackId="1"
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.6}
                      name="Sideways Market"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Market Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Average Regime Duration</h4>
                  <div className="text-2xl font-bold text-white">
                    {regimeData.avgDuration || 0} days
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Regime Changes</h4>
                  <div className="text-2xl font-bold text-white">
                    {regimeData.regimeChanges || 0}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Most Common Regime</h4>
                  <div className="text-2xl font-bold text-white">
                    {regimeData.mostCommonRegime || 'N/A'}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Regime Stability</h4>
                  <div className="text-2xl font-bold text-white">
                    {formatPercentage(regimeData.stability || 0)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regime Analysis Tab */}
          {activeTab === 'regimes' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(regimeTypes).map(([key, regime]) => (
                  <div key={key} className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <regime.icon className="h-6 w-6" style={{ color: regime.color }} />
                        <h3 className="text-lg font-semibold text-white">{regime.name}</h3>
                      </div>
                      <span className="text-sm text-gray-400">
                        {regimeData.regimeStats && regimeData.regimeStats[key] ? 
                          `${regimeData.regimeStats[key].frequency}%` : '0%'}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-4">{regime.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Average Duration:</span>
                        <span className="text-white">
                          {regimeData.regimeStats && regimeData.regimeStats[key] ? 
                            `${regimeData.regimeStats[key].avgDuration} days` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Average Return:</span>
                        <span className={`font-medium ${
                          regimeData.regimeStats && regimeData.regimeStats[key] && regimeData.regimeStats[key].avgReturn > 0 ? 
                            'text-green-500' : 'text-red-500'
                        }`}>
                          {regimeData.regimeStats && regimeData.regimeStats[key] ? 
                            formatPercentage(regimeData.regimeStats[key].avgReturn) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Volatility:</span>
                        <span className="text-white">
                          {regimeData.regimeStats && regimeData.regimeStats[key] ? 
                            formatPercentage(regimeData.regimeStats[key].volatility) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Regime Indicators Tab */}
          {activeTab === 'indicators' && (
            <div className="space-y-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Regime Indicators</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={regimeData.indicators || []}>
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
                      dataKey="trend_strength" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Trend Strength"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="volatility" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Volatility"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="momentum" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Momentum"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mean_reversion" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Mean Reversion"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Indicator Weights</h4>
                  <div className="space-y-3">
                    {regimeData.indicatorWeights && Object.entries(regimeData.indicatorWeights).map(([indicator, weight]) => (
                      <div key={indicator} className="flex items-center justify-between">
                        <span className="text-gray-300">{indicator.replace(/_/g, ' ').toUpperCase()}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full" 
                              style={{ width: `${weight * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm">{formatPercentage(weight * 100)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Indicator Correlation</h4>
                  <div className="space-y-3">
                    {regimeData.indicatorCorrelation && Object.entries(regimeData.indicatorCorrelation).map(([pair, correlation]) => (
                      <div key={pair} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">{pair}</span>
                        <span className={`font-medium ${
                          Math.abs(correlation) > 0.7 ? 'text-red-500' :
                          Math.abs(correlation) > 0.5 ? 'text-yellow-500' : 'text-green-500'
                        }`}>
                          {correlation.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regime Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="space-y-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Regime Forecast</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={regimeData.forecast || []}>
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
                      dataKey="bull_probability" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Bull Probability"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="bear_probability" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="Bear Probability"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sideways_probability" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Sideways Probability"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Next Regime Prediction</h4>
                  <div className="text-2xl font-bold text-white">
                    {regimeData.nextRegimePrediction || 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Predicted in {regimeData.predictionHorizon || 0} days
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Prediction Confidence</h4>
                  <div className="text-2xl font-bold text-white">
                    {formatPercentage((regimeData.predictionConfidence || 0) * 100)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Model confidence level
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Regime Transition Probability</h4>
                  <div className="text-2xl font-bold text-white">
                    {formatPercentage((regimeData.transitionProbability || 0) * 100)}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Likelihood of regime change
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Regime Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Regime Alerts</h3>
                <div className="space-y-4">
                  {regimeData.alerts && regimeData.alerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      alert.severity === 'high' ? 'border-red-500 bg-red-900/20' :
                      alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-900/20' :
                      'border-blue-500 bg-blue-900/20'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`mt-1 ${
                            alert.severity === 'high' ? 'text-red-500' :
                            alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                          }`}>
                            <AlertTriangle className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{alert.title}</h4>
                            <p className="text-gray-300 text-sm mt-1">{alert.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                              <span>{alert.timestamp}</span>
                              <span>•</span>
                              <span className={`capitalize ${
                                alert.severity === 'high' ? 'text-red-500' :
                                alert.severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
                              }`}>
                                {alert.severity}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketRegimeDetection;
