import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Target,
  TrendingUp
} from 'lucide-react'
import { projectService } from '@/services/projectService'

const ProjectTimeline = () => {
  const { id } = useParams()

  const { data: project } = useQuery(
    ['project', id],
    () => projectService.getProjectById(id),
    {
      select: (response) => response?.data?.data?.project,
      enabled: !!id
    }
  )

  const { data: tasks } = useQuery(
    ['project-tasks', id],
    () => projectService.getProjectTasks(id),
    {
      select: (response) => response?.data?.tasks || [],
      enabled: !!id
    }
  )

  const milestones = project?.milestones ? (
    typeof project.milestones === 'string' ? JSON.parse(project.milestones) : project.milestones
  ) : []
  
  const timelineItems = [
    ...(Array.isArray(milestones) ? milestones.map(milestone => ({
      type: 'milestone',
      id: milestone.id || Math.random(),
      title: milestone.name,
      description: milestone.description,
      date: milestone.date,
      completed: milestone.completed,
      icon: Target
    })) : []),
    ...(Array.isArray(tasks) ? tasks.map(task => ({
      type: 'task',
      id: task.id,
      title: task.title,
      description: task.description,
      date: task.due_date,
      completed: task.status === 'completed',
      status: task.status,
      assignee: task.AssignedTo?.User,
      icon: task.status === 'completed' ? CheckCircle : Clock
    })) : [])
  ].filter(item => item.date).sort((a, b) => new Date(a.date) - new Date(b.date))

  const getItemColor = (item) => {
    if (item.completed) return 'text-green-600 bg-green-100'
    if (item.type === 'milestone') return 'text-purple-600 bg-purple-100'
    if (item.date && new Date(item.date) < new Date()) return 'text-red-600 bg-red-100'
    return 'text-primary bg-blue-100'
  }

  const getStatusText = (item) => {
    if (item.completed) return 'Completed'
    if (item.type === 'milestone') return 'Milestone'
    if (item.date && new Date(item.date) < new Date()) return 'Overdue'
    return 'Upcoming'
  }

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
            <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
      </div>

      {/* Project Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {project?.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
            </div>
            <div className="text-sm text-gray-500">Start Date</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {project?.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not set'}
            </div>
            <div className="text-sm text-gray-500">End Date</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {project?.end_date ? Math.max(0, Math.ceil((new Date(project.end_date) - new Date()) / (1000 * 60 * 60 * 24))) : 0} days
            </div>
            <div className="text-sm text-gray-500">Remaining</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {project?.progress_percentage || 0}%
            </div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{project?.progress_percentage || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${project?.progress_percentage || 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Project Timeline</h3>
        </div>
        
        {timelineItems.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No timeline items</h3>
            <p className="text-gray-600">Milestones and tasks will appear here as they are created.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {timelineItems.map((item, index) => {
                  const ItemIcon = item.icon
                  const itemColor = getItemColor(item)
                  const isLast = index === timelineItems.length - 1
                  
                  return (
                    <li key={`${item.type}-${item.id}`}>
                      <div className="relative pb-8">
                        {!isLast && (
                          <span 
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" 
                            aria-hidden="true" 
                          />
                        )}
                        
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${itemColor}`}>
                              <ItemIcon className="h-4 w-4" aria-hidden="true" />
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.title}
                                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${itemColor}`}>
                                    {getStatusText(item)}
                                  </span>
                                </p>
                                
                                {item.description && (
                                  <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                                )}
                                
                                {item.assignee && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    Assigned to {item.assignee.first_name} {item.assignee.last_name}
                                  </p>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <p className="text-sm text-gray-500">
                                  {item.date ? new Date(item.date).toLocaleDateString() : 'No date'}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {item.date ? new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' }) : ''}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Completed Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {timelineItems.filter(item => item.completed).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Overdue Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {timelineItems.filter(item => !item.completed && item.date && new Date(item.date) < new Date()).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Upcoming Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {timelineItems.filter(item => !item.completed && item.date && new Date(item.date) >= new Date()).length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectTimeline