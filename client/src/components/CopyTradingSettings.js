import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  Settings, 
  DollarSign, 
  Percent, 
  Shield, 
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

const CopyTradingSettings = ({ traderId, onClose, onSave }) => {
  const [settings, setSettings] = useState({
    maxInvestment: 1000,
    riskPercentage: 2,
    maxOpenTrades: 5,
    copyPercentage: 100,
    stopLoss: 5,
    takeProfit: 10,
    autoClose: true,
    copyOnlyWinning: false,
    excludeSymbols: [],
    includeSymbols: [],
    maxDailyLoss: 50,
    maxWeeklyLoss: 200,
    copyDelay: 0,
    reverseSignals: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load existing settings for this trader
    socket.emit('getCopyTradingSettings', { traderId });
    socket.once('copyTradingSettingsData', (data) => {
      if (data) {
        setSettings(data);
      }
    });
  }, [socket, isConnected, traderId]);

  const validateSettings = () => {
    const errors = {};

    if (settings.maxInvestment <= 0) {
      errors.maxInvestment = 'Maximum investment must be greater than 0';
    }

    if (settings.riskPercentage <= 0 || settings.riskPercentage > 10) {
      errors.riskPercentage = 'Risk percentage must be between 0.1% and 10%';
    }

    if (settings.maxOpenTrades <= 0 || settings.maxOpenTrades > 20) {
      errors.maxOpenTrades = 'Maximum open trades must be between 1 and 20';
    }

    if (settings.copyPercentage <= 0 || settings.copyPercentage > 100) {
      errors.copyPercentage = 'Copy percentage must be between 1% and 100%';
    }

    if (settings.stopLoss <= 0) {
      errors.stopLoss = 'Stop loss must be greater than 0';
    }

    if (settings.takeProfit <= 0) {
      errors.takeProfit = 'Take profit must be greater than 0';
    }

    if (settings.maxDailyLoss <= 0) {
      errors.maxDailyLoss = 'Maximum daily loss must be greater than 0';
    }

    if (settings.maxWeeklyLoss <= 0) {
      errors.maxWeeklyLoss = 'Maximum weekly loss must be greater than 0';
    }

    if (settings.copyDelay < 0 || settings.copyDelay > 60) {
      errors.copyDelay = 'Copy delay must be between 0 and 60 seconds';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!validateSettings()) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsLoading(true);

    try {
      socket.emit('updateCopyTradingSettings', { traderId, settings });
      socket.once('updateCopyTradingSettingsResult', (result) => {
        if (result.success) {
          toast.success('Copy trading settings updated successfully');
          onSave && onSave(settings);
          onClose && onClose();
        } else {
          toast.error(result.error || 'Failed to update settings');
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings({
      maxInvestment: 1000,
      riskPercentage: 2,
      maxOpenTrades: 5,
      copyPercentage: 100,
      stopLoss: 5,
      takeProfit: 10,
      autoClose: true,
      copyOnlyWinning: false,
      excludeSymbols: [],
      includeSymbols: [],
      maxDailyLoss: 50,
      maxWeeklyLoss: 200,
      copyDelay: 0,
      reverseSignals: false
    });
    setValidationErrors({});
    toast.success('Settings reset to defaults');
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const addSymbol = (field, symbol) => {
    if (symbol && !settings[field].includes(symbol.toUpperCase())) {
      setSettings(prev => ({
        ...prev,
        [field]: [...prev[field], symbol.toUpperCase()]
      }));
    }
  };

  const removeSymbol = (field, symbol) => {
    setSettings(prev => ({
      ...prev,
      [field]: prev[field].filter(s => s !== symbol)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Copy Trading Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Investment Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
              Investment Settings
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Investment (USD)
              </label>
              <input
                type="number"
                value={settings.maxInvestment}
                onChange={(e) => handleInputChange('maxInvestment', parseFloat(e.target.value))}
                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.maxInvestment ? 'border-red-500' : 'border-gray-600'
                }`}
                min="1"
                step="100"
              />
              {validationErrors.maxInvestment && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.maxInvestment}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Risk Percentage per Trade (%)
              </label>
              <input
                type="number"
                value={settings.riskPercentage}
                onChange={(e) => handleInputChange('riskPercentage', parseFloat(e.target.value))}
                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.riskPercentage ? 'border-red-500' : 'border-gray-600'
                }`}
                min="0.1"
                max="10"
                step="0.1"
              />
              {validationErrors.riskPercentage && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.riskPercentage}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Copy Percentage (%)
              </label>
              <input
                type="number"
                value={settings.copyPercentage}
                onChange={(e) => handleInputChange('copyPercentage', parseFloat(e.target.value))}
                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.copyPercentage ? 'border-red-500' : 'border-gray-600'
                }`}
                min="1"
                max="100"
                step="1"
              />
              {validationErrors.copyPercentage && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.copyPercentage}</p>
              )}
            </div>
          </div>

          {/* Risk Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Shield className="h-5 w-5 mr-2 text-green-500" />
              Risk Management
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Open Trades
              </label>
              <input
                type="number"
                value={settings.maxOpenTrades}
                onChange={(e) => handleInputChange('maxOpenTrades', parseInt(e.target.value))}
                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.maxOpenTrades ? 'border-red-500' : 'border-gray-600'
                }`}
                min="1"
                max="20"
              />
              {validationErrors.maxOpenTrades && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.maxOpenTrades}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stop Loss (Pips)
              </label>
              <input
                type="number"
                value={settings.stopLoss}
                onChange={(e) => handleInputChange('stopLoss', parseFloat(e.target.value))}
                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.stopLoss ? 'border-red-500' : 'border-gray-600'
                }`}
                min="1"
                step="1"
              />
              {validationErrors.stopLoss && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.stopLoss}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Take Profit (Pips)
              </label>
              <input
                type="number"
                value={settings.takeProfit}
                onChange={(e) => handleInputChange('takeProfit', parseFloat(e.target.value))}
                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.takeProfit ? 'border-red-500' : 'border-gray-600'
                }`}
                min="1"
                step="1"
              />
              {validationErrors.takeProfit && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.takeProfit}</p>
              )}
            </div>
          </div>

          {/* Loss Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
              Loss Limits
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Daily Loss (USD)
              </label>
              <input
                type="number"
                value={settings.maxDailyLoss}
                onChange={(e) => handleInputChange('maxDailyLoss', parseFloat(e.target.value))}
                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.maxDailyLoss ? 'border-red-500' : 'border-gray-600'
                }`}
                min="1"
                step="10"
              />
              {validationErrors.maxDailyLoss && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.maxDailyLoss}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maximum Weekly Loss (USD)
              </label>
              <input
                type="number"
                value={settings.maxWeeklyLoss}
                onChange={(e) => handleInputChange('maxWeeklyLoss', parseFloat(e.target.value))}
                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.maxWeeklyLoss ? 'border-red-500' : 'border-gray-600'
                }`}
                min="1"
                step="10"
              />
              {validationErrors.maxWeeklyLoss && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.maxWeeklyLoss}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Copy Delay (Seconds)
              </label>
              <input
                type="number"
                value={settings.copyDelay}
                onChange={(e) => handleInputChange('copyDelay', parseInt(e.target.value))}
                className={`w-full bg-gray-700 border rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.copyDelay ? 'border-red-500' : 'border-gray-600'
                }`}
                min="0"
                max="60"
              />
              {validationErrors.copyDelay && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.copyDelay}</p>
              )}
            </div>
          </div>

          {/* Trading Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-500" />
              Trading Options
            </h3>

            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.autoClose}
                  onChange={(e) => handleInputChange('autoClose', e.target.checked)}
                  className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300">Auto-close positions when trader closes</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.copyOnlyWinning}
                  onChange={(e) => handleInputChange('copyOnlyWinning', e.target.checked)}
                  className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300">Copy only winning trades</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.reverseSignals}
                  onChange={(e) => handleInputChange('reverseSignals', e.target.checked)}
                  className="mr-3 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-gray-300">Reverse signals (contrarian strategy)</span>
              </label>
            </div>

            {/* Symbol Filters */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Include Symbols (leave empty for all)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g., EURUSD"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSymbol('includeSymbols', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      addSymbol('includeSymbols', input.value);
                      input.value = '';
                    }}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.includeSymbols.map(symbol => (
                    <span
                      key={symbol}
                      className="px-2 py-1 bg-green-900 text-green-300 rounded text-sm flex items-center"
                    >
                      {symbol}
                      <button
                        onClick={() => removeSymbol('includeSymbols', symbol)}
                        className="ml-1 text-green-300 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Exclude Symbols
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="e.g., GBPUSD"
                    className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addSymbol('excludeSymbols', e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.target.previousElementSibling;
                      addSymbol('excludeSymbols', input.value);
                      input.value = '';
                    }}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.excludeSymbols.map(symbol => (
                    <span
                      key={symbol}
                      className="px-2 py-1 bg-red-900 text-red-300 rounded text-sm flex items-center"
                    >
                      {symbol}
                      <button
                        onClick={() => removeSymbol('excludeSymbols', symbol)}
                        className="ml-1 text-red-300 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-700">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyTradingSettings;
