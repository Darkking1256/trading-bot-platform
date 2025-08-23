import React, { useState } from 'react';
import MLPricePrediction from '../components/MLPricePrediction';
import BacktestingEngine from '../components/BacktestingEngine';
import MarketRegimeDetection from '../components/MarketRegimeDetection';
import SentimentAnalysis from '../components/SentimentAnalysis';
import { 
  Brain, 
  BarChart3, 
  TrendingUp, 
  Activity,
  Target,
  Zap,
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
  X,
  LineChart,
  PieChart,
  MessageSquare,
  Newspaper,
  Twitter,
  Facebook,
  Instagram,
  Globe,
  Users,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Share2,
  Hash,
  AtSign,
  Gauge,
  Activity as ActivityIcon,
  Target as TargetIcon
} from 'lucide-react';

const AdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('ml-prediction');

  const tabs = [
    { 
      id: 'ml-prediction', 
      label: 'ML Price Prediction', 
      icon: Brain,
      description: 'Machine learning models for price forecasting',
      component: <MLPricePrediction />
    },
    { 
      id: 'backtesting', 
      label: 'Backtesting Engine', 
      icon: BarChart3,
      description: 'Test and optimize trading strategies',
      component: <BacktestingEngine />
    },
    { 
      id: 'market-regime', 
      label: 'Market Regime Detection', 
      icon: TrendingUp,
      description: 'AI-powered market state identification',
      component: <MarketRegimeDetection />
    },
    { 
      id: 'sentiment', 
      label: 'Sentiment Analysis', 
      icon: MessageSquare,
      description: 'Real-time market sentiment analysis',
      component: <SentimentAnalysis />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Advanced Analytics</h1>
                <p className="text-gray-400 mt-2">
                  AI-powered market analysis, machine learning predictions, and comprehensive trading insights
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
                  <Info className="h-4 w-4 mr-2" />
                  Help
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Overview Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm">ML Model Accuracy</h4>
              <Brain className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">87.5%</div>
            <div className="text-sm text-gray-400 mt-1">LSTM Neural Network</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm">Current Market Regime</h4>
              <TrendingUp className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-green-500">Bull Market</div>
            <div className="text-sm text-gray-400 mt-1">High confidence (0.85)</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm">Overall Sentiment</h4>
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-green-500">Bullish</div>
            <div className="text-sm text-gray-400 mt-1">0.72 sentiment score</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm">Strategy Performance</h4>
              <BarChart3 className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-green-500">+15.3%</div>
            <div className="text-sm text-gray-400 mt-1">Last 30 days</div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg mb-6">
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
                  <tab.icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg">
          {tabs.find(tab => tab.id === activeTab)?.component}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Brain className="h-5 w-5 mr-2" />
              Train New Model
            </button>
            <button className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <BarChart3 className="h-5 w-5 mr-2" />
              Run Backtest
            </button>
            <button className="flex items-center justify-center p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <TrendingUp className="h-5 w-5 mr-2" />
              Update Regime
            </button>
            <button className="flex items-center justify-center p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              <MessageSquare className="h-5 w-5 mr-2" />
              Analyze Sentiment
            </button>
          </div>
        </div>

        {/* Analytics Insights */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="text-green-500 mt-1">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">ML Model Performance Improved</p>
                  <p className="text-gray-400 text-xs">LSTM accuracy increased by 2.3% in the last week</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="text-blue-500 mt-1">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Market Regime Transition Detected</p>
                  <p className="text-gray-400 text-xs">Bull market conditions strengthening with 85% confidence</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
                <div className="text-yellow-500 mt-1">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Sentiment Shift Alert</p>
                  <p className="text-gray-400 text-xs">Social media sentiment turning bearish in the last 4 hours</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">ML Predictions Accuracy</span>
                <span className="text-white font-medium">87.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Regime Detection Accuracy</span>
                <span className="text-white font-medium">92.1%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Sentiment Analysis Accuracy</span>
                <span className="text-white font-medium">78.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Backtest Success Rate</span>
                <span className="text-white font-medium">73.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Overall System Performance</span>
                <span className="text-green-500 font-medium">83.0%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
