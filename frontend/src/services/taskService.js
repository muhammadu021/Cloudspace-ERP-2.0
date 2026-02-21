import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';
class TaskService {
  // Get all tasks with filtering
  async getTasks(params = {}) {
    try {
      return api.get('/tasks', { params });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get task by ID
  async getTaskById(id) {
    try {
      return api.get(`/tasks/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create new task
  async createTask(taskData) {
    try {
      return api.post('/tasks', taskData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update task
  async updateTask(id, taskData) {
    try {
      return api.put(`/tasks/${id}`, taskData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete task
  async deleteTask(id) {
    try {
      return api.delete(`/tasks/${id}`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update task status
  async updateTaskStatus(id, statusData) {
    try {
      return api.patch(`/tasks/${id}/status`, statusData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Assign task to employee
  async assignTask(id, assignData) {
    try {
      return api.patch(`/tasks/${id}/assign`, assignData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add comment to task
  async addTaskComment(id, commentData) {
    try {
      return api.post(`/tasks/${id}/comments`, commentData);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get task comments
  async getTaskComments(id) {
    try {
      return api.get(`/tasks/${id}/comments`);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get my tasks
  async getMyTasks(params = {}) {
    try {
      return api.get('/tasks/my-tasks', { params });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get task statistics
  async getTaskStats() {
    try {
      return api.get('/tasks/stats');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  getTaskStatusColor(status) {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      review: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getTaskPriorityColor(priority) {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  }

  formatTaskProgress(progress) {
    if (progress === null || progress === undefined) return '0%';
    return `${Math.round(progress)}%`;
  }

  calculateDaysRemaining(dueDate) {
    if (!dueDate) return null;
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  isOverdue(dueDate, status) {
    if (!dueDate || status === 'completed') return false;
    
    const today = new Date();
    const due = new Date(dueDate);
    
    return due < today;
  }

  isDueSoon(dueDate, days = 3) {
    if (!dueDate) return false;
    
    const daysRemaining = this.calculateDaysRemaining(dueDate);
    return daysRemaining <= days && daysRemaining >= 0;
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const errors = error.response.data?.errors || {};
      return { message, errors, status: error.response.status };
    } else if (error.request) {
      // Request was made but no response received
      return { message: 'Network error. Please check your connection.', errors: {} };
    } else {
      // Something else happened
      return { message: error.message || 'An unexpected error occurred', errors: {} };
    }
  }
}

export default new TaskService();