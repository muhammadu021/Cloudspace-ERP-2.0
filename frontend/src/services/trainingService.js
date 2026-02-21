import api from './api';
import { getCompanyId } from '../utils/company';

const trainingService = {
  // ==================== COURSES ====================
  getCourses: (params = {}) => {
    const company_id = getCompanyId();
    return api.get('/hr/training/courses', { params: { ...params, company_id } });
  },

  getCourse: (id) => {
    return api.get(`/hr/training/courses/${id}`);
  },

  createCourse: (courseData) => {
    return api.post('/hr/training/courses', courseData);
  },

  updateCourse: (id, courseData) => {
    return api.put(`/hr/training/courses/${id}`, courseData);
  },

  deleteCourse: (id) => {
    return api.delete(`/hr/training/courses/${id}`);
  },

  // ==================== LEARNING PATHS ====================
  getLearningPaths: (params = {}) => {
    return api.get('/hr/training/learning-paths', { params });
  },

  createLearningPath: (pathData) => {
    return api.post('/hr/training/learning-paths', pathData);
  },

  // ==================== TRAINING SESSIONS ====================
  getTrainingSessions: (params = {}) => {
    return api.get('/hr/training/sessions', { params });
  },

  createTrainingSession: (sessionData) => {
    return api.post('/hr/training/sessions', sessionData);
  },

  // ==================== ENROLLMENTS ====================
  getEnrollments: (params = {}) => {
    return api.get('/hr/training/enrollments', { params });
  },

  enrollEmployee: (enrollmentData) => {
    return api.post('/hr/training/enrollments', enrollmentData);
  },

  // ==================== INSTRUCTORS ====================
  getInstructors: (params = {}) => {
    return api.get('/hr/training/instructors', { params });
  },

  createInstructor: (instructorData) => {
    return api.post('/hr/training/instructors', instructorData);
  },

  // ==================== CERTIFICATIONS ====================
  getCertifications: (params = {}) => {
    return api.get('/hr/training/certifications', { params });
  },

  createCertification: (certificationData) => {
    return api.post('/hr/training/certifications', certificationData);
  },

  // ==================== PROGRESS TRACKING ====================
  getProgress: (params = {}) => {
    return api.get('/hr/training/progress', { params });
  },

  updateProgress: (progressData) => {
    return api.post('/hr/training/progress', progressData);
  },

  // ==================== BUDGET MANAGEMENT ====================
  getBudgets: (params = {}) => {
    return api.get('/hr/training/budgets', { params });
  },

  createBudget: (budgetData) => {
    return api.post('/hr/training/budgets', budgetData);
  },

  // ==================== COMPLIANCE TRAINING ====================
  getComplianceTraining: (params = {}) => {
    return api.get('/hr/training/compliance', { params });
  },

  createComplianceTraining: (complianceData) => {
    return api.post('/hr/training/compliance', complianceData);
  },

  // ==================== ANALYTICS ====================
  getTrainingAnalytics: (params = {}) => {
    return api.get('/hr/training/analytics', { params });
  },

  getDashboardStats: () => {
    return api.get('/hr/training/dashboard-stats');
  },

  // ==================== UTILITY FUNCTIONS ====================
  getCourseStatusColor: (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-yellow-100 text-yellow-800',
      'archived': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  },

  getEnrollmentStatusColor: (status) => {
    const colors = {
      'enrolled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'no_show': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || colors.enrolled;
  },

  getSessionStatusColor: (status) => {
    const colors = {
      'scheduled': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'postponed': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || colors.scheduled;
  },

  getBudgetStatusColor: (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'active': 'bg-green-100 text-green-800',
      'exhausted': 'bg-red-100 text-red-800',
      'expired': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.draft;
  },

  getInstructorStatusColor: (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'suspended': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.pending_approval;
  },

  formatDuration: (hours) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
    }
  },

  formatCurrency: (amount, currency = 'NGN') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  calculateProgress: (current, total) => {
    if (total === 0) return 0;
    return Math.round((current / total) * 100);
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatDateTime: (date) => {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  getCategoryIcon: (category) => {
    const icons = {
      'technical': '💻',
      'soft_skills': '🤝',
      'leadership': '👑',
      'compliance': '📋',
      'safety': '🛡️',
      'professional_development': '📈',
      'certification': '🏆'
    };
    return icons[category] || '📚';
  },

  getLevelColor: (level) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-orange-100 text-orange-800',
      'expert': 'bg-red-100 text-red-800',
      'mixed': 'bg-purple-100 text-purple-800'
    };
    return colors[level] || colors.beginner;
  },

  getCompletionRate: (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  getBudgetUtilization: (spent, allocated) => {
    if (allocated === 0) return 0;
    return Math.round((spent / allocated) * 100);
  },

  isOverdue: (deadline) => {
    return new Date(deadline) < new Date();
  },

  getDaysUntilDeadline: (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  getUrgencyColor: (deadline) => {
    const daysLeft = this.getDaysUntilDeadline(deadline);
    if (daysLeft < 0) return 'text-red-600'; // Overdue
    if (daysLeft <= 3) return 'text-orange-600'; // Urgent
    if (daysLeft <= 7) return 'text-yellow-600'; // Warning
    return 'text-green-600'; // Good
  }
};

export default trainingService;