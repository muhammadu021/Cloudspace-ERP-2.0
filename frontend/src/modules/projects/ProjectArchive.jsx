import React, { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Archive, 
  ArchiveRestore,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Calendar,
  Users,
  Banknote,
  Clock,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
  FileText
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
// Removed custom Select import - using native HTML select
import Card from '@/components/ui/Card'
import { toast } from 'react-hot-toast';

const ProjectArchive = () => {
  const auth = useAuth(); const hasPermission = auth?.hasPermission || (() => true)
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('archived_date')
  const [sortOrder, setSortOrder] = useState('desc')

  // Mock archived projects data
  const mockArchivedProjects = [
    {
      id: 1,
      name: 'Legacy Website Migration',
      code: 'LEG-2023-001',
      status: 'completed',
      priority: 'high',
      progress: 100,
      budget_allocated: 75000,
      budget_spent: 72000,
      start_date: '2023-06-01',
      end_date: '2023-08-15',
      actual_end_date: '2023-08-12',
      archived_date: '2023-08-20',
      archived_by: 'John Doe',
      archive_reason: 'Project completed successfully',
      manager: 'Sarah Wilson',
      team_size: 6,
      department: 'Development',
      client_name: 'TechCorp Inc.',
      deliverables_count: 8,
      tasks_completed: 45,
      tasks_total: 45,
      final_budget_variance: -4.0,
      final_schedule_variance: -3
    },
    {
      id: 2,
      name: 'Mobile App Prototype',
      code: 'MOB-2023-002',
      status: 'cancelled',
      priority: 'medium',
      progress: 35,
      budget_allocated: 50000,
      budget_spent: 18000,
      start_date: '2023-04-01',
      end_date: '2023-07-30',
      actual_end_date: null,
      archived_date: '2023-05-15',
      archived_by: 'Mike Johnson',
      archive_reason: 'Client cancelled project due to budget constraints',
      manager: 'Emily Davis',
      team_size: 4,
      department: 'Development',
      client_name: 'StartupXYZ',
      deliverables_count: 3,
      tasks_completed: 12,
      tasks_total: 35,
      final_budget_variance: -64.0,
      final_schedule_variance: null
    },
    {
      id: 3,
      name: 'Brand Identity Redesign',
      code: 'BRD-2023-003',
      status: 'completed',
      priority: 'high',
      progress: 100,
      budget_allocated: 30000,
      budget_spent: 32500,
      start_date: '2023-03-01',
      end_date: '2023-05-31',
      actual_end_date: '2023-06-05',
      archived_date: '2023-06-10',
      archived_by: 'Lisa Wang',
      archive_reason: 'Project completed with client approval',
      manager: 'Alex Chen',
      team_size: 3,
      department: 'Design',
      client_name: 'Fashion Forward Ltd.',
      deliverables_count: 12,
      tasks_completed: 28,
      tasks_total: 28,
      final_budget_variance: 8.3,
      final_schedule_variance: 5
    },
    {
      id: 4,
      name: 'Database Optimization',
      code: 'DB-2023-004',
      status: 'completed',
      priority: 'critical',
      progress: 100,
      budget_allocated: 40000,
      budget_spent: 38500,
      start_date: '2023-01-15',
      end_date: '2023-03-15',
      actual_end_date: '2023-03-10',
      archived_date: '2023-03-20',
      archived_by: 'David Brown',
      archive_reason: 'Performance improvements achieved',
      manager: 'Mike Johnson',
      team_size: 2,
      department: 'Development',
      client_name: 'Internal',
      deliverables_count: 5,
      tasks_completed: 22,
      tasks_total: 22,
      final_budget_variance: -3.8,
      final_schedule_variance: -5
    }
  ]

  // Fetch real projects data
  const { data: projects, isLoading } = useQuery(
    ['projects-archive', { 
      search: searchTerm, 
      status: statusFilter, 
      date: dateFilter,
      sortBy,
      sortOrder 
    }],
    () => projectService.getProjects({ 
      limit: 100, // Get all projects
      sortBy: 'updated_at',
      sortOrder: 'DESC'
    }),
    {
      select: (response) => {
        // console.log('Archive projects API response:', response)
        return response?.data?.data?.projects || []
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Filter and transform projects for archive view
  const archivedProjects = useMemo(() => {
    if (!projects) return mockArchivedProjects
    
    // Filter for "archived" projects (completed, cancelled, or explicitly archived)
    let filteredProjects = projects.filter(project => {
      // Consider projects as "archived" if they are completed, cancelled, or have archived_at field
      return project.status === 'completed' || 
             project.status === 'cancelled' || 
             project.archived_at
    })
    
    // Apply search filter
    if (searchTerm) {
      filteredProjects = filteredProjects.filter(project => 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.client_name && project.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filteredProjects = filteredProjects.filter(project => project.status === statusFilter)
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      const daysMap = {
        'last-30-days': 30,
        'last-3-months': 90,
        'last-6-months': 180,
        'last-year': 365
      }
      
      const days = daysMap[dateFilter]
      if (days) {
        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
        filteredProjects = filteredProjects.filter(project => {
          // Use archived_at if available, otherwise use updated_at
          const archiveDate = new Date(project.archived_at || project.updated_at)
          return archiveDate >= cutoffDate
        })
      }
    }
    
    // Transform projects to archive format
    const transformedProjects = filteredProjects.map(project => {
      const budgetAllocated = parseFloat(project.budget_allocated) || 0
      const budgetSpent = parseFloat(project.budget_spent) || 0
      const budgetVariance = budgetAllocated > 0 ? 
        ((budgetSpent - budgetAllocated) / budgetAllocated) * 100 : 0
      
      // Calculate schedule variance (mock calculation)
      const startDate = new Date(project.start_date)
      const endDate = new Date(project.end_date)
      const actualEndDate = project.actual_end_date ? new Date(project.actual_end_date) : new Date()
      const plannedDuration = (endDate - startDate) / (1000 * 60 * 60 * 24)
      const actualDuration = (actualEndDate - startDate) / (1000 * 60 * 60 * 24)
      const scheduleVariance = plannedDuration > 0 ? 
        ((actualDuration - plannedDuration) / plannedDuration) * 100 : 0
      
      return {
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
        priority: project.priority || 'medium',
        progress: parseFloat(project.progress_percentage) || 0,
        budget_allocated: budgetAllocated,
        budget_spent: budgetSpent,
        start_date: project.start_date,
        end_date: project.end_date,
        actual_end_date: project.actual_end_date,
        archived_date: project.archived_at || project.updated_at,
        archived_by: 'System', // Would need user tracking
        archive_reason: project.status === 'completed' ? 
          'Project completed successfully' : 
          project.status === 'cancelled' ? 
            'Project cancelled' : 
            'Project archived',
        manager: project.Manager?.User ? 
          `${project.Manager.User.first_name} ${project.Manager.User.last_name}` :
          'Unassigned',
        team_size: 1, // Default - would need team assignment data
        department: project.Department?.name || 'Unassigned',
        client_name: project.client_name || 'Internal',
        deliverables_count: 0, // Would need deliverables data
        tasks_completed: 0, // Would need task data
        tasks_total: 0, // Would need task data
        final_budget_variance: budgetVariance,
        final_schedule_variance: project.status === 'completed' ? scheduleVariance : null
      }
    })
    
    // Apply sorting
    transformedProjects.sort((a, b) => {
      let aValue, bValue
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case 'end_date':
          aValue = new Date(a.end_date)
          bValue = new Date(b.end_date)
          break
        case 'budget_spent':
          aValue = a.budget_spent
          bValue = b.budget_spent
          break
        case 'archived_date':
        default:
          aValue = new Date(a.archived_date)
          bValue = new Date(b.archived_date)
          break
      }
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      }
    })
    
    return transformedProjects
  }, [projects, searchTerm, statusFilter, dateFilter, sortBy, sortOrder])

  // Debug current state
  console.log('ProjectArchive - Current state:', {
    searchTerm,
    statusFilter,
    dateFilter,
    sortBy,
    sortOrder,
    projectsCount: projects?.length || 0,
    archivedProjectsCount: archivedProjects?.length || 0,
    archivedProjects: archivedProjects?.slice(0, 3) // Show first 3 for debugging
  })

  const restoreProjectMutation = useMutation(
    (projectId) => {
      // For now, simulate restore by updating status to 'active'
      return projectService.updateProject(projectId, { status: 'active' })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects-archive')
        queryClient.invalidateQueries('projects')
        console.log('Project restored successfully')
      },
      onError: (error) => {
        console.error('Failed to restore project:', error)
        toast.error('Failed to restore project. Please try again.')
      }
    }
  )

  const permanentDeleteMutation = useMutation(
    (projectId) => {
      // For now, show warning that this feature needs backend implementation
      console.warn('Permanent delete not implemented in backend')
      return Promise.resolve({ success: true })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects-archive')
        console.log('Project would be permanently deleted (feature not implemented)')
        toast('Permanent delete feature is not yet implemented in the backend.')
      },
      onError: (error) => {
        console.error('Failed to delete project:', error)
        toast.error('Failed to delete project. Please try again.')
      }
    }
  )

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'on_hold', label: 'On Hold' }
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'last-6-months', label: 'Last 6 Months' },
    { value: 'last-year', label: 'Last Year' }
  ]

  const sortOptions = [
    { value: 'archived_date', label: 'Archive Date' },
    { value: 'name', label: 'Project Name' },
    { value: 'end_date', label: 'End Date' },
    { value: 'budget_spent', label: 'Budget Spent' }
  ]

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      on_hold: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-green-600'
    }
    return colors[priority] || 'text-gray-600'
  }

  const handleRestoreProject = (projectId) => {
    if (window.confirm('Are you sure you want to restore this project?')) {
      restoreProjectMutation.mutate(projectId)
    }
  }

  const handlePermanentDelete = (projectId) => {
    if (window.confirm('Are you sure you want to permanently delete this project? This action cannot be undone.')) {
      permanentDeleteMutation.mutate(projectId)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatVariance = (variance) => {
    if (variance === null) return 'N/A'
    return `${variance >= 0 ? '+' : ''}${variance.toFixed(1)}%`
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Archive</h1>
          <p className="text-gray-600">Manage completed, cancelled, and archived projects</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Archive
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Archive Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search archived projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <select 
  value={statusFilter} 
  onChange={(e) => setStatusFilter}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  {statusOptions.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))}
</select>
          <select 
  value={dateFilter} 
  onChange={(e) => setDateFilter}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  {dateOptions.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))}
