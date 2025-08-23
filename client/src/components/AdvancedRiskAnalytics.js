import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
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
  Unlock,
  BarChart,
  PieChart,
  LineChart,
  ScatterPlot
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import toast from 'react-hot-toast';

const AdvancedRiskAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({});
  const [monteCarloResults, setMonteCarloResults] = useState({});
  const [scenarioAnalysis, setScenarioAnalysis] = useState({});
  const [riskAttribution, setRiskAttribution] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monte-carlo');
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  const { socket, isConnected } = useSocket();

  const tabs = [
    { id: 'monte-carlo', label: 'Monte Carlo', icon: BarChart3 },
    { id: 'scenario-analysis', label: 'Scenario Analysis', icon: Target },
    { id: 'risk-attribution', label: 'Risk Attribution', icon: PieChart },
    { id: 'volatility-analysis', label: 'Volatility Analysis', icon: TrendingUp },
    { id: 'correlation-analysis', label: 'Correlation Analysis', icon: BarChart }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4'];

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load analytics data
    socket.emit('getAdvancedRiskAnalytics');
    socket.once('advancedRiskAnalytics', (data) => {
      setAnalyticsData(data);
    });

    // Load Monte Carlo results
    socket.emit('getMonteCarloResults');
    socket.once('monteCarloResults', (data) => {
      setMonteCarloResults(data);
    });

    // Load scenario analysis
    socket.emit('getScenarioAnalysis');
    socket.once('scenarioAnalysis', (data) => {
      setScenarioAnalysis(data);
    });

    // Load risk attribution
    socket.emit('getRiskAttribution');
    socket.once('riskAttribution', (data) => {
      setRiskAttribution(data);
    });

    setIsLoading(false);

    return () => {
      socket.off('advancedRiskAnalytics');
      socket.off('monteCarloResults');
      socket.off('scenarioAnalysis');
      socket.off('riskAttribution');
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

  const runMonteCarloSimulation = () => {
    setIsRunningSimulation(true);
    socket.emit('runMonteCarloSimulation');
    socket.once('monteCarloSimulationResult', (result) => {
      if (result.success) {
        setMonteCarloResults(result.data);
        toast.success('Monte Carlo simulation completed successfully');
      } else {
        toast.error(result.error || 'Failed to run Monte Carlo simulation');
      }
      setIsRunningSimulation(false);
    });
  };

  const runScenarioAnalysis = () => {
    socket.emit('runScenarioAnalysis');
    socket.once('scenarioAnalysisResult', (result) => {
      if (result.success) {
        setScenarioAnalysis(result.data);
        toast.success('Scenario analysis completed successfully');
      } else {
        toast.error(result.error || 'Failed to run scenario analysis');
      }
    });
  };

  const getRiskLevel = (riskScore) => {
    if (riskScore < 0.3) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500' };
    if (riskScore < 0.6) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { level: 'High', color: 'text-red-500', bg: 'bg-red-500' };
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
          <h1 className="text-2xl font-bold text-white">Advanced Risk Analytics</h1>
          <p className="text-gray-400">Sophisticated risk modeling and analysis tools</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={runMonteCarloSimulation}
            disabled={isRunningSimulation}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isRunningSimulation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Zap className="h-4 w-4 mr-2" />
            )}
            {isRunningSimulation ? 'Running...' : 'Run Monte Carlo'}
          </button>
          <button
            onClick={runScenarioAnalysis}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Target className="h-4 w-4 mr-2" />
            Scenario Analysis
          </button>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Expected Return</h4>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatPercentage(analyticsData.expectedReturn || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Annualized
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Portfolio Volatility</h4>
            <Activity className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatPercentage(analyticsData.volatility || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Annualized
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">VaR (99%)</h4>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(analyticsData.var99 || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Daily risk limit
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Information Ratio</h4>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(analyticsData.informationRatio || 0).toFixed(2)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Risk-adjusted alpha
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
          {/* Monte Carlo Tab */}
          {activeTab === 'monte-carlo' && (
            <div className="space-y-6">
              {/* Monte Carlo Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Portfolio Value Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monteCarloResults.distribution || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="value" stroke="#9ca3af" />
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
                        dataKey="frequency" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.3}
                        name="Frequency"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Return Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monteCarloResults.returnDistribution || []}>
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
                      <Bar dataKey="probability" fill="#10b981" name="Probability" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monte Carlo Statistics */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Monte Carlo Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(monteCarloResults.meanValue || 0)}
                    </div>
                    <div className="text-sm text-gray-400">Mean Portfolio Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(monteCarloResults.medianValue || 0)}
                    </div>
                    <div className="text-sm text-gray-400">Median Portfolio Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(monteCarloResults.var95 || 0)}
                    </div>
                    <div className="text-sm text-gray-400">VaR (95%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(monteCarloResults.cvar95 || 0)}
                    </div>
                    <div className="text-sm text-gray-400">CVaR (95%)</div>
                  </div>
                </div>
              </div>

              {/* Monte Carlo Paths */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Monte Carlo Paths</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monteCarloResults.paths || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    {monteCarloResults.paths && monteCarloResults.paths.slice(0, 10).map((path, index) => (
                      <Line 
                        key={index}
                        type="monotone" 
                        dataKey={`path${index}`} 
                        stroke={COLORS[index % COLORS.length]} 
                        strokeWidth={1}
                        dot={false}
                        name={`Path ${index + 1}`}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Scenario Analysis Tab */}
          {activeTab === 'scenario-analysis' && (
            <div className="space-y-6">
              {/* Scenario Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scenarioAnalysis.scenarios && scenarioAnalysis.scenarios.map((scenario, index) => (
                  <div key={scenario.name} className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">{scenario.name}</h3>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${scenario.impact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(scenario.impact)}
                        </div>
                        <div className="text-sm text-gray-400">Portfolio Impact</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">
                          {formatPercentage(scenario.probability)}
                        </div>
                        <div className="text-sm text-gray-400">Probability</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-white">
                          {formatPercentage(scenario.drawdown)}
                        </div>
                        <div className="text-sm text-gray-400">Max Drawdown</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Scenario Comparison Chart */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Scenario Impact Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scenarioAnalysis.scenarios || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="impact" fill="#3b82f6" name="Impact" />
                    <Bar dataKey="drawdown" fill="#ef4444" name="Drawdown" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Risk Attribution Tab */}
          {activeTab === 'risk-attribution' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Attribution by Asset</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskAttribution.byAsset || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(riskAttribution.byAsset || []).map((entry, index) => (
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
                  <h3 className="text-lg font-semibold text-white mb-4">Risk Attribution by Factor</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={riskAttribution.byFactor || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {(riskAttribution.byFactor || []).map((entry, index) => (
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
              </div>

              {/* Risk Attribution Table */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Risk Attribution</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Component</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Risk Contribution</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Percentage</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Risk Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(riskAttribution.detailed || []).map((item) => (
                        <tr key={item.component} className="border-b border-gray-600 hover:bg-gray-600">
                          <td className="py-3 px-4 text-white font-medium">{item.component}</td>
                          <td className="py-3 px-4 text-white">{formatCurrency(item.riskContribution)}</td>
                          <td className="py-3 px-4 text-white">{formatPercentage(item.percentage)}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              item.riskLevel === 'high' ? 'bg-red-900 text-red-300' :
                              item.riskLevel === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                              'bg-green-900 text-green-300'
                            }`}>
                              {item.riskLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Volatility Analysis Tab */}
          {activeTab === 'volatility-analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Historical Volatility</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.historicalVolatility || []}>
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
                        dataKey="volatility" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        name="Volatility"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Volatility Forecast</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analyticsData.volatilityForecast || []}>
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
                        dataKey="forecast" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.3}
                        name="Forecast"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="confidence" 
                        stroke="#f59e0b" 
                        fill="#f59e0b" 
                        fillOpacity={0.1}
                        name="Confidence Interval"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Correlation Analysis Tab */}
          {activeTab === 'correlation-analysis' && (
            <div className="space-y-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Correlation Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Asset</th>
                        {analyticsData.correlationMatrix && analyticsData.correlationMatrix[0] && 
                          analyticsData.correlationMatrix[0].map((_, index) => (
                            <th key={index} className="text-center py-3 px-4 text-gray-400 font-medium">
                              {analyticsData.assets && analyticsData.assets[index]}
                            </th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.correlationMatrix && analyticsData.correlationMatrix.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-600">
                          <td className="py-3 px-4 text-white font-medium">
                            {analyticsData.assets && analyticsData.assets[rowIndex]}
                          </td>
                          {row.map((value, colIndex) => (
                            <td key={colIndex} className="text-center py-3 px-4">
                              <span className={`font-semibold ${
                                Math.abs(value) > 0.7 ? 'text-red-500' :
                                Math.abs(value) > 0.5 ? 'text-yellow-500' : 'text-green-500'
                              }`}>
                                {value.toFixed(3)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Correlation Heatmap</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={analyticsData.correlationScatter || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="x" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Scatter dataKey="y" fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdvancedRiskAnalytics;
