import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  BarChart3,
  FileText,
  Users,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { hrService } from '../../services/hrService';
import { selectApiData } from '../../services/api';

const HRTaskManagement = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('tasks');
  const queryClient = useQueryClient();

  // Fetch HR tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery(
    ['hr-tasks', currentPage, filterStatus, filterPriority, filterEmployee, searchTerm],
    () => hrService.getHRTasks({
      page: currentPage,
      limit: 10,
      ...(filterStatus && { status: filterStatus }),
      ...(filterPriority && { priority: filterPriority }),
      ...(filterEmployee && { assigned_to: filterEmployee }),
      ...(searchTerm && { search: searchTerm })
    }),
    {
      select: selectApiData
    }
  );

  // Fetch task statistics
  const { data: statsData } = useQuery(
    'hr-task-stats', 
    () => hrService.getHRTaskStats(),
    {
      select: selectApiData
    }
  );

  // Fetch employees for assignment
  const { data: employeesData } = useQuery(
    'hr-employees', 
    () => hrService.getEmployees({ limit: 1000 }),
    {
      select: selectApiData
    }
  );

  // Create task mutation
  const createTaskMutation = useMutation(
    (taskData) => hrService.createHRTask(taskData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-tasks');
        queryClient.invalidateQueries('hr-task-stats');
        setShowCreateModal(false);
      }
    }
  );

  // Update task mutation
  const updateTaskMutation = useMutation(
    ({ id, ...taskData }) => hrService.updateHRTask(id, taskData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-tasks');
        queryClient.invalidateQueries('hr-task-stats');
        setShowEditModal(false);
        setSelectedTask(null);
      }
    }
  );

  // Assign task mutation
  const assignTaskMutation = useMutation(
    ({ taskId, employeeId }) => hrService.assignHRTask(taskId, { assigned_to: employeeId }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-tasks');
        queryClient.invalidateQueries('hr-task-stats');
        setShowAssignModal(false);
        setSelectedTask(null);
      }
    }
  );

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    (taskId) => hrService.deleteHRTask(taskId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('hr-tasks');
        queryClient.invalidateQueries('hr-task-stats');
      }
    }
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      todo: { color: 'bg-gray-100 text-gray-800', icon: Clock },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      review: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
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
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[priority] || priorityConfig.medium}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const handleCreateTask = (formData) => {
    createTaskMutation.mutate(formData);
  };

  const handleUpdateTask = (formData) => {
    updateTaskMutation.mutate({ id: selectedTask.id, ...formData });
  };

  const handleAssignTask = (task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const tasks = tasksData?.tasks || [];
  const pagination = tasksData?.pagination || {};
  const employees = employeesData?.employees || [];
  const stats = statsData || {};

  // Calculate statistics
  const totalTasks = stats.overall?.reduce((sum, item) => sum + parseInt(item.count), 0) || 0;
  const completedTasks = stats.overall?.find(item => item.status === 'completed')?.count || 0;
  const overdueTasks = stats.overdue || 0;
  const dueTodayTasks = stats.dueToday || 0;

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const TaskForm = ({ task, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
      title: task?.title || '',
      description: task?.description || '',
      assigned_to: task?.assigned_to || '',
      priority: task?.priority || 'medium',
      due_date: task?.due_date ? task.due_date.split('T')[0] : '',
      start_date: task?.start_date ? task.start_date.split('T')[0] : '',
      estimated_hours: task?.estimated_hours || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const getPriorityColor = (priority) => {
      const colors = {
        low: 'border-gray-300 bg-gray-50',
        medium: 'border-blue-300 bg-primary-50',
        high: 'border-orange-300 bg-orange-50',
        critical: 'border-red-300 bg-red-50'
      };
      return colors[priority] || colors.medium;
    };

    return (
      <div className="bg-white">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
              placeholder="Enter a clear and descriptive task title"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors resize-none"
              placeholder="Provide detailed information about the task, requirements, and expected outcomes"
            />
          </div>

          {/* Assignment and Priority Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                <User className="inline h-4 w-4 mr-1" />
                Assign To
              </label>
              <select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
              >
                <option value="">Select employee...</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>
                    {employee.User?.first_name} {employee.User?.last_name} - {employee.Department?.name}
                  </option>
                ))}
              </select>
              {employees.length === 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  No employees found. Please check your connection.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors ${getPriorityColor(formData.priority)}`}
              >
                <option value="low">🟢 Low Priority</option>
                <option value="medium">🔵 Medium Priority</option>
                <option value="high">🟠 High Priority</option>
                <option value="critical">🔴 Critical Priority</option>
              </select>
            </div>
          </div>

          {/* Dates and Hours Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                <Calendar className="inline h-4 w-4 mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-900">
                <Clock className="inline h-4 w-4 mr-1" />
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="999"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="px-6 py-3 text-sm font-medium text-white bg-primary border border-transparent rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  {task ? (
                    <>
                      <Edit className="inline h-4 w-4 mr-2" />
                      Update Task
                    </>
                  ) : (
                    <>
                      <Plus className="inline h-4 w-4 mr-2" />
                      Create Task
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Task Management</h1>
          <p className="text-gray-600 mt-1">Assign and monitor tasks for employees</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'tasks'
                ? 'border-blue-500 text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Tasks
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Analytics
          </button>
        </nav>
      </div>

      {activeTab === 'analytics' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Tasks"
              value={totalTasks}
              icon={FileText}
              color="text-primary"
              subtitle="All HR tasks"
            />
            <StatCard
              title="Completed"
              value={completedTasks}
              icon={CheckCircle}
              color="text-green-600"
              subtitle={`${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% completion rate`}
            />
            <StatCard
              title="Overdue"
              value={overdueTasks}
              icon={AlertTriangle}
              color="text-red-600"
              subtitle="Need attention"
            />
            <StatCard
              title="Due Today"
              value={dueTodayTasks}
              icon={Calendar}
              color="text-orange-600"
              subtitle="Urgent tasks"
            />
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tasks by Priority</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.priority?.map(item => (
                <div key={item.priority} className="text-center">
                  <div className={`text-2xl font-bold ${
                    item.priority === 'critical' ? 'text-red-600' :
                    item.priority === 'high' ? 'text-orange-600' :
                    item.priority === 'medium' ? 'text-primary' : 'text-gray-600'
                  }`}>
                    {item.count}
                  </div>
                  <div className="text-sm text-gray-500 capitalize">{item.priority}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'tasks' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                <select
                  value={filterEmployee}
                  onChange={(e) => setFilterEmployee(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-primary"
                >
                  <option value="">All Employees</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.User?.first_name} {employee.User?.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasksLoading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2 text-gray-500">Loading tasks...</span>
                        </div>
                      </td>
                    </tr>
                  ) : tasks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
                          <p className="text-gray-500">Create a new task to get started</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">{task.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {task.AssignedTo ? (
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                                <User className="h-4 w-4 text-gray-500" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {task.AssignedTo.User?.first_name} {task.AssignedTo.User?.last_name}
                                </div>
                                <div className="text-xs text-gray-500">{task.AssignedTo.Department?.name}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPriorityBadge(task.priority)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-primary h-2 rounded-full" 
                                style={{ width: `${task.progress_percentage || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs">{task.progress_percentage || 0}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditTask(task)}
                              className="text-primary hover:text-blue-900 p-1 rounded"
                              title="Edit Task"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleAssignTask(task)}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title="Assign Task"
                            >
                              <UserPlus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title="Delete Task"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
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
          </div>
        </>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Create New HR Task</h3>
                  <p className="text-sm text-gray-600 mt-1">Assign a new task to an employee</p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <TaskForm
                onSubmit={handleCreateTask}
                onCancel={() => setShowCreateModal(false)}
                isLoading={createTaskMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Edit Task</h3>
                  <p className="text-sm text-gray-600 mt-1 truncate">{selectedTask.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedTask(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <TaskForm
                task={selectedTask}
                onSubmit={handleUpdateTask}
                onCancel={() => {
                  setShowEditModal(false);
                  setSelectedTask(null);
                }}
                isLoading={updateTaskMutation.isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Assign Task</h3>
                  <p className="text-sm text-gray-600 mt-1 truncate">{selectedTask.title}</p>
                </div>
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedTask(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Select Employee
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        assignTaskMutation.mutate({
                          taskId: selectedTask.id,
                          employeeId: parseInt(e.target.value)
                        });
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 transition-colors"
                    defaultValue=""
                    disabled={assignTaskMutation.isLoading}
                  >
                    <option value="">Select an employee...</option>
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id}>
                        {employee.User?.first_name} {employee.User?.last_name} - {employee.Department?.name}
                      </option>
                    ))}
                  </select>
                  {employees.length === 0 && (
                    <p className="text-sm text-amber-600 mt-2">
                      <AlertTriangle className="inline h-4 w-4 mr-1" />
                      No employees found. Please check your connection.
                    </p>
                  )}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedTask(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={assignTaskMutation.isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRTaskManagement;