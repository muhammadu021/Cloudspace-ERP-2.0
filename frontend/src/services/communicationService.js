import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

class CommunicationService {
  // Email templates
  async getEmailTemplates(params = {}) {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/communication/email/templates', { params: { ...params, company_id } });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send individual email
  async sendEmail(emailData) {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/communication/email/send', { ...emailData, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send bulk emails
  async sendBulkEmails(emails) {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/communication/email/send-bulk', { emails, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Staff announcements
  async sendStaffAnnouncement(announcementData) {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/communication/staff/announcement', { ...announcementData, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Birthday wishes
  async sendBirthdayWishes() {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/communication/staff/birthday-wishes', { company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Work anniversary greetings
  async sendWorkAnniversaryGreetings() {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/communication/staff/work-anniversary', { company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Holiday greetings
  async sendHolidayGreetings(greetingData) {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/communication/staff/holiday-greetings', { ...greetingData, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Department communication
  async sendDepartmentEmail(departmentId, emailData) {
    try {
      const company_id = getCompanyId();
      const response = await api.post(`/communication/department/${departmentId}/email`, { ...emailData, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Project communication
  async sendProjectEmail(projectId, emailData) {
    try {
      const company_id = getCompanyId();
      const response = await api.post(`/communication/project/${projectId}/email`, { ...emailData, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // HR communications
  async sendLeaveNotification(notificationData) {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/communication/hr/leave-notification', { ...notificationData, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async sendPayrollNotification(notificationData) {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/communication/hr/payroll-notification', { ...notificationData, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // System alerts
  async sendSystemAlert(alertData) {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/communication/system-alert', { ...alertData, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notifications
  async getNotifications(params = {}) {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/notifications', { params: { ...params, company_id } });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getNotificationById(id) {
    try {
      const company_id = getCompanyId();
      const response = await api.get(`/notifications/${id}`, { params: { company_id } });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markAsRead(id) {
    try {
      const company_id = getCompanyId();
      const response = await api.patch(`/notifications/${id}/read`, { company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async markAllAsRead() {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/notifications/read-all', { company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteNotification(id) {
    try {
      const company_id = getCompanyId();
      const response = await api.delete(`/notifications/${id}`, { params: { company_id } });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUnreadCount() {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/notifications/unread-count', { params: { company_id } });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Preferences
  async getPreferences() {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/notifications/preferences', { params: { company_id } });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updatePreferences(preferences) {
    try {
      const company_id = getCompanyId();
      const response = await api.put('/notifications/preferences', { ...preferences, company_id });
      return response;
    } catch (error) {
      throw this.handleError(error);
    }
  }
  // Utility methods
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validateBulkEmails(emails) {
    const invalidEmails = emails.filter(email => !this.validateEmail(email));
    if (invalidEmails.length > 0) {
      throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
    }
    return true;
  }

  getTemplateIcon(templateId) {
    const templateIcons = {
      welcome: '👋',
      leaveRequest: '📅',
      leaveApproval: '✅',
      taskAssignment: '📋',
      payrollGenerated: '💰',
      systemAlert: '⚠️',
      passwordReset: '🔑',
      inventoryAlert: '📦',
      projectDeadline: '⏰',
      announcement: '📢',
      birthdayWish: '🎂',
      workAnniversary: '🏆',
      holidayGreeting: '🎄'
    };
    return templateIcons[templateId] || '📧';
  }

  getPriorityColor(priority) {
    const colors = {
      low: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  }

  getStatusColor(status) {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      scheduled: 'bg-purple-100 text-purple-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

export default new CommunicationService();