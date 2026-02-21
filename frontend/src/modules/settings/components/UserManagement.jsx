import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Users, Plus, Edit, Trash2, Save, X, Eye, Settings, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DESK_MODULES } from '@/config/sidebarConfig';
import api from '@/services/api';

// Helper to get company_id
const getCompanyId = () => {
  try {
    const companyId = localStorage.getItem('company_id');
    if (companyId) return companyId;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.company_id || user?.Company?.id;
  } catch (e) { return null; }
};

// All possible modules - IDs match the company's allowed_modules format
const ALL_MODULES = [
  { id: 'dashboard', name: 'Dashboard', description: 'Main dashboard and analytics', icon: '📊', category: 'Core' },
  { id: 'my-desk', name: 'My Desk', description: 'Employee self-service portal', icon: '🙋', category: 'Employee' },
  { id: 'office-desk', name: 'Office Desk', description: 'Office and document management', icon: '🏢', category: 'Operations' },
  { id: 'collaboration-desk', name: 'Collaboration', description: 'Team collaboration tools', icon: '🤝', category: 'Communication' },
  { id: 'hr-desk', name: 'Human Resources', description: 'Employee and HR management', icon: '👥', category: 'Management' },
  { id: 'finance-desk', name: 'Finance', description: 'Financial management', icon: '💰', category: 'Management' },
  { id: 'project-desk', name: 'Projects', description: 'Project management and tracking', icon: '📋', category: 'Management' },
  { id: 'inventory-desk', name: 'Inventory', description: 'Inventory and stock management', icon: '📦', category: 'Operations' },
  { id: 'purchase-desk', name: 'Purchase Requests', description: 'Purchase request workflow', icon: '🛒', category: 'Operations' },
  { id: 'procurement-desk', name: 'Procurement', description: 'Procurement management', icon: '📝', category: 'Operations' },
  { id: 'payroll-desk', name: 'Payroll', description: 'Payroll processing', icon: '💵', category: 'HR' },
  { id: 'expense-desk', name: 'Expenses', description: 'Expense management', icon: '🧾', category: 'Finance' },
  { id: 'admin-desk', name: 'Administration', description: 'System administration', icon: '⚙️', category: 'Admin' },
  { id: 'sales-desk', name: 'Sales', description: 'Sales management', icon: '💼', category: 'Sales' },
  { id: 'settings-desk', name: 'Settings', description: 'System settings', icon: '🔧', category: 'Admin' },
  { id: 'support-desk', name: 'Support', description: 'Help desk and support', icon: '🎫', category: 'Support' },
  { id: 'company-desk', name: 'Company', description: 'Company management', icon: '🏛️', category: 'Admin' }
];

