import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

class LeaveService {
  // Leave Types
  async getLeaveTypes(params = {}) {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/hr/leaves/types', { params: { ...params, company_id } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createLeaveType(leaveTypeData) {
    try {
      const response = await api.post('/hr/leaves/types', leaveTypeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateLeaveType(leaveTypeId, leaveTypeData) {
    try {
      const response = await api.put(`/hr/leaves/types/${leaveTypeId}`, leaveTypeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteLeaveType(leaveTypeId) {
    try {
      const response = await api.delete(`/hr/leaves/types/${leaveTypeId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Leave Balances
  async getLeaveBalances(params = {}) {
    try {
      const response = await api.get('/hr/leaves/balances', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async initializeLeaveBalances(data) {
    try {
      const response = await api.post('/hr/leaves/balances/initialize', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Leave Requests
  async getLeaveRequests(params = {}) {
    try {
      const response = await api.get('/hr/leaves', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createLeaveRequest(leaveData) {
    try {
      const response = await api.post('/hr/leaves', leaveData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approveLeaveRequest(leaveId, data = {}) {
    try {
      const response = await api.patch(`/hr/leaves/${leaveId}/approve`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectLeaveRequest(leaveId, data) {
    try {
      const response = await api.patch(`/hr/leaves/${leaveId}/reject`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async cancelLeaveRequest(leaveId, data) {
    try {
      const response = await api.patch(`/hr/leaves/${leaveId}/cancel`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Leave Calendar
  async getLeaveCalendar(params = {}) {
    try {
      const response = await api.get('/hr/leaves/calendar', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Leave Analytics
  async getLeaveAnalytics(params = {}) {
    try {
      const response = await api.get('/hr/leaves/analytics', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Leave Policies
  async getLeavePolicies(params = {}) {
    try {
      const response = await api.get('/hr/leaves/policies', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createLeavePolicy(policyData) {
    try {
      const response = await api.post('/hr/leaves/policies', policyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateLeavePolicy(policyId, policyData) {
    try {
      const response = await api.put(`/hr/leaves/policies/${policyId}`, policyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteLeavePolicy(policyId) {
    try {
      const response = await api.delete(`/hr/leaves/policies/${policyId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Approval Workflows
  async getApprovalWorkflows(params = {}) {
    try {
      const response = await api.get('/hr/leaves/workflows', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createApprovalWorkflow(workflowData) {
    try {
      const response = await api.post('/hr/leaves/workflows', workflowData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateApprovalWorkflow(workflowId, workflowData) {
    try {
      const response = await api.put(`/hr/leaves/workflows/${workflowId}`, workflowData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteApprovalWorkflow(workflowId) {
    try {
      const response = await api.delete(`/hr/leaves/workflows/${workflowId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleApprovalWorkflow(workflowId, data) {
    try {
      const response = await api.patch(`/hr/leaves/workflows/${workflowId}/toggle`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Current Leaves (Staff on Leave)
  async getCurrentLeaves(params = {}) {
    try {
      const response = await api.get('/hr/leaves/current', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Staff Recall
  async recallStaffFromLeave(leaveId, recallData) {
    try {
      const response = await api.patch(`/hr/leaves/${leaveId}/recall`, recallData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Helper endpoints for dropdowns
  async getEmployees(params = {}) {
    try {
      const response = await api.get('/hr/leaves/employees', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getRoles(params = {}) {
    try {
      const response = await api.get('/hr/leaves/roles', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDepartments(params = {}) {
    try {
      const response = await api.get('/hr/leaves/departments', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const errors = error.response.data?.errors || {};
      return { message, errors, status: error.response.status };
    } else if (error.request) {
      // Request was made but no response received
      return { message: 'Network error. Please check your connection.', errors: {} };
    } else {
      // Something else happened
      return { message: error.message || 'An unexpected error occurred', errors: {} };
    }
  }
}

export default new LeaveService();