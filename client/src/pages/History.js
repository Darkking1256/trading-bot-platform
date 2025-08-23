import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Filter, Download } from 'lucide-react';

const History = () => {
  const [tradeHistory, setTradeHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    symbol: 'ALL',
    type: 'ALL',
    dateRange: '30D'
  });
  const { socket, isConnected } = useSocket();

  const symbols = ['ALL', 'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD', 'USDCAD', 'NZDUSD'];
  const dateRanges = [
    { label: 'Last 7 Days', value: '7D' },
    { label: 'Last 30 Days', value: '30D' },
    { label: 'Last 90 Days', value: '90D' },
    { label: 'Last Year', value: '1Y' },
    { label: 'All Time', value: 'ALL' }
  ];

  // Load trade history
  const loadTradeHistory = async () => {
    if (!socket || !isConnected) return;

    try {
      socket.emit('getTradeHistory', filter);
      socket.once('tradeHistoryData', (data) => {
        setTradeHistory(data);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error loading trade history:', error);
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadTradeHistory();
  }, [socket, isConnected, filter]);

  // Calculate performance metrics
  const calculateMetrics = () => {
    if (tradeHistory.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        averagePnL: 0,
        largestWin: 0,
        largestLoss: 0,
        averageWin: 0,
        averageLoss: 0,
        profitFactor: 0,
        maxDrawdown: 0
      };
    }

    const winningTrades = tradeHistory.filter(trade => trade.pnl > 0);
    const losingTrades = tradeHistory.filter(trade => trade.pnl < 0);
    const totalPnL = tradeHistory.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));

    return {
      totalTrades: tradeHistory.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: (winningTrades.length / tradeHistory.length) * 100,
      totalPnL: totalPnL,
      averagePnL: totalPnL / tradeHistory.length,
      largestWin: winningTrades.length > 0 ? Math.max(...winningTrades.map(t => t.pnl)) : 0,
      largestLoss: losingTrades.length > 0 ? Math.min(...losingTrades.map(t => t.pnl)) : 0,
      averageWin: winningTrades.length > 0 ? totalWins / winningTrades.length : 0,
      averageLoss: losingTrades.length > 0 ? totalLosses / losingTrades.length : 0,
      profitFactor: totalLosses > 0 ? totalWins / totalLosses : 0,
      maxDrawdown: calculateMaxDrawdown(tradeHistory)
    };
  };

  const calculateMaxDrawdown = (trades) => {
    let peak = 0;
    let maxDrawdown = 0;
    let runningTotal = 0;

    trades.forEach(trade => {
      runningTotal += trade.pnl;
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return maxDrawdown;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatPrice = (price) => {
    return price.toFixed(5);
  };

  const getPnlColor = (pnl) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-300';
  };

  const getPnlIcon = (pnl) => {
    if (pnl > 0) return <TrendingUp size={16} className="text-green-400" />;
    if (pnl < 0) return <TrendingDown size={16} className="text-red-400" />;
    return <DollarSign size={16} className="text-gray-400" />;
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Trading History</h1>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          <Download size={16} />
          <span>Export</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Filters:</span>
          </div>
          
          <select
            value={filter.symbol}
            onChange={(e) => setFilter({ ...filter, symbol: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
          >
            {symbols.map(symbol => (
              <option key={symbol} value={symbol}>{symbol}</option>
            ))}
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
          >
            <option value="ALL">All Types</option>
            <option value="BUY">Buy</option>
            <option value="SELL">Sell</option>
          </select>

          <select
            value={filter.dateRange}
            onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
            className="bg-gray-700 border border-gray-600 rounded px-3 py-1 text-white text-sm"
          >
            {dateRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total P&L</p>
              <p className={`text-xl font-bold ${getPnlColor(metrics.totalPnL)}`}>
                {formatCurrency(metrics.totalPnL)}
              </p>
            </div>
            {getPnlIcon(metrics.totalPnL)}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Win Rate</p>
              <p className="text-xl font-bold text-white">
                {metrics.winRate.toFixed(1)}%
              </p>
            </div>
            <div className="text-sm text-gray-400">
              {metrics.winningTrades}/{metrics.totalTrades}
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Profit Factor</p>
              <p className="text-xl font-bold text-white">
                {metrics.profitFactor.toFixed(2)}
              </p>
            </div>
            <TrendingUp size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Max Drawdown</p>
              <p className="text-xl font-bold text-red-400">
                {formatCurrency(metrics.maxDrawdown)}
              </p>
            </div>
            <TrendingDown size={20} className="text-red-400" />
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Trade Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Trades:</span>
              <span className="text-white">{metrics.totalTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Winning Trades:</span>
              <span className="text-green-400">{metrics.winningTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Losing Trades:</span>
              <span className="text-red-400">{metrics.losingTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average P&L:</span>
              <span className={`${getPnlColor(metrics.averagePnL)}`}>
                {formatCurrency(metrics.averagePnL)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Win:</span>
              <span className="text-green-400">{formatCurrency(metrics.averageWin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Loss:</span>
              <span className="text-red-400">{formatCurrency(metrics.averageLoss)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Performance Highlights</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Largest Win:</span>
              <span className="text-green-400">{formatCurrency(metrics.largestWin)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Largest Loss:</span>
              <span className="text-red-400">{formatCurrency(metrics.largestLoss)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Best Day:</span>
              <span className="text-green-400">$1,250.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Worst Day:</span>
              <span className="text-red-400">-$850.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Consecutive Wins:</span>
              <span className="text-green-400">8</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Consecutive Losses:</span>
              <span className="text-red-400">3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trade History Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Trade History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Open Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Close Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {tradeHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                    No trades found
                  </td>
                </tr>
              ) : (
                tradeHistory.map((trade) => (
                  <tr key={trade.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatTime(trade.closeTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{trade.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trade.type === 'BUY' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {trade.volume}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatPrice(trade.openPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatPrice(trade.closePrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getPnlIcon(trade.pnl)}
                        <span className={`text-sm font-medium ${getPnlColor(trade.pnl)}`}>
                          {formatCurrency(trade.pnl)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {Math.round((trade.closeTime - trade.openTime) / 1000 / 60)}m
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
