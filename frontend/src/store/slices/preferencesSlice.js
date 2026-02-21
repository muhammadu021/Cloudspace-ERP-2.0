import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboard: {
    widgets: [],
    layout: [],
  },
  tableColumns: {},
  filters: {},
  quickAccess: [],
  recentRoutes: [],
  favorites: [],
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  completedTours: {},
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setDashboardConfig: (state, action) => {
      state.dashboard = { ...state.dashboard, ...action.payload };
    },
    setDashboardWidgets: (state, action) => {
      state.dashboard.widgets = action.payload;
    },
    setDashboardLayout: (state, action) => {
      state.dashboard.layout = action.payload;
    },
    addDashboardWidget: (state, action) => {
      state.dashboard.widgets.push(action.payload);
    },
    removeDashboardWidget: (state, action) => {
      const widgetId = action.payload;
      state.dashboard.widgets = state.dashboard.widgets.filter(
        (widget) => widget.id !== widgetId
      );
    },
    updateDashboardWidget: (state, action) => {
      const { id, updates } = action.payload;
      const widgetIndex = state.dashboard.widgets.findIndex((w) => w.id === id);
      if (widgetIndex !== -1) {
        state.dashboard.widgets[widgetIndex] = {
          ...state.dashboard.widgets[widgetIndex],
          ...updates,
        };
      }
    },
    setTableColumns: (state, action) => {
      const { tableId, columns } = action.payload;
      state.tableColumns[tableId] = columns;
    },
    setFilter: (state, action) => {
      const { filterId, filterState } = action.payload;
      state.filters[filterId] = filterState;
    },
    clearFilter: (state, action) => {
      const filterId = action.payload;
      delete state.filters[filterId];
    },
    clearAllFilters: (state) => {
      state.filters = {};
    },
    setQuickAccess: (state, action) => {
      state.quickAccess = action.payload;
    },
    addQuickAccess: (state, action) => {
      const item = action.payload;
      if (!state.quickAccess.find((i) => i.id === item.id)) {
        state.quickAccess.push(item);
      }
    },
    removeQuickAccess: (state, action) => {
      const itemId = action.payload;
      state.quickAccess = state.quickAccess.filter((item) => item.id !== itemId);
    },
    addRecentRoute: (state, action) => {
      const route = action.payload;
      // Remove if already exists
      state.recentRoutes = state.recentRoutes.filter((r) => r !== route);
      // Add to beginning
      state.recentRoutes.unshift(route);
      // Keep only last 10
      if (state.recentRoutes.length > 10) {
        state.recentRoutes = state.recentRoutes.slice(0, 10);
      }
    },
    clearRecentRoutes: (state) => {
      state.recentRoutes = [];
    },
    addFavorite: (state, action) => {
      const route = action.payload;
      if (!state.favorites.includes(route)) {
        state.favorites.push(route);
      }
    },
    removeFavorite: (state, action) => {
      const route = action.payload;
      state.favorites = state.favorites.filter((r) => r !== route);
    },
    setLanguage: (state, action) => {
      state.language = action.payload;
    },
    setThemePreference: (state, action) => {
      state.theme = action.payload;
    },
    setTimezone: (state, action) => {
      state.timezone = action.payload;
    },
    setDateFormat: (state, action) => {
      state.dateFormat = action.payload;
    },
    setTimeFormat: (state, action) => {
      state.timeFormat = action.payload;
    },
    setTourCompleted: (state, action) => {
      const { tourId, completed } = action.payload;
      state.completedTours[tourId] = completed;
    },
    resetPreferences: (state) => {
      return initialState;
    },
    resetDashboardPreferences: (state) => {
      state.dashboard = initialState.dashboard;
    },
    resetTablePreferences: (state) => {
      state.tableColumns = initialState.tableColumns;
    },
    resetFilterPreferences: (state) => {
      state.filters = initialState.filters;
    },
    resetQuickAccessPreferences: (state) => {
      state.quickAccess = initialState.quickAccess;
      state.recentRoutes = initialState.recentRoutes;
      state.favorites = initialState.favorites;
    },
    resetLocalizationPreferences: (state) => {
      state.language = initialState.language;
      state.timezone = initialState.timezone;
      state.dateFormat = initialState.dateFormat;
      state.timeFormat = initialState.timeFormat;
    },
    loadFromBackend: (state, action) => {
      // Load preferences from backend, merging with current state
      return { ...state, ...action.payload };
    },
  },
});

export const {
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
  setThemePreference,
  setTimezone,
  setDateFormat,
  setTimeFormat,
  setTourCompleted,
  resetPreferences,
  resetDashboardPreferences,
  resetTablePreferences,
  resetFilterPreferences,
  resetQuickAccessPreferences,
  resetLocalizationPreferences,
  loadFromBackend,
} = preferencesSlice.actions;

// Selectors
export const selectDashboardConfig = (state) => state.preferences.dashboard;
export const selectDashboardWidgets = (state) => state.preferences.dashboard.widgets;
export const selectDashboardLayout = (state) => state.preferences.dashboard.layout;
export const selectTableColumns = (tableId) => (state) =>
  state.preferences.tableColumns[tableId] || [];
export const selectFilter = (filterId) => (state) =>
  state.preferences.filters[filterId] || null;
export const selectQuickAccess = (state) => state.preferences.quickAccess;
export const selectRecentRoutes = (state) => state.preferences.recentRoutes;
export const selectFavorites = (state) => state.preferences.favorites;
export const selectLanguage = (state) => state.preferences.language;
export const selectThemePreference = (state) => state.preferences.theme;
export const selectTimezone = (state) => state.preferences.timezone;
export const selectDateFormat = (state) => state.preferences.dateFormat;
export const selectTimeFormat = (state) => state.preferences.timeFormat;
export const selectTourCompleted = (tourId) => (state) =>
  state.preferences.completedTours[tourId] || false;

export default preferencesSlice.reducer;
