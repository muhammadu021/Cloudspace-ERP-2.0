import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Clock,
  AlertTriangle,
  FileText,
  Building,
  CreditCard,
  TrendingUp,
  Download,
  RefreshCw,
  Banknote,
  Receipt,
  ArrowRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { financeService } from '../../services/financeService';
import { selectApiData } from '../../services/api';
import { toast } from 'react-hot-toast';

const ExpenseManagement = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAction, setPaymentAction] = useState('approve');
  const [paymentComments, setPaymentComments] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [paymentReference, setPaymentReference] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  // Fetch pending finance expenses (HR approved)
  const { data: pendingExpenses, isLoading: pendingLoading, error: pendingError } = useQuery(
    ['finance-pending-expenses', currentPage, searchTerm],
    () => financeService.getPendingFinanceExpenses({
      page: currentPage,
      limit: 10,
      search: searchTerm
    }),
    {
      select: (response) => {
        const apiData = selectApiData(response);
        return apiData?.data || apiData;
      },
      onError: (error) => {
        console.error('Finance pending expenses API error:', error.message);
      }
    }
  );

  // Fetch approved expenses list
  const { data: approvedExpenses, isLoading: approvedLoading } = useQuery(
    ['finance-approved-expenses', currentPage, searchTerm],
    () => financeService.getApprovedExpensesList({
      page: currentPage,
      limit: 10,
      search: searchTerm
    }),
    {
      select: (response) => selectApiData(response),
      enabled: selectedTab === 'approved',
      onError: () => {
        console.error('Failed to fetch approved expenses');
      }
    }
  );

  // Fetch payment history
  const { data: paymentHistory, isLoading: historyLoading } = useQuery(
    ['finance-payment-history', currentPage, filterStatus, searchTerm],
    () => financeService.getExpensePaymentHistory({
      page: currentPage,
      limit: 10,
      status: filterStatus,
      search: searchTerm
    }),
    {
      select: (response) => selectApiData(response),
      enabled: selectedTab === 'history',
      onError: () => {
        console.error('Failed to fetch payment history');
      }
    }
  );

  // Fetch expense stats
  const { data: expenseStats } = useQuery(
    'finance-expense-stats',
    () => financeService.getExpenseStats(),
    {
      select: (response) => {
        const apiData = selectApiData(response);
        return apiData?.data || apiData;
      },
      onError: (error) => {
        console.error('Finance expense stats API error:', error.message);
      }
    }
  );

  // Approve payment mutation
  const approvePaymentMutation = useMutation(
    ({ id, approvalData }) => financeService.approveExpensePayment(id, approvalData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('finance-pending-expenses');
        queryClient.invalidateQueries('finance-approved-expenses');
        queryClient.invalidateQueries('finance-payment-history');
        queryClient.invalidateQueries('finance-expense-stats');
        setShowPaymentModal(false);
        setSelectedExpense(null);
        setPaymentComments('');
        setPaymentReference('');
      }
    }
  );

  // Reject payment mutation
  const rejectPaymentMutation = useMutation(
    ({ id, rejectionData }) => financeService.rejectExpensePayment(id, rejectionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('finance-pending-expenses');
        queryClient.invalidateQueries('finance-approved-expenses');
        queryClient.invalidateQueries('finance-payment-history');
        queryClient.invalidateQueries('finance-expense-stats');
        setShowPaymentModal(false);
        setSelectedExpense(null);
        setPaymentComments('');
      }
    }
  );

  // Process payment mutation
  const processPaymentMutation = useMutation(
    ({ id, paymentData }) => financeService.processExpensePayment(id, paymentData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('finance-pending-expenses');
        queryClient.invalidateQueries('finance-approved-expenses');
        queryClient.invalidateQueries('finance-payment-history');
        queryClient.invalidateQueries('finance-expense-stats');
        setShowPaymentModal(false);
        setSelectedExpense(null);
        setPaymentComments('');
        setPaymentReference('');
      }
    }
  );

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const handlePaymentAction = (expense, action) => {
    setSelectedExpense(expense);
    setPaymentAction(action);
    setShowPaymentModal(true);
  };

  const handleSubmitPayment = () => {
    if (!selectedExpense) return;

    const data = {
      comments: paymentComments,
      processed_at: new Date().toISOString()
    };

    // For demo purposes, show success message
    if (paymentAction === 'approve') {
      data.payment_method = paymentMethod;
      data.payment_reference = paymentReference;
      toast(`Expense "${selectedExpense.title}" has been approved for payment. Payment method: ${paymentMethod}, Reference: ${paymentReference}`);
      // In real implementation: approvePaymentMutation.mutate({ id: selectedExpense.id, approvalData: data });
    } else if (paymentAction === 'process') {
      data.payment_method = paymentMethod;
      data.payment_reference = paymentReference;
      data.payment_status = 'paid';
      toast(`Payment processed for expense "${selectedExpense.title}". Payment method: ${paymentMethod}, Reference: ${paymentReference}`);
      // In real implementation: processPaymentMutation.mutate({ id: selectedExpense.id, paymentData: data });
    } else {
      toast(`Expense "${selectedExpense.title}" has been rejected for payment. Reason: ${paymentComments}`);
      // In real implementation: rejectPaymentMutation.mutate({ id: selectedExpense.id, rejectionData: data });
    }

    setShowPaymentModal(false);
    setSelectedExpense(null);
    setPaymentComments('');
    setPaymentReference('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      hr_approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      finance_approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      finance_rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      payment_pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      paid: { color: 'bg-purple-100 text-purple-800', icon: Banknote },
      processing: { color: 'bg-orange-100 text-orange-800', icon: Clock }
    };

    const config = statusConfig[status] || statusConfig.hr_approved;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getExpenseTypeBadge = (type) => {
    const typeConfig = {
      travel: { color: 'bg-blue-100 text-blue-800', icon: '🚗' },
      meals: { color: 'bg-green-100 text-green-800', icon: '🍽️' },
      accommodation: { color: 'bg-purple-100 text-purple-800', icon: '🏨' },
      office_supplies: { color: 'bg-yellow-100 text-yellow-800', icon: '📎' },
      entertainment: { color: 'bg-pink-100 text-pink-800', icon: '🎉' },
      training: { color: 'bg-indigo-100 text-indigo-800', icon: '📚' },
      communication: { color: 'bg-teal-100 text-teal-800', icon: '📞' },
      other: { color: 'bg-gray-100 text-gray-800', icon: '📋' }
    };

    const config = typeConfig[type] || typeConfig.other;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon} {type.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const formatCurrency = (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getCurrentData = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingExpenses;
      case 'approved':
        return approvedExpenses;
      case 'history':
        return paymentHistory;
      default:
        return null;
    }
  };

  const getCurrentLoading = () => {
    switch (selectedTab) {
      case 'pending':
        return pendingLoading;
      case 'approved':
        return approvedLoading;
      case 'history':
        return historyLoading;
      default:
        return false;
    }
  };

  const currentData = getCurrentData();
  const isLoading = getCurrentLoading();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Payment Management</h1>
          <p className="text-gray-600 mt-1">Process and manage expense payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Payment</p>
              <p className="text-2xl font-semibold text-gray-900">
                {expenseStats?.pending_payment_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Banknote className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Paid This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {expenseStats?.paid_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(expenseStats?.total_paid_amount || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Payment Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {expenseStats?.avg_payment_days || 0} days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'pending'
              ? 'border-blue-500 text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Pending Payment ({expenseStats?.pending_payment_count || 0})
          </button>
          <button
            onClick={() => setSelectedTab('approved')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'approved'
              ? 'border-blue-500 text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <CheckCircle className="h-4 w-4 inline mr-2" />
            Approved for Payment
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${selectedTab === 'history'
              ? 'border-blue-500 text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Payment History
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
              />
            </div>
          </div>

          {selectedTab === 'history' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="finance_rejected">Rejected</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Flow
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
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-500">Loading expenses...</span>
                    </div>
                  </td>
                </tr>
              ) : currentData?.expenses?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses found</h3>
                      <p className="text-gray-500">
                        {selectedTab === 'pending' ? 'No expenses pending payment' :
                          selectedTab === 'approved' ? 'No approved expenses' : 'No payment history available'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentData?.expenses?.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {expense.Employee?.User?.first_name} {expense.Employee?.User?.last_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            {expense.Employee?.Department?.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{expense.description}</div>
                        <div className="mt-1 flex items-center space-x-2">
                          {getExpenseTypeBadge(expense.expense_type)}
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(expense.expense_date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(expense.amount, expense.currency)}
                        </span>
                      </div>
                      {expense.tax_amount && (
                        <div className="text-xs text-gray-500">
                          Tax: {formatCurrency(expense.tax_amount, expense.currency)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1 text-xs">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Employee</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">HR</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span className={`px-2 py-1 rounded ${expense.status === 'paid' ? 'bg-green-100 text-green-800' :
                          expense.status === 'finance_approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                          Finance
                        </span>
                      </div>
                      {expense.hr_approved_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          HR: {new Date(expense.hr_approved_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(expense.status)}
                      {expense.payment_reference && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ref: {expense.payment_reference}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewExpense(expense)}
                          className="text-primary hover:text-blue-900 p-1 rounded"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {selectedTab === 'pending' && expense.status === 'hr_approved' && (
                          <>
                            <button
                              onClick={() => handlePaymentAction(expense, 'approve')}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Approve Payment"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handlePaymentAction(expense, 'reject')}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Reject Payment"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        {selectedTab === 'approved' && expense.status === 'finance_approved' && (
                          <button
                            onClick={() => handlePaymentAction(expense, 'process')}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                            title="Process Payment"
                          >
                            <Banknote className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Expense Modal */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Expense Payment Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Employee</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedExpense.Employee?.User?.first_name} {selectedExpense.Employee?.User?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Department</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedExpense.Employee?.Department?.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Title</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedExpense.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedExpense.status)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Amount</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatCurrency(selectedExpense.amount, selectedExpense.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Expense Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedExpense.expense_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Type</label>
                    <div className="mt-1">{getExpenseTypeBadge(selectedExpense.expense_type)}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">HR Approved</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedExpense.hr_approved_at ? new Date(selectedExpense.hr_approved_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                {selectedExpense.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedExpense.description}</p>
                  </div>
                )}

                {selectedExpense.hr_comments && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">HR Comments</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedExpense.hr_comments}</p>
                  </div>
                )}

                {selectedExpense.finance_comments && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Finance Comments</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedExpense.finance_comments}</p>
                  </div>
                )}

                {selectedExpense.payment_method && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Payment Method</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedExpense.payment_method}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Payment Reference</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedExpense.payment_reference}</p>
                    </div>
                  </div>
                )}

                {selectedExpense.receipt_attachment && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Receipt</label>
                    <div className="mt-1">
                      <a
                        href={selectedExpense.receipt_attachment}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-blue-800 underline flex items-center"
                      >
                        <Receipt className="h-4 w-4 mr-1" />
                        View Receipt
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Action Modal */}
      {showPaymentModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {paymentAction === 'approve' ? 'Approve Payment' :
                    paymentAction === 'process' ? 'Process Payment' : 'Reject Payment'}
                </h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-900">{selectedExpense.title}</p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(selectedExpense.amount, selectedExpense.currency)} -
                    {selectedExpense.Employee?.User?.first_name} {selectedExpense.Employee?.User?.last_name}
                  </p>
                </div>

                {(paymentAction === 'approve' || paymentAction === 'process') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method *
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                        required
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="check">Check</option>
                        <option value="cash">Cash</option>
                        <option value="digital_wallet">Digital Wallet</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Reference *
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="Enter payment reference number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments {paymentAction === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={paymentComments}
                    onChange={(e) => setPaymentComments(e.target.value)}
                    rows={3}
                    placeholder={`Add ${paymentAction} comments...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    required={paymentAction === 'reject'}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitPayment}
                    disabled={
                      (paymentAction === 'reject' && !paymentComments.trim()) ||
                      ((paymentAction === 'approve' || paymentAction === 'process') && (!paymentReference.trim()))
                    }
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${paymentAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                      paymentAction === 'process' ? 'bg-purple-600 hover:bg-purple-700' :
                        'bg-red-600 hover:bg-red-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {paymentAction === 'approve' ? 'Approve Payment' :
                      paymentAction === 'process' ? 'Process Payment' : 'Reject Payment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseManagement;