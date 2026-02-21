import api from './api'

// Mock project data for fallback
const mockProjectsData = {
  1: {
    id: 1,
    name: 'Website Redesign',
    code: 'WEB-2024-001',
    description: 'Complete redesign of the company website with modern UI/UX, improved performance, and mobile responsiveness. This project includes user research, wireframing, design system creation, development, testing, and deployment.',
    status: 'active',
    priority: 'high',
    start_date: '2024-01-01',
    end_date: '2024-02-15',
    actual_start_date: '2024-01-01',
    actual_end_date: null,
    progress_percentage: 75,
    budget_allocated: 50000,
    budget_spent: 37500,
    currency: 'NGN',
    manager: { 
      id: 1, 
      first_name: 'John', 
      last_name: 'Doe',
      email: 'john.doe@company.com',
      avatar: null
    },
    department: { id: 1, name: 'Development' },
    client_name: 'Acme Corporation',
    client_email: 'contact@acme.com',
    client_phone: '+1 (555) 123-4567',
    is_billable: true,
    hourly_rate: 150,
    estimated_hours: 320,
    actual_hours: 240,
    deliverables: [
      'New website design mockups',
      'Mobile responsive layout',
      'Performance optimization',
      'SEO improvements',
      'Content management system',
      'User documentation'
    ],
    milestones: [
      { id: 1, name: 'Design Phase', date: '2024-01-15', completed: true, description: 'Complete UI/UX design and approval' },
      { id: 2, name: 'Development Phase', date: '2024-02-01', completed: false, description: 'Frontend and backend development' },
      { id: 3, name: 'Testing Phase', date: '2024-02-10', completed: false, description: 'Quality assurance and user testing' },
      { id: 4, name: 'Launch', date: '2024-02-15', completed: false, description: 'Production deployment and go-live' }
    ],
    tags: ['web', 'design', 'development', 'responsive'],
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-20T10:30:00Z'
  },
  2: {
    id: 2,
    name: 'Mobile App Development',
    code: 'MOB-2024-001',
    description: 'Cross-platform mobile application development using React Native. Features include user authentication, real-time messaging, push notifications, and offline capabilities.',
    status: 'active',
    priority: 'medium',
    start_date: '2024-01-15',
    end_date: '2024-03-30',
    actual_start_date: '2024-01-15',
    actual_end_date: null,
    progress_percentage: 45,
    budget_allocated: 120000,
    budget_spent: 54000,
    currency: 'NGN',
    manager: { 
      id: 2, 
      first_name: 'Sarah', 
      last_name: 'Wilson',
      email: 'sarah.wilson@company.com',
      avatar: null
    },
    department: { id: 1, name: 'Development' },
    client_name: 'TechStart Inc.',
    client_email: 'hello@techstart.com',
    client_phone: '+1 (555) 987-6543',
    is_billable: true,
    hourly_rate: 175,
    estimated_hours: 680,
    actual_hours: 310,
    deliverables: [
      'iOS application',
      'Android application',
      'Backend API',
      'Admin dashboard',
      'User documentation',
      'App store deployment'
    ],
    milestones: [
      { id: 1, name: 'Requirements Analysis', date: '2024-01-25', completed: true, description: 'Gather and document requirements' },
      { id: 2, name: 'UI/UX Design', date: '2024-02-10', completed: true, description: 'Design mobile app interface' },
      { id: 3, name: 'Backend Development', date: '2024-02-25', completed: false, description: 'API and database development' },
      { id: 4, name: 'Mobile App Development', date: '2024-03-15', completed: false, description: 'React Native app development' },
      { id: 5, name: 'Testing & Deployment', date: '2024-03-30', completed: false, description: 'Testing and app store submission' }
    ],
    tags: ['mobile', 'react-native', 'ios', 'android'],
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-22T14:20:00Z'
  },
  3: {
    id: 3,
    name: 'Database Migration',
    code: 'DB-2024-001',
    description: 'Migration of legacy database system to modern cloud-based solution with improved performance, security, and scalability.',
    status: 'completed',
    priority: 'high',
    start_date: '2023-12-01',
    end_date: '2024-01-20',
    actual_start_date: '2023-12-01',
    actual_end_date: '2024-01-18',
    progress_percentage: 100,
    budget_allocated: 25000,
    budget_spent: 23000,
    currency: 'NGN',
    manager: { 
      id: 3, 
      first_name: 'Mike', 
      last_name: 'Johnson',
      email: 'mike.johnson@company.com',
      avatar: null
    },
    department: { id: 2, name: 'IT Infrastructure' },
    client_name: 'Internal',
    client_email: 'it@company.com',
    client_phone: null,
    is_billable: false,
    hourly_rate: 0,
    estimated_hours: 200,
    actual_hours: 185,
    deliverables: [
      'Data migration scripts',
      'New database schema',
      'Performance optimization',
      'Security configuration',
      'Backup procedures',
      'Documentation'
    ],
    milestones: [
      { id: 1, name: 'Analysis & Planning', date: '2023-12-10', completed: true, description: 'Analyze current system and plan migration' },
      { id: 2, name: 'Schema Design', date: '2023-12-20', completed: true, description: 'Design new database schema' },
      { id: 3, name: 'Data Migration', date: '2024-01-05', completed: true, description: 'Migrate data to new system' },
      { id: 4, name: 'Testing & Validation', date: '2024-01-15', completed: true, description: 'Test and validate migrated data' },
      { id: 5, name: 'Go Live', date: '2024-01-20', completed: true, description: 'Switch to new database system' }
    ],
    tags: ['database', 'migration', 'cloud', 'infrastructure'],
    created_at: '2023-12-01T00:00:00Z',
    updated_at: '2024-01-18T16:45:00Z'
  }
}

