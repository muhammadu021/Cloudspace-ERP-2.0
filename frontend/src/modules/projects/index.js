// Export all project components
export { default as Projects } from './Projects'
export { default as ProjectDetail } from './ProjectDetail'
export { default as ProjectForm } from './ProjectForm'
export { default as EnhancedProjectForm } from './EnhancedProjectForm'
export { default as DepartmentManager } from './DepartmentManager'
export { default as ProjectDashboard } from './ProjectDashboard'
export { default as ProjectFilters } from './ProjectFilters'
export { default as ProjectActions } from './ProjectActions'
export { default as ProjectTemplates } from './ProjectTemplates'
export { default as ProjectKanban } from './ProjectKanban'
export { default as ProjectCalendar } from './ProjectCalendar'
export { default as ProjectReports } from './ProjectReports'
export { default as ProjectAnalytics } from './ProjectAnalytics'
export { default as ProjectArchive } from './ProjectArchive'

// Project routes configuration
export const projectRoutes = [
  {
    path: '/projects',
    element: 'Projects',
    exact: true
  },
  {
    path: '/projects/dashboard',
    element: 'ProjectDashboard'
  },
  {
    path: '/projects/kanban',
    element: 'ProjectKanban'
  },
  {
    path: '/projects/calendar',
    element: 'ProjectCalendar'
  },
  {
    path: '/projects/reports',
    element: 'ProjectReports'
  },
  {
    path: '/projects/analytics',
    element: 'ProjectAnalytics'
  },
  {
    path: '/projects/templates',
    element: 'ProjectTemplates'
  },
  {
    path: '/projects/archive',
    element: 'ProjectArchive'
  },
  {
    path: '/projects/new',
    element: 'EnhancedProjectForm'
  },
  {
    path: '/projects/create',
    element: 'EnhancedProjectForm'
  },
  {
    path: '/projects/templates/new',
    element: 'ProjectForm'
  },
  {
    path: '/projects/templates/:id',
    element: 'ProjectDetail'
  },
  {
    path: '/projects/templates/:id/edit',
    element: 'ProjectForm'
  },
  {
    path: '/projects/:id',
    element: 'ProjectDetail'
  },
  {
    path: '/projects/:id/edit',
    element: 'ProjectForm'
  }
]