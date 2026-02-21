import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  ArrowLeft, 
  Plus, 
  Filter,
  Search,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  X
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const ProjectTasks = () => {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const isGlobalView = !id
  const [filters, setFilters] = useState({ search: '', status: '', priority: '' })
  const [showDialog, setShowDialog] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assigned_to: '',
    due_date: '',
    estimated_hours: ''
  })

  const { data: project } = useQuery(
    ['project', id],
    () => projectService.getProjectById(id),
    { select: (r) => r?.data?.data?.project, enabled: !!id }
  )

  const { data: projectTasks = [], isLoading, refetch } = useQuery(
    ['project-tasks', id, filters],
    () => projectService.getProjectTasks(id, filters),
    { 
      select: (r) => r?.data?.data?.tasks || r?.data?.tasks || [],
      enabled: !isGlobalView && !!id
    }
  )

  const { data: allTasks = [], isLoading: loadingAll } = useQuery(
    ['all-tasks', filters],
    () => projectService.getTasks(filters),
    { 
      select: (r) => r?.data?.data?.tasks || r?.data?.tasks || [],
      enabled: isGlobalView
    }
  )

  const tasks = isGlobalView ? allTasks : projectTasks
  const tasksLoading = isGlobalView ? loadingAll : isLoading

  const { data: employees = [] } = useQuery(
    'employees-list',
    () => projectService.getEmployees(),
    { select: (r) => r?.data?.data?.employees || r?.data?.employees || [] }
  )

  const createTaskMutation = useMutation(
    (data) => projectService.createTask(id, data),
    { onSuccess: () => { queryClient.invalidateQueries(['project-tasks', id]); setShowDialog(false); resetForm() } }
  )

  const updateTaskMutation = useMutation(
    ({ taskId, data }) => projectService.updateTask(taskId, data),
    { onSuccess: () => { queryClient.invalidateQueries(['project-tasks', id]); queryClient.invalidateQueries('all-tasks'); setShowDialog(false); resetForm() } }
  )

  const deleteTaskMutation = useMutation(
    (taskId) => projectService.deleteTask(taskId),
    { onSuccess: () => { queryClient.invalidateQueries(['project-tasks', id]); queryClient.invalidateQueries('all-tasks') } }
  )

  const resetForm = () => {
    setFormData({ title: '', description: '', status: 'todo', priority: 'medium', assigned_to: '', due_date: '', estimated_hours: '' })
    setEditingTask(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      assigned_to: formData.assigned_to ? parseInt(formData.assigned_to) : null,
      estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null
    }
    if (editingTask) {
      updateTaskMutation.mutate({ taskId: editingTask.id, data: submitData })
    } else {
      createTaskMutation.mutate(submitData)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      assigned_to: task.assigned_to || task.AssignedTo?.id || '',
      due_date: task.due_date?.split('T')[0] || '',
      estimated_hours: task.estimated_hours || ''
    })
    setShowDialog(true)
  }

  const handleDelete = (taskId) => {
    if (window.confirm('Delete this task?')) deleteTaskMutation.mutate(taskId)
  }

  const getStatusIcon = (status) => ({
    todo: <Clock className="h-5 w-5 text-gray-500" />,
    open: <Clock className="h-5 w-5 text-gray-500" />,
    in_progress: <AlertCircle className="h-5 w-5 text-primary" />,
    review: <Clock className="h-5 w-5 text-yellow-500" />,
    completed: <CheckCircle className="h-5 w-5 text-green-500" />,
    done: <CheckCircle className="h-5 w-5 text-green-500" />
  }[status] || <Clock className="h-5 w-5 text-gray-500" />)

  const getStatusColor = (status) => ({
    todo: 'bg-gray-100 text-gray-800',
    open: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    done: 'bg-green-100 text-green-800'
  }[status] || 'bg-gray-100 text-gray-800')

  const getPriorityColor = (p) => ({
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-orange-600',
    critical: 'text-red-600'
  }[p] || 'text-gray-600')

  if (tasksLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>)}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={isGlobalView ? "/projects" : `/projects/${id}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> {isGlobalView ? 'Back to Projects' : 'Back to Project'}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isGlobalView ? 'All Tasks' : 'Tasks'}</h1>
            {!isGlobalView && <p className="text-gray-600">{project?.name}</p>}
          </div>
        </div>
        {!isGlobalView && (
          <Button onClick={() => { resetForm(); setShowDialog(true) }}>
            <Plus className="h-4 w-4 mr-2" /> New Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-64"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {Object.values(filters).some(f => f) ? 'Try adjusting your filters.' : 'Get started by creating a new task.'}
            </p>
            {!isGlobalView && (
              <Button onClick={() => { resetForm(); setShowDialog(true) }}>
                <Plus className="h-4 w-4 mr-2" /> Create First Task
              </Button>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-2 rounded-full ${getStatusColor(task.status)}`}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    {task.description && <p className="text-gray-600 mt-1">{task.description}</p>}
                    <div className="flex items-center flex-wrap gap-4 mt-3 text-sm text-gray-500">
                      {isGlobalView && task.Project && (
                        <Link to={`/projects/${task.project_id}`} className="text-primary hover:underline">
                          {task.Project.name}
                        </Link>
                      )}
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {task.AssignedTo?.User?.first_name || 'Unassigned'} {task.AssignedTo?.User?.last_name || ''}
                      </span>
                      {task.due_date && (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      <span className={`font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority || 'medium'} priority
                      </span>
                      {task.estimated_hours && (
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {task.estimated_hours}h
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingTask ? 'Edit Task' : 'Create Task'}</h3>
              <button onClick={() => setShowDialog(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Unassigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.User?.first_name || emp.first_name} {emp.User?.last_name || emp.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={createTaskMutation.isLoading || updateTaskMutation.isLoading}>
                  {editingTask ? 'Update' : 'Create'} Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectTasks
