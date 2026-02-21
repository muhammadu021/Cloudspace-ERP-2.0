import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  X,
  Clock,
  DollarSign,
  Calendar,
  User,
  Building,
  FileText,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Eye,
  Download
} from 'lucide-react';
import financeService from '@/services/financeService';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingPayment: 0,
    paidExpenses: 0,
    totalAmount: '0.00',
    pendingAmount: '0.00',
    paidAmount: '0.00'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const tabs = [
    { id: 'pending', label: 'Pending Approval', icon: Clock, color: 'text-orange-600' },
    { id: 'approved', label: 'Approved List', icon: CheckCircle, color: 'text-green-600' },
    { id: 'payment', label: 'Payment Queue', icon: CreditCard, color: 'text-primary' },
    { id: 'history', label: 'Payment History', icon: FileText, color: 'text-gray-600' }
  ];

  const expenseTypes = [
    'travel',
    'meals',
    'accommodation',
    'transportation',
    'office_supplies',
    'training',
    'marketing',
    'utilities',
    'other'
  ];

  useEffect(() => {
    fetchStats();
    fetchExpenses();
  }, [activeTab, currentPage, searchTerm, selectedType, amountMin, amountMax]);

  const fetchStats = async () => {
    try {
      const response = await financeService.getExpenseStats();
      const data = response.data;
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching expense stats:', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType && { expense_type: selectedType }),
        ...(amountMin && { amount_min: amountMin }),
        ...(amountMax && { amount_max: amountMax })
      };

      let response;
      switch (activeTab) {
        case 'pending':
          response = await financeService.getPendingFinanceExpenses(params);
          break;
        case 'approved':
          response = await financeService.getApprovedExpensesList(params);
          break;
        case 'payment':
          response = await financeService.getExpensePaymentHistory(params);
          break;
        case 'history':
          response = await financeService.getExpensePaymentHistory(params);
          break;
        default:
          response = await financeService.getPendingFinanceExpenses(params);
      }

      const data = response.data;

      if (data.success) {
        setExpenses(data.data.expenses);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        setError('Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError(error.response?.data?.message || 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expenseId) => {
    try {
      const comments = prompt('Add approval comments (optional):');
      
      const response = await financeService.approveExpensePayment(expenseId, { comments });
      const data = response.data;

      if (data.success) {
        fetchExpenses();
        fetchStats();
      } else {
        setError(data.message || 'Failed to approve expense');
      }
    } catch (error) {
      console.error('Error approving expense:', error);
      setError(error.response?.data?.message || 'Failed to approve expense');
    }
  };

  const handleReject = async (expenseId) => {
    try {
      const reason = prompt('Please provide a rejection reason:');
      if (!reason) return;

      const response = await financeService.rejectExpensePayment(expenseId, { reason });
      const data = response.data;

      if (data.success) {
        fetchExpenses();
        fetchStats();
      } else {
        setError(data.message || 'Failed to reject expense');
      }
    } catch (error) {
      console.error('Error rejecting expense:', error);
      setError(error.response?.data?.message || 'Failed to reject expense');
    }
  };

  const handleMarkPaid = async (expenseId) => {
    try {
      const paymentReference = prompt('Enter payment reference number:');
      if (!paymentReference) return;

      const paymentMethod = prompt('Enter payment method (bank_transfer, check, cash, digital_wallet):') || 'bank_transfer';
      const comments = prompt('Add payment comments (optional):');

      const response = await financeService.processExpensePayment(expenseId, { 
        payment_reference: paymentReference,
        payment_method: paymentMethod,
        comments 
      });

      const data = response.data;

      if (data.success) {
        fetchExpenses();
        fetchStats();
      } else {
        setError(data.message || 'Failed to mark expense as paid');
      }
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      setError('Failed to mark expense as paid');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-orange-100 text-orange-800', icon: Clock },
      finance_approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      paid: { color: 'bg-blue-100 text-blue-800', icon: CreditCard },
      finance_rejected: { color: 'bg-red-100 text-red-800', icon: X }
    };

    const config = statusConfig[status] || statusConfig.approved;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && expenses.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading expenses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600 mt-1">Finance approval and payment processing</p>
        </div>
        <button
          onClick={fetchStats}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payment</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pendingPayment}</p>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Expenses</p>
              <p className="text-3xl font-bold text-green-600">{stats.paidExpenses}</p>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.paidAmount)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-3xl font-bold text-primary">{stats.totalExpenses}</p>
              <p className="text-sm text-gray-500 mt-1">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing Rate</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.totalExpenses > 0 ? Math.round((stats.paidExpenses / stats.totalExpenses) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Completion rate</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    isActive
                      ? 'border-blue-500 text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Types</option>
              {expenseTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Min Amount"
              value={amountMin}
              onChange={(e) => setAmountMin(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            <input
              type="number"
              placeholder="Max Amount"
              value={amountMax}
              onChange={(e) => setAmountMax(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setAmountMin('');
                setAmountMax('');
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Expense List */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
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
              {expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {expense.expense_type.replace('_', ' ').charAt(0).toUpperCase() + expense.expense_type.replace('_', ' ').slice(1)}
                        </div>
                        {expense.description && (
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-xs">
                            {expense.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {expense.Employee?.User?.first_name} {expense.Employee?.User?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {expense.Employee?.Department?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(expense.amount, expense.currency)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatDate(expense.expense_date)}
                      </span>
                    </div>
                    {expense.approved_date && (
                      <div className="text-xs text-gray-500 mt-1">
                        Approved: {formatDate(expense.approved_date)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(expense.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {activeTab === 'pending' && expense.status === 'approved' && (
                        <>
                          <button
                            onClick={() => handleApprove(expense.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Approve for Payment"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(expense.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Reject Expense"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {(activeTab === 'payment' || activeTab === 'approved') && expense.status === 'finance_approved' && (
                        <button
                          onClick={() => handleMarkPaid(expense.id)}
                          className="text-primary hover:text-blue-900 p-1 rounded"
                          title="Mark as Paid"
                        >
                          <CreditCard className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        className="text-gray-600 hover:text-gray-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && expenses.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedType || amountMin || amountMax
                ? 'Try adjusting your filters to see more results.'
                : `No expenses in ${tabs.find(t => t.id === activeTab)?.label.toLowerCase()} status.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseManagement;