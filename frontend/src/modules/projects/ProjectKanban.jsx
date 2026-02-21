import React, { useState, useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Link } from 'react-router-dom'
import { Plus, Search, Calendar, Users, Clock, AlertCircle, CheckCircle, Target, TrendingUp, MoreHorizontal, ExternalLink } from 'lucide-react'
import { projectService } from '@/services/projectService'
import { formatCurrency } from '@/utils/formatters'
import toast from 'react-hot-toast'

const ProjectKanban = () => {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: projects = [], isLoading } = useQuery(
    ['projects-kanban', searchTerm],
    () => projectService.getProjects({ search: searchTerm, limit: 100 }),
    { select: (r) => r?.data?.data?.projects || [] }
  )

  const columns = [
    { id: 'planning', title: 'Planning', color: 'border-slate-300', bg: 'bg-slate-50', badge: 'bg-slate-200 text-slate-700', icon: Target },
    { id: 'active', title: 'In Progress', color: 'border-blue-300', bg: 'bg-primary-50', badge: 'bg-blue-200 text-primary-700', icon: TrendingUp },
    { id: 'on_hold', title: 'On Hold', color: 'border-amber-300', bg: 'bg-amber-50', badge: 'bg-amber-200 text-amber-700', icon: Clock },
    { id: 'completed', title: 'Completed', color: 'border-green-300', bg: 'bg-green-50', badge: 'bg-green-200 text-green-700', icon: CheckCircle },
    { id: 'cancelled', title: 'Cancelled', color: 'border-red-300', bg: 'bg-red-50', badge: 'bg-red-200 text-red-700', icon: AlertCircle }
  ]

  const kanbanData = useMemo(() => {
    const data = { planning: [], active: [], on_hold: [], completed: [], cancelled: [] }
    projects.forEach(p => {
      const status = p.status || 'planning'
      if (data[status]) {
        data[status].push({
          id: p.id, name: p.name, code: p.code, priority: p.priority || 'medium',
          progress: p.progress_percentage || 0, budget: p.budget_allocated,
          due_date: p.end_date, manager: p.Manager?.User ? `${p.Manager.User.first_name} ${p.Manager.User.last_name}` : 'Unassigned'
        })
      } else {
        data.planning.push({
          id: p.id, name: p.name, code: p.code, priority: p.priority || 'medium',
          progress: p.progress_percentage || 0, budget: p.budget_allocated,
          due_date: p.end_date, manager: p.Manager?.User ? `${p.Manager.User.first_name} ${p.Manager.User.last_name}` : 'Unassigned'
        })
      }
    })
    return data
  }, [projects])

  const updateMutation = useMutation(
    ({ id, status }) => projectService.updateProject(id, { status }),
    {
      onSuccess: () => { queryClient.invalidateQueries('projects-kanban'); toast.success('Status updated') },
      onError: () => toast.error('Failed to update status')
    }
  )

  const onDragEnd = useCallback((result) => {
    if (!result.destination || result.destination.droppableId === result.source.droppableId) return
    updateMutation.mutate({ id: parseInt(result.draggableId), status: result.destination.droppableId })
  }, [updateMutation])

  const priorityColors = { critical: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500' }

  if (isLoading) return (
    <div className="p-6">
      <div className="flex gap-4 overflow-x-auto">
        {[1,2,3,4,5].map(i => <div key={i} className="w-72 h-96 bg-gray-100 rounded-xl animate-pulse flex-shrink-0"></div>)}
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col">


      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-6 bg-gray-50">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full min-h-[600px]">
            {columns.map(column => {
              const items = kanbanData[column.id] || []
              const Icon = column.icon
              return (
                <div key={column.id} className={`w-72 flex-shrink-0 flex flex-col rounded-xl border-2 ${column.color} ${column.bg}`}>
                  {/* Column Header */}
                  <div className="p-3 border-b border-gray-200/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold text-gray-800">{column.title}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${column.badge}`}>{items.length}</span>
                    </div>
                  </div>

                  {/* Column Content */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps}
                        className={`flex-1 p-2 space-y-2 overflow-y-auto transition-colors ${snapshot.isDraggingOver ? 'bg-blue-100/50' : ''}`}>
                        {items.map((project, index) => (
                          <Draggable key={project.id} draggableId={project.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab active:cursor-grabbing transition-all ${snapshot.isDragging ? 'shadow-xl rotate-2 scale-105' : 'hover:shadow-md'}`}>
                                {/* Card Header */}
                                <div className="flex items-start justify-between mb-2">
                                  <Link to={`/projects/${project.id}`} className="text-xs font-mono text-primary-600 hover:underline">{project.code}</Link>
                                  <div className={`w-2 h-2 rounded-full ${priorityColors[project.priority]}`} title={project.priority}></div>
                                </div>
                                
                                {/* Project Name */}
                                <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">{project.name}</h4>
                                
                                {/* Progress */}
                                <div className="mb-3">
                                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress</span>
                                    <span className="font-medium">{project.progress}%</span>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${project.progress >= 80 ? 'bg-green-500' : project.progress >= 50 ? 'bg-primary-500' : 'bg-amber-500'}`}
                                      style={{ width: `${project.progress}%` }}></div>
                                  </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                                  <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    <span className="truncate max-w-[80px]">{project.manager}</span>
                                  </div>
                                  {project.due_date && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      <span>{new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Budget */}
                                {project.budget > 0 && (
                                  <div className="mt-2 pt-2 border-t text-xs">
                                    <span className="font-semibold text-gray-700">{formatCurrency(project.budget)}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {items.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center py-8 text-gray-400 text-sm">No projects</div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  )
}

export default ProjectKanban
