import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Copy, 
  Star,
  MessageCircle,
  Share2,
  Filter,
  Search,
  Trophy,
  Target,
  DollarSign,
  Percent,
  Activity,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';
import CopyTradingSettings from './CopyTradingSettings';

const SocialTrading = () => {
  const [traders, setTraders] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [socialFeed, setSocialFeed] = useState([]);
  const [copyTrades, setCopyTrades] = useState([]);
  const [selectedTrader, setSelectedTrader] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedTraderForSettings, setSelectedTraderForSettings] = useState(null);
  const { socket, isConnected } = useSocket();

  const filters = [
    { id: 'all', label: 'All Traders', icon: Users },
    { id: 'top', label: 'Top Performers', icon: Trophy },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'verified', label: 'Verified', icon: CheckCircle },
    { id: 'copying', label: 'Copying', icon: Copy }
  ];

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load traders
    socket.emit('getTraders');
    socket.once('tradersData', (data) => {
      setTraders(data);
    });

    // Load leaderboard
    socket.emit('getLeaderboard');
    socket.once('leaderboardData', (data) => {
      setLeaderboard(data);
    });

    // Load social feed
    socket.emit('getSocialFeed');
    socket.once('socialFeedData', (data) => {
      setSocialFeed(data);
    });

    // Load copy trades
    socket.emit('getCopyTrades');
    socket.once('copyTradesData', (data) => {
      setCopyTrades(data);
    });

    setIsLoading(false);

    return () => {
      socket.off('tradersData');
      socket.off('leaderboardData');
      socket.off('socialFeedData');
      socket.off('copyTradesData');
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

  const getPerformanceColor = (value) => {
    if (value >= 0) return 'text-green-500';
    return 'text-red-500';
  };

  const getRiskLevel = (riskScore) => {
    if (riskScore < 0.3) return { level: 'Low', color: 'text-green-500', bg: 'bg-green-500' };
    if (riskScore < 0.6) return { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { level: 'High', color: 'text-red-500', bg: 'bg-red-500' };
  };

  const startCopyTrading = (traderId) => {
    socket.emit('startCopyTrading', { traderId });
    socket.once('copyTradingResult', (result) => {
      if (result.success) {
        toast.success(`Started copying ${result.traderName}`);
        // Update traders list to show copying status
        setTraders(prev => 
          prev.map(trader => 
            trader.id === traderId 
              ? { ...trader, isCopying: true, copySettings: result.settings }
              : trader
          )
        );
      } else {
        toast.error(result.error || 'Failed to start copy trading');
      }
    });
  };

  const stopCopyTrading = (traderId) => {
    socket.emit('stopCopyTrading', { traderId });
    socket.once('stopCopyTradingResult', (result) => {
      if (result.success) {
        toast.success(`Stopped copying ${result.traderName}`);
        setTraders(prev => 
          prev.map(trader => 
            trader.id === traderId 
              ? { ...trader, isCopying: false, copySettings: null }
              : trader
          )
        );
      } else {
        toast.error(result.error || 'Failed to stop copy trading');
      }
    });
  };

  const followTrader = (traderId) => {
    socket.emit('followTrader', { traderId });
    socket.once('followTraderResult', (result) => {
      if (result.success) {
        toast.success(`Started following ${result.traderName}`);
        setTraders(prev => 
          prev.map(trader => 
            trader.id === traderId 
              ? { ...trader, isFollowing: true }
              : trader
          )
        );
      } else {
        toast.error(result.error || 'Failed to follow trader');
      }
    });
  };

  const unfollowTrader = (traderId) => {
    socket.emit('unfollowTrader', { traderId });
    socket.once('unfollowTraderResult', (result) => {
      if (result.success) {
        toast.success(`Unfollowed ${result.traderName}`);
        setTraders(prev => 
          prev.map(trader => 
            trader.id === traderId 
              ? { ...trader, isFollowing: false }
              : trader
          )
        );
      } else {
        toast.error(result.error || 'Failed to unfollow trader');
      }
    });
  };

  const handleOpenSettings = (trader) => {
    setSelectedTraderForSettings(trader);
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
    setSelectedTraderForSettings(null);
  };

  const handleSaveSettings = (settings) => {
    toast.success('Copy trading settings updated');
    // Refresh data if needed
  };

  const filteredTraders = traders.filter(trader => {
    const matchesFilter = filter === 'all' || 
      (filter === 'top' && trader.performance > 10) ||
      (filter === 'trending' && trader.trending) ||
      (filter === 'verified' && trader.verified) ||
      (filter === 'copying' && trader.isCopying);
    
    const matchesSearch = trader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trader.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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
          <h1 className="text-2xl font-bold text-white">Social Trading</h1>
          <p className="text-gray-400">Connect with top traders and copy their strategies</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            My Strategy
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Active Traders</h4>
            <Users className="h-5 w-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-white">{traders.length}</div>
          <div className="text-sm text-gray-400 mt-1">+12% this week</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Copy Trades</h4>
            <Copy className="h-5 w-5 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-white">{copyTrades.length}</div>
          <div className="text-sm text-gray-400 mt-1">Active copies</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Avg Performance</h4>
            <TrendingUp className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-green-500">+8.5%</div>
          <div className="text-sm text-gray-400 mt-1">This month</div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-gray-400 text-sm">Community</h4>
            <MessageCircle className="h-5 w-5 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-white">1,247</div>
          <div className="text-sm text-gray-400 mt-1">Active members</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Traders List */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">Top Traders</h3>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search traders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {filters.map(filterOption => (
                    <option key={filterOption.id} value={filterOption.id}>
                      {filterOption.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredTraders.map((trader, index) => (
                <div key={trader.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {trader.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {trader.verified && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-white">{trader.name}</h4>
                          {trader.trending && (
                            <span className="px-2 py-1 bg-orange-900 text-orange-300 text-xs rounded">Trending</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">@{trader.username}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-400">{trader.followers} followers</span>
                          <span className="text-sm text-gray-400">{trader.copiers} copiers</span>
                          <span className={`text-sm ${getPerformanceColor(trader.performance)}`}>
                            {formatPercentage(trader.performance)} this month
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {trader.isCopying ? (
                        <button
                          onClick={() => stopCopyTrading(trader.id)}
                          className="flex items-center px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Stop Copy
                        </button>
                      ) : (
                        <button
                          onClick={() => startCopyTrading(trader.id)}
                          className="flex items-center px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </button>
                      )}
                      
                      {trader.isFollowing ? (
                        <button
                          onClick={() => unfollowTrader(trader.id)}
                          className="flex items-center px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors"
                        >
                          <EyeOff className="h-3 w-3 mr-1" />
                          Unfollow
                        </button>
                      ) : (
                        <button
                          onClick={() => followTrader(trader.id)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Follow
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenSettings(trader)}
                        className="flex items-center px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                        title="Copy Trading Settings"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Settings
                      </button>
                    </div>
                  </div>

                  {/* Trader Stats */}
                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-600">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Win Rate</div>
                      <div className="text-lg font-semibold text-white">{formatPercentage(trader.winRate)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Total Trades</div>
                      <div className="text-lg font-semibold text-white">{trader.totalTrades}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Risk Level</div>
                      <div className={`text-lg font-semibold ${getRiskLevel(trader.riskScore).color}`}>
                        {getRiskLevel(trader.riskScore).level}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Avg Trade</div>
                      <div className="text-lg font-semibold text-white">{formatCurrency(trader.avgTrade)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard & Social Feed */}
        <div className="space-y-6">
          {/* Leaderboard */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((trader, index) => (
                <div key={trader.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{trader.name}</div>
                      <div className="text-sm text-gray-400">{formatPercentage(trader.performance)}</div>
                    </div>
                  </div>
                  <div className={`font-semibold ${getPerformanceColor(trader.performance)}`}>
                    {formatCurrency(trader.totalPnL)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Feed */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Social Feed</h3>
            <div className="space-y-4">
              {socialFeed.slice(0, 5).map((post) => (
                <div key={post.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {post.author.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-white">{post.author}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-400">{post.timeAgo}</span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{post.content}</p>
                      
                      {post.trade && (
                        <div className="bg-gray-600 rounded p-3 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">{post.trade.symbol}</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              post.trade.type === 'BUY' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-red-900 text-red-300'
                            }`}>
                              {post.trade.type}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {formatCurrency(post.trade.pnl)} • {formatPercentage(post.trade.pnlPercent)}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <button className="flex items-center space-x-1 hover:text-white transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-white transition-colors">
                          <Share2 className="h-4 w-4" />
                          <span>Share</span>
                        </button>
                        <button className="flex items-center space-x-1 hover:text-white transition-colors">
                          <Star className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copy Trading Performance */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Copy Trading Performance</h3>
        
        {copyTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Trader</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Copied Trades</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Total P&L</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Win Rate</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {copyTrades.map((copy) => (
                  <tr key={copy.id} className="border-b border-gray-700 hover:bg-gray-700">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {copy.traderName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-white">{copy.traderName}</div>
                          <div className="text-sm text-gray-400">Started {copy.startDate}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        copy.status === 'active' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {copy.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white">{copy.copiedTrades}</td>
                    <td className={`py-3 px-4 font-medium ${getPerformanceColor(copy.totalPnL)}`}>
                      {formatCurrency(copy.totalPnL)}
                    </td>
                    <td className="py-3 px-4 text-white">{formatPercentage(copy.winRate)}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => stopCopyTrading(copy.traderId)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                        >
                          Stop
                        </button>
                        <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-500 transition-colors">
                          Settings
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active copy trades</p>
            <p className="text-sm">Start copying traders to see your performance here</p>
          </div>
        )}
      </div>

      {/* Copy Trading Settings Modal */}
      {showSettings && selectedTraderForSettings && (
        <CopyTradingSettings
          traderId={selectedTraderForSettings.id}
          onClose={handleCloseSettings}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};

export default SocialTrading;
