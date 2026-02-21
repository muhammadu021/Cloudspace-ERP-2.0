import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Target,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  Calendar,
  DollarSign,
  BarChart3,
  PieChart
} from 'lucide-react';

const BudgetManagement = () => {
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'monthly',
    period_start: '',
    period_end: '',
    project_id: '',
    department_id: '',
    account_id: '',
    budgeted_amount: '',
    currency: 'USD',
    notes: ''
  });

  const budgetTypes = [
    { value: 'annual', label: 'Annual', icon: Calendar },
    { value: 'quarterly', label: 'Quarterly', icon: BarChart3 },
    { value: 'monthly', label: 'Monthly', icon: Calendar },
    { value: 'project', label: 'Project', icon: Target },
    { value: 'department', label: 'Department', icon: PieChart }
  ];

  useEffect(() => {
    fetchBudgets();
    fetchAccounts();
    fetchProjects();
    fetchDepartments();
  }, [searchTerm, selectedType, selectedStatus]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`/api/v1/finance/budgets?${params}`);
      const data = await response.json();

      if (data.success) {
        let filteredBudgets = data.data.budgets;
        
        // Apply search filter
        if (searchTerm) {
          filteredBudgets = filteredBudgets.filter(budget =>
            budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (budget.notes && budget.notes.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }
        
        setBudgets(filteredBudgets);
      } else {
        setError('Failed to fetch budgets');
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
      setError('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/v1/finance/accounts');
      const data = await response.json();
      if (data.success) {
        setAccounts(data.data.accounts.filter(acc => acc.is_active));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      // This would be the actual projects endpoint
      setProjects([
        { id: 1, name: 'Project Alpha', code: 'PA' },
        { id: 2, name: 'Project Beta', code: 'PB' }
      ]);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/v1/hr/departments');
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data.departments);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedBudget 
        ? `/api/v1/finance/budgets/${selectedBudget.id}`
        : '/api/v1/finance/budgets';
      
      const method = selectedBudget ? 'PUT' : 'POST';
      
      // Clean up form data
      const submitData = { ...formData };
      if (!submitData.project_id) submitData.project_id = null;
      if (!submitData.department_id) submitData.department_id = null;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setShowAddModal(false);
        setShowEditModal(false);
        resetForm();
        setSelectedBudget(null);
        fetchBudgets();
      } else {
        setError(data.message || 'Failed to save budget');
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      setError('Failed to save budget');
    }
  };

  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setFormData({
      name: budget.name,
      type: budget.type,
      period_start: budget.period_start,
      period_end: budget.period_end,
      project_id: budget.project_id || '',
      department_id: budget.department_id || '',
      account_id: budget.account_id,
      budgeted_amount: budget.budgeted_amount,
      currency: budget.currency || 'USD',
      notes: budget.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/finance/budgets/${budgetId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchBudgets();
      } else {
        setError(data.message || 'Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      setError('Failed to delete budget');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'monthly',
      period_start: '',
      period_end: '',
      project_id: '',
      department_id: '',
      account_id: '',
      budgeted_amount: '',
      currency: 'USD',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      closed: { color: 'bg-blue-100 text-blue-800', icon: X },
      cancelled: { color: 'bg-red-100 text-red-800', icon: X }
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
    const typeConfig = budgetTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : Target;
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

  const calculateProgress = (budget) => {
    const actual = budget.actual_amount || 0;
    const budgeted = budget.budgeted_amount || 1;
    return Math.min((actual / budgeted) * 100, 100);
  };

  const getProgressColor = (progress) => {
    if (progress <= 50) return 'bg-green-500';
    if (progress <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading && budgets.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading budgets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-1">Plan and monitor financial budgets</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Budget</span>
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

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budgets</p>
              <p className="text-3xl font-bold text-primary">{budgets.length}</p>
            </div>
            <Target className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Budgets</p>
              <p className="text-3xl font-bold text-green-600">
                {budgets.filter(b => b.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Allocated</p>
              <p className="text-3xl font-bold text-purple-600">
                {formatCurrency(budgets.reduce((sum, b) => sum + parseFloat(b.budgeted_amount || 0), 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Utilization</p>
              <p className="text-3xl font-bold text-orange-600">
                {budgets.length > 0 
                  ? Math.round(budgets.reduce((sum, b) => sum + calculateProgress(b), 0) / budgets.length)
                  : 0}%
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search budgets..."
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
            {budgetTypes.map((type) => (
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
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="cancelled">Cancelled</option>
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

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const Icon = getTypeIcon(budget.type);
          const progress = calculateProgress(budget);
          const progressColor = getProgressColor(progress);
          const remaining = budget.budgeted_amount - (budget.actual_amount || 0);
          
          return (
            <div key={budget.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{budget.name}</h3>
                    <p className="text-sm text-gray-500">{budget.type.charAt(0).toUpperCase() + budget.type.slice(1)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(budget.status)}
                </div>
              </div>

              {/* Budget Details */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Period:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(budget.period_start)} - {formatDate(budget.period_end)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {budget.Account?.name || 'N/A'}
                  </span>
                </div>

                {budget.Project && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Project:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {budget.Project.name}
                    </span>
                  </div>
                )}

                {budget.Department && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Department:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {budget.Department.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Budget Progress */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Budgeted:</span>
                  <span className="text-sm font-bold text-gray-900">
                    {formatCurrency(budget.budgeted_amount, budget.currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Actual:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(budget.actual_amount || 0, budget.currency)}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining:</span>
                  <span className={`text-sm font-medium ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(remaining, budget.currency)}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${progressColor}`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{progress.toFixed(1)}% utilized</span>
                  <span>{remaining >= 0 ? 'Under budget' : 'Over budget'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="text-primary hover:text-blue-900 p-1 rounded"
                    title="Edit Budget"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {budget.status !== 'active' && (
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded"
                      title="Delete Budget"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-400">
                  ID: {budget.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!loading && budgets.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || selectedType || selectedStatus
                ? 'Try adjusting your filters to see more results.'
                : 'Get started by creating your first budget.'}
            </p>
            {!searchTerm && !selectedType && !selectedStatus && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Create First Budget
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Budget Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedBudget ? 'Edit Budget' : 'New Budget'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedBudget(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Name *
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
                    Budget Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {budgetTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account *
                  </label>
                  <select
                    value={formData.account_id}
                    onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period Start *
                  </label>
                  <input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period End *
                  </label>
                  <input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budgeted Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.budgeted_amount}
                    onChange={(e) => setFormData({ ...formData, budgeted_amount: e.target.value })}
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
                    Project
                  </label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">None</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.code} - {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">None</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
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
                    setSelectedBudget(null);
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
                  {selectedBudget ? 'Update Budget' : 'Create Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetManagement;