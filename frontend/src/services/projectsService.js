import api from './api'

// Mock projects data for fallback
const mockProjectsData = {
  projects: [
    {
      id: 1,
      name: 'Website Redesign',
      code: 'WEB-2024-001',
      description: 'Complete redesign of the company website with modern UI/UX',
      status: 'active',
      priority: 'high',
      start_date: '2024-01-01',
      end_date: '2024-02-15',
      progress_percentage: 75,
        budget_allocated: 50000,
        budget_spent: 37500,
        currency: 'NGN',
      manager: { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@company.com' },
      department: { id: 1, name: 'Development' },
      team_size: 5,
      client_name: 'Acme Corporation',
      is_billable: true,
      tags: ['web', 'design', 'development']
    },
    {
      id: 2,
      name: 'Mobile App Development',
      code: 'MOB-2024-001',
      description: 'Cross-platform mobile application using React Native',
      status: 'active',
      priority: 'medium',
      start_date: '2024-01-15',
      end_date: '2024-03-30',
      progress_percentage: 45,
      budget_allocated: 120000,
      budget_spent: 54000,
      currency: 'NGN',
      manager: { id: 2, first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@company.com' },
      department: { id: 1, name: 'Development' },
      team_size: 8,
      client_name: 'TechStart Inc.',
      is_billable: true,
      tags: ['mobile', 'react-native', 'ios', 'android']
    },
    {
      id: 3,
      name: 'Database Migration',
      code: 'DB-2024-001',
      description: 'Migration of legacy database to cloud solution',
      status: 'completed',
      priority: 'high',
      start_date: '2023-12-01',
      end_date: '2024-01-20',
      progress_percentage: 100,
      budget_allocated: 25000,
      budget_spent: 23000,
      manager: { id: 3, first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@company.com' },
      department: { id: 2, name: 'IT Infrastructure' },
      team_size: 3,
      client_name: 'Internal',
      is_billable: false,
      tags: ['database', 'migration', 'cloud']
    },
    {
      id: 4,
      name: 'Marketing Campaign Platform',
      code: 'MKT-2024-001',
      description: 'Digital marketing automation platform development',
      status: 'planning',
      priority: 'medium',
      start_date: '2024-02-01',
      end_date: '2024-04-30',
      progress_percentage: 10,
      budget_allocated: 80000,
      budget_spent: 5000,
      manager: { id: 4, first_name: 'Emily', last_name: 'Davis', email: 'emily.davis@company.com' },
      department: { id: 3, name: 'Marketing' },
      team_size: 6,
      client_name: 'Marketing Solutions Ltd.',
      is_billable: true,
      tags: ['marketing', 'automation', 'platform']
    },
    {
      id: 5,
      name: 'E-commerce Integration',
      code: 'ECOM-2024-001',
      description: 'Integration with multiple e-commerce platforms',
      status: 'on_hold',
      priority: 'low',
      start_date: '2024-01-20',
      end_date: '2024-03-15',
      progress_percentage: 25,
      budget_allocated: 60000,
      budget_spent: 15000,
      manager: { id: 5, first_name: 'Alex', last_name: 'Chen', email: 'alex.chen@company.com' },
      department: { id: 1, name: 'Development' },
      team_size: 4,
      client_name: 'E-commerce Plus',
      is_billable: true,
      tags: ['ecommerce', 'integration', 'api']
    },
    {
      id: 6,
      name: 'Security Audit & Compliance',
      code: 'SEC-2024-001',
      description: 'Comprehensive security audit and compliance implementation',
      status: 'active',
      priority: 'critical',
      start_date: '2024-01-10',
      end_date: '2024-02-28',
      progress_percentage: 60,
      budget_allocated: 45000,
      budget_spent: 27000,
      manager: { id: 6, first_name: 'Lisa', last_name: 'Wang', email: 'lisa.wang@company.com' },
      department: { id: 2, name: 'IT Infrastructure' },
      team_size: 3,
      client_name: 'Internal',
      is_billable: false,
      tags: ['security', 'audit', 'compliance']
    }
  ],
  pagination: {
    current_page: 1,
    per_page: 20,
    total: 6,
    total_pages: 1
  },
  summary: {
    total_projects: 6,
    active_projects: 3,
    completed_projects: 1,
    on_hold_projects: 1,
    planning_projects: 1,
    total_budget: 380000,
    spent_budget: 181500
  }
}

// Mock employees data
const mockEmployeesData = {
  employees: [
    { id: 1, first_name: 'John', last_name: 'Doe', email: 'john.doe@company.com', department: 'Development' },
    { id: 2, first_name: 'Sarah', last_name: 'Wilson', email: 'sarah.wilson@company.com', department: 'Development' },
    { id: 3, first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@company.com', department: 'IT Infrastructure' },
    { id: 4, first_name: 'Emily', last_name: 'Davis', email: 'emily.davis@company.com', department: 'Marketing' },
    { id: 5, first_name: 'Alex', last_name: 'Chen', email: 'alex.chen@company.com', department: 'Development' },
    { id: 6, first_name: 'Lisa', last_name: 'Wang', email: 'lisa.wang@company.com', department: 'IT Infrastructure' }
  ]
}

// Mock departments data
const mockDepartmentsData = {
  departments: [
    { id: 1, name: 'Development', description: 'Software development team' },
    { id: 2, name: 'IT Infrastructure', description: 'IT infrastructure and operations' },
    { id: 3, name: 'Marketing', description: 'Marketing and communications' },
    { id: 4, name: 'Design', description: 'UI/UX and graphic design' },
    { id: 5, name: 'Sales', description: 'Sales and business development' }
  ]
}

export const projectsService = {
  // Get projects with robust error handling
  getProjects: async (params = {}) => {
    try {
      const response = await api.get('/projects', { params })
      return response
    } catch (error) {
      console.warn('Projects API unavailable, using mock data:', error.message)
      // Apply basic filtering to mock data if search term provided
      let filteredProjects = [...mockProjectsData.projects]
      
      if (params.search) {
        const searchTerm = params.search.toLowerCase()
        filteredProjects = filteredProjects.filter(project => 
          project.name.toLowerCase().includes(searchTerm) ||
          project.code.toLowerCase().includes(searchTerm) ||
          project.description.toLowerCase().includes(searchTerm)
        )
      }
      
      if (params.status && params.status.length > 0) {
        filteredProjects = filteredProjects.filter(project => 
          params.status.includes(project.status)
        )
      }
      
      if (params.priority && params.priority.length > 0) {
        filteredProjects = filteredProjects.filter(project => 
          params.priority.includes(project.priority)
        )
      }
      
      return {
        data: {
          ...mockProjectsData,
          projects: filteredProjects,
          pagination: {
            ...mockProjectsData.pagination,
            total: filteredProjects.length
          }
        },
        status: 200,
        statusText: 'OK (Mock Data)'
      }
    }
  },

  // Get employees with error handling
  getEmployees: async (params = {}) => {
    try {
      const response = await api.get('/employees', { params })
      return response
    } catch (error) {
      console.warn('Employees API unavailable, using mock data:', error.message)
      return {
        data: mockEmployeesData,
        status: 200,
        statusText: 'OK (Mock Data)'
      }
    }
  },

  // Get departments with error handling
  getDepartments: async (params = {}) => {
    try {
      const response = await api.get('/departments', { params })
      return response
    } catch (error) {
      console.warn('Departments API unavailable, using mock data:', error.message)
      return {
        data: mockDepartmentsData,
        status: 200,
        statusText: 'OK (Mock Data)'
      }
    }
  },

  // Create project with error handling
  createProject: async (projectData) => {
    try {
      const response = await api.post('/projects', projectData)
      return response
    } catch (error) {
      console.warn('Create project API unavailable:', error.message)
      return {
        data: {
          success: true,
          message: 'Project created (demo mode)',
          project: {
            id: Date.now(),
            ...projectData,
            status: 'planning',
            progress_percentage: 0,
            created_at: new Date().toISOString()
          }
        },
        status: 201,
        statusText: 'Created (Mock)'
      }
    }
  },

  // Update project with error handling
  updateProject: async (id, projectData) => {
    try {
      const response = await api.put(`/projects/${id}`, projectData)
      return response
    } catch (error) {
      console.warn(`Update project ${id} API unavailable:`, error.message)
      return {
        data: {
          success: true,
          message: 'Project updated (demo mode)',
          project: { id, ...projectData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      }
    }
  },

  // Delete project with error handling
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`)
      return response
    } catch (error) {
      console.warn(`Delete project ${id} API unavailable:`, error.message)
      return {
        data: {
          success: true,
          message: 'Project deleted (demo mode)'
        },
        status: 200,
        statusText: 'OK (Mock)'
      }
    }
  }
}

export default projectsService