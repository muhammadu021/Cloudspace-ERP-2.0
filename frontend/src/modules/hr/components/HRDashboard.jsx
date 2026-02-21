import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  UserCheck, 
  UserX,
  Building,
  FileText,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  MessageSquare,
  ClipboardList,
  Eye,
  Star,
  ThumbsUp,
  Award
} from 'lucide-react';
import { 
  getAnonymousReviews, 
  getAnonymousReviewStats,
  getPerformanceAppraisals,
  getPerformanceAppraisalStats 
} from '../../../services/reviewService';

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalEmployees: 0,
      activeEmployees: 0,
      departments: 0,
      pendingLeaves: 0,
      todayAttendance: 0,
      pendingTasks: 0
    },
    recentActivities: [],
    attendanceToday: [],
    upcomingLeaves: [],
    taskStats: {}
  });
  const [feedbackData, setFeedbackData] = useState({
    anonymousReviews: [],
    performanceAppraisals: [],
    anonymousStats: null,
    appraisalStats: null,
    loading: false,
    error: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'feedback') {
      fetchFeedbackData();
    }
  }, [activeTab]);

  const fetchFeedbackData = async () => {
    setFeedbackData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const [anonymousRes, appraisalsRes, anonymousStatsRes, appraisalStatsRes] = await Promise.all([
        getAnonymousReviews({ limit: 50 }),
        getPerformanceAppraisals({ limit: 50 }),
        getAnonymousReviewStats(),
        getPerformanceAppraisalStats()
      ]);

      setFeedbackData({
        anonymousReviews: anonymousRes.data?.reviews || [],
        performanceAppraisals: appraisalsRes.data?.appraisals || [],
        anonymousStats: anonymousStatsRes.data || null,
        appraisalStats: appraisalStatsRes.data || null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      setFeedbackData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load feedback data'
      }));
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple endpoints in parallel
      const [employeesRes, departmentsRes, attendanceRes, tasksRes] = await Promise.all([
        fetch('/api/v1/hr/employees?limit=1000'),
        fetch('/api/v1/hr/departments'),
        fetch('/api/v1/hr/attendance?limit=100'),
        fetch('/api/v1/hr/tasks?limit=100')
      ]);

      const [employees, departments, attendance, tasks] = await Promise.all([
        employeesRes.json(),
        departmentsRes.json(),
        attendanceRes.json(),
        tasksRes.json()
      ]);

      // Calculate stats
      const totalEmployees = employees.data?.employees?.length || 0;
      const activeEmployees = employees.data?.employees?.filter(emp => emp.employment_status === 'active').length || 0;
      const totalDepartments = departments.data?.departments?.length || 0;
      
      // Today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.data?.attendance?.filter(att => att.date === today) || [];
      
      // Task statistics
      const allTasks = tasks.data?.tasks || [];
      const pendingTasks = allTasks.filter(task => task.status === 'todo' || task.status === 'in_progress').length;
      const taskStats = {
        total: allTasks.length,
        pending: pendingTasks,
        completed: allTasks.filter(task => task.status === 'completed').length,
        overdue: allTasks.filter(task => {
          if (!task.due_date) return false;
          return new Date(task.due_date) < new Date() && task.status !== 'completed';
        }).length
      };

      setDashboardData({
        stats: {
          totalEmployees,
          activeEmployees,
          departments: totalDepartments,
          pendingLeaves: 0, // Would need leave endpoint
          todayAttendance: todayAttendance.length,
          pendingTasks
        },
        recentActivities: attendance.data?.attendance?.slice(0, 5) || [],
        attendanceToday: todayAttendance,
        upcomingLeaves: [], // Would need leave endpoint
        taskStats
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of human resources metrics and activities</p>
        </div>
        <button
          onClick={activeTab === 'overview' ? fetchDashboardData : fetchFeedbackData}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-primary-50 text-primary-700 border-b-2 border-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span>Overview</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('feedback')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'feedback'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="h-5 w-5" />
              <span>Employee Feedback & Reviews</span>
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.totalEmployees}</p>
              <p className="text-sm text-green-600 mt-1">
                {dashboardData.stats.activeEmployees} active
              </p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.departments}</p>
              <p className="text-sm text-gray-500 mt-1">Active departments</p>
            </div>
            <Building className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.todayAttendance}</p>
              <p className="text-sm text-primary mt-1">Checked in today</p>
            </div>
            <UserCheck className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData.stats.pendingTasks}</p>
              <p className="text-sm text-orange-600 mt-1">Need attention</p>
            </div>
            <FileText className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
            <Clock className="h-5 w-5 text-primary" />
          </div>
          
          {dashboardData.attendanceToday.length === 0 ? (
            <div className="text-center py-8">
              <UserX className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No attendance records for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData.attendanceToday.slice(0, 5).map((attendance) => (
                <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {attendance.Employee?.User?.first_name} {attendance.Employee?.User?.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{attendance.Employee?.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      In: {formatTime(attendance.check_in_time)}
                    </p>
                    {attendance.check_out_time && (
                      <p className="text-sm text-gray-500">
                        Out: {formatTime(attendance.check_out_time)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Task Overview</h3>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-gray-900">Total Tasks</span>
              </div>
              <span className="text-xl font-bold text-primary">{dashboardData.taskStats.total}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <span className="font-medium text-gray-900">Pending</span>
              </div>
              <span className="text-xl font-bold text-orange-600">{dashboardData.taskStats.pending}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Completed</span>
              </div>
              <span className="text-xl font-bold text-green-600">{dashboardData.taskStats.completed}</span>
            </div>
            
            {dashboardData.taskStats.overdue > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                  <span className="font-medium text-gray-900">Overdue</span>
                </div>
                <span className="text-xl font-bold text-red-600">{dashboardData.taskStats.overdue}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        
        {dashboardData.recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No recent activities</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dashboardData.recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {activity.Employee?.User?.first_name} {activity.Employee?.User?.last_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {activity.check_out_time ? 'Checked out' : 'Checked in'} at {formatTime(activity.check_out_time || activity.check_in_time)}
                  </p>
                </div>
                <div className="text-sm text-gray-400">
                  {new Date(activity.date).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Manage Employees</span>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <Calendar className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">View Attendance</span>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <FileText className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">HR Tasks</span>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <BarChart3 className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <span className="text-sm font-medium text-gray-900">Reports</span>
          </button>
        </div>
      </div>
        </>
      )}

      {/* Feedback Tab Content */}
      {activeTab === 'feedback' && (
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
              {/* Feedback Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Anonymous Reviews</p>
                      <p className="text-3xl font-bold text-gray-900">{feedbackData.anonymousReviews.length}</p>
                      <p className="text-sm text-primary mt-1">Total submissions</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-primary" />
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Performance Appraisals</p>
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
                        
                        <button className="mt-3 text-sm text-primary hover:text-primary-700 font-medium flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          View Full Review
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              appraisal.status === 'completed' ? 'bg-green-100 text-green-800' :
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
                        
                        <button className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1">
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
    </div>
  );
};

export default HRDashboard;