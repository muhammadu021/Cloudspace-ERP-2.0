/**
 * usePreferences Hook
 * 
 * Custom React hook for managing user preferences.
 * Provides convenient access to preference state and actions.
 */

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import {
  setDashboardConfig,
  setDashboardWidgets,
  setDashboardLayout,
  addDashboardWidget,
  removeDashboardWidget,
  updateDashboardWidget,
  setTableColumns,
  setFilter,
  clearFilter,
  clearAllFilters,
  setQuickAccess,
  addQuickAccess,
  removeQuickAccess,
  addRecentRoute,
  clearRecentRoutes,
  addFavorite,
  removeFavorite,
  setLanguage,
  setTimezone,
  setDateFormat,
  setTimeFormat,
  selectDashboardConfig,
  selectDashboardWidgets,
  selectDashboardLayout,
  selectTableColumns,
  selectFilter,
  selectQuickAccess,
  selectRecentRoutes,
  selectFavorites,
  selectLanguage,
  selectTimezone,
  selectDateFormat,
  selectTimeFormat,
} from '../slices/preferencesSlice';
import {
  useUpdatePreferencesMutation,
  useResetPreferencesMutation,
} from '../api/preferencesApi';
import {
  resetPreferencesByCategory,
  PREFERENCE_CATEGORIES,
  getSyncStatusMessage,
} from '../utils/preferenceUtils';

/**
 * Hook for managing user preferences
 * 
 * @returns {Object} Preference state and actions
 */
export const usePreferences = () => {
  const dispatch = useDispatch();
  const preferences = useSelector((state) => state.preferences);
  
  const [updatePreferencesMutation, { isLoading: isSyncing }] = useUpdatePreferencesMutation();
  const [resetPreferencesMutation, { isLoading: isResetting }] = useResetPreferencesMutation();

  // Dashboard preferences
  const dashboardConfig = useSelector(selectDashboardConfig);
  const dashboardWidgets = useSelector(selectDashboardWidgets);
  const dashboardLayout = useSelector(selectDashboardLayout);

  // Quick access preferences
  const quickAccess = useSelector(selectQuickAccess);
  const recentRoutes = useSelector(selectRecentRoutes);
  const favorites = useSelector(selectFavorites);

  // Localization preferences
  const language = useSelector(selectLanguage);
  const timezone = useSelector(selectTimezone);
  const dateFormat = useSelector(selectDateFormat);
  const timeFormat = useSelector(selectTimeFormat);

  // Dashboard actions
  const updateDashboardConfig = useCallback(
    (config) => dispatch(setDashboardConfig(config)),
    [dispatch]
  );

  const updateDashboardWidgets = useCallback(
    (widgets) => dispatch(setDashboardWidgets(widgets)),
    [dispatch]
  );

  const updateDashboardLayout = useCallback(
    (layout) => dispatch(setDashboardLayout(layout)),
    [dispatch]
  );

  const addWidget = useCallback(
    (widget) => dispatch(addDashboardWidget(widget)),
    [dispatch]
  );

  const removeWidget = useCallback(
    (widgetId) => dispatch(removeDashboardWidget(widgetId)),
    [dispatch]
  );

  const updateWidget = useCallback(
    (id, updates) => dispatch(updateDashboardWidget({ id, updates })),
    [dispatch]
  );

  // Table preferences actions
  const updateTableColumns = useCallback(
    (tableId, columns) => dispatch(setTableColumns({ tableId, columns })),
    [dispatch]
  );

  const getTableColumns = useCallback(
    (tableId) => selectTableColumns(tableId)({ preferences }),
    [preferences]
  );

  // Filter preferences actions
  const updateFilter = useCallback(
    (filterId, filterState) => dispatch(setFilter({ filterId, filterState })),
    [dispatch]
  );

  const removeFilter = useCallback(
    (filterId) => dispatch(clearFilter(filterId)),
    [dispatch]
  );

  const removeAllFilters = useCallback(
    () => dispatch(clearAllFilters()),
    [dispatch]
  );

  const getFilter = useCallback(
    (filterId) => selectFilter(filterId)({ preferences }),
    [preferences]
  );

  // Quick access actions
  const updateQuickAccess = useCallback(
    (items) => dispatch(setQuickAccess(items)),
    [dispatch]
  );

  const addQuickAccessItem = useCallback(
    (item) => dispatch(addQuickAccess(item)),
    [dispatch]
  );

  const removeQuickAccessItem = useCallback(
    (itemId) => dispatch(removeQuickAccess(itemId)),
    [dispatch]
  );

  const addRoute = useCallback(
    (route) => dispatch(addRecentRoute(route)),
    [dispatch]
  );

  const clearRoutes = useCallback(
    () => dispatch(clearRecentRoutes()),
    [dispatch]
  );

  const addFavoriteRoute = useCallback(
    (route) => dispatch(addFavorite(route)),
    [dispatch]
  );

  const removeFavoriteRoute = useCallback(
    (route) => dispatch(removeFavorite(route)),
    [dispatch]
  );

  // Localization actions
  const updateLanguage = useCallback(
    (lang) => dispatch(setLanguage(lang)),
    [dispatch]
  );

  const updateTimezone = useCallback(
    (tz) => dispatch(setTimezone(tz)),
    [dispatch]
  );

  const updateDateFormat = useCallback(
    (format) => dispatch(setDateFormat(format)),
    [dispatch]
  );

  const updateTimeFormat = useCallback(
    (format) => dispatch(setTimeFormat(format)),
    [dispatch]
  );

  // Reset actions
  const resetCategory = useCallback(
    async (category) => {
      await resetPreferencesByCategory(category, dispatch);
      
      // If resetting all, also reset on backend
      if (category === PREFERENCE_CATEGORIES.ALL) {
        try {
          await resetPreferencesMutation().unwrap();
        } catch (error) {
          console.error('Failed to reset preferences on backend:', error);
        }
      }
    },
    [dispatch, resetPreferencesMutation]
  );

  // Manual sync action
  const syncToBackend = useCallback(
    async () => {
      try {
        await updatePreferencesMutation(preferences).unwrap();
      } catch (error) {
        console.error('Failed to sync preferences:', error);
        throw error;
      }
    },
    [preferences, updatePreferencesMutation]
  );

  // Get sync status
  const syncStatus = getSyncStatusMessage(preferences);

  return {
    // State
    preferences,
    dashboardConfig,
    dashboardWidgets,
    dashboardLayout,
    quickAccess,
    recentRoutes,
    favorites,
    language,
    timezone,
    dateFormat,
    timeFormat,
    
    // Status
    isSyncing,
    isResetting,
    syncStatus,
    
    // Dashboard actions
    updateDashboardConfig,
    updateDashboardWidgets,
    updateDashboardLayout,
    addWidget,
    removeWidget,
    updateWidget,
    
    // Table actions
    updateTableColumns,
    getTableColumns,
    
    // Filter actions
    updateFilter,
    removeFilter,
    removeAllFilters,
    getFilter,
    
    // Quick access actions
    updateQuickAccess,
    addQuickAccessItem,
    removeQuickAccessItem,
    addRoute,
    clearRoutes,
    addFavoriteRoute,
    removeFavoriteRoute,
    
    // Localization actions
    updateLanguage,
    updateTimezone,
    updateDateFormat,
    updateTimeFormat,
    
    // Reset actions
    resetCategory,
    
    // Sync actions
    syncToBackend,
  };
};

export default usePreferences;
