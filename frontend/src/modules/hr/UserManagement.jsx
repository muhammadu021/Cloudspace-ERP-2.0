import React, { useState, useEffect } from 'react';
import { API_URL } from '@/services/api';
import { toast } from 'react-hot-toast';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Shield,
  Save,
  X
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSidebarModal, setShowSidebarModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    email: '',
    username: '',
    password: '',
    user_type_id: '',
    is_active: true
  });
  const [sidebarModules, setSidebarModules] = useState([]);

  const availableModules = [
    { id: 'dashboard', name: 'Dashboard', description: 'Main dashboard access' },
    { id: 'hr', name: 'Human Resources', description: 'HR management functions' },
    { id: 'payroll', name: 'Payroll', description: 'Payroll processing' },
    { id: 'finance', name: 'Finance', description: 'Financial management' },
    { id: 'inventory', name: 'Inventory', description: 'Inventory management' },
    { id: 'sales', name: 'Sales', description: 'Sales management' },
    { id: 'projects', name: 'Projects', description: 'Project management' },
    { id: 'documents', name: 'Documents', description: 'Document management' },
    { id: 'reports', name: 'Reports', description: 'Reporting and analytics' },
    { id: 'admin', name: 'Administration', description: 'System administration' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('company_id');

      // Load users
      const usersResponse = await fetch(`${API_URL}/users?company_id=${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersResponse.json();
      if (usersData.success) {
        setUsers(usersData.data || []);
      }

      // Load employees
      const employeesResponse = await fetch(`${API_URL}/employees?company_id=${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const employeesData = await employeesResponse.json();
      if (employeesData.success) {
        setEmployees(employeesData.data || []);
      }

      // Load user types
      const userTypesResponse = await fetch(`${API_URL}/user-types?company_id=${companyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userTypesData = await userTypesResponse.json();
      if (userTypesData.success) {
        setUserTypes(userTypesData.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const companyId = localStorage.getItem('company_id');
      
      const url = selectedUser 
        ? `${API_URL}/users/${selectedUser.id}`
        : `${API_URL}/users`;
      
      const method = selectedUser ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          company_id: companyId
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(selectedUser ? 'User updated successfully' : 'User created successfully');
        setShowModal(false);
        resetForm();
        loadData();
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Error saving user');
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      employee_id: user.employee_id || '',
      email: user.email || '',
      username: user.username || '',
      password: '',
      user_type_id: user.user_type_id || '',
      is_active: user.is_active !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('User deleted successfully');
        loadData();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Error deleting user');
    }
  };

  const handleSidebarAssignment = (user) => {
    setSelectedUser(user);
    const currentModules = user.UserType?.sidebar_modules || [];
    setSidebarModules(Array.isArray(currentModules) ? currentModules : []);
    setShowSidebarModal(true);
  };

  const handleModuleToggle = (moduleId) => {
    setSidebarModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const saveSidebarAssignment = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/user-types/${selectedUser.user_type_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sidebar_modules: sidebarModules
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Sidebar access updated successfully');
        setShowSidebarModal(false);
        loadData();
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating sidebar access:', error);
      toast.error('Error updating sidebar access');
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      email: '',
      username: '',
      password: '',
      user_type_id: '',
      is_active: true
    });
    setSelectedUser(null);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage system users and their access permissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="h-5 w-5" />
            System Users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {user.Employee ? `${user.Employee.first_name} ${user.Employee.last_name}` : 'No employee linked'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.UserType?.display_name || 'No type assigned'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary hover:text-blue-900"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSidebarAssignment(user)}
                        className="text-green-600 hover:text-green-900"
                        title="Manage Sidebar Access"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {selectedUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee
                </label>
                <select
                  value={formData.employee_id}
                  onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name} - {emp.employee_id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password {selectedUser && '(leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  required={!selectedUser}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User Type
                </label>
                <select
                  value={formData.user_type_id}
                  onChange={(e) => setFormData({...formData, user_type_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                  required
                >
                  <option value="">Select User Type</option>
                  {userTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.display_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active User
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {selectedUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sidebar Assignment Modal */}
      {showSidebarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Manage Sidebar Access - {selectedUser?.username}
              </h3>
              <button
                onClick={() => setShowSidebarModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {availableModules.map(module => (
                <div key={module.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{module.name}</div>
                    <div className="text-sm text-gray-500">{module.description}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={sidebarModules.includes(module.id)}
                    onChange={() => handleModuleToggle(module.id)}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowSidebarModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveSidebarAssignment}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Access
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