</select>
          <select 
  value={sortBy} 
  onChange={(e) => setSortBy}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  {sortOptions.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))}
</select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>
      </Card>

      {/* Archive Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Archived</p>
              <p className="text-2xl font-bold text-gray-900">{archivedProjects.length}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Archive className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {archivedProjects.filter(p => p.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-900">
                {archivedProjects.filter(p => p.status === 'cancelled').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(archivedProjects.reduce((sum, p) => sum + p.budget_spent, 0))}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Banknote className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Archived Projects List */}
      <div className="space-y-4">
        {archivedProjects.map((project) => (
          <Card key={project.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                  <span className="text-sm text-gray-500">{project.code}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority} priority
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium">
                      {new Date(project.start_date).toLocaleDateString()} - 
                      {project.actual_end_date ? 
                        new Date(project.actual_end_date).toLocaleDateString() : 
                        new Date(project.end_date).toLocaleDateString()
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget Performance</p>
                    <p className="font-medium">
                      {formatCurrency(project.budget_spent)} / {formatCurrency(project.budget_allocated)}
                      <span className={`ml-2 text-sm ${project.final_budget_variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ({formatVariance(project.final_budget_variance)})
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Team & Manager</p>
                    <p className="font-medium">{project.team_size} members</p>
                    <p className="text-sm text-gray-600">{project.manager}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completion</p>
                    <p className="font-medium">
                      {project.tasks_completed} / {project.tasks_total} tasks
                    </p>
                    <p className="text-sm text-gray-600">{project.deliverables_count} deliverables</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Archive Information</p>
                      <p className="text-sm">
                        Archived on {new Date(project.archived_date).toLocaleDateString()} by {project.archived_by}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Reason: {project.archive_reason}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client & Department</p>
                      <p className="text-sm">{project.client_name}</p>
                      <p className="text-sm text-gray-600">{project.department}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {hasPermission('projects:update') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRestoreProject(project.id)}
                    disabled={restoreProjectMutation.isLoading}
                  >
                    <ArchiveRestore className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                )}
                {hasPermission('projects:delete') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handlePermanentDelete(project.id)}
                    disabled={permanentDeleteMutation.isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {archivedProjects.length === 0 && (
        <Card className="p-12 text-center">
          <Archive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No archived projects found</h3>
          <p className="text-gray-600">
            {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
              ? 'Try adjusting your filters to see more results.'
              : 'Completed and cancelled projects will appear here when archived.'
            }
          </p>
        </Card>
      )}
    </div>
  )
}

export default ProjectArchive