import React, { useState, useMemo } from 'react'
import { useQuery } from 'react-query'
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Users,
  Banknote,
  Clock,
  AlertTriangle,
  CheckCircle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
// Removed custom Select import - using native HTML select
import Card from '@/components/ui/Card'

const ProjectAnalytics = () => {
  const auth = useAuth(); const hasPermission = auth?.hasPermission || (() => true)
  const [timeRange, setTimeRange] = useState('last-6-months')
  const [department, setDepartment] = useState('all')
  const [metric, setMetric] = useState('all')

  // Mock analytics data
  const mockAnalyticsData = {
    summary: {
      totalProjects: 24,
      activeProjects: 8,
      completedProjects: 12,
      totalBudget: 1250000,
      spentBudget: 875000,
      averageProgress: 67,
      onTimeDelivery: 92,
      teamUtilization: 85,
      projectsThisMonth: 5,
      budgetVariance: -12.5,
      scheduleVariance: 8.3,
      resourceUtilization: 78
    },
    trends: {
      projectCreation: [
        { month: 'Jan', count: 3, budget: 200000 },
        { month: 'Feb', count: 5, budget: 350000 },
        { month: 'Mar', count: 4, budget: 280000 },
        { month: 'Apr', count: 6, budget: 420000 },
        { month: 'May', count: 3, budget: 180000 },
        { month: 'Jun', count: 3, budget: 220000 }
      ],
      completion: [
        { month: 'Jan', completed: 2, onTime: 2, late: 0 },
        { month: 'Feb', completed: 4, onTime: 3, late: 1 },
        { month: 'Mar', completed: 3, onTime: 3, late: 0 },
        { month: 'Apr', completed: 2, onTime: 1, late: 1 },
        { month: 'May', completed: 1, onTime: 1, late: 0 },
        { month: 'Jun', completed: 0, onTime: 0, late: 0 }
      ],
      budgetUtilization: [
        { month: 'Jan', allocated: 200000, spent: 180000, variance: -10 },
        { month: 'Feb', allocated: 250000, spent: 275000, variance: 10 },
        { month: 'Mar', allocated: 300000, spent: 285000, variance: -5 },
        { month: 'Apr', allocated: 280000, spent: 320000, variance: 14.3 },
        { month: 'May', allocated: 220000, spent: 200000, variance: -9.1 },
        { month: 'Jun', allocated: 180000, spent: 165000, variance: -8.3 }
      ]
    },
    distribution: {
      byStatus: [
        { name: 'Active', value: 8, percentage: 33.3, color: '#10B981' },
        { name: 'Completed', value: 12, percentage: 50.0, color: '#3B82F6' },
        { name: 'Planning', value: 2, percentage: 8.3, color: '#6B7280' },
        { name: 'On Hold', value: 2, percentage: 8.3, color: '#F59E0B' }
      ],
      byPriority: [
        { name: 'Critical', value: 3, percentage: 12.5, color: '#EF4444' },
        { name: 'High', value: 8, percentage: 33.3, color: '#F97316' },
        { name: 'Medium', value: 10, percentage: 41.7, color: '#EAB308' },
        { name: 'Low', value: 3, percentage: 12.5, color: '#22C55E' }
      ],
      byDepartment: [
        { name: 'Development', value: 12, percentage: 50.0, color: '#3B82F6' },
        { name: 'Design', value: 6, percentage: 25.0, color: '#8B5CF6' },
        { name: 'Marketing', value: 4, percentage: 16.7, color: '#10B981' },
        { name: 'Sales', value: 2, percentage: 8.3, color: '#F59E0B' }
      ]
    },
    performance: {
      topPerformers: [
        { name: 'Website Redesign', progress: 95, onTime: true, budget: 98 },
        { name: 'Mobile App', progress: 88, onTime: true, budget: 92 },
        { name: 'API Development', progress: 85, onTime: false, budget: 105 }
      ],
      riskProjects: [
        { name: 'Legacy Migration', risk: 'high', reason: 'Budget overrun', variance: 25 },
        { name: 'Database Upgrade', risk: 'medium', reason: 'Schedule delay', variance: 15 },
        { name: 'Security Audit', risk: 'low', reason: 'Resource constraint', variance: 5 }
      ]
    },
    predictions: {
      completionForecast: {
        thisMonth: 3,
        nextMonth: 5,
        confidence: 85
      },
      budgetForecast: {
        projected: 1400000,
        variance: 12,
        confidence: 78
      },
      resourceNeeds: {
        developers: 12,
        designers: 6,
        managers: 4
      }
    }
  }

  // Fetch real projects data
  const { data: projects, isLoading, refetch } = useQuery(
    ['projects-analytics', { timeRange, department, metric }],
    () => projectService.getProjects({ 
      limit: 100, // Get all projects for analytics
      sortBy: 'created_at',
      sortOrder: 'DESC'
    }),
    {
      select: (response) => {
        // console.log('Analytics projects API response:', response)
        return response?.data?.data?.projects || []
      },
      retry: false,
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
    }
  )

  // Fetch departments for filtering
  const { data: departments } = useQuery(
    'departments',
    () => projectService.getDepartments(),
    {
      select: (response) => response?.data?.data?.departments || [],
      retry: false,
      staleTime: 10 * 60 * 1000
    }
  )

  // Generate analytics data from real projects
  const analyticsData = useMemo(() => {
    if (!projects) return mockAnalyticsData
    
    // Apply filters
    let filteredProjects = projects
    
    // Filter by department
    if (department !== 'all') {
      filteredProjects = filteredProjects.filter(p => p.department_id === parseInt(department))
    }
    
    // Filter by time range
    const now = new Date()
    if (timeRange !== 'all-time') {
      const daysMap = {
        'last-30-days': 30,
        'last-3-months': 90,
        'last-6-months': 180,
        'last-year': 365
      }
      
      const days = daysMap[timeRange]
      if (days) {
        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
        filteredProjects = filteredProjects.filter(p => {
          const createdDate = new Date(p.created_at)
          return createdDate >= cutoffDate
        })
      }
    }
    
    // Calculate summary metrics
    const totalProjects = filteredProjects.length
    const activeProjects = filteredProjects.filter(p => p.status === 'active').length
    const completedProjects = filteredProjects.filter(p => p.status === 'completed').length
    const planningProjects = filteredProjects.filter(p => p.status === 'planning').length
    const onHoldProjects = filteredProjects.filter(p => p.status === 'on_hold').length
    const cancelledProjects = filteredProjects.filter(p => p.status === 'cancelled').length
    
    const totalBudget = filteredProjects.reduce((sum, p) => sum + (parseFloat(p.budget_allocated) || 0), 0)
    const spentBudget = filteredProjects.reduce((sum, p) => sum + (parseFloat(p.budget_spent) || 0), 0)
    const averageProgress = totalProjects > 0 ? 
      filteredProjects.reduce((sum, p) => sum + (parseFloat(p.progress_percentage) || 0), 0) / totalProjects : 0
    
    // Calculate overdue projects
    const overdueProjects = filteredProjects.filter(p => {
      if (p.status === 'completed') return false
      const endDate = new Date(p.end_date)
      return endDate < now
    }).length
    
    // Calculate performance metrics
    const budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0
    const budgetVariance = totalBudget > 0 ? ((spentBudget - totalBudget) / totalBudget) * 100 : 0
    const onTimeDelivery = completedProjects > 0 ? 
      ((completedProjects - overdueProjects) / completedProjects) * 100 : 100
    
    // Calculate monthly trends (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthProjects = filteredProjects.filter(p => {
        const createdDate = new Date(p.created_at)
        return createdDate >= monthStart && createdDate <= monthEnd
      })
      
      const monthCompleted = filteredProjects.filter(p => {
        if (p.status !== 'completed') return false
        const updatedDate = new Date(p.updated_at)
        return updatedDate >= monthStart && updatedDate <= monthEnd
      })
      
      const monthBudget = monthProjects.reduce((sum, p) => sum + (parseFloat(p.budget_allocated) || 0), 0)
      const monthSpent = monthProjects.reduce((sum, p) => sum + (parseFloat(p.budget_spent) || 0), 0)
      
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        count: monthProjects.length,
        budget: monthBudget,
        completed: monthCompleted.length,
        onTime: monthCompleted.filter(p => {
          const endDate = new Date(p.end_date)
          const updatedDate = new Date(p.updated_at)
          return updatedDate <= endDate
        }).length,
        late: monthCompleted.filter(p => {
          const endDate = new Date(p.end_date)
          const updatedDate = new Date(p.updated_at)
          return updatedDate > endDate
        }).length,
        allocated: monthBudget,
        spent: monthSpent,
        variance: monthBudget > 0 ? ((monthSpent - monthBudget) / monthBudget) * 100 : 0
      })
    }
    
    // Calculate distributions
    const statusDistribution = [
      { name: 'Active', value: activeProjects, percentage: totalProjects > 0 ? (activeProjects / totalProjects) * 100 : 0, color: '#10B981' },
      { name: 'Completed', value: completedProjects, percentage: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0, color: '#3B82F6' },
      { name: 'Planning', value: planningProjects, percentage: totalProjects > 0 ? (planningProjects / totalProjects) * 100 : 0, color: '#6B7280' },
      { name: 'On Hold', value: onHoldProjects, percentage: totalProjects > 0 ? (onHoldProjects / totalProjects) * 100 : 0, color: '#F59E0B' },
      { name: 'Cancelled', value: cancelledProjects, percentage: totalProjects > 0 ? (cancelledProjects / totalProjects) * 100 : 0, color: '#EF4444' }
    ].filter(item => item.value > 0)
    
    // Calculate priority distribution
    const priorityCounts = {
      critical: filteredProjects.filter(p => p.priority === 'critical').length,
      high: filteredProjects.filter(p => p.priority === 'high').length,
      medium: filteredProjects.filter(p => p.priority === 'medium').length,
      low: filteredProjects.filter(p => p.priority === 'low').length
    }
    
    const priorityDistribution = [
      { name: 'Critical', value: priorityCounts.critical, percentage: totalProjects > 0 ? (priorityCounts.critical / totalProjects) * 100 : 0, color: '#EF4444' },
      { name: 'High', value: priorityCounts.high, percentage: totalProjects > 0 ? (priorityCounts.high / totalProjects) * 100 : 0, color: '#F97316' },
      { name: 'Medium', value: priorityCounts.medium, percentage: totalProjects > 0 ? (priorityCounts.medium / totalProjects) * 100 : 0, color: '#EAB308' },
      { name: 'Low', value: priorityCounts.low, percentage: totalProjects > 0 ? (priorityCounts.low / totalProjects) * 100 : 0, color: '#22C55E' }
    ].filter(item => item.value > 0)
    
    // Calculate department distribution
    const departmentCounts = {}
    filteredProjects.forEach(p => {
      const deptName = p.Department?.name || 'Unassigned'
      departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1
    })
    
    const departmentColors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280']
    const departmentDistribution = Object.entries(departmentCounts).map(([name, value], index) => ({
      name,
      value,
      percentage: totalProjects > 0 ? (value / totalProjects) * 100 : 0,
      color: departmentColors[index % departmentColors.length]
    }))
    
    // Get top performing projects
    const topPerformers = filteredProjects
      .filter(p => p.status === 'active' || p.status === 'completed')
      .sort((a, b) => (parseFloat(b.progress_percentage) || 0) - (parseFloat(a.progress_percentage) || 0))
      .slice(0, 3)
      .map(project => ({
        name: project.name,
        progress: parseFloat(project.progress_percentage) || 0,
        onTime: new Date(project.end_date) >= now || project.status === 'completed',
        budget: project.budget_allocated > 0 ? 
          ((parseFloat(project.budget_spent) || 0) / parseFloat(project.budget_allocated)) * 100 : 0
      }))
    
    return {
      summary: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalBudget,
        spentBudget,
        averageProgress: Math.round(averageProgress),
        onTimeDelivery: Math.round(onTimeDelivery),
        teamUtilization: 85, // Mock value - would need team data
        projectsThisMonth: monthlyData[5]?.count || 0,
        budgetVariance: Math.round(budgetVariance * 10) / 10,
        scheduleVariance: 8.3, // Mock value - would need detailed schedule data
        resourceUtilization: 78 // Mock value - would need resource data
      },
      trends: {
        projectCreation: monthlyData,
        completion: monthlyData,
        budgetUtilization: monthlyData
      },
      distribution: {
        byStatus: statusDistribution,
        byPriority: priorityDistribution,
        byDepartment: departmentDistribution
      },
      performance: {
        topPerformers,
        riskProjects: [] // Would need risk assessment logic
      },
      predictions: {
        completionForecast: {
          thisMonth: Math.round(activeProjects * 0.3),
          nextMonth: Math.round(activeProjects * 0.5),
          confidence: 85
        },
        budgetForecast: {
          projected: totalBudget * 1.12,
          variance: 12,
          confidence: 78
        },
        resourceNeeds: {
          developers: Math.round(activeProjects * 2.5),
          designers: Math.round(activeProjects * 1.5),
          managers: Math.round(activeProjects * 0.5)
        }
      }
    }
  }, [projects, timeRange, department, metric])

  // Debug current state
  console.log('ProjectAnalytics - Current state:', {
    timeRange,
    department,
    metric,
    projectsCount: projects?.length || 0,
    departmentsCount: departments?.length || 0,
    analyticsData: analyticsData?.summary
  })

  const timeRangeOptions = [
    { value: 'last-30-days', label: 'Last 30 Days' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'last-6-months', label: 'Last 6 Months' },
    { value: 'last-year', label: 'Last Year' },
    { value: 'all-time', label: 'All Time' }
  ]

  const departmentOptions = [
    { value: 'all', label: 'All Departments' },
    ...(departments?.map(dept => ({
      value: dept.id.toString(),
      label: dept.name
    })) || [])
  ]

  const metricOptions = [
    { value: 'all', label: 'All Metrics' },
    { value: 'budget', label: 'Budget Analysis' },
    { value: 'timeline', label: 'Timeline Analysis' },
    { value: 'resource', label: 'Resource Analysis' },
    { value: 'performance', label: 'Performance Analysis' }
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const renderSummaryCards = () => {
    const { summary } = analyticsData
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+{summary.projectsThisMonth} this month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round((summary.spentBudget / summary.totalBudget) * 100)}%
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Banknote className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {summary.budgetVariance < 0 ? (
              <>
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-600">{formatPercentage(summary.budgetVariance)} under budget</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-600">{formatPercentage(summary.budgetVariance)} over budget</span>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">On-Time Delivery</p>
              <p className="text-2xl font-bold text-gray-900">{summary.onTimeDelivery}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">{formatPercentage(summary.scheduleVariance)} ahead of schedule</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Team Utilization</p>
              <p className="text-2xl font-bold text-gray-900">{summary.teamUtilization}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="h-4 w-4 text-primary mr-1" />
            <span className="text-primary">{summary.resourceUtilization}% resource utilization</span>
          </div>
        </Card>
      </div>
    )
  }

  const renderTrendCharts = () => {
    const { trends } = analyticsData
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Project Creation Trend</h3>
            <LineChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {trends.projectCreation.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">{item.count} projects</span>
                  <span className="text-sm text-gray-500">{formatCurrency(item.budget)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Budget Variance Trend</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {trends.budgetUtilization.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">{formatCurrency(item.spent)}</span>
                  <span className={`text-sm ${item.variance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatPercentage(item.variance)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  const renderDistributionCharts = () => {
    const { distribution } = analyticsData
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">By Status</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {distribution.byStatus.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.value}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">By Priority</h3>
            <AlertTriangle className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {distribution.byPriority.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.value}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">By Department</h3>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {distribution.byDepartment.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{item.value}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    )
  }

  const renderPerformanceAnalysis = () => {
    const { performance, predictions } = analyticsData
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Projects</h3>
          <div className="space-y-4">
            {performance.topPerformers.map((project, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{project.name}</h4>
                  <div className="flex items-center space-x-2">
                    {project.onTime ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Progress</span>
                    <div className="font-medium">{project.progress}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget</span>
                    <div className={`font-medium ${project.budget > 100 ? 'text-red-600' : 'text-green-600'}`}>
                      {project.budget}%
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Status</span>
                    <div className="font-medium">{project.onTime ? 'On Time' : 'Delayed'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Predictive Analytics</h3>
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Completion Forecast</h4>
              <div className="text-sm text-gray-600 mb-2">
                Expected completions: {predictions.completionForecast.thisMonth} this month, 
                {predictions.completionForecast.nextMonth} next month
              </div>
              <div className="text-xs text-gray-500">
                Confidence: {predictions.completionForecast.confidence}%
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Budget Forecast</h4>
              <div className="text-sm text-gray-600 mb-2">
                Projected total: {formatCurrency(predictions.budgetForecast.projected)}
              </div>
              <div className="text-xs text-gray-500">
                Variance: {formatPercentage(predictions.budgetForecast.variance)} | 
                Confidence: {predictions.budgetForecast.confidence}%
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Resource Needs</h4>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Developers</span>
                  <div className="font-medium">{predictions.resourceNeeds.developers}</div>
                </div>
                <div>
                  <span className="text-gray-600">Designers</span>
                  <div className="font-medium">{predictions.resourceNeeds.designers}</div>
                </div>
                <div>
                  <span className="text-gray-600">Managers</span>
                  <div className="font-medium">{predictions.resourceNeeds.managers}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Project Analytics</h1>
          <p className="text-gray-600">Advanced insights and predictive analytics for project performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
  value={timeRange} 
  onChange={(e) => setTimeRange}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  {timeRangeOptions.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))}
</select>
          <select 
  value={department} 
  onChange={(e) => setDepartment}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  {departmentOptions.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))}
</select>
          <select 
  value={metric} 
  onChange={(e) => setMetric}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  {metricOptions.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))}
</select>
        </div>
      </Card>

      {/* Summary Cards */}
      {renderSummaryCards()}

      {/* Trend Analysis */}
      {renderTrendCharts()}

      {/* Distribution Analysis */}
      {renderDistributionCharts()}

      {/* Performance & Predictions */}
      {renderPerformanceAnalysis()}
    </div>
  )
}

export default ProjectAnalytics