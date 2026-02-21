/**
 * Dashboard Preferences API
 * 
 * RTK Query API for managing user dashboard preferences.
 * Handles System Administrator dashboard type selection and persistence.
 * 
 * Requirements: 11.1, 11.2, 11.4
 */

import { baseApi, CACHE_TTL } from './baseApi';

/**
 * Dashboard Preferences API
 * 
 * Endpoints:
 * - getDashboardPreferences: Fetch user's dashboard preferences
 * - updateDashboardPreferences: Update user's dashboard preferences
 */
export const dashboardPreferencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Get dashboard preferences for a user
     * 
     * @param {Object} params - Query parameters
     * @param {number} params.userId - User ID
     * @returns {Object} Dashboard preferences
     */
    getDashboardPreferences: builder.query({
      query: ({ userId }) => `/users/${userId}/preferences/dashboard`,
      
      // Transform response to extract data
      transformResponse: (response) => response.data,
      
      // Cache preferences for 5 minutes (standard data)
      keepUnusedDataFor: CACHE_TTL.STANDARD,
      
      // Provide tags for cache invalidation
      providesTags: (result, error, { userId }) => [
        { type: 'Preferences', id: `dashboard-${userId}` },
      ],
    }),

    /**
     * Update dashboard preferences for a user
     * 
     * @param {Object} params - Mutation parameters
     * @param {number} params.userId - User ID
     * @param {string} params.selectedDashboardType - Selected dashboard type (admin, hr, finance, normal-user)
     * @param {Object} [params.customLayout] - Optional custom layout configuration
     * @returns {Object} Updated preferences
     */
    updateDashboardPreferences: builder.mutation({
      query: ({ userId, selectedDashboardType, customLayout }) => ({
        url: `/users/${userId}/preferences/dashboard`,
        method: 'PUT',
        body: { selectedDashboardType, customLayout },
      }),
      
      // Transform response to extract data
      transformResponse: (response) => response.data,
      
      // Optimistic update for instant UI feedback
      async onQueryStarted({ userId, selectedDashboardType, customLayout }, { dispatch, queryFulfilled }) {
        // Optimistically update the cache
        const patchResult = dispatch(
          dashboardPreferencesApi.util.updateQueryData(
            'getDashboardPreferences',
            { userId },
            (draft) => {
              draft.selectedDashboardType = selectedDashboardType;
              if (customLayout !== undefined) {
                draft.customLayout = customLayout;
              }
              draft.updatedAt = new Date().toISOString();
            }
          )
        );
        
        try {
          await queryFulfilled;
        } catch {
          // Rollback on error
          patchResult.undo();
        }
      },
      
      // Invalidate cache for this user's preferences AND dashboard configs
      // This ensures the new dashboard config is fetched when the type changes
      invalidatesTags: (result, error, { userId, selectedDashboardType }) => [
        { type: 'Preferences', id: `dashboard-${userId}` },
        // Invalidate all dashboard configs to force refetch
        { type: 'Dashboard', id: 'LIST' },
        // Invalidate the specific config for the newly selected type
        { type: 'Dashboard', id: `config-${selectedDashboardType}` },
      ],
    }),
  }),
  
  overrideExisting: false,
});

// Export hooks for use in components
export const {
  useGetDashboardPreferencesQuery,
  useUpdateDashboardPreferencesMutation,
} = dashboardPreferencesApi;
