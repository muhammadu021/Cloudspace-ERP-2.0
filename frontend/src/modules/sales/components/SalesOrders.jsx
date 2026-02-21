import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  X,
  Check,
  Clock,
  CreditCard,
  Calendar,
  User,
  Phone,
  MapPin,
  Receipt,
  ChevronDown,
  ChevronUp,
  Download,
  CheckSquare,
  Square
} from 'lucide-react';
import { API_URL } from '@/services/api';
import { toast } from 'react-hot-toast';

const SalesOrders = () => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkApproving, setBulkApproving] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, customerTypeFilter, startDate, endDate, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sales?limit=1000&company_id=${localStorage.getItem('company_id')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setOrders(data.data.sales || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    // Exclude completed orders - they go to Reports
    filtered = filtered.filter(order => order.status !== 'completed');

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.sale_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (customerTypeFilter !== 'all') {
      filtered = filtered.filter(order => order.customer_type === customerTypeFilter);
    }

    // Date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.sale_date).toISOString().split('T')[0];
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sales/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          company_id: localStorage.getItem('company_id')
        })
      });

      const data = await response.json();
      if (data.success) {
        loadOrders();
        toast.success('Order status updated successfully');
      } else {
        toast.error(data.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating order status');
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => {
      if (prev.includes(orderId)) {
        return prev.filter(id => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders to approve');
      return;
    }

    setBulkApproving(true);
    let successCount = 0;
    let failCount = 0;

    for (const orderId of selectedOrders) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/sales/${orderId}/status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            status: 'completed',
            company_id: localStorage.getItem('company_id')
          })
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
        } else {
          failCount++;
        }
      } catch (error) {
        console.error('Error approving order:', orderId, error);
        failCount++;
      }
    }

    setBulkApproving(false);
    setSelectedOrders([]);
    loadOrders();

    if (successCount > 0) {
      toast.success(`${successCount} order(s) approved successfully`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} order(s) failed to approve`);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/sales/${orderId}?company_id=${localStorage.getItem('company_id')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setSelectedOrder(data.data.sale);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Failed to load order details');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-indigo-100 text-indigo-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      paid: 'bg-green-100 text-green-800',
      refunded: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
    totalRevenue: orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0)
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Package className="h-8 w-8 text-primary" />
          Sales Orders
        </h1>
        <p className="text-gray-600 mt-1">
          Manage and track all sales orders
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Check className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedOrders.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-primary" />
              <span className="font-medium text-blue-900">
                {selectedOrders.length} order(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedOrders([])}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Selection
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={bulkApproving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                {bulkApproving ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Complete Selected Orders
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col gap-4">
          {/* First Row: Search and Dropdowns */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number, customer name, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={customerTypeFilter}
              onChange={(e) => setCustomerTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              <option value="restaurant">Restaurant</option>
              <option value="supermarket">Supermarket</option>
              <option value="walk-in">Walk-in</option>
            </select>
          </div>

          {/* Second Row: Date Range */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Date Range:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
              <span className="text-gray-600">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={() => {
                setStartDate(getTodayDate());
                setEndDate(getTodayDate());
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
            >
              Reset to Today
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <Clock className="h-12 w-12 mx-auto text-gray-400 animate-spin" />
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-4 text-gray-600">No orders found</p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                />
                <span className="font-medium text-gray-700">
                  Select All ({filteredOrders.length} orders)
                </span>
              </label>
            </div>

            <div className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <div className="pt-1">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    {/* Order Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {order.sale_number}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 capitalize">
                          {order.customer_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {order.customer_name || 'Walk-in'}
                        </div>
                        {order.customer_phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {order.customer_phone}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.sale_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 font-semibold text-gray-900">
                          <CreditCard className="h-4 w-4" />
                          {formatCurrency(parseFloat(order.total_amount))}
                        </div>
                      </div>

                      {order.table_number && (
                        <div className="mt-2 text-sm text-gray-600">
                          Table: {order.table_number}
                        </div>
                      )}

                      {/* Expanded Details */}
                      {expandedOrder === order.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Sale Type:</p>
                              <p className="font-medium capitalize">{order.sale_type}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Payment Method:</p>
                              <p className="font-medium capitalize">{order.payment_method || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Subtotal:</p>
                              <p className="font-medium">{formatCurrency(parseFloat(order.subtotal || 0))}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Tax:</p>
                              <p className="font-medium">{formatCurrency(parseFloat(order.tax_amount || 0))}</p>
                            </div>
                            {order.service_charge > 0 && (
                              <div>
                                <p className="text-gray-600">Service Charge:</p>
                                <p className="font-medium">{formatCurrency(parseFloat(order.service_charge))}</p>
                              </div>
                            )}
                            {order.discount_amount > 0 && (
                              <div>
                                <p className="text-gray-600">Discount:</p>
                                <p className="font-medium text-red-600">-{formatCurrency(parseFloat(order.discount_amount))}</p>
                              </div>
                            )}
                          </div>
                          {order.special_instructions && (
                            <div className="mt-4">
                              <p className="text-gray-600 text-sm">Special Instructions:</p>
                              <p className="text-gray-900">{order.special_instructions}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewOrderDetails(order.id)}
                        className="p-2 text-primary hover:bg-primary-50 rounded-lg"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>

                      {order.status !== 'completed' && order.status !== 'cancelled' && (
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                        </select>
                      )}

                      <button
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        {expandedOrder === order.id ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-transparent print:relative print:p-0">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
            <div className="p-6 print:p-0">
              <div className="flex items-center justify-between mb-6 print:hidden">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="font-semibold">{selectedOrder.sale_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.sale_date).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-semibold">{selectedOrder.customer_name || 'Walk-in'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Order Items</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Price</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm">{item.item_name}</td>
                            <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-right">{formatCurrency(parseFloat(item.unit_price))}</td>
                            <td className="px-4 py-2 text-sm text-right font-medium">{formatCurrency(parseFloat(item.total))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(selectedOrder.subtotal))}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(parseFloat(selectedOrder.discount_amount))}</span>
                    </div>
                  )}
                  {selectedOrder.service_charge > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service Charge:</span>
                      <span className="font-medium">{formatCurrency(parseFloat(selectedOrder.service_charge))}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(parseFloat(selectedOrder.tax_amount))}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span>Total:</span>
                    <span className="text-primary">{formatCurrency(parseFloat(selectedOrder.total_amount))}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-2 print:hidden">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center justify-center gap-2"
                >
                  <Receipt className="h-4 w-4" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesOrders;
