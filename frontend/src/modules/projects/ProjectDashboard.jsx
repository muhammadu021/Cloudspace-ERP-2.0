import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import {
  Calendar,
  BarChart2,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Users,
  FolderKanban,
  Target,
  TrendingUp,
  Activity,
  ChevronRight,
  Plus,
  Play,
  Flag,
  Eye,
  Search,
  Bell,
  Filter,
  ArrowUpRight,
  Layers
} from 'lucide-react'
import { projectService } from '@/services/projectService'

const ProjectDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const { data: dashboardData, isLoading } = useQuery(
    ['project-dashboard'],
    () => projectService.getDashboardData({}),
    { select: (r) => r?.data?.data, retry: false, staleTime: 300000 }
  )

  const { data: recentProjects } = useQuery(
    'recent-projects',
    () => projectService.getProjects({ limit: 6, sortBy: 'updated_at', sortOrder: 'DESC' }),
    { select: (r) => r?.data?.data?.projects || [], retry: false, staleTime: 300000 }
  )

  const { data: allTasks } = useQuery(
    'all-tasks',
    () => projectService.getTasks({ limit: 100 }),
    { select: (r) => r?.data?.data?.tasks || r?.data?.tasks || [], retry: false, staleTime: 300000 }
  )

  const stats = dashboardData?.stats || {}
  const projects = recentProjects || []
  const tasks = allTasks || []

  // Calculate task stats from real data
  const taskStats = {
    open: tasks.filter(t => t.status === 'todo' || t.status === 'open').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    completed: tasks.filter(t => t.status === 'completed' || t.status === 'done').length,
    overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length
  }
  const totalTasks = taskStats.open + taskStats.inProgress + taskStats.review + taskStats.completed

  // Get recent tasks for display
  const recentTasks = tasks.slice(0, 5).map(task => ({
    id: task.id,
    title: task.title,
    project: task.Project?.name || task.project_name || 'Unknown Project',
    status: task.status,
    priority: task.priority || 'medium',
    due: task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date',
    assignee: task.AssignedTo?.User ? `${task.AssignedTo.User.first_name?.[0] || ''}${task.AssignedTo.User.last_name?.[0] || ''}` : 'UA'
  }))

  // Get milestones from projects
  const upcomingMilestones = projects
    .filter(p => p.end_date && new Date(p.end_date) > new Date())
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      title: `${p.name} Deadline`,
      project: p.name,
      due: new Date(p.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      progress: p.progress_percentage || 0,
      status: p.progress_percentage >= 80 ? 'on_track' : 'at_risk'
    }))

  const getStatusIcon = (status) => ({
    open: <Circle className="h-3.5 w-3.5 text-slate-400" />,
    todo: <Circle className="h-3.5 w-3.5 text-slate-400" />,
    in_progress: <Play className="h-3.5 w-3.5 text-primary fill-blue-500" />,
    review: <Eye className="h-3.5 w-3.5 text-amber-500" />,
    completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
    done: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  }[status] || <Circle className="h-3.5 w-3.5 text-slate-400" />)

  const getPriorityStyle = (p) => ({
    low: 'text-slate-500 bg-slate-50 ring-slate-200',
    medium: 'text-primary bg-primary-50 ring-primary-200',
    high: 'text-amber-600 bg-amber-50 ring-amber-200',
    critical: 'text-red-600 bg-red-50 ring-red-200'
  }[p] || 'text-slate-500 bg-slate-50')

  const getProjectGradient = (i) => [
    'from-primary-400 to-primary-600',
    'from-emerald-500 to-emerald-600',
    'from-violet-500 to-violet-600',
    'from-amber-500 to-amber-600',
    'from-pink-500 to-pink-600',
    'from-cyan-500 to-cyan-600'
  ][i % 6]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-slate-200 rounded-lg w-64"></div>
          <div className="grid grid-cols-4 gap-6">{[1,2,3,4].map(i => <div key={i} className="h-28 bg-slate-200 rounded-xl"></div>)}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation Buttons */}
      <div className="bg-white border-b border-slate-200 px-8 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/projects"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Dashboard
          </Link>
          <Link
            to="/projects/kanban"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Kanban Board
          </Link>
          <Link
            to="/projects/calendar"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Calendar className="h-3.5 w-3.5" />
            Calendar View
          </Link>
          <Link
            to="/projects/templates"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            Templates
          </Link>
          <Link
            to="/projects/reports"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Reports
          </Link>
          <Link
            to="/projects/analytics"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Analytics
          </Link>
          <Link
            to="/projects/archive"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Archived
          </Link>
          <Link
            to="/projects/list"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            List View
          </Link>
          <Link
            to="/projects/new"
            className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      </header>

      <main className="p-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Total Projects</p>
                <p className="text-3xl font-semibold text-slate-900 mt-1">{stats.totalProjects || projects.length}</p>
                <p className="text-sm mt-1 text-slate-400">{stats.activeProjects || projects.filter(p => p.status === 'active').length} active</p>
              </div>
              <div className="p-3 rounded-xl bg-primary-50">
                <FolderKanban className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Open Tasks</p>
                <p className="text-3xl font-semibold text-slate-900 mt-1">{taskStats.open + taskStats.inProgress}</p>
                <p className={`text-sm mt-1 ${taskStats.overdue > 0 ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                  {taskStats.overdue} overdue
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Milestones</p>
                <p className="text-3xl font-semibold text-slate-900 mt-1">{upcomingMilestones.length}</p>
                <p className="text-sm mt-1 text-slate-400">{stats.completedProjects || 0} completed</p>
              </div>
              <div className="p-3 rounded-xl bg-violet-50">
                <Target className="h-6 w-6 text-violet-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg hover:shadow-slate-200/50 transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">At Risk</p>
                <p className="text-3xl font-semibold text-red-600 mt-1">{stats.overdueProjects || 0}</p>
                <p className="text-sm mt-1 text-red-500 font-medium">Need attention</p>
              </div>
              <div className="p-3 rounded-xl bg-red-50">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Tasks Section */}
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-slate-900">My Tasks</h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">{totalTasks}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                    <Filter className="h-4 w-4" />
                  </button>
                  <Link to="/projects/tasks" className="text-sm text-primary hover:text-primary-700 font-medium flex items-center gap-1">
                    View all <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {recentTasks.length > 0 ? recentTasks.map((task) => (
                  <div key={task.id} className="px-5 py-3.5 hover:bg-slate-50 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <button className="flex-shrink-0">{getStatusIcon(task.status)}</button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{task.project}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ring-1 ring-inset ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="text-xs text-slate-400 w-16">{task.due}</span>
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] font-medium text-white">
                        {task.assignee}
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="px-5 py-8 text-center text-slate-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p>No tasks found</p>
                  </div>
                )}
              </div>
            </section>

            {/* Projects Grid */}
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Active Projects</h2>
                <Link to="/projects" className="text-sm text-primary hover:text-primary-700 font-medium flex items-center gap-1">
                  View all <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                {projects.length > 0 ? projects.slice(0, 4).map((project, i) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="group p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getProjectGradient(i)} flex items-center justify-center text-white font-semibold shadow-sm`}>
                        {project.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">{project.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{project.code}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-semibold text-slate-700">{project.progress_percentage || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${getProjectGradient(i)} rounded-full transition-all`} style={{ width: `${project.progress_percentage || 0}%` }}></div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Layers className="h-3.5 w-3.5" /> {project.task_count || 0} tasks</span>
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {project.member_count || 0}</span>
                    </div>
                  </Link>
                )) : (
                  <div className="col-span-2 py-8 text-center text-slate-500">
                    <FolderKanban className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p>No projects found</p>
                    <Link to="/projects/new" className="text-primary text-sm mt-2 inline-block">Create your first project</Link>
                  </div>
                )}
              </div>
            </section>

            {/* Milestones */}
            {upcomingMilestones.length > 0 && (
              <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h2>
                  <Link to="/projects" className="text-sm text-primary hover:text-primary-700 font-medium flex items-center gap-1">
                    View all <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {upcomingMilestones.map((m) => (
                    <div key={m.id} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${m.status === 'on_track' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                          <Flag className={`h-4 w-4 ${m.status === 'on_track' ? 'text-emerald-600' : 'text-amber-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{m.title}</p>
                          <p className="text-xs text-slate-500">{m.project}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-medium text-slate-600">{m.due}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${m.status === 'on_track' ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${m.progress}%` }}></div>
                            </div>
                            <span className="text-xs font-medium text-slate-600">{m.progress}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Task Distribution */}
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Task Distribution</h2>
              </div>
              <div className="p-5">
                {totalTasks > 0 ? (
                  <>
                    <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-4">
                      <div className="bg-slate-300" style={{ width: `${(taskStats.open / totalTasks) * 100}%` }}></div>
                      <div className="bg-primary-500" style={{ width: `${(taskStats.inProgress / totalTasks) * 100}%` }}></div>
                      <div className="bg-amber-500" style={{ width: `${(taskStats.review / totalTasks) * 100}%` }}></div>
                      <div className="bg-emerald-500" style={{ width: `${(taskStats.completed / totalTasks) * 100}%` }}></div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Open', count: taskStats.open, color: 'bg-slate-300' },
                        { label: 'In Progress', count: taskStats.inProgress, color: 'bg-primary-500' },
                        { label: 'In Review', count: taskStats.review, color: 'bg-amber-500' },
                        { label: 'Completed', count: taskStats.completed, color: 'bg-emerald-500' }
                      ].map((item) => (
                        <div key={item.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                            <span className="text-sm text-slate-600">{item.label}</span>
                          </div>
                          <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-slate-500 py-4">No task data</p>
                )}
              </div>
            </section>

            {/* Activity */}
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Activity</h2>
                <Activity className="h-4 w-4 text-slate-400" />
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                {projects.slice(0, 4).map((p, i) => (
                  <div key={p.id} className="px-5 py-3.5 hover:bg-slate-50">
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getProjectGradient(i)} flex items-center justify-center text-[10px] font-medium text-white flex-shrink-0`}>
                        {p.name?.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-900">{p.name}</span> updated
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{p.status} · {p.progress_percentage || 0}% complete</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Weekly Summary */}
            <section className="bg-gradient-to-br from-primary to-primary-700 rounded-xl p-5 text-white">
              <h2 className="text-lg font-semibold mb-4">Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-2xl font-bold">{taskStats.completed}</p>
                  <p className="text-xs text-primary-100">Completed</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-2xl font-bold">{taskStats.inProgress}</p>
                  <p className="text-xs text-primary-100">In Progress</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-2xl font-bold">{projects.length}</p>
                  <p className="text-xs text-primary-100">Projects</p>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-2xl font-bold">{stats.averageProgress?.toFixed(0) || 0}%</p>
                  <p className="text-xs text-primary-100">Avg Progress</p>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
              </div>
              <div className="p-2">
                {[
                  { label: 'Gantt Chart', icon: BarChart2, to: '/projects/timeline' },
                  { label: 'Calendar View', icon: Calendar, to: '/projects/calendar' },
                  { label: 'Team Workload', icon: Users, to: '/projects/team' },
                  { label: 'Analytics', icon: TrendingUp, to: '/projects/analytics' }
                ].map((link) => (
                  <Link key={link.label} to={link.to} className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg group transition-colors">
                    <link.icon className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                    <span className="group-hover:text-slate-900">{link.label}</span>
                    <ChevronRight className="h-4 w-4 ml-auto text-slate-300 group-hover:text-slate-400" />
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProjectDashboard
