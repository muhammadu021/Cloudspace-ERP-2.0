import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Wallet,
  Building,
  FileText,
  Target,
  Activity
} from 'lucide-react';
import financeService from '@/services/financeService';

const FinanceDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalAssets: 0,
      totalLiabilities: 0,
      netWorth: 0,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      cashBalance: 0,
      pendingTransactions: 0
    },
    recentTransactions: [],
    budgetData: [],
    period: { type: 'month' }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await financeService.getFinancialDashboard({ period: selectedPeriod });
      const data = response.data;

      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMetricChange = (current, previous) => {
    if (!previous || previous === 0) return { percentage: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      percentage: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600 mt-1">Financial overview and key metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={fetchDashboardData}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
          >
            <Activity className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Assets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(dashboardData.metrics.totalAssets)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">Strong position</span>
              </div>
            </div>
            <Building className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Net Worth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(dashboardData.metrics.netWorth)}
              </p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm text-primary">Equity growth</span>
              </div>
            </div>
            <Wallet className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Cash Balance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cash Balance</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(dashboardData.metrics.cashBalance)}
              </p>
              <div className="flex items-center mt-2">
                <CreditCard className="h-4 w-4 text-purple-500 mr-1" />
                <span className="text-sm text-purple-600">Available funds</span>
              </div>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        {/* Net Income */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className={`text-3xl font-bold ${dashboardData.metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(dashboardData.metrics.netIncome)}
              </p>
              <div className="flex items-center mt-2">
                {dashboardData.metrics.netIncome >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${dashboardData.metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedPeriod} performance
                </span>
              </div>
            </div>
            <BarChart3 className={`h-8 w-8 ${dashboardData.metrics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
      </div>

      {/* Revenue vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenses</h3>
            <PieChart className="h-5 w-5 text-primary" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Total Revenue</p>
                  <p className="text-sm text-gray-500">{selectedPeriod} period</p>
                </div>
              </div>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(dashboardData.metrics.totalRevenue)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Total Expenses</p>
                  <p className="text-sm text-gray-500">{selectedPeriod} period</p>
                </div>
              </div>
              <span className="text-xl font-bold text-red-600">
                {formatCurrency(dashboardData.metrics.totalExpenses)}
              </span>
            </div>

            {/* Profit Margin */}
            <div className="mt-4 p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">Profit Margin</span>
                <span className="text-lg font-bold text-primary">
                  {dashboardData.metrics.totalRevenue > 0 
                    ? ((dashboardData.metrics.netIncome / dashboardData.metrics.totalRevenue) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending Transactions</h3>
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          
          {dashboardData.metrics.pendingTransactions > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Awaiting Approval</p>
                    <p className="text-sm text-gray-500">Requires attention</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {dashboardData.metrics.pendingTransactions}
                </span>
              </div>
              
              <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                Review Pending Transactions
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-3" />
              <p className="text-gray-500">All transactions are up to date</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <FileText className="h-5 w-5 text-primary" />
        </div>
        
        {dashboardData.recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardData.recentTransactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.DebitAccount?.name} → {transaction.CreditAccount?.name}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    transaction.status === 'posted' ? 'bg-green-100 text-green-800' :
                    transaction.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {transaction.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget Overview */}
      {dashboardData.budgetData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
            <Target className="h-5 w-5 text-primary" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData.budgetData.slice(0, 3).map((budget) => (
              <div key={budget.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{budget.name}</h4>
                  <span className="text-sm text-gray-500">{budget.type}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budgeted:</span>
                    <span className="font-medium">{formatCurrency(budget.budgeted_amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actual:</span>
                    <span className="font-medium">{formatCurrency(budget.actual_amount || 0)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min(((budget.actual_amount || 0) / budget.budgeted_amount) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">
                      {(((budget.actual_amount || 0) / budget.budgeted_amount) * 100).toFixed(1)}% used
                    </span>
                    <span className="text-gray-500">
                      {formatCurrency(budget.budgeted_amount - (budget.actual_amount || 0))} remaining
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">New Transaction</span>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <Building className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Manage Accounts</span>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Budget Planning</span>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Financial Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;