import api from './api'
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

const financeService = {
  // Dashboard
  getFinancialDashboard: (params) => {
    const company_id = getCompanyId();
    return api.get('/finance/dashboard', { params: { ...params, company_id } });
  },

  // Accounts
  getAccounts: (params) => {
    const company_id = getCompanyId();
    return api.get('/finance/accounts', { params: { ...params, company_id } });
  },
  getAccountById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/finance/accounts/${id}`, { params: { company_id } });
  },
  createAccount: (accountData) => {
    const company_id = getCompanyId();
    return api.post('/finance/accounts', { ...accountData, company_id });
  },
  updateAccount: (id, accountData) => {
    const company_id = getCompanyId();
    return api.put(`/finance/accounts/${id}`, { ...accountData, company_id });
  },
  deleteAccount: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/finance/accounts/${id}`, { params: { company_id } });
  },
  getAccountBalanceHistory: (id, params) => {
    const company_id = getCompanyId();
    return api.get(`/finance/accounts/${id}/balance-history`, { params: { ...params, company_id } });
  },

  // Transactions
  getTransactions: (params) => {
    const company_id = getCompanyId();
    return api.get('/finance/transactions', { params: { ...params, company_id } });
  },
  getTransactionById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/finance/transactions/${id}`, { params: { company_id } });
  },
  createTransaction: (transactionData) => {
    const company_id = getCompanyId();
    return api.post('/finance/transactions', { ...transactionData, company_id });
  },
  updateTransaction: (id, transactionData) => {
    const company_id = getCompanyId();
    return api.put(`/finance/transactions/${id}`, { ...transactionData, company_id });
  },
  deleteTransaction: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/finance/transactions/${id}`, { params: { company_id } });
  },
  approveTransaction: (id) => api.patch(`/finance/transactions/${id}/approve`),

  // Budgets
  getBudgets: (params) => api.get('/finance/budgets', { params }),
  getBudgetById: (id) => api.get(`/finance/budgets/${id}`),
  createBudget: (budgetData) => api.post('/finance/budgets', budgetData),
  updateBudget: (id, budgetData) => api.put(`/finance/budgets/${id}`, budgetData),
  deleteBudget: (id) => api.delete(`/finance/budgets/${id}`),

  // Reports
  getAvailableReports: () => api.get('/finance/reports'),
  getProfitLossReport: (params) => api.get('/finance/reports/profit-loss', { params }),
  getBalanceSheetReport: (params) => api.get('/finance/reports/balance-sheet', { params }),
  getCashFlowReport: (params) => api.get('/finance/reports/cash-flow', { params }),
  
  // Expense Management (Finance Approval)
  getApprovedExpenses: (params) => api.get('/finance/expenses/approved', { params }),
  getPendingFinanceExpenses: (params) => api.get('/finance/expenses/pending', { params }),
  getExpenseById: (id) => api.get(`/finance/expenses/${id}`),
  approveExpensePayment: (id, approvalData) => api.patch(`/finance/expenses/${id}/approve-payment`, approvalData),
  rejectExpensePayment: (id, rejectionData) => api.patch(`/finance/expenses/${id}/reject-payment`, rejectionData),
  processExpensePayment: (id, paymentData) => api.patch(`/finance/expenses/${id}/process-payment`, paymentData),
  getExpensePaymentHistory: (params) => api.get('/finance/expenses/payment-history', { params }),
  getExpenseStats: () => api.get('/finance/expenses/stats'),
  getApprovedExpensesList: (params) => api.get('/finance/expenses/approved-list', { params }),

  // Payroll Approval (Finance Final Approval)
  getPendingPayrollApprovals: (params) => api.get('/finance/payroll/pending-approvals', { params }),
  getPayrollApprovalHistory: (params) => api.get('/finance/payroll/approval-history', { params }),
  getPayrollById: (id) => api.get(`/finance/payroll/${id}`),
  approvePayroll: (id, approvalData) => api.patch(`/finance/payroll/${id}/approve`, approvalData),
  rejectPayroll: (id, rejectionData) => api.patch(`/finance/payroll/${id}/reject`, rejectionData),
  getPayrollApprovalStats: () => api.get('/finance/payroll/approval-stats'),
  bulkApprovePayroll: (approvalData) => api.post('/finance/payroll/bulk-approve', approvalData),
  getPayrollPeriodDetails: (periodId) => api.get(`/finance/payroll/period/${periodId}`),
  getPayrollSummaryForApproval: (periodId) => api.get(`/finance/payroll/period/${periodId}/summary`),
  authorizePayrollPayment: (id, authorizationData) => api.patch(`/finance/payroll/${id}/authorize-payment`, authorizationData),
  getPayrollPaymentQueue: (params) => api.get('/finance/payroll/payment-queue', { params }),
  processPayrollPayments: (paymentData) => api.post('/finance/payroll/process-payments', paymentData),

  // Utility functions
  getAccountTypes: () => Promise.resolve({
    data: {
      data: {
        accountTypes: [
          { value: 'asset', label: 'Asset', normalBalance: 'debit' },
          { value: 'liability', label: 'Liability', normalBalance: 'credit' },
          { value: 'equity', label: 'Equity', normalBalance: 'credit' },
          { value: 'revenue', label: 'Revenue', normalBalance: 'credit' },
          { value: 'expense', label: 'Expense', normalBalance: 'debit' }
        ]
      }
    }
  }),

  getTransactionTypes: () => Promise.resolve({
    data: {
      data: {
        transactionTypes: [
          { value: 'journal', label: 'Journal Entry' },
          { value: 'payment', label: 'Payment' },
          { value: 'receipt', label: 'Receipt' },
          { value: 'transfer', label: 'Transfer' },
          { value: 'adjustment', label: 'Adjustment' }
        ]
      }
    }
  }),

  getBudgetTypes: () => Promise.resolve({
    data: {
      data: {
        budgetTypes: [
          { value: 'annual', label: 'Annual Budget' },
          { value: 'quarterly', label: 'Quarterly Budget' },
          { value: 'monthly', label: 'Monthly Budget' },
          { value: 'project', label: 'Project Budget' },
          { value: 'department', label: 'Department Budget' }
        ]
      }
    }
  }),

  getCurrencies: () => Promise.resolve({
    data: {
      data: {
        currencies: [
          { value: 'USD', label: 'US Dollar ($)' },
          { value: 'EUR', label: 'Euro (€)' },
          { value: 'GBP', label: 'British Pound (£)' },
          { value: 'JPY', label: 'Japanese Yen (¥)' },
          { value: 'CAD', label: 'Canadian Dollar (C$)' },
          { value: 'AUD', label: 'Australian Dollar (A$)' }
        ]
      }
    }
  }),

  // Utility formatting functions
  formatCurrency: (amount, currency = 'NGN') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return currency === 'NGN' ? '₦0.00' : '₦0.00'
    }
    
    const numAmount = parseFloat(amount)
    
    if (currency === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
      }).format(numAmount)
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(numAmount)
  },

  calculatePercentage: (value, total) => {
    if (!total || total === 0 || !value) return 0
    return Math.round((parseFloat(value) / parseFloat(total)) * 100)
  },

  formatDate: (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  },

  formatNumber: (number, decimals = 2) => {
    if (number === null || number === undefined || isNaN(number)) {
      return '0.00'
    }
    return parseFloat(number).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  },

  getAccountTypeColor: (type) => {
    const colors = {
      asset: 'bg-green-100 text-green-800',
      liability: 'bg-red-100 text-red-800',
      equity: 'bg-blue-100 text-blue-800',
      revenue: 'bg-purple-100 text-purple-800',
      expense: 'bg-orange-100 text-orange-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }
}

export { financeService };
export default financeService;