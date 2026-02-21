/**
 * useDashboardPreferences Hook
 * 
 * Custom hook to manage user dashboard preferences.
 * Handles fetching and updating dashboard type selection for System Administrators.
 * 
 * Requirements: 11.1, 11.2, 11.5
 */

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import {
  useGetDashboardPreferencesQuery,
  useUpdateDashboardPreferencesMutation,
} from '@/store/api/dashboardPreferencesApi';

/**
 * Hook to manage dashboard preferences
 * 
 * @param {Object} options - Hook options
 * @param {boolean} [options.skip] - Skip the query (useful for non-System Admin users)
 * @returns {Object} Preferences data and mutation functions
 * @returns {string} selectedDashboardType - Currently selected dashboard type
 * @returns {Function} setDashboardType - Function to update dashboard type
 * @returns {boolean} loading - True if query or mutation is loading
 * @returns {Object} error - Error object if query or mutation failed
 * @returns {boolean} isUpdating - True if mutation is in progress
 */
export function useDashboardPreferences({ skip = false } = {}) {
  const user = useSelector(selectCurrentUser);
  const userId = user?.id;
  
  // Fetch dashboard preferences
  const {
    data: preferences,
    isLoading: isLoadingPreferences,
    error: fetchError,
  } = useGetDashboardPreferencesQuery(
    { userId },
    { skip: skip || !userId }
  );
  
  // Update dashboard preferences mutation
  const [
    updatePreferences,
    {
      isLoading: isUpdating,
      error: updateError,
    },
  ] = useUpdateDashboardPreferencesMutation();
  
  // Extract selected dashboard type from preferences
  const selectedDashboardType = preferences?.selectedDashboardType || null;
  
  console.log('[useDashboardPreferences] State:', {
    userId,
    skip,
    preferences,
    selectedDashboardType,
    isLoadingPreferences,
    isUpdating,
    fetchError: fetchError?.message,
    updateError: updateError?.message,
  });
  
  /**
   * Update dashboard type with optimistic updates
   * 
   * @param {string} dashboardType - Dashboard type to select (admin, hr, finance, normal-user)
   * @returns {Promise} Promise that resolves when update completes
   */
  const setDashboardType = useCallback(
    async (dashboardType) => {
      if (!userId) {
        throw new Error('User ID not available');
      }
      
      console.log('[useDashboardPreferences] Updating dashboard type:', { userId, dashboardType });
      
      try {
        const result = await updatePreferences({
          userId,
          selectedDashboardType: dashboardType,
        }).unwrap();
        
        console.log('[useDashboardPreferences] Update successful:', result);
        return result;
      } catch (error) {
        console.error('[useDashboardPreferences] Update failed:', error);
        throw error;
      }
    },
    [userId, updatePreferences]
  );
  
  // Combine loading states
  const loading = isLoadingPreferences || isUpdating;
  
  // Combine errors
  const error = fetchError || updateError;
  
  return {
    selectedDashboardType,
    setDashboardType,
    loading,
    error,
    isUpdating,
  };
}
