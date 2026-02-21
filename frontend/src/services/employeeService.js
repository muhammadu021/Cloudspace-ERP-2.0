import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';

const employeeService = {
  // Get all employees with filters and pagination
  getEmployees: async (params = {}) => {
    const company_id = getCompanyId();
    const response = await api.get('/hr/employees', { params: { ...params, company_id } });
    // Normalize response structure - backend returns { success, data: { employees } }
    // but some components expect { data: { employees } }
    if (response.data?.data?.employees) {
      return response;
    } else if (response.data?.employees) {
      return { ...response, data: { data: response.data } };
    }
    return response;
  },

  // Get employee by ID with comprehensive data
  getEmployeeById: async (id) => {
    const company_id = getCompanyId();
    return api.get(`/hr/employees/${id}`, { params: { company_id } });
  },

  // Create new employee
  createEmployee: async (employeeData) => {
    const company_id = getCompanyId();
    return api.post('/hr/employees', { ...employeeData, company_id });
  },

  // Update employee
  updateEmployee: async (id, employeeData) => {
    const company_id = getCompanyId();
    return api.put(`/hr/employees/${id}`, { ...employeeData, company_id });
  },

  // Get employee dashboard data
  getEmployeeDashboard: async (id) => {
    const company_id = getCompanyId();
    return api.get(`/hr/employees/${id}/dashboard`, { params: { company_id } });
  },

  // Employment History
  getEmploymentHistory: async (id) => {
    const company_id = getCompanyId();
    return api.get(`/hr/employees/${id}/history`, { params: { company_id } });
  },

  // Performance Reviews
  getPerformanceReviews: async (id, params = {}) => {
    const company_id = getCompanyId();
    return api.get(`/hr/employees/${id}/reviews`, { params: { ...params, company_id } });
  },

  // Document Management
  getEmployeeDocuments: async (id, params = {}) => {
    const company_id = getCompanyId();
    return api.get(`/hr/employees/${id}/documents`, { params: { ...params, company_id } });
  },

  uploadDocument: async (id, formData) => {
    const company_id = getCompanyId();
    if (formData instanceof FormData) {
      formData.append('company_id', company_id);
    }
    return api.post(`/hr/employees/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Onboarding
  getOnboardingTasks: async (id, params = {}) => {
    const company_id = getCompanyId();
    return api.get(`/hr/employees/${id}/onboarding`, { params: { ...params, company_id } });
  },

  updateOnboardingTask: async (taskId, taskData) => {
    const company_id = getCompanyId();
    return api.put(`/hr/employees/onboarding/${taskId}`, { ...taskData, company_id });
  },

  // Departments
  getDepartments: async () => {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/hr/departments', { params: { company_id } });
      // Normalize response structure
      if (response.data?.data?.departments) {
        return response;
      } else if (response.data?.departments) {
        return { ...response, data: { data: response.data } };
      }
      return response;
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  // Roles
  getRoles: async () => {
    try {
      const company_id = getCompanyId();
      return api.get('/admin/roles', { params: { company_id } });
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  // HR Management Actions
  resetEmployeePassword: async (id, password) => {
    try {
      const company_id = getCompanyId();
      return api.post(`/employees/${id}/reset-password`, { password, company_id });
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  },

  toggleEmployeeSuspension: async (id, suspend, reason = '') => {
    try {
      const company_id = getCompanyId();
      return api.post(`/employees/${id}/toggle-suspension`, {
        suspend,
        reason,
        company_id
      });
    } catch (error) {
      console.error('Service error:', error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  }
};

export default employeeService;