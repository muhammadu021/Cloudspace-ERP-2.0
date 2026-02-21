import React, { useState, useEffect } from 'react';
import {
  ShoppingCart, TrendingUp, DollarSign, Users, Package,
  Calendar, RefreshCw, ArrowUpRight, ArrowDownRight,
  CreditCard, Clock, CheckCircle, XCircle, AlertCircle, LayoutDashboard, Receipt, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import salesService from '../../../services/salesService';
import { usePageTitle } from '../../../hooks/usePageTitle';
import { Button } from '../../../design-system/components';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const SalesDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');
  const [analytics, setAnalytics] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [error, setError] = useState(null);

  const getDateParams = () => {
    const now = new Date();
    let start_date, end_date;

    switch (dateRange) {
      case 'today':
        start_date = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        end_date = new Date(now.setHours(23, 59, 59, 999)).toISOString();
        break;
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 7);
        start_date = weekStart.toISOString();
        end_date = new Date().toISOString();
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        start_date = monthStart.toISOString();
        end_date = new Date().toISOString();
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        start_date = yearStart.toISOString();
        end_date = new Date().toISOString();
        break;
      default:
        return {};
    }
    return { start_date, end_date };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = getDateParams();
      const { analytics: analyticsData, recentSales: salesData } = await salesService.getDashboardData(params);
      setAnalytics(analyticsData?.data || null);
      setRecentSales(salesData?.data?.sales || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const formatCurrency = (amount) => {
    return '₦' + new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, onClick }) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon: Icon, color, path }) => (
    <button
      onClick={() => navigate(path)}
      className="p-5 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left w-full"
    >
      <div className={`p-3 ${color} rounded-lg inline-block mb-3`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </button>
  );

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      preparing: 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'partial': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'refunded': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  // Set page title and actions in the top nav bar - MUST be before any conditional returns
  usePageTitle('Sales Dashboard', [
    <select
      key="dateRange"
      value={dateRange}
      onChange={(e) => setDateRange(e.target.value)}
      className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-blue-500"
    >
      <option value="today">Today</option>
      <option value="week">Last 7 Days</option>
      <option value="month">This Month</option>
      <option value="year">This Year</option>
    </select>,
    <button
      key="refresh"
      onClick={fetchDashboardData}
      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
    >
      <RefreshCw className="w-5 h-5" />
    </button>
  ]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const overview = analytics?.overview || { total_sales: 0, total_revenue: 0, average_sale: 0, total_paid: 0 };
  const topItems = analytics?.top_items || [];
  const byCustomerType = analytics?.by_customer_type || [];
  const byPaymentStatus = analytics?.by_payment_status || [];
  const dailyTrend = analytics?.daily_trend || [];
  const topCategories = analytics?.top_categories || [];

  return (
    <div className="space-y-4">
      {/* Navigation Buttons */}
      <div className="px-6 pt-6 flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/dashboard')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/pos')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Point of Sale
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/orders')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Receipt className="h-3.5 w-3.5" />
          Sales Orders
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/leads')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Leads
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/customers')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Users className="h-3.5 w-3.5" />
          Customers
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/reports')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Reports
        </Button>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sales"
          value={overview.total_sales}
          icon={ShoppingCart}
          color="bg-primary-500"
          onClick={() => navigate('/sales/orders')}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(overview.total_revenue)}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Average Sale"
          value={formatCurrency(overview.average_sale)}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Collected"
          value={formatCurrency(overview.total_paid)}
          icon={CreditCard}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
          {dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dailyTrend}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Sales'
                  ]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fillOpacity={1} fill="url(#colorRevenue)" />
                <Line type="monotone" dataKey="sales_count" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">
              No sales data for selected period
            </div>
          )}
        </div>

        {/* Sales by Customer Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Type</h3>
          {byCustomerType.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={byCustomerType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="revenue"
                  nameKey="customer_type"
                  label={({ customer_type, percent }) => `${customer_type} ${(percent * 100).toFixed(0)}%`}
                >
                  {byCustomerType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
          {topItems.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topItems.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Qty Sold']} />
                <Bar dataKey="quantity_sold" fill="#3B82F6" name="Qty Sold" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">
              No items sold yet
            </div>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
          {topCategories.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topCategories.slice(0, 5)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="revenue" fill="#10B981" name="Revenue" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-gray-400">
              No category data
            </div>
          )}
        </div>
      </div>

      {/* Payment Status & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Status Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h3>
          <div className="space-y-4">
            {byPaymentStatus.length > 0 ? byPaymentStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPaymentStatusIcon(item.payment_status)}
                  <span className="text-sm font-medium text-gray-700 capitalize">{item.payment_status}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</p>
                  <p className="text-xs text-gray-500">{item.count} orders</p>
                </div>
              </div>
            )) : (
              <p className="text-gray-400 text-center py-4">No payment data</p>
            )}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            <button
              onClick={() => navigate('/sales/orders')}
              className="text-sm text-primary hover:text-primary-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="pb-3">Order #</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentSales.length > 0 ? recentSales.slice(0, 5).map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/sales/orders/${sale.id}`)}>
                    <td className="py-3 text-sm font-medium text-gray-900">{sale.sale_number}</td>
                    <td className="py-3 text-sm text-gray-600 capitalize">{sale.customer_type || '-'}</td>
                    <td className="py-3 text-sm font-medium text-gray-900">{formatCurrency(sale.total_amount)}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(sale.status)}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1">
                        {getPaymentStatusIcon(sale.payment_status)}
                        <span className="text-sm text-gray-600 capitalize">{sale.payment_status}</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">
                      No recent sales
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/sales/reports')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Calendar className="w-5 h-5 text-primary mb-2" />
            <p className="text-sm font-medium text-gray-900">Daily Report</p>
            <p className="text-xs text-gray-500">Today's summary</p>
          </button>
          <button
            onClick={() => navigate('/sales/analytics')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-sm font-medium text-gray-900">Analytics</p>
            <p className="text-xs text-gray-500">Detailed insights</p>
          </button>
          <button
            onClick={() => navigate('/sales/reports')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Package className="w-5 h-5 text-purple-500 mb-2" />
            <p className="text-sm font-medium text-gray-900">Product Report</p>
            <p className="text-xs text-gray-500">Item performance</p>
          </button>
          <button
            onClick={() => navigate('/sales/customers')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left"
          >
            <Users className="w-5 h-5 text-orange-500 mb-2" />
            <p className="text-sm font-medium text-gray-900">Customer Report</p>
            <p className="text-xs text-gray-500">Customer insights</p>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
