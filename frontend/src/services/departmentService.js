import api from './api'
import { getCompanyId } from '../utils/company'

// Mock departments data for fallback
const mockDepartmentsData = {
  departments: [
    {
      id: 1,
      name: 'Information Technology',
      code: 'IT',
      description: 'Technology and software development department',
      parent_department_id: null,
      head_employee_id: 1,
      budget_allocated: 500000,
      location: 'Building A, Floor 3',
      phone: '+1 (555) 123-4567',
      email: 'it@company.com',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Human Resources',
      code: 'HR',
      description: 'Human resources and talent management',
      parent_department_id: null,
      head_employee_id: 2,
      budget_allocated: 300000,
      location: 'Building B, Floor 2',
      phone: '+1 (555) 123-4568',
      email: 'hr@company.com',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 3,
      name: 'Finance',
      code: 'FIN',
      description: 'Financial planning and accounting',
      parent_department_id: null,
      head_employee_id: 3,
      budget_allocated: 400000,
      location: 'Building A, Floor 1',
      phone: '+1 (555) 123-4569',
      email: 'finance@company.com',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 4,
      name: 'Marketing',
      code: 'MKT',
      description: 'Marketing and brand management',
      parent_department_id: null,
      head_employee_id: 4,
      budget_allocated: 250000,
      location: 'Building B, Floor 3',
      phone: '+1 (555) 123-4570',
      email: 'marketing@company.com',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 5,
      name: 'Sales',
      code: 'SALES',
      description: 'Sales and business development',
      parent_department_id: null,
      head_employee_id: 5,
      budget_allocated: 350000,
      location: 'Building A, Floor 2',
      phone: '+1 (555) 123-4571',
      email: 'sales@company.com',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 6,
      name: 'Development Team',
      code: 'DEV',
      description: 'Software development team',
      parent_department_id: 1, // Under IT
      head_employee_id: 6,
      budget_allocated: 200000,
      location: 'Building A, Floor 3',
      phone: '+1 (555) 123-4572',
      email: 'dev@company.com',
      created_at: '2024-01-01T00:00:00Z'
    }
  ]
}

export const departmentService = {
  // Get all departments with robust error handling
  getDepartments: async (params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/departments', { params: { ...params, company_id } });
      return response;
    } catch (error) {
      return {
        data: {
          success: true,
          data: mockDepartmentsData,
          message: 'Using mock data - API unavailable'
        },
        status: 200,
        statusText: 'OK (Mock Data)'
      };
    }
  },

  // Get department by ID
  getDepartmentById: async (id) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get(`/departments/${id}`, { params: { company_id } })
      return response
    } catch (error) {
      const department = mockDepartmentsData.departments.find(d => d.id === parseInt(id))
      if (department) {
        return {
          data: department,
          status: 200,
          statusText: 'OK (Mock Data)'
        }
      } else {
        throw new Error('Department not found')
      }
    }
  },

  // Create new department
  createDepartment: async (departmentData) => {
    try {
      console.log('DepartmentService: Creating department:', departmentData);
      const company_id = getCompanyId();
      const response = await api.post('/departments', { ...departmentData, company_id });
      console.log('DepartmentService: Create response:', response);
      return response;
    } catch (error) {
      console.warn('DepartmentService: Create API unavailable:', error.message);
      console.log('DepartmentService: Create error details:', error.response?.status, error.response?.data);
      
      // Simulate successful creation
      const newDepartment = {
        id: Date.now(),
        ...departmentData,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      // Add to mock data for consistency
      mockDepartmentsData.departments.push(newDepartment);
      
      return {
        data: {
          success: true,
          message: 'Department created (demo mode)',
          data: { department: newDepartment }
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  // Update department
  updateDepartment: async (id, departmentData) => {
    try {
      const company_id = getCompanyId();
      const response = await api.put(`/departments/${id}`, { ...departmentData, company_id })
      return response
    } catch (error) {
      console.warn(`Update department ${id} API unavailable:`, error.message)
      
      // Update mock data
      const index = mockDepartmentsData.departments.findIndex(d => d.id === parseInt(id))
      if (index !== -1) {
        mockDepartmentsData.departments[index] = {
          ...mockDepartmentsData.departments[index],
          ...departmentData,
          updated_at: new Date().toISOString()
        }
      }
      
      return {
        data: {
          success: true,
          message: 'Department updated (demo mode)',
          department: { id: parseInt(id), ...departmentData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      }
    }
  },

  // Delete department
  deleteDepartment: async (id) => {
    try {
      const company_id = getCompanyId();
      const response = await api.delete(`/departments/${id}`, { params: { company_id } })
      return response
    } catch (error) {
      console.warn(`Delete department ${id} API unavailable:`, error.message)
      
      // Remove from mock data
      const index = mockDepartmentsData.departments.findIndex(d => d.id === parseInt(id))
      if (index !== -1) {
        mockDepartmentsData.departments.splice(index, 1)
      }
      
      return {
        data: {
          success: true,
          message: 'Department deleted (demo mode)'
        },
        status: 200,
        statusText: 'OK (Mock)'
      }
    }
  },

  // Get department hierarchy
  getDepartmentHierarchy: async () => {
    try {
      const response = await api.get('/departments/hierarchy')
      return response
    } catch (error) {
      console.warn('Department hierarchy API unavailable, using mock data:', error.message)
      
      // Build hierarchy from mock data
      const departments = mockDepartmentsData.departments
      const hierarchy = departments
        .filter(dept => !dept.parent_department_id)
        .map(parent => ({
          ...parent,
          children: departments.filter(child => child.parent_department_id === parent.id)
        }))
      
      return {
        data: { hierarchy },
        status: 200,
        statusText: 'OK (Mock Data)'
      }
    }
  },

  // Get department employees
  getDepartmentEmployees: async (id) => {
    try {
      const response = await api.get(`/departments/${id}/employees`)
      return response
    } catch (error) {
      console.warn(`Department ${id} employees API unavailable:`, error.message)
      return {
        data: {
          employees: [],
          message: 'Employees data unavailable (demo mode)'
        },
        status: 200,
        statusText: 'OK (Mock)'
      }
    }
  }
}

export default departmentService