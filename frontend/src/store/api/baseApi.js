/**
 * RTK Query Base API Configuration
 * 
 * This file configures the base API for RTK Query with:
 * - fetchBaseQuery with authentication
 * - Tag types for cache invalidation
 * - Automatic cache management
 * - Demo mode compatibility
 * 
 * @see https://redux-toolkit.js.org/rtk-query/overview
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { appConfig } from '@/config/appConfig';

/**
 * Tag types for cache invalidation across all spaces
 * These tags are used to automatically invalidate and refetch data
 * when mutations occur.
 */
export const TAG_TYPES = [
  // Dashboard
  'Dashboard',
  'Widget',
  
  // Projects
  'Project',
  'Task',
  'Milestone',
  
  // HR
  'Employee',
  'Attendance',
  'Leave',
  'Department',
  'Position',
  
  // Finance
  'Transaction',
  'Budget',
  'Account',
  'ExpenseClaim',
  'Payroll',
  
  // Sales
  'Customer',
  'Order',
  'Lead',
  'Quote',
  'Invoice',
  
  // Inventory
  'InventoryItem',
  'StockMovement',
  'Location',
  'Category',
  
  // Admin
  'User',
  'Role',
  'Permission',
  'Setting',
  'Asset',
  'Document',
  
  // Support
  'Ticket',
  'FAQ',
  'TicketResponse',
  'Category',
  
  // User Preferences
  'Preferences',
];

/**
 * Custom base query with authentication and company ID injection
 */
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: appConfig.apiUrl,
  prepareHeaders: (headers, { getState }) => {
    // Get token from Redux state
    const token = getState().auth.token;
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Get company ID from user data
    const user = getState().auth.user;
    if (user) {
      const companyId = user?.Companies?.[0]?.id || user?.company_id;
      if (companyId) {
        headers.set('X-Company-Id', companyId);
      }
    }
    
    return headers;
  },
});

/**
 * Base query with automatic retry and error handling
 */
const baseQueryWithRetry = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);
  
  // Handle 401 errors (unauthorized)
  if (result.error && result.error.status === 401) {
    // In demo mode, don't try to refresh
    if (appConfig.demoMode) {
      return result;
    }
    
    // Try to refresh the token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshResult = await baseQueryWithAuth(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );
      
      if (refreshResult.data) {
        // Store the new token
        const newToken = refreshResult.data.token || refreshResult.data.accessToken;
        if (newToken) {
          localStorage.setItem('token', newToken);
          
          // Update Redux state
          api.dispatch({ 
            type: 'auth/setToken', 
            payload: newToken 
          });
          
          // Retry the original query
          result = await baseQueryWithAuth(args, api, extraOptions);
        }
      }
    }
  }
  
  return result;
};

/**
 * Base API configuration
 * 
 * This is the main API instance that all space-specific APIs will extend.
 * It provides:
 * - Automatic caching with configurable TTL
 * - Tag-based cache invalidation
 * - Authentication handling
 * - Demo mode compatibility
 * - Stale-while-revalidate strategy
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithRetry,
  tagTypes: TAG_TYPES,
  
  // Cache configuration optimized for performance
  // Keep unused data for 5 minutes (300 seconds)
  keepUnusedDataFor: 300,
  
  // Refetch on mount if data is older than 60 seconds (stale-while-revalidate)
  // This provides instant data from cache while fetching fresh data in background
  refetchOnMountOrArgChange: 60,
  
  // Refetch on reconnect to ensure data is fresh after network issues
  refetchOnReconnect: true,
  
  // Don't refetch on focus by default (can be overridden per endpoint)
  // This prevents unnecessary API calls when switching browser tabs
  refetchOnFocus: false,
  
  endpoints: () => ({}),
});

/**
 * Cache TTL configurations for different data types
 * Use these when configuring individual endpoints
 */
export const CACHE_TTL = {
  // Static/rarely changing data - 1 hour
  STATIC: 3600,
  
  // Reference data (departments, categories, etc.) - 30 minutes
  REFERENCE: 1800,
  
  // Standard data (projects, employees, etc.) - 5 minutes
  STANDARD: 300,
  
  // Frequently changing data (dashboard metrics, notifications) - 1 minute
  DYNAMIC: 60,
  
  // Real-time data (live updates, current status) - 10 seconds
  REALTIME: 10,
};

/**
 * Cache invalidation strategies
 * Use these to configure how mutations affect cached data
 */
export const CACHE_STRATEGIES = {
  /**
   * Invalidate all instances of a tag type
   * Use for mutations that affect multiple records
   */
  invalidateAll: (tagType) => [{ type: tagType }],
  
  /**
   * Invalidate specific record by ID
   * Use for mutations that affect a single record
   */
  invalidateOne: (tagType, id) => [{ type: tagType, id }],
  
  /**
   * Invalidate multiple specific records
   * Use for bulk operations
   */
  invalidateMany: (tagType, ids) => ids.map(id => ({ type: tagType, id })),
  
  /**
   * Invalidate related data across multiple tag types
   * Use for mutations that affect multiple entities
   */
  invalidateRelated: (tagConfigs) => tagConfigs.flatMap(({ type, id }) => 
    id ? [{ type, id }] : [{ type }]
  ),
};

/**
 * Helper function to create optimistic update configuration
 * 
 * Optimistic updates provide instant UI feedback by updating the cache
 * before the server responds. If the request fails, changes are rolled back.
 * 
 * @param {string} tagType - The tag type to invalidate
 * @param {Function} updateFn - Function to update the cached data
 * @returns {Object} Optimistic update configuration
 * 
 * @example
 * // In a mutation endpoint
 * updateTask: builder.mutation({
 *   query: ({ id, ...data }) => ({
 *     url: `/tasks/${id}`,
 *     method: 'PUT',
 *     body: data,
 *   }),
 *   ...createOptimisticUpdate('Task', (draft, { id, ...data }) => {
 *     const task = draft.find(t => t.id === id);
 *     if (task) Object.assign(task, data);
 *   }),
 * })
 */
export const createOptimisticUpdate = (tagType, updateFn) => ({
  async onQueryStarted(arg, { dispatch, queryFulfilled, getCacheEntry }) {
    // Optimistically update the cache
    const patchResult = dispatch(
      baseApi.util.updateQueryData(tagType, arg, updateFn)
    );
    
    try {
      await queryFulfilled;
    } catch {
      // Rollback on error
      patchResult.undo();
    }
  },
});

/**
 * Helper function to create pessimistic update configuration
 * 
 * Pessimistic updates wait for server confirmation before updating the cache.
 * Use this for critical operations where data integrity is important.
 * 
 * @param {Array} invalidateTags - Tags to invalidate after successful mutation
 * @returns {Object} Pessimistic update configuration
 */
export const createPessimisticUpdate = (invalidateTags) => ({
  invalidatesTags: invalidateTags,
});

/**
 * Helper function to create cache prefetch configuration
 * 
 * Prefetching loads data before it's needed, improving perceived performance.
 * 
 * @param {string} endpointName - Name of the endpoint to prefetch
 * @param {*} arg - Arguments to pass to the endpoint
 * @param {Object} options - Prefetch options
 * @returns {Function} Prefetch function
 * 
 * @example
 * // Prefetch project details on hover
 * const prefetchProject = createPrefetch('getProject', projectId);
 * <div onMouseEnter={prefetchProject}>...</div>
 */
export const createPrefetch = (endpointName, arg, options = {}) => {
  return (dispatch) => {
    dispatch(
      baseApi.util.prefetch(endpointName, arg, {
        force: false, // Don't refetch if already in cache
        ...options,
      })
    );
  };
};

/**
 * Helper function to extract API data from response
 * Handles both wrapped and unwrapped responses
 */
export const extractApiData = (response) => {
  if (response?.success !== undefined) {
    return response.data;
  }
  return response;
};

/**
 * Helper function to transform API response
 * Use this in transformResponse for consistent data extraction
 */
export const transformApiResponse = (response) => {
  return extractApiData(response);
};

export default baseApi;
