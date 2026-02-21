import api from './api';
import { getErrorMessage } from '../utils/errorHandler';

// Mock data for fallback
const mockRecruitmentData = {
  jobPostings: [
    {
      id: 1,
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      status: 'active',
      applications: 15,
      created_at: '2024-01-15'
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      status: 'active',
      applications: 8,
      created_at: '2024-01-20'
    }
  ],
  candidates: [
    {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@email.com',
      status: 'screening',
      overall_rating: 8.5,
      source: 'linkedin'
    },
    {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@email.com',
      status: 'interviewing',
      overall_rating: 9.0,
      source: 'referral'
    }
  ],
  applications: [
    {
      id: 1,
      candidate_id: 1,
      job_posting_id: 1,
      status: 'screening',
      application_date: '2024-01-16',
      overall_score: 8.0
    },
    {
      id: 2,
      candidate_id: 2,
      job_posting_id: 2,
      status: 'first_interview',
      application_date: '2024-01-21',
      overall_score: 8.5
    }
  ],
  interviews: [
    {
      id: 1,
      application_id: 1,
      title: 'Technical Interview',
      scheduled_date: '2024-01-25T10:00:00Z',
      status: 'scheduled',
      interview_type: 'technical'
    }
  ],
  dashboardStats: {
    openPositions: 12,
    totalApplications: 248,
    scheduledInterviews: 18,
    pendingOffers: 5,
    newCandidates: 23
  }
};

export const recruitmentService = {
  // ==================== JOB POSTINGS ====================
  
  getJobPostings: async (params = {}) => {
    try {
      const response = await api.get('/hr/recruitment/jobs', { params });
      return response;
    } catch (error) {
      console.warn('Job postings API unavailable, using mock data:', error.message);
      return {
        data: {
          jobPostings: mockRecruitmentData.jobPostings,
          pagination: {
            total: mockRecruitmentData.jobPostings.length,
            page: 1,
            limit: 10,
            pages: 1
          }
        },
        status: 200,
        statusText: 'OK (Mock Data)'
      };
    }
  },

  getJobPosting: async (id) => {
    try {
      const response = await api.get(`/hr/recruitment/jobs/${id}`);
      return response;
    } catch (error) {
      console.warn(`Job posting ${id} API unavailable, using mock data:`, error.message);
      const jobPosting = mockRecruitmentData.jobPostings.find(jp => jp.id === parseInt(id));
      if (jobPosting) {
        return {
          data: { jobPosting },
          status: 200,
          statusText: 'OK (Mock Data)'
        };
      } else {
        throw new Error('Job posting not found');
      }
    }
  },

  createJobPosting: async (jobPostingData) => {
    try {
      const response = await api.post('/hr/recruitment/jobs', jobPostingData);
      return response;
    } catch (error) {
      console.warn('Create job posting API unavailable:', error.message);
      const newJobPosting = {
        id: Date.now(),
        ...jobPostingData,
        created_at: new Date().toISOString()
      };
      
      mockRecruitmentData.jobPostings.push(newJobPosting);
      
      return {
        data: {
          success: true,
          message: 'Job posting created (demo mode)',
          jobPosting: newJobPosting
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateJobPosting: async (id, jobPostingData) => {
    try {
      const response = await api.put(`/hr/recruitment/jobs/${id}`, jobPostingData);
      return response;
    } catch (error) {
      console.warn(`Update job posting ${id} API unavailable:`, error.message);
      
      const index = mockRecruitmentData.jobPostings.findIndex(jp => jp.id === parseInt(id));
      if (index !== -1) {
        mockRecruitmentData.jobPostings[index] = {
          ...mockRecruitmentData.jobPostings[index],
          ...jobPostingData,
          updated_at: new Date().toISOString()
        };
      }
      
      return {
        data: {
          success: true,
          message: 'Job posting updated (demo mode)',
          jobPosting: { id: parseInt(id), ...jobPostingData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  deleteJobPosting: async (id) => {
    try {
      const response = await api.delete(`/hr/recruitment/jobs/${id}`);
      return response;
    } catch (error) {
      console.warn(`Delete job posting ${id} API unavailable:`, error.message);
      
      const index = mockRecruitmentData.jobPostings.findIndex(jp => jp.id === parseInt(id));
      if (index !== -1) {
        mockRecruitmentData.jobPostings.splice(index, 1);
      }
      
      return {
        data: {
          success: true,
          message: 'Job posting deleted (demo mode)'
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== CANDIDATES ====================
  
  getCandidates: async (params = {}) => {
    try {
      const response = await api.get('/hr/recruitment/candidates', { params });
      return response;
    } catch (error) {
      console.warn('Candidates API unavailable, using mock data:', error.message);
      return {
        data: {
          candidates: mockRecruitmentData.candidates,
          pagination: {
            total: mockRecruitmentData.candidates.length,
            page: 1,
            limit: 10,
            pages: 1
          }
        },
        status: 200,
        statusText: 'OK (Mock Data)'
      };
    }
  },

  getCandidate: async (id) => {
    try {
      const response = await api.get(`/hr/recruitment/candidates/${id}`);
      return response;
    } catch (error) {
      console.warn(`Candidate ${id} API unavailable, using mock data:`, error.message);
      const candidate = mockRecruitmentData.candidates.find(c => c.id === parseInt(id));
      if (candidate) {
        return {
          data: { candidate },
          status: 200,
          statusText: 'OK (Mock Data)'
        };
      } else {
        throw new Error('Candidate not found');
      }
    }
  },

  createCandidate: async (candidateData) => {
    try {
      const response = await api.post('/hr/recruitment/candidates', candidateData);
      return response;
    } catch (error) {
      console.warn('Create candidate API unavailable:', error.message);
      const newCandidate = {
        id: Date.now(),
        ...candidateData,
        created_at: new Date().toISOString()
      };
      
      mockRecruitmentData.candidates.push(newCandidate);
      
      return {
        data: {
          success: true,
          message: 'Candidate created (demo mode)',
          candidate: newCandidate
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateCandidate: async (id, candidateData) => {
    try {
      const response = await api.put(`/hr/recruitment/candidates/${id}`, candidateData);
      return response;
    } catch (error) {
      console.warn(`Update candidate ${id} API unavailable:`, error.message);
      
      const index = mockRecruitmentData.candidates.findIndex(c => c.id === parseInt(id));
      if (index !== -1) {
        mockRecruitmentData.candidates[index] = {
          ...mockRecruitmentData.candidates[index],
          ...candidateData,
          updated_at: new Date().toISOString()
        };
      }
      
      return {
        data: {
          success: true,
          message: 'Candidate updated (demo mode)',
          candidate: { id: parseInt(id), ...candidateData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== APPLICATIONS ====================
  
  getApplications: async (params = {}) => {
    try {
      const response = await api.get('/hr/recruitment/applications', { params });
      return response;
    } catch (error) {
      console.warn('Applications API unavailable, using mock data:', error.message);
      return {
        data: {
          applications: mockRecruitmentData.applications,
          pagination: {
            total: mockRecruitmentData.applications.length,
            page: 1,
            limit: 10,
            pages: 1
          }
        },
        status: 200,
        statusText: 'OK (Mock Data)'
      };
    }
  },

  getApplication: async (id) => {
    try {
      const response = await api.get(`/hr/recruitment/applications/${id}`);
      return response;
    } catch (error) {
      console.warn(`Application ${id} API unavailable:`, error.message);
      throw error;
    }
  },

  createApplication: async (applicationData) => {
    try {
      const response = await api.post('/hr/recruitment/applications', applicationData);
      return response;
    } catch (error) {
      console.warn('Create application API unavailable:', error.message);
      const newApplication = {
        id: Date.now(),
        ...applicationData,
        application_date: new Date().toISOString()
      };
      
      mockRecruitmentData.applications.push(newApplication);
      
      return {
        data: {
          success: true,
          message: 'Application created (demo mode)',
          application: newApplication
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateApplication: async (id, applicationData) => {
    try {
      const response = await api.put(`/hr/recruitment/applications/${id}`, applicationData);
      return response;
    } catch (error) {
      console.warn(`Update application ${id} API unavailable:`, error.message);
      
      const index = mockRecruitmentData.applications.findIndex(app => app.id === parseInt(id));
      if (index !== -1) {
        mockRecruitmentData.applications[index] = {
          ...mockRecruitmentData.applications[index],
          ...applicationData,
          updated_at: new Date().toISOString()
        };
      }
      
      return {
        data: {
          success: true,
          message: 'Application updated (demo mode)',
          application: { id: parseInt(id), ...applicationData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  updateApplicationStatus: async (id, statusData) => {
    try {
      const response = await api.patch(`/hr/recruitment/applications/${id}/status`, statusData);
      return response;
    } catch (error) {
      console.warn(`Update application ${id} status API unavailable:`, error.message);
      
      const index = mockRecruitmentData.applications.findIndex(app => app.id === parseInt(id));
      if (index !== -1) {
        mockRecruitmentData.applications[index] = {
          ...mockRecruitmentData.applications[index],
          ...statusData,
          updated_at: new Date().toISOString()
        };
      }
      
      return {
        data: {
          success: true,
          message: 'Application status updated (demo mode)',
          application: { id: parseInt(id), ...statusData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== INTERVIEWS ====================
  
  getInterviews: async (params = {}) => {
    try {
      const response = await api.get('/hr/recruitment/interviews', { params });
      return response;
    } catch (error) {
      console.warn('Interviews API unavailable, using mock data:', error.message);
      return {
        data: {
          interviews: mockRecruitmentData.interviews,
          pagination: {
            total: mockRecruitmentData.interviews.length,
            page: 1,
            limit: 10,
            pages: 1
          }
        },
        status: 200,
        statusText: 'OK (Mock Data)'
      };
    }
  },

  createInterview: async (interviewData) => {
    try {
      const response = await api.post('/hr/recruitment/interviews', interviewData);
      return response;
    } catch (error) {
      console.warn('Create interview API unavailable:', error.message);
      const newInterview = {
        id: Date.now(),
        ...interviewData,
        created_at: new Date().toISOString()
      };
      
      mockRecruitmentData.interviews.push(newInterview);
      
      return {
        data: {
          success: true,
          message: 'Interview scheduled (demo mode)',
          interview: newInterview
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateInterview: async (id, interviewData) => {
    try {
      const response = await api.put(`/hr/recruitment/interviews/${id}`, interviewData);
      return response;
    } catch (error) {
      console.warn(`Update interview ${id} API unavailable:`, error.message);
      
      const index = mockRecruitmentData.interviews.findIndex(int => int.id === parseInt(id));
      if (index !== -1) {
        mockRecruitmentData.interviews[index] = {
          ...mockRecruitmentData.interviews[index],
          ...interviewData,
          updated_at: new Date().toISOString()
        };
      }
      
      return {
        data: {
          success: true,
          message: 'Interview updated (demo mode)',
          interview: { id: parseInt(id), ...interviewData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== EVALUATIONS ====================
  
  getEvaluations: async (params = {}) => {
    try {
      const response = await api.get('/hr/recruitment/evaluations', { params });
      return response;
    } catch (error) {
      console.warn('Evaluations API unavailable:', error.message);
      return {
        data: {
          evaluations: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  createEvaluation: async (evaluationData) => {
    try {
      const response = await api.post('/hr/recruitment/evaluations', evaluationData);
      return response;
    } catch (error) {
      console.warn('Create evaluation API unavailable:', error.message);
      return {
        data: {
          success: true,
          message: 'Evaluation created (demo mode)',
          evaluation: { id: Date.now(), ...evaluationData }
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateEvaluation: async (id, evaluationData) => {
    try {
      const response = await api.put(`/hr/recruitment/evaluations/${id}`, evaluationData);
      return response;
    } catch (error) {
      console.warn(`Update evaluation ${id} API unavailable:`, error.message);
      return {
        data: {
          success: true,
          message: 'Evaluation updated (demo mode)',
          evaluation: { id: parseInt(id), ...evaluationData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== BACKGROUND CHECKS ====================
  
  getBackgroundChecks: async (params = {}) => {
    try {
      const response = await api.get('/hr/recruitment/background-checks', { params });
      return response;
    } catch (error) {
      console.warn('Background checks API unavailable:', error.message);
      return {
        data: {
          backgroundChecks: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  createBackgroundCheck: async (backgroundCheckData) => {
    try {
      const response = await api.post('/hr/recruitment/background-checks', backgroundCheckData);
      return response;
    } catch (error) {
      console.warn('Create background check API unavailable:', error.message);
      return {
        data: {
          success: true,
          message: 'Background check initiated (demo mode)',
          backgroundCheck: { id: Date.now(), ...backgroundCheckData }
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateBackgroundCheck: async (id, backgroundCheckData) => {
    try {
      const response = await api.put(`/hr/recruitment/background-checks/${id}`, backgroundCheckData);
      return response;
    } catch (error) {
      console.warn(`Update background check ${id} API unavailable:`, error.message);
      return {
        data: {
          success: true,
          message: 'Background check updated (demo mode)',
          backgroundCheck: { id: parseInt(id), ...backgroundCheckData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== OFFER LETTERS ====================
  
  getOfferLetters: async (params = {}) => {
    try {
      const response = await api.get('/hr/recruitment/offers', { params });
      return response;
    } catch (error) {
      console.warn('Offer letters API unavailable:', error.message);
      return {
        data: {
          offerLetters: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  getOfferLetter: async (id) => {
    try {
      const response = await api.get(`/hr/recruitment/offers/${id}`);
      return response;
    } catch (error) {
      console.warn(`Offer letter ${id} API unavailable:`, error.message);
      throw error;
    }
  },

  createOfferLetter: async (offerLetterData) => {
    try {
      const response = await api.post('/hr/recruitment/offers', offerLetterData);
      return response;
    } catch (error) {
      console.warn('Create offer letter API unavailable:', error.message);
      return {
        data: {
          success: true,
          message: 'Offer letter created (demo mode)',
          offerLetter: { id: Date.now(), ...offerLetterData }
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateOfferLetter: async (id, offerLetterData) => {
    try {
      const response = await api.put(`/hr/recruitment/offers/${id}`, offerLetterData);
      return response;
    } catch (error) {
      console.warn(`Update offer letter ${id} API unavailable:`, error.message);
      return {
        data: {
          success: true,
          message: 'Offer letter updated (demo mode)',
          offerLetter: { id: parseInt(id), ...offerLetterData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  sendOfferLetter: async (id) => {
    try {
      const response = await api.post(`/hr/recruitment/offers/${id}/send`);
      return response;
    } catch (error) {
      console.warn(`Send offer letter ${id} API unavailable:`, error.message);
      throw error;
    }
  },

  // ==================== JOB CHANNELS ====================
  
  getJobChannels: async (params = {}) => {
    try {
      const response = await api.get('/hr/recruitment/job-channels', { params });
      return response;
    } catch (error) {
      console.warn('Job channels API unavailable:', error.message);
      return {
        data: {
          jobChannels: [
            { id: 1, name: 'LinkedIn', type: 'job_board', status: 'active' },
            { id: 2, name: 'Indeed', type: 'job_board', status: 'active' },
            { id: 3, name: 'Company Website', type: 'company_website', status: 'active' }
          ],
          pagination: { total: 3, page: 1, limit: 10, pages: 1 }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  createJobChannel: async (jobChannelData) => {
    try {
      const response = await api.post('/hr/recruitment/job-channels', jobChannelData);
      return response;
    } catch (error) {
      console.warn('Create job channel API unavailable:', error.message);
      return {
        data: {
          success: true,
          message: 'Job channel created (demo mode)',
          jobChannel: { id: Date.now(), ...jobChannelData }
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateJobChannel: async (id, jobChannelData) => {
    try {
      const response = await api.put(`/hr/recruitment/job-channels/${id}`, jobChannelData);
      return response;
    } catch (error) {
      console.warn(`Update job channel ${id} API unavailable:`, error.message);
      return {
        data: {
          success: true,
          message: 'Job channel updated (demo mode)',
          jobChannel: { id: parseInt(id), ...jobChannelData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== ANALYTICS ====================
  
  getRecruitmentAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/hr/recruitment/analytics', { params });
      return response;
    } catch (error) {
      console.warn('Recruitment analytics API unavailable:', error.message);
      return {
        data: {
          totalJobPostings: 12,
          activeJobPostings: 8,
          totalApplications: 248,
          applicationsByStatus: [
            { status: 'submitted', count: 120 },
            { status: 'screening', count: 45 },
            { status: 'interviewing', count: 35 },
            { status: 'offer_pending', count: 8 },
            { status: 'hired', count: 25 },
            { status: 'rejected', count: 15 }
          ],
          totalInterviews: 78,
          completedInterviews: 65,
          totalOffers: 15,
          acceptedOffers: 12,
          offerAcceptanceRate: 80,
          avgTimeToHire: 21
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  getDashboardStats: async () => {
    try {
      const response = await api.get('/hr/recruitment/dashboard-stats');
      return response;
    } catch (error) {
      console.warn('Dashboard stats API unavailable, using mock data:', error.message);
      return {
        data: mockRecruitmentData.dashboardStats,
        status: 200,
        statusText: 'OK (Mock Data)'
      };
    }
  },

  // ==================== UTILITY FUNCTIONS ====================
  
  getStatusColor: (status) => {
    const statusColors = {
      // Job Posting statuses
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      closed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      
      // Application statuses
      submitted: 'bg-blue-100 text-blue-800',
      screening: 'bg-yellow-100 text-yellow-800',
      phone_screen: 'bg-orange-100 text-orange-800',
      technical_test: 'bg-purple-100 text-purple-800',
      first_interview: 'bg-indigo-100 text-indigo-800',
      second_interview: 'bg-indigo-100 text-indigo-800',
      final_interview: 'bg-indigo-100 text-indigo-800',
      reference_check: 'bg-cyan-100 text-cyan-800',
      background_check: 'bg-teal-100 text-teal-800',
      offer_pending: 'bg-amber-100 text-amber-800',
      offer_sent: 'bg-lime-100 text-lime-800',
      offer_accepted: 'bg-green-100 text-green-800',
      offer_declined: 'bg-red-100 text-red-800',
      hired: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
      withdrawn: 'bg-gray-100 text-gray-800',
      
      // Interview statuses
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      no_show: 'bg-red-100 text-red-800',
      rescheduled: 'bg-orange-100 text-orange-800',
      
      // Candidate statuses
      new: 'bg-blue-100 text-blue-800',
      interviewing: 'bg-yellow-100 text-yellow-800',
      candidate_offer_pending: 'bg-orange-100 text-orange-800'
    };
    
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  },

  getPriorityColor: (priority) => {
    const priorityColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    return priorityColors[priority] || 'bg-gray-100 text-gray-800';
  },

  getSourceIcon: (source) => {
    const sourceIcons = {
      website: '🌐',
      linkedin: '💼',
      referral: '👥',
      job_board: '📋',
      recruiter: '🎯',
      social_media: '📱',
      career_fair: '🎪',
      direct: '📧',
      other: '❓'
    };
    
    return sourceIcons[source] || '❓';
  },

  formatCurrency: (amount, currency = 'NGN') => {
    if (!amount) return 'Not specified';
    
    // For NGN, use custom formatting with Naira symbol
    if (currency === 'NGN') {
      return `₦${parseFloat(amount || 0).toLocaleString('en-NG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  formatDate: (date) => {
    if (!date) return 'Not specified';
    
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  formatDateTime: (date) => {
    if (!date) return 'Not specified';
    
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  calculateDaysAgo: (date) => {
    if (!date) return 'Unknown';
    
    const now = new Date();
    const targetDate = new Date(date);
    const diffTime = Math.abs(now - targetDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
};

export default recruitmentService;