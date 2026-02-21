import api, { API_URL } from './api'
import axios from 'axios'
import { appConfig } from '@/config/appConfig'

const API_BASE_URL = API_URL

export const authService = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => {
    const company_id = localStorage.getItem('company_id');
    console.log('Register - company_id from localStorage:', company_id);
    return api.post('/auth/register', { ...userData, company_id });
  },
  logout: () => api.post('/auth/logout'),
  refreshToken: (refreshToken) => {
    if (appConfig.demoMode) {
      return api.post('/auth/refresh', { refreshToken });
    }

    return axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000
    });
  },
  
  // Password management
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  changePassword: (currentPassword, newPassword) => 
    api.post('/auth/change-password', { 
      current_password: currentPassword, 
      new_password: newPassword 
    }),
  
  // Email verification
  verifyEmail: (token) => api.post('/auth/verify-email', { token }),
  
  // User info
  getCurrentUser: () => api.get('/auth/me'),
}