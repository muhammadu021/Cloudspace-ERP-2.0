import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  User, 
  FileText, 
  TrendingUp,
  MessageSquare,
  Play,
  Pause,
  Square,
  BarChart3,
  Filter,
  Search
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { selfServiceService } from '../../services/selfServiceService';

const TaskReporting = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Fetch employee's tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery(
    ['employee-tasks', currentPage, filterStatus, filterPriority, searchTerm],
    async () => {
      const params = {
        page: currentPage,
        limit: 10,
        ...(filterStatus && { status: filterStatus }),
        ...(filterPriority && { priority: filterPriority }),
        ...(searchTerm && { search: searchTerm })
      };
      
      const response = await selfServiceService.getMyTasks(params);
      return response.data;
    }
  );

  // Report task status mutation
  const reportTaskMutation = useMutation(
    async ({ taskId, reportData }) => {
      const response = await selfServiceService.reportTaskStatus(taskId, reportData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('employee-tasks');
        setShowReportModal(false);
        setSelectedTask(null);
      }
    }
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      todo: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      pending: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Play },
      review: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: Square }
    };
    
    const config = statusConfig[status] || statusConfig.todo;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[priority] || priorityConfig.medium}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleReportTask = (task) => {
    setSelectedTask(task);
    setShowReportModal(true);
  };

  const handleQuickStatusUpdate = async (task, newStatus) => {
    try {
      await selfServiceService.updateTaskStatus(task.id, { status: newStatus });
      queryClient.invalidateQueries('employee-tasks');
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const TaskReportForm = ({ task, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
      status: task?.status || 'todo',
      progress_percentage: task?.progress_percentage || 0,
      hours_worked: '',
      report: '',
      blockers: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress Percentage
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.progress_percentage}
                onChange={(e) => setFormData({ ...formData, progress_percentage: parseInt(e.target.value) })}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">{formData.progress_percentage}%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hours Worked (this session)
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            value={formData.hours_worked}
            onChange={(e) => setFormData({ ...formData, hours_worked: e.target.value })}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
            placeholder="0.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Progress Report
          </label>
          <textarea
            value={formData.report}
            onChange={(e) => setFormData({ ...formData, report: e.target.value })}
            rows={4}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
            placeholder="Describe what you've accomplished, what you're working on, and any updates..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Blockers or Issues
          </label>
          <textarea
            value={formData.blockers}
            onChange={(e) => setFormData({ ...formData, blockers: e.target.value })}
            rows={3}
            className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
            placeholder="Any obstacles, dependencies, or help needed..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {isLoading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>
    );
  };

  const tasks = tasksData?.data?.tasks || [];
  const pagination = tasksData?.data?.pagination || {};

  // Calculate summary statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
  const overdueTasks = tasks.filter(task => {
    if (!task.due_date) return false;
    const daysUntilDue = getDaysUntilDue(task.due_date);
    return daysUntilDue < 0 && task.status !== 'completed';
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-1">Track and report on your assigned tasks</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-primary">{totalTasks}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <FileText className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-orange-600">{inProgressTasks}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100">
              <Play className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueTasks}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasksLoading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-gray-500">Loading tasks...</span>
            </div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
            <p className="text-gray-500">You don't have any assigned tasks at the moment</p>
          </div>
        ) : (
          tasks.map((task) => {
            const daysUntilDue = getDaysUntilDue(task.due_date);
            const isOverdue = daysUntilDue < 0 && task.status !== 'completed';
            const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3 && task.status !== 'completed';

            return (
              <div key={task.id} className={`bg-white rounded-xl shadow-sm border ${isOverdue ? 'border-red-200' : isDueSoon ? 'border-orange-200' : 'border-gray-100'} p-6`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                          Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                          {daysUntilDue !== null && (
                            <span className={`ml-1 ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : ''}`}>
                              ({daysUntilDue === 0 ? 'Today' : daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`})
                            </span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <span>
                          Assigned by: {task.CreatedBy?.User?.first_name} {task.CreatedBy?.User?.last_name}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-500">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        <span>Progress: {task.progress_percentage || 0}%</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{task.progress_percentage || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-600' :
                            task.progress_percentage >= 75 ? 'bg-primary' :
                            task.progress_percentage >= 50 ? 'bg-yellow-600' : 'bg-gray-400'
                          }`}
                          style={{ width: `${task.progress_percentage || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Comments/Reports */}
                    {task.comments && task.comments.length > 0 && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Latest Report
                        </div>
                        <p className="text-sm text-gray-700">
                          {task.comments[task.comments.length - 1].comment}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(task.comments[task.comments.length - 1].created_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                    <button
                      onClick={() => handleReportTask(task)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Report Progress
                    </button>

                    {task.status !== 'completed' && (
                      <div className="flex gap-2">
                        {task.status === 'todo' && (
                          <button
                            onClick={() => handleQuickStatusUpdate(task, 'in_progress')}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </button>
                        )}
                        {task.status === 'in_progress' && (
                          <button
                            onClick={() => handleQuickStatusUpdate(task, 'completed')}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={currentPage === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 10, pagination.totalItems)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {[...Array(Math.min(pagination.totalPages, 5))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === page
                          ? 'z-10 bg-primary-50 border-blue-500 text-primary'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages}
                  className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Report Task Modal */}
      {showReportModal && selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Report Progress: {selectedTask.title}
              </h3>
              <TaskReportForm
                task={selectedTask}
                onSubmit={(formData) => {
                  reportTaskMutation.mutate({
                    taskId: selectedTask.id,
                    reportData: formData
                  });
                }}
                onCancel={() => {
                  setShowReportModal(false);
                  setSelectedTask(null);
                }}
                isLoading={reportTaskMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskReporting;