import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  ArrowLeft, 
  Save,
  Trash2,
  Settings,
  Users,
  Bell,
  Lock,
  Archive,
  AlertTriangle
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
// Removed custom Select import - using native HTML select
import toast from 'react-hot-toast'

const ProjectSettings = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  // Permission checks removed
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('general')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: project, isLoading } = useQuery(
    ['project', id],
    () => projectService.getProjectById(id),
    {
      select: (response) => response?.data?.data?.project,
      enabled: !!id
    }
  )

  const [formData, setFormData] = useState({
    name: project?.name || '',
    code: project?.code || '',
    description: project?.description || '',
    visibility: project?.visibility || 'internal',
    notifications_enabled: project?.notifications_enabled || true,
    time_tracking_enabled: project?.time_tracking_enabled || true,
    approval_required: project?.approval_required || false
  })

  React.useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        code: project.code || '',
        description: project.description || '',
        visibility: project.visibility || 'internal',
        notifications_enabled: project.notifications_enabled || true,
        time_tracking_enabled: project.time_tracking_enabled || true,
        approval_required: project.approval_required || false
      })
    }
  }, [project])

  const updateProjectMutation = useMutation(
    (data) => projectService.updateProject(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', id])
        toast.success('Project settings updated successfully')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update project settings')
      }
    }
  )

  const deleteProjectMutation = useMutation(
    () => projectService.deleteProject(id),
    {
      onSuccess: () => {
        toast.success('Project deleted successfully')
        navigate('/projects')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete project')
      }
    }
  )

  const archiveProjectMutation = useMutation(
    () => projectService.updateProject(id, { status: 'cancelled' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project', id])
        toast.success('Project archived successfully')
      }
    }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    updateProjectMutation.mutate(formData)
  }

  const handleDelete = () => {
    deleteProjectMutation.mutate()
    setShowDeleteConfirm(false)
  }

  const handleArchive = () => {
    if (window.confirm('Are you sure you want to archive this project?')) {
      archiveProjectMutation.mutate()
    }
  }

  const visibilityOptions = [
    { value: 'public', label: 'Public - Visible to all users' },
    { value: 'internal', label: 'Internal - Visible to team members' },
    { value: 'private', label: 'Private - Visible to managers only' }
  ]

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'permissions', label: 'Permissions', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // All authenticated users can access project settings

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Project
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow">
            {activeTab === 'general' && (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">General Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Code
                      </label>
                      <Input
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visibility
                    </label>
                    <Select
                      value={formData.visibility}
                      onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                      options={visibilityOptions}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" loading={updateProjectMutation.isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'permissions' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Access Control</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Time Tracking</h4>
                      <p className="text-sm text-gray-500">Allow team members to track time on this project</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.time_tracking_enabled}
                      onChange={(e) => setFormData({ ...formData, time_tracking_enabled: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Approval Required</h4>
                      <p className="text-sm text-gray-500">Require manager approval for task completion</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.approval_required}
                      onChange={(e) => setFormData({ ...formData, approval_required: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSubmit} loading={updateProjectMutation.isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Send email notifications for project updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications_enabled}
                      onChange={(e) => setFormData({ ...formData, notifications_enabled: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Button onClick={handleSubmit} loading={updateProjectMutation.isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Danger Zone</h3>
                <div className="space-y-4">
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Archive Project</h4>
                        <p className="text-sm text-yellow-700">Archive this project to hide it from active projects</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleArchive}
                        loading={archiveProjectMutation.isLoading}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Delete Project</h4>
                        <p className="text-sm text-red-700">Permanently delete this project and all its data</p>
                      </div>
                      <Button
                        variant="error"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Project</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{project?.name}"? This action cannot be undone and will permanently delete all project data, tasks, and files.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="error"
                onClick={handleDelete}
                loading={deleteProjectMutation.isLoading}
              >
                Delete Project
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectSettings