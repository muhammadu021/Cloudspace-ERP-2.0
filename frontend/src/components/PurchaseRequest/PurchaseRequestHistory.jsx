import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import purchaseRequestService from '../../services/purchaseRequestService';
import toast from 'react-hot-toast';
import { LayoutGrid, List as ListIcon, BarChart3, Eye, User, Building, FileText } from 'lucide-react';

const PurchaseRequestHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'kanban', 'list', 'dashboard'
  const [selectedInterval, setSelectedInterval] = useState('30days');
  const [filters, setFilters] = useState({
    status: '', // Show all statuses by default
    date_from: '',
    date_to: '',
    department: ''
  });

  // Kanban columns based on workflow stages
  const columns = [
    {
      id: "pending_approval",
      title: "Manager Approval",
      status: ["pending_approval"],
      color: "bg-primary-50 border-primary-200",
      headerColor: "bg-blue-100 text-blue-800",
    },
    {
      id: "procurement",
      title: "Procurement Confirmation",
      status: ["pending_procurement_review"],
      color: "bg-purple-50 border-purple-200",
      headerColor: "bg-purple-100 text-purple-800",
    },
    {
      id: "finance",
      title: "Finance Confirmation",
      status: ["pending_finance_approval"],
      color: "bg-indigo-50 border-indigo-200",
      headerColor: "bg-indigo-100 text-indigo-800",
    },
    {
      id: "payment",
      title: "Pay Vendor",
      status: ["payment_in_progress"],
      color: "bg-pink-50 border-pink-200",
      headerColor: "bg-pink-100 text-pink-800",
    },
    {
      id: "delivery",
      title: "Request Closed",
      status: ["awaiting_delivery_confirmation", "completed"],
      color: "bg-green-50 border-green-200",
      headerColor: "bg-green-100 text-green-800",
    },
  ];

  // Calculate date ranges based on interval
  const getDateRange = (interval) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let fromDate, toDate;

    switch (interval) {
      case '7days':
        toDate = new Date(today);
        fromDate = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case '14days':
        toDate = new Date(today);
        fromDate = new Date(today.getTime() - (14 * 24 * 60 * 60 * 1000));
        break;
      case '30days':
        toDate = new Date(today);
        fromDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case 'thisWeek':
        const dayOfWeek = today.getDay();
        toDate = new Date(today);
        fromDate = new Date(today.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
        break;
      case 'lastWeek':
        const dayOfWeek2 = today.getDay();
        const lastWeekEnd = new Date(today.getTime() - (dayOfWeek2 * 24 * 60 * 60 * 1000) - (24 * 60 * 60 * 1000));
        const lastWeekStart = new Date(lastWeekEnd.getTime() - (6 * 24 * 60 * 60 * 1000));
        fromDate = lastWeekStart;
        toDate = lastWeekEnd;
        break;
      case 'allTime':
        // Get all historical data (last 365 days)
        toDate = new Date(today);
        fromDate = new Date(today.getTime() - (365 * 24 * 60 * 60 * 1000));
        break;
      case 'custom':
        // Keep existing custom dates
        return {
          date_from: filters.date_from,
          date_to: filters.date_to
        };
      default:
        toDate = new Date(today);
        fromDate = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000)); // Default to 30 days
    }

    return {
      date_from: fromDate.toISOString().split('T')[0],
      date_to: toDate.toISOString().split('T')[0]
    };
  };

  // Interval options
  const intervalOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '14days', label: 'Last 14 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'allTime', label: 'All Time (1 Year)' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'awaiting_delivery_confirmation', label: 'Awaiting Delivery' },
    { value: 'payment_in_progress', label: 'Payment in Progress' }
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'IT', label: 'IT' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Finance', label: 'Finance' },
    { value: 'HR', label: 'HR' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Admin', label: 'Admin' },
    // Legacy departments for backward compatibility
    { value: 'operations_1', label: 'Operations 1' },
    { value: 'operations_2', label: 'Operations 2' },
    { value: 'admin', label: 'Admin (Legacy)' },
    { value: 'farm_manager', label: 'Farm Manager' }
  ];

  // Initialize with 30-day interval on mount
  useEffect(() => {
    const dateRange = getDateRange('30days');
    setFilters(prev => ({
      ...prev,
      ...dateRange
    }));
  }, []);

  // Fetch requests when filters change
  useEffect(() => {
    if (filters.date_from && filters.date_to) {
      fetchHistoryRequests();
    }
  }, [filters]);

  // Handle interval change
  const handleIntervalChange = (interval) => {
    setSelectedInterval(interval);
    const dateRange = getDateRange(interval);
    setFilters(prev => ({
      ...prev,
      ...dateRange
    }));
  };

  const fetchHistoryRequests = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        show_all: true, // Show all requests, not just current user's
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });
      
      console.log('Fetching history with params:', params);
      const response = await purchaseRequestService.getAllRequests(params);
      console.log('History response:', response);
      
      const requests = response.data?.data?.requests || response.data?.requests || [];
      console.log('Extracted requests:', requests.length, 'requests');
      setRequests(requests);
      
      if (requests.length === 0) {
        console.log('No requests found with current filters');
      }
    } catch (error) {
      console.error('Fetch history requests error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to fetch request history');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusBadge = (status) => {
    const colors = {
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'awaiting_delivery_confirmation': 'bg-teal-100 text-teal-800',
      'payment_in_progress': 'bg-indigo-100 text-indigo-800',
      'pending_approval': 'bg-blue-100 text-blue-800',
      'pending_procurement_review': 'bg-purple-100 text-purple-800',
      'pending_finance_approval': 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateDuration = (createdAt, completedAt) => {
    if (!completedAt) return 'N/A';
    
    const start = new Date(createdAt);
    const end = new Date(completedAt);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group requests by stage for Kanban view
  const groupRequestsByStage = () => {
    const stages = {};
    
    columns.forEach(column => {
      stages[column.id] = {
        title: column.title,
        requests: [],
        color: column.color,
        headerColor: column.headerColor
      };
    });

    requests.forEach(request => {
      columns.forEach(column => {
        if (column.status.includes(request.status)) {
          stages[column.id].requests.push(request);
        }
      });
    });

    return stages;
  };

  // Render Kanban View
  const renderKanbanView = () => {
    const kanbanStages = groupRequestsByStage();
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Purchase Request Workflow</h3>
        <div className="overflow-x-auto">
          <div className="flex space-x-4 min-w-max pb-4">
            {Object.entries(kanbanStages).map(([statusKey, stage]) => (
              <div key={statusKey} className={`flex-shrink-0 w-80 border-2 rounded-lg ${stage.color}`}>
                <div className={`p-4 border-b border-gray-200 ${stage.headerColor} rounded-t-lg`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{stage.title}</h4>
                    <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-600">
                      {stage.requests.length}
                    </span>
                  </div>
                </div>
                <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                  {stage.requests.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No requests</p>
                    </div>
                  ) : (
                    stage.requests.map((request) => (
                      <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Link
                                to={`/purchase-requests/${request.request_id}`}
                                className="text-sm font-medium text-primary hover:text-blue-800"
                              >
                                {request.request_id}
                              </Link>
                            </div>
                            <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                              {request.item_service_requested}
                            </p>
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center">
                                <User className="h-3 w-3 mr-1" />
                                {request.requester_name}
                              </div>
                              <div className="flex items-center">
                                <Building className="h-3 w-3 mr-1" />
                                {purchaseRequestService.formatDepartment(request.department)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(request.amount)}
                          </div>
                          <Link
                            to={`/purchase-requests/${request.request_id}`}
                            className="p-1 text-gray-400 hover:text-primary rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          {request.completed_at ? 
                            `Completed ${formatDate(request.completed_at)}` : 
                            `Updated ${formatDate(request.updated_at)}`
                          }
                        </div>
                        <div className="text-xs text-gray-500">
                          Duration: {calculateDuration(request.created_at, request.completed_at)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render List View (existing table)
  const renderListView = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Request ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Completed Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                  <Link to={`/purchase-requests/${request.request_id}`}>
                    {request.request_id}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.requester_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.requester_email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purchaseRequestService.formatDepartment(request.department)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(request.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {calculateDuration(request.created_at, request.completed_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {request.completed_at ? 
                    new Date(request.completed_at).toLocaleDateString() : 
                    new Date(request.updated_at).toLocaleDateString()
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/purchase-requests/${request.request_id}`}
                    className="text-primary hover:text-blue-900"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p className="text-lg font-medium">No requests found</p>
            <p className="text-sm mt-1">
              {filters.status ? `No ${filters.status} requests match your criteria` : 'No requests match your criteria'}
            </p>
            <p className="text-xs text-gray-400 mt-2">Try adjusting your filters or date range</p>
          </div>
        </div>
      )}
    </div>
  );

  // Render Dashboard View
  const renderDashboardView = () => {
    // Calculate statistics
    const totalAmount = requests.reduce((sum, req) => sum + parseFloat(req.amount), 0);
    const avgAmount = totalAmount / (requests.length || 1);
    
    const statusCounts = requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {});

    const departmentStats = requests.reduce((acc, req) => {
      const dept = req.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { count: 0, amount: 0 };
      }
      acc[dept].count++;
      acc[dept].amount += parseFloat(req.amount);
      return acc;
    }, {});

    const avgDuration = requests.length > 0 ? 
      Math.round(requests.reduce((sum, req) => {
        const duration = calculateDuration(req.created_at, req.completed_at);
        return sum + (parseInt(duration) || 0);
      }, 0) / requests.length) : 0;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Average Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgAmount)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
            <p className="text-3xl font-bold text-gray-900">{avgDuration} days</p>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="bg-gray-50 rounded-lg p-4">
                <div className="mb-2">{getStatusBadge(status)}</div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">
                  {((count / requests.length) * 100).toFixed(1)}% of total
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
          <div className="space-y-3">
            {Object.entries(departmentStats)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([dept, data]) => (
                <div key={dept} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {purchaseRequestService.formatDepartment(dept)}
                    </div>
                    <div className="text-sm text-gray-600">{data.count} requests</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatCurrency(data.amount)}</div>
                    <div className="text-sm text-gray-600">
                      Avg: {formatCurrency(data.amount / data.count)}
                    </div>
                  </div>
                </div>
              ))}</div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Completion Timeline</h3>
          <div className="space-y-2">
            {requests
              .filter(req => req.completed_at)
              .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
              .slice(0, 10)
              .map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <Link
                      to={`/purchase-requests/${request.request_id}`}
                      className="text-sm font-medium text-primary hover:text-blue-800"
                    >
                      {request.request_id}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">
                      {request.requester_name} • {purchaseRequestService.formatDepartment(request.department)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(request.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(request.completed_at)} • {calculateDuration(request.created_at, request.completed_at)}
                    </div>
                  </div>
                </div>
              ))}</div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Request History</h1>
          <p className="text-gray-600 mt-1">View all historical purchase requests</p>
          {filters.date_from && filters.date_to && (
            <p className="text-sm text-primary mt-1">
              📅 Showing data from {new Date(filters.date_from).toLocaleDateString()} to {new Date(filters.date_to).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="text-sm font-medium">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListIcon size={18} />
              <span className="text-sm font-medium">List</span>
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                viewMode === 'dashboard'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 size={18} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </div>
          <Link
            to="/purchase-requests"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back to Active Requests
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Period
          </label>
          <div className="flex flex-wrap gap-2">
            {intervalOptions.map(option => (
              <button
                key={option.value}
                onClick={() => handleIntervalChange(option.value)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedInterval === option.value
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {departmentOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
              {selectedInterval !== 'custom' && (
                <span className="text-xs text-gray-500 ml-1">(Auto-set)</span>
              )}
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              disabled={selectedInterval !== 'custom'}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                selectedInterval !== 'custom' ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
              {selectedInterval !== 'custom' && (
                <span className="text-xs text-gray-500 ml-1">(Auto-set)</span>
              )}
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              disabled={selectedInterval !== 'custom'}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                selectedInterval !== 'custom' ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
          </div>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'dashboard' && renderDashboardView()}
    </div>
  );
};

export default PurchaseRequestHistory;
