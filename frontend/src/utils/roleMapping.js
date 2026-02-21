/**
 * Role Mapping Utilities
 * Maps UserType values to dashboard roles
 * Requirements: 1.6
 */

// UserType to Role mapping
export const USER_TYPE_TO_ROLE = {
  'System Administrator': 'system-administrator',
  'System Admin': 'system-administrator', // Alias for demo data
  'Admin': 'admin',
  'Administrator': 'admin', // Alias
  'HR': 'hr',
  'Finance': 'finance',
  'Normal User': 'normal-user',
  'User': 'normal-user' // Alias
};

// Role to UserType mapping (reverse)
export const ROLE_TO_USER_TYPE = {
  'system-administrator': 'System Administrator',
  'admin': 'Admin',
  'hr': 'HR',
  'finance': 'Finance',
  'normal-user': 'Normal User'
};

// Dashboard type identifiers
export const DASHBOARD_TYPES = {
  SYSTEM_ADMIN: 'system-administrator',
  ADMIN: 'admin',
  HR: 'hr',
  FINANCE: 'finance',
  NORMAL_USER: 'normal-user'
};

/**
 * Get dashboard role from UserType
 * @param {string} userType - UserType from user object
 * @returns {string} Dashboard role identifier
 */
export function getUserRole(userType) {
  return USER_TYPE_TO_ROLE[userType] || 'normal-user';
}

/**
 * Check if user is System Administrator
 * @param {string} userType - UserType from user object
 * @returns {boolean} True if System Administrator
 */
export function isSystemAdministrator(userType) {
  return userType === 'System Administrator' || userType === 'System Admin';
}

/**
 * Get display name for role
 * @param {string} role - Role identifier
 * @returns {string} Display name
 */
export function getRoleDisplayName(role) {
  return ROLE_TO_USER_TYPE[role] || 'User';
}

/**
 * Get available dashboard types for System Administrator
 * @returns {array} Array of dashboard type objects
 */
export function getAvailableDashboardTypes() {
  return [
    { value: 'system-administrator', label: 'System Administrator Dashboard' },
    { value: 'admin', label: 'Admin Dashboard' },
    { value: 'hr', label: 'HR Dashboard' },
    { value: 'finance', label: 'Finance Dashboard' },
    { value: 'normal-user', label: 'Normal User Dashboard' }
  ];
}
