import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar,
  Play,
  Pause,
  XCircle,
  Check,
  AlertCircle,
  UserPlus,
  Flag,
  Hash,
  TrendingUp,
  Send,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input, Content, Item, Trigger, Value,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Textarea,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  Alert,
  AlertTitle,
  AlertDescription,
  DatePicker
} from '@/components/ui';
import taskService from '@/services/taskService';
import hrService from '@/services/hrService';
import projectService from '@/services/projectService';
import { toast } from 'react-hot-toast';

const TaskAssignment = () => {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTask, set, edTask] = useState(null);
  const [selectedEmployee, set, edEmployee] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assigned_to: '',
    project_id: '',
    department_id: '',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    assigned_to: '',
    priority: 'medium',
    due_date: '',
    estimated_hours: '',
    start_date: '',
    tags: []
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadTasks();
  }, [filters, pagination.currentPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [employeesRes, projectsRes, departmentsRes] = await Promise.all([
        hrService.getEmployees(),
        projectService.getProjects(),
        hrService.getDepartments()
      ]);
      
      setEmployees(employeesRes.data.employees || []);
      setProjects(projectsRes.data.projects || []);
      setDepartments(departmentsRes.data.departments || []);
    } catch (error) {
      console.error('Load initial data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };
      
      const response = await taskService.getTasks(params);
      
      if (response.success) {
        setTasks(response.data.tasks || []);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
          itemsPerPage: response.data.pagination.itemsPerPage
        });
      }
    } catch (error) {
      console.error('Load tasks error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const taskData = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null
      };
      
      const response = await taskService.createTask(taskData);
      
      if (response.success) {
        setShowCreateDialog(false);
        resetForm();
        loadTasks();
        
        // Show success message
        toast.success('Task created successfully!');
      } else {
        toast(response.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Create task error:', error);
      toast('Failed to create task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await taskService.assignTask(selectedTask.id, {
        assigned_to: selectedEmployee.id
      });
      
      if (response.success) {
        setShowAssignDialog(false);
        set, edTask(null);
        set, edEmployee(null);
        loadTasks();
        
        // Show success message
        toast.success('Task assigned successfully!');
      } else {
        toast(response.message || 'Failed to assign task');
      }
    } catch (error) {
      console.error('Assign task error:', error);
      toast('Failed to assign task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const taskData = {
        ...formData,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null
      };
      
      const response = await taskService.updateTask(selectedTask.id, taskData);
      
      if (response.success) {
        setShowEditDialog(false);
        set, edTask(null);
        resetForm();
        loadTasks();
        
        // Show success message
        toast.success('Task updated successfully!');
      } else {
        toast(response.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Update task error:', error);
      toast('Failed to update task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await taskService.deleteTask(taskId);
      
      if (response.success) {
        loadTasks();
        toast.success('Task deleted successfully!');
      } else {
        toast(response.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Delete task error:', error);
      toast('Failed to delete task: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    set, edTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      project_id: task.project_id || '',
      assigned_to: task.assigned_to || '',
      priority: task.priority || 'medium',
      due_date: task.due_date || '',
      estimated_hours: task.estimated_hours || '',
      start_date: task.start_date || '',
      tags: task.tags || []
    });
    setShowEditDialog(true);
  };

  const handleAssignTaskClick = (task) => {
    set, edTask(task);
    setShowAssignDialog(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      project_id: '',
      assigned_to: '',
      priority: 'medium',
      due_date: '',
      estimated_hours: '',
      start_date: '',
      tags: []
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      todo: { label: 'To Do', color: 'bg-gray-100 text-gray-800' },
      in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
      review: { label: 'Review', color: 'bg-yellow-100 text-yellow-800' },
      completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={`${config.color} capitalize`}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { label: 'Low', color: 'bg-green-100 text-green-800' },
      medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
      high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
      critical: { label: 'Critical', color: 'bg-red-100 text-red-800' }
    };
    
    const config = priorityConfig[priority] || { label: priority, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge className={`${config.color} capitalize`}>
        <Flag className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return 'Unassigned';
    
    const user = employee.User || {};
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Employee';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(proj => proj.id === projectId);
    return project ? project.name : 'No Project';
  };

  const getDepartmentName = (departmentId) => {
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : 'No Department';
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-600">Overdue by {Math.abs(diffDays)} days</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600">Due today</span>;
    } else if (diffDays <= 3) {
      return <span className="text-yellow-600">Due in {diffDays} days</span>;
    } else {
      return <span className="text-green-600">Due in {diffDays} days</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Assignment</h1>
          <p className="text-gray-600">Assign and manage tasks for your team</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tasks..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <select 
  value={filters.status} 
  onChange={(e) => (e.target.value) => handleFilterChange('status', value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Status</option>
    <option value="todo">To Do</option>
    <option value="in_progress">In Progress</option>
    <option value="review">Review</option>
    <option value="completed">Completed</option>
    <option value="cancelled">Cancelled</option>
</select>
            
            <select 
  value={filters.priority} 
  onChange={(e) => (e.target.value) => handleFilterChange('priority', value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Priority</option>
    <option value="low">Low</option>
    <option value="medium">Medium</option>
    <option value="high">High</option>
    <option value="critical">Critical</option>
</select>
            
            <select 
  value={filters.project_id} 
  onChange={(e) => (e.target.value) => handleFilterChange('project_id', value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Projects</option>
</select>
            
            <select 
  value={filters.department_id} 
  onChange={(e) => (e.target.value) => handleFilterChange('department_id', value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Departments</option>
</select>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>All tasks matching your filters</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map(task => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-gray-500">{task.description?.substring(0, 50)}...</div>
                      </div>
                    </TableCell>
                    <TableCell>{getProjectName(task.project_id)}</TableCell>
                    <TableCell>{getEmployeeName(task.assigned_to)}</TableCell>
                    <TableCell>{getDepartmentName(task.Employee?.department_id)}</TableCell>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                    <TableCell>{formatDueDate(task.due_date)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Tooltip>
                          <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip>
                          <Button variant="outline" size="sm" onClick={() => handleEditTask(task)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip>
                          <Button variant="outline" size="sm" onClick={() => handleAssignTaskClick(task)}>
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteTask(task.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {tasks.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <Label htmlFor="title">Task Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project_id">Project</Label>
                <select value={formData.project_id} onChange={(e) => (value) => setFormData(prev => ({ ...prev, project_id: value (e.target.value)}))}>
                  
                    
                  
                  
                    {projects.map(project => (
                      <option key={project.id} value={project.id.toString()}>
                        {project.name}
                      </option>
                    ))}
                  
                </select>
              </div>
              
              <div>
                <Label htmlFor="assigned_to">Assign To</Label>
                <select value={formData.assigned_to} onChange={(e) => (value) => setFormData(prev => ({ ...prev, assigned_to: value (e.target.value)}))}>
                  
                    
                  
                  
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id.toString()}>
                        {getEmployeeName(employee.id)}
                      </option>
                    ))}
                  
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select value={formData.priority} onChange={(e) => (value) => setFormData(prev => ({ ...prev, priority: value (e.target.value)}))}>
                  
                    
                  
                  
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  
                </select>
              </div>
              
              <div>
                <Label htmlFor="estimated_hours">Estimated Hours</Label>
                <Input
                  id="estimated_hours"
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                  placeholder="Enter estimated hours"
                  step="0.5"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">●</span>
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateTask} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Task Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter task title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter task description"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-project_id">Project</Label>
                <select value={formData.project_id} onChange={(e) => (value) => setFormData(prev => ({ ...prev, project_id: value (e.target.value)}))}>
                  
                    
                  
                  
                    {projects.map(project => (
                      <option key={project.id} value={project.id.toString()}>
                        {project.name}
                      </option>
                    ))}
                  
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-assigned_to">Assign To</Label>
                <select value={formData.assigned_to} onChange={(e) => (value) => setFormData(prev => ({ ...prev, assigned_to: value (e.target.value)}))}>
                  
                    
                  
                  
                    {employees.map(employee => (
                      <option key={employee.id} value={employee.id.toString()}>
                        {getEmployeeName(employee.id)}
                      </option>
                    ))}
                  
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <select value={formData.priority} onChange={(e) => (value) => setFormData(prev => ({ ...prev, priority: value (e.target.value)}))}>
                  
                    
                  
                  
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-estimated_hours">Estimated Hours</Label>
                <Input
                  id="edit-estimated_hours"
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                  placeholder="Enter estimated hours"
                  step="0.5"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-start_date">Start Date</Label>
                <Input
                  id="edit-start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-due_date">Due Date</Label>
                <Input
                  id="edit-due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">●</span>
                    Updating...
                  </>
                ) : (
                  'Update Task'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Task Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAssignTask} className="space-y-4">
            <div>
              <Label htmlFor="assignee">, Assignee *</Label>
              <select value={selectedEmployee?.id || ''} 
                onChange={(e) => (value) => {
                  const employee = employees.find(e => e.id === parseInt(value));
                  set, edEmployee(employee || null);
                (e.target.value)}}
              >
                
                  
                
                
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id.toString()}>
                      {getEmployeeName(employee.id)}
                    </option>
                  ))}
                
              </select>
            </div>
            
            {selectedEmployee && (
              <Card>
                <CardHeader>
                  <CardTitle>, ed Employee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                      {getEmployeeName(selectedEmployee.id).charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-medium">{getEmployeeName(selectedEmployee.id)}</h3>
                      <p className="text-sm text-gray-600">{selectedEmployee.position}</p>
                      <p className="text-sm text-gray-600">{getDepartmentName(selectedEmployee.department_id)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!selectedEmployee || loading}>
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">●</span>
                    Assigning...
                  </>
                ) : (
                  'Assign Task'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskAssignment;