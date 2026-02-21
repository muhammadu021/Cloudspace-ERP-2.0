import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';
// Note: company_id is automatically handled by the api interceptor in api.js

class NotificationService {
  // Get all notifications for current user
  async getNotifications(params = {}) {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/notifications', { params: { ...params, company_id } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get notification by ID
  async getNotificationById(id) {
    try {
      const company_id = getCompanyId();
      const response = await api.get(`/notifications/${id}`, { params: { company_id } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark notification as read
  async markAsRead(id) {
    try {
      const company_id = getCompanyId();
      const response = await api.patch(`/notifications/${id}/read`, { company_id });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/notifications/read-all', { company_id });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete notification
  async deleteNotification(id) {
    try {
      const company_id = getCompanyId();
      const response = await api.delete(`/notifications/${id}`, { params: { company_id } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get unread notifications count
  async getUnreadCount() {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/notifications/unread-count', { params: { company_id } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get notification preferences
  async getPreferences() {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/notifications/preferences', { params: { company_id } });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update notification preferences
  async updatePreferences(preferences) {
    try {
      const company_id = getCompanyId();
      const response = await api.put('/notifications/preferences', { ...preferences, company_id });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create custom notification (admin only)
  async createNotification(notificationData) {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/notifications', { ...notificationData, company_id });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  getNotificationTypeIcon(type) {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      reminder: '🔔'
    };
    return icons[type] || 'ℹ️';
  }

  getNotificationTypeColor(type) {
    const colors = {
      info: 'bg-blue-100 text-blue-800 border-primary-200',
      success: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      reminder: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  formatTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown';

    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} weeks ago`;
  }

  isUnread(notification) {
    return !notification.is_read;
  }

  isImportant(notification) {
    return notification.priority === 'high' || notification.priority === 'urgent';
  }

  isExpired(notification) {
    if (!notification.expires_at) return false;
    return new Date(notification.expires_at) < new Date();
  }

  // Real-time notifications using WebSocket (would be implemented separately)
  async subscribeToRealTimeNotifications(callback) {
    // In a real implementation, you would connect to WebSocket here
    console.log('WebSocket subscription would be implemented here');
    
    // Simulate real-time notifications for demo purposes
    setInterval(async () => {
      try {
        const unreadCount = await this.getUnreadCount();
        callback(unreadCount.data.count);
      } catch (error) {
        console.error('Failed to fetch real-time notifications:', error);
      }
    }, 30000); // Check every 30 seconds
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

export default new NotificationService();