import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '@/services/authService'
import { storage } from '@/utils/storage'
import { isTokenExpired } from '@/utils/tokenUtils'
import {
  normalizeUserPermissions,
  serializePermissions,
  deserializePermissions,
  hasItemPermission,
  hasRoutePermission,
  hasModulePermission,
  getModuleItems,
  hasAnyPermission,
  hasAllPermissions,
  getModulePermissionLevels
} from '@/utils/permissions'
import toast from 'react-hot-toast'
import { appConfig } from '@/config/appConfig'
import { store } from '@/store'
import { setCredentials, logout as reduxLogout } from '@/store/slices/authSlice'

const AuthContext = createContext()

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  permissions: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true
      }
    case 'LOGIN_SUCCESS': {
      const { user, token, refreshToken, permissions } = action.payload;
      return {
        ...state,
        user,
        token,
        refreshToken,
        permissions,
        isAuthenticated: true,
        isLoading: false
      }
    }
    case 'LOGIN_FAILURE':
      storage.clearAuthData()
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: null
      }
    case 'LOGOUT':
      storage.clearAuthData()
      return {
        ...state,
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        permissions: null
      }
    case 'UPDATE_USER': {
      const updatedUser = { ...state.user, ...action.payload }
      return {
        ...state,
        user: updatedUser
      }
    }
    case 'UPDATE_PERMISSIONS': {
      const permissions = normalizeUserPermissions(action.payload);
      return {
        ...state,
        permissions
      }
    }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      }
    default:
      return state
  }
}

