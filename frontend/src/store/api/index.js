/**
 * RTK Query API Exports
 * 
 * Central export point for all API slices
 */

export { baseApi, TAG_TYPES } from './baseApi';
export { projectsApi } from './projectsApi';
export { hrApi } from './hrApi';
export { dashboardApi } from './dashboardApi';

// Re-export all hooks for convenience
export * from './projectsApi';
export * from './hrApi';
export * from './dashboardApi';
