import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import {
  setCredentials,
  logout,
  selectCurrentUser,
  selectIsAuthenticated,
} from '../slices/authSlice';
import {
  toggleSidebar,
  setTheme,
  addToast,
  openModal,
  selectSidebarCollapsed,
  selectTheme,
  selectToasts,
} from '../slices/uiSlice';
import {
  addDashboardWidget,
  addRecentRoute,
  selectDashboardWidgets,
  selectRecentRoutes,
} from '../slices/preferencesSlice';
import { setCurrentSpace, selectCurrentSpace } from '../slices/spacesSlice';

/**
 * Example component demonstrating Redux store integration
 * 
 * This example shows:
 * 1. How to use Redux hooks (useAppDispatch, useAppSelector)
 * 2. How to dispatch actions
 * 3. How to select state from the store
 * 4. Common patterns for auth, UI, and preferences
 */
export default function ReduxIntegrationExample() {
  const dispatch = useAppDispatch();

  // Auth selectors
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // UI selectors
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed);
  const theme = useAppSelector(selectTheme);
  const toasts = useAppSelector(selectToasts);

  // Preferences selectors
  const dashboardWidgets = useAppSelector(selectDashboardWidgets);
  const recentRoutes = useAppSelector(selectRecentRoutes);

  // Spaces selectors
  const currentSpace = useAppSelector(selectCurrentSpace);

  // Example: Login handler
  const handleLogin = () => {
    const mockUser = {
      id: '1',
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
    };
    const mockToken = 'mock-jwt-token';
    const mockPermissions = [
      { resource: 'projects', actions: ['read', 'write', 'delete'] },
      { resource: 'hr', actions: ['read'] },
    ];

    dispatch(setCredentials({
      user: mockUser,
      token: mockToken,
      permissions: mockPermissions,
    }));

    dispatch(addToast({
      type: 'success',
      message: 'Login successful!',
      duration: 3000,
    }));
  };

  // Example: Logout handler
  const handleLogout = () => {
    dispatch(logout());
    dispatch(addToast({
      type: 'info',
      message: 'You have been logged out',
      duration: 3000,
    }));
  };

  // Example: Toggle sidebar
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  // Example: Toggle theme
  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    dispatch(addToast({
      type: 'info',
      message: `Theme changed to ${newTheme}`,
      duration: 2000,
    }));
  };

  // Example: Add dashboard widget
  const handleAddWidget = () => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: 'metric',
      title: 'New Metric',
      size: 'medium',
      config: {},
      visible: true,
    };

    dispatch(addDashboardWidget(newWidget));
    dispatch(addToast({
      type: 'success',
      message: 'Widget added to dashboard',
      duration: 2000,
    }));
  };

  // Example: Open modal
  const handleOpenModal = () => {
    dispatch(openModal({
      id: 'example-modal',
      type: 'confirm',
      props: {
        title: 'Confirm Action',
        message: 'Are you sure you want to proceed?',
        onConfirm: () => {
          dispatch(addToast({
            type: 'success',
            message: 'Action confirmed!',
            duration: 2000,
          }));
        },
      },
    }));
  };

  // Example: Change space
  const handleChangeSpace = (space) => {
    dispatch(setCurrentSpace(space));
    dispatch(addRecentRoute(`/${space}`));
  };

  // Example: Track route changes
  useEffect(() => {
    const currentPath = window.location.pathname;
    dispatch(addRecentRoute(currentPath));
  }, [dispatch]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Redux Store Integration Example</h1>

      {/* Auth Section */}
      <section className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        <div className="space-y-2">
          <p>
            <strong>Status:</strong>{' '}
            {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </p>
          {user && (
            <p>
              <strong>User:</strong> {user.firstName} {user.lastName} ({user.email})
            </p>
          )}
          <div className="flex gap-2 mt-4">
            {!isAuthenticated ? (
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Login
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </section>

      {/* UI Section */}
      <section className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">UI State</h2>
        <div className="space-y-2">
          <p>
            <strong>Sidebar:</strong> {sidebarCollapsed ? 'Collapsed' : 'Expanded'}
          </p>
          <p>
            <strong>Theme:</strong> {theme}
          </p>
          <p>
            <strong>Active Toasts:</strong> {toasts.length}
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleToggleSidebar}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Toggle Sidebar
            </button>
            <button
              onClick={handleToggleTheme}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Toggle Theme
            </button>
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Open Modal
            </button>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Preferences</h2>
        <div className="space-y-2">
          <p>
            <strong>Dashboard Widgets:</strong> {dashboardWidgets.length}
          </p>
          <p>
            <strong>Recent Routes:</strong>
          </p>
          <ul className="list-disc list-inside ml-4">
            {recentRoutes.slice(0, 5).map((route, index) => (
              <li key={index}>{route}</li>
            ))}
          </ul>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddWidget}
              className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Add Widget
            </button>
          </div>
        </div>
      </section>

      {/* Spaces Section */}
      <section className="mb-8 p-4 border rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Spaces</h2>
        <div className="space-y-2">
          <p>
            <strong>Current Space:</strong> {currentSpace}
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            {['dashboard', 'projects', 'hr', 'finance', 'sales', 'inventory'].map(
              (space) => (
                <button
                  key={space}
                  onClick={() => handleChangeSpace(space)}
                  className={`px-4 py-2 rounded ${
                    currentSpace === space
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {space.charAt(0).toUpperCase() + space.slice(1)}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Toast Display */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`p-4 rounded shadow-lg ${
                toast.type === 'success'
                  ? 'bg-green-500'
                  : toast.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              } text-white`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
