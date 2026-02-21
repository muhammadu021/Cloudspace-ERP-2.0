import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  CreditCard, 
  ShoppingCart, 
  Package,
  Calendar,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../../services/api';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

const SalesAnalytics = () => {
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getWeekAgo = () => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  };

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start_date: getWeekAgo(),
    end_date: getTodayDate()
  });
  const [customerType, setCustomerType] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateRange.start_date) params.start_date = dateRange.start_date;
      if (dateRange.end_date) params.end_date = dateRange.end_date;
      if (customerType) params.customer_type = customerType;

      const response = await api.get('/sales/analytics', { params });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      toast.error('Failed to fetch sales analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => '₦' + (amount || 0).toLocaleString('en-NG');
  const formatNumber = (num) => (num || 0).toLocaleString('en-NG');

  if (loading && !analytics) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const topItems = analytics?.top_items || [];
  const byCustomerType = analytics?.by_customer_type || [];
  const byPaymentStatus = analytics?.by_payment_status || [];
  const byStatus = analytics?.by_status || [];
  const dailyTrend = analytics?.daily_trend || [];
  const topCategories = analytics?.top_categories || [];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="text-gray-500">Visual insights and performance metrics</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Type</label>
            <select
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">All Types</option>
              <option value="restaurant">Restaurant</option>
              <option value="supermarket">Supermarket</option>
              <option value="walk-in">Walk-in</option>
            </select>
          </div>
          <button onClick={fetchAnalytics} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600">
            Apply
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(overview.total_sales)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.total_revenue)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Sale</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.average_sale)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Collected</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(overview.total_paid)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => '₦' + (v/1000) + 'k'} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="url(#colorRevenue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No trend data</div>
          )}
        </div>

        {/* Sales Count Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Count Trend</h3>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="sales_count" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} name="Sales" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">No trend data</div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales by Customer Type - Pie */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Customer Type</h3>
          {byCustomerType.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byCustomerType}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="revenue"
                  nameKey="customer_type"
                  label={({ customer_type, percent }) => `${customer_type} ${(percent * 100).toFixed(0)}%`}
                >
                  {byCustomerType.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>

        {/* Sales by Status - Pie */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">By Status</h3>
          {byStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="amount"
                  nameKey="status"
                  label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                >
                  {byStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>

        {/* Payment Status - Pie */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          {byPaymentStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={byPaymentStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="amount"
                  nameKey="payment_status"
                  label={({ payment_status, percent }) => `${payment_status} ${(percent * 100).toFixed(0)}%`}
                >
                  {byPaymentStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">No data</div>
          )}
        </div>
      </div>

      {/* Top Items Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
        {topItems.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topItems.slice(0, 8)} layout="vertical" margin={{ left: 100 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => '₦' + (v/1000) + 'k'} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
              <Tooltip formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Qty']} />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" radius={[0, 4, 4, 0]} />
              <Bar dataKey="quantity_sold" fill="#10B981" name="Quantity" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[350px] flex items-center justify-center text-gray-400">No items data</div>
        )}
      </div>

      {/* Top Categories Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
        {topCategories.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topCategories}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => '₦' + (v/1000) + 'k'} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-400">No category data</div>
        )}
      </div>
    </div>
  );
};

export default SalesAnalytics;
