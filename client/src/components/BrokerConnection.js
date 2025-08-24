import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Minus,
  Settings,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

const BrokerConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderForm, setOrderForm] = useState({
    symbol: 'EURUSD',
    side: 'BUY',
    quantity: 1000,
    price: '',
    orderType: 'MARKET'
  });

  // Fetch connection status
  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch('/api/broker/status');
      const data = await response.json();
      if (data.success) {
        setConnectionStatus(data.data);
      }
    } catch (error) {
      console.error('Error fetching connection status:', error);
    }
  };

  // Fetch account information
  const fetchAccountInfo = async () => {
    try {
      const response = await fetch('/api/broker/account');
      const data = await response.json();
      if (data.success) {
        setAccountInfo(data.data);
      }
    } catch (error) {
      console.error('Error fetching account info:', error);
    }
  };

  // Fetch positions
  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/broker/positions');
      const data = await response.json();
      if (data.success) {
        setPositions(data.data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/broker/orders');
      const data = await response.json();
      if (data.success) {
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Fetch available brokers
  const fetchBrokers = async () => {
    try {
      const response = await fetch('/api/broker/brokers');
      const data = await response.json();
      if (data.success) {
        setBrokers(data.data);
      }
    } catch (error) {
      console.error('Error fetching brokers:', error);
    }
  };

  // Connect to broker
  const connectToBroker = async (brokerKey) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/broker/connect/${brokerKey}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Connected to ${brokerKey} successfully`);
        fetchConnectionStatus();
        fetchAccountInfo();
        fetchPositions();
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to connect to broker');
      }
    } catch (error) {
      toast.error('Error connecting to broker');
      console.error('Error connecting to broker:', error);
    } finally {
      setLoading(false);
    }
  };

  // Place order
  const placeOrder = async () => {
    setLoading(true);
    try {
      const endpoint = orderForm.orderType === 'MARKET' ? '/api/broker/orders/market' : '/api/broker/orders/limit';
      const body = {
        symbol: orderForm.symbol,
        side: orderForm.side,
        quantity: parseInt(orderForm.quantity)
      };

      if (orderForm.orderType === 'LIMIT' && orderForm.price) {
        body.price = parseFloat(orderForm.price);
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Order placed successfully');
        setOrderForm({
          symbol: 'EURUSD',
          side: 'BUY',
          quantity: 1000,
          price: '',
          orderType: 'MARKET'
        });
        fetchOrders();
        fetchPositions();
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Error placing order');
      console.error('Error placing order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cancel order
  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/broker/orders/${orderId}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success('Order cancelled successfully');
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      toast.error('Error cancelling order');
      console.error('Error cancelling order:', error);
    }
  };

  // Refresh all data
  const refreshData = () => {
    fetchConnectionStatus();
    fetchAccountInfo();
    fetchPositions();
    fetchOrders();
  };

  useEffect(() => {
    fetchConnectionStatus();
    fetchBrokers();
    fetchAccountInfo();
    fetchPositions();
    fetchOrders();

    // Refresh data every 30 seconds
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (isConnected) => {
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isConnected) => {
    return isConnected ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Broker Connection</h2>
            <p className="text-gray-600">Connect to live trading brokers</p>
          </div>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Connection Status</h3>
        
        {connectionStatus ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 ${getStatusColor(connectionStatus.isConnected)}`}>
                {getStatusIcon(connectionStatus.isConnected)}
                <span className="font-medium">
                  {connectionStatus.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>

            {connectionStatus.connections.length > 0 && (
              <div className="space-y-2">
                {connectionStatus.connections.map((conn, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{conn.name}</p>
                        <p className="text-sm text-gray-600">Connected at {new Date(conn.connectedAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {conn.status}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {!connectionStatus.isConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800">No broker connected. Connect to a broker to enable live trading.</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading connection status...</p>
          </div>
        )}
      </div>

      {/* Available Brokers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Available Brokers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {brokers.map((broker) => (
            <div key={broker.key} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">{broker.name}</h4>
                <div className="flex items-center space-x-2">
                  {broker.configured ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Status: {broker.configured ? 'Configured' : 'Not Configured'}
                </p>
                
                {broker.configured && (
                  <button
                    onClick={() => connectToBroker(broker.key)}
                    disabled={loading || connectionStatus?.isConnected}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Connecting...' : 'Connect'}
                  </button>
                )}
                
                {!broker.configured && (
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    Add API key to .env file to enable
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Information */}
      {accountInfo && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Balance</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {accountInfo.balance?.toFixed(2)} {accountInfo.currency}
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-900">P&L</span>
              </div>
              <p className={`text-2xl font-bold ${accountInfo.pl >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {accountInfo.pl?.toFixed(2)} {accountInfo.currency}
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-900">Margin Used</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">
                {accountInfo.marginUsed?.toFixed(2)} {accountInfo.currency}
              </p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-orange-900">Open Positions</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {accountInfo.openPositionCount || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Placement */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Place Order</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
            <select
              value={orderForm.symbol}
              onChange={(e) => setOrderForm({...orderForm, symbol: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="EURUSD">EUR/USD</option>
              <option value="GBPUSD">GBP/USD</option>
              <option value="USDJPY">USD/JPY</option>
              <option value="USDCHF">USD/CHF</option>
              <option value="AUDUSD">AUD/USD</option>
              <option value="USDCAD">USD/CAD</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Side</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setOrderForm({...orderForm, side: 'BUY'})}
                className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors ${
                  orderForm.side === 'BUY' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-1" />
                BUY
              </button>
              <button
                onClick={() => setOrderForm({...orderForm, side: 'SELL'})}
                className={`flex-1 px-3 py-2 rounded-md font-medium transition-colors ${
                  orderForm.side === 'SELL' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Minus className="w-4 h-4 inline mr-1" />
                SELL
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              value={orderForm.quantity}
              onChange={(e) => setOrderForm({...orderForm, quantity: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
            <select
              value={orderForm.orderType}
              onChange={(e) => setOrderForm({...orderForm, orderType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MARKET">Market</option>
              <option value="LIMIT">Limit</option>
            </select>
          </div>
          
          {orderForm.orderType === 'LIMIT' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <input
                type="number"
                step="0.00001"
                value={orderForm.price}
                onChange={(e) => setOrderForm({...orderForm, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1.0850"
              />
            </div>
          )}
          
          <div className="flex items-end">
            <button
              onClick={placeOrder}
              disabled={loading || !connectionStatus?.isConnected}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

      {/* Open Positions */}
      {positions.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Open Positions</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Instrument
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Long Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short Units
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    P&L
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {positions.map((position, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {position.instrument}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.long.units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {position.short.units}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={position.long.unrealizedPL + position.short.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {(position.long.unrealizedPL + position.short.unrealizedPL).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Open Orders */}
      {orders.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Open Orders</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Symbol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Side
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.symbol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.side === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.side}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'FILLED' ? 'bg-green-100 text-green-800' :
                        order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.status === 'PENDING' && (
                        <button
                          onClick={() => cancelOrder(order.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrokerConnection;