const loadCachedAuth = () => {
  const token = storage.getItem('token');
  const refreshToken = storage.getItem('refreshToken');
  const user = storage.getItem('user');
  const storedPermissions = storage.getItem('permissions');

  if (!token || !user) {
    return null;
  }

  if (isTokenExpired(token)) {
    return null;
  }

  return {
    user: typeof user === 'string' ? JSON.parse(user) : user,
    token,
    refreshToken,
    permissions: storedPermissions
      ? deserializePermissions(
        typeof storedPermissions === 'string' ? JSON.parse(storedPermissions) : storedPermissions
      )
      : null,
  };
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const bootstrapAuth = async () => {
      const cached = loadCachedAuth();

      if (cached && appConfig.demoMode) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user: cached.user,
            token: cached.token,
            refreshToken: cached.refreshToken,
            permissions: cached.permissions,
          },
        });
        
        // Sync to Redux (serialize permissions to avoid Set in Redux state)
        store.dispatch(setCredentials({
          user: cached.user,
          token: cached.token,
          permissions: cached.permissions ? serializePermissions(cached.permissions) : null,
        }));
        
        return;
      }

      const token = storage.getItem('token');

      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      if (isTokenExpired(token)) {
        dispatch({ type: 'LOGIN_FAILURE' });
        return;
      }

      try {
        const response = await authService.getCurrentUser();
        const user = response.data?.data?.user || response.data?.user || response.data;

        if (!user || !user.id) {
          throw new Error('Invalid user data received from server');
        }

        if (user?.company_id) {
          storage.setItem('company_id', user.company_id.toString())
        }

        let permissions = null;
        if (user?.UserType?.sidebar_modules) {
          permissions = normalizeUserPermissions(user.UserType.sidebar_modules);
        } else if (user?.user_type_id && !appConfig.demoMode) {
          try {
            const userTypeResponse = await fetch(`${import.meta.env.VITE_API_URL}/user-types/${user.user_type_id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const userTypeData = await userTypeResponse.json();
            if (userTypeData.success && userTypeData.data.userType.sidebar_modules) {
              permissions = normalizeUserPermissions(userTypeData.data.userType.sidebar_modules);
              user.UserType = userTypeData.data.userType;
            }
          } catch (permError) {
            console.warn('Failed to load user type data:', permError);
          }
        }

        const refreshToken = storage.getItem('refreshToken');

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            token,
            refreshToken,
            permissions,
          }
        });
        
        // Sync to Redux (serialize permissions to avoid Set in Redux state)
        store.dispatch(setCredentials({
          user,
          token,
          permissions: permissions ? serializePermissions(permissions) : null,
        }));
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          dispatch({ type: 'LOGIN_FAILURE' });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    bootstrapAuth();
  }, [])

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response = await authService.login(credentials)

      if (response.data && response.data.success) {
        const { user, accessToken, refreshToken } = response.data.data
        storage.setItem('token', accessToken)
        storage.setItem('user', JSON.stringify(user))

        if (user?.company_id) {
          storage.setItem('company_id', user.company_id.toString())
        }

        if (refreshToken) {
          storage.setItem('refreshToken', refreshToken)
        }

        let permissions = null;
        if (user?.UserType?.sidebar_modules) {
          permissions = normalizeUserPermissions(user.UserType.sidebar_modules);
        } else if (user?.user_type_id && !appConfig.demoMode) {
          try {
            const userTypeResponse = await fetch(`${import.meta.env.VITE_API_URL}/user-types/${user.user_type_id}`, {
              headers: {
                'Authorization': `Bearer ${accessToken}`
              }
            });
            const userTypeData = await userTypeResponse.json();
            if (userTypeData.success && userTypeData.data.userType.sidebar_modules) {
              permissions = normalizeUserPermissions(userTypeData.data.userType.sidebar_modules);
            }
          } catch (permError) {
            console.warn('Failed to load user permissions during login:', permError);
          }
        }

        if (permissions) {
          storage.setItem('permissions', JSON.stringify(serializePermissions(permissions)));
        }

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: {
            user,
            token: accessToken,
            refreshToken,
            permissions
          }
        })

        // Sync to Redux (serialize permissions to avoid Set in Redux state)
        store.dispatch(setCredentials({
          user,
          token: accessToken,
          permissions: permissions ? serializePermissions(permissions) : null,
        }));

        toast.success('Logged in successfully!')
        return { success: true }
      } else {
        throw new Error(response.data?.message || 'Login failed')
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' })
      const message = error.response?.data?.message || error.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const refreshAuthToken = async () => {
    if (appConfig.demoMode) {
      const token = storage.getItem('token');
      if (token) return token;
      throw new Error('No demo token stored');
    }

    try {
      const refreshToken = storage.getItem('refreshToken');
      if (!refreshToken || isTokenExpired(refreshToken)) {
        throw new Error('No valid refresh token');
      }

      const response = await authService.refreshToken(refreshToken);
      const newToken = response.data.token || response.data.accessToken;
      const newRefreshToken = response.data.refreshToken;

      if (newToken) {
        storage.setItem('token', newToken);
        if (newRefreshToken) {
          storage.setItem('refreshToken', newRefreshToken)
        }
        return newToken;
      }

      throw new Error('No token in refresh response');
    } catch (error) {
      console.error('Token refresh failed:', error);
      dispatch({ type: 'LOGOUT' });
      throw error;
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      toast.success(appConfig.demoMode ? 'Registration simulated successfully!' : 'Registration successful! Please check your email for verification.')
      return { success: true, data: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      storage.clearAuthData()
      dispatch({ type: 'LOGOUT' })
      
      // Sync to Redux
      store.dispatch(reduxLogout());
      
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }

  const hasPermission = (permissionId) => {
    if (!state.permissions || !permissionId) {
      return false;
    }
    return hasItemPermission(state.permissions, permissionId);
  }

  const hasRoute = (route) => {
    if (!state.permissions || !route) {
      return false;
    }
    return hasRoutePermission(state.permissions, route);
  }

  const hasModule = (moduleId) => {
    if (!state.permissions || !moduleId) {
      return false;
    }
    return hasModulePermission(state.permissions, moduleId);
  }

  const getModulePermissions = (moduleId) => {
    if (!state.permissions || !moduleId) {
      return [];
    }
    return getModuleItems(state.permissions, moduleId);
  }

  const hasAnyOf = (permissionIds) => {
    if (!state.permissions || !Array.isArray(permissionIds)) {
      return false;
    }
    return hasAnyPermission(state.permissions, permissionIds);
  }

  const hasAllOf = (permissionIds) => {
    if (!state.permissions || !Array.isArray(permissionIds)) {
      return false;
    }
    return hasAllPermissions(state.permissions, permissionIds);
  }

  const getPermissionLevels = (moduleId) => {
    if (!state.permissions || !moduleId) {
      return [];
    }
    return getModulePermissionLevels(state.permissions, moduleId);
  }

  const hasRole = (role) => {
    if (!state.user) return false;
    const userType = state.user.UserType || state.user.user_type;
    return userType && userType.name === role;
  }

  const hasAnyRole = (roles) => {
    return roles.some(role => hasRole(role));
  }

  const updateUserPermissions = async () => {
    if (appConfig.demoMode) {
      const stored = storage.getItem('permissions');
      if (stored) {
        dispatch({
          type: 'UPDATE_PERMISSIONS',
          payload: JSON.parse(stored)
        });
      }
      return;
    }

    try {
      if (state.user?.user_type_id) {
        const userTypeResponse = await fetch(`${import.meta.env.VITE_API_URL}/user-types/${state.user.user_type_id}`, {
          headers: {
            'Authorization': `Bearer ${state.token}`
          }
        });

        const userTypeData = await userTypeResponse.json();

        if (userTypeData.success && userTypeData.data.userType.sidebar_modules) {
          dispatch({
            type: 'UPDATE_PERMISSIONS',
            payload: userTypeData.data.userType.sidebar_modules
          });
        }
      }
    } catch (error) {
      console.error('Failed to update user permissions:', error);
    }
  };

  const value = {
    ...state,
    demoMode: appConfig.demoMode,
    login,
    register,
    logout,
    updateUser,
    updateUserPermissions,
    refreshAuthToken,
    hasPermission,
    hasRoute,
    hasModule,
    getModulePermissions,
    hasAnyOf,
    hasAllOf,
    getPermissionLevels,
    hasRole,
    hasAnyRole
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
