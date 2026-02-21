import api from './api'
import { getCompanyId } from '../utils/company'

export const selfServiceService = {
  // Dashboard
  getSelfServiceDashboard: () => {
    const company_id = getCompanyId();
    return api.get('/self-service/dashboard', { params: { company_id } });
  },

  // Profile Management
  getProfile: () => {
    const company_id = getCompanyId();
    return api.get('/self-service/profile', { params: { company_id } });
  },
  updateProfile: (profileData) => {
    const company_id = getCompanyId();
    return api.put('/self-service/profile', { ...profileData, company_id });
  },
  changePassword: (passwordData) => {
    const company_id = getCompanyId();
    return api.put('/self-service/change-password', { ...passwordData, company_id });
  },
  uploadProfilePicture: (formData) => {
    const company_id = getCompanyId();
    formData.append('company_id', company_id);
    return api.post('/self-service/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Leave Management
  getMyLeaves: (params) => {
    const company_id = getCompanyId();
    return api.get('/self-service/leaves', { params: { ...params, company_id } });
  },
  requestLeave: (leaveData) => {
    const company_id = getCompanyId();
    return api.post('/self-service/leaves', { ...leaveData, company_id });
  },

  // Timesheet Management
  getMyTimesheets: (params) => api.get('/self-service/timesheets', { params }),
  getTimesheetById: (id) => api.get(`/self-service/timesheets/${id}`),
  createTimesheet: (timesheetData) => api.post('/self-service/timesheets', timesheetData),
  updateTimesheet: (id, timesheetData) => api.put(`/self-service/timesheets/${id}`, timesheetData),
  submitTimesheet: (id) => api.post(`/self-service/timesheets/${id}/submit`),
  deleteTimesheet: (id) => api.delete(`/self-service/timesheets/${id}`),

  // Attendance Management
  getMyAttendance: (params) => api.get('/self-service/attendance', { params }),
  checkIn: (attendanceData) => api.post('/self-service/attendance/checkin', attendanceData),
  checkOut: (attendanceData) => api.post('/self-service/attendance/checkout', attendanceData),

  // Payroll Information
  getMyPayroll: (params) => api.get('/self-service/payroll', { params }),

  // Tasks and Projects
  getMyTasks: (params) => api.get('/self-service/tasks', { params }),
  updateTaskStatus: (taskId, statusData) => api.patch(`/self-service/tasks/${taskId}/status`, statusData),
  reportTaskStatus: (taskId, reportData) => api.patch(`/self-service/tasks/${taskId}/report-status`, reportData),

  // Notifications
  getMyNotifications: (params) => api.get('/self-service/notifications', { params }),
  markNotificationAsRead: (id) => api.patch(`/self-service/notifications/${id}/read`),

  // Expense Claims
  getMyExpenses: (params) => api.get('/self-service/expenses', { params }),
  getExpenseById: (id) => api.get(`/self-service/expenses/${id}`),
  createExpense: (expenseData) => api.post('/self-service/expenses', expenseData),
  updateExpense: (id, expenseData) => api.put(`/self-service/expenses/${id}`, expenseData),
  submitExpense: (id) => api.post(`/self-service/expenses/${id}/submit`),
  deleteExpense: (id) => api.delete(`/self-service/expenses/${id}`),

  // Expense Claims (Alternative endpoints for backward compatibility)
  getMyExpenseClaims: (params) => api.get('/self-service/expense-claims', { params }),
  getExpenseClaimById: (id) => api.get(`/self-service/expense-claims/${id}`),
  createExpenseClaim: (expenseData) => api.post('/self-service/expense-claims', expenseData),
  updateExpenseClaim: (id, expenseData) => api.put(`/self-service/expense-claims/${id}`, expenseData),
  submitExpenseClaim: (id) => api.post(`/self-service/expense-claims/${id}/submit`),
  deleteExpenseClaim: (id) => api.delete(`/self-service/expense-claims/${id}`),

  // Document Management
  getMyDocuments: (params) => api.get('/self-service/documents', { params }),
  getDocumentById: (id) => api.get(`/self-service/documents/${id}`),
  uploadDocument: (documentData) => api.post('/self-service/documents', documentData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  updateDocument: (id, documentData) => api.put(`/self-service/documents/${id}`, documentData),
  deleteDocument: (id) => api.delete(`/self-service/documents/${id}`),
  downloadDocument: (id) => api.get(`/self-service/documents/${id}/download`, { responseType: 'blob' }),
  shareDocument: (id, shareData) => api.post(`/self-service/documents/${id}/share`, shareData),
  getDocumentVersions: (id) => api.get(`/self-service/documents/${id}/versions`),
  getSharedDocuments: (params) => api.get('/self-service/documents/shared', { params }),
  getDepartmentDocuments: (params) => api.get('/self-service/documents/department', { params }),
  getPublicDocuments: (params) => api.get('/self-service/documents/public', { params }),

  // Folder Management
  getFolders: (params) => api.get('/self-service/folders', { params }),
  getFolderById: (id) => api.get(`/self-service/folders/${id}`),
  createFolder: (folderData) => api.post('/self-service/folders', folderData),
  updateFolder: (id, folderData) => api.put(`/self-service/folders/${id}`, folderData),
  deleteFolder: (id) => api.delete(`/self-service/folders/${id}`),
  getFolderPath: (id) => api.get(`/self-service/folders/${id}/path`),

  // Performance Goals
  getMyPerformanceGoals: (params) => api.get('/self-service/performance-goals', { params }),

  // Training Enrollment
  getAvailableCourses: (params) => api.get('/self-service/training/courses', { params }),
  getMyTrainingEnrollments: (params) => api.get('/self-service/training/enrollments', { params }),
  enrollInTraining: (enrollmentData) => api.post('/self-service/training/enroll', enrollmentData),
  cancelTrainingEnrollment: (id) => api.post(`/self-service/training/enrollments/${id}/cancel`),

  // Benefits Management
  getBenefits: (params) => api.get('/self-service/benefits', { params }),
  updateBenefitEnrollment: (benefitId, data) => api.post(`/self-service/benefits/${benefitId}/enroll`, data),

  // Utility functions
  getLeaveTypes: () => Promise.resolve({
    data: {
      data: {
        leaveTypes: [
          { value: 'annual', label: 'Annual Leave', color: 'blue', maxDays: 25 },
          { value: 'sick', label: 'Sick Leave', color: 'red', maxDays: 10 },
          { value: 'personal', label: 'Personal Leave', color: 'green', maxDays: 5 },
          { value: 'maternity', label: 'Maternity Leave', color: 'pink', maxDays: 90 },
          { value: 'paternity', label: 'Paternity Leave', color: 'purple', maxDays: 14 },
          { value: 'emergency', label: 'Emergency Leave', color: 'orange', maxDays: 3 }
        ]
      }
    }
  }),

  getExpenseTypes: () => Promise.resolve({
    data: {
      data: {
        expenseTypes: [
          { value: 'travel', label: 'Travel & Transportation', icon: 'plane' },
          { value: 'meals', label: 'Meals & Entertainment', icon: 'utensils' },
          { value: 'accommodation', label: 'Accommodation', icon: 'bed' },
          { value: 'office_supplies', label: 'Office Supplies', icon: 'briefcase' },
          { value: 'entertainment', label: 'Client Entertainment', icon: 'users' },
          { value: 'training', label: 'Training & Development', icon: 'graduation-cap' },
          { value: 'communication', label: 'Communication', icon: 'phone' },
          { value: 'other', label: 'Other Expenses', icon: 'file-text' }
        ]
      }
    }
  }),

  getWorkTypes: () => Promise.resolve({
    data: {
      data: {
        workTypes: [
          { value: 'office', label: 'Office Work', icon: 'building' },
          { value: 'remote', label: 'Remote Work', icon: 'home' },
          { value: 'hybrid', label: 'Hybrid Work', icon: 'shuffle' },
          { value: 'field', label: 'Field Work', icon: 'map-pin' },
          { value: 'travel', label: 'Travel Work', icon: 'plane' }
        ]
      }
    }
  }),

  getTimesheetStatuses: () => Promise.resolve({
    data: {
      data: {
        statuses: [
          { value: 'draft', label: 'Draft', color: 'gray' },
          { value: 'submitted', label: 'Submitted', color: 'blue' },
          { value: 'approved', label: 'Approved', color: 'green' },
          { value: 'rejected', label: 'Rejected', color: 'red' },
          { value: 'locked', label: 'Locked', color: 'purple' }
        ]
      }
    }
  }),

  getExpenseStatuses: () => Promise.resolve({
    data: {
      data: {
        statuses: [
          { value: 'draft', label: 'Draft', color: 'gray' },
          { value: 'submitted', label: 'Submitted', color: 'blue' },
          { value: 'pending', label: 'Pending Review', color: 'yellow' },
          { value: 'approved', label: 'Approved', color: 'green' },
          { value: 'rejected', label: 'Rejected', color: 'red' },
          { value: 'paid', label: 'Paid', color: 'purple' },
          { value: 'cancelled', label: 'Cancelled', color: 'orange' }
        ]
      }
    }
  }),

  getTaskStatuses: () => Promise.resolve({
    data: {
      data: {
        statuses: [
          { value: 'pending', label: 'Pending', color: 'gray' },
          { value: 'in_progress', label: 'In Progress', color: 'blue' },
          { value: 'completed', label: 'Completed', color: 'green' },
          { value: 'cancelled', label: 'Cancelled', color: 'red' }
        ]
      }
    }
  }),

  getTaskPriorities: () => Promise.resolve({
    data: {
      data: {
        priorities: [
          { value: 'low', label: 'Low Priority', color: 'green' },
          { value: 'medium', label: 'Medium Priority', color: 'yellow' },
          { value: 'high', label: 'High Priority', color: 'orange' },
          { value: 'urgent', label: 'Urgent', color: 'red' }
        ]
      }
    }
  }),

  getCurrencies: () => Promise.resolve({
    data: {
      data: {
        currencies: [
          { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
          { value: 'EUR', label: 'Euro (€)', symbol: '€' },
          { value: 'GBP', label: 'British Pound (£)', symbol: '£' },
          { value: 'JPY', label: 'Japanese Yen (¥)', symbol: '¥' },
          { value: 'CAD', label: 'Canadian Dollar (C$)', symbol: 'C$' },
          { value: 'AUD', label: 'Australian Dollar (A$)', symbol: 'A$' }
        ]
      }
    }
  }),

  getDocumentCategories: () => Promise.resolve({
    data: {
      data: {
        categories: [
          { value: 'policy', label: 'Company Policies', icon: 'shield' },
          { value: 'handbook', label: 'Employee Handbook', icon: 'book' },
          { value: 'forms', label: 'Forms & Templates', icon: 'file-text' },
          { value: 'benefits', label: 'Benefits Information', icon: 'heart' },
          { value: 'training', label: 'Training Materials', icon: 'graduation-cap' },
          { value: 'procedures', label: 'Procedures & Guidelines', icon: 'list' },
          { value: 'personal', label: 'Personal Documents', icon: 'user' },
          { value: 'other', label: 'Other Documents', icon: 'folder' }
        ]
      }
    }
  }),

  getPerformanceGoalCategories: () => Promise.resolve({
    data: {
      data: {
        categories: [
          { value: 'professional_development', label: 'Professional Development', icon: 'trending-up' },
          { value: 'performance', label: 'Performance Improvement', icon: 'target' },
          { value: 'skills', label: 'Skills Development', icon: 'award' },
          { value: 'leadership', label: 'Leadership', icon: 'users' },
          { value: 'innovation', label: 'Innovation & Creativity', icon: 'lightbulb' },
          { value: 'collaboration', label: 'Team Collaboration', icon: 'users' },
          { value: 'customer_service', label: 'Customer Service', icon: 'smile' },
          { value: 'other', label: 'Other Goals', icon: 'flag' }
        ]
      }
    }
  }),

  // Helper functions for timesheet calculations
  calculateTimesheetHours: (timeEntries) => {
    if (!Array.isArray(timeEntries)) return { totalHours: 0, regularHours: 0, overtimeHours: 0, billableHours: 0 };

    let totalHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;
    let billableHours = 0;

    timeEntries.forEach(entry => {
      const dayHours = parseFloat(entry.hours || 0);
      const dayBillableHours = parseFloat(entry.billable_hours || 0);

      totalHours += dayHours;
      billableHours += dayBillableHours;

      if (dayHours <= 8) {
        regularHours += dayHours;
      } else {
        regularHours += 8;
        overtimeHours += (dayHours - 8);
      }
    });

    return {
      totalHours: totalHours.toFixed(2),
      regularHours: regularHours.toFixed(2),
      overtimeHours: overtimeHours.toFixed(2),
      billableHours: billableHours.toFixed(2),
      nonBillableHours: (totalHours - billableHours).toFixed(2)
    };
  },

  // Helper function to generate timesheet template
  generateTimesheetTemplate: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeEntries = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // Skip weekends for default template
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        timeEntries.push({
          date: date.toISOString().split('T')[0],
          hours: 8,
          break_hours: 1,
          billable_hours: 8,
          description: '',
          project_id: null,
          task_description: ''
        });
      }
    }

    return timeEntries;
  },

  // Helper function to calculate leave days
  calculateLeaveDays: (startDate, endDate, excludeWeekends = true) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = 0;

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      if (excludeWeekends && (date.getDay() === 0 || date.getDay() === 6)) {
        continue; // Skip weekends
      }
      days++;
    }

    return days;
  }
}

export default selfServiceService