import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  TrendingUp,
  FileText,
  Users,
  AlertTriangle,
  Calendar,
  Eye,
  Download,
  User,
  Building
} from 'lucide-react';
import purchaseRequestService from '@/services/purchaseRequestService';

const PurchaseDashboard = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch both stats and requests in parallel
      const [statsResponse, requestsResponse] = await Promise.all([
        purchaseRequestService.getDashboardStats(),
        purchaseRequestService.getDashboardRequests({ limit: 100 })
      ]);
      
      setStats(statsResponse.data.data);
      setRequests(requestsResponse.data.data?.requests || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-blue-100 text-blue-800',
      pending_approval: 'bg-yellow-100 text-yellow-800',
      pending_procurement_review: 'bg-purple-100 text-purple-800',
      pending_finance_approval: 'bg-orange-100 text-orange-800',
      payment_in_progress: 'bg-indigo-100 text-indigo-800',
      awaiting_delivery_confirmation: 'bg-teal-100 text-teal-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStageColor = (stage) => {
    const colors = {
      request_creation: 'bg-blue-100 text-blue-800',
      approval_stage: 'bg-yellow-100 text-yellow-800',
      procurement_stage: 'bg-purple-100 text-purple-800',
      finance_stage: 'bg-orange-100 text-orange-800',
      pay_vendor_stage: 'bg-indigo-100 text-indigo-800',
      delivery_stage: 'bg-teal-100 text-teal-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[stage] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const downloadReceipt = async (requestId) => {
    try {
      const response = await purchaseRequestService.downloadReceipt(requestId);
      
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Purchase_Request_${requestId}_Receipt.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast('Failed to download receipt: ' + (error.response?.data?.message || error.message));
    }
  };

  // Group requests by stage for Kanban board
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

  const kanbanStages = groupRequestsByStage();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">Error loading dashboard: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Requests Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage purchase request workflows</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.overview?.total_requests || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">
              {stats?.overview?.this_month || 0} this month
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-3xl font-bold text-gray-900">
                ₦{(stats?.overview?.total_amount || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              Avg: ₦{Math.round((stats?.overview?.total_amount || 0) / (stats?.overview?.total_requests || 1)).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing Time</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.overview?.avg_processing_time_days || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">days average</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Change</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.trends?.monthly_change || 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">vs last month</span>
          </div>
        </div>
      </div>

      {/* Status and Stage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Status Breakdown</h3>
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(stats?.status_breakdown || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                    {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stage Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Current Stages</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {Object.entries(stats?.stage_breakdown || {}).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(stage)}`}>
                    {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
                              <span className="text-sm font-medium text-primary">{request.request_id}</span>
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
                          <div className="flex items-center space-x-1">
                            <button
                              className="p-1 text-gray-400 hover:text-primary rounded"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => downloadReceipt(request.request_id)}
                              className="p-1 text-gray-400 hover:text-green-600 rounded"
                              title="Download Receipt"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </div>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 bg-primary-50 hover:bg-blue-100 text-primary-700 px-4 py-3 rounded-lg transition-colors">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-medium">Create Request</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 px-4 py-3 rounded-lg transition-colors">
            <Clock className="h-5 w-5" />
            <span className="font-medium">Pending Approval</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg transition-colors">
            <Users className="h-5 w-5" />
            <span className="font-medium">Procurement</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg transition-colors">
            <CreditCard className="h-5 w-5" />
            <span className="font-medium">Finance</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDashboard;