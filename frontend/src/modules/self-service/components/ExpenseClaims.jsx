import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, FileText, Plus, Filter, Search, Upload, Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { selfServiceService } from '@/services/selfServiceService';
import { useAuth } from '@/contexts/AuthContext';
import { selectApiData } from '@/services/api';
import { toast } from 'react-hot-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Badge,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui';

const ExpenseClaims = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    expense_date: '',
    amount: '',
    currency: 'NGN',
    expense_type: 'travel',
    project_id: '',
    receipt_attachment: '',
    notes: '',
    tax_amount: ''
  });

  useEffect(() => {
    console.log('useEffect triggered - fetching expenses');
    console.log('Current page:', pagination.currentPage);
    console.log('Filter status:', filterStatus);
    fetchExpenses();
  }, [pagination.currentPage, filterStatus]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...(filterStatus && { status: filterStatus })
      };
      
      console.log('=== FETCHING EXPENSES ===' );
      console.log('User:', user);
      console.log('Params:', params);
      console.log('Auth token exists:', !!localStorage.getItem('token'));
      
      const response = await selfServiceService.getMyExpenseClaims(params);
      console.log('Raw response:', response);
      console.log('Response status:', response?.status);
      console.log('Response data:', response?.data);
      
      const data = selectApiData(response);
      console.log('Extracted data:', data);
      
      if (data) {
        const expensesList = data.expenseClaims || data.expenses || [];
        console.log('Expenses list length:', expensesList.length);
        console.log('Expenses list:', expensesList);
        setExpenses(expensesList);
        
        if (data.pagination) {
          console.log('Pagination:', data.pagination);
          setPagination(data.pagination);
        }
      } else {
        console.warn('No data returned from API');
        setExpenses([]);
      }
    } catch (error) {
      console.error('=== ERROR FETCHING EXPENSES ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      console.error('Error config:', error.config);
      
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch expense claims';
      toast.error(errorMessage);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitExpense = async (e) => {
    e.preventDefault();
    try {
      const submitData = { ...formData };
      
      // Convert numeric fields and handle validation
      if (submitData.amount) {
        submitData.amount = parseFloat(submitData.amount);
      }
      if (submitData.tax_amount) {
        submitData.tax_amount = parseFloat(submitData.tax_amount);
      }
      
      // Use employee's department ID if available
      if (user?.Employee?.department_id) {
        submitData.department_id = user.Employee.department_id;
      }
      
      // Remove project_id if empty (make it truly optional)
      if (!submitData.project_id || submitData.project_id === '') {
        delete submitData.project_id;
      } else {
        submitData.project_id = parseInt(submitData.project_id);
      }
      
      // Remove empty fields to avoid validation errors
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
          delete submitData[key];
        }
      });
      
      console.log('Submitting expense data:', submitData);
      
      const response = await selfServiceService.createExpenseClaim(submitData);
      
      const data = selectApiData(response);
      if (data) {
        toast.success('Expense claim created successfully');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          expense_date: '',
          amount: '',
          currency: 'NGN',
          expense_type: 'travel',
          project_id: '',
          receipt_attachment: '',
          notes: '',
          tax_amount: ''
        });
        fetchExpenses();
      } else {
        toast.error('Failed to create expense claim');
      }
    } catch (error) {
      console.error('Error creating expense claim:', error);
      if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).join('\n');
        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error(error.response?.data?.message || 'Failed to create expense claim');
      }
    }
  };

  const handleViewExpense = (expense) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense claim?')) {
      return;
    }
    
    try {
      const response = await selfServiceService.deleteExpenseClaim(id);
      
      const data = selectApiData(response);
      if (data) {
        toast.success('Expense claim deleted successfully');
        fetchExpenses();
      } else {
        toast.error('Failed to delete expense claim');
      }
    } catch (error) {
      console.error('Error deleting expense claim:', error);
      toast.error('Failed to delete expense claim');
    }
  };

  const handleSubmitForApproval = async (id) => {
    if (!window.confirm('Are you sure you want to submit this expense claim for approval?')) {
      return;
    }
    
    try {
      const response = await selfServiceService.submitExpenseClaim(id);
      
      const data = selectApiData(response);
      if (data) {
        toast.success('Expense claim submitted for approval');
        fetchExpenses();
      } else {
        toast.error('Failed to submit expense claim');
      }
    } catch (error) {
      console.error('Error submitting expense claim:', error);
      toast.error('Failed to submit expense claim');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getExpenseTypeBadge = (type) => {
    const typeClasses = {
      travel: 'bg-blue-100 text-blue-800',
      meals: 'bg-green-100 text-green-800',
      accommodation: 'bg-purple-100 text-purple-800',
      office_supplies: 'bg-yellow-100 text-yellow-800',
      entertainment: 'bg-pink-100 text-pink-800',
      training: 'bg-indigo-100 text-indigo-800',
      communication: 'bg-teal-100 text-teal-800',
      other: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClasses[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.replace('_', ' ').charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-gray-600">Loading expense claims...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Expense Claims</h1>
          <p className="text-muted-foreground">Submit and track your expense claims</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Expense Claim
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search expense claims..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="relative">
          <select
            className="focus:ring-primary focus:border-blue-500 block w-full pl-3 pr-10 py-2 text-base border-gray-300 rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Expense Claims Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No expense claims found
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(expense.expense_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-1" />
                        {expense.amount} {expense.currency}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getExpenseTypeBadge(expense.expense_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewExpense(expense)}
                          className="text-primary hover:text-blue-900"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {expense.status === 'draft' && (
                          <>
                            <button
                              onClick={() => handleSubmitForApproval(expense.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Submit for Approval"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.totalItems}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.currentPage === i + 1
                          ? 'z-10 bg-primary-50 border-blue-500 text-primary'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Expense Claim Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">New Expense Claim</h3>
                    <p className="text-sm text-gray-500">Submit a new expense for reimbursement</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitExpense} className="p-6">
              <div className="space-y-8">
                {/* Basic Information Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-primary" />
                    Basic Information
                  </h4>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Expense Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., Business lunch with client"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows={3}
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Provide additional details about this expense..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="expense_date" className="block text-sm font-medium text-gray-700 mb-2">
                        Expense Date *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="expense_date"
                          id="expense_date"
                          value={formData.expense_date}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="expense_type" className="block text-sm font-medium text-gray-700 mb-2">
                        Expense Type *
                      </label>
                      <select
                        id="expense_type"
                        name="expense_type"
                        value={formData.expense_type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors bg-white"
                        required
                      >
                        <option value="travel">🚗 Travel & Transportation</option>
                        <option value="meals">🍽️ Meals & Entertainment</option>
                        <option value="accommodation">🏨 Accommodation</option>
                        <option value="office_supplies">📎 Office Supplies</option>
                        <option value="entertainment">🎉 Client Entertainment</option>
                        <option value="training">📚 Training & Development</option>
                        <option value="communication">📞 Communication</option>
                        <option value="other">📋 Other Expenses</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Financial Information Section */}
                <div className="bg-green-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                    Financial Details
                  </h4>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Amount *
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          name="amount"
                          id="amount"
                          step="0.01"
                          min="0"
                          value={formData.amount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                        Currency *
                      </label>
                      <select
                        name="currency"
                        id="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors bg-white"
                        required
                      >
                        <option value="NGN">₦ NGN - Nigerian Naira</option>
                        <option value="USD">$ USD - US Dollar</option>
                        <option value="EUR">€ EUR - Euro</option>
                        <option value="GBP">£ GBP - British Pound</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="tax_amount" className="block text-sm font-medium text-gray-700 mb-2">
                        Tax Amount
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          name="tax_amount"
                          id="tax_amount"
                          step="0.01"
                          min="0"
                          value={formData.tax_amount}
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Project Assignment Section */}
                <div className="bg-purple-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-purple-600" />
                    Project Assignment (Optional)
                  </h4>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="project_id" className="block text-sm font-medium text-gray-700 mb-2">
                        Project ID
                      </label>
                      <input
                        type="number"
                        name="project_id"
                        id="project_id"
                        value={formData.project_id}
                        onChange={handleInputChange}
                        placeholder="Enter project ID (optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Leave blank if this expense is not related to a specific project
                      </p>
                    </div>
                    
                    {user?.Employee?.Department && (
                      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-primary mr-2" />
                          <div>
                            <p className="text-sm font-medium text-blue-900">
                              Department: {user.Employee.Department.name}
                            </p>
                            <p className="text-xs text-primary-700">
                              This expense will be automatically assigned to your department
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information Section */}
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-yellow-600" />
                    Additional Information
                  </h4>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Add any additional notes or comments..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <label htmlFor="receipt_attachment" className="block text-sm font-medium text-gray-700 mb-2">
                        Receipt Attachment
                      </label>
                      <div className="mt-2 flex justify-center px-6 pt-8 pb-8 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                        <div className="space-y-2 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-2 py-1"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="receipt_attachment"
                                type="file"
                                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                                className="sr-only"
                                onChange={(e) => {
                                  if (e.target.files && e.target.files[0]) {
                                    setFormData({...formData, receipt_attachment: e.target.files[0].name});
                                  }
                                }}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, PDF, DOC up to 10MB</p>
                        </div>
                      </div>
                      {formData.receipt_attachment && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                            <span className="text-sm text-green-700 font-medium">
                              Selected file: {formData.receipt_attachment}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-8">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Expense Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Expense Claim Modal */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Expense Claim Details</h3>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Title</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedExpense.title}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <p className="mt-1">{getStatusBadge(selectedExpense.status)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Expense Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedExpense.expense_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Expense Type</label>
                    <p className="mt-1">{getExpenseTypeBadge(selectedExpense.expense_type)}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Amount</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedExpense.amount} {selectedExpense.currency}
                    </p>
                  </div>
                  
                  {selectedExpense.tax_amount && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Tax Amount</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedExpense.tax_amount} {selectedExpense.currency}
                      </p>
                    </div>
                  )}
                  
                  {selectedExpense.project?.name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Project</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedExpense.project.name}</p>
                    </div>
                  )}
                  
                  {selectedExpense.department?.name && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Department</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedExpense.department.name}</p>
                    </div>
                  )}
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
                        className="text-primary hover:text-blue-800"
                      >
                        View Receipt
                      </a>
                    </div>
                  </div>
                )}
                
                {selectedExpense.status === 'approved' && selectedExpense.ApprovedBy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Approved By</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedExpense.ApprovedBy.User.first_name} {selectedExpense.ApprovedBy.User.last_name}
                    </p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseClaims;