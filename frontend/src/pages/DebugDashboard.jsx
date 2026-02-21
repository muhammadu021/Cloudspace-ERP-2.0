import React from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser, selectAuthLoading } from '@/store/slices/authSlice';
import { useUserRole } from '@/hooks/useUserRole';
import { getUserRole, isSystemAdministrator, USER_TYPE_TO_ROLE } from '@/utils/roleMapping';

/**
 * Debug Dashboard - Shows auth state and role detection
 * Navigate to /debug-dashboard to see this page
 */
const DebugDashboard = () => {
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectAuthLoading);
  const roleInfo = useUserRole();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard Debug Information</h1>

      {/* Auth State */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Auth State</h2>
        <div className="space-y-2">
          <div>
            <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User exists:</strong> {user ? 'Yes' : 'No'}
          </div>
          {user && (
            <>
              <div>
                <strong>User ID:</strong> {user.id}
              </div>
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>Name:</strong> {user.first_name} {user.last_name}
              </div>
            </>
          )}
        </div>
      </div>

      {/* UserType Information */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">UserType Information</h2>
        <div className="space-y-2">
          <div>
            <strong>UserType exists:</strong> {user?.UserType ? 'Yes' : 'No'}
          </div>
          {user?.UserType && (
            <>
              <div>
                <strong>UserType (raw):</strong>
                <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto">
                  {JSON.stringify(user.UserType, null, 2)}
                </pre>
              </div>
              <div>
                <strong>UserType.name:</strong> {user.UserType.name || 'undefined'}
              </div>
              <div>
                <strong>typeof UserType:</strong> {typeof user.UserType}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Role Detection */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Role Detection (useUserRole hook)</h2>
        <div className="space-y-2">
          <div>
            <strong>Detected userType:</strong> {roleInfo.userType || 'null'}
          </div>
          <div>
            <strong>Mapped role:</strong> {roleInfo.role || 'null'}
          </div>
          <div>
            <strong>Is System Admin:</strong> {roleInfo.isSystemAdmin ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Loading:</strong> {roleInfo.loading ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      {/* Role Mapping Test */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Role Mapping Test</h2>
        <div className="space-y-2">
          <div>
            <strong>getUserRole("System Admin"):</strong> {getUserRole("System Admin")}
          </div>
          <div>
            <strong>getUserRole("System Administrator"):</strong> {getUserRole("System Administrator")}
          </div>
          <div>
            <strong>isSystemAdministrator("System Admin"):</strong> {isSystemAdministrator("System Admin") ? 'true' : 'false'}
          </div>
          <div>
            <strong>isSystemAdministrator("System Administrator"):</strong> {isSystemAdministrator("System Administrator") ? 'true' : 'false'}
          </div>
        </div>
      </div>

      {/* Role Mapping Table */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Complete Role Mapping</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">UserType Name</th>
              <th className="border p-2 text-left">Dashboard Role</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(USER_TYPE_TO_ROLE).map(([userType, role]) => (
              <tr key={userType}>
                <td className="border p-2">{userType}</td>
                <td className="border p-2">{role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* localStorage Check */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">localStorage Data</h2>
        <div className="space-y-2">
          <div>
            <strong>Token exists:</strong> {localStorage.getItem('token') ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>User in localStorage:</strong>
            <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto max-h-96">
              {localStorage.getItem('user') || 'null'}
            </pre>
          </div>
        </div>
      </div>

      {/* Full User Object */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Full User Object (Redux)</h2>
        <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-96">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Actions</h2>
        <div className="space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload Page
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Storage & Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugDashboard;
