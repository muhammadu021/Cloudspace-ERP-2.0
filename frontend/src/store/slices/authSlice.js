import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  permissions: [],
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, permissions } = action.payload;
      state.user = user;
      state.token = token;
      state.permissions = permissions || [];
      state.isAuthenticated = true;
      state.error = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setPermissions: (state, action) => {
      state.permissions = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setCredentials,
  setUser,
  setPermissions,
  setToken,
  updateUser,
  setLoading,
  setError,
  logout,
  clearError,
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectPermissions = (state) => state.auth.permissions;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// Permission check selector
export const selectHasPermission = (resource, action) => (state) => {
  const permissions = state.auth.permissions;
  return permissions.some(
    (perm) => perm.resource === resource && perm.actions.includes(action)
  );
};

export default authSlice.reducer;
