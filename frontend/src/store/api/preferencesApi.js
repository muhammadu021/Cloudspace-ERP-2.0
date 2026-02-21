/**
 * Preferences API
 * 
 * RTK Query API for user preferences management.
 * Handles syncing preferences to backend for cross-device support.
 */

import { baseApi } from './baseApi';

export const preferencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get user preferences from backend
    getPreferences: builder.query({
      query: () => '/preferences',
      providesTags: ['Preferences'],
      transformResponse: (response) => {
        // Handle both wrapped and unwrapped responses
        const data = response?.data || response;
        return data || {};
      },
    }),

    // Update user preferences on backend
    updatePreferences: builder.mutation({
      query: (preferences) => ({
        url: '/preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['Preferences'],
      transformResponse: (response) => {
        const data = response?.data || response;
        return data || {};
      },
    }),

    // Reset preferences to defaults
    resetPreferences: builder.mutation({
      query: () => ({
        url: '/preferences/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Preferences'],
    }),
  }),
});

export const {
  useGetPreferencesQuery,
  useUpdatePreferencesMutation,
  useResetPreferencesMutation,
} = preferencesApi;
