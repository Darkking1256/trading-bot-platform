import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Edit, X, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Positions = () => {
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPosition, setEditingPosition] = useState(null);
  const [editForm, setEditForm] = useState({
    stopLoss: '',
    takeProfit: ''
  });
  const { socket, isConnected } = useSocket();

  // Load positions
  const loadPositions = async () => {
    if (!socket || !isConnected) return;

    try {
      socket.emit('getPositions');
      socket.once('positionsData', (data) => {
        setPositions(data);
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error loading positions:', error);
      setIsLoading(false);
    }
  };

  // Subscribe to position updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    loadPositions();

    socket.on('positionUpdate', (updatedPositions) => {
      setPositions(updatedPositions);
    });

    return () => {
      socket.off('positionUpdate');
    };
  }, [socket, isConnected]);

  // Handle position modification
  const handleModifyPosition = async (positionId) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    try {
      const modificationData = {
        positionId: positionId,
        stopLoss: editForm.stopLoss ? parseFloat(editForm.stopLoss) : null,
        takeProfit: editForm.takeProfit ? parseFloat(editForm.takeProfit) : null
      };

      socket.emit('modifyPosition', modificationData);

      socket.once('modifyResult', (result) => {
        if (result.success) {
          toast.success('Position modified successfully');
          setEditingPosition(null);
          setEditForm({ stopLoss: '', takeProfit: '' });
          loadPositions(); // Reload positions
        } else {
          toast.error(`Modification failed: ${result.error}`);
        }
      });
    } catch (error) {
      toast.error('Error modifying position');
      console.error('Modification error:', error);
    }
  };

  // Handle position closure
  const handleClosePosition = async (positionId) => {
    if (!socket || !isConnected) {
      toast.error('Not connected to server');
      return;
    }

    try {
      socket.emit('closePosition', { positionId });

      socket.once('closeResult', (result) => {
        if (result.success) {
          toast.success('Position closed successfully');
          loadPositions(); // Reload positions
        } else {
          toast.error(`Close failed: ${result.error}`);
        }
      });
    } catch (error) {
      toast.error('Error closing position');
      console.error('Close error:', error);
    }
  };

  const formatPrice = (price) => {
    return price.toFixed(5);
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

  const calculatePnlPercent = (pnl, volume, openPrice) => {
    const positionValue = volume * openPrice * 100000; // Standard lot size
    return ((pnl / positionValue) * 100).toFixed(2);
  };

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
        <h1 className="text-2xl font-bold text-white">Open Positions</h1>
        <div className="text-sm text-gray-400">
          {positions.length} position{positions.length !== 1 ? 's' : ''} open
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total P&L</p>
              <p className={`text-xl font-bold ${getPnlColor(positions.reduce((sum, pos) => sum + pos.pnl, 0))}`}>
                {formatCurrency(positions.reduce((sum, pos) => sum + pos.pnl, 0))}
              </p>
            </div>
            {getPnlIcon(positions.reduce((sum, pos) => sum + pos.pnl, 0))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Volume</p>
              <p className="text-xl font-bold text-white">
                {positions.reduce((sum, pos) => sum + pos.volume, 0).toFixed(2)}
              </p>
            </div>
            <DollarSign size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Largest Position</p>
              <p className="text-xl font-bold text-white">
                {positions.length > 0 ? Math.max(...positions.map(pos => pos.volume)).toFixed(2) : '0.00'}
              </p>
            </div>
            <TrendingUp size={20} className="text-gray-400" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Avg Duration</p>
              <p className="text-xl font-bold text-white">
                {positions.length > 0 
                  ? Math.round(positions.reduce((sum, pos) => sum + (Date.now() - pos.openTime), 0) / positions.length / 1000 / 60)
                  : 0}m
              </p>
            </div>
            <Clock size={20} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Positions Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
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
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Stop Loss
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Take Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Open Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {positions.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-8 text-center text-gray-400">
                    No open positions
                  </td>
                </tr>
              ) : (
                positions.map((position) => (
                  <tr key={position.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{position.symbol}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        position.type === 'BUY' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {position.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {position.volume}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatPrice(position.openPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatPrice(position.currentPrice)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getPnlIcon(position.pnl)}
                        <div>
                          <div className={`text-sm font-medium ${getPnlColor(position.pnl)}`}>
                            {formatCurrency(position.pnl)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {calculatePnlPercent(position.pnl, position.volume, position.openPrice)}%
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {position.stopLoss ? formatPrice(position.stopLoss) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {position.takeProfit ? formatPrice(position.takeProfit) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatTime(position.openTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingPosition(position.id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleClosePosition(position.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Position Modal */}
      {editingPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Modify Position</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Stop Loss
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={editForm.stopLoss}
                  onChange={(e) => setEditForm({ ...editForm, stopLoss: e.target.value })}
                  placeholder="Optional"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Take Profit
                </label>
                <input
                  type="number"
                  step="0.00001"
                  value={editForm.takeProfit}
                  onChange={(e) => setEditForm({ ...editForm, takeProfit: e.target.value })}
                  placeholder="Optional"
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleModifyPosition(editingPosition)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium"
                >
                  Modify
                </button>
                <button
                  onClick={() => {
                    setEditingPosition(null);
                    setEditForm({ stopLoss: '', takeProfit: '' });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;
