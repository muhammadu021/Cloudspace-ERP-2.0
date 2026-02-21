import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  sidebar: {
    collapsed: false,
    activeSpace: 'dashboard',
  },
  theme: 'light',
  modals: [],
  toasts: [],
  loading: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.collapsed = !state.sidebar.collapsed;
    },
    setSidebarCollapsed: (state, action) => {
      state.sidebar.collapsed = action.payload;
    },
    setActiveSpace: (state, action) => {
      state.sidebar.activeSpace = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    openModal: (state, action) => {
      const { id, type, props } = action.payload;
      state.modals.push({
        id: id || `modal-${Date.now()}`,
        type,
        props: props || {},
        open: true,
      });
    },
    closeModal: (state, action) => {
      const modalId = action.payload;
      state.modals = state.modals.filter((modal) => modal.id !== modalId);
    },
    closeAllModals: (state) => {
      state.modals = [];
    },
    addToast: (state, action) => {
      const { id, type, message, duration } = action.payload;
      state.toasts.push({
        id: id || `toast-${Date.now()}`,
        type: type || 'info',
        message,
        duration: duration || 3000,
        timestamp: Date.now(),
      });
    },
    removeToast: (state, action) => {
      const toastId = action.payload;
      state.toasts = state.toasts.filter((toast) => toast.id !== toastId);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    setLoading: (state, action) => {
      const { key, value } = action.payload;
      state.loading[key] = value;
    },
    clearLoading: (state, action) => {
      const key = action.payload;
      delete state.loading[key];
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setActiveSpace,
  setTheme,
  toggleTheme,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearToasts,
  setLoading,
  clearLoading,
} = uiSlice.actions;

// Selectors
export const selectSidebarCollapsed = (state) => state.ui.sidebar.collapsed;
export const selectActiveSpace = (state) => state.ui.sidebar.activeSpace;
export const selectTheme = (state) => state.ui.theme;
export const selectModals = (state) => state.ui.modals;
export const selectToasts = (state) => state.ui.toasts;
export const selectIsLoading = (key) => (state) => state.ui.loading[key] || false;

export default uiSlice.reducer;
