import api from './api';
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

const purchaseRequestService = {
  // Create new purchase request
  createRequest: (formData) => {
    const company_id = getCompanyId();
    if (formData instanceof FormData) {
      formData.append('company_id', company_id);
    }
    return api.post('/purchase-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get all purchase requests with filtering
  getAllRequests: (params = {}) => {
    return api.get('/purchase-requests', { params });
  },

  // Get single purchase request by ID
  getRequestById: (requestId) => {
    return api.get(`/purchase-requests/${requestId}`);
  },

  // Get dashboard statistics
  getDashboardStats: () => {
    return api.get('/purchase-requests/dashboard/stats');
  },

  // Get dashboard requests
  getDashboardRequests: (params = {}) => {
    return api.get('/purchase-requests/dashboard/requests', { params });
  },

  // Get audit trail for a request
  getAuditTrail: (requestId) => {
    return api.get(`/purchase-requests/${requestId}/audit`);
  },

  // Workflow actions
  processApproval: (requestId, data) => {
    return api.post(`/purchase-requests/${requestId}/approve`, data);
  },

  processProcurement: (requestId, data) => {
    return api.post(`/purchase-requests/${requestId}/procurement`, data);
  },

  processFinance: (requestId, data) => {
    return api.post(`/purchase-requests/${requestId}/finance`, data);
  },

  processPayment: (requestId, data) => {
    return api.post(`/purchase-requests/${requestId}/payment`, data);
  },

  confirmPayment: (requestId, data) => {
    return api.post(`/purchase-requests/${requestId}/payment`, data);
  },

  processDelivery: (requestId, data) => {
    return api.post(`/purchase-requests/${requestId}/delivery`, data);
  },

  // Get pending requests by stage
  getPendingApprovals: (params = {}) => {
    return api.get('/purchase-requests/pending/approval', { params });
  },

  getPendingProcurement: (params = {}) => {
    return api.get('/purchase-requests/pending/procurement', { params });
  },

  getPendingFinance: (params = {}) => {
    return api.get('/purchase-requests/pending/finance', { params });
  },

  getPendingPayment: (params = {}) => {
    return api.get('/purchase-requests/pending/payment', { params });
  },

  getPendingDelivery: (params = {}) => {
    return api.get('/purchase-requests/pending/delivery', { params });
  },

  // Get user's own requests
  getMyRequests: (params = {}) => {
    return api.get('/purchase-requests/my/requests', { params });
  },

  // Reports and exports
  generateReport: (params = {}) => {
    return api.get('/purchase-requests/reports/summary', { params });
  },

  exportData: (format, params = {}) => {
    return api.get(`/purchase-requests/export/${format}`, { 
      params,
      responseType: 'blob'
    });
  },

  // Download receipt for a specific request
  downloadReceipt: (requestId) => {
    return api.get(`/purchase-requests/${requestId}/receipt`, {
      responseType: 'blob'
    });
  },

  // Utility functions
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  },

  getStatusColor: (status) => {
    const colors = {
      'submitted': 'blue',
      'pending_approval': 'yellow',
      'pending_procurement_review': 'orange',
      'pending_finance_approval': 'purple',
      'payment_in_progress': 'indigo',
      'awaiting_delivery_confirmation': 'pink',
      'completed': 'green',
      'rejected': 'red',
      'cancelled': 'gray'
    };
    return colors[status] || 'gray';
  },

  getStageColor: (stage) => {
    const colors = {
      'request_creation': 'blue',
      'approval_stage': 'yellow',
      'processing_stage': 'orange',
      'procurement_stage': 'purple',
      'finance_stage': 'indigo',
      'pay_vendor_stage': 'pink',
      'delivery_stage': 'green',
      'completed': 'emerald'
    };
    return colors[stage] || 'gray';
  },

  getPriorityColor: (priority) => {
    const colors = {
      'low': 'green',
      'medium': 'yellow',
      'high': 'orange',
      'urgent': 'red'
    };
    return colors[priority] || 'gray';
  },

  formatStage: (stage) => {
    const stages = {
      'request_creation': 'Request Creation',
      'approval_stage': 'Department Approval',
      'processing_stage': 'Processing',
      'procurement_stage': 'Procurement Review',
      'finance_stage': 'Finance Approval',
      'pay_vendor_stage': 'Payment Processing',
      'delivery_stage': 'Delivery Confirmation',
      'completed': 'Completed'
    };
    return stages[stage] || stage;
  },

  formatStatus: (status) => {
    const statuses = {
      'submitted': 'Submitted',
      'pending_approval': 'Pending Approval',
      'pending_procurement_review': 'Pending Procurement Review',
      'pending_finance_approval': 'Pending Finance Approval',
      'payment_in_progress': 'Payment in Progress',
      'awaiting_delivery_confirmation': 'Awaiting Delivery Confirmation',
      'completed': 'Completed',
      'rejected': 'Rejected',
      'cancelled': 'Cancelled'
    };
    return statuses[status] || status;
  },

  // Format department name for display
  formatDepartment: (department) => {
    if (!department) return '';
    return department.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Settings API
  getSettings: async () => {
    return api.get('/purchase-requests/settings');
  },

  updateSettings: async (settings) => {
    return api.put('/purchase-requests/settings', { settings });
  },

  // Managers API
  getManagers: async () => {
    return api.get('/purchase-requests/managers');
  },

  addManager: async (managerData) => {
    return api.post('/purchase-requests/managers', managerData);
  },

  updateManager: async (managerId, managerData) => {
    return api.put(`/purchase-requests/managers/${managerId}`, managerData);
  },

  removeManager: async (managerId) => {
    return api.delete(`/purchase-requests/managers/${managerId}`);
  },

  getAvailableEmployees: async () => {
    return api.get('/purchase-requests/managers/available-employees');
  },

  getAvailableDepartments: async () => {
    return api.get('/purchase-requests/managers/available-departments');
  },

  getWorkflowSteps: () => {
    return [
      {
        id: 'request_creation',
        name: 'Request Creation',
        description: 'Initial request submission'
      },
      {
        id: 'approval_stage',
        name: 'Department Approval',
        description: 'Department head approval'
      },
      {
        id: 'processing_stage',
        name: 'Processing',
        description: 'Conditional routing based on amount'
      },
      {
        id: 'procurement_stage',
        name: 'Procurement Review',
        description: 'Vendor validation (for amounts >= NGN 1,000,000)'
      },
      {
        id: 'finance_stage',
        name: 'Finance Approval',
        description: 'Budget approval and payment authorization'
      },
      {
        id: 'pay_vendor_stage',
        name: 'Payment Processing',
        description: 'Vendor payment execution'
      },
      {
        id: 'delivery_stage',
        name: 'Delivery Confirmation',
        description: 'Operations 2 delivery confirmation'
      },
      {
        id: 'completed',
        name: 'Completed',
        description: 'Workflow completed successfully'
      }
    ];
  }
};

export default purchaseRequestService;