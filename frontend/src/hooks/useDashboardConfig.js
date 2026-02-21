/**
 * useDashboardConfig Hook
 * 
 * Custom hook to fetch dashboard configuration for a specific role.
 * Handles loading and error states.
 * 
 * Requirements: 3.1, 3.2
 */

import { useGetDashboardConfigQuery } from '@/store/api/dashboardConfigApi';

/**
 * Hook to get dashboard configuration
 * 
 * @param {Object} params - Hook parameters
 * @param {string} params.role - Dashboard role identifier (required)
 * @param {string} [params.selectedType] - Optional selected dashboard type (for System Admin)
 * @param {number} [params.version] - Optional version number (defaults to active version)
 * @param {boolean} [params.skip] - Skip the query (useful for conditional fetching)
 * @returns {Object} Configuration data and query state
 * @returns {Object} config - Dashboard configuration object
 * @returns {boolean} loading - True if query is loading
 * @returns {Object} error - Error object if query failed
 * @returns {Function} refetch - Function to manually refetch configuration
 */
export function useDashboardConfig({ role, selectedType, version, skip = false }) {
  // Determine effective role (use selectedType if provided, otherwise use role)
  const effectiveRole = selectedType || role;
  
  // Debug logging
  console.log('[useDashboardConfig] Input:', { role, selectedType, effectiveRole, skip });
  
  // Fetch dashboard configuration
  const {
    data: config,
    isLoading: loading,
    error,
    refetch,
    isFetching,
  } = useGetDashboardConfigQuery(
    { role: effectiveRole, version },
    { skip: skip || !effectiveRole }
  );
  
  console.log('[useDashboardConfig] Result:', { 
    configRole: config?.role, 
    configTitle: config?.configuration?.title,
    loading, 
    isFetching,
    error 
  });
  
  return {
    config,
    loading,
    error,
    refetch,
  };
}
