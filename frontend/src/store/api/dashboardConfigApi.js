/**
 * Dashboard Configuration API
 * 
 * RTK Query API for managing dashboard configurations.
 * Provides endpoints for fetching and updating role-based dashboard configurations.
 * 
 * Requirements: 3.2, 15.4
 */

import { baseApi, CACHE_TTL } from './baseApi';

/**
 * Dashboard Configuration API
 * 
 * Endpoints:
 * - getDashboardConfig: Fetch configuration for a role
 * - updateDashboardConfig: Update configuration (System Admin only)
 * - getConfigVersions: List all configuration versions (System Admin only)
 */
export const dashboardConfigApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get dashboard configuration for a specific role
     * 
     * @param {Object} params - Query parameters
     * @param {string} params.role - Role identifier (system-administrator, admin, hr, finance, normal-user)
     * @param {number} [params.version] - Optional version number (defaults to active version)
     * @returns {Object} Dashboard configuration
     */
    getDashboardConfig: builder.query({
      query: ({ role, version }) => {
        const endpoint = version 
          ? `/dashboard/config/${role}/version/${version}`
          : `/dashboard/config/${role}`;
        return endpoint;
      },
      
      // Transform response to extract data
      transformResponse: (response) => response.data,
      
      // Cache configuration for 30 minutes (reference data)
      keepUnusedDataFor: CACHE_TTL.REFERENCE,
      
      // Provide tags for cache invalidation
      providesTags: (result, error, { role, version }) => [
        { type: 'Dashboard', id: `config-${role}` },
        { type: 'Dashboard', id: `config-${role}-v${version || 'active'}` },
      ],
    }),

    /**
     * Update dashboard configuration for a role
     * Creates a new version and deactivates previous version
     * 
     * @param {Object} params - Mutation parameters
     * @param {string} params.role - Role identifier
     * @param {Object} params.configuration - Dashboard configuration object
     * @returns {Object} Updated configuration with new version
     */
    updateDashboardConfig: builder.mutation({
      query: ({ role, configuration }) => ({
        url: `/dashboard/config/${role}`,
        method: 'PUT',
        body: { configuration },
      }),
      
      // Transform response to extract data
      transformResponse: (response) => response.data,
      
      // Invalidate cache for this role's configuration
      invalidatesTags: (result, error, { role }) => [
        { type: 'Dashboard', id: `config-${role}` },
        { type: 'Dashboard', id: 'versions' },
      ],
    }),

    /**
     * Get all versions of a dashboard configuration
     * 
     * @param {Object} params - Query parameters
     * @param {string} params.role - Role identifier
     * @returns {Array} List of configuration versions
     */
    getConfigVersions: builder.query({
      query: ({ role }) => `/dashboard/config/${role}/versions`,
      
      // Transform response to extract data
      transformResponse: (response) => response.data,
      
      // Cache versions list for 30 minutes
      keepUnusedDataFor: CACHE_TTL.REFERENCE,
      
      // Provide tags for cache invalidation
      providesTags: [{ type: 'Dashboard', id: 'versions' }],
    }),
  }),
  
  overrideExisting: false,
});

// Export hooks for use in components
export const {
  useGetDashboardConfigQuery,
  useUpdateDashboardConfigMutation,
  useGetConfigVersionsQuery,
} = dashboardConfigApi;