// Mock tasks data
const mockTasksData = {
  1: [
    {
      id: 1,
      title: 'Create wireframes and mockups',
      description: 'Design initial wireframes and high-fidelity mockups for all pages',
      status: 'completed',
      priority: 'high',
      assigned_to: { id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice.smith@company.com' },
      due_date: '2024-01-10',
      completed_date: '2024-01-09',
      estimated_hours: 24,
      actual_hours: 22
    },
    {
      id: 2,
      title: 'Develop homepage layout',
      description: 'Implement responsive homepage with hero section and navigation',
      status: 'in_progress',
      priority: 'high',
      assigned_to: { id: 2, first_name: 'Bob', last_name: 'Johnson', email: 'bob.johnson@company.com' },
      due_date: '2024-01-25',
      completed_date: null,
      estimated_hours: 16,
      actual_hours: 12
    },
    {
      id: 3,
      title: 'Setup responsive layout system',
      description: 'Implement CSS Grid and Flexbox for responsive design',
      status: 'todo',
      priority: 'medium',
      assigned_to: { id: 3, first_name: 'Carol', last_name: 'Williams', email: 'carol.williams@company.com' },
      due_date: '2024-01-30',
      completed_date: null,
      estimated_hours: 12,
      actual_hours: 0
    },
    {
      id: 4,
      title: 'Implement contact form',
      description: 'Create contact form with validation and email integration',
      status: 'todo',
      priority: 'medium',
      assigned_to: { id: 2, first_name: 'Bob', last_name: 'Johnson', email: 'bob.johnson@company.com' },
      due_date: '2024-02-05',
      completed_date: null,
      estimated_hours: 8,
      actual_hours: 0
    },
    {
      id: 5,
      title: 'Performance optimization',
      description: 'Optimize images, minify CSS/JS, implement caching',
      status: 'todo',
      priority: 'low',
      assigned_to: { id: 4, first_name: 'David', last_name: 'Brown', email: 'david.brown@company.com' },
      due_date: '2024-02-12',
      completed_date: null,
      estimated_hours: 16,
      actual_hours: 0
    }
  ],
  2: [
    {
      id: 6,
      title: 'Setup React Native project',
      description: 'Initialize React Native project with navigation and basic structure',
      status: 'completed',
      priority: 'high',
      assigned_to: { id: 5, first_name: 'Emma', last_name: 'Davis', email: 'emma.davis@company.com' },
      due_date: '2024-01-20',
      completed_date: '2024-01-19',
      estimated_hours: 8,
      actual_hours: 6
    },
    {
      id: 7,
      title: 'Implement user authentication',
      description: 'Create login/register screens with JWT authentication',
      status: 'in_progress',
      priority: 'high',
      assigned_to: { id: 6, first_name: 'Frank', last_name: 'Miller', email: 'frank.miller@company.com' },
      due_date: '2024-02-01',
      completed_date: null,
      estimated_hours: 20,
      actual_hours: 15
    },
    {
      id: 8,
      title: 'Design app icons and splash screen',
      description: 'Create app icons for iOS and Android, design splash screen',
      status: 'completed',
      priority: 'medium',
      assigned_to: { id: 1, first_name: 'Alice', last_name: 'Smith', email: 'alice.smith@company.com' },
      due_date: '2024-01-28',
      completed_date: '2024-01-27',
      estimated_hours: 12,
      actual_hours: 10
    }
  ],
  3: [
    {
      id: 9,
      title: 'Database schema analysis',
      description: 'Analyze current database schema and identify migration requirements',
      status: 'completed',
      priority: 'critical',
      assigned_to: { id: 3, first_name: 'Mike', last_name: 'Johnson', email: 'mike.johnson@company.com' },
      due_date: '2023-12-08',
      completed_date: '2023-12-07',
      estimated_hours: 16,
      actual_hours: 14
    },
    {
      id: 10,
      title: 'Create migration scripts',
      description: 'Write SQL scripts to migrate data from old to new database',
      status: 'completed',
      priority: 'high',
      assigned_to: { id: 7, first_name: 'Grace', last_name: 'Lee', email: 'grace.lee@company.com' },
      due_date: '2023-12-25',
      completed_date: '2023-12-23',
      estimated_hours: 32,
      actual_hours: 30
    },
    {
      id: 11,
      title: 'Performance testing',
      description: 'Test database performance and optimize queries',
      status: 'completed',
      priority: 'medium',
      assigned_to: { id: 8, first_name: 'Henry', last_name: 'Wilson', email: 'henry.wilson@company.com' },
      due_date: '2024-01-10',
      completed_date: '2024-01-08',
      estimated_hours: 24,
      actual_hours: 20
    }
  ]
}

export const projectDetailService = {
  // Get project by ID with robust error handling
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`)
      return response
    } catch (error) {
      console.warn(`Project ${id} API unavailable, using mock data:`, error.message)
      const mockProject = mockProjectsData[id]
      if (mockProject) {
        return {
          data: mockProject,
          status: 200,
          statusText: 'OK (Mock Data)'
        }
      } else {
        // Return a generic project if specific ID not found
        return {
          data: {
            ...mockProjectsData[1],
            id: parseInt(id),
            name: `Project ${id}`,
            code: `PROJ-2024-${String(id).padStart(3, '0')}`
          },
          status: 200,
          statusText: 'OK (Mock Data)'
        }
      }
    }
  },

  // Get project tasks with error handling
  getProjectTasks: async (projectId, params = {}) => {
    try {
      const response = await api.get(`/projects/${projectId}/tasks`, { params })
      return response
    } catch (error) {
      console.warn(`Project ${projectId} tasks API unavailable, using mock data:`, error.message)
      const mockTasks = mockTasksData[projectId] || mockTasksData[1]
      return {
        data: mockTasks,
        status: 200,
        statusText: 'OK (Mock Data)'
      }
    }
  },

  // Get project milestones
  getProjectMilestones: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/milestones`)
      return response
    } catch (error) {
      console.warn(`Project ${projectId} milestones API unavailable, using mock data:`, error.message)
      const mockProject = mockProjectsData[projectId] || mockProjectsData[1]
      return {
        data: mockProject.milestones || [],
        status: 200,
        statusText: 'OK (Mock Data)'
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

export default projectDetailService