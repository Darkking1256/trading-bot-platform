import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
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
  Minus,
  X
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ScatterChart, Scatter } from 'recharts';
import toast from 'react-hot-toast';

const MLPricePrediction = () => {
  const [predictionData, setPredictionData] = useState({});
  const [modelPerformance, setModelPerformance] = useState({});
  const [featureImportance, setFeatureImportance] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTraining, setIsTraining] = useState(false);
  const [activeTab, setActiveTab] = useState('predictions');
  const [selectedModel, setSelectedModel] = useState('lstm');
  const [predictionHorizon, setPredictionHorizon] = useState(24);
  const { socket, isConnected } = useSocket();

  const tabs = [
    { id: 'predictions', label: 'Price Predictions', icon: Target },
    { id: 'models', label: 'ML Models', icon: Brain },
    { id: 'performance', label: 'Model Performance', icon: BarChart3 },
    { id: 'features', label: 'Feature Analysis', icon: Activity },
    { id: 'sentiment', label: 'Sentiment Analysis', icon: TrendingUp }
  ];

  const models = [
    { id: 'lstm', name: 'LSTM Neural Network', description: 'Long Short-Term Memory for time series prediction', accuracy: 87.5 },
    { id: 'random_forest', name: 'Random Forest', description: 'Ensemble learning for robust predictions', accuracy: 82.3 },
    { id: 'xgboost', name: 'XGBoost', description: 'Gradient boosting for high accuracy', accuracy: 85.1 },
    { id: 'svm', name: 'Support Vector Machine', description: 'SVM for pattern recognition', accuracy: 79.8 },
    { id: 'ensemble', name: 'Ensemble Model', description: 'Combined predictions from multiple models', accuracy: 89.2 }
  ];

  const predictionHorizons = [
    { value: 1, label: '1 Hour' },
    { value: 4, label: '4 Hours' },
    { value: 24, label: '1 Day' },
    { value: 168, label: '1 Week' },
    { value: 720, label: '1 Month' }
  ];

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load prediction data
    socket.emit('getMLPredictions', { model: selectedModel, horizon: predictionHorizon });
    socket.once('mlPredictions', (data) => {
      setPredictionData(data);
    });

    // Load model performance
    socket.emit('getModelPerformance');
    socket.once('modelPerformance', (data) => {
      setModelPerformance(data);
    });

    // Load feature importance
    socket.emit('getFeatureImportance');
    socket.once('featureImportance', (data) => {
      setFeatureImportance(data);
    });

    setIsLoading(false);

    return () => {
      socket.off('mlPredictions');
      socket.off('modelPerformance');
      socket.off('featureImportance');
    };
  }, [socket, isConnected, selectedModel, predictionHorizon]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const trainModel = () => {
    setIsTraining(true);
    socket.emit('trainMLModel', { model: selectedModel });
    socket.once('trainMLModelResult', (result) => {
      if (result.success) {
        toast.success('Model training completed successfully');
        // Reload data
        socket.emit('getMLPredictions', { model: selectedModel, horizon: predictionHorizon });
        socket.emit('getModelPerformance');
      } else {
        toast.error(result.error || 'Failed to train model');
      }
      setIsTraining(false);
    });
  };

  const updatePrediction = () => {
    socket.emit('getMLPredictions', { model: selectedModel, horizon: predictionHorizon });
    socket.once('mlPredictions', (data) => {
      setPredictionData(data);
      toast.success('Predictions updated');
    });
  };

  const getPredictionColor = (prediction, actual) => {
    if (!actual) return 'text-blue-500';
    const accuracy = Math.abs(prediction - actual) / actual;
    if (accuracy < 0.01) return 'text-green-500';
    if (accuracy < 0.05) return 'text-yellow-500';
    return 'text-red-500';
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
          <h1 className="text-2xl font-bold text-white">ML Price Prediction</h1>
          <p className="text-gray-400">Advanced machine learning models for price forecasting</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={trainModel}
            disabled={isTraining}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isTraining ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {isTraining ? 'Training...' : 'Train Model'}
          </button>
          <button
            onClick={updatePrediction}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Zap className="h-4 w-4 mr-2" />
            Update Predictions
          </button>
        </div>
      </div>

      {/* Model Selection and Configuration */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select ML Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.accuracy}% accuracy)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prediction Horizon
            </label>
            <select
              value={predictionHorizon}
              onChange={(e) => setPredictionHorizon(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {predictionHorizons.map((horizon) => (
                <option key={horizon.value} value={horizon.value}>
                  {horizon.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Model Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Model Accuracy</h4>
            <Target className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatPercentage(modelPerformance.accuracy || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {models.find(m => m.id === selectedModel)?.name}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Prediction Confidence</h4>
            <Brain className="h-5 w-5 text-blue-500" />
          </div>
          <div className={`text-2xl font-bold ${getConfidenceLevel(predictionData.confidence || 0).color}`}>
            {formatPercentage((predictionData.confidence || 0) * 100)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {getConfidenceLevel(predictionData.confidence || 0).level} Confidence
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Mean Absolute Error</h4>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(modelPerformance.mae || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Average prediction error
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">R² Score</h4>
            <BarChart3 className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">
            {(modelPerformance.r2 || 0).toFixed(3)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Model fit quality
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
          {/* Price Predictions Tab */}
          {activeTab === 'predictions' && (
            <div className="space-y-6">
              {/* Prediction Chart */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Price Predictions</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={predictionData.predictions || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="timestamp" stroke="#9ca3af" />
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
                      dataKey="actual" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Actual Price"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Predicted Price"
                      strokeDasharray="5 5"
                      dot={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confidence_upper" 
                      stroke="transparent" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                      name="Confidence Interval"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="confidence_lower" 
                      stroke="transparent" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Prediction Table */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Detailed Predictions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Actual Price</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Predicted Price</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Error</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Confidence</th>
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Direction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(predictionData.predictions || []).slice(-10).map((prediction, index) => (
                        <tr key={index} className="border-b border-gray-600 hover:bg-gray-600">
                          <td className="py-3 px-4 text-white">
                            {new Date(prediction.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {prediction.actual ? formatCurrency(prediction.actual) : 'N/A'}
                          </td>
                          <td className={`py-3 px-4 font-medium ${getPredictionColor(prediction.predicted, prediction.actual)}`}>
                            {formatCurrency(prediction.predicted)}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {prediction.actual ? formatCurrency(Math.abs(prediction.predicted - prediction.actual)) : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              prediction.confidence > 0.8 ? 'bg-green-900 text-green-300' :
                              prediction.confidence > 0.6 ? 'bg-yellow-900 text-yellow-300' :
                              'bg-red-900 text-red-300'
                            }`}>
                              {formatPercentage(prediction.confidence * 100)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`flex items-center ${
                              prediction.direction === 'up' ? 'text-green-500' : 'text-red-500'
                            }`}>
                              {prediction.direction === 'up' ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                              ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                              )}
                              {prediction.direction === 'up' ? 'Bullish' : 'Bearish'}
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

          {/* ML Models Tab */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div key={model.id} className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                        <p className="text-gray-400 text-sm mt-1">{model.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        model.accuracy > 85 ? 'bg-green-900 text-green-300' :
                        model.accuracy > 80 ? 'bg-yellow-900 text-yellow-300' :
                        'bg-red-900 text-red-300'
                      }`}>
                        {model.accuracy}% accuracy
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Training Status:</span>
                        <span className="text-green-500">Trained</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Last Updated:</span>
                        <span className="text-white">2 hours ago</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Prediction Horizon:</span>
                        <span className="text-white">24 hours</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => setSelectedModel(model.id)}
                        className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                          selectedModel === model.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                        }`}
                      >
                        Select
                      </button>
                      <button className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                        Retrain
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Model Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Mean Squared Error</h4>
                  <div className="text-2xl font-bold text-white">
                    {(modelPerformance.mse || 0).toFixed(6)}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Root Mean Squared Error</h4>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(modelPerformance.rmse || 0)}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Mean Absolute Percentage Error</h4>
                  <div className="text-2xl font-bold text-white">
                    {formatPercentage(modelPerformance.mape || 0)}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Directional Accuracy</h4>
                  <div className="text-2xl font-bold text-white">
                    {formatPercentage(modelPerformance.directionalAccuracy || 0)}
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Model Performance Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={modelPerformance.history || []}>
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
                      dataKey="accuracy" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Accuracy"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="mae" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="MAE"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Feature Analysis Tab */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              {/* Feature Importance Chart */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Feature Importance</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={featureImportance.features || []} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" />
                    <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="importance" fill="#3b82f6" name="Importance" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Feature Correlation Matrix */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Feature Correlation Matrix</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left py-3 px-4 text-gray-400 font-medium">Feature</th>
                        {featureImportance.correlationMatrix && featureImportance.correlationMatrix[0] && 
                          featureImportance.correlationMatrix[0].map((_, index) => (
                            <th key={index} className="text-center py-3 px-4 text-gray-400 font-medium">
                              {featureImportance.featureNames && featureImportance.featureNames[index]}
                            </th>
                          ))
                        }
                      </tr>
                    </thead>
                    <tbody>
                      {featureImportance.correlationMatrix && featureImportance.correlationMatrix.map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b border-gray-600">
                          <td className="py-3 px-4 text-white font-medium">
                            {featureImportance.featureNames && featureImportance.featureNames[rowIndex]}
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
            </div>
          )}

          {/* Sentiment Analysis Tab */}
          {activeTab === 'sentiment' && (
            <div className="space-y-6">
              {/* Sentiment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Overall Sentiment</h4>
                  <div className="text-2xl font-bold text-green-500">
                    Bullish (0.72)
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Positive market sentiment
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">News Sentiment</h4>
                  <div className="text-2xl font-bold text-blue-500">
                    Neutral (0.48)
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Mixed news coverage
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Social Sentiment</h4>
                  <div className="text-2xl font-bold text-purple-500">
                    Bullish (0.65)
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    Positive social media
                  </div>
                </div>
              </div>

              {/* Sentiment Chart */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Sentiment Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={predictionData.sentimentHistory || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="timestamp" stroke="#9ca3af" />
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
                      dataKey="overall" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.3}
                      name="Overall Sentiment"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="news" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      name="News Sentiment"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="social" 
                      stroke="#8b5cf6" 
                      fill="#8b5cf6" 
                      fillOpacity={0.3}
                      name="Social Sentiment"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLPricePrediction;
