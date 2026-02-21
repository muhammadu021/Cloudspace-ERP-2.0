import api from './api';
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

const performanceService = {
  // Review Cycles
  getReviewCycles: (params = {}) => {
    const company_id = getCompanyId();
    return api.get('/hr/performance/cycles', { params: { ...params, company_id } });
  },

  createReviewCycle: (cycleData) => {
    const company_id = getCompanyId();
    return api.post('/hr/performance/cycles', { ...cycleData, company_id });
  },

  updateReviewCycle: (id, cycleData) => {
    return api.put(`/hr/performance/cycles/${id}`, cycleData);
  },

  deleteReviewCycle: (id) => {
    return api.delete(`/hr/performance/cycles/${id}`);
  },

  // Performance Reviews
  getReviews: (params = {}) => {
    return api.get('/hr/performance/reviews', { params });
  },

  getReview: (id) => {
    return api.get(`/hr/performance/reviews/${id}`);
  },

  createReview: (reviewData) => {
    return api.post('/hr/performance/reviews', reviewData);
  },

  updateReview: (id, reviewData) => {
    return api.put(`/hr/performance/reviews/${id}`, reviewData);
  },

  submitReview: (id) => {
    return api.patch(`/hr/performance/reviews/${id}/submit`);
  },

  approveReview: (id) => {
    return api.patch(`/hr/performance/reviews/${id}/approve`);
  },

  // Goals
  getGoals: (params = {}) => {
    return api.get('/hr/performance/goals', { params });
  },

  createGoal: (goalData) => {
    return api.post('/hr/performance/goals', goalData);
  },

  updateGoal: (id, goalData) => {
    return api.put(`/hr/performance/goals/${id}`, goalData);
  },

  updateGoalProgress: (id, progress) => {
    return api.patch(`/hr/performance/goals/${id}/progress`, { progress });
  },

  // 360 Feedback
  getFeedbackRequests: (params = {}) => {
    return api.get('/hr/performance/feedback', { params });
  },

  createFeedbackRequest: (feedbackData) => {
    return api.post('/hr/performance/feedback', feedbackData);
  },

  submitFeedback: (id, feedbackData) => {
    return api.post(`/hr/performance/feedback/${id}/submit`, feedbackData);
  },

  // Performance Improvement Plans
  getPIPs: (params = {}) => {
    return api.get('/hr/performance/pips', { params });
  },

  createPIP: (pipData) => {
    return api.post('/hr/performance/pips', pipData);
  },

  updatePIP: (id, pipData) => {
    return api.put(`/hr/performance/pips/${id}`, pipData);
  },

  // Career Development Plans
  getCareerPlans: (params = {}) => {
    return api.get('/hr/performance/career-plans', { params });
  },

  createCareerPlan: (planData) => {
    return api.post('/hr/performance/career-plans', planData);
  },

  updateCareerPlan: (id, planData) => {
    return api.put(`/hr/performance/career-plans/${id}`, planData);
  },

  // Career Paths
  getCareerPaths: (params = {}) => {
    return api.get('/hr/performance/career-paths', { params });
  },

  createCareerPath: (pathData) => {
    return api.post('/hr/performance/career-paths', pathData);
  },

  updateCareerPath: (id, pathData) => {
    return api.put(`/hr/performance/career-paths/${id}`, pathData);
  },

  // Skill Assessments
  getSkillAssessments: (params = {}) => {
    return api.get('/hr/performance/skill-assessments', { params });
  },

  createSkillAssessment: (assessmentData) => {
    return api.post('/hr/performance/skill-assessments', assessmentData);
  },

  updateSkillAssessment: (id, assessmentData) => {
    return api.put(`/hr/performance/skill-assessments/${id}`, assessmentData);
  },

  completeSkillAssessment: (id) => {
    return api.patch(`/hr/performance/skill-assessments/${id}/complete`);
  },

  // Analytics
  getPerformanceAnalytics: (params = {}) => {
    return api.get('/hr/performance/analytics', { params });
  },

  getTeamPerformance: (params = {}) => {
    return api.get('/hr/performance/team-analytics', { params });
  },

  // Rating Scales
  getRatingScales: () => {
    return api.get('/hr/performance/rating-scales');
  },

  createRatingScale: (scaleData) => {
    return api.post('/hr/performance/rating-scales', scaleData);
  },

  // Templates
  getReviewTemplates: (params = {}) => {
    return api.get('/hr/performance/templates', { params });
  },

  getTemplate: (id) => {
    return api.get(`/hr/performance/templates/${id}`);
  },

  createReviewTemplate: (templateData) => {
    return api.post('/hr/performance/templates', templateData);
  },

  // Dashboard Stats
  getDashboardStats: (params = {}) => {
    return api.get('/hr/performance/dashboard-stats', { params });
  },

  // PIP Progress
  updatePIPProgress: (id, progressData) => {
    return api.post(`/hr/performance/pips/${id}/progress`, progressData);
  },

  completePIP: (id, outcomeData) => {
    return api.patch(`/hr/performance/pips/${id}/complete`, outcomeData);
  },

  // Utility functions
  calculateOverallRating: (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.score, 0);
    return (sum / ratings.length).toFixed(1);
  },

  getPerformanceLevel: (rating) => {
    if (rating >= 4.5) return { level: 'Exceptional', color: 'text-green-600', bg: 'bg-green-100' };
    if (rating >= 3.5) return { level: 'Exceeds Expectations', color: 'text-primary', bg: 'bg-blue-100' };
    if (rating >= 2.5) return { level: 'Meets Expectations', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (rating >= 1.5) return { level: 'Below Expectations', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { level: 'Needs Improvement', color: 'text-red-600', bg: 'bg-red-100' };
  },

  getGoalStatusColor: (status) => {
    const colors = {
      'not_started': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.not_started;
  },

  getReviewStatusColor: (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'pending_approval': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.draft;
  },

  formatDate: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  calculateGoalProgress: (goals) => {
    if (!goals || goals.length === 0) return 0;
    const totalProgress = goals.reduce((acc, goal) => acc + (goal.progress || 0), 0);
    return Math.round(totalProgress / goals.length);
  },

  getPIPStatusColor: (status) => {
    const colors = {
      'active': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'terminated': 'bg-red-100 text-red-800',
      'extended': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.active;
  },

  getCareerPlanStatusColor: (status) => {
    const colors = {
      'active': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on_hold': 'bg-yellow-100 text-yellow-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'achieved': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || colors.active;
  },

  getFeedbackStatusColor: (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'overdue': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  },

  calculateCompetencyScore: (competencies) => {
    if (!competencies || Object.keys(competencies).length === 0) return 0;
    const scores = Object.values(competencies).filter(score => typeof score === 'number');
    if (scores.length === 0) return 0;
    const sum = scores.reduce((acc, score) => acc + score, 0);
    return (sum / scores.length).toFixed(1);
  },

  getSkillLevel: (score) => {
    if (score >= 4.5) return { level: 'Expert', color: 'text-green-600' };
    if (score >= 3.5) return { level: 'Advanced', color: 'text-primary' };
    if (score >= 2.5) return { level: 'Intermediate', color: 'text-yellow-600' };
    if (score >= 1.5) return { level: 'Beginner', color: 'text-orange-600' };
    return { level: 'Novice', color: 'text-red-600' };
  }
};

export default performanceService;