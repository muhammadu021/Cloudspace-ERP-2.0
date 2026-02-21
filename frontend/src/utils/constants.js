import { API_URL } from "../services/api"

// API Configuration
export const API_BASE_URL = API_URL
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Cloudspace ERP'
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '1.0.0'

// File Upload
export const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760 // 10MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed'
]

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  HR_MANAGER: 'hr_manager',
  FINANCE_MANAGER: 'finance_manager',
  PROJECT_MANAGER: 'project_manager',
  EMPLOYEE: 'employee',
  INTERN: 'intern',
  CONTRACTOR: 'contractor'
}

// Project Status
export const PROJECT_STATUS = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

// Priority Levels
export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

// Leave Types
export const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  PERSONAL: 'personal',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  EMERGENCY: 'emergency',
  BEREAVEMENT: 'bereavement',
  STUDY: 'study'
}

// Leave Status
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
}

// Employment Status
export const EMPLOYMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TERMINATED: 'terminated',
  RESIGNED: 'resigned',
  RETIRED: 'retired'
}

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half_day',
  ON_LEAVE: 'on_leave'
}

// Inventory Categories
export const INVENTORY_CATEGORIES = {
  OFFICE_SUPPLIES: 'office_supplies',
  EQUIPMENT: 'equipment',
  FURNITURE: 'furniture',
  TECHNOLOGY: 'technology',
  CONSUMABLES: 'consumables',
  MAINTENANCE: 'maintenance',
  OTHER: 'other'
}

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
  TRANSFER: 'transfer',
  ADJUSTMENT: 'adjustment'
}

// Account Types
export const ACCOUNT_TYPES = {
  ASSET: 'asset',
  LIABILITY: 'liability',
  EQUITY: 'equity',
  REVENUE: 'revenue',
  EXPENSE: 'expense'
}

// Currency Settings
export const DEFAULT_CURRENCY = 'NGN'
export const CURRENCY_SYMBOL = '₦'
export const CURRENCY_OPTIONS = [
  { value: 'NGN', label: 'Nigerian Naira (₦)', symbol: '₦' },
  { value: 'USD', label: 'US Dollar ($)', symbol: '$' },
  { value: 'EUR', label: 'Euro (€)', symbol: '€' },
  { value: 'GBP', label: 'British Pound (£)', symbol: '£' }
]

// File Visibility
export const FILE_VISIBILITY = {
  PUBLIC: 'public',
  DEPARTMENT: 'department',
  ADMIN: 'admin',
  PRIVATE: 'private'
}

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
}

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  WITH_TIME: 'MMM dd, yyyy HH:mm',
  TIME_ONLY: 'HH:mm',
  ISO: 'yyyy-MM-dd'
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100
}

// Chart Colors
export const CHART_COLORS = [
  '#2563eb', // blue-600
  '#16a34a', // green-600
  '#d97706', // amber-600
  '#dc2626', // red-600
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
  '#ea580c', // orange-600
  '#be185d', // pink-600
  '#4338ca', // indigo-600
  '#059669'  // emerald-600
]

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  DASHBOARD_PREFERENCES: 'dashboard_preferences'
}

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },
  USERS: '/users',
  PROJECTS: '/projects',
  TASKS: '/tasks',
  INVENTORY: '/inventory',
  HR: '/hr',
  FINANCE: '/finance',
  ADMIN: '/admin',
  SELF_SERVICE: '/self-service',
  COLLABORATION: '/collaboration',
  FILE_SHARE: '/file-share',
  DASHBOARD: '/dashboard'
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  FILE_TOO_LARGE: `File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Created successfully!',
  UPDATED: 'Updated successfully!',
  DELETED: 'Deleted successfully!',
  SAVED: 'Saved successfully!',
  SENT: 'Sent successfully!',
  UPLOADED: 'Uploaded successfully!',
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  EMAIL_SENT: 'Email sent successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!'
}

// Regex Patterns
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
  NUMERIC: /^\d+$/,
  DECIMAL: /^\d+(\.\d{1,2})?$/
}