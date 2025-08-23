import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Settings,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import toast from 'react-hot-toast';

const TechnicalIndicators = ({ selectedSymbol, chartData }) => {
  const [indicators, setIndicators] = useState([]);
  const [indicatorData, setIndicatorData] = useState({});
  const [settings, setSettings] = useState({
    sma: { period: 20, enabled: true },
    ema: { period: 12, enabled: false },
    rsi: { period: 14, enabled: true, overbought: 70, oversold: 30 },
    macd: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, enabled: false },
    bollinger: { period: 20, stdDev: 2, enabled: false },
    stochastic: { kPeriod: 14, dPeriod: 3, enabled: false },
    atr: { period: 14, enabled: false },
    volume: { enabled: true }
  });
  const [signals, setSignals] = useState([]);
  const { socket, isConnected } = useSocket();

  const availableIndicators = [
    { id: 'sma', name: 'Simple Moving Average', type: 'overlay' },
    { id: 'ema', name: 'Exponential Moving Average', type: 'overlay' },
    { id: 'rsi', name: 'Relative Strength Index', type: 'separate' },
    { id: 'macd', name: 'MACD', type: 'separate' },
    { id: 'bollinger', name: 'Bollinger Bands', type: 'overlay' },
    { id: 'stochastic', name: 'Stochastic Oscillator', type: 'separate' },
    { id: 'atr', name: 'Average True Range', type: 'separate' },
    { id: 'volume', name: 'Volume', type: 'separate' }
  ];

  // Calculate SMA
  const calculateSMA = (data, period) => {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        sma.push(null);
      } else {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
        sma.push(sum / period);
      }
    }
    return sma;
  };

  // Calculate EMA
  const calculateEMA = (data, period) => {
    const ema = [];
    const multiplier = 2 / (period + 1);
    
    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        ema.push(data[i].close);
      } else {
        ema.push((data[i].close * multiplier) + (ema[i - 1] * (1 - multiplier)));
      }
    }
    return ema;
  };

  // Calculate RSI
  const calculateRSI = (data, period) => {
    const rsi = [];
    const gains = [];
    const losses = [];

    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }

    for (let i = 0; i < data.length; i++) {
      if (i < period) {
        rsi.push(null);
      } else {
        const avgGain = gains.slice(i - period, i).reduce((acc, val) => acc + val, 0) / period;
        const avgLoss = losses.slice(i - period, i).reduce((acc, val) => acc + val, 0) / period;
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    return rsi;
  };

  // Calculate MACD
  const calculateMACD = (data, fastPeriod, slowPeriod, signalPeriod) => {
    const ema12 = calculateEMA(data, fastPeriod);
    const ema26 = calculateEMA(data, slowPeriod);
    const macdLine = ema12.map((val, i) => val - ema26[i]);
    const signalLine = calculateEMA(macdLine.map(val => ({ close: val })), signalPeriod);
    const histogram = macdLine.map((val, i) => val - signalLine[i]);

    return { macdLine, signalLine, histogram };
  };

  // Calculate Bollinger Bands
  const calculateBollingerBands = (data, period, stdDev) => {
    const sma = calculateSMA(data, period);
    const upper = [];
    const lower = [];

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        upper.push(null);
        lower.push(null);
      } else {
        const slice = data.slice(i - period + 1, i + 1);
        const mean = sma[i];
        const variance = slice.reduce((acc, val) => acc + Math.pow(val.close - mean, 2), 0) / period;
        const standardDeviation = Math.sqrt(variance);
        
        upper.push(mean + (standardDeviation * stdDev));
        lower.push(mean - (standardDeviation * stdDev));
      }
    }

    return { upper, middle: sma, lower };
  };

  // Calculate Stochastic
  const calculateStochastic = (data, kPeriod, dPeriod) => {
    const k = [];
    const d = [];

    for (let i = 0; i < data.length; i++) {
      if (i < kPeriod - 1) {
        k.push(null);
      } else {
        const slice = data.slice(i - kPeriod + 1, i + 1);
        const highest = Math.max(...slice.map(val => val.high));
        const lowest = Math.min(...slice.map(val => val.low));
        const current = data[i].close;
        
        k.push(((current - lowest) / (highest - lowest)) * 100);
      }
    }

    // Calculate %D (SMA of %K)
    for (let i = 0; i < k.length; i++) {
      if (i < dPeriod - 1) {
        d.push(null);
      } else {
        const sum = k.slice(i - dPeriod + 1, i + 1).reduce((acc, val) => acc + val, 0);
        d.push(sum / dPeriod);
      }
    }

    return { k, d };
  };

  // Calculate ATR
  const calculateATR = (data, period) => {
    const tr = [];
    const atr = [];

    for (let i = 0; i < data.length; i++) {
      if (i === 0) {
        tr.push(data[i].high - data[i].low);
      } else {
        const highLow = data[i].high - data[i].low;
        const highClose = Math.abs(data[i].high - data[i - 1].close);
        const lowClose = Math.abs(data[i].low - data[i - 1].close);
        tr.push(Math.max(highLow, highClose, lowClose));
      }
    }

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        atr.push(null);
      } else {
        const sum = tr.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
        atr.push(sum / period);
      }
    }

    return atr;
  };

  // Generate trading signals
  const generateSignals = () => {
    const newSignals = [];
    const data = chartData;

    if (!data || data.length === 0) return;

    // RSI Signals
    if (settings.rsi.enabled && indicatorData.rsi) {
      const rsi = indicatorData.rsi;
      const currentRSI = rsi[rsi.length - 1];
      const previousRSI = rsi[rsi.length - 2];

      if (currentRSI < settings.rsi.oversold && previousRSI >= settings.rsi.oversold) {
        newSignals.push({
          type: 'BUY',
          indicator: 'RSI',
          strength: 'Strong',
          message: `RSI oversold (${currentRSI.toFixed(2)}) - Potential buy signal`,
          timestamp: new Date()
        });
      }

      if (currentRSI > settings.rsi.overbought && previousRSI <= settings.rsi.overbought) {
        newSignals.push({
          type: 'SELL',
          indicator: 'RSI',
          strength: 'Strong',
          message: `RSI overbought (${currentRSI.toFixed(2)}) - Potential sell signal`,
          timestamp: new Date()
        });
      }
    }

    // MACD Signals
    if (settings.macd.enabled && indicatorData.macd) {
      const { macdLine, signalLine } = indicatorData.macd;
      const currentMACD = macdLine[macdLine.length - 1];
      const currentSignal = signalLine[signalLine.length - 1];
      const previousMACD = macdLine[macdLine.length - 2];
      const previousSignal = signalLine[signalLine.length - 2];

      if (currentMACD > currentSignal && previousMACD <= previousSignal) {
        newSignals.push({
          type: 'BUY',
          indicator: 'MACD',
          strength: 'Medium',
          message: 'MACD crossed above signal line - Bullish signal',
          timestamp: new Date()
        });
      }

      if (currentMACD < currentSignal && previousMACD >= previousSignal) {
        newSignals.push({
          type: 'SELL',
          indicator: 'MACD',
          strength: 'Medium',
          message: 'MACD crossed below signal line - Bearish signal',
          timestamp: new Date()
        });
      }
    }

    // Moving Average Crossover
    if (settings.sma.enabled && settings.ema.enabled && indicatorData.sma && indicatorData.ema) {
      const sma = indicatorData.sma;
      const ema = indicatorData.ema;
      const currentSMA = sma[sma.length - 1];
      const currentEMA = ema[ema.length - 1];
      const previousSMA = sma[sma.length - 2];
      const previousEMA = ema[ema.length - 2];

      if (currentEMA > currentSMA && previousEMA <= previousSMA) {
        newSignals.push({
          type: 'BUY',
          indicator: 'MA Crossover',
          strength: 'Medium',
          message: 'EMA crossed above SMA - Bullish crossover',
          timestamp: new Date()
        });
      }

      if (currentEMA < currentSMA && previousEMA >= previousSMA) {
        newSignals.push({
          type: 'SELL',
          indicator: 'MA Crossover',
          strength: 'Medium',
          message: 'EMA crossed below SMA - Bearish crossover',
          timestamp: new Date()
        });
      }
    }

    setSignals(prev => [...newSignals, ...prev.slice(0, 9)]); // Keep last 10 signals
  };

  // Calculate all indicators
  useEffect(() => {
    if (!chartData || chartData.length === 0) return;

    const newIndicatorData = {};

    if (settings.sma.enabled) {
      newIndicatorData.sma = calculateSMA(chartData, settings.sma.period);
    }

    if (settings.ema.enabled) {
      newIndicatorData.ema = calculateEMA(chartData, settings.ema.period);
    }

    if (settings.rsi.enabled) {
      newIndicatorData.rsi = calculateRSI(chartData, settings.rsi.period);
    }

    if (settings.macd.enabled) {
      newIndicatorData.macd = calculateMACD(
        chartData, 
        settings.macd.fastPeriod, 
        settings.macd.slowPeriod, 
        settings.macd.signalPeriod
      );
    }

    if (settings.bollinger.enabled) {
      newIndicatorData.bollinger = calculateBollingerBands(
        chartData, 
        settings.bollinger.period, 
        settings.bollinger.stdDev
      );
    }

    if (settings.stochastic.enabled) {
      newIndicatorData.stochastic = calculateStochastic(
        chartData, 
        settings.stochastic.kPeriod, 
        settings.stochastic.dPeriod
      );
    }

    if (settings.atr.enabled) {
      newIndicatorData.atr = calculateATR(chartData, settings.atr.period);
    }

    setIndicatorData(newIndicatorData);
  }, [chartData, settings]);

  // Generate signals when indicator data changes
  useEffect(() => {
    if (Object.keys(indicatorData).length > 0) {
      generateSignals();
    }
  }, [indicatorData]);

  const toggleIndicator = (indicatorId) => {
    setSettings(prev => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        enabled: !prev[indicatorId].enabled
      }
    }));
  };

  const updateSettings = (indicatorId, field, value) => {
    setSettings(prev => ({
      ...prev,
      [indicatorId]: {
        ...prev[indicatorId],
        [field]: value
      }
    }));
  };

  const getSignalColor = (type) => {
    return type === 'BUY' ? 'text-green-500' : 'text-red-500';
  };

  const getSignalStrength = (strength) => {
    switch (strength) {
      case 'Strong':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Weak':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Indicator Settings */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Technical Indicators</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableIndicators.map((indicator) => (
            <div key={indicator.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-white">{indicator.name}</h4>
                  <p className="text-sm text-gray-400">{indicator.type}</p>
                </div>
                <button
                  onClick={() => toggleIndicator(indicator.id)}
                  className={`p-2 rounded ${
                    settings[indicator.id]?.enabled 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-600 text-gray-400'
                  }`}
                >
                  {settings[indicator.id]?.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>

              {settings[indicator.id]?.enabled && (
                <div className="space-y-2">
                  {indicator.id === 'sma' && (
                    <div>
                      <label className="block text-sm text-gray-300">Period</label>
                      <input
                        type="number"
                        value={settings.sma.period}
                        onChange={(e) => updateSettings('sma', 'period', parseInt(e.target.value))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                        min="1"
                        max="200"
                      />
                    </div>
                  )}

                  {indicator.id === 'ema' && (
                    <div>
                      <label className="block text-sm text-gray-300">Period</label>
                      <input
                        type="number"
                        value={settings.ema.period}
                        onChange={(e) => updateSettings('ema', 'period', parseInt(e.target.value))}
                        className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                        min="1"
                        max="200"
                      />
                    </div>
                  )}

                  {indicator.id === 'rsi' && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-300">Period</label>
                        <input
                          type="number"
                          value={settings.rsi.period}
                          onChange={(e) => updateSettings('rsi', 'period', parseInt(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                          min="1"
                          max="100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm text-gray-300">Overbought</label>
                          <input
                            type="number"
                            value={settings.rsi.overbought}
                            onChange={(e) => updateSettings('rsi', 'overbought', parseInt(e.target.value))}
                            className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                            min="50"
                            max="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-300">Oversold</label>
                          <input
                            type="number"
                            value={settings.rsi.oversold}
                            onChange={(e) => updateSettings('rsi', 'oversold', parseInt(e.target.value))}
                            className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                            min="0"
                            max="50"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {indicator.id === 'macd' && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-300">Fast Period</label>
                        <input
                          type="number"
                          value={settings.macd.fastPeriod}
                          onChange={(e) => updateSettings('macd', 'fastPeriod', parseInt(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                          min="1"
                          max="50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300">Slow Period</label>
                        <input
                          type="number"
                          value={settings.macd.slowPeriod}
                          onChange={(e) => updateSettings('macd', 'slowPeriod', parseInt(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                          min="1"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300">Signal Period</label>
                        <input
                          type="number"
                          value={settings.macd.signalPeriod}
                          onChange={(e) => updateSettings('macd', 'signalPeriod', parseInt(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                          min="1"
                          max="50"
                        />
                      </div>
                    </>
                  )}

                  {indicator.id === 'bollinger' && (
                    <>
                      <div>
                        <label className="block text-sm text-gray-300">Period</label>
                        <input
                          type="number"
                          value={settings.bollinger.period}
                          onChange={(e) => updateSettings('bollinger', 'period', parseInt(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                          min="1"
                          max="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-300">Standard Deviation</label>
                        <input
                          type="number"
                          value={settings.bollinger.stdDev}
                          onChange={(e) => updateSettings('bollinger', 'stdDev', parseFloat(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm"
                          min="0.1"
                          max="5"
                          step="0.1"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Trading Signals */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Trading Signals</h3>
        
        {signals.length > 0 ? (
          <div className="space-y-3">
            {signals.map((signal, index) => (
              <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getSignalStrength(signal.strength)}`}></div>
                    <div>
                      <div className={`font-medium ${getSignalColor(signal.type)}`}>
                        {signal.type} Signal - {signal.indicator}
                      </div>
                      <div className="text-sm text-gray-400">{signal.message}</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {signal.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No trading signals generated yet
          </div>
        )}
      </div>

      {/* Indicator Values */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Current Values</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(indicatorData).map(([indicator, data]) => {
            if (!settings[indicator]?.enabled) return null;

            let currentValue = null;
            let previousValue = null;

            if (Array.isArray(data)) {
              currentValue = data[data.length - 1];
              previousValue = data[data.length - 2];
            } else if (typeof data === 'object') {
              // Handle complex indicators like MACD
              if (indicator === 'macd') {
                currentValue = data.macdLine[data.macdLine.length - 1];
                previousValue = data.macdLine[data.macdLine.length - 2];
              }
            }

            if (currentValue === null || currentValue === undefined) return null;

            const change = previousValue ? currentValue - previousValue : 0;
            const changePercent = previousValue ? (change / previousValue) * 100 : 0;

            return (
              <div key={indicator} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white capitalize">{indicator}</h4>
                  <div className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {change >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">
                  {typeof currentValue === 'number' ? currentValue.toFixed(4) : currentValue}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicators;
