import api from './api'

const projectService = {
  // Projects
  getProjects: (params) => api.get('/projects', { params }),
  getProjectById: (id) => api.get(`/projects/${id}`),
  createProject: (projectData) => api.post('/projects', projectData),
  updateProject: (id, projectData) => api.put(`/projects/${id}`, projectData),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  duplicateProject: (id, projectData) => api.post(`/projects/${id}/duplicate`, projectData),
  
  // Project status management
  updateProjectStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }),
  archiveProject: (id) => api.patch(`/projects/${id}/archive`),
  restoreProject: (id) => api.patch(`/projects/${id}/restore`),
  
  // Project assignments
  getProjectAssignments: (projectId) => api.get(`/projects/${projectId}/assignments`),
  assignEmployee: (projectId, assignmentData) => api.post(`/projects/${projectId}/assignments`, assignmentData),
  removeEmployee: (projectId, employeeId) => api.delete(`/projects/${projectId}/assignments/${employeeId}`),
  updateAssignment: (projectId, employeeId, assignmentData) => api.put(`/projects/${projectId}/assignments/${employeeId}`, assignmentData),
  
  // Project tasks
  getProjectTasks: (projectId, params) => api.get(`/projects/${projectId}/tasks`, { params }),
  createTask: (projectId, taskData) => api.post(`/projects/${projectId}/tasks`, taskData),
  updateTask: (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),
  
  // Task management
  getTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  updateTaskStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  assignTask: (id, employeeId) => api.patch(`/tasks/${id}/assign`, { employee_id: employeeId }),
  
  // Project dashboard and analytics
  getDashboardData: (params) => api.get('/projects/dashboard', { params }),
  getProjectStats: (id) => api.get(`/projects/${id}/stats`),
  getProjectTimeline: (id) => api.get(`/projects/${id}/timeline`),
  getProjectBudgetAnalysis: (id) => api.get(`/projects/${id}/budget-analysis`),
  
  // Project documents and files
  getProjectDocuments: (id, params) => api.get(`/projects/${id}/documents`, { params }),
  uploadDocument: (id, formData) => api.post(`/projects/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteDocument: (projectId, documentId) => api.delete(`/projects/${projectId}/documents/${documentId}`),
  
  // Project milestones
  getProjectMilestones: (id) => api.get(`/projects/${id}/milestones`),
  createMilestone: (id, milestoneData) => api.post(`/projects/${id}/milestones`, milestoneData),
  updateMilestone: (projectId, milestoneId, milestoneData) => api.put(`/projects/${projectId}/milestones/${milestoneId}`, milestoneData),
  deleteMilestone: (projectId, milestoneId) => api.delete(`/projects/${projectId}/milestones/${milestoneId}`),
  
  // Project risks
  getProjectRisks: (id) => api.get(`/projects/${id}/risks`),
  createRisk: (id, riskData) => api.post(`/projects/${id}/risks`, riskData),
  updateRisk: (projectId, riskId, riskData) => api.put(`/projects/${projectId}/risks/${riskId}`, riskData),
  deleteRisk: (projectId, riskId) => api.delete(`/projects/${projectId}/risks/${riskId}`),
  
  // Project communication
  getProjectComments: (id, params) => api.get(`/projects/${id}/comments`, { params }),
  addComment: (id, commentData) => api.post(`/projects/${id}/comments`, commentData),
  updateComment: (projectId, commentId, commentData) => api.put(`/projects/${projectId}/comments/${commentId}`, commentData),
  deleteComment: (projectId, commentId) => api.delete(`/projects/${projectId}/comments/${commentId}`),
  
  // Project reports and exports
  exportProject: (id, format) => api.get(`/projects/${id}/export`, { params: { format }, responseType: 'blob' }),
  exportProjects: (params) => api.get('/projects/export', { params, responseType: 'blob' }),
  generateReport: (id, reportType) => api.post(`/projects/${id}/reports`, { type: reportType }),
  
  // Project templates (legacy - keeping for compatibility)
  createFromTemplate: (templateId, projectData) => api.post(`/projects/templates/${templateId}/create`, projectData),
  saveAsTemplate: (id, templateData) => api.post(`/projects/${id}/save-as-template`, templateData),
  
  // Project search and filters
  searchProjects: (query, filters) => api.get('/projects/search', { params: { q: query, ...filters } }),
  getProjectsByManager: (managerId, params) => api.get(`/employees/${managerId}/projects`, { params }),
  getProjectsByDepartment: (departmentId, params) => api.get(`/departments/${departmentId}/projects`, { params }),
  getProjectsByStatus: (status, params) => api.get('/projects', { params: { status, ...params } }),
  
  // Project calendar and scheduling
  getProjectCalendar: (params) => api.get('/projects/calendar', { params }),
  getProjectSchedule: (id) => api.get(`/projects/${id}/schedule`),
  updateProjectSchedule: (id, scheduleData) => api.put(`/projects/${id}/schedule`, scheduleData),
  
  // Project Kanban board
  getProjectKanban: (params) => api.get('/projects/kanban', { params }),
  
  // Project templates
  getProjectTemplates: (params) => api.get('/projects/templates', { params }),
  createProjectFromTemplate: (templateId, projectData) => api.post(`/projects/templates/${templateId}/create`, projectData),
  deleteProjectTemplate: (templateId) => api.delete(`/projects/templates/${templateId}`),
  
  // Project reports
  getProjectReports: (params) => api.get('/projects/reports', { params }),
  
  // Project analytics
  getProjectAnalytics: (params) => api.get('/projects/analytics', { params }),
  
  // Project archive
  getArchivedProjects: (params) => api.get('/projects/archive', { params }),
  permanentDeleteProject: (projectId) => api.delete(`/projects/archive/${projectId}`),
  
  // Project budget management
  getProjectBudget: (id) => api.get(`/projects/${id}/budget`),
  updateProjectBudget: (id, budgetData) => api.put(`/projects/${id}/budget`, budgetData),
  addBudgetEntry: (id, entryData) => api.post(`/projects/${id}/budget/entries`, entryData),
  updateBudgetEntry: (projectId, entryId, entryData) => api.put(`/projects/${projectId}/budget/entries/${entryId}`, entryData),
  deleteBudgetEntry: (projectId, entryId) => api.delete(`/projects/${projectId}/budget/entries/${entryId}`),
  
  // Support methods for frontend integration
  getEmployees: (params = {}) => {
    // Set default parameters to get all employees for project management
    const defaultParams = {
      limit: 1000, // Get all employees
      page: 1,
      employment_status: 'active', // Only active employees
      ...params
    };
    return api.get('/hr/employees', { params: defaultParams });
  },
  getDepartments: (params = {}) => {
    // Get all active departments
    return api.get('/hr/departments', { params });
  },
  
}

export { projectService };
export default projectService;