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
  RefreshCw
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { hrService } from '../../services/hrService';
import { selectApiData } from '../../services/api';
import { toast } from 'react-hot-toast';

const ExpenseManagement = () => {
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState('approve');
  const [approvalComments, setApprovalComments] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  const queryClient = useQueryClient();


  // Fetch pending expenses
  const { data: pendingExpenses, isLoading: pendingLoading, error: pendingError } = useQuery(
    ['hr-pending-expenses', currentPage, searchTerm],
    () => hrService.getPendingExpenses({
      page: currentPage,
      limit: 10,
      search: searchTerm
    }),
    {
      select: (response) => {
        console.log('HR pending expenses RAW response:', response);
        const apiData = selectApiData(response);
        console.log('HR pending expenses API response after selectApiData:', apiData);
        
        // Check if we have nested data.data structure
        if (apiData && apiData.data && apiData.data.expenses) {
          console.log('Using nested data.data structure:', apiData.data.expenses.length, 'expenses');
          return apiData.data;
        }
        // Check if we have direct data structure
        if (apiData && apiData.expenses) {
          console.log('Using direct data structure:', apiData.expenses.length, 'expenses');
          return apiData;
        }
        // Check if response.data has the structure directly
        if (response?.data?.data?.expenses) {
          console.log('Using response.data.data structure:', response.data.data.expenses.length, 'expenses');
          return response.data.data;
        }
        // Check if response.data has expenses directly
        if (response?.data?.expenses) {
          console.log('Using response.data structure:', response.data.expenses.length, 'expenses');
          return response.data;
        }
        // Return empty structure if no data found
        console.log('No API data found, returning empty structure for HR pending expenses');
        return { expenses: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10 } };
      },
      enabled: selectedTab === 'pending',
      // Use mock data if API fails
      onError: (error) => {
        console.log('API error, using mock expense data for HR approval demo:', error.message);
      }
    }
  );

  
  // Fetch expense history
  const { data: expenseHistory, isLoading: historyLoading } = useQuery(
    ['hr-expense-history', currentPage, filterStatus, searchTerm],
    () => hrService.getExpenseHistory({
      page: currentPage,
      limit: 10,
      status: filterStatus,
      search: searchTerm
    }),
    {
      select: (response) => {
        console.log('HR expense history RAW response:', response);
        const apiData = selectApiData(response);
        console.log('HR expense history API response after selectApiData:', apiData);
        
        // Check if we have nested data.data structure
        if (apiData && apiData.data && apiData.data.expenses) {
          console.log('Using nested data.data structure for history:', apiData.data.expenses.length, 'expenses');
          return apiData.data;
        }
        // Check if we have direct data structure
        if (apiData && apiData.expenses) {
          console.log('Using direct data structure for history:', apiData.expenses.length, 'expenses');
          return apiData;
        }
        // Check if response.data has the structure directly
        if (response?.data?.data?.expenses) {
          console.log('Using response.data.data structure for history:', response.data.data.expenses.length, 'expenses');
          return response.data.data;
        }
        // Check if response.data has expenses directly
        if (response?.data?.expenses) {
          console.log('Using response.data structure for history:', response.data.expenses.length, 'expenses');
          return response.data;
        }
        // Return empty structure if no data found
        console.log('No API data found, returning empty structure for HR expense history');
        return { expenses: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 10 } };
      },
      enabled: selectedTab === 'history',
      onError: () => {
        console.log('Using mock expense history data for HR demo');
      }
    }
  );

  

  // Fetch expense stats
  const { data: expenseStats } = useQuery(
    'hr-expense-stats',
    () => hrService.getExpenseStats(),
    {
      select: (response) => {
        console.log('HR expense stats RAW response:', response);
        const apiData = selectApiData(response);
        console.log('HR expense stats API response after selectApiData:', apiData);
        
        // Check if we have nested data.data structure
        if (apiData && apiData.data) {
          console.log('Using nested data structure for HR stats:', apiData.data);
          return apiData.data;
        }
        // Check if we have direct data structure
        if (apiData && (apiData.pending_count !== undefined || apiData.approved_count !== undefined)) {
          console.log('Using direct data structure for HR stats:', apiData);
          return apiData;
        }
        // Check if response.data has the structure directly
        if (response?.data?.data) {
          console.log('Using response.data.data structure for HR stats:', response.data.data);
          return response.data.data;
        }
        // Check if response.data has stats directly
        if (response?.data && (response.data.pending_count !== undefined || response.data.approved_count !== undefined)) {
          console.log('Using response.data structure for HR stats:', response.data);
          return response.data;
        }
        // Return empty stats if no data found
        console.log('No API stats data found, returning empty stats for HR');
        return { pending_count: 0, approved_count: 0, total_amount: 0, avg_processing_days: 0 };
      },
      onError: () => {
        console.log('Using mock expense stats for HR demo');
      }
    }
  );

  // Approve expense mutation
  const approveExpenseMutation = useMutation(
    ({ id, approvalData }) => hrService.approveExpense(id, approvalData),
    {
      onSuccess: (response) => {
        const result = selectApiData(response);
        queryClient.invalidateQueries('hr-pending-expenses');
        queryClient.invalidateQueries('hr-expense-history');
        queryClient.invalidateQueries('hr-expense-stats');
        setShowApprovalModal(false);
        setSelectedExpense(null);
        setApprovalComments('');
        
        // Show success message
        toast(`Expense "${selectedExpense?.title}" has been approved and forwarded to Finance for payment processing.`);
      },
      onError: (error) => {
        console.error('Approve expense error:', error);
        toast.error('Failed to approve expense. Please try again.');
      }
    }
  );

  // Reject expense mutation
  const rejectExpenseMutation = useMutation(
    ({ id, rejectionData }) => hrService.rejectExpense(id, rejectionData),
    {
      onSuccess: (response) => {
        const result = selectApiData(response);
        queryClient.invalidateQueries('hr-pending-expenses');
        queryClient.invalidateQueries('hr-expense-history');
        queryClient.invalidateQueries('hr-expense-stats');
        setShowApprovalModal(false);
        setSelectedExpense(null);
        setApprovalComments('');
        
        // Show success message
        toast(`Expense "${selectedExpense?.title}" has been rejected. Employee will be notified.`);
      },
      onError: (error) => {
        console.error('Reject expense error:', error);
        toast.error('Failed to reject expense. Please try again.');
      }
    }
  );

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const handleApprovalAction = (expense, action) => {
    setSelectedExpense(expense);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const handleSubmitApproval = () => {
    if (!selectedExpense) return;

    if (approvalAction === 'approve') {
      const data = {
        comments: approvalComments
      };
      approveExpenseMutation.mutate({ id: selectedExpense.id, approvalData: data });
    } else {
      if (!approvalComments.trim()) {
        toast('Rejection reason is required');
        return;
      }
      const data = {
        reason: approvalComments
      };
      rejectExpenseMutation.mutate({ id: selectedExpense.id, rejectionData: data });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      submitted: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      hr_approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      hr_rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      finance_approved: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      finance_rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.pending;
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

  const currentData = selectedTab === 'pending' ? pendingExpenses : expenseHistory;
  const isLoading = selectedTab === 'pending' ? pendingLoading : historyLoading;
  
  console.log('HR currentData:', currentData);
  console.log('HR selectedTab:', selectedTab);
  console.log('HR isLoading:', isLoading);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600 mt-1">Review and approve employee expense claims</p>
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
              <p className="text-sm font-medium text-gray-600">Pending Approval</p>
              <p className="text-2xl font-semibold text-gray-900">
                {expenseStats?.pending_count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {expenseStats?.approved_count || 0}
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
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(expenseStats?.total_amount || 0)}
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
              <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
              <p className="text-2xl font-semibold text-gray-900">
                {expenseStats?.avg_processing_days || 0} days
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
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'pending'
                ? 'border-blue-500 text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="h-4 w-4 inline mr-2" />
            Pending Approval ({expenseStats?.pending_count || 0})
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'history'
                ? 'border-blue-500 text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            History
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
              >
                <option value="">All Statuses</option>
                <option value="hr_approved">HR Approved</option>
                <option value="hr_rejected">HR Rejected</option>
                <option value="finance_approved">Finance Approved</option>
                <option value="finance_rejected">Finance Rejected</option>
                <option value="paid">Paid</option>
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
                        {selectedTab === 'pending' ? 'No pending expenses to review' : 'No expense history available'}
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
                        <div className="mt-1">{getExpenseTypeBadge(expense.expense_type)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(expense.amount, expense.currency)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(expense.status)}
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
                        {selectedTab === 'pending' && expense.status === 'submitted' && (
                          <>
                            <button
                              onClick={() => handleApprovalAction(expense, 'approve')}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleApprovalAction(expense, 'reject')}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
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
                <h3 className="text-xl font-bold text-gray-900">Expense Details</h3>
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
                    <label className="block text-sm font-medium text-gray-500">Submitted Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedExpense.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {selectedExpense.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedExpense.description}</p>
                  </div>
                )}
                
                {selectedExpense.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedExpense.notes}</p>
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
                        className="text-primary hover:text-blue-800 underline"
                      >
                        View Receipt
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons in Modal */}
              {selectedExpense.status === 'submitted' && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleApprovalAction(selectedExpense, 'reject');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Expense
                    </button>
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleApprovalAction(selectedExpense, 'approve');
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Expense
                    </button>
                  </div>
                </div>
              )}
              
              {/* Status Information */}
              {selectedExpense.status !== 'submitted' && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-center">
                      {selectedExpense.status === 'hr_approved' && (
                        <div className="text-center">
                          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Expense Approved</p>
                          <p className="text-xs text-gray-500">Forwarded to Finance for payment processing</p>
                        </div>
                      )}
                      {selectedExpense.status === 'hr_rejected' && (
                        <div className="text-center">
                          <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Expense Rejected</p>
                          <p className="text-xs text-gray-500">Employee has been notified</p>
                          {selectedExpense.hr_comments && (
                            <p className="text-xs text-gray-600 mt-1 italic">"{selectedExpense.hr_comments}"</p>
                          )}
                        </div>
                      )}
                      {selectedExpense.status === 'draft' && (
                        <div className="text-center">
                          <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">Draft Expense</p>
                          <p className="text-xs text-gray-500">Waiting for employee to submit</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {approvalAction === 'approve' ? 'Approve' : 'Reject'} Expense
                </h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments {approvalAction === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={approvalComments}
                    onChange={(e) => setApprovalComments(e.target.value)}
                    rows={3}
                    placeholder={`Add ${approvalAction === 'approve' ? 'approval' : 'rejection'} comments...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    required={approvalAction === 'reject'}
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitApproval}
                    disabled={approvalAction === 'reject' && !approvalComments.trim()}
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      approvalAction === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {approvalAction === 'approve' ? 'Approve' : 'Reject'}
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