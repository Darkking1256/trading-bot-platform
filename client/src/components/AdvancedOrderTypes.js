import React, { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Plus,
  Minus,
  Settings,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdvancedOrderTypes = ({ selectedSymbol, currentPrice }) => {
  const [orderType, setOrderType] = useState('market');
  const [orderForm, setOrderForm] = useState({
    type: 'BUY',
    volume: 0.1,
    price: '',
    stopLoss: '',
    takeProfit: '',
    expiry: '',
    condition: 'none',
    conditionPrice: ''
  });
  const [pendingOrders, setPendingOrders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { socket, isConnected } = useSocket();

  const orderTypes = [
    { id: 'market', label: 'Market Order', description: 'Execute immediately at current price' },
    { id: 'limit', label: 'Limit Order', description: 'Execute at specified price or better' },
    { id: 'stop', label: 'Stop Order', description: 'Execute when price reaches stop level' },
    { id: 'stop-limit', label: 'Stop Limit', description: 'Stop order with limit price protection' },
    { id: 'trailing-stop', label: 'Trailing Stop', description: 'Dynamic stop that follows price' },
    { id: 'oco', label: 'OCO Order', description: 'One-Cancels-Other with stop and limit' },
    { id: 'bracket', label: 'Bracket Order', description: 'Entry with stop loss and take profit' }
  ];

  const conditions = [
    { id: 'none', label: 'No Condition' },
    { id: 'above', label: 'Price Above' },
    { id: 'below', label: 'Price Below' },
    { id: 'time', label: 'Time Condition' }
  ];

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Load pending orders
    socket.emit('getPendingOrders', { symbol: selectedSymbol });
    socket.once('pendingOrdersData', (data) => {
      setPendingOrders(data);
    });

    // Listen for order updates
    socket.on('orderUpdate', (data) => {
      setPendingOrders(prev => {
        const filtered = prev.filter(order => order.id !== data.id);
        if (data.status === 'pending') {
          return [data, ...filtered];
        }
        return filtered;
      });
    });

    return () => {
      socket.off('orderUpdate');
    };
  }, [socket, isConnected, selectedSymbol]);

  const handleInputChange = (field, value) => {
    setOrderForm(prev => ({ ...prev, [field]: value }));
  };

  const calculateOrderPrice = () => {
    if (!currentPrice.bid) return '';

    switch (orderType) {
      case 'limit':
        return orderForm.type === 'BUY' ? currentPrice.bid : currentPrice.ask;
      case 'stop':
        return orderForm.type === 'BUY' ? currentPrice.ask : currentPrice.bid;
      case 'stop-limit':
        return orderForm.type === 'BUY' ? currentPrice.bid : currentPrice.ask;
      default:
        return '';
    }
  };

  const validateOrder = () => {
    const errors = [];

    if (!orderForm.volume || orderForm.volume <= 0) {
      errors.push('Volume must be greater than 0');
    }

    if (orderType !== 'market' && !orderForm.price) {
      errors.push('Price is required for this order type');
    }

    if (orderType === 'limit' || orderType === 'stop-limit') {
      const current = orderForm.type === 'BUY' ? currentPrice.ask : currentPrice.bid;
      if (orderForm.type === 'BUY' && parseFloat(orderForm.price) >= current) {
        errors.push('Limit buy price must be below current ask price');
      }
      if (orderForm.type === 'SELL' && parseFloat(orderForm.price) <= current) {
        errors.push('Limit sell price must be above current bid price');
      }
    }

    if (orderType === 'stop' || orderType === 'stop-limit') {
      const current = orderForm.type === 'BUY' ? currentPrice.ask : currentPrice.bid;
      if (orderForm.type === 'BUY' && parseFloat(orderForm.price) <= current) {
        errors.push('Stop buy price must be above current ask price');
      }
      if (orderForm.type === 'SELL' && parseFloat(orderForm.price) >= current) {
        errors.push('Stop sell price must be below current bid price');
      }
    }

    if (orderType === 'oco' && (!orderForm.stopLoss || !orderForm.takeProfit)) {
      errors.push('Both stop loss and take profit are required for OCO orders');
    }

    return errors;
  };

  const handleSubmitOrder = async () => {
    const errors = validateOrder();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        symbol: selectedSymbol,
        orderType,
        type: orderForm.type,
        volume: parseFloat(orderForm.volume),
        price: orderForm.price ? parseFloat(orderForm.price) : null,
        stopLoss: orderForm.stopLoss ? parseFloat(orderForm.stopLoss) : null,
        takeProfit: orderForm.takeProfit ? parseFloat(orderForm.takeProfit) : null,
        expiry: orderForm.expiry || null,
        condition: orderForm.condition,
        conditionPrice: orderForm.conditionPrice ? parseFloat(orderForm.conditionPrice) : null
      };

      socket.emit('placeAdvancedOrder', orderData);
      socket.once('advancedOrderResult', (result) => {
        if (result.success) {
          toast.success(`Order placed successfully! Order ID: ${result.orderId}`);
          setOrderForm({
            type: 'BUY',
            volume: 0.1,
            price: '',
            stopLoss: '',
            takeProfit: '',
            expiry: '',
            condition: 'none',
            conditionPrice: ''
          });
        } else {
          toast.error(result.error || 'Failed to place order');
        }
        setIsSubmitting(false);
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
      setIsSubmitting(false);
    }
  };

  const cancelOrder = (orderId) => {
    socket.emit('cancelOrder', { orderId });
    socket.once('cancelOrderResult', (result) => {
      if (result.success) {
        toast.success('Order cancelled successfully');
        setPendingOrders(prev => prev.filter(order => order.id !== orderId));
      } else {
        toast.error(result.error || 'Failed to cancel order');
      }
    });
  };

  const modifyOrder = (orderId, modifications) => {
    socket.emit('modifyOrder', { orderId, modifications });
    socket.once('modifyOrderResult', (result) => {
      if (result.success) {
        toast.success('Order modified successfully');
        setPendingOrders(prev => 
          prev.map(order => 
            order.id === orderId ? { ...order, ...modifications } : order
          )
        );
      } else {
        toast.error(result.error || 'Failed to modify order');
      }
    });
  };

  const getOrderStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'filled':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Order Type Selection */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Order Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {orderTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setOrderType(type.id)}
              className={`p-4 rounded-lg border text-left transition-colors ${
                orderType === type.id
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="font-medium text-white">{type.label}</div>
              <div className="text-sm text-gray-400 mt-1">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Order Form */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Order Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Order Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleInputChange('type', 'BUY')}
                className={`px-4 py-2 rounded font-medium ${
                  orderForm.type === 'BUY'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                BUY
              </button>
              <button
                onClick={() => handleInputChange('type', 'SELL')}
                className={`px-4 py-2 rounded font-medium ${
                  orderForm.type === 'SELL'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                SELL
              </button>
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Volume (Lots)</label>
            <input
              type="number"
              value={orderForm.volume}
              onChange={(e) => handleInputChange('volume', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.01"
              min="0.01"
            />
          </div>

          {/* Price (for non-market orders) */}
          {orderType !== 'market' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {orderType === 'limit' ? 'Limit Price' : 
                 orderType === 'stop' ? 'Stop Price' : 'Price'}
              </label>
              <input
                type="number"
                value={orderForm.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder={calculateOrderPrice()}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.00001"
              />
            </div>
          )}

          {/* Stop Loss */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss (Optional)</label>
            <input
              type="number"
              value={orderForm.stopLoss}
              onChange={(e) => handleInputChange('stopLoss', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.00001"
              placeholder="Stop loss price"
            />
          </div>

          {/* Take Profit */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit (Optional)</label>
            <input
              type="number"
              value={orderForm.takeProfit}
              onChange={(e) => handleInputChange('takeProfit', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              step="0.00001"
              placeholder="Take profit price"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Expiry (Optional)</label>
            <input
              type="datetime-local"
              value={orderForm.expiry}
              onChange={(e) => handleInputChange('expiry', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
            <select
              value={orderForm.condition}
              onChange={(e) => handleInputChange('condition', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {conditions.map(condition => (
                <option key={condition.id} value={condition.id}>
                  {condition.label}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Price */}
          {orderForm.condition !== 'none' && orderForm.condition !== 'time' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Condition Price</label>
              <input
                type="number"
                value={orderForm.conditionPrice}
                onChange={(e) => handleInputChange('conditionPrice', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                step="0.00001"
                placeholder="Condition price"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            onClick={handleSubmitOrder}
            disabled={isSubmitting || !isConnected}
            className={`w-full py-3 px-4 rounded font-medium ${
              orderForm.type === 'BUY'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
              `Place ${orderForm.type} ${orderTypes.find(t => t.id === orderType)?.label}`
            )}
          </button>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Pending Orders</h3>
        
        {pendingOrders.length > 0 ? (
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div key={order.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">{order.symbol}</span>
                      {getOrderStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.type === 'BUY' 
                          ? 'bg-green-900 text-green-300' 
                          : 'bg-red-900 text-red-300'
                      }`}>
                        {order.type}
                      </span>
                      <span className="text-sm text-gray-400">{order.orderType}</span>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {order.volume} lots @ {order.price?.toFixed(5) || 'Market'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => modifyOrder(order.id, {})}
                      className="p-1 text-gray-400 hover:text-white"
                      title="Modify Order"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="p-1 text-gray-400 hover:text-red-400"
                      title="Cancel Order"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {(order.stopLoss || order.takeProfit) && (
                  <div className="flex space-x-4 text-sm">
                    {order.stopLoss && (
                      <span className="text-red-400">SL: {order.stopLoss.toFixed(5)}</span>
                    )}
                    {order.takeProfit && (
                      <span className="text-green-400">TP: {order.takeProfit.toFixed(5)}</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            No pending orders
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedOrderTypes;
