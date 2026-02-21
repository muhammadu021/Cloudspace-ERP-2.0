import api from './api'
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

const hrService = {
  // Users (for employee creation)
  createUser: (userData) => {
    const company_id = getCompanyId();
    return api.post('/auth/register', { ...userData, company_id });
  },
  
  // Employees
  getEmployees: (params) => {
    const company_id = getCompanyId();
    return api.get('/hr/employees', { params: { ...params, company_id } });
  },
  getEmployeeById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/hr/employees/${id}`, { params: { company_id } });
  },
  createEmployee: (employeeData) => {
    const company_id = getCompanyId();
    return api.post('/hr/employees', { ...employeeData, company_id });
  },
  updateEmployee: (id, employeeData) => api.put(`/hr/employees/${id}`, employeeData),
  deleteEmployee: (id, data) => api.delete(`/hr/employees/${id}`, { data }),
  uploadEmployeeAvatar: (id, formData) => api.post(`/employees/${id}/profile-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Departments
  getDepartments: () => api.get('/hr/departments'),
  createDepartment: (departmentData) => api.post('/hr/departments', departmentData),
  updateDepartment: (id, departmentData) => api.put(`/hr/departments/${id}`, departmentData),
  deleteDepartment: (id) => api.delete(`/hr/departments/${id}`),
  
  // Attendance
  getAttendance: (params) => api.get('/hr/attendance', { params }),
  checkIn: (data) => api.post('/hr/attendance/checkin', data),
  checkOut: (data) => api.post('/hr/attendance/checkout', data),
  getAttendanceAnalytics: (params) => api.get('/hr/attendance/analytics', { params }),
  createAttendance: (data) => api.post('/hr/attendance', data),
  updateAttendance: (id, data) => api.put(`/hr/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/hr/attendance/${id}`),
  
  // Leave Management
  getLeaves: (params) => api.get('/hr/leaves', { params }),
  requestLeave: (leaveData) => api.post('/hr/leaves', leaveData),
  updateLeave: (id, leaveData) => api.put(`/hr/leaves/${id}`, leaveData),
  approveLeave: (leaveId, data) => api.patch(`/hr/leaves/${leaveId}/approve`, data),
  rejectLeave: (leaveId, data) => api.patch(`/hr/leaves/${leaveId}/reject`, data),
  getLeaveTypes: (params = {}) => api.get('/hr/leaves/types', { params }),
  createLeaveType: (data) => api.post('/hr/leaves/types', data),
  updateLeaveType: (id, data) => api.put(`/hr/leaves/types/${id}`, data),
  deleteLeaveType: (id) => api.delete(`/hr/leaves/types/${id}`),
  getLeaveBalances: (params) => api.get('/hr/leaves/balances', { params }),
  getCurrentLeaves: (params) => api.get('/hr/leaves/current', { params }),
  getLeaveAnalytics: (params) => api.get('/hr/leaves/analytics', { params }),
  getLeaveCalendar: (params) => api.get('/hr/leaves/calendar', { params }),
  cancelLeave: (leaveId, data) => api.patch(`/hr/leaves/${leaveId}/cancel`, data),
  recallStaff: (leaveId, data) => api.patch(`/hr/leaves/${leaveId}/recall`, data),
  
  // Performance Management
  getPerformance: (params) => api.get('/hr/performance', { params }),
  createPerformance: (data) => api.post('/hr/performance', data),
  updatePerformance: (id, data) => api.put(`/hr/performance/${id}`, data),
  deletePerformance: (id) => api.delete(`/hr/performance/${id}`),
  getPerformanceReviews: (params) => api.get('/hr/performance/reviews', { params }),
  createPerformanceReview: (data) => api.post('/hr/performance/reviews', data),
  updatePerformanceReview: (id, data) => api.put(`/hr/performance/reviews/${id}`, data),
  deletePerformanceReview: (id) => api.delete(`/hr/performance/reviews/${id}`),
  getPerformanceGoals: (params) => api.get('/hr/performance/goals', { params }),
  createPerformanceGoal: (data) => api.post('/hr/performance/goals', data),
  updatePerformanceGoal: (id, data) => api.put(`/hr/performance/goals/${id}`, data),
  deletePerformanceGoal: (id) => api.delete(`/hr/performance/goals/${id}`),
  
  // Training Management
  getTraining: (params) => api.get('/hr/training', { params }),
  createTraining: (data) => api.post('/hr/training', data),
  updateTraining: (id, data) => api.put(`/hr/training/${id}`, data),
  deleteTraining: (id) => api.delete(`/hr/training/${id}`),
  getTrainingPrograms: (params) => api.get('/hr/training/programs', { params }),
  createTrainingProgram: (data) => api.post('/hr/training/programs', data),
  updateTrainingProgram: (id, data) => api.put(`/hr/training/programs/${id}`, data),
  deleteTrainingProgram: (id) => api.delete(`/hr/training/programs/${id}`),
  
  // Recruitment Management
  getRecruitment: (params) => api.get('/hr/recruitment', { params }),
  createRecruitment: (data) => api.post('/hr/recruitment', data),
  updateRecruitment: (id, data) => api.put(`/hr/recruitment/${id}`, data),
  deleteRecruitment: (id) => api.delete(`/hr/recruitment/${id}`),
  getJobPostings: (params) => api.get('/hr/recruitment/jobs', { params }),
  createJobPosting: (data) => api.post('/hr/recruitment/jobs', data),
  updateJobPosting: (id, data) => api.put(`/hr/recruitment/jobs/${id}`, data),
  deleteJobPosting: (id) => api.delete(`/hr/recruitment/jobs/${id}`),
  
  // Payroll
  getPayroll: (params) => api.get('/hr/payroll', { params }),
  createPayroll: (payrollData) => api.post('/hr/payroll', payrollData),
  updatePayroll: (id, data) => api.put(`/hr/payroll/${id}`, data),
  deletePayroll: (id) => api.delete(`/hr/payroll/${id}`),
  approvePayroll: (id) => api.patch(`/hr/payroll/${id}/approve`),
  getPayrollRecords: (params) => api.get('/hr/payroll/records', { params }),
  getPayrollAnalytics: (params) => api.get('/hr/payroll/analytics', { params }),
  
  // HR Documents
  getHRDocuments: (params) => api.get('/hr/documents', { params }),
  createHRDocument: (formData) => api.post('/hr/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateHRDocument: (id, data) => api.put(`/hr/documents/${id}`, data),
  deleteHRDocument: (id) => api.delete(`/hr/documents/${id}`),
  downloadHRDocument: (id) => api.get(`/hr/documents/${id}/download`, { responseType: 'blob' }),
  
  // Organizational Chart
  getOrgChartData: (params) => api.get('/hr/org-chart', { params }),
  updateOrgStructure: (data) => api.put('/hr/org-chart/update', data),
  
  // Employee Directory
  getEmployeeDirectory: (params) => api.get('/hr/directory', { params }),
  
  // HR Analytics
  getHRAnalytics: (params) => api.get('/hr/analytics', { params }),
  getHRDashboardStats: (params) => api.get('/hr/dashboard-stats', { params }),
  
  // HR Task Management
  getHRTasks: (params) => api.get('/hr/tasks', { params }),
  createHRTask: (taskData) => api.post('/hr/tasks', taskData),
  updateHRTask: (id, taskData) => api.put(`/hr/tasks/${id}`, taskData),
  deleteHRTask: (id) => api.delete(`/hr/tasks/${id}`),
  assignHRTask: (id, assignData) => api.patch(`/hr/tasks/${id}/assign`, assignData),
  getHRTaskStats: () => api.get('/hr/tasks/stats'),
  
  // Expense Management (HR Manager Approval)
  getPendingExpenses: (params) => api.get('/hr/expenses/pending', { params }),
  getExpenseById: (id) => api.get(`/hr/expenses/${id}`),
  approveExpense: (id, approvalData) => api.put(`/hr/expenses/${id}/approve`, approvalData),
  rejectExpense: (id, rejectionData) => api.put(`/hr/expenses/${id}/reject`, rejectionData),
  getExpenseHistory: (params) => api.get('/hr/expenses', { params }),
  getExpenseStats: () => api.get('/hr/expenses/stats'),
}

export { hrService };
export default hrService;