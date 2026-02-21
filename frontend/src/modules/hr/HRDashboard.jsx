import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import {
  Users,
  UserPlus,
  Calendar,
  Clock,
  CreditCard,
  Award,
  GraduationCap,
  UserCheck,
  FileText,
  PieChart,
  Building2,
  ClipboardList,
  Plane,
  ArrowRight,
  CheckSquare,
  ListTodo,
  MessageSquare,
  Eye,
  Star,
  AlertCircle,
  TrendingUp
} from 'lucide-react'
import { hrService } from '@/services/hrService'
import { selectApiData } from '@/services/api'
import {
  getAnonymousReviews,
  getAnonymousReviewStats,
  getPerformanceAppraisals,
  getPerformanceAppraisalStats
} from '@/services/reviewService'
import { usePageTitle } from '@/hooks/usePageTitle'

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [feedbackData, setFeedbackData] = useState({
    anonymousReviews: [],
    performanceAppraisals: [],
    anonymousStats: null,
    appraisalStats: null,
    loading: false,
    error: null
  })
  const [selectedReview, setSelectedReview] = useState(null)
  const [selectedAppraisal, setSelectedAppraisal] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showAppraisalModal, setShowAppraisalModal] = useState(false)

  // Fetch feedback data when tab changes
  useEffect(() => {
    if (activeTab === 'anonymous' || activeTab === 'appraisals') {
      fetchFeedbackData()
    }
  }, [activeTab])

  const fetchFeedbackData = async () => {
    setFeedbackData(prev => ({ ...prev, loading: true, error: null }))
    try {
      const [anonymousRes, appraisalsRes, anonymousStatsRes, appraisalStatsRes] = await Promise.all([
        getAnonymousReviews({ limit: 50 }),
        getPerformanceAppraisals({ limit: 50 }),
        getAnonymousReviewStats(),
        getPerformanceAppraisalStats()
      ])

      setFeedbackData({
        anonymousReviews: anonymousRes.data?.reviews || [],
        performanceAppraisals: appraisalsRes.data?.appraisals || [],
        anonymousStats: anonymousStatsRes.data || null,
        appraisalStats: appraisalStatsRes.data || null,
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching feedback data:', error)
      setFeedbackData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load feedback data'
      }))
    }
  }

  // Fetch employees data
  const { data: employeesData, isLoading: employeesLoading, error: employeesError } = useQuery(
    'hr-employees',
    () => hrService.getEmployees({ limit: 1000 }),
    {
      select: (response) => {
        // console.log('HR Dashboard - Employees API response:', response)
        return selectApiData(response)?.employees || []
      },
      onError: (error) => {
        console.log('Employees API error:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch departments data
  const { data: departmentsData, isLoading: departmentsLoading, error: departmentsError } = useQuery(
    'hr-departments',
    () => hrService.getDepartments(),
    {
      select: (response) => {
        // console.log('HR Dashboard - Departments API response:', response)
        return selectApiData(response)?.departments || []
      },
      onError: (error) => {
        console.log('Departments API error:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Process real data for dashboard stats
  const processHRStats = () => {
    if (!employeesData) {
      return {
        totalEmployees: 0,
        newHires: 0,
        onLeave: 0,
        avgHours: 0,
        departmentStats: []
      }
    }

    const totalEmployees = employeesData.length
    const activeEmployees = employeesData.filter(emp => emp.employment_status === 'active')

    // Calculate new hires (hired in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newHires = employeesData.filter(emp => {
      const hireDate = new Date(emp.hire_date)
      return hireDate >= thirtyDaysAgo
    }).length

    // Mock data for leave and hours (would come from attendance/leave APIs)
    const onLeave = 0 // ~8% on leave
    const avgHours = 0 // Mock average hours

    // Department statistics
    const departmentCounts = {}
    employeesData.forEach(emp => {
      const deptName = emp.Department?.name || 'Unknown'
      departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1
    })

    const departmentStats = Object.entries(departmentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    return {
      totalEmployees,
      newHires,
      onLeave,
      avgHours,
      departmentStats,
      activeEmployees: activeEmployees.length
    }
  }

  const hrStats = processHRStats()
  const isLoading = employeesLoading || departmentsLoading
  const hasError = employeesError || departmentsError

  // Debug current data
  console.log('HR Dashboard - Current data:', {
    employeesData: employeesData?.slice(0, 2),
    departmentsData: departmentsData?.slice(0, 3),
    hrStats,
    isLoading,
    hasError: hasError?.message
  })

  // Set page title in the top nav bar
  usePageTitle('Human Resources')

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {hasError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <span className="inline-flex items-center text-sm text-yellow-800">
            Demo Mode - API Unavailable
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'overview'
                ? 'bg-primary-50 text-primary-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <PieChart className="h-5 w-5" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('anonymous')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'anonymous'
                ? 'bg-primary-50 text-primary-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Anonymous Reviews</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('appraisals')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'appraisals'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ClipboardList className="h-5 w-5" />
              <span>Performance Appraisals</span>
            </div>
          </button>
        </div>
      </div>

      {/* Overview Tab Content */}
      {activeTab === 'overview' && (
        <>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Employees</p>
                  <p className="text-2xl font-semibold text-gray-900">{hrStats.totalEmployees}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserPlus className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">New Hires</p>
                  <p className="text-2xl font-semibold text-gray-900">{hrStats.newHires}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Calendar className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">On Leave</p>
                  <p className="text-2xl font-semibold text-gray-900">{hrStats.onLeave}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Hours</p>
                  <p className="text-2xl font-semibold text-gray-900">{hrStats.avgHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Department Overview */}
          {hrStats.departmentStats.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {hrStats.departmentStats.map((dept, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{dept.name}</p>
                        <p className="text-xl font-semibold text-gray-900">{dept.count} employees</p>
                      </div>
                      <Building2 className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HR Features Grid */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">HR Management Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Employee Management */}
              <Link to="/hr/employees" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <UserPlus className="h-8 w-8 text-primary" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Management</h3>
                <p className="text-gray-600 text-sm">Manage employee profiles, roles, and organizational structure</p>
              </Link>

              {/* Department Manager */}
              <Link to="/hr/departments" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="h-8 w-8 text-slate-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-slate-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Department Manager</h3>
                <p className="text-gray-600 text-sm">Create, edit, and manage organizational departments and hierarchy</p>
              </Link>

              {/* User Management */}
              <Link to="/hr/user-management" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <Users className="h-8 w-8 text-indigo-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
                <p className="text-gray-600 text-sm">Manage system users and assign sidebar access permissions</p>
              </Link>

              {/* Attendance Tracking */}
              <Link to="/hr/attendance" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Attendance Tracking</h3>
                <p className="text-gray-600 text-sm">Monitor employee attendance, working hours, and time management</p>
              </Link>

              {/* Leave Management */}
              <Link to="/hr/leaves" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <Plane className="h-8 w-8 text-yellow-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Leave Management</h3>
                <p className="text-gray-600 text-sm">Handle leave requests, approvals, and balance tracking</p>
              </Link>

              {/* Payroll Processing */}
              <Link to="/hr/payroll" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <CreditCard className="h-8 w-8 text-purple-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Payroll Processing</h3>
                <p className="text-gray-600 text-sm">Advanced payroll system with automated calculations, tax compliance, and payslip generation</p>
              </Link>

              {/* Performance Reviews */}
              <Link to="/hr/performance" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <Award className="h-8 w-8 text-red-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-red-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Performance Reviews</h3>
                <p className="text-gray-600 text-sm">Conduct evaluations and track employee performance</p>
              </Link>

              {/* Training Management */}
              <Link to="/hr/training" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <GraduationCap className="h-8 w-8 text-indigo-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Training Management</h3>
                <p className="text-gray-600 text-sm">Organize training programs and skill development</p>
              </Link>

              {/* Recruitment */}
              <Link to="/hr/recruitment" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <UserCheck className="h-8 w-8 text-teal-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Recruitment</h3>
                <p className="text-gray-600 text-sm">Manage job postings, applications, and hiring processes</p>
              </Link>

              {/* Policies & Documents */}
              <Link to="/hr/policies" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="h-8 w-8 text-orange-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Policies & Documents</h3>
                <p className="text-gray-600 text-sm">Manage company policies and HR documentation</p>
              </Link>

              {/* Reports & Analytics */}
              <Link to="/hr/reports" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <PieChart className="h-8 w-8 text-pink-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Analytics</h3>
                <p className="text-gray-600 text-sm">Generate insights and reports on HR metrics</p>
              </Link>

              {/* Organizational Chart */}
              <Link to="/hr/org-chart" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <Building2 className="h-8 w-8 text-cyan-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Organizational Chart</h3>
                <p className="text-gray-600 text-sm">Visualize company structure and reporting relationships</p>
              </Link>

              {/* Employee Directory */}
              <Link to="/hr/directory" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <ClipboardList className="h-8 w-8 text-emerald-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Employee Directory</h3>
                <p className="text-gray-600 text-sm">Search and browse employee contact information</p>
              </Link>

              {/* Task Management */}
              <Link to="/hr/tasks" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group">
                <div className="flex items-center justify-between mb-4">
                  <CheckSquare className="h-8 w-8 text-violet-600" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Task Management</h3>
                <p className="text-gray-600 text-sm">Assign and monitor tasks for employees with progress tracking</p>
              </Link>

              {/* Expense Approval */}
              <Link to="/hr/expenses" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow group border-2 border-primary-200">
                <div className="flex items-center justify-between mb-4">
                  <CreditCard className="h-8 w-8 text-primary" />
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Expense Approval</h3>
                <p className="text-gray-600 text-sm">Review and approve employee expense claims and reimbursements</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    3 Pending
                  </span>
                  <span className="text-xs text-gray-500">HR Approval Required</span>
                </div>
              </Link>


            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/hr/employees" className="bg-primary-50 text-primary-700 py-3 px-4 rounded-lg hover:bg-blue-100 text-center transition-colors">
                Add New Employee
              </Link>
              <Link to="/hr/leaves" className="bg-green-50 text-green-700 py-3 px-4 rounded-lg hover:bg-green-100 text-center transition-colors">
                Process Leave Request
              </Link>
              <Link to="/hr/payroll" className="bg-purple-50 text-purple-700 py-3 px-4 rounded-lg hover:bg-purple-100 text-center transition-colors">
                Run Payroll
              </Link>
              <Link to="/hr/reports" className="bg-orange-50 text-orange-700 py-3 px-4 rounded-lg hover:bg-orange-100 text-center transition-colors">
                Generate Report
              </Link>
              <Link to="/hr/tasks" className="bg-violet-50 text-violet-700 py-3 px-4 rounded-lg hover:bg-violet-100 text-center transition-colors">
                Assign Task
              </Link>
              <Link to="/hr/expenses" className="bg-primary-50 text-primary-700 py-3 px-4 rounded-lg hover:bg-blue-100 text-center transition-colors">
                Approve Expenses
              </Link>
            </div>
          </div>
        </>
      )}

      {/* Anonymous Reviews Tab Content */}
      {activeTab === 'anonymous' && (
        <>
          {feedbackData.loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading feedback data...</span>
            </div>
          ) : feedbackData.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{feedbackData.error}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Anonymous Reviews Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Anonymous Reviews</p>
                      <p className="text-3xl font-bold text-gray-900">{feedbackData.anonymousReviews.length}</p>
                      <p className="text-sm text-primary mt-1">Total submissions</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Review Year</p>
                      <p className="text-3xl font-bold text-gray-900">{new Date().getFullYear()}</p>
                      <p className="text-sm text-primary mt-1">Current year</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>

              {/* Anonymous Reviews Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Anonymous Reviews</h3>
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>

                {feedbackData.anonymousReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No anonymous reviews submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbackData.anonymousReviews.slice(0, 10).map((review) => (
                      <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <MessageSquare className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">Anonymous Feedback</p>
                              <p className="text-xs text-gray-500">
                                {new Date(review.submission_date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Year {review.review_year}
                          </span>
                        </div>

                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="font-medium text-gray-700 mb-1">General Feedback:</p>
                            <p className="text-gray-600 line-clamp-2">{review.company_feedback}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="font-medium text-gray-700 mb-1">Top Performers:</p>
                              <ul className="text-gray-600 space-y-1">
                                <li className="flex items-center gap-1">
                                  <Award className="h-3 w-3 text-yellow-500" />
                                  {review.best1_name}
                                </li>
                                <li className="flex items-center gap-1">
                                  <Award className="h-3 w-3 text-gray-400" />
                                  {review.best2_name}
                                </li>
                                <li className="flex items-center gap-1">
                                  <Award className="h-3 w-3 text-orange-400" />
                                  {review.best3_name}
                                </li>
                              </ul>
                            </div>

                            <div>
                              <p className="font-medium text-gray-700 mb-1">Colleague Feedback:</p>
                              <ul className="text-gray-600 space-y-1">
                                <li>• {review.colleague1_name}</li>
                                <li>• {review.colleague2_name}</li>
                                <li>• {review.colleague3_name}</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedReview(review)
                            setShowReviewModal(true)
                          }}
                          className="mt-3 text-sm text-primary hover:text-primary-700 font-medium flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Full Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Performance Appraisals Tab Content */}
      {activeTab === 'appraisals' && (
        <>
          {feedbackData.loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-gray-600">Loading appraisal data...</span>
            </div>
          ) : feedbackData.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{feedbackData.error}</span>
              </div>
            </div>
          ) : (
            <>
              {/* Performance Appraisals Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Appraisals</p>
                      <p className="text-3xl font-bold text-gray-900">{feedbackData.performanceAppraisals.length}</p>
                      <p className="text-sm text-green-600 mt-1">Total submissions</p>
                    </div>
                    <ClipboardList className="h-8 w-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Recommendation</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {feedbackData.appraisalStats?.averageScores?.avg_recommend
                          ? parseFloat(feedbackData.appraisalStats.averageScores.avg_recommend).toFixed(1)
                          : 'N/A'}
                      </p>
                      <p className="text-sm text-purple-600 mt-1">Out of 5.0</p>
                    </div>
                    <Star className="h-8 w-8 text-purple-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Recognition</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {feedbackData.appraisalStats?.averageScores?.avg_recognition
                          ? parseFloat(feedbackData.appraisalStats.averageScores.avg_recognition).toFixed(1)
                          : 'N/A'}
                      </p>
                      <p className="text-sm text-orange-600 mt-1">Out of 5.0</p>
                    </div>
                    <Award className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg Team Collaboration</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {feedbackData.appraisalStats?.averageScores?.avg_team_collaboration
                          ? parseFloat(feedbackData.appraisalStats.averageScores.avg_team_collaboration).toFixed(1)
                          : 'N/A'}
                      </p>
                      <p className="text-sm text-green-600 mt-1">Out of 5.0</p>
                    </div>
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Performance Appraisals Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Appraisals</h3>
                  <ClipboardList className="h-5 w-5 text-green-600" />
                </div>

                {feedbackData.performanceAppraisals.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No performance appraisals submitted yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedbackData.performanceAppraisals.slice(0, 10).map((appraisal) => (
                      <div key={appraisal.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <ClipboardList className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{appraisal.staff_name}</p>
                              <p className="text-xs text-gray-500">{appraisal.job_title}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded-full ${appraisal.status === 'completed' ? 'bg-green-100 text-green-800' :
                                appraisal.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                  appraisal.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                              }`}>
                              {appraisal.status}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(appraisal.submission_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div className="bg-primary-50 rounded p-2">
                            <p className="text-xs text-gray-600">KPI Clarity</p>
                            <p className="font-semibold text-primary-700">{appraisal.q1_kpi_clarity}/5</p>
                          </div>
                          <div className="bg-green-50 rounded p-2">
                            <p className="text-xs text-gray-600">Team Collaboration</p>
                            <p className="font-semibold text-green-700">{appraisal.q5a_team_collaboration}/5</p>
                          </div>
                          <div className="bg-purple-50 rounded p-2">
                            <p className="text-xs text-gray-600">Recognition</p>
                            <p className="font-semibold text-purple-700">{appraisal.q18_recognition_level}/5</p>
                          </div>
                          <div className="bg-orange-50 rounded p-2">
                            <p className="text-xs text-gray-600">Recommend Cloudspace</p>
                            <p className="font-semibold text-orange-700">{appraisal.q20_recommend_company}/5</p>
                          </div>
                        </div>

                        <div className="mt-3 text-sm">
                          <p className="font-medium text-gray-700 mb-1">Manager: {appraisal.current_manager}</p>
                          <p className="text-gray-600 line-clamp-1">
                            <span className="font-medium">Team Role:</span> {appraisal.q6_team_role}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedAppraisal(appraisal)
                            setShowAppraisalModal(true)
                          }}
                          className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Full Appraisal
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Anonymous Review Modal */}
      {showReviewModal && selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowReviewModal(false)}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div
              className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Anonymous Review Details</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="px-6 py-4 space-y-6">
                {/* Metadata */}
                <div className="bg-primary-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Submission Date:</span>
                      <p className="text-gray-900">
                        {new Date(selectedReview.submission_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Review Year:</span>
                      <p className="text-gray-900">{selectedReview.review_year}</p>
                    </div>
                  </div>
                </div>

                {/* Q1: Cloudspace Feedback */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Q1: Feedback on Cloudspace in General</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.company_feedback}</p>
                </div>

                {/* Q2: Management Feedback */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Q2: Management Team Feedback</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">GMD:</p>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedReview.gmd_feedback}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">TA:</p>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedReview.ta_feedback}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">PM:</p>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedReview.pm_feedback}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">HR:</p>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedReview.hr_feedback}</p>
                    </div>
                  </div>
                </div>

                {/* Q3: Colleague Feedback */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Q3: Colleague Feedback</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded p-3">
                      <p className="font-medium text-gray-700">1. {selectedReview.colleague1_name}</p>
                      <p className="text-gray-600 whitespace-pre-wrap mt-1">{selectedReview.colleague1_feedback}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="font-medium text-gray-700">2. {selectedReview.colleague2_name}</p>
                      <p className="text-gray-600 whitespace-pre-wrap mt-1">{selectedReview.colleague2_feedback}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <p className="font-medium text-gray-700">3. {selectedReview.colleague3_name}</p>
                      <p className="text-gray-600 whitespace-pre-wrap mt-1">{selectedReview.colleague3_feedback}</p>
                    </div>
                  </div>
                </div>

                {/* Q4: Best Performers */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Q4: Top 3 Best Performers</h4>
                  <div className="space-y-3">
                    <div className="bg-yellow-50 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <p className="font-medium text-gray-700">1. {selectedReview.best1_name}</p>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedReview.best1_reason}</p>
                    </div>
                    <div className="bg-gray-50 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="h-5 w-5 text-gray-400" />
                        <p className="font-medium text-gray-700">2. {selectedReview.best2_name}</p>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedReview.best2_reason}</p>
                    </div>
                    <div className="bg-orange-50 rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Award className="h-5 w-5 text-orange-400" />
                        <p className="font-medium text-gray-700">3. {selectedReview.best3_name}</p>
                      </div>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedReview.best3_reason}</p>
                    </div>
                  </div>
                </div>

                {/* Q5: Additional Comments */}
                {selectedReview.additional_comments && (
                  <div className="border-l-4 border-gray-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Q5: Additional Comments</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.additional_comments}</p>
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Appraisal Modal */}
      {showAppraisalModal && selectedAppraisal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setShowAppraisalModal(false)}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div
              className="relative bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Performance Appraisal Details</h3>
                  <p className="text-sm text-gray-600">{selectedAppraisal.staff_name} - {selectedAppraisal.job_title}</p>
                </div>
                <button
                  onClick={() => setShowAppraisalModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="text-2xl">&times;</span>
                </button>
              </div>

              <div className="px-6 py-4 space-y-6">
                {/* Basic Info */}
                <div className="bg-green-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Manager:</span>
                    <p className="text-gray-900">{selectedAppraisal.current_manager}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Review Date:</span>
                    <p className="text-gray-900">{new Date(selectedAppraisal.date_of_review).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <p className="text-gray-900 capitalize">{selectedAppraisal.status}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Year:</span>
                    <p className="text-gray-900">{selectedAppraisal.review_year}</p>
                  </div>
                </div>

                {/* Section 1: Overall Performance & Goals */}
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">Section 1: Overall Performance & Goals</h4>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-gray-700">KPI Clarity: <span className="text-primary">{selectedAppraisal.q1_kpi_clarity}/5</span></p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Individual Goals Achievement: <span className="text-primary">{selectedAppraisal.q2a_individual_goals}/5</span></p>
                      <div className="mt-2 space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Achievements:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q2b_achievements}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Areas for Improvement:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q2c_areas_improvement}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Biggest Accomplishment:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q2d_biggest_accomplishment}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Goal Shortfall:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q2e_goal_shortfall}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Departmental Goals: <span className="text-primary">{selectedAppraisal.q3a_departmental_goals}/5</span></p>
                      <div className="mt-2 space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Department Achievements:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q3b_dept_achievements}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Department Improvement:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q3c_dept_improvement}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Department Accomplishment:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q3d_dept_accomplishment}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Cloudspace Goals: <span className="text-primary">{selectedAppraisal.q4a_company_goals}/5</span></p>
                      <div className="mt-2 space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-600">Cloudspace Accomplishment:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q4b_company_accomplishment}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600">Contributions:</p>
                          <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q4c_company_contributions}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Team Collaboration */}
                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">Section 2: Team Collaboration & Contribution</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">Team Collaboration: <span className="text-green-600">{selectedAppraisal.q5a_team_collaboration}/5</span></p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedAppraisal.q5b_collaboration_explanation}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Team Role: <span className="text-green-600">{selectedAppraisal.q6_team_role}</span></p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Positive Teammate:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q7_positive_teammate}</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Leadership & Management */}
                <div className="border-l-4 border-purple-500 pl-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">Section 3: Leadership & Management Feedback</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">Manager(s): {selectedAppraisal.manager_names}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Manager Communication: <span className="text-purple-600">{selectedAppraisal.q8a_manager_communication}/5</span></p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedAppraisal.q8b_communication_explanation}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Manager Support: <span className="text-purple-600">{selectedAppraisal.q9a_manager_support}/5</span></p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedAppraisal.q9b_support_explanation}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Manager Strength:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q10_manager_strength}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Manager Improvement:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q11_manager_improvement}</p>
                    </div>
                  </div>
                </div>

                {/* Section 4: Skills & Development */}
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">Section 4: Skills & Development</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">Training Needed: {selectedAppraisal.q12_training_needed}</p>
                      {selectedAppraisal.q12_other_training && (
                        <p className="text-sm text-gray-700">Other: {selectedAppraisal.q12_other_training}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Skill Development Goal:</p>
                      <p className="text-sm text-gray-700">{selectedAppraisal.q13_skill_development}</p>
                    </div>
                  </div>
                </div>

                {/* Section 5: Team Dynamics & Culture */}
                <div className="border-l-4 border-pink-500 pl-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">Section 5: Team Dynamics & Culture</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">Psychological Safety: <span className="text-pink-600">{selectedAppraisal.q14_psychological_safety}/5</span></p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Decision Inclusivity: <span className="text-pink-600">{selectedAppraisal.q15_decision_inclusivity}/5</span></p>
                    </div>
                  </div>
                </div>

                {/* Section 6: Workload & Work-Life Balance */}
                <div className="border-l-4 border-orange-500 pl-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">Section 6: Workload & Work-Life Balance</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">Workload Manageability: <span className="text-orange-600">{selectedAppraisal.q16a_workload_manageability}/5</span></p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Team Support Needed:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q16b_team_support_needed}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Stress Management:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q17_stress_management}</p>
                    </div>
                  </div>
                </div>

                {/* Section 7: Recognition & Motivation */}
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">Section 7: Recognition & Motivation</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">Recognition Level: <span className="text-red-600">{selectedAppraisal.q18_recognition_level}/5</span></p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Feel Appreciated: {selectedAppraisal.q19a_feel_appreciated}</p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{selectedAppraisal.q19b_appreciation_explanation}</p>
                    </div>
                  </div>
                </div>

                {/* Section 8: Final Reflection */}
                <div className="border-l-4 border-indigo-500 pl-4">
                  <h4 className="font-semibold text-lg text-gray-900 mb-3">Section 8: Final Reflection & Future Outlook</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-700">Recommend Cloudspace: <span className="text-indigo-600">{selectedAppraisal.q20_recommend_company}/5</span></p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Improvement Suggestion:</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAppraisal.q21_improvement_suggestion}</p>
                    </div>
                  </div>
                </div>

                {/* Reviewer Comments */}
                {selectedAppraisal.reviewer_comments && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Reviewer Comments</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedAppraisal.reviewer_comments}</p>
                    {selectedAppraisal.reviewed_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Reviewed on {new Date(selectedAppraisal.reviewed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                <button
                  onClick={() => setShowAppraisalModal(false)}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HRDashboard