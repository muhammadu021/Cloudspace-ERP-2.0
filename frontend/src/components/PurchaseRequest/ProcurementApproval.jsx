import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import purchaseRequestService from '../../services/purchaseRequestService';
import toast from 'react-hot-toast';
import { LayoutGrid, List as ListIcon, BarChart3, Eye, Download, X, User, Building, FileText, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import PurchaseReceipt from './PurchaseReceipt';

const ProcurementApproval = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'list', 'dashboard'
  const [collapsedColumns, setCollapsedColumns] = useState({}); // Track collapsed state for each priority
  const [actionData, setActionData] = useState({
    action: '',
    comments: '',
    vendor_verification_status: 'verified',
    procurement_notes: '',
    alternative_vendor_suggested: ''
  });

  useEffect(() => {
    fetchPendingProcurement();
  }, []);

  const fetchPendingProcurement = async () => {
    try {
      setLoading(true);
      const response = await purchaseRequestService.getAllRequests({
        status: 'pending_procurement_review',
        current_stage: 'procurement_stage',
        show_all: true, // IMPORTANT: Remove user restrictions - show ALL procurement requests
        limit: 50
      });
      setPendingRequests(response.data.data.requests || []);
    } catch (error) {
      console.error('Fetch pending procurement error:', error);
      toast.error('Failed to fetch pending procurement reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleProcurementAction = async (requestId, action, additionalData = {}) => {
    try {
      setProcessingId(requestId);
      
      const data = {
        action: action,
        comments: additionalData.comments || '',
        stage: 'procurement_stage',
        additional_data: {
          vendor_verification_status: additionalData.vendor_verification_status || 'verified',
          procurement_notes: additionalData.procurement_notes || '',
          alternative_vendor_suggested: additionalData.alternative_vendor_suggested || ''
        }
      };

      await purchaseRequestService.processProcurement(requestId, data);
      
      toast.success(`Request ${action === 'approve' ? 'approved for finance review' : 'rejected'} successfully`);
      
      // Refresh the list
      fetchPendingProcurement();
    } catch (error) {
      console.error('Procurement action error:', error);
      toast.error(error.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const openActionModal = (request, action) => {
    setSelectedRequest(request);
    setActionData({
      action: action,
      comments: '',
      vendor_verification_status: 'verified',
      procurement_notes: '',
      alternative_vendor_suggested: ''
    });
    setShowActionModal(true);
  };

  const handleSubmitAction = () => {
    if (!actionData.comments.trim()) {
      toast.warning('Please provide comments for this action');
      return;
    }

    if (actionData.action === 'request_alternative_vendor' && !actionData.alternative_vendor_suggested.trim()) {
      toast.warning('Please provide an alternative vendor suggestion');
      return;
    }

    const additionalData = {
      comments: actionData.comments,
      vendor_verification_status: actionData.vendor_verification_status,
      procurement_notes: actionData.procurement_notes || getDefaultProcurementNotes(actionData.action),
      alternative_vendor_suggested: actionData.alternative_vendor_suggested
    };

    handleProcurementAction(selectedRequest.request_id, actionData.action, additionalData);
    setShowActionModal(false);
    setSelectedRequest(null);
  };

  const getDefaultProcurementNotes = (action) => {
    switch (action) {
      case 'approve':
        return 'Vendor verified and approved for procurement';
      case 'reject':
        return 'Request rejected during procurement review';
      case 'request_alternative_vendor':
        return 'Alternative vendor suggested during procurement review';
      default:
        return '';
    }
  };

  const handleDownloadReceipt = (request) => {
    setSelectedRequest(request);
    setShowReceipt(true);
  };

  const toggleColumnCollapse = (priority) => {
    setCollapsedColumns(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  // Group requests by priority for Kanban view
  const groupByPriority = () => {
    const groups = {
      urgent: [],
      high: [],
      medium: [],
      low: []
    };
    
    pendingRequests.forEach(request => {
      const priority = request.priority || 'medium';
      if (groups[priority]) {
        groups[priority].push(request);
      }
    });
    
    return groups;
  };

  // Render Kanban View
  const renderKanbanView = () => {
    const groups = groupByPriority();
    const priorityConfig = {
      urgent: { label: 'Urgent', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
      high: { label: 'High', color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
      medium: { label: 'Medium', color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
      low: { label: 'Low', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200' }
    };

    return (
      <div className="flex gap-4">
        {Object.entries(priorityConfig).map(([priority, config]) => {
          const isCollapsed = collapsedColumns[priority];
          
          return (
            <div 
              key={priority} 
              className={`flex flex-col transition-all duration-300 ease-in-out ${
                isCollapsed ? 'w-16' : 'w-80'
              }`}
            >
              {isCollapsed ? (
                // Collapsed view - vertical text
                <div 
                  className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-3 cursor-pointer hover:opacity-90 transition-opacity h-full flex flex-col items-center justify-center`}
                  onClick={() => toggleColumnCollapse(priority)}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <ChevronDown className="h-4 w-4 text-gray-600 rotate-90" />
                    <div 
                      className="whitespace-nowrap font-semibold text-gray-900 text-sm"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                      {config.label}
                    </div>
                    <span className={`bg-${config.color}-100 text-${config.color}-800 px-2 py-1 rounded-full text-xs`}>
                      {groups[priority].length}
                    </span>
                  </div>
                </div>
              ) : (
                // Expanded view
                <>
                  <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-t-lg p-3 cursor-pointer hover:opacity-90 transition-opacity`}
                       onClick={() => toggleColumnCollapse(priority)}>
                    <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <span>{config.label} Priority</span>
                        <ChevronUp className="h-4 w-4 text-gray-600 -rotate-90" />
                      </span>
                      <span className={`bg-${config.color}-100 text-${config.color}-800 px-2 py-1 rounded-full text-xs`}>
                        {groups[priority].length}
                      </span>
                    </h3>
                  </div>
                  <div className="bg-gray-50 border-l-2 border-r-2 border-b-2 border-gray-200 rounded-b-lg overflow-hidden">
                    <div className="p-2 space-y-2 min-h-[400px] max-h-[600px] overflow-y-auto">
              {groups[priority].map(request => (
                <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-primary mb-1">
                        {request.request_id}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        <strong>Requester:</strong> {request.requester_name}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        <strong>Department:</strong> {purchaseRequestService.formatDepartment(request.department)}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">
                        <strong>Vendor:</strong> {request.vendor_name}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm font-bold text-purple-900 mb-2">
                    {formatCurrency(request.amount)}
                  </p>
                  
                  <p className="text-xs text-gray-700 mb-3 line-clamp-2">
                    {request.item_service_requested}
                  </p>
                  
                  {/* View Button */}
                  <button
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowViewModal(true);
                    }}
                    className="w-full mb-2 px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-600 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  
                  <div className="pt-2 border-t border-gray-200 space-y-2">
                    <button
                      onClick={() => openActionModal(request, 'approve')}
                      disabled={processingId === request.request_id}
                      className="w-full px-3 py-1.5 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve Vendor
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openActionModal(request, 'request_alternative_vendor')}
                        disabled={processingId === request.request_id}
                        className="flex-1 px-2 py-1.5 border border-yellow-300 text-yellow-700 rounded text-xs hover:bg-yellow-50 disabled:opacity-50"
                      >
                        Alternative
                      </button>
                      <button
                        onClick={() => openActionModal(request, 'reject')}
                        disabled={processingId === request.request_id}
                        className="flex-1 px-2 py-1.5 border border-red-300 text-red-700 rounded text-xs hover:bg-red-50 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
                      {groups[priority].length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No {config.label.toLowerCase()} priority requests
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Render List View
  const renderListView = () => (
    <div className="space-y-6">
      {pendingRequests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <div className="text-gray-500">
            <p className="text-lg font-medium">No pending procurement reviews</p>
            <p className="text-sm mt-1">All high-value requests have been processed</p>
          </div>
        </div>
      ) : (
        pendingRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* Request Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Request {request.request_id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Manager approved on {new Date(request.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-purple-900">
                    {formatCurrency(request.amount)}
                  </p>
                  <p className="text-sm text-purple-600 font-medium">
                    HIGH VALUE - Procurement Review Required
                  </p>
                </div>
              </div>
            </div>

            {/* Request Details */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requester Info */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Request Information</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Requester:</span> {request.requester_name}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Department:</span> {purchaseRequestService.formatDepartment(request.department)}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Priority:</span> 
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.priority.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Submitted:</span> {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Vendor Analysis */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Vendor Analysis</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Vendor:</span> {request.vendor_name}
                    </p>
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">Amount:</span> {formatCurrency(request.amount)}
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-2">
                      <p className="text-xs text-yellow-800">
                        📋 <strong>Procurement Checklist:</strong>
                      </p>
                      <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                        <li>Verify vendor credentials</li>
                        <li>Check market pricing</li>
                        <li>Validate bank details</li>
                        <li>Assess delivery capability</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item Description */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Item/Service for Procurement Review</h4>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                  {request.item_service_requested}
                </p>
              </div>

              {/* Vendor Details for Review */}
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Vendor Bank Details (For Verification)</h4>
                <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                  {request.vendor_bank_details}
                </p>
              </div>

              {/* Procurement Notes */}
              <div className="mt-4 bg-primary-50 border border-primary-200 rounded p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Procurement Review Guidelines</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Verify vendor is registered and legitimate</li>
                  <li>• Confirm competitive pricing for requested items</li>
                  <li>• Validate bank account details and ownership</li>
                  <li>• Assess vendor's delivery and quality track record</li>
                  <li>• Check for any compliance or regulatory requirements</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <Link
                  to={`/purchase-requests/${request.request_id}`}
                  className="text-primary hover:text-blue-800 text-sm font-medium"
                >
                  View Full Details
                </Link>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => openActionModal(request, 'reject')}
                    disabled={processingId === request.request_id}
                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {processingId === request.request_id ? 'Processing...' : 'Reject Vendor'}
                  </button>
                  
                  <button
                    onClick={() => openActionModal(request, 'request_alternative_vendor')}
                    disabled={processingId === request.request_id}
                    className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
                  >
                    Request Alternative
                  </button>
                  
                  <button
                    onClick={() => openActionModal(request, 'approve')}
                    disabled={processingId === request.request_id}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {processingId === request.request_id ? 'Processing...' : 'Approve Vendor'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Render Dashboard View
  const renderDashboardView = () => {
    const totalAmount = pendingRequests.reduce((sum, req) => sum + parseFloat(req.amount), 0);
    const avgAmount = totalAmount / (pendingRequests.length || 1);
    const avgDaysPending = Math.round(pendingRequests.reduce((sum, req) => {
      const days = Math.ceil((new Date() - new Date(req.created_at)) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0) / (pendingRequests.length || 1));

    const departmentStats = pendingRequests.reduce((acc, req) => {
      const dept = req.department || 'Unknown';
      if (!acc[dept]) {
        acc[dept] = { count: 0, amount: 0 };
      }
      acc[dept].count++;
      acc[dept].amount += parseFloat(req.amount);
      return acc;
    }, {});

    const priorityStats = ['urgent', 'high', 'medium', 'low'].map(priority => {
      const count = pendingRequests.filter(req => req.priority === priority).length;
      const amount = pendingRequests
        .filter(req => req.priority === priority)
        .reduce((sum, req) => sum + parseFloat(req.amount), 0);
      return { priority, count, amount };
    });

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
            <p className="text-3xl font-bold text-purple-900">{pendingRequests.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Total Value</p>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(totalAmount)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Average Amount</p>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(avgAmount)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Avg Days Pending</p>
            <p className="text-3xl font-bold text-purple-900">{avgDaysPending}</p>
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
                    <div className="text-sm text-gray-600">{data.count} request{data.count !== 1 ? 's' : ''}</div>
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
                  priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
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

        {/* Recent Requests Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Requests</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Request ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Pending</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingRequests.slice(0, 10).map((request) => {
                  const daysPending = Math.ceil((new Date() - new Date(request.created_at)) / (1000 * 60 * 60 * 24));
                  return (
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
                        {request.requester_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {request.vendor_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(request.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                          request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {daysPending} days
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
          <h1 className="text-2xl font-bold text-gray-900">Procurement Review</h1>
          <p className="text-gray-600 mt-1">Review vendor selection and procurement details</p>
        </div>
        <div className="flex items-center space-x-4">
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

          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            {pendingRequests.length} Pending Review
          </span>
          
          <button
            onClick={fetchPendingProcurement}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Procurement Reviews"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'kanban' && renderKanbanView()}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'dashboard' && renderDashboardView()}

      {/* View Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Procurement Review - {selectedRequest.request_id}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Request Details */}
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Header Info */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-2xl font-bold text-purple-900">{formatCurrency(selectedRequest.amount)}</p>
                    <p className="text-xs text-purple-600 mt-1">HIGH VALUE - Procurement Review Required</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRequest.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                      selectedRequest.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      selectedRequest.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedRequest.priority.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Requester & Vendor Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Requester Information</h4>
                  <p className="text-sm text-gray-700"><strong>Name:</strong> {selectedRequest.requester_name}</p>
                  <p className="text-sm text-gray-700"><strong>Email:</strong> {selectedRequest.requester_email}</p>
                  <p className="text-sm text-gray-700"><strong>Department:</strong> {purchaseRequestService.formatDepartment(selectedRequest.department)}</p>
                  <p className="text-sm text-gray-700"><strong>Submitted:</strong> {formatDate(selectedRequest.created_at)}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Vendor Information</h4>
                  <p className="text-sm text-gray-700"><strong>Vendor:</strong> {selectedRequest.vendor_name}</p>
                  <p className="text-sm text-gray-700"><strong>Amount:</strong> {formatCurrency(selectedRequest.amount)}</p>
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mt-2">
                    <p className="text-xs text-yellow-800">
                      📋 <strong>Procurement Checklist:</strong>
                    </p>
                    <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
                      <li>Verify vendor credentials</li>
                      <li>Check market pricing</li>
                      <li>Validate bank details</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Item Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Item/Service Requested</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                  {selectedRequest.item_service_requested}
                </p>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Vendor Bank Details</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border whitespace-pre-wrap">
                  {selectedRequest.vendor_bank_details}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => handleDownloadReceipt(selectedRequest)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                <Download className="h-4 w-4" />
                <span>Download Receipt</span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openActionModal(selectedRequest, 'reject');
                  }}
                  disabled={processingId === selectedRequest.request_id}
                  className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-50"
                >
                  Reject Vendor
                </button>
                
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openActionModal(selectedRequest, 'request_alternative_vendor');
                  }}
                  disabled={processingId === selectedRequest.request_id}
                  className="px-4 py-2 border border-yellow-300 text-yellow-700 rounded-md hover:bg-yellow-50 disabled:opacity-50"
                >
                  Request Alternative
                </button>
                
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openActionModal(selectedRequest, 'approve');
                  }}
                  disabled={processingId === selectedRequest.request_id}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Approve Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {actionData.action === 'approve' ? 'Approve Vendor' : 
                 actionData.action === 'reject' ? 'Reject Vendor' : 'Request Alternative Vendor'}
              </h3>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedRequest(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-900">Request Summary</h4>
              <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                <div>
                  <p><strong>ID:</strong> {selectedRequest.request_id}</p>
                  <p><strong>Requester:</strong> {selectedRequest.requester_name}</p>
                </div>
                <div>
                  <p><strong>Amount:</strong> {formatCurrency(selectedRequest.amount)}</p>
                  <p><strong>Vendor:</strong> {selectedRequest.vendor_name}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments *
                </label>
                <textarea
                  value={actionData.comments}
                  onChange={(e) => setActionData(prev => ({ ...prev, comments: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your comments..."
                />
              </div>

              {/* Vendor Verification Status (for approve action) */}
              {actionData.action === 'approve' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Verification Status
                  </label>
                  <select
                    value={actionData.vendor_verification_status}
                    onChange={(e) => setActionData(prev => ({ ...prev, vendor_verification_status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="verified">Verified</option>
                    <option value="verified_with_conditions">Verified with Conditions</option>
                    <option value="pending_verification">Pending Verification</option>
                  </select>
                </div>
              )}

              {/* Alternative Vendor (for alternative request) */}
              {actionData.action === 'request_alternative_vendor' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggested Alternative Vendor *
                  </label>
                  <input
                    type="text"
                    value={actionData.alternative_vendor_suggested}
                    onChange={(e) => setActionData(prev => ({ ...prev, alternative_vendor_suggested: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter alternative vendor name..."
                  />
                </div>
              )}

              {/* Procurement Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procurement Notes
                </label>
                <textarea
                  value={actionData.procurement_notes}
                  onChange={(e) => setActionData(prev => ({ ...prev, procurement_notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Additional procurement notes (optional)..."
                />
              </div>

              {/* Action Impact */}
              <div className={`p-3 rounded border ${
                actionData.action === 'approve' ? 'bg-green-50 border-green-200' :
                actionData.action === 'reject' ? 'bg-red-50 border-red-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <p className={`text-sm font-medium ${
                  actionData.action === 'approve' ? 'text-green-800' :
                  actionData.action === 'reject' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  {actionData.action === 'approve' ? '✓ This will:' :
                   actionData.action === 'reject' ? '⚠️ This will:' :
                   '🔄 This will:'}
                </p>
                <ul className={`text-sm mt-1 ml-4 list-disc ${
                  actionData.action === 'approve' ? 'text-green-700' :
                  actionData.action === 'reject' ? 'text-red-700' :
                  'text-yellow-700'
                }`}>
                  {actionData.action === 'approve' && (
                    <>
                      <li>Approve vendor for this request</li>
                      <li>Move request to Finance for budget approval</li>
                      <li>Send notification to finance team</li>
                    </>
                  )}
                  {actionData.action === 'reject' && (
                    <>
                      <li>Reject the current vendor</li>
                      <li>Stop the approval workflow</li>
                      <li>Notify requester of vendor rejection</li>
                    </>
                  )}
                  {actionData.action === 'request_alternative_vendor' && (
                    <>
                      <li>Suggest alternative vendor to requester</li>
                      <li>Return request for vendor update</li>
                      <li>Restart procurement review process</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={processingId === selectedRequest.request_id}
                className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                  actionData.action === 'approve' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' :
                  actionData.action === 'reject' ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' :
                  'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                }`}
              >
                {processingId === selectedRequest.request_id ? 'Processing...' : 
                 actionData.action === 'approve' ? 'Approve Vendor' :
                 actionData.action === 'reject' ? 'Reject Vendor' : 'Request Alternative'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Purchase Receipt Modal */}
      {showReceipt && selectedRequest && (
        <PurchaseReceipt 
          request={selectedRequest} 
          onClose={() => {
            setShowReceipt(false);
            setSelectedRequest(null);
          }} 
        />
      )}
    </div>
  );
};

export default ProcurementApproval;
