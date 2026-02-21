import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Edit2, UserCheck, UserX, Search, 
  Shield, ChevronDown, ChevronUp, Check, X 
} from 'lucide-react';
import { companyUserService } from '@/services/companyUserService';
import { DESK_MODULES } from '@/config/sidebarConfig';
import toast from 'react-hot-toast';

const CompanyUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [expandedModules, setExpandedModules] = useState({});

  const [formData, setFormData] = useState({
    username: '', email: '', password: '', first_name: '', last_name: '', phone: '',
    assigned_modules: []
  });

  useEffect(() => {
    loadData();
  }, [pagination.page, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, modulesRes] = await Promise.all([
        companyUserService.getUsers({ page: pagination.page, limit: pagination.limit, search }),
        companyUserService.getAvailableModules()
      ]);
      
      setUsers(usersRes.data.users || []);
      setPagination(prev => ({ ...prev, ...usersRes.data.pagination }));
      setAvailableModules(modulesRes.data.available_modules || []);
      setCompanyInfo(modulesRes.data.company);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Build hierarchical module list from available modules only
  const getHierarchicalModules = () => {
    const moduleMap = {};
    
    availableModules.forEach(mod => {
      const moduleId = mod.module_id;
      const moduleConfig = DESK_MODULES[moduleId];
      const backendSubItems = mod.sub_items || [];
      
      if (moduleConfig) {
        // Use sub_items from backend to filter allowed sub-items
        const allowedSubItems = (moduleConfig.subItems || [])
          .filter(sub => backendSubItems.includes(sub.id) || backendSubItems.includes(sub.permissionId))
          .map(sub => ({
            id: sub.id || sub.permissionId,
            name: sub.name
          }));
        
        moduleMap[moduleId] = {
          id: moduleId,
          name: moduleConfig.name,
          subItems: allowedSubItems
        };
      }
    });
    
    return Object.values(moduleMap);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await companyUserService.createUser(formData);
      toast.success('User created successfully');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateModules = async () => {
    if (!selectedUser) return;
    try {
      await companyUserService.updateUserModules(selectedUser.id, formData.assigned_modules);
      toast.success('User modules updated');
      setShowEditModal(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update modules');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await companyUserService.toggleUserStatus(user.id, !user.is_active);
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
      loadData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({ ...formData, assigned_modules: user.assigned_modules || [] });
    setExpandedModules({});
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      username: '', email: '', password: '', first_name: '', last_name: '', phone: '',
      assigned_modules: []
    });
    setSelectedUser(null);
    setExpandedModules({});
  };

  // Build list of all allowed module IDs (parents + sub-items)
  const getAllowedModuleIds = () => {
    const ids = [];
    availableModules.forEach(mod => {
      ids.push(mod.module_id);
      if (mod.sub_items) ids.push(...mod.sub_items);
    });
    return ids;
  };

  const toggleModule = (moduleId) => {
    const allowedIds = getAllowedModuleIds();
    if (!allowedIds.includes(moduleId)) {
      toast.error('This module is not available in your company package');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      assigned_modules: prev.assigned_modules.includes(moduleId)
        ? prev.assigned_modules.filter(m => m !== moduleId)
        : [...prev.assigned_modules, moduleId]
    }));
  };

  const toggleExpand = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleAllSubItems = (module, select) => {
    const subItemIds = module.subItems.map(s => s.id);
    
    setFormData(prev => {
      let newModules = [...prev.assigned_modules];
      if (select) {
        subItemIds.forEach(id => {
          if (!newModules.includes(id)) newModules.push(id);
        });
      } else {
        newModules = newModules.filter(m => !subItemIds.includes(m));
      }
      return { ...prev, assigned_modules: newModules };
    });
  };

  const isModuleFullySelected = (module) => {
    if (module.subItems.length === 0) return formData.assigned_modules.includes(module.id);
    return module.subItems.every(sub => formData.assigned_modules.includes(sub.id));
  };

  const isModulePartiallySelected = (module) => {
    if (module.subItems.length === 0) return false;
    const selectedCount = module.subItems.filter(sub => formData.assigned_modules.includes(sub.id)).length;
    return selectedCount > 0 && selectedCount < module.subItems.length;
  };

  const HierarchicalModuleSelector = ({ selectedModules, onToggle }) => {
    const hierarchicalModules = getHierarchicalModules();
    
    return (
      <div className="border rounded-lg bg-gray-50 max-h-80 overflow-y-auto">
        {hierarchicalModules.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No modules available</div>
        ) : (
          hierarchicalModules.map(module => (
            <div key={module.id} className="border-b last:border-b-0">
              {/* Parent Module */}
              <div 
                className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 ${
                  isModuleFullySelected(module) ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1" onClick={() => module.subItems.length > 0 && toggleExpand(module.id)}>
                  {module.subItems.length > 0 && (
                    <button type="button" className="text-gray-500">
                      {expandedModules[module.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={isModuleFullySelected(module)}
                      ref={input => {
                        if (input) input.indeterminate = isModulePartiallySelected(module);
                      }}
                      onChange={() => {
                        if (module.subItems.length > 0) {
                          toggleAllSubItems(module, !isModuleFullySelected(module));
                        } else {
                          onToggle(module.id);
                        }
                      }}
                      className="rounded text-primary w-4 h-4"
                    />
                    <span className="font-medium text-gray-900">{module.name}</span>
                    {module.subItems.length > 0 && (
                      <span className="text-xs text-gray-500">
                        ({module.subItems.filter(s => selectedModules.includes(s.id)).length}/{module.subItems.length})
                      </span>
                    )}
                  </label>
                </div>
              </div>
              
              {/* Sub Items */}
              {module.subItems.length > 0 && expandedModules[module.id] && (
                <div className="bg-white border-t">
                  {module.subItems.map(subItem => (
                    <label 
                      key={subItem.id}
                      className={`flex items-center gap-3 px-4 py-2 pl-12 cursor-pointer hover:bg-gray-50 ${
                        selectedModules.includes(subItem.id) ? 'bg-primary-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedModules.includes(subItem.id)}
                        onChange={() => onToggle(subItem.id)}
                        className="rounded text-primary w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{subItem.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          {companyInfo && (
            <p className="text-gray-600">Manage users for {companyInfo.name}</p>
          )}
        </div>
        <button
          onClick={() => { resetForm(); setShowCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modules</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-primary font-medium">
                        {user.first_name?.[0]}{user.last_name?.[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {(user.assigned_modules || []).slice(0, 3).map(m => (
                      <span key={m} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {m.replace(/-/g, ' ')}
                      </span>
                    ))}
                    {(user.assigned_modules || []).length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{user.assigned_modules.length - 3} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openEditModal(user)}
                    className="text-primary hover:text-blue-900 mr-3"
                    title="Edit Modules"
                  >
                    <Shield className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleStatus(user)}
                    className={user.is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                    title={user.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
              className={`px-3 py-1 rounded ${
                pagination.page === i + 1 ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Module Access
                  <span className="text-gray-500 font-normal ml-2">(Click module to expand and select specific items)</span>
                </label>
                <HierarchicalModuleSelector 
                  selectedModules={formData.assigned_modules} 
                  onToggle={toggleModule} 
                />
                <p className="mt-2 text-xs text-gray-500">
                  Selected: {formData.assigned_modules.length} permissions
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modules Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Edit Modules for {selectedUser.first_name} {selectedUser.last_name}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Module Access
                <span className="text-gray-500 font-normal ml-2">(Click module to expand and select specific items)</span>
              </label>
              <HierarchicalModuleSelector 
                selectedModules={formData.assigned_modules} 
                onToggle={toggleModule} 
              />
              <p className="mt-2 text-xs text-gray-500">
                Selected: {formData.assigned_modules.length} permissions
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateModules}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyUserManagement;
