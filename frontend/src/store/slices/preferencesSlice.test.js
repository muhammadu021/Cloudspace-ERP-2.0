import { describe, it, expect } from 'vitest';
import preferencesReducer, {
  addDashboardWidget,
  removeDashboardWidget,
  setTableColumns,
  setFilter,
  addRecentRoute,
  addFavorite,
  removeFavorite,
  selectDashboardWidgets,
  selectRecentRoutes,
} from './preferencesSlice';

describe('preferencesSlice', () => {
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
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  };

  it('should return initial state', () => {
    expect(preferencesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addDashboardWidget', () => {
    const widget = { id: 'widget-1', type: 'metric', title: 'Sales' };
    const state = preferencesReducer(initialState, addDashboardWidget(widget));
    
    expect(state.dashboard.widgets).toHaveLength(1);
    expect(state.dashboard.widgets[0]).toEqual(widget);
  });

  it('should handle removeDashboardWidget', () => {
    const stateWithWidgets = {
      ...initialState,
      dashboard: {
        widgets: [
          { id: 'widget-1', type: 'metric', title: 'Sales' },
          { id: 'widget-2', type: 'chart', title: 'Revenue' },
        ],
        layout: [],
      },
    };

    const state = preferencesReducer(stateWithWidgets, removeDashboardWidget('widget-1'));
    expect(state.dashboard.widgets).toHaveLength(1);
    expect(state.dashboard.widgets[0].id).toBe('widget-2');
  });

  it('should handle setTableColumns', () => {
    const state = preferencesReducer(
      initialState,
      setTableColumns({ tableId: 'projects', columns: ['name', 'status', 'date'] })
    );

    expect(state.tableColumns.projects).toEqual(['name', 'status', 'date']);
  });

  it('should handle setFilter', () => {
    const filterState = { status: 'active', priority: 'high' };
    const state = preferencesReducer(
      initialState,
      setFilter({ filterId: 'projects-list', filterState })
    );

    expect(state.filters['projects-list']).toEqual(filterState);
  });

  it('should handle addRecentRoute', () => {
    let state = preferencesReducer(initialState, addRecentRoute('/projects'));
    expect(state.recentRoutes).toEqual(['/projects']);

    state = preferencesReducer(state, addRecentRoute('/hr'));
    expect(state.recentRoutes).toEqual(['/hr', '/projects']);

    // Should move existing route to front
    state = preferencesReducer(state, addRecentRoute('/projects'));
    expect(state.recentRoutes).toEqual(['/projects', '/hr']);
  });

  it('should limit recent routes to 10', () => {
    let state = initialState;
    
    // Add 12 routes
    for (let i = 1; i <= 12; i++) {
      state = preferencesReducer(state, addRecentRoute(`/route-${i}`));
    }

    expect(state.recentRoutes).toHaveLength(10);
    expect(state.recentRoutes[0]).toBe('/route-12');
    expect(state.recentRoutes[9]).toBe('/route-3');
  });

  it('should handle addFavorite', () => {
    const state = preferencesReducer(initialState, addFavorite('/projects'));
    expect(state.favorites).toEqual(['/projects']);
  });

  it('should not add duplicate favorites', () => {
    let state = preferencesReducer(initialState, addFavorite('/projects'));
    state = preferencesReducer(state, addFavorite('/projects'));
    
    expect(state.favorites).toHaveLength(1);
  });

  it('should handle removeFavorite', () => {
    const stateWithFavorites = {
      ...initialState,
      favorites: ['/projects', '/hr', '/finance'],
    };

    const state = preferencesReducer(stateWithFavorites, removeFavorite('/hr'));
    expect(state.favorites).toEqual(['/projects', '/finance']);
  });

  describe('selectors', () => {
    const mockState = {
      preferences: {
        dashboard: {
          widgets: [{ id: 'widget-1', type: 'metric' }],
          layout: [],
        },
        recentRoutes: ['/projects', '/hr'],
        favorites: ['/dashboard'],
        tableColumns: {},
        filters: {},
        quickAccess: [],
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
      },
    };

    it('should select dashboard widgets', () => {
      expect(selectDashboardWidgets(mockState)).toEqual([
        { id: 'widget-1', type: 'metric' },
      ]);
    });

    it('should select recent routes', () => {
      expect(selectRecentRoutes(mockState)).toEqual(['/projects', '/hr']);
    });
  });
});