const UserManagement = () => {
  const [userTypes, setUserTypes] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [companyAllowedModules, setCompanyAllowedModules] = useState([]);

  // Filter available modules based on company's allowed_modules
  // Only show modules that the company has access to
  const availableModules = companyAllowedModules.length > 0 
    ? ALL_MODULES.filter(module => companyAllowedModules.includes(module.id))
    : [];

  // Available sidebar modules (all possible modules)
  // Form state for creating/editing user types
  const [userTypeForm, setUserTypeForm] = useState({
    name: '',
    display_name: '',
    description: '',
    color: 'blue',
    selectedModules: []
  });

  // Load data on component mount
  useEffect(() => {
    loadCompanyModules();
    loadUserTypes();
    loadUsers();
  }, []);

  const loadCompanyModules = async () => {
    try {
      const company_id = getCompanyId();
      // Use current-company endpoint which includes allowed_modules
      const response = await api.get('/companies/current', { params: { company_id } });
      if (response.data?.success) {
        const allowedModules = response.data.data?.company?.allowed_modules || [];
        console.log('Company allowed modules:', allowedModules);
        setCompanyAllowedModules(allowedModules);
      }
    } catch (error) {
      console.error('Error loading company modules:', error);
      // Fallback: try to get from localStorage
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const allowedModules = user?.Company?.allowed_modules || [];
        setCompanyAllowedModules(allowedModules);
      } catch (e) {}
    }
  };

  const loadUserTypes = async () => {
    try {
      const company_id = getCompanyId();
      const response = await fetch(`/api/v1/user-types?company_id=${company_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        
        setUserTypes(data.data.userTypes || []);
      }
    } catch (error) {
      console.error('Error loading user types:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const company_id = getCompanyId();
      const response = await fetch(`/api/v1/admin/users?company_id=${company_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUserType = () => {
    setUserTypeForm({
      name: '',
      display_name: '',
      description: '',
      color: 'blue',
      selectedModules: []
    });
    setShowCreateModal(true);
  };

  const handleEditUserType = (userType) => {
    setSelectedUserType(userType);
    
    // Extract selected module IDs from sidebar_modules
    // sidebar_modules can contain: module_id, items array, or sub_items array
    let selectedIds = [];
    if (Array.isArray(userType.sidebar_modules)) {
      userType.sidebar_modules.forEach(m => {
        if (typeof m === 'string') {
          selectedIds.push(m);
        } else if (typeof m === 'object') {
          // Add module_id
          if (m.module_id) selectedIds.push(m.module_id);
          // Add items if present
          if (Array.isArray(m.items)) {
            selectedIds.push(...m.items);
          }
          // Add sub_items if present
          if (Array.isArray(m.sub_items)) {
            selectedIds.push(...m.sub_items);
          }
        }
      });
    }
    
    setUserTypeForm({
      name: userType.name,
      display_name: userType.display_name,
      description: userType.description || '',
      color: userType.color || 'blue',
      selectedModules: selectedIds
    });
    setShowEditModal(true);
  };

  const handleModuleToggle = (moduleId) => {
    setUserTypeForm(prev => ({
      ...prev,
      selectedModules: prev.selectedModules.includes(moduleId)
        ? prev.selectedModules.filter(id => id !== moduleId)
        : [...prev.selectedModules, moduleId]
    }));
  };

  const handleSaveUserType = async () => {
    try {
      const company_id = localStorage.getItem('company_id');
      const payload = {
        company_id,
        name: userTypeForm.name,
        display_name: userTypeForm.display_name,
        description: userTypeForm.description,
        color: userTypeForm.color,
        sidebar_modules: userTypeForm.selectedModules.map(moduleId => ({
          module_id: moduleId,
          enabled: true,
          permissions: ['read']
        }))
      };

      const url = selectedUserType 
        ? `/api/v1/user-types/${selectedUserType.id}`
        : '/api/v1/user-types';
      
      const method = selectedUserType ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (data.success) {
        await loadUserTypes();
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedUserType(null);
      } else {
        toast(data.message || 'Failed to save user type');
      }
    } catch (error) {
      console.error('Error saving user type:', error);
      toast.error('Failed to save user type');
    }
  };

  const handleDeleteUserType = async (userType) => {
    if (!confirm(`Are you sure you want to delete "${userType.display_name}"?`)) {
      return;
    }

    try {
      const company_id = localStorage.getItem('company_id');
      const response = await fetch(`/api/v1/user-types/${userType.id}?company_id=${company_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        await loadUserTypes();
      } else {
        toast(data.message || 'Failed to delete user type');
      }
    } catch (error) {
      console.error('Error deleting user type:', error);
      toast.error('Failed to delete user type');
    }
  };

  const handleAssignUserType = (user) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const handleSaveUserAssignment = async (userTypeId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/v1/admin/users/${selectedUser.id}/user-type`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          user_type_id: userTypeId,
          company_id: user.company_id
        })
      });

      const data = await response.json();
      if (data.success) {
        await loadUsers();
        setShowAssignModal(false);
        setSelectedUser(null);
      } else {
        toast(data.message || 'Failed to assign user type');
      }
    } catch (error) {
      console.error('Error assigning user type:', error);
      toast.error('Failed to assign user type');
    }
  };

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-primary-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[color] || colors.blue;
  };

  const groupModulesByCategory = () => {
    const grouped = {};
    availableModules.forEach(module => {
      if (!grouped[module.category]) {
        grouped[module.category] = [];
      }
      grouped[module.category].push(module);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Create user types and assign sidebar access</p>
        </div>
        <button
          onClick={handleCreateUserType}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create User Type
        </button>
      </div>

      {/* User Types Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            User Types ({userTypes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userTypes.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No user types created yet</p>
              <button
                onClick={handleCreateUserType}
                className="mt-4 text-primary hover:text-blue-800"
              >
                Create your first user type
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTypes.map((userType) => (
                <div key={userType.id} className={`border rounded-lg p-4 ${getColorClass(userType.color)}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{userType.display_name}</h3>
                      <p className="text-sm opacity-75">{userType.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditUserType(userType)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUserType(userType)}
                        className="p-1 hover:bg-white hover:bg-opacity-50 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Users:</span>
                      <span className="font-medium">{userType.user_count || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Modules:</span>
                      <span className="font-medium">{Array.isArray(userType.sidebar_modules) ? userType.sidebar_modules.length : 0}</span>
                    </div>
                    
                    {Array.isArray(userType.sidebar_modules) && userType.sidebar_modules.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium mb-1">Assigned Modules:</p>
                        <div className="flex flex-wrap gap-1">
                          {userType.sidebar_modules.slice(0, 3).map((module, index) => {
                            try {
                              let moduleId;
                              if (typeof module === 'object' && module !== null) {
                                moduleId = module.module_id;
                              } else {
                                moduleId = module;
                              }
                              // Ensure moduleId is a string or number
                              if (moduleId === undefined || moduleId === null) {
                                return null;
                              }
                              const key = typeof moduleId === 'string' || typeof moduleId === 'number' ? String(moduleId) : `module-${index}`;
                              const moduleInfo = availableModules.find(m => m.id === moduleId);
                              return (
                                <span key={key} className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                                  {moduleInfo?.name || key}
                                </span>
                              );
                            } catch (error) {
                              console.warn('Error rendering module:', module, error);
                              return null;
                            }
                          }).filter(Boolean)}
                          {userType.sidebar_modules.length > 3 && (
                            <span className="text-xs px-2 py-1 bg-white bg-opacity-50 rounded">
                              +{userType.sidebar_modules.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Users ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => {
                    const userType = userTypes.find(ut => ut.id === user.user_type_id);
                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.first_name?.[0]}{user.last_name?.[0]}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {userType ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getColorClass(userType.color)}`}>
                              {userType.display_name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">No type assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleAssignUserType(user)}
                            className="text-primary hover:text-blue-900 mr-3"
                          >
                            Assign Type
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit User Type Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedUserType ? 'Edit User Type' : 'Create User Type'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedUserType(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={userTypeForm.display_name}
                    onChange={(e) => setUserTypeForm(prev => ({ ...prev, display_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Employee, Manager, Admin"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Name *
                  </label>
                  <input
                    type="text"
                    value={userTypeForm.name}
                    onChange={(e) => setUserTypeForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., employee, manager, admin"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={userTypeForm.description}
                    onChange={(e) => setUserTypeForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Describe the role and responsibilities..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Theme
                  </label>
                  <select
                    value={userTypeForm.color}
                    onChange={(e) => setUserTypeForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="purple">Purple</option>
                    <option value="yellow">Yellow</option>
                    <option value="red">Red</option>
                    <option value="gray">Gray</option>
                  </select>
                </div>
              </div>

              {/* Sidebar Module Selection - Hierarchical */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Select Sidebar Modules
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Select modules available in your company's subscription package
                </p>

                <div className="border rounded-lg bg-gray-50 max-h-96 overflow-y-auto">
                  {companyAllowedModules.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      Loading company modules...
                    </div>
                  ) : Object.entries(DESK_MODULES)
                    .filter(([moduleId]) => companyAllowedModules.includes(moduleId))
                    .map(([moduleId, moduleConfig]) => {
                    const subItems = moduleConfig.subItems || [];
                    const isExpanded = expandedModules[moduleId];
                    const selectedSubItems = subItems.filter(sub => 
                      userTypeForm.selectedModules.includes(sub.id)
                    );
                    const isFullySelected = subItems.length > 0 && selectedSubItems.length === subItems.length;
                    const isPartiallySelected = selectedSubItems.length > 0 && selectedSubItems.length < subItems.length;

                    return (
                      <div key={moduleId} className="border-b last:border-b-0">
                        {/* Parent Module */}
                        <div 
                          className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 ${
                            isFullySelected ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 flex-1" onClick={() => subItems.length > 0 && setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }))}>
                            {subItems.length > 0 && (
                              <button type="button" className="text-gray-500">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            )}
                            <label className="flex items-center gap-2 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={isFullySelected}
                                ref={input => { if (input) input.indeterminate = isPartiallySelected; }}
                                onChange={() => {
                                  if (subItems.length > 0) {
                                    const subItemIds = subItems.map(s => s.id);
                                    setUserTypeForm(prev => {
                                      let newModules = [...prev.selectedModules];
                                      if (isFullySelected) {
                                        newModules = newModules.filter(m => !subItemIds.includes(m));
                                      } else {
                                        subItemIds.forEach(id => {
                                          if (!newModules.includes(id)) newModules.push(id);
                                        });
                                      }
                                      return { ...prev, selectedModules: newModules };
                                    });
                                  }
                                }}
                                className="rounded text-primary w-4 h-4"
                              />
                              <span className="font-medium text-gray-900">{moduleConfig.name}</span>
                              {subItems.length > 0 && (
                                <span className="text-xs text-gray-500">
                                  ({selectedSubItems.length}/{subItems.length})
                                </span>
                              )}
                            </label>
                          </div>
                        </div>
                        
                        {/* Sub Items */}
                        {subItems.length > 0 && isExpanded && (
                          <div className="bg-white border-t">
                            {subItems.map(subItem => (
                              <label 
                                key={subItem.id}
                                className={`flex items-center gap-3 px-4 py-2 pl-12 cursor-pointer hover:bg-gray-50 ${
                                  userTypeForm.selectedModules.includes(subItem.id) ? 'bg-primary-50' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={userTypeForm.selectedModules.includes(subItem.id)}
                                  onChange={() => {
                                    setUserTypeForm(prev => ({
                                      ...prev,
                                      selectedModules: prev.selectedModules.includes(subItem.id)
                                        ? prev.selectedModules.filter(m => m !== subItem.id)
                                        : [...prev.selectedModules, subItem.id]
                                    }));
                                  }}
                                  className="rounded text-primary w-4 h-4"
                                />
                                <span className="text-sm text-gray-700">{subItem.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {userTypeForm.selectedModules.length} permissions
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                  setSelectedUserType(null);
                  setExpandedModules({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUserType}
                disabled={!userTypeForm.name || !userTypeForm.display_name}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2 inline" />
                {selectedUserType ? 'Update' : 'Create'} User Type
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Type Modal */}
      {showAssignModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Assign User Type to {selectedUser.first_name} {selectedUser.last_name}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select a user type to assign to this user. This will determine which sidebar modules they can access.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userTypes.map((userType) => (
                  <div
                    key={userType.id}
                    className={`border rounded-lg p-4 cursor-pointer hover:border-blue-300 ${getColorClass(userType.color)}`}
                    onClick={() => handleSaveUserAssignment(userType.id)}
                  >
                    <h4 className="font-medium">{userType.display_name}</h4>
                    <p className="text-sm opacity-75 mt-1">{userType.description}</p>
                    <div className="mt-2 text-xs">
                      <span className="font-medium">{Array.isArray(userType.sidebar_modules) ? userType.sidebar_modules.length : 0} modules</span>
                      {userType.user_count > 0 && (
                        <span className="ml-2">• {userType.user_count} users</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {userTypes.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No user types available. Create a user type first.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;