import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import purchaseRequestService from '../../services/purchaseRequestService';
import toast from 'react-hot-toast';
import { LayoutGrid, List as ListIcon, BarChart3, Eye, Download, User, Building, FileText } from 'lucide-react';

const PurchaseRequestList = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'kanban', 'list', 'dashboard'
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    per_page: 10
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await purchaseRequestService.getAllRequests({
        page: pagination.current_page,
        limit: 100 // Get more for better visualization
      });
      setRequests(response.data.data.requests);
      setPagination(response.data.data.pagination);
    } catch (error) {
      console.error('Fetch requests error:', error);
      toast.error('Failed to fetch purchase requests');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      'submitted': 'bg-blue-100 text-blue-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'pending_procurement_review': 'bg-purple-100 text-purple-800',
      'pending_finance_approval': 'bg-orange-100 text-orange-800',
      'payment_in_progress': 'bg-indigo-100 text-indigo-800',
      'awaiting_delivery_confirmation': 'bg-teal-100 text-teal-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ').toUpperCase()}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
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
    const stages = {
      'request_creation': { title: 'Created', requests: [], color: 'border-primary-200 bg-primary-50' },
      'approval_stage': { title: 'Pending Approval', requests: [], color: 'border-yellow-200 bg-yellow-50' },
      'procurement_stage': { title: 'Procurement Review', requests: [], color: 'border-purple-200 bg-purple-50' },
      'finance_stage': { title: 'Finance Approval', requests: [], color: 'border-orange-200 bg-orange-50' },
      'pay_vendor_stage': { title: 'Payment Processing', requests: [], color: 'border-indigo-200 bg-indigo-50' },
      'delivery_stage': { title: 'Awaiting Delivery', requests: [], color: 'border-teal-200 bg-teal-50' },
      'completed': { title: 'Completed', requests: [], color: 'border-green-200 bg-green-50' }
    };

    requests.forEach(request => {
      if (stages[request.current_stage]) {
        stages[request.current_stage].requests.push(request);
      }
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
            {Object.entries(kanbanStages).map(([stageKey, stage]) => (
              <div key={stageKey} className={`flex-shrink-0 w-80 border-2 rounded-lg ${stage.color}`}>
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">{stage.title}</h4>
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
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                request.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                request.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                request.priority === 'medium' ? 'bg-blue-100 text-primary-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {request.priority}
                              </span>
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
                                {request.department}
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
                          Created {formatDate(request.created_at)}
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

  // Render List View
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
                Item/Service
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
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
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
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {request.item_service_requested}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.requester_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.requester_email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(request.amount)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    request.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(request.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Link
                    to={`/purchase-requests/${request.request_id}`}
                    className="text-primary hover:text-blue-900"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

    const priorityStats = ['urgent', 'high', 'medium', 'low'].map(priority => {
      const count = requests.filter(req => req.priority === priority).length;
      const amount = requests
        .filter(req => req.priority === priority)
        .reduce((sum, req) => sum + parseFloat(req.amount), 0);
      return { priority, count, amount };
    });

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Total Requests</p>
            <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Average Amount</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgAmount)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Departments</p>
            <p className="text-3xl font-bold text-gray-900">{Object.keys(departmentStats).length}</p>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    <div className="font-medium text-gray-900">{dept}</div>
                    <div className="text-sm text-gray-600">{data.count} requests</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatCurrency(data.amount)}</div>
                    <div className="text-sm text-gray-600">
                      Avg: {formatCurrency(data.amount / data.count)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {priorityStats.map(({ priority, count, amount }) => (
              <div key={priority} className="bg-gray-50 rounded-lg p-4">
                <div className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold mb-2 ${
                  priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  priority === 'medium' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {priority.toUpperCase()}
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{formatCurrency(amount)}</div>
              </div>
            ))}
          </div>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Requests</h1>
          <p className="text-gray-600 mt-1">Manage and track purchase requests</p>
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
            to="/purchase-requests/new"
            className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
          >
            + New Request
          </Link>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'dashboard' && renderDashboardView()}
    </div>
  );
};

export default PurchaseRequestList;
