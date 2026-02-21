import { describe, it, expect } from 'vitest';
import authReducer, {
  setCredentials,
  setUser,
  setPermissions,
  updateUser,
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
  selectHasPermission,
} from './authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    permissions: [],
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setCredentials', () => {
    const user = { id: '1', email: 'test@example.com', firstName: 'John' };
    const token = 'test-token';
    const permissions = [{ resource: 'projects', actions: ['read', 'write'] }];

    const state = authReducer(
      initialState,
      setCredentials({ user, token, permissions })
    );

    expect(state.user).toEqual(user);
    expect(state.token).toEqual(token);
    expect(state.permissions).toEqual(permissions);
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle setUser', () => {
    const user = { id: '1', email: 'test@example.com' };
    const state = authReducer(initialState, setUser(user));
    expect(state.user).toEqual(user);
  });

  it('should handle setPermissions', () => {
    const permissions = [{ resource: 'projects', actions: ['read'] }];
    const state = authReducer(initialState, setPermissions(permissions));
    expect(state.permissions).toEqual(permissions);
  });

  it('should handle updateUser', () => {
    const existingState = {
      ...initialState,
      user: { id: '1', email: 'test@example.com', firstName: 'John' },
    };

    const state = authReducer(
      existingState,
      updateUser({ firstName: 'Jane' })
    );

    expect(state.user).toEqual({
      id: '1',
      email: 'test@example.com',
      firstName: 'Jane',
    });
  });

  it('should handle logout', () => {
    const authenticatedState = {
      user: { id: '1', email: 'test@example.com' },
      token: 'test-token',
      permissions: [{ resource: 'projects', actions: ['read'] }],
      isAuthenticated: true,
      loading: false,
      error: null,
    };

    const state = authReducer(authenticatedState, logout());
    expect(state).toEqual(initialState);
  });

  describe('selectors', () => {
    const mockState = {
      auth: {
        user: { id: '1', email: 'test@example.com' },
        token: 'test-token',
        permissions: [
          { resource: 'projects', actions: ['read', 'write'] },
          { resource: 'hr', actions: ['read'] },
        ],
        isAuthenticated: true,
        loading: false,
        error: null,
      },
    };

    it('should select current user', () => {
      expect(selectCurrentUser(mockState)).toEqual(mockState.auth.user);
    });

    it('should select isAuthenticated', () => {
      expect(selectIsAuthenticated(mockState)).toBe(true);
    });

    it('should check permissions correctly', () => {
      const hasProjectWrite = selectHasPermission('projects', 'write')(mockState);
      expect(hasProjectWrite).toBe(true);

      const hasProjectDelete = selectHasPermission('projects', 'delete')(mockState);
      expect(hasProjectDelete).toBe(false);

      const hasHRRead = selectHasPermission('hr', 'read')(mockState);
      expect(hasHRRead).toBe(true);

      const hasHRWrite = selectHasPermission('hr', 'write')(mockState);
      expect(hasHRWrite).toBe(false);
    });
  });
});
