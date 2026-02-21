import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from 'react-query'
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Archive, 
  Play, 
  Pause, 
  CheckCircle,
  Users,
  FileText,
  Calendar,
  Banknote,
  Share2,
  Download,
  Settings
} from 'lucide-react'
import { Dropdown, DropdownItem, DropdownSeparator, DropdownLabel } from '@/components/ui/Dropdown'
import Button from '@/components/ui/Button'
import { projectService } from '@/services/projectService'
import { useAuth } from '@/contexts/AuthContext'

const ProjectActions = ({ project, onStatusChange, onDelete }) => {
  const auth = useAuth(); const hasPermission = auth?.hasPermission || (() => true)
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const updateStatusMutation = useMutation(
    ({ id, status }) => projectService.updateProject(id, { status }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects')
        onStatusChange?.(project.id, status)
      }
    }
  )

  const duplicateProjectMutation = useMutation(
    (projectData) => projectService.createProject(projectData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects')
      }
    }
  )

  const deleteProjectMutation = useMutation(
    (id) => projectService.deleteProject(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('projects')
        onDelete?.(project.id)
        setShowDeleteConfirm(false)
      }
    }
  )

  const handleStatusChange = (newStatus) => {
    updateStatusMutation.mutate({ id: project.id, status: newStatus })
  }

  const handleDuplicate = () => {
    const duplicateData = {
      ...project,
      name: `${project.name} (Copy)`,
      code: `${project.code}-COPY`,
      status: 'planning',
      progress_percentage: 0,
      budget_spent: 0,
      actual_start_date: null,
      actual_end_date: null
    }
    delete duplicateData.id
    delete duplicateData.created_at
    delete duplicateData.updated_at
    
    duplicateProjectMutation.mutate(duplicateData)
  }

  const handleDelete = () => {
    deleteProjectMutation.mutate(project.id)
  }

  const handleExport = () => {
    // Implementation for exporting project data
    console.log('Exporting project:', project.id)
  }

  const handleShare = () => {
    // Implementation for sharing project
    console.log('Sharing project:', project.id)
  }

  const getStatusActions = () => {
    const actions = []
    
    switch (project.status) {
      case 'planning':
        actions.push({
          label: 'Start Project',
          icon: Play,
          action: () => handleStatusChange('active'),
          color: 'text-green-600'
        })
        break
      case 'active':
        actions.push(
          {
            label: 'Put on Hold',
            icon: Pause,
            action: () => handleStatusChange('on_hold'),
            color: 'text-yellow-600'
          },
          {
            label: 'Mark Complete',
            icon: CheckCircle,
            action: () => handleStatusChange('completed'),
            color: 'text-primary'
          }
        )
        break
      case 'on_hold':
        actions.push({
          label: 'Resume Project',
          icon: Play,
          action: () => handleStatusChange('active'),
          color: 'text-green-600'
        })
        break
      case 'completed':
        actions.push({
          label: 'Reopen Project',
          icon: Play,
          action: () => handleStatusChange('active'),
          color: 'text-green-600'
        })
        break
    }
    
    return actions
  }

  const statusActions = getStatusActions()

  const trigger = (
    <Button variant="ghost" size="icon">
      <MoreVertical className="h-4 w-4" />
    </Button>
  )

  if (showDeleteConfirm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Project</h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete "{project.name}"? This action cannot be undone.
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
    )
  }

  return (
    <Dropdown trigger={trigger} align="right">
      {/* View Actions */}
      <DropdownLabel>View</DropdownLabel>
      <DropdownItem>
        <Link to={`/projects/${project.id}`} className="flex items-center w-full">
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </Link>
      </DropdownItem>
      <DropdownItem>
        <Link to={`/projects/${project.id}/tasks`} className="flex items-center w-full">
          <FileText className="h-4 w-4 mr-2" />
          View Tasks
        </Link>
      </DropdownItem>
      <DropdownItem>
        <Link to={`/projects/${project.id}/team`} className="flex items-center w-full">
          <Users className="h-4 w-4 mr-2" />
          View Team
        </Link>
      </DropdownItem>
      <DropdownItem>
        <Link to={`/projects/${project.id}/timeline`} className="flex items-center w-full">
          <Calendar className="h-4 w-4 mr-2" />
          View Timeline
        </Link>
      </DropdownItem>
      <DropdownItem>
        <Link to={`/projects/${project.id}/budget`} className="flex items-center w-full">
          <Banknote className="h-4 w-4 mr-2" />
          View Budget
        </Link>
      </DropdownItem>

      <DropdownSeparator />

      {/* Edit Actions */}
      {hasPermission('projects:update') && (
        <>
          <DropdownLabel>Edit</DropdownLabel>
          <DropdownItem>
            <Link to={`/projects/${project.id}/edit`} className="flex items-center w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Link>
          </DropdownItem>
          <DropdownItem>
            <Link to={`/projects/${project.id}/settings`} className="flex items-center w-full">
              <Settings className="h-4 w-4 mr-2" />
              Project Settings
            </Link>
          </DropdownItem>
          <DropdownSeparator />
        </>
      )}

      {/* Status Actions */}
      {statusActions.length > 0 && hasPermission('projects:update') && (
        <>
          <DropdownLabel>Status</DropdownLabel>
          {statusActions.map((action, index) => (
            <DropdownItem key={index} onClick={action.action}>
              <action.icon className={`h-4 w-4 mr-2 ${action.color}`} />
              {action.label}
            </DropdownItem>
          ))}
          <DropdownSeparator />
        </>
      )}

      {/* Other Actions */}
      <DropdownLabel>Actions</DropdownLabel>
      {hasPermission('projects:create') && (
        <DropdownItem onClick={handleDuplicate}>
          <Copy className="h-4 w-4 mr-2" />
          Duplicate Project
        </DropdownItem>
      )}
      <DropdownItem onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Share Project
      </DropdownItem>
      <DropdownItem onClick={handleExport}>
        <Download className="h-4 w-4 mr-2" />
        Export Data
      </DropdownItem>

      {hasPermission('projects:update') && (
        <DropdownItem onClick={() => handleStatusChange('cancelled')}>
          <Archive className="h-4 w-4 mr-2 text-yellow-600" />
          Archive Project
        </DropdownItem>
      )}

      {hasPermission('projects:delete') && (
        <>
          <DropdownSeparator />
          <DropdownItem 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Project
          </DropdownItem>
        </>
      )}
    </Dropdown>
  )
}

export default ProjectActions