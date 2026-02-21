import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Eye,
  CreditCard,
  User,
  Building,
  Calendar,
  FileText,
  AlertTriangle,
  MessageSquare,
  RefreshCw
} from 'lucide-react';

const PendingApproval = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalForm, setApprovalForm] = useState({
    action: '',
    comments: '',
    additional_data: {}
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/v1/purchase-requests/pending/approval', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending requests');
      }

      const data = await response.json();
      setRequests(data.data.requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!selectedRequest || !approvalForm.action) {
      setError('Please select an action');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/purchase-requests/${selectedRequest.request_id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(approvalForm)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to process approval');
      }
      
      // Close modal and refresh data
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalForm({ action: '', comments: '', additional_data: {} });
      fetchPendingRequests();
      
      // Show success message
      toast.success('Request ${approvalForm.action}d successfully!');
      
    } catch (error) {
      console.error('Error processing approval:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const openApprovalModal = (request) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
    setApprovalForm({ action: '', comments: '', additional_data: {} });
    setError(null);
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading pending requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pending Approval</h1>
          <p className="text-gray-600 mt-1">Review and approve purchase requests</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{requests.length} requests pending</span>
          </div>
          <button
            onClick={fetchPendingRequests}
            disabled={loading}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Refresh Pending Requests"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No purchase requests are currently pending your approval.</p>
          </div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Request Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold text-primary">{request.request_id}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)} Priority
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(request.created_at)}
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <User className="h-4 w-4 mr-1" />
                        Requester
                      </div>
                      <div className="font-medium text-gray-900">{request.requester_name}</div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Building className="h-3 w-3 mr-1" />
                        {request.department}
                      </div>
                      {request.ApprovingManager && (
                        <div className="flex items-center text-sm text-primary mt-1">
                          <User className="h-3 w-3 mr-1" />
                          Assigned to: {request.ApprovingManager.name}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <FileText className="h-4 w-4 mr-1" />
                        Item/Service
                      </div>
                      <div className="font-medium text-gray-900 line-clamp-2">
                        {request.item_service_requested}
                      </div>
                      <div className="text-sm text-gray-500">
                        Vendor: {request.vendor_name}
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center text-sm text-gray-500 mb-1">
                        <CreditCard className="h-4 w-4 mr-1" />
                        Amount
                      </div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(request.amount)}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {request.notes && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-1">Notes</div>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                        {request.notes}
                      </div>
                    </div>
                  )}

                  {/* Workflow History */}
                  {request.WorkflowApprovals && request.WorkflowApprovals.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">Approval History</div>
                      <div className="space-y-2">
                        {request.WorkflowApprovals.map((approval, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-gray-700">
                              {approval.stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - 
                              {approval.action} by {approval.approver_name}
                            </span>
                            <span className="text-gray-500">
                              ({formatDate(approval.approved_at)})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => openApprovalModal(request)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Review Purchase Request
                </h3>
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {/* Request Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Request ID:</span>
                    <span className="ml-2 font-medium">{selectedRequest.request_id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedRequest.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Requester:</span>
                    <span className="ml-2 font-medium">{selectedRequest.requester_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Department:</span>
                    <span className="ml-2 font-medium">{selectedRequest.department}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-gray-500">Item/Service:</span>
                  <div className="mt-1 text-gray-900">{selectedRequest.item_service_requested}</div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-400 mr-2" />
                    <span className="text-red-800">{error}</span>
                  </div>
                </div>
              )}

              {/* Approval Form */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Decision *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="action"
                        value="approve"
                        checked={approvalForm.action === 'approve'}
                        onChange={(e) => setApprovalForm(prev => ({ ...prev, action: e.target.value }))}
                        className="mr-3 text-green-600 focus:ring-green-500"
                      />
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-700 font-medium">Approve Request</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="action"
                        value="reject"
                        checked={approvalForm.action === 'reject'}
                        onChange={(e) => setApprovalForm(prev => ({ ...prev, action: e.target.value }))}
                        className="mr-3 text-red-600 focus:ring-red-500"
                      />
                      <XCircle className="h-5 w-5 text-red-600 mr-2" />
                      <span className="text-red-700 font-medium">Reject Request</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="action"
                        value="return_for_revision"
                        checked={approvalForm.action === 'return_for_revision'}
                        onChange={(e) => setApprovalForm(prev => ({ ...prev, action: e.target.value }))}
                        className="mr-3 text-yellow-600 focus:ring-yellow-500"
                      />
                      <RotateCcw className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-yellow-700 font-medium">Return for Revision</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments *
                  </label>
                  <textarea
                    value={approvalForm.comments}
                    onChange={(e) => setApprovalForm(prev => ({ ...prev, comments: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    placeholder="Provide your comments or feedback..."
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprovalAction}
                  disabled={processing || !approvalForm.action || !approvalForm.comments.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Submit Decision
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApproval;