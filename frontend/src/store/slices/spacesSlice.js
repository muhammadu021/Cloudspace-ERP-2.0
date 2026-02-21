import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentSpace: 'dashboard',
  dashboard: {
    loading: false,
    error: null,
    data: null,
  },
  projects: {
    loading: false,
    error: null,
    selectedProject: null,
    filters: {},
  },
  hr: {
    loading: false,
    error: null,
    selectedEmployee: null,
    filters: {},
  },
  finance: {
    loading: false,
    error: null,
    selectedTransaction: null,
    filters: {},
  },
  sales: {
    loading: false,
    error: null,
    selectedCustomer: null,
    filters: {},
  },
  inventory: {
    loading: false,
    error: null,
    selectedItem: null,
    filters: {},
  },
  admin: {
    loading: false,
    error: null,
    filters: {},
  },
  support: {
    loading: false,
    error: null,
    selectedTicket: null,
    filters: {},
  },
  portal: {
    loading: false,
    error: null,
    data: null,
  },
};

const spacesSlice = createSlice({
  name: 'spaces',
  initialState,
  reducers: {
    setCurrentSpace: (state, action) => {
      state.currentSpace = action.payload;
    },
    // Dashboard actions
    setDashboardData: (state, action) => {
      state.dashboard.data = action.payload;
      state.dashboard.loading = false;
      state.dashboard.error = null;
    },
    setDashboardLoading: (state, action) => {
      state.dashboard.loading = action.payload;
    },
    setDashboardError: (state, action) => {
      state.dashboard.error = action.payload;
      state.dashboard.loading = false;
    },
    // Projects actions
    setSelectedProject: (state, action) => {
      state.projects.selectedProject = action.payload;
    },
    setProjectsFilters: (state, action) => {
      state.projects.filters = action.payload;
    },
    setProjectsLoading: (state, action) => {
      state.projects.loading = action.payload;
    },
    setProjectsError: (state, action) => {
      state.projects.error = action.payload;
      state.projects.loading = false;
    },
    // HR actions
    setSelectedEmployee: (state, action) => {
      state.hr.selectedEmployee = action.payload;
    },
    setHRFilters: (state, action) => {
      state.hr.filters = action.payload;
    },
    setHRLoading: (state, action) => {
      state.hr.loading = action.payload;
    },
    setHRError: (state, action) => {
      state.hr.error = action.payload;
      state.hr.loading = false;
    },
    // Finance actions
    setSelectedTransaction: (state, action) => {
      state.finance.selectedTransaction = action.payload;
    },
    setFinanceFilters: (state, action) => {
      state.finance.filters = action.payload;
    },
    setFinanceLoading: (state, action) => {
      state.finance.loading = action.payload;
    },
    setFinanceError: (state, action) => {
      state.finance.error = action.payload;
      state.finance.loading = false;
    },
    // Sales actions
    setSelectedCustomer: (state, action) => {
      state.sales.selectedCustomer = action.payload;
    },
    setSalesFilters: (state, action) => {
      state.sales.filters = action.payload;
    },
    setSalesLoading: (state, action) => {
      state.sales.loading = action.payload;
    },
    setSalesError: (state, action) => {
      state.sales.error = action.payload;
      state.sales.loading = false;
    },
    // Inventory actions
    setSelectedItem: (state, action) => {
      state.inventory.selectedItem = action.payload;
    },
    setInventoryFilters: (state, action) => {
      state.inventory.filters = action.payload;
    },
    setInventoryLoading: (state, action) => {
      state.inventory.loading = action.payload;
    },
    setInventoryError: (state, action) => {
      state.inventory.error = action.payload;
      state.inventory.loading = false;
    },
    // Admin actions
    setAdminFilters: (state, action) => {
      state.admin.filters = action.payload;
    },
    setAdminLoading: (state, action) => {
      state.admin.loading = action.payload;
    },
    setAdminError: (state, action) => {
      state.admin.error = action.payload;
      state.admin.loading = false;
    },
    // Support actions
    setSelectedTicket: (state, action) => {
      state.support.selectedTicket = action.payload;
    },
    setSupportFilters: (state, action) => {
      state.support.filters = action.payload;
    },
    setSupportLoading: (state, action) => {
      state.support.loading = action.payload;
    },
    setSupportError: (state, action) => {
      state.support.error = action.payload;
      state.support.loading = false;
    },
    // Portal actions
    setPortalData: (state, action) => {
      state.portal.data = action.payload;
      state.portal.loading = false;
      state.portal.error = null;
    },
    setPortalLoading: (state, action) => {
      state.portal.loading = action.payload;
    },
    setPortalError: (state, action) => {
      state.portal.error = action.payload;
      state.portal.loading = false;
    },
    // Clear space data
    clearSpaceData: (state, action) => {
      const space = action.payload;
      if (state[space]) {
        state[space] = initialState[space];
      }
    },
  },
});

export const {
  setCurrentSpace,
  setDashboardData,
  setDashboardLoading,
  setDashboardError,
  setSelectedProject,
  setProjectsFilters,
  setProjectsLoading,
  setProjectsError,
  setSelectedEmployee,
  setHRFilters,
  setHRLoading,
  setHRError,
  setSelectedTransaction,
  setFinanceFilters,
  setFinanceLoading,
  setFinanceError,
  setSelectedCustomer,
  setSalesFilters,
  setSalesLoading,
  setSalesError,
  setSelectedItem,
  setInventoryFilters,
  setInventoryLoading,
  setInventoryError,
  setAdminFilters,
  setAdminLoading,
  setAdminError,
  setSelectedTicket,
  setSupportFilters,
  setSupportLoading,
  setSupportError,
  setPortalData,
  setPortalLoading,
  setPortalError,
  clearSpaceData,
} = spacesSlice.actions;

// Selectors
export const selectCurrentSpace = (state) => state.spaces.currentSpace;
export const selectDashboardState = (state) => state.spaces.dashboard;
export const selectProjectsState = (state) => state.spaces.projects;
export const selectHRState = (state) => state.spaces.hr;
export const selectFinanceState = (state) => state.spaces.finance;
export const selectSalesState = (state) => state.spaces.sales;
export const selectInventoryState = (state) => state.spaces.inventory;
export const selectAdminState = (state) => state.spaces.admin;
export const selectSupportState = (state) => state.spaces.support;
export const selectPortalState = (state) => state.spaces.portal;

export default spacesSlice.reducer;
