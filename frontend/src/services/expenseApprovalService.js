import api from './api';
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

const expenseApprovalService = {
  // Get pending expense approvals for current user
  getPendingApprovals: async (params = {}) => {
    const company_id = getCompanyId();
    return api.get('/approvals/pending', { params: { ...params, company_id } });
  },

  // Get approval statistics for dashboard
  getApprovalStats: async (params = {}) => {
    const company_id = getCompanyId();
    return api.get('/approvals/stats', { params: { ...params, company_id } });
  },

  // Get specific expense claim for approval
  getExpenseForApproval: async (id) => {
    const company_id = getCompanyId();
    return api.get(`/approvals/expenses/${id}`, { params: { company_id } });
  },

  // Approve expense claim
  approveExpense: async (id, data) => {
    const company_id = getCompanyId();
    return api.post(`/approvals/expenses/${id}/approve`, { ...data, company_id });
  },

  // Reject expense claim
  rejectExpense: async (id, data) => {
    const company_id = getCompanyId();
    return api.post(`/approvals/expenses/${id}/reject`, { ...data, company_id });
  },

  // Return expense claim for revision
  returnExpense: async (id, data) => {
    const company_id = getCompanyId();
    return api.post(`/approvals/expenses/${id}/return`, { ...data, company_id });
  },

  // Get workflow status for expense claim
  getWorkflowStatus: async (expenseId) => {
    const company_id = getCompanyId();
    return api.get(`/self-service/expense-claims/${expenseId}/workflow`, { params: { company_id } });
  }
};

export default expenseApprovalService;
