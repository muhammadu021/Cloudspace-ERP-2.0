import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

class PayrollService {
  // Payroll Periods
  async getPayrollPeriods(params = {}) {
    try {
      const response = await api.get('/payroll/periods', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPayrollPeriod(periodId) {
    try {
      const response = await api.get(`/payroll/periods/${periodId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async autoGeneratePayrollPeriod(params = {}) {
    try {
      const response = await api.post('/payroll/periods/auto-generate', params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPayrollPeriod(periodData) {
    try {
      const response = await api.post('/payroll/periods', periodData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePayrollPeriod(periodId, periodData) {
    try {
      const response = await api.put(`/payroll/periods/${periodId}`, periodData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePayrollPeriodStatus(periodId, status, notes = '') {
    try {
      const response = await api.patch(`/payroll/periods/${periodId}/status`, {
        status,
        notes
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async openPayrollPeriod(periodId, notes = '') {
    try {
      const response = await api.post(`/payroll/periods/${periodId}/open`, {
        notes
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async closePayrollPeriod(periodId, notes = '') {
    try {
      const response = await api.post(`/payroll/periods/${periodId}/close`, {
        notes
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePayrollPeriod(periodId) {
    try {
      const response = await api.delete(`/payroll/periods/${periodId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Payroll Processing
  async processPayroll(processData) {
    try {
      const response = await api.post('/payroll/process', processData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async processPayrollWithStatusCheck(processData) {
    try {
      // First check if period is ready for processing
      const periodResponse = await this.getPayrollPeriod(processData.period_id);
      const period = periodResponse.data?.period;
      
      if (!period) {
        throw new Error('Payroll period not found');
      }
      
      // Check if period status allows processing
      if (!this.canProcessPeriod(period.status)) {
        throw new Error(`Payroll period is not open for processing. Current status: ${period.status}. Please open the period first.`);
      }
      
      // Proceed with processing
      const response = await api.post('/payroll/process', processData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPayrollRecords(params = {}) {
    try {
      const response = await api.get('/payroll/records', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async approvePayroll(approvalData) {
    try {
      const response = await api.post('/payroll/approve', approvalData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Salary Components
  async getSalaryComponents(params = {}) {
    try {
      const response = await api.get('/payroll/salary-components', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createSalaryComponent(componentData) {
    try {
      const response = await api.post('/payroll/salary-components', componentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateSalaryComponent(componentId, componentData) {
    try {
      const response = await api.put(`/payroll/salary-components/${componentId}`, componentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteSalaryComponent(componentId) {
    try {
      const response = await api.delete(`/payroll/salary-components/${componentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tax Configuration
  async getTaxConfigurations(params = {}) {
    try {
      const response = await api.get('/payroll/tax-configurations', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTaxConfiguration(taxData) {
    try {
      const response = await api.post('/payroll/tax-configurations', taxData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTaxConfiguration(taxId, taxData) {
    try {
      const response = await api.put(`/payroll/tax-configurations/${taxId}`, taxData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTaxConfiguration(taxId) {
    try {
      const response = await api.delete(`/payroll/tax-configurations/${taxId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Payslip Generation
  async generatePayslips(params = {}) {
    try {
      const response = await api.post('/payroll/generate-payslips', params);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPayslipTemplates(params = {}) {
    try {
      const response = await api.get('/payroll/payslip-templates', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createPayslipTemplate(templateData) {
    try {
      const response = await api.post('/payroll/payslip-templates', templateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Payroll Analytics
  async getPayrollAnalytics(params = {}) {
    try {
      const response = await api.get('/payroll/analytics', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Individual Payroll Record Management
  async getPayrollRecord(recordId) {
    try {
      const response = await api.get(`/payroll/record/${recordId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePayrollRecord(recordId, updateData) {
    try {
      const response = await api.put(`/payroll/record/${recordId}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePayrollRecord(recordId) {
    try {
      const response = await api.delete(`/payroll/record/${recordId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Employee Payroll History
  async getEmployeePayrollHistory(employeeId, params = {}) {
    try {
      const response = await api.get(`/payroll/employee/${employeeId}/history`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPayrollComparison(employeeId, periodIds) {
    try {
      const periods = Array.isArray(periodIds) ? periodIds.join(',') : periodIds;
      const response = await api.get(`/payroll/employee/${employeeId}/comparison`, {
        params: { periods }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async distributePayslips(distributionData) {
    try {
      const response = await api.post('/payroll/distribute-payslips', distributionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePayslipTemplate(templateId, updateData) {
    try {
      const response = await api.put(`/payroll/templates/${templateId}`, updateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deletePayslipTemplate(templateId) {
    try {
      const response = await api.delete(`/payroll/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPayrollSummary(params = {}) {
    try {
      const response = await api.get('/payroll/summary', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Audit Trail
  async getPayrollAudit(params = {}) {
    try {
      const response = await api.get('/payroll/audit', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Batch Processing
  async validatePayrollBatch(validationData) {
    try {
      const response = await api.post('/payroll/validate-batch', validationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async batchProcessPayroll(batchData) {
    try {
      const response = await api.post('/payroll/batch-process', batchData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Approval Workflow
  async submitForApproval(submissionData) {
    try {
      const response = await api.post('/payroll/submit-for-approval', submissionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async submitToFinance(submissionData) {
    try {
      const response = await api.post('/payroll/submit-to-finance', submissionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPayrollsAwaitingFinanceApproval(params = {}) {
    try {
      const response = await api.get('/payroll/awaiting-finance-approval', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPayrollSubmissionHistory(params = {}) {
    try {
      const response = await api.get('/payroll/submission-history', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async rejectPayroll(rejectionData) {
    try {
      const response = await api.post('/payroll/reject', rejectionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getApprovalQueue(params = {}) {
    try {
      const response = await api.get('/payroll/approval-queue', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Period Generation Utilities
  generatePeriodForMonth(year, month, periodType = 'monthly') {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    const payDate = new Date(year, month + 1, 5); // 5th of next month
    const cutoffDate = new Date(year, month, 25); // 25th of current month
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0];
    };
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return {
      name: `${monthNames[month]} ${year}`,
      period_type: periodType,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      pay_date: formatDate(payDate),
      cutoff_date: formatDate(cutoffDate),
      currency: 'NGN',
      exchange_rate: 1.0,
      notes: `Auto-generated period for ${monthNames[month]} ${year}`
    };
  }

  getCurrentMonthPeriodData() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // If we're past the 25th of the month, generate for next month
    if (now.getDate() > 25) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      return this.generatePeriodForMonth(nextYear, nextMonth);
    }
    
    return this.generatePeriodForMonth(currentYear, currentMonth);
  }

  getNextMonthPeriodData() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    return this.generatePeriodForMonth(nextYear, nextMonth);
  }

  checkIfPeriodExists(periods, year, month) {
    return periods.some(period => {
      const periodDate = new Date(period.start_date);
      return periodDate.getMonth() === month && periodDate.getFullYear() === year;
    });
  }

  // Period Status Management
  canProcessPeriod(status) {
    return ['open', 'processing'].includes(status);
  }

  canEditPeriod(status) {
    return ['draft', 'open'].includes(status);
  }

  canDeletePeriod(status) {
    return ['draft'].includes(status);
  }

  getNextValidStatus(currentStatus) {
    const statusFlow = {
      'draft': ['open'],
      'open': ['processing', 'closed'],
      'processing': ['hr_approved', 'open'], // HR approval first
      'hr_approved': ['submitted_to_finance'], // Then submit to finance
      'submitted_to_finance': ['finance_approved', 'finance_rejected'],
      'finance_approved': ['paid'],
      'finance_rejected': ['processing'], // Back to processing for corrections
      'paid': ['completed'],
      'completed': [],
      'cancelled': [],
      'closed': ['open'] // Can reopen if needed
    };
    
    return statusFlow[currentStatus] || [];
  }

  getStatusDescription(status) {
    const descriptions = {
      'draft': 'Period is being set up and not ready for processing',
      'open': 'Period is ready for payroll processing',
      'processing': 'Payroll is currently being processed by HR',
      'hr_approved': 'Payroll has been approved by HR and ready for finance review',
      'submitted_to_finance': 'Payroll has been submitted to Finance for final approval',
      'finance_approved': 'Payroll has been approved by Finance and ready for payment',
      'finance_rejected': 'Payroll has been rejected by Finance and needs corrections',
      'paid': 'Payments have been made to employees',
      'completed': 'Period is fully completed and closed',
      'cancelled': 'Period has been cancelled',
      'closed': 'Period is temporarily closed for processing'
    };
    
    return descriptions[status] || 'Unknown status';
  }

  getStatusColor(status) {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'open': 'bg-blue-100 text-blue-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'hr_approved': 'bg-green-100 text-green-800',
      'submitted_to_finance': 'bg-orange-100 text-orange-800',
      'finance_approved': 'bg-emerald-100 text-emerald-800',
      'finance_rejected': 'bg-red-100 text-red-800',
      'paid': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  // Utility methods
  calculateGrossSalary(basicSalary, allowances = {}, overtime = 0, bonus = 0, commission = 0) {
    const totalAllowances = Object.values(allowances).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
    return parseFloat(basicSalary || 0) + totalAllowances + parseFloat(overtime || 0) + parseFloat(bonus || 0) + parseFloat(commission || 0);
  }

  calculateNetSalary(grossSalary, deductions = {}, taxes = {}) {
    const totalDeductions = Object.values(deductions).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
    const totalTaxes = Object.values(taxes).reduce((sum, amount) => sum + (parseFloat(amount) || 0), 0);
    return parseFloat(grossSalary || 0) - totalDeductions - totalTaxes;
  }

  formatCurrency(amount, currency = 'NGN') {
    if (currency === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
      }).format(amount || 0);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount || 0);
  }

  formatPayrollPeriod(period) {
    if (!period) return '';
    
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);
    
    // If period has a name that includes month/year info, use it
    if (period.name && period.name.trim()) {
      // For monthly periods, show: "December 2024 (Dec 1 - Dec 31)"
      if (period.period_type === 'monthly') {
        const monthYear = period.name;
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const monthName = startDate.toLocaleDateString('en-US', { month: 'short' });
        return `${monthYear} (${monthName} ${startDay} - ${monthName} ${endDay})`;
      }
      
      // For other periods, show: "Period Name (Start Date - End Date)"
      const startFormatted = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return `${period.name} (${startFormatted} - ${endFormatted})`;
    }
    
    // Fallback: show full month names with dates
    const startFormatted = startDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const endFormatted = endDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return `${startFormatted} - ${endFormatted}`;
  }

  formatPeriodMonth(period) {
    if (!period) return '';
    
    const startDate = new Date(period.start_date);
    
    // If period has a name, use it (e.g., "December 2024")
    if (period.name && period.name.trim()) {
      return period.name;
    }
    
    // Fallback: extract month and year from start date
    return startDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  formatPeriodDateRange(period) {
    if (!period) return '';
    
    const startDate = new Date(period.start_date);
    const endDate = new Date(period.end_date);
    
    const startFormatted = startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endFormatted = endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    
    return `${startFormatted} - ${endFormatted}`;
  }

  getPayrollStatusColor(status) {
    const statusColors = {
      draft: '#6c757d',
      open: '#17a2b8',
      processing: '#ffc107',
      approved: '#28a745',
      paid: '#007bff',
      cancelled: '#dc3545',
      completed: '#28a745',
      closed: '#6c757d'
    };
    
    return statusColors[status] || '#6c757d';
  }

  getPayrollStatusIcon(status) {
    const statusIcons = {
      draft: 'edit',
      open: 'unlock',
      processing: 'clock',
      approved: 'check-circle',
      paid: 'credit-card',
      cancelled: 'x-circle',
      completed: 'check-circle-2',
      closed: 'lock'
    };
    
    return statusIcons[status] || 'help-circle';
  }

  validatePayrollPeriod(periodData) {
    const errors = [];
    
    if (!periodData.name || periodData.name.trim().length === 0) {
      errors.push('Period name is required');
    }
    
    if (!periodData.start_date) {
      errors.push('Start date is required');
    }
    
    if (!periodData.end_date) {
      errors.push('End date is required');
    }
    
    if (!periodData.pay_date) {
      errors.push('Pay date is required');
    }
    
    if (periodData.start_date && periodData.end_date) {
      const startDate = new Date(periodData.start_date);
      const endDate = new Date(periodData.end_date);
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date');
      }
    }
    
    if (periodData.pay_date && periodData.end_date) {
      const payDate = new Date(periodData.pay_date);
      const endDate = new Date(periodData.end_date);
      
      if (payDate < endDate) {
        errors.push('Pay date should be after period end date');
      }
    }
    
    return errors;
  }

  validateSalaryComponent(componentData) {
    const errors = [];
    
    if (!componentData.component_name || componentData.component_name.trim().length === 0) {
      errors.push('Component name is required');
    }
    
    if (!componentData.component_code || componentData.component_code.trim().length === 0) {
      errors.push('Component code is required');
    }
    
    if (!componentData.component_type) {
      errors.push('Component type is required');
    }
    
    if (!componentData.calculation_type) {
      errors.push('Calculation type is required');
    }
    
    if (componentData.calculation_type === 'fixed' && (!componentData.amount || componentData.amount <= 0)) {
      errors.push('Amount is required for fixed calculation type');
    }
    
    if (componentData.calculation_type === 'percentage' && (!componentData.percentage || componentData.percentage <= 0)) {
      errors.push('Percentage is required for percentage calculation type');
    }
    
    if (!componentData.effective_from) {
      errors.push('Effective from date is required');
    }
    
    return errors;
  }

  // Enhanced Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const errors = error.response.data?.errors || {};
      const status = error.response.status;
      
      // Enhanced error messages for common payroll issues
      if (message.includes('not open for processing')) {
        return { 
          message: 'Payroll period is not open for processing. Please open the period first before running payroll.', 
          errors, 
          status,
          actionable: true,
          action: 'open_period'
        };
      }
      
      if (message.includes('no active employees')) {
        return { 
          message: 'No active employees found for processing. Please check employee data and employment status.', 
          errors, 
          status,
          actionable: true,
          action: 'check_employees'
        };
      }
      
      if (message.includes('salary components missing')) {
        return { 
          message: 'Some employees are missing salary components. Please configure salary components before processing.', 
          errors, 
          status,
          actionable: true,
          action: 'configure_salary'
        };
      }
      
      return { message, errors, status };
    } else if (error.request) {
      // Request was made but no response received
      return { message: 'Network error. Please check your connection.', errors: {} };
    } else {
      // Something else happened
      return { message: error.message || 'An unexpected error occurred', errors: {} };
    }
  }
}

export default new PayrollService();

// Export additional utilities
export const PayrollStatusUtils = {
  canProcessPeriod: (status) => ['open', 'processing'].includes(status),
  canEditPeriod: (status) => ['draft', 'open'].includes(status),
  canDeletePeriod: (status) => ['draft'].includes(status),
  getStatusColor: (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'open': 'bg-blue-100 text-blue-800',
      'processing': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'paid': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
};