import api from './api';
import { getCompanyId } from '../utils/company';

// Anonymous Reviews
export const submitAnonymousReview = async (reviewData) => {
  const response = await api.post('/reviews/anonymous', reviewData);
  return response.data;
};

export const getAnonymousReviews = async (params = {}) => {
  const response = await api.get('/reviews/anonymous', { params });
  return response.data;
};

export const getAnonymousReviewById = async (id) => {
  const response = await api.get(`/reviews/anonymous/${id}`);
  return response.data;
};

export const getAnonymousReviewStats = async (year) => {
  const response = await api.get('/reviews/anonymous/stats', { params: { year } });
  return response.data;
};

// Performance Appraisals
export const submitPerformanceAppraisal = async (appraisalData) => {
  const response = await api.post('/reviews/performance-appraisal', appraisalData);
  return response.data;
};

export const getMyPerformanceAppraisals = async () => {
  const response = await api.get('/reviews/performance-appraisal/my');
  return response.data;
};

export const getPerformanceAppraisals = async (params = {}) => {
  const response = await api.get('/reviews/performance-appraisal', { params });
  return response.data;
};

export const getPerformanceAppraisalById = async (id) => {
  const response = await api.get(`/reviews/performance-appraisal/${id}`);
  return response.data;
};

export const updateAppraisalStatus = async (id, statusData) => {
  const response = await api.patch(`/reviews/performance-appraisal/${id}/status`, statusData);
  return response.data;
};

export const getPerformanceAppraisalStats = async (year) => {
  const response = await api.get('/reviews/performance-appraisal/stats', { params: { year } });
  return response.data;
};
