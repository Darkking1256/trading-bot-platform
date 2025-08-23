import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import {
  Play,
  Square,
  Settings,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Download,
  Upload,
  Save,
  RotateCcw
} from 'lucide-react';

const AlgorithmicTrading = () => {
  const socket = useSocket();
  const [activeStrategies, setActiveStrategies] = useState([]);
  const [availableStrategies, setAvailableStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [performance, setPerformance] = useState({});
  const [signals, setSignals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (!socket) return;

    // Load available strategies
    socket.emit('getAvailableStrategies');
    socket.on('availableStrategies', setAvailableStrategies);

    // Load active strategies
    socket.emit('getActiveStrategies');
    socket.on('activeStrategies', setActiveStrategies);

    // Listen for performance updates
    socket.on('strategyPerformance', (data) => {
      setPerformance(prev => ({ ...prev, [data.strategyId]: data.performance }));
    });

    // Listen for signals
    socket.on('signal', (data) => {
      setSignals(prev => [data.signal, ...prev.slice(0, 49)]); // Keep last 50 signals
    });

    // Listen for orders
    socket.on('order', (data) => {
      setOrders(prev => [data.order, ...prev.slice(0, 49)]); // Keep last 50 orders
    });

    // Listen for engine status
    socket.on('engineStatus', (data) => {
      setIsEngineRunning(data.isRunning);
    });

    return () => {
      socket.off('availableStrategies');
      socket.off('activeStrategies');
      socket.off('strategyPerformance');
      socket.off('signal');
      socket.off('order');
      socket.off('engineStatus');
    };
  }, [socket]);

  const startEngine = () => {
    socket?.emit('startEngine');
  };

  const stopEngine = () => {
    socket?.emit('stopEngine');
  };

  const createStrategy = (strategyName, config) => {
    socket?.emit('createStrategy', { strategyName, config });
  };

  const startStrategy = (strategyId) => {
    socket?.emit('startStrategy', { strategyId });
  };

  const stopStrategy = (strategyId) => {
    socket?.emit('stopStrategy', { strategyId });
  };

  const deleteStrategy = (strategyId) => {
    socket?.emit('deleteStrategy', { strategyId });
  };

  const getOverallPerformance = () => {
    const totalPnL = Object.values(performance).reduce((sum, perf) => sum + (perf.totalPnL || 0), 0);
    const totalTrades = Object.values(performance).reduce((sum, perf) => sum + (perf.totalTrades || 0), 0);
    const winningTrades = Object.values(performance).reduce((sum, perf) => sum + (perf.winningTrades || 0), 0);
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    return { totalPnL, totalTrades, winRate };
  };

  const overallPerformance = getOverallPerformance();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Algorithmic Trading</h1>
                <p className="text-gray-400 mt-2">
                  Automated trading strategies with real-time execution
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {isEngineRunning ? (
                  <button
                    onClick={stopEngine}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Stop Engine
                  </button>
                ) : (
                  <button
                    onClick={startEngine}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Engine
                  </button>
                )}
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Strategy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm">Total P&L</h4>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className={`text-2xl font-bold ${overallPerformance.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${overallPerformance.totalPnL.toFixed(2)}
            </div>
            <div className="text-sm text-gray-400 mt-1">All strategies</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm">Win Rate</h4>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {overallPerformance.winRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-400 mt-1">Success rate</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm">Total Trades</h4>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {overallPerformance.totalTrades}
            </div>
            <div className="text-sm text-gray-400 mt-1">All time</div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-gray-400 text-sm">Active Strategies</h4>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-white">
              {activeStrategies.filter(s => s.isActive).length}
            </div>
            <div className="text-sm text-gray-400 mt-1">Running</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Strategies */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
              <div className="border-b border-gray-700 px-6 py-4">
                <h2 className="text-lg font-semibold">Active Strategies</h2>
              </div>
              <div className="p-6">
                {activeStrategies.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">No strategies created yet</p>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Strategy
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeStrategies.map((strategy) => (
                      <StrategyCard
                        key={strategy.id}
                        strategy={strategy}
                        performance={performance[strategy.id]}
                        onStart={() => startStrategy(strategy.id)}
                        onStop={() => stopStrategy(strategy.id)}
                        onDelete={() => deleteStrategy(strategy.id)}
                        onEdit={() => setSelectedStrategy(strategy)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            {/* Recent Signals */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
              <div className="border-b border-gray-700 px-6 py-4">
                <h3 className="text-lg font-semibold">Recent Signals</h3>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {signals.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No signals yet</p>
                ) : (
                  <div className="space-y-3">
                    {signals.slice(0, 10).map((signal) => (
                      <SignalItem key={signal.id} signal={signal} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg">
              <div className="border-b border-gray-700 px-6 py-4">
                <h3 className="text-lg font-semibold">Recent Orders</h3>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {orders.length === 0 ? (
                  <p className="text-gray-400 text-center py-4">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 10).map((order) => (
                      <OrderItem key={order.id} order={order} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategy Creation Modal */}
      {isCreating && (
        <StrategyCreationModal
          availableStrategies={availableStrategies}
          onClose={() => setIsCreating(false)}
          onCreate={createStrategy}
        />
      )}

      {/* Strategy Edit Modal */}
      {selectedStrategy && (
        <StrategyEditModal
          strategy={selectedStrategy}
          onClose={() => setSelectedStrategy(null)}
          onUpdate={(config) => {
            socket?.emit('updateStrategy', { strategyId: selectedStrategy.id, config });
            setSelectedStrategy(null);
          }}
        />
      )}
    </div>
  );
};

// Strategy Card Component
const StrategyCard = ({ strategy, performance, onStart, onStop, onDelete, onEdit }) => {
  const perf = performance || {};
  
  return (
    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{strategy.name}</h3>
          <p className="text-gray-400 text-sm">{strategy.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-400 text-sm">Status</p>
          <div className="flex items-center mt-1">
            {strategy.isActive ? (
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 mr-2" />
            )}
            <span className={strategy.isActive ? 'text-green-500' : 'text-red-500'}>
              {strategy.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <div>
          <p className="text-gray-400 text-sm">P&L</p>
          <p className={`font-semibold ${perf.totalPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            ${(perf.totalPnL || 0).toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Win Rate</p>
          <p className="font-semibold">{(perf.winRate || 0).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-gray-400 text-sm">Trades</p>
          <p className="font-semibold">{perf.totalTrades || 0}</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {strategy.isActive ? (
          <button
            onClick={onStop}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <Play className="h-4 w-4 mr-2" />
            Start
          </button>
        )}
      </div>
    </div>
  );
};

// Signal Item Component
const SignalItem = ({ signal }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
      <div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            signal.type === 'BUY' ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
          }`}>
            {signal.type}
          </span>
          <span className="font-medium">{signal.symbol}</span>
        </div>
        <p className="text-gray-400 text-sm mt-1">{signal.reason}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">${signal.price}</p>
        <p className="text-gray-400 text-sm">{(signal.confidence * 100).toFixed(0)}%</p>
      </div>
    </div>
  );
};

// Order Item Component
const OrderItem = ({ order }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
      <div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            order.type === 'BUY' ? 'bg-green-600 text-green-100' : 'bg-red-600 text-red-100'
          }`}>
            {order.type}
          </span>
          <span className="font-medium">{order.symbol}</span>
        </div>
        <p className="text-gray-400 text-sm mt-1">Lot: {order.lotSize}</p>
      </div>
      <div className="text-right">
        <p className="font-medium">${order.price}</p>
        <p className="text-gray-400 text-sm">{order.status}</p>
      </div>
    </div>
  );
};

// Strategy Creation Modal
const StrategyCreationModal = ({ availableStrategies, onClose, onCreate }) => {
  const [selectedStrategy, setSelectedStrategy] = useState('');
  const [config, setConfig] = useState({});

  const handleCreate = () => {
    if (!selectedStrategy) return;
    onCreate(selectedStrategy, config);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Create New Strategy</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Strategy Type
            </label>
            <select
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Select a strategy</option>
              {availableStrategies.map((strategy) => (
                <option key={strategy.name} value={strategy.name}>
                  {strategy.name}
                </option>
              ))}
            </select>
          </div>

          {selectedStrategy && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Symbols
              </label>
              <input
                type="text"
                placeholder="EURUSD,GBPUSD"
                value={config.symbols || ''}
                onChange={(e) => setConfig(prev => ({ ...prev, symbols: e.target.value.split(',') }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              />
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedStrategy}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

// Strategy Edit Modal
const StrategyEditModal = ({ strategy, onClose, onUpdate }) => {
  const [config, setConfig] = useState(strategy.config || {});

  const handleUpdate = () => {
    onUpdate(config);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Strategy</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lot Size
            </label>
            <input
              type="number"
              step="0.01"
              value={config.lotSize || 0.1}
              onChange={(e) => setConfig(prev => ({ ...prev, lotSize: parseFloat(e.target.value) }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stop Loss (pips)
            </label>
            <input
              type="number"
              value={config.stopLoss || 50}
              onChange={(e) => setConfig(prev => ({ ...prev, stopLoss: parseInt(e.target.value) }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Take Profit (pips)
            </label>
            <input
              type="number"
              value={config.takeProfit || 100}
              onChange={(e) => setConfig(prev => ({ ...prev, takeProfit: parseInt(e.target.value) }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmicTrading;
