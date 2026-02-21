/**
 * useWidgetData Hook
 * 
 * Custom hook to fetch widget data with caching and polling support.
 * Handles loading, error states, and manual refresh.
 * 
 * Requirements: 4.5, 7.2, 7.3
 */

import { useCallback } from 'react';
import {
  useGetWidgetDataQuery,
  useRefreshWidgetDataMutation,
} from '@/store/api/widgetDataApi';

/**
 * Hook to fetch and manage widget data
 * 
 * @param {Object} params - Hook parameters
 * @param {string} params.widgetType - Widget type identifier (required)
 * @param {Object} [params.config] - Widget configuration object
 * @param {Object} [params.options] - Additional options
 * @param {number} [params.options.pollingInterval] - Polling interval in milliseconds (0 = no polling)
 * @param {boolean} [params.options.skip] - Skip the query (useful for conditional fetching)
 * @param {string} [params.options.role] - Override role for RBAC filtering
 * @returns {Object} Widget data and query state
 * @returns {*} data - Widget data
 * @returns {boolean} loading - True if query is loading
 * @returns {Object} error - Error object if query failed
 * @returns {Function} refetch - Function to manually refetch data
 * @returns {string} lastUpdate - ISO timestamp of last update
 * @returns {boolean} isRefreshing - True if refresh mutation is in progress
 */
export function useWidgetData({ widgetType, config, options = {} }) {
  const {
    pollingInterval = 0,
    skip = false,
    role,
  } = options;
  
  // Fetch widget data with optional polling
  const {
    data: widgetResponse,
    isLoading: loading,
    error,
    refetch,
  } = useGetWidgetDataQuery(
    { widgetType, role, config },
    {
      skip: skip || !widgetType,
      pollingInterval: pollingInterval > 0 ? pollingInterval : undefined,
    }
  );
  
  // Refresh widget data mutation (bypass cache)
  const [
    refreshWidget,
    {
      isLoading: isRefreshing,
    },
  ] = useRefreshWidgetDataMutation();
  
  // Extract data and metadata
  const data = widgetResponse?.data || null;
  const lastUpdate = widgetResponse?.lastUpdated || null;
  
  /**
   * Manual refresh function that bypasses cache
   * 
   * @returns {Promise} Promise that resolves when refresh completes
   */
  const refresh = useCallback(
    async () => {
      try {
        await refreshWidget({ widgetType, config }).unwrap();
      } catch (error) {
        console.error('Failed to refresh widget data:', error);
        throw error;
      }
    },
    [widgetType, config, refreshWidget]
  );
  
  return {
    data,
    loading,
    error,
    refetch: refresh,
    lastUpdate,
    isRefreshing,
  };
}
