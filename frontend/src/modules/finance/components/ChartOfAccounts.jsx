import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Building,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  CreditCard,
  Wallet,
  PieChart
} from 'lucide-react';
import financeService from '@/services/financeService';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'asset',
    subtype: '',
    parent_account_id: '',
    normal_balance: 'debit',
    description: '',
    bank_account: false,
    bank_name: '',
    account_number: '',
    routing_number: '',
    currency: 'USD',
    tax_account: false
  });

  const accountTypes = [
    { value: 'asset', label: 'Asset', icon: Building, color: 'text-green-600' },
    { value: 'liability', label: 'Liability', icon: CreditCard, color: 'text-red-600' },
    { value: 'equity', label: 'Equity', icon: Wallet, color: 'text-primary' },
    { value: 'revenue', label: 'Revenue', icon: TrendingUp, color: 'text-purple-600' },
    { value: 'expense', label: 'Expense', icon: TrendingDown, color: 'text-orange-600' }
  ];

  useEffect(() => {
    fetchAccounts();
  }, [searchTerm, selectedType, selectedStatus]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedType) params.type = selectedType;
      if (selectedStatus !== '') params.is_active = selectedStatus;

      const response = await financeService.getAccounts(params);
      const data = response.data;

      if (data.success) {
        let filteredAccounts = data.data.accounts;
        
        // Apply search filter
        if (searchTerm) {
          filteredAccounts = filteredAccounts.filter(account =>
            account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (account.description && account.description.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setAccounts(filteredAccounts);
      } else {
        setError('Failed to fetch accounts');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Clean up form data
      const submitData = { ...formData };
      if (!submitData.parent_account_id) submitData.parent_account_id = null;
      if (!submitData.bank_account) {
        submitData.bank_name = '';
        submitData.account_number = '';
        submitData.routing_number = '';
      }
      
      const response = selectedAccount
        ? await financeService.updateAccount(selectedAccount.id, submitData)
        : await financeService.createAccount(submitData);

      const data = response.data;

      if (data.success) {
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        setSelectedAccount(null);
        fetchAccounts();
      } else {
        setError(data.message || 'Failed to save account');
      }
    } catch (error) {
      console.error('Error saving account:', error);
      setError(error.response?.data?.message || 'Failed to save account');
    }
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      subtype: account.subtype || '',
      parent_account_id: account.parent_account_id || '',
      normal_balance: account.normal_balance,
      description: account.description || '',
      bank_account: account.bank_account || false,
      bank_name: account.bank_name || '',
      account_number: account.account_number || '',
      routing_number: account.routing_number || '',
      currency: account.currency || 'USD',
      tax_account: account.tax_account || false
    });
    setShowEditModal(true);
  };

  const handleDelete = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await financeService.deleteAccount(accountId);
      const data = response.data;

      if (data.success) {
        fetchAccounts();
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      type: 'asset',
      subtype: '',
      parent_account_id: '',
      normal_balance: 'debit',
      description: '',
      bank_account: false,
      bank_name: '',
      account_number: '',
      routing_number: '',
      currency: 'USD',
      tax_account: false
    });
  };

  const getAccountTypeIcon = (type) => {
    const typeConfig = accountTypes.find(t => t.value === type);
    if (!typeConfig) return Building;
    return typeConfig.icon;
  };

  const getAccountTypeColor = (type) => {
    const typeConfig = accountTypes.find(t => t.value === type);
    if (!typeConfig) return 'text-gray-600';
    return typeConfig.color;
  };

  const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Active
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        <X className="h-3 w-3 mr-1" />
        Inactive
      </span>
    );
  };

  // Group accounts by type for better organization
  const groupedAccounts = accounts.reduce((groups, account) => {
    const type = account.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(account);
    return groups;
  }, {});

  if (loading && accounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chart of Accounts</h1>
          <p className="text-gray-600 mt-1">Manage your financial account structure</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Account</span>
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

      {/* Account Type Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {accountTypes.map((type) => {
          const typeAccounts = groupedAccounts[type.value] || [];
          const totalBalance = typeAccounts.reduce((sum, account) => sum + parseFloat(account.current_balance || 0), 0);
          const Icon = type.icon;
          
          return (
            <div key={type.value} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{type.label}</p>
                  <p className={`text-2xl font-bold ${type.color}`}>
                    {typeAccounts.length}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(totalBalance)}
                  </p>
                </div>
                <Icon className={`h-8 w-8 ${type.color}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search accounts..."
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
            {accountTypes.map((type) => (
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
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedStatus('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Accounts List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Balance
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
              {accounts.map((account) => {
                const Icon = getAccountTypeIcon(account.type);
                const typeColor = getAccountTypeColor(account.type);
                
                return (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon className={`h-5 w-5 ${typeColor}`} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {account.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {account.code}
                          </div>
                          {account.description && (
                            <div className="text-xs text-gray-400 mt-1">
                              {account.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${typeColor}`}>
                          {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                        </span>
                        {account.bank_account && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            Bank
                          </span>
                        )}
                        {account.tax_account && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            Tax
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Normal: {account.normal_balance}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(account.current_balance, account.currency)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {account.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(account.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(account)}
                          className="text-primary hover:text-blue-900 p-1 rounded"
                          title="Edit Account"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {!account.is_system && (
                          <button
                            onClick={() => handleDelete(account.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Account"
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

        {/* Empty State */}
        {!loading && accounts.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedType || selectedStatus
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first account.'}
            </p>
            {!searchTerm && !selectedType && !selectedStatus && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Create First Account
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Account Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedAccount ? 'Edit Account' : 'Add New Account'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedAccount(null);
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
                    Account Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({ 
                        ...formData, 
                        type: newType,
                        normal_balance: ['asset', 'expense'].includes(newType) ? 'debit' : 'credit'
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {accountTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Normal Balance *
                  </label>
                  <select
                    value={formData.normal_balance}
                    onChange={(e) => setFormData({ ...formData, normal_balance: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="debit">Debit</option>
                    <option value="credit">Credit</option>
                  </select>
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
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="NGN">NGN - Nigerian Naira</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Account
                  </label>
                  <select
                    value={formData.parent_account_id}
                    onChange={(e) => setFormData({ ...formData, parent_account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">None (Top Level)</option>
                    {accounts
                      .filter(acc => acc.type === formData.type && acc.id !== selectedAccount?.id)
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.code} - {account.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.bank_account}
                    onChange={(e) => setFormData({ ...formData, bank_account: e.target.checked })}
                    className="rounded border-gray-300 text-primary shadow-sm focus:border-blue-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bank Account</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.tax_account}
                    onChange={(e) => setFormData({ ...formData, tax_account: e.target.checked })}
                    className="rounded border-gray-300 text-primary shadow-sm focus:border-blue-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Tax Account</span>
                </label>
              </div>

              {formData.bank_account && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-primary-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Routing Number
                    </label>
                    <input
                      type="text"
                      value={formData.routing_number}
                      onChange={(e) => setFormData({ ...formData, routing_number: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedAccount(null);
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
                  {selectedAccount ? 'Update Account' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChartOfAccounts;