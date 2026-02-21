/**
 * Widget Data API
 * 
 * RTK Query API for fetching widget-specific data with RBAC filtering.
 * Provides endpoints for fetching and refreshing widget data.
 * 
 * Requirements: 4.5, 7.2, 7.3
 */

import { baseApi, CACHE_TTL } from './baseApi';

/**
 * Widget Data API
 * 
 * Endpoints:
 * - getWidgetData: Fetch data for a specific widget type
 * - refreshWidgetData: Force refresh widget data (bypass cache)
 */
export const widgetDataApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get widget data with RBAC filtering
     * 
     * @param {Object} params - Query parameters
     * @param {string} params.widgetType - Widget type identifier
     * @param {string} [params.role] - Role for RBAC filtering (optional, defaults to user's role)
     * @param {Object} [params.config] - Additional widget configuration
     * @returns {Object} Widget data
     */
    getWidgetData: builder.query({
      query: ({ widgetType, role, config }) => {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (config) params.append('config', JSON.stringify(config));
        
        const queryString = params.toString();
        return `/dashboard/widgets/${widgetType}/data${queryString ? `?${queryString}` : ''}`;
      },
      
      // Transform response to extract data
      transformResponse: (response) => ({
        data: response.data,
        metadata: response.metadata,
        lastUpdated: response.data?.lastUpdated || new Date().toISOString(),
      }),
      
      // Cache widget data for 5 minutes (standard data)
      keepUnusedDataFor: CACHE_TTL.STANDARD,
      
      // Provide tags for cache invalidation
      providesTags: (result, error, { widgetType, role }) => [
        { type: 'Widget', id: `${widgetType}-${role || 'default'}` },
        { type: 'Widget', id: widgetType },
      ],
    }),

    /**
     * Refresh widget data (bypass cache)
     * 
     * @param {Object} params - Mutation parameters
     * @param {string} params.widgetType - Widget type identifier
     * @param {Object} [params.config] - Additional widget configuration
     * @returns {Object} Refreshed widget data
     */
    refreshWidgetData: builder.mutation({
      query: ({ widgetType, config }) => ({
        url: `/dashboard/widgets/${widgetType}/refresh`,
        method: 'POST',
        body: { config },
      }),
      
      // Transform response to extract data
      transformResponse: (response) => ({
        data: response.data,
        lastUpdated: response.data?.lastUpdated || new Date().toISOString(),
      }),
      
      // Invalidate cache for this widget
      invalidatesTags: (result, error, { widgetType }) => [
        { type: 'Widget', id: widgetType },
      ],
    }),
  }),
  
  overrideExisting: false,
});

// Export hooks for use in components
export const {
  useGetWidgetDataQuery,
  useRefreshWidgetDataMutation,
} = widgetDataApi;
