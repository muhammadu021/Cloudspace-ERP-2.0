import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, FileText, Lock, LayoutGrid, List, BarChart3, Plus, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import purchaseRequestService from '../../services/purchaseRequestService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import PurchaseReceipt from './PurchaseReceipt';

const PurchaseRequestKanban = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestForReceipt, setSelectedRequestForReceipt] = useState(null);
  const [collapsedColumns, setCollapsedColumns] = useState({});
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'list', 'dashboard'

  // Kanban columns based on workflow stages
  const columns = [
    // {
    //   id: "submitted",
    //   title: "Request Creation",
    //   status: ["submitted"],
    //   color: "bg-primary-50 border-primary-200",
    //   headerColor: "bg-blue-100 text-blue-800",
    // },
    {
      id: "pending_approval",
      title: "Manager Approval",
      status: ["pending_approval"],
      color: "bg-primary-50 border-primary-200",
      headerColor: "bg-blue-100 text-blue-800",
    },
    // {
    //   id: "processing",
    //   title: "Processing Stage",
    //   status: ["pending_procurement_review", "processing"],
    //   color: "bg-orange-50 border-orange-200",
    //   headerColor: "bg-orange-100 text-orange-800",
    // },
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
      status: ["awaiting_delivery_confirmation"],
      color: "bg-green-50 border-green-200",
      headerColor: "bg-green-100 text-green-800",
    },
  ];

  useEffect(() => {
    fetchRequests();
  }, []);

  const toggleColumnCollapse = (columnId) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const fetchRequests = async () => {
    try {
      setLoading(true);
      // Fetch only the current user's active requests (not completed, rejected, or cancelled)
      const response = await purchaseRequestService.getMyRequests({
        exclude_status: 'completed,rejected,cancelled',
        limit: 100
      });
      setRequests(response.data.data.requests || []);
    } catch (error) {
      console.error('Fetch requests error:', error);
      toast.error('Failed to fetch your purchase requests');
    } finally {
      setLoading(false);
    }
  };

  const getRequestsForColumn = (columnStatuses) => {
    return requests.filter(request => 
      columnStatuses.includes(request.status)
    );
  };

  const handleDownloadReceipt = async (request) => {
    try {
      // Fetch full request details if needed
      const response = await purchaseRequestService.getRequestById(request.request_id);
      setSelectedRequestForReceipt(response.data.data.request);
    } catch (error) {
      console.error('Fetch request error:', error);
      toast.error('Failed to load request details for receipt');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'urgent': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Create & Track Requests</h1>
          <p className="text-gray-600 mt-1">Create new requests and track progress through workflow stages</p>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-3">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-primary text-white hover:bg-primary-600'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              title="Kanban View"
            >
              <LayoutGrid className="h-4 w-4 mr-2" />
              Kanban
            </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-primary text-white hover:bg-primary-600'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="List View"
          >
            <List className="h-4 w-4 mr-2" />
            List
          </button>
          <button
            onClick={() => setViewMode('dashboard')}
            className={`flex items-center px-4 py-2 rounded-md transition-colors ${
              viewMode === 'dashboard'
                ? 'bg-primary text-white hover:bg-primary-600'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title="Dashboard View"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </button>
            <button
              onClick={() => navigate('/purchase-requests/new')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              title="Create New Request"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New
            </button>
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {viewMode === 'kanban' && (
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnRequests = getRequestsForColumn(column.status);
          const isCollapsed = collapsedColumns[column.id];
          
          return (
            <div
              key={column.id}
              className={`flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-16' : 'w-80'} ${column.color} border-2 border-dashed rounded-lg overflow-hidden`}
            >
              {/* Column Header */}
              <div className={`${column.headerColor} ${isCollapsed ? 'px-2 py-3' : 'px-4 py-3'} rounded-t-lg border-b transition-all duration-300`}>
                {isCollapsed ? (
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      onClick={() => toggleColumnCollapse(column.id)}
                      className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors"
                      title="Expand column"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="flex flex-col items-center">
                      <span className="bg-white bg-opacity-50 px-1.5 py-1 rounded-full text-xs font-medium mb-2">
                        {columnRequests.length}
                      </span>
                      <div className="writing-mode-vertical text-xs font-semibold whitespace-nowrap" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                        {column.title}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">
                      {column.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="bg-white bg-opacity-50 px-2 py-1 rounded-full text-xs font-medium">
                        {columnRequests.length}
                      </span>
                      <button
                        onClick={() => toggleColumnCollapse(column.id)}
                        className="p-1 hover:bg-white hover:bg-opacity-30 rounded transition-colors"
                        title="Collapse column"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Column Content */}
              <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'opacity-0 h-0 overflow-hidden p-0' : 'opacity-100 p-4 space-y-3 min-h-96'}`}>
                {columnRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Request Header */}
                    <div className="flex justify-between items-start mb-2">
                      <Link
                        to={`/purchase-requests/${request.request_id}`}
                        className="text-sm font-medium text-primary hover:text-blue-800"
                      >
                        {request.request_id}
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </span>
                    </div>

                    {/* Request Details */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 font-medium">
                        {request.requester_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {purchaseRequestService.formatDepartment(request.department)}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {request.item_service_requested}
                      </p>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(request.amount)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Vendor Info */}
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-600">
                        <span className="font-medium">Vendor:</span> {request.vendor_name}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex space-x-2">
                      <Link
                        to={`/purchase-requests/${request.request_id}`}
                        className="flex-1 text-center px-3 py-1 text-xs bg-primary-50 text-primary rounded hover:bg-blue-100"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleDownloadReceipt(request)}
                        className="flex items-center justify-center px-3 py-1 text-xs bg-green-50 text-green-600 rounded hover:bg-green-100"
                        title="Download Receipt"
                      >
                        <Download className="h-3 w-3" />
                      </button>
                      {/* {(request.status === 'pending_approval' || 
                        request.status === 'pending_procurement_review' || 
                        request.status === 'pending_finance_approval') && (
                        <button className="px-3 py-1 text-xs bg-amber-50 text-amber-600 rounded hover:bg-amber-100">
                          Take Action
                        </button>
                      )} */}
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {columnRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No requests in this stage</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">No purchase requests found</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link
                      to={`/purchase-requests/${request.request_id}`}
                      className="text-lg font-semibold text-primary hover:text-blue-800"
                    >
                      {request.request_id}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      Created on {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {request.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600"><strong>Requester:</strong> {request.requester_name}</p>
                    <p className="text-sm text-gray-600"><strong>Department:</strong> {purchaseRequestService.formatDepartment(request.department)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600"><strong>Vendor:</strong> {request.vendor_name}</p>
                    <p className="text-sm text-gray-600"><strong>Amount:</strong> <span className="font-semibold text-gray-900">{formatCurrency(request.amount)}</span></p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-700 mb-4">
                  <strong>Item/Service:</strong> {request.item_service_requested}
                </p>
                
                <div className="flex space-x-3">
                  <Link
                    to={`/purchase-requests/${request.request_id}`}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 text-sm"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDownloadReceipt(request)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                  >
                    Download Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Dashboard View */}
      {viewMode === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{requests.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600 mb-1">Pending Approval</p>
              <p className="text-3xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending_approval').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600 mb-1">In Procurement</p>
              <p className="text-3xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending_procurement_review').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 mb-1">Total Value</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(requests.reduce((sum, r) => sum + parseFloat(r.amount), 0))}
              </p>
            </div>
          </div>

          {/* Status Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Requests by Status</h3>
            <div className="space-y-3">
              {columns.map(column => {
                const count = getRequestsForColumn(column.status).length;
                const percentage = requests.length > 0 ? (count / requests.length) * 100 : 0;
                return (
                  <div key={column.id}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{column.title}</span>
                      <span className="text-sm text-gray-600">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${column.headerColor.replace('text-', 'bg-').split(' ')[0]}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Requests */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.slice(0, 10).map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          to={`/purchase-requests/${request.request_id}`}
                          className="text-primary hover:text-blue-800 font-medium"
                        >
                          {request.request_id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {request.status.replace(/_/g, ' ')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(request.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedRequestForReceipt && (
        <PurchaseReceipt
          request={selectedRequestForReceipt}
          onClose={() => setSelectedRequestForReceipt(null)}
        />
      )}
    </div>
  );
};

export default PurchaseRequestKanban;