import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
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
  X,
  Brain,
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
  AtSign
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

const SentimentAnalysis = () => {
  const [sentimentData, setSentimentData] = useState({});
  const [newsSentiment, setNewsSentiment] = useState([]);
  const [socialSentiment, setSocialSentiment] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedSource, setSelectedSource] = useState('all');
  const { socket, isConnected } = useSocket();

  const tabs = [
    { id: 'overview', label: 'Sentiment Overview', icon: BarChart3 },
    { id: 'news', label: 'News Analysis', icon: Newspaper },
    { id: 'social', label: 'Social Media', icon: MessageSquare },
    { id: 'trends', label: 'Trending Topics', icon: TrendingUp },
    { id: 'alerts', label: 'Sentiment Alerts', icon: AlertTriangle }
  ];

  const timeframes = [
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hours' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' }
  ];

  const sources = [
    { value: 'all', label: 'All Sources', icon: Globe },
    { value: 'news', label: 'News Media', icon: Newspaper },
    { value: 'twitter', label: 'Twitter', icon: Twitter },
    { value: 'reddit', label: 'Reddit', icon: MessageSquare },
    { value: 'facebook', label: 'Facebook', icon: Facebook },
    { value: 'instagram', label: 'Instagram', icon: Instagram }
  ];

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load sentiment data
    socket.emit('getSentimentAnalysis', { timeframe: selectedTimeframe, source: selectedSource });
    socket.once('sentimentAnalysis', (data) => {
      setSentimentData(data);
      setNewsSentiment(data.news || []);
      setSocialSentiment(data.social || []);
    });

    setIsLoading(false);

    return () => {
      socket.off('sentimentAnalysis');
    };
  }, [socket, isConnected, selectedTimeframe, selectedSource]);

  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  const getSentimentColor = (sentiment) => {
    if (sentiment > 0.6) return 'text-green-500';
    if (sentiment < 0.4) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getSentimentLabel = (sentiment) => {
    if (sentiment > 0.6) return 'Bullish';
    if (sentiment < 0.4) return 'Bearish';
    return 'Neutral';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment > 0.6) return <TrendingUp className="h-4 w-4" />;
    if (sentiment < 0.4) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
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
          <h1 className="text-2xl font-bold text-white">Sentiment Analysis</h1>
          <p className="text-gray-400">Real-time market sentiment from news and social media</p>
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
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {sources.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Zap className="h-4 w-4 mr-2" />
            Update Analysis
          </button>
        </div>
      </div>

      {/* Overall Sentiment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Overall Sentiment</h4>
            <div className={`${getSentimentColor(sentimentData.overallSentiment || 0.5)}`}>
              {getSentimentIcon(sentimentData.overallSentiment || 0.5)}
            </div>
          </div>
          <div className={`text-2xl font-bold ${getSentimentColor(sentimentData.overallSentiment || 0.5)}`}>
            {getSentimentLabel(sentimentData.overallSentiment || 0.5)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {(sentimentData.overallSentiment || 0.5).toFixed(3)} score
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">News Sentiment</h4>
            <Newspaper className="h-5 w-5 text-blue-500" />
          </div>
          <div className={`text-2xl font-bold ${getSentimentColor(sentimentData.newsSentiment || 0.5)}`}>
            {getSentimentLabel(sentimentData.newsSentiment || 0.5)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {sentimentData.newsCount || 0} articles analyzed
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Social Sentiment</h4>
            <MessageSquare className="h-5 w-5 text-green-500" />
          </div>
          <div className={`text-2xl font-bold ${getSentimentColor(sentimentData.socialSentiment || 0.5)}`}>
            {getSentimentLabel(sentimentData.socialSentiment || 0.5)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            {sentimentData.socialCount || 0} posts analyzed
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Sentiment Change</h4>
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <div className={`text-2xl font-bold ${sentimentData.sentimentChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {sentimentData.sentimentChange >= 0 ? '+' : ''}{formatPercentage(sentimentData.sentimentChange || 0)}
          </div>
          <div className="text-sm text-gray-400 mt-1">
            vs previous period
          </div>
        </div>
      </div>

      {/* Sentiment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData.distribution || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.distribution && sentimentData.distribution.map((entry, index) => (
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

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Source Performance</h3>
          <div className="space-y-4">
            {sentimentData.sourcePerformance && Object.entries(sentimentData.sourcePerformance).map(([source, data]) => (
              <div key={source} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-blue-500">
                    {sources.find(s => s.value === source)?.icon && 
                      <sources.find(s => s.value === source).icon className="h-5 w-5" />
                    }
                  </div>
                  <div>
                    <div className="text-white font-medium">{sources.find(s => s.value === source)?.label || source}</div>
                    <div className="text-gray-400 text-sm">{data.count} items</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getSentimentColor(data.sentiment)}`}>
                    {getSentimentLabel(data.sentiment)}
                  </div>
                  <div className="text-gray-400 text-sm">{(data.sentiment).toFixed(3)}</div>
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
          {/* Sentiment Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Sentiment Timeline */}
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Sentiment Timeline</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={sentimentData.timeline || []}>
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
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.3}
                      name="Overall Sentiment"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="news" 
                      stroke="#10b981" 
                      fill="#10b981" 
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

              {/* Sentiment Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Total Mentions</h4>
                  <div className="text-2xl font-bold text-white">
                    {sentimentData.totalMentions || 0}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Positive Mentions</h4>
                  <div className="text-2xl font-bold text-green-500">
                    {sentimentData.positiveMentions || 0}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Negative Mentions</h4>
                  <div className="text-2xl font-bold text-red-500">
                    {sentimentData.negativeMentions || 0}
                  </div>
                </div>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h4 className="text-gray-400 text-sm mb-2">Neutral Mentions</h4>
                  <div className="text-2xl font-bold text-yellow-500">
                    {sentimentData.neutralMentions || 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* News Analysis Tab */}
          {activeTab === 'news' && (
            <div className="space-y-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent News Sentiment</h3>
                <div className="space-y-4">
                  {newsSentiment.map((article, index) => (
                    <div key={index} className="p-4 bg-gray-600 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-medium mb-2">{article.title}</h4>
                          <p className="text-gray-300 text-sm mb-2">{article.summary}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>{article.source}</span>
                            <span>•</span>
                            <span>{article.publishedAt}</span>
                            <span>•</span>
                            <span className={`${getSentimentColor(article.sentiment)}`}>
                              {getSentimentLabel(article.sentiment)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className={`text-lg font-bold ${getSentimentColor(article.sentiment)}`}>
                            {(article.sentiment).toFixed(3)}
                          </div>
                          <div className="text-xs text-gray-400">Sentiment Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Social Media Sentiment</h3>
                <div className="space-y-4">
                  {socialSentiment.map((post, index) => (
                    <div key={index} className="p-4 bg-gray-600 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="text-blue-500">
                              {post.platform === 'twitter' && <Twitter className="h-4 w-4" />}
                              {post.platform === 'reddit' && <MessageSquare className="h-4 w-4" />}
                              {post.platform === 'facebook' && <Facebook className="h-4 w-4" />}
                            </div>
                            <span className="text-white font-medium">{post.author}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-400 text-sm">{post.timestamp}</span>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{post.content}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {post.likes}
                            </span>
                            <span className="flex items-center">
                              <Share2 className="h-3 w-3 mr-1" />
                              {post.shares}
                            </span>
                            <span className={`${getSentimentColor(post.sentiment)}`}>
                              {getSentimentLabel(post.sentiment)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          <div className={`text-lg font-bold ${getSentimentColor(post.sentiment)}`}>
                            {(post.sentiment).toFixed(3)}
                          </div>
                          <div className="text-xs text-gray-400">Sentiment Score</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Trending Topics Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Trending Keywords</h3>
                  <div className="space-y-3">
                    {sentimentData.trendingKeywords && sentimentData.trendingKeywords.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-blue-500" />
                          <span className="text-white font-medium">{keyword.term}</span>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getSentimentColor(keyword.sentiment)}`}>
                            {getSentimentLabel(keyword.sentiment)}
                          </div>
                          <div className="text-xs text-gray-400">{keyword.mentions} mentions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Trending Hashtags</h3>
                  <div className="space-y-3">
                    {sentimentData.trendingHashtags && sentimentData.trendingHashtags.map((hashtag, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Hash className="h-4 w-4 text-purple-500" />
                          <span className="text-white font-medium">#{hashtag.term}</span>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${getSentimentColor(hashtag.sentiment)}`}>
                            {getSentimentLabel(hashtag.sentiment)}
                          </div>
                          <div className="text-xs text-gray-400">{hashtag.mentions} mentions</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Sentiment by Topic</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sentimentData.topicSentiment || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="topic" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="sentiment" fill="#3b82f6" name="Sentiment Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Sentiment Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              <div className="bg-gray-700 border border-gray-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Sentiment Alerts</h3>
                <div className="space-y-4">
                  {sentimentData.alerts && sentimentData.alerts.map((alert, index) => (
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

export default SentimentAnalysis;
