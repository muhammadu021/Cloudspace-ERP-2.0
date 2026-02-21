import React, { useState, useMemo, useRef } from 'react'
import { useQuery } from 'react-query'
import { 
  Download, Calendar, ChevronDown, ChevronRight, Filter, Users, X
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { formatCurrency } from '@/utils/formatters'

const ProjectGanttReport = () => {
  const [selectedProject, setSelectedProject] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAssignee, setShowAssignee] = useState(true)
  const [expandedMilestones, setExpandedMilestones] = useState({})
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [tooltip, setTooltip] = useState(null)
  const ganttRef = useRef(null)

  // Fetch projects with milestones
  const { data: projects, isLoading } = useQuery(
    'projects-gantt',
    () => projectService.getProjects({ limit: 100 }),
    {
      select: (response) => response?.data?.data?.projects || []
    }
  )

  // Parse milestones from projects
  const ganttData = useMemo(() => {
    if (!projects) return []
    
    let filtered = projects
    if (selectedProject !== 'all') {
      filtered = filtered.filter(p => p.id === parseInt(selectedProject))
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter)
    }

    return filtered.map(project => {
      let milestones = project.milestones
      if (typeof milestones === 'string') {
        try { milestones = JSON.parse(milestones) } catch { milestones = [] }
      }
      if (!Array.isArray(milestones)) milestones = []

      return {
        id: project.id,
        name: project.name,
        code: project.code,
        status: project.status,
        start_date: project.start_date,
        end_date: project.end_date,
        progress: project.progress_percentage || 0,
        manager: project.Manager?.User ? `${project.Manager.User.first_name} ${project.Manager.User.last_name}` : 'Unassigned',
        milestones: milestones.map((m, idx) => ({
          id: `${project.id}-m-${idx}`,
          name: m.name || `Milestone ${idx + 1}`,
          date: m.date,
          description: m.description,
          completed: m.completed,
          status: m.completed ? 'completed' : new Date(m.date) < new Date() ? 'delayed' : 'in_progress',
          deliverables: (m.deliverables || []).map((d, dIdx) => ({
            id: `${project.id}-m-${idx}-d-${dIdx}`,
            name: d.name,
            due_date: d.due_date,
            completed: d.completed,
            status: d.completed ? 'completed' : new Date(d.due_date) < new Date() ? 'delayed' : 'in_progress',
            assignee: d.assignee || project.Manager?.User ? `${project.Manager?.User?.first_name || ''} ${project.Manager?.User?.last_name || ''}`.trim() : 'Unassigned'
          }))
        }))
      }
    })
  }, [projects, selectedProject, statusFilter])

  // Calculate timeline range
  const timelineRange = useMemo(() => {
    if (ganttData.length === 0) return { start: new Date(), end: new Date(), days: 30 }
    
    let minDate = new Date()
    let maxDate = new Date()
    
    ganttData.forEach(project => {
      const start = new Date(project.start_date)
      const end = new Date(project.end_date)
      if (start < minDate) minDate = start
      if (end > maxDate) maxDate = end
      
      project.milestones.forEach(m => {
        if (m.date) {
          const mDate = new Date(m.date)
          if (mDate < minDate) minDate = mDate
          if (mDate > maxDate) maxDate = mDate
        }
        m.deliverables.forEach(d => {
          if (d.due_date) {
            const dDate = new Date(d.due_date)
            if (dDate < minDate) minDate = dDate
            if (dDate > maxDate) maxDate = dDate
          }
        })
      })
    })

    // Apply custom date range if set
    if (dateRange.start) minDate = new Date(dateRange.start)
    if (dateRange.end) maxDate = new Date(dateRange.end)

    // Add padding
    minDate.setDate(minDate.getDate() - 7)
    maxDate.setDate(maxDate.getDate() + 7)
    
    const days = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24))
    return { start: minDate, end: maxDate, days: Math.max(days, 30) }
  }, [ganttData, dateRange])

  // Generate month headers
  const monthHeaders = useMemo(() => {
    const months = []
    const current = new Date(timelineRange.start)
    current.setDate(1)
    
    while (current <= timelineRange.end) {
      const daysInMonth = new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()
      const monthStart = new Date(Math.max(current, timelineRange.start))
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0)
      if (monthEnd > timelineRange.end) monthEnd.setTime(timelineRange.end.getTime())
      
      const startDay = Math.floor((monthStart - timelineRange.start) / (1000 * 60 * 60 * 24))
      const endDay = Math.floor((monthEnd - timelineRange.start) / (1000 * 60 * 60 * 24))
      
      months.push({
        label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        startDay,
        width: endDay - startDay + 1
      })
      current.setMonth(current.getMonth() + 1)
    }
    return months
  }, [timelineRange])

  const toggleMilestone = (id) => {
    setExpandedMilestones(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' }
      case 'in_progress': return { bg: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' }
      case 'delayed': return { bg: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' }
      default: return { bg: 'bg-gray-400', light: 'bg-gray-100', text: 'text-gray-700' }
    }
  }

  const getBarPosition = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate || startDate)
    const startDay = Math.max(0, Math.floor((start - timelineRange.start) / (1000 * 60 * 60 * 24)))
    const endDay = Math.floor((end - timelineRange.start) / (1000 * 60 * 60 * 24))
    const dayWidth = 100 / timelineRange.days
    return {
      left: `${startDay * dayWidth}%`,
      width: `${Math.max((endDay - startDay + 1) * dayWidth, 1)}%`
    }
  }

  const showTooltip = (e, item, type) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setTooltip({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      item,
      type
    })
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Gantt Chart</h1>
          <p className="text-gray-600">Visual timeline of project milestones and deliverables</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <Download className="h-4 w-4 mr-2" /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Projects</option>
              {projects?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAssignee}
                onChange={(e) => setShowAssignee(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Show Assignee</span>
            </label>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Delayed</span>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto" ref={ganttRef}>
          <div className="min-w-[1200px]">
            {/* Timeline Header */}
            <div className="flex border-b bg-gray-50 sticky top-0 z-10">
              <div className="w-80 flex-shrink-0 px-4 py-3 font-semibold text-gray-700 border-r">
                Milestone / Deliverable
              </div>
              {showAssignee && (
                <div className="w-32 flex-shrink-0 px-3 py-3 font-semibold text-gray-700 border-r text-sm">
                  Assigned To
                </div>
              )}
              <div className="w-24 flex-shrink-0 px-3 py-3 font-semibold text-gray-700 border-r text-sm text-center">
                Status
              </div>
              <div className="w-24 flex-shrink-0 px-3 py-3 font-semibold text-gray-700 border-r text-sm text-center">
                Progress
              </div>
              <div className="flex-1 relative">
                <div className="flex">
                  {monthHeaders.map((month, idx) => (
                    <div
                      key={idx}
                      className="text-center py-3 text-sm font-medium text-gray-600 border-r"
                      style={{ width: `${(month.width / timelineRange.days) * 100}%` }}
                    >
                      {month.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gantt Rows */}
            <div className="divide-y">
              {ganttData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No projects found</div>
              ) : (
                ganttData.map(project => (
                  <div key={project.id}>
                    {/* Project Header */}
                    <div className="flex bg-gray-100 border-b">
                      <div className="w-80 flex-shrink-0 px-4 py-3 font-semibold text-gray-900 border-r">
                        <div className="flex items-center gap-2">
                          <span className="text-primary-600">{project.code}</span>
                          <span>-</span>
                          <span>{project.name}</span>
                        </div>
                      </div>
                      {showAssignee && (
                        <div className="w-32 flex-shrink-0 px-3 py-3 text-sm text-gray-600 border-r">
                          {project.manager}
                        </div>
                      )}
                      <div className="w-24 flex-shrink-0 px-3 py-3 border-r">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-700' :
                          project.status === 'active' ? 'bg-blue-100 text-primary-700' :
                          project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                      <div className="w-24 flex-shrink-0 px-3 py-3 border-r text-center text-sm font-medium">
                        {project.progress}%
                      </div>
                      <div className="flex-1 relative py-3 px-2">
                        {/* Project bar */}
                        <div
                          className="absolute h-6 bg-primary-200 rounded cursor-pointer hover:bg-primary-300"
                          style={getBarPosition(project.start_date, project.end_date)}
                          onMouseEnter={(e) => showTooltip(e, project, 'project')}
                          onMouseLeave={() => setTooltip(null)}
                        >
                          <div
                            className="h-full bg-primary-500 rounded-l"
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Milestones */}
                    {project.milestones.map(milestone => {
                      const isExpanded = expandedMilestones[milestone.id]
                      const statusColor = getStatusColor(milestone.status)
                      const completedDel = milestone.deliverables.filter(d => d.completed).length
                      const progress = milestone.deliverables.length > 0 
                        ? Math.round((completedDel / milestone.deliverables.length) * 100) 
                        : (milestone.completed ? 100 : 0)

                      return (
                        <div key={milestone.id}>
                          {/* Milestone Row */}
                          <div className="flex hover:bg-gray-50">
                            <div className="w-80 flex-shrink-0 px-4 py-2 border-r">
                              <div className="flex items-center gap-2 pl-4">
                                <button
                                  onClick={() => toggleMilestone(milestone.id)}
                                  className="p-0.5 hover:bg-gray-200 rounded"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                  )}
                                </button>
                                <div className={`w-2 h-2 rounded-full ${statusColor.bg}`}></div>
                                <span className="font-medium text-gray-800">{milestone.name}</span>
                                <span className="text-xs text-gray-500">({milestone.deliverables.length})</span>
                              </div>
                            </div>
                            {showAssignee && (
                              <div className="w-32 flex-shrink-0 px-3 py-2 text-sm text-gray-500 border-r">-</div>
                            )}
                            <div className="w-24 flex-shrink-0 px-3 py-2 border-r">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColor.light} ${statusColor.text}`}>
                                {milestone.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="w-24 flex-shrink-0 px-3 py-2 border-r text-center text-sm">
                              {progress}%
                            </div>
                            <div className="flex-1 relative py-2 px-2">
                              {/* Milestone marker */}
                              {milestone.date && (
                                <div
                                  className={`absolute w-4 h-4 ${statusColor.bg} transform rotate-45 cursor-pointer`}
                                  style={{
                                    left: getBarPosition(milestone.date, milestone.date).left,
                                    top: '50%',
                                    marginTop: '-8px'
                                  }}
                                  onMouseEnter={(e) => showTooltip(e, milestone, 'milestone')}
                                  onMouseLeave={() => setTooltip(null)}
                                ></div>
                              )}
                            </div>
                          </div>

                          {/* Deliverables */}
                          {isExpanded && milestone.deliverables.map(deliverable => {
                            const delStatus = getStatusColor(deliverable.status)
                            return (
                              <div key={deliverable.id} className="flex hover:bg-primary-50 bg-gray-50/50">
                                <div className="w-80 flex-shrink-0 px-4 py-2 border-r">
                                  <div className="flex items-center gap-2 pl-12">
                                    <div className={`w-1.5 h-1.5 rounded-full ${delStatus.bg}`}></div>
                                    <span className="text-sm text-gray-700">{deliverable.name}</span>
                                  </div>
                                </div>
                                {showAssignee && (
                                  <div className="w-32 flex-shrink-0 px-3 py-2 text-xs text-gray-500 border-r truncate">
                                    {deliverable.assignee}
                                  </div>
                                )}
                                <div className="w-24 flex-shrink-0 px-3 py-2 border-r">
                                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${delStatus.light} ${delStatus.text}`}>
                                    {deliverable.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="w-24 flex-shrink-0 px-3 py-2 border-r text-center text-sm">
                                  {deliverable.completed ? '100%' : '0%'}
                                </div>
                                <div className="flex-1 relative py-2 px-2">
                                  {/* Deliverable bar */}
                                  {deliverable.due_date && (
                                    <div
                                      className={`absolute h-4 ${delStatus.bg} rounded cursor-pointer opacity-80 hover:opacity-100`}
                                      style={{
                                        ...getBarPosition(deliverable.due_date, deliverable.due_date),
                                        minWidth: '8px'
                                      }}
                                      onMouseEnter={(e) => showTooltip(e, deliverable, 'deliverable')}
                                      onMouseLeave={() => setTooltip(null)}
                                    ></div>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg shadow-lg p-3 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-semibold mb-1">{tooltip.item.name}</div>
          {tooltip.type === 'project' && (
            <>
              <div className="text-gray-300">Manager: {tooltip.item.manager}</div>
              <div className="text-gray-300">
                {new Date(tooltip.item.start_date).toLocaleDateString()} - {new Date(tooltip.item.end_date).toLocaleDateString()}
              </div>
              <div className="text-gray-300">Progress: {tooltip.item.progress}%</div>
            </>
          )}
          {tooltip.type === 'milestone' && (
            <>
              <div className="text-gray-300">Target: {new Date(tooltip.item.date).toLocaleDateString()}</div>
              <div className="text-gray-300">Status: {tooltip.item.status}</div>
              {tooltip.item.description && <div className="text-gray-300 mt-1">{tooltip.item.description}</div>}
            </>
          )}
          {tooltip.type === 'deliverable' && (
            <>
              <div className="text-gray-300">Due: {new Date(tooltip.item.due_date).toLocaleDateString()}</div>
              <div className="text-gray-300">Assigned: {tooltip.item.assignee}</div>
              <div className="text-gray-300">Status: {tooltip.item.status}</div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectGanttReport
