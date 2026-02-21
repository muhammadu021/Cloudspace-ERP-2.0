import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import financeService from '@/services/financeService';

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    type: 'journal',
    date: new Date().toISOString().split('T')[0],
    description: '',
    debit_account_id: '',
    credit_account_id: '',
    amount: '',
    currency: 'USD',
    exchange_rate: '1.0',
    reference_type: '',
    reference_id: '',
    reference_number: '',
    notes: ''
  });

  const transactionTypes = [
    { value: 'journal', label: 'Journal Entry', icon: FileText },
    { value: 'payment', label: 'Payment', icon: TrendingDown },
    { value: 'receipt', label: 'Receipt', icon: TrendingUp },
    { value: 'transfer', label: 'Transfer', icon: ArrowRight },
    { value: 'adjustment', label: 'Adjustment', icon: Edit }
  ];

  const referenceTypes = [
    { value: '', label: 'None' },
    { value: 'invoice', label: 'Invoice' },
    { value: 'bill', label: 'Bill' },
    { value: 'expense', label: 'Expense' },
    { value: 'project', label: 'Project' },
    { value: 'payroll', label: 'Payroll' },
    { value: 'asset', label: 'Asset' },
    { value: 'manual', label: 'Manual' }
  ];

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
  }, [currentPage, searchTerm, selectedType, selectedStatus, selectedAccount, dateFrom, dateTo]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(selectedType && { type: selectedType }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedAccount && { account_id: selectedAccount }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      });

      const queryParams = {};
      if (selectedType) queryParams.type = selectedType;
      if (selectedStatus) queryParams.status = selectedStatus;
      if (selectedAccount) queryParams.account_id = selectedAccount;
      if (dateFrom) queryParams.date_from = dateFrom;
      if (dateTo) queryParams.date_to = dateTo;

      const response = await financeService.getTransactions(queryParams);
      const data = response.data;

      if (data.success) {
        let filteredTransactions = data.data.transactions;
        
        // Apply search filter
        if (searchTerm) {
          filteredTransactions = filteredTransactions.filter(transaction =>
            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            transaction.transaction_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (transaction.reference_number && transaction.reference_number.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setTransactions(filteredTransactions);
        setTotalPages(data.data.pagination?.totalPages || 1);
      } else {
        setError('Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.response?.data?.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await financeService.getAccounts();
      const data = response.data;
      if (data.success) {
        setAccounts(data.data.accounts.filter(acc => acc.is_active));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = selectedTransaction
        ? await financeService.updateTransaction(selectedTransaction.id, formData)
        : await financeService.createTransaction(formData);

      const data = response.data;

      if (data.success) {
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        setSelectedTransaction(null);
        fetchTransactions();
      } else {
        setError(data.message || 'Failed to save transaction');
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      setError('Failed to save transaction');
    }
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setFormData({
      type: transaction.type,
      date: transaction.date,
      description: transaction.description,
      debit_account_id: transaction.debit_account_id,
      credit_account_id: transaction.credit_account_id,
      amount: transaction.amount,
      currency: transaction.currency || 'USD',
      exchange_rate: transaction.exchange_rate || '1.0',
      reference_type: transaction.reference_type || '',
      reference_id: transaction.reference_id || '',
      reference_number: transaction.reference_number || '',
      notes: transaction.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      const response = await financeService.deleteTransaction(transactionId);
      const data = response.data;

      if (data.success) {
        fetchTransactions();
      } else {
        setError(data.message || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setError(error.response?.data?.message || 'Failed to delete transaction');
    }
  };

  const handleApprove = async (transactionId) => {
    try {
      const response = await financeService.approveTransaction(transactionId);
      const data = response.data;

      if (data.success) {
        fetchTransactions();
      } else {
        setError(data.message || 'Failed to approve transaction');
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      setError(error.response?.data?.message || 'Failed to approve transaction');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'journal',
      date: new Date().toISOString().split('T')[0],
      description: '',
      debit_account_id: '',
      credit_account_id: '',
      amount: '',
      currency: 'USD',
      exchange_rate: '1.0',
      reference_type: '',
      reference_id: '',
      reference_number: '',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: FileText },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: X },
      posted: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    const typeConfig = transactionTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : FileText;
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

  if (loading && transactions.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading transactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Management</h1>
          <p className="text-gray-600 mt-1">Record and manage financial transactions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Transaction</span>
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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search transactions..."
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
            {transactionTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="posted">Posted</option>
          </select>

          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.code} - {account.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="From Date"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="To Date"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedStatus('');
              setSelectedAccount('');
              setDateFrom('');
              setDateTo('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accounts
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
              {transactions.map((transaction) => {
                const Icon = getTypeIcon(transaction.type);
                
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.transaction_number}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center text-gray-900 mb-1">
                          <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                          <span className="font-medium">Dr:</span>
                          <span className="ml-1">{transaction.DebitAccount?.name}</span>
                        </div>
                        <div className="flex items-center text-gray-900">
                          <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                          <span className="font-medium">Cr:</span>
                          <span className="ml-1">{transaction.CreditAccount?.name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </span>
                      </div>
                      {transaction.currency !== 'USD' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Rate: {transaction.exchange_rate}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </span>
                      </div>
                      {transaction.reference_number && (
                        <div className="text-xs text-gray-500 mt-1">
                          Ref: {transaction.reference_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(transaction)}
                          className="text-primary hover:text-blue-900 p-1 rounded"
                          title="Edit Transaction"
                          disabled={transaction.status === 'posted'}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {transaction.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(transaction.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Approve Transaction"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {transaction.status !== 'posted' && !transaction.reconciled && (
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Transaction"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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
        {!loading && transactions.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedType || selectedStatus || selectedAccount || dateFrom || dateTo
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first transaction.'}
            </p>
            {!searchTerm && !selectedType && !selectedStatus && !selectedAccount && !dateFrom && !dateTo && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Create First Transaction
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Transaction Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedTransaction ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedTransaction(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {transactionTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Debit Account *
                  </label>
                  <select
                    value={formData.debit_account_id}
                    onChange={(e) => setFormData({ ...formData, debit_account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select Debit Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Account *
                  </label>
                  <select
                    value={formData.credit_account_id}
                    onChange={(e) => setFormData({ ...formData, credit_account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select Credit Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="NGN">NGN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Type
                  </label>
                  <select
                    value={formData.reference_type}
                    onChange={(e) => setFormData({ ...formData, reference_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {referenceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedTransaction(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
                >
                  {selectedTransaction ? 'Update Transaction' : 'Create Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;