import React, { useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import { Download, BarChart3, TrendingUp, FileText, Users, Banknote, Clock, Target, CheckCircle, ChevronDown, ChevronRight, Calendar, PieChart, Activity } from 'lucide-react'
import { projectService } from '@/services/projectService'
import { formatCurrency } from '@/utils/formatters'
import Card from '@/design-system/components/Card'
import Button from '@/design-system/components/Button'
import Badge from '@/design-system/components/Badge'

const ProjectReports = () => {
  const currentYear = new Date().getFullYear()
  const [activeTab, setActiveTab] = useState('status')
  const [dateFrom, setDateFrom] = useState(`${currentYear}-01-01`)
  const [dateTo, setDateTo] = useState(`${currentYear}-12-31`)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [managerFilter, setManagerFilter] = useState('all')
  const [expandedMilestones, setExpandedMilestones] = useState({})
  const [ganttTooltip, setGanttTooltip] = useState(null)
  const [exportFormat, setExportFormat] = useState(null)

  // Pre-configured report templates as per requirements
  const tabs = [
    { id: 'status', label: 'Project Status Report', icon: Target, description: 'Overview of project statuses and progress' },
    { id: 'budget', label: 'Budget Analysis Report', icon: Banknote, description: 'Financial analysis and budget utilization' },
    { id: 'team', label: 'Team Performance Report', icon: Users, description: 'Team allocation and performance metrics' },
    { id: 'timeline', label: 'Timeline Analysis Report', icon: Calendar, description: 'Project timelines and milestones' },
    { id: 'resource', label: 'Resource Utilization Report', icon: Activity, description: 'Resource allocation and utilization' }
  ]

  const { data: projects, isLoading } = useQuery(
    ['projects-reports', dateFrom, dateTo, statusFilter],
    () => projectService.getProjects({ limit: 100 }),
    { select: (r) => r?.data?.data?.projects || [] }
  )

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter(p => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      if (priorityFilter !== 'all' && p.priority !== priorityFilter) return false
      if (managerFilter !== 'all' && p.manager_id !== managerFilter) return false
      const created = new Date(p.created_at)
      if (dateFrom && created < new Date(dateFrom)) return false
      if (dateTo && created > new Date(dateTo)) return false
      return true
    })
  }, [projects, statusFilter, priorityFilter, managerFilter, dateFrom, dateTo])

  const stats = useMemo(() => {
    const fp = filteredProjects
    return {
      total: fp.length,
      active: fp.filter(p => p.status === 'active').length,
      completed: fp.filter(p => p.status === 'completed').length,
      onHold: fp.filter(p => p.status === 'on_hold').length,
      planning: fp.filter(p => p.status === 'planning').length,
      totalBudget: fp.reduce((s, p) => s + (parseFloat(p.budget_allocated) || 0), 0),
      spentBudget: fp.reduce((s, p) => s + (parseFloat(p.budget_spent) || 0), 0),
      avgProgress: fp.length > 0 ? Math.round(fp.reduce((s, p) => s + (p.progress_percentage || 0), 0) / fp.length) : 0
    }
  }, [filteredProjects])

  // Gantt data
  const ganttData = useMemo(() => {
    return filteredProjects.map(p => {
      let milestones = p.milestones
      if (typeof milestones === 'string') try { milestones = JSON.parse(milestones) } catch { milestones = [] }
      return {
        ...p, milestones: (milestones || []).map((m, i) => ({
          id: `${p.id}-m-${i}`, name: m.name, date: m.date, completed: m.completed,
          status: m.completed ? 'completed' : new Date(m.date) < new Date() ? 'delayed' : 'in_progress',
          deliverables: (m.deliverables || []).map((d, j) => ({
            id: `${p.id}-m-${i}-d-${j}`, name: d.name, due_date: d.due_date, completed: d.completed,
            status: d.completed ? 'completed' : new Date(d.due_date) < new Date() ? 'delayed' : 'in_progress'
          }))
        }))
      }
    })
  }, [filteredProjects])

  const ganttRange = useMemo(() => {
    let min = new Date(dateFrom), max = new Date(dateTo)
    const days = Math.ceil((max - min) / (1000 * 60 * 60 * 24))
    return { start: min, end: max, days: Math.max(days, 30) }
  }, [dateFrom, dateTo])

  const getBarPos = (start, end) => {
    const s = new Date(start), e = new Date(end || start)
    const startDay = Math.max(0, Math.floor((s - ganttRange.start) / (1000 * 60 * 60 * 24)))
    const endDay = Math.floor((e - ganttRange.start) / (1000 * 60 * 60 * 24))
    const dw = 100 / ganttRange.days
    return { left: `${startDay * dw}%`, width: `${Math.max((endDay - startDay + 1) * dw, 1)}%` }
  }

  const statusColor = (s) => s === 'completed' ? 'bg-green-500' : s === 'delayed' ? 'bg-red-500' : 'bg-yellow-500'

  // Export functionality (placeholder implementations)
  const handleExport = (format) => {
    setExportFormat(format)
    
    // Prepare export data
    const exportData = {
      reportType: tabs.find(t => t.id === activeTab)?.label || 'Project Report',
      dateRange: { from: dateFrom, to: dateTo },
      filters: { status: statusFilter, priority: priorityFilter, manager: managerFilter },
      projects: filteredProjects,
      stats
    }

    switch (format) {
      case 'pdf':
        // Placeholder: In production, this would generate a PDF
        console.log('Exporting to PDF:', exportData)
        alert('PDF export functionality will be implemented. Report data prepared.')
        break
      
      case 'excel':
        // Placeholder: In production, this would generate an Excel file
        console.log('Exporting to Excel:', exportData)
        alert('Excel export functionality will be implemented. Report data prepared.')
        break
      
      case 'csv':
        // Simple CSV export implementation
        const csvData = filteredProjects.map(p => ({
          Code: p.code,
          Name: p.name,
          Status: p.status,
          Priority: p.priority || 'N/A',
          Progress: `${p.progress_percentage || 0}%`,
          Budget: p.budget_allocated,
          Spent: p.budget_spent,
          Manager: p.Manager?.User ? `${p.Manager.User.first_name} ${p.Manager.User.last_name}` : 'N/A',
          StartDate: p.start_date,
          EndDate: p.end_date
        }))
        
        const csvHeaders = Object.keys(csvData[0] || {}).join(',')
        const csvRows = csvData.map(row => Object.values(row).join(','))
        const csvContent = [csvHeaders, ...csvRows].join('\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `project-report-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
        break
      
      default:
        break
    }
    
    setTimeout(() => setExportFormat(null), 1000)
  }

  // Get unique managers for filter
  const managers = useMemo(() => {
    if (!projects) return []
    const uniqueManagers = new Map()
    projects.forEach(p => {
      if (p.Manager?.User) {
        uniqueManagers.set(p.manager_id, {
          id: p.manager_id,
          name: `${p.Manager.User.first_name} ${p.Manager.User.last_name}`
        })
      }
    })
    return Array.from(uniqueManagers.values())
  }, [projects])

  if (isLoading) return <div className="p-8"><div className="animate-pulse h-64 bg-gray-200 rounded-xl"></div></div>

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Comprehensive project insights and analysis for {currentYear}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="md"
            icon={<Download className="h-4 w-4" />}
            onClick={() => handleExport('pdf')}
            loading={exportFormat === 'pdf'}
            className="min-h-[44px]"
          >
            Export PDF
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={<Download className="h-4 w-4" />}
            onClick={() => handleExport('excel')}
            loading={exportFormat === 'excel'}
            className="min-h-[44px]"
          >
            Export Excel
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={<Download className="h-4 w-4" />}
            onClick={() => handleExport('csv')}
            loading={exportFormat === 'csv'}
            className="min-h-[44px]"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report Templates - Tabs */}
      <Card padding="none" className="overflow-hidden">
        <div className="border-b">
          <div className="overflow-x-auto">
            <nav className="flex min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap min-h-[44px] ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600 bg-primary-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  title={tab.description}
                >
                  <tab.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Customizable Parameters - Filters */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm min-h-[44px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm min-h-[44px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm min-h-[44px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm min-h-[44px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Manager</label>
                <select
                  value={managerFilter}
                  onChange={e => setManagerFilter(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm min-h-[44px] focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="all">All Managers</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setDateFrom(`${currentYear}-01-01`)
                    setDateTo(`${currentYear}-12-31`)
                    setStatusFilter('all')
                    setPriorityFilter('all')
                    setManagerFilter('all')
                  }}
                  className="min-h-[44px]"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredProjects.length}</span> of <span className="font-semibold">{projects?.length || 0}</span> projects
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Project Status Report */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Projects', value: stats.total, icon: Target, color: 'blue', variant: 'info' },
                  { label: 'Active Projects', value: stats.active, icon: Clock, color: 'green', variant: 'success' },
                  { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'emerald', variant: 'success' },
                  { label: 'Average Progress', value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'purple', variant: 'info' }
                ].map((item, i) => (
                  <Card key={i} padding="md" className="bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{item.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-${item.color}-100`}>
                        <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Status Distribution & Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Status Distribution" padding="md">
                  <div className="space-y-3">
                    {[
                      { label: 'Active', value: stats.active, color: 'bg-primary-500', variant: 'info' },
                      { label: 'Completed', value: stats.completed, color: 'bg-green-500', variant: 'success' },
                      { label: 'Planning', value: stats.planning, color: 'bg-gray-400', variant: 'default' },
                      { label: 'On Hold', value: stats.onHold, color: 'bg-yellow-500', variant: 'warning' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Badge variant={item.variant} size="sm" dot>
                          {item.label}
                        </Badge>
                        <span className="flex-1 text-sm text-gray-600">{item.value} projects</span>
                        <div className="w-24 h-2 bg-gray-100 rounded-full">
                          <div
                            className={`h-full rounded-full ${item.color}`}
                            style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {stats.total > 0 ? Math.round((item.value / stats.total) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Recent Projects" padding="md">
                  <div className="space-y-3">
                    {filteredProjects.slice(0, 5).map(p => (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.code}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge
                            variant={
                              p.status === 'completed' ? 'success' :
                              p.status === 'active' ? 'info' :
                              p.status === 'on_hold' ? 'warning' : 'default'
                            }
                            size="sm"
                          >
                            {p.status}
                          </Badge>
                          <span className="text-sm font-medium">{p.progress_percentage || 0}%</span>
                        </div>
                      </div>
                    ))}
                    {filteredProjects.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No projects found</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Timeline Analysis Report (formerly Gantt) */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded"></div>Completed</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded"></div>In Progress</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div>Delayed</div>
              </div>
              <div className="border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[900px]">
                    <div className="flex bg-gray-50 border-b text-sm font-medium text-gray-600">
                      <div className="w-56 px-4 py-3 border-r">Project / Milestone</div>
                      <div className="w-20 px-2 py-3 border-r text-center">Status</div>
                      <div className="w-16 px-2 py-3 border-r text-center">%</div>
                      <div className="flex-1 px-4 py-3">Timeline ({currentYear})</div>
                    </div>
                    <div className="divide-y">
                      {ganttData.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No projects in selected range</div>
                      ) : ganttData.map(project => (
                        <div key={project.id}>
                          <div className="flex bg-gray-100">
                            <div className="w-56 px-4 py-2 border-r font-medium text-gray-900 truncate">{project.code} - {project.name}</div>
                            <div className="w-20 px-2 py-2 border-r text-center">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-700' : project.status === 'active' ? 'bg-blue-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>{project.status}</span>
                            </div>
                            <div className="w-16 px-2 py-2 border-r text-center text-sm">{project.progress_percentage || 0}%</div>
                            <div className="flex-1 relative py-2 px-2">
                              <div className="absolute h-5 bg-primary-200 rounded" style={getBarPos(project.start_date, project.end_date)}
                                onMouseEnter={e => setGanttTooltip({ x: e.clientX, y: e.clientY, name: project.name, progress: project.progress_percentage })}
                                onMouseLeave={() => setGanttTooltip(null)}>
                                <div className="h-full bg-primary-500 rounded-l" style={{ width: `${project.progress_percentage || 0}%` }}></div>
                              </div>
                            </div>
                          </div>
                          {project.milestones.map(m => {
                            const expanded = expandedMilestones[m.id]
                            return (
                              <div key={m.id}>
                                <div className="flex hover:bg-gray-50">
                                  <div className="w-56 px-4 py-1.5 border-r">
                                    <button onClick={() => setExpandedMilestones(p => ({ ...p, [m.id]: !p[m.id] }))} className="flex items-center gap-1 text-sm">
                                      {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                      <span className={`w-2 h-2 rounded-full ${statusColor(m.status)}`}></span>
                                      <span className="truncate">{m.name}</span>
                                    </button>
                                  </div>
                                  <div className="w-20 px-2 py-1.5 border-r text-center">
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${m.status === 'completed' ? 'bg-green-100 text-green-700' : m.status === 'delayed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status}</span>
                                  </div>
                                  <div className="w-16 px-2 py-1.5 border-r text-center text-xs">{m.completed ? '100%' : '0%'}</div>
                                  <div className="flex-1 relative py-1.5 px-2">
                                    {m.date && <div className={`absolute w-3 h-3 ${statusColor(m.status)} rotate-45`} style={{ left: getBarPos(m.date).left, top: '50%', marginTop: '-6px' }}></div>}
                                  </div>
                                </div>
                                {expanded && m.deliverables.map(d => (
                                  <div key={d.id} className="flex bg-gray-50/50 hover:bg-primary-50">
                                    <div className="w-56 px-4 py-1 border-r pl-10 text-xs text-gray-600 truncate">{d.name}</div>
                                    <div className="w-20 px-2 py-1 border-r text-center">
                                      <span className={`text-xs px-1 py-0.5 rounded ${d.status === 'completed' ? 'bg-green-100 text-green-700' : d.status === 'delayed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.status}</span>
                                    </div>
                                    <div className="w-16 px-2 py-1 border-r text-center text-xs">{d.completed ? '100%' : '0%'}</div>
                                    <div className="flex-1 relative py-1 px-2">
                                      {d.due_date && <div className={`absolute h-2 ${statusColor(d.status)} rounded`} style={{ ...getBarPos(d.due_date), minWidth: '4px' }}></div>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {ganttTooltip && (
                <div className="fixed z-50 bg-gray-900 text-white text-xs rounded px-2 py-1" style={{ left: ganttTooltip.x + 10, top: ganttTooltip.y + 10 }}>
                  {ganttTooltip.name} - {ganttTooltip.progress}%
                </div>
              )}
            </div>
          )}

          {/* Budget Analysis Report */}
          {activeTab === 'budget' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card padding="md" className="bg-gradient-to-br from-primary-400 to-primary-600 text-white">
                  <p className="text-primary-100 text-sm">Total Budget Allocated</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalBudget)}</p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  <p className="text-orange-100 text-sm">Total Spent</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(stats.spentBudget)}</p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <p className="text-green-100 text-sm">Remaining Budget</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(stats.totalBudget - stats.spentBudget)}</p>
                </Card>
              </div>
              <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Project</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Allocated</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Spent</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Remaining</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-600">Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredProjects.map(p => {
                        const allocated = parseFloat(p.budget_allocated) || 0
                        const spent = parseFloat(p.budget_spent) || 0
                        const util = allocated > 0 ? Math.round((spent / allocated) * 100) : 0
                        return (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium">{p.name}</div>
                              <div className="text-xs text-gray-500">{p.code}</div>
                            </td>
                            <td className="px-4 py-3 text-right">{formatCurrency(allocated)}</td>
                            <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(spent)}</td>
                            <td className="px-4 py-3 text-right text-green-600">{formatCurrency(allocated - spent)}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 justify-center">
                                <div className="w-16 h-2 bg-gray-100 rounded-full">
                                  <div
                                    className={`h-full rounded-full ${
                                      util > 90 ? 'bg-red-500' : util > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(util, 100)}%` }}
                                  ></div>
                                </div>
                                <Badge
                                  variant={util > 90 ? 'error' : util > 70 ? 'warning' : 'success'}
                                  size="sm"
                                >
                                  {util}%
                                </Badge>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Team Performance Report */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <Card title="Team Allocation Overview" padding="md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Team Members</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {new Set(filteredProjects.flatMap(p => p.team_members || [])).size || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Active Managers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{managers.length}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Avg Team Size</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {filteredProjects.length > 0
                        ? Math.round(
                            filteredProjects.reduce((sum, p) => sum + (p.team_members?.length || 0), 0) /
                              filteredProjects.length
                          )
                        : 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card title="Projects by Manager" padding="md">
                <div className="space-y-3">
                  {managers.map(manager => {
                    const managerProjects = filteredProjects.filter(p => p.manager_id === manager.id)
                    const completedCount = managerProjects.filter(p => p.status === 'completed').length
                    return (
                      <div key={manager.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">{manager.name}</p>
                          <p className="text-sm text-gray-500">
                            {managerProjects.length} projects • {completedCount} completed
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-100 rounded-full">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{
                                width: `${
                                  managerProjects.length > 0 ? (completedCount / managerProjects.length) * 100 : 0
                                }%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {managerProjects.length > 0
                              ? Math.round((completedCount / managerProjects.length) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  {managers.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No manager data available</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Resource Utilization Report */}
          {activeTab === 'resource' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card padding="md" className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <p className="text-sm text-blue-700">Total Resources</p>
                  <p className="text-3xl font-bold text-blue-900 mt-1">
                    {new Set(filteredProjects.flatMap(p => p.team_members || [])).size || 0}
                  </p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-green-50 to-green-100">
                  <p className="text-sm text-green-700">Allocated</p>
                  <p className="text-3xl font-bold text-green-900 mt-1">
                    {filteredProjects.filter(p => p.status === 'active').reduce((sum, p) => sum + (p.team_members?.length || 0), 0)}
                  </p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <p className="text-sm text-yellow-700">Utilization Rate</p>
                  <p className="text-3xl font-bold text-yellow-900 mt-1">
                    {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                  </p>
                </Card>
                <Card padding="md" className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <p className="text-sm text-purple-700">Avg Project Load</p>
                  <p className="text-3xl font-bold text-purple-900 mt-1">
                    {managers.length > 0 ? Math.round(filteredProjects.length / managers.length) : 0}
                  </p>
                </Card>
              </div>

              <Card title="Resource Distribution by Project" padding="md">
                <div className="space-y-3">
                  {filteredProjects.slice(0, 10).map(p => (
                    <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.code}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <Badge variant="info" size="sm">
                          <Users className="h-3 w-3" />
                          {p.team_members?.length || 0} members
                        </Badge>
                        <Badge
                          variant={
                            p.status === 'active' ? 'success' :
                            p.status === 'completed' ? 'default' : 'warning'
                          }
                          size="sm"
                        >
                          {p.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {filteredProjects.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No projects found</p>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export default ProjectReports
