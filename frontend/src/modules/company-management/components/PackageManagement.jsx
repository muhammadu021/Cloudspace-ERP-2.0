import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Save, X, ChevronDown, ChevronRight } from 'lucide-react';
import { SIDEBAR_MODULES_ARRAY } from '@/config/sidebarConfig';
import api from '@/services/api';
import { toast } from 'react-hot-toast';

const PackageManagement = () => {
  const [packages, setPackages] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const response = await api.get('/subscription-packages');
      setPackages(response.data);
    } catch (error) {
      toast.error('Failed to load packages');
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async (packageData) => {
    setLoading(true);
    try {
      await api.post('/subscription-packages', packageData);
      toast.success('Package created successfully');
      await loadPackages();
      setShowCreateModal(false);
    } catch (error) {
      toast.error('Failed to create package');
      console.error('Error creating package:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePackage = async (packageData) => {
    setLoading(true);
    try {
      await api.put(`/subscription-packages/${editingPackage.id}`, packageData);
      toast.success('Package updated successfully');
      await loadPackages();
      setEditingPackage(null);
    } catch (error) {
      toast.error('Failed to update package');
      console.error('Error updating package:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (packageId) => {
    const pkg = packages.find(p => p.id === packageId);
    if (pkg?.is_default) {
      toast.error('Cannot delete default packages');
      return;
    }
    if (window.confirm('Are you sure you want to delete this package?')) {
      setLoading(true);
      try {
        await api.delete(`/subscription-packages/${packageId}`);
        toast.success('Package deleted successfully');
        await loadPackages();
      } catch (error) {
        toast.error('Failed to delete package');
        console.error('Error deleting package:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Package Management
          </h1>
          <p className="text-gray-600 mt-1">Create and manage subscription packages with pre-configured modules</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading packages...</div>
        ) : packages.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">No packages found</div>
        ) : (
          packages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onEdit={() => setEditingPackage(pkg)}
              onDelete={() => handleDeletePackage(pkg.id)}
            />
          ))
        )}
      </div>

      {showCreateModal && (
        <PackageModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreatePackage}
        />
      )}

      {editingPackage && (
        <PackageModal
          package={editingPackage}
          onClose={() => setEditingPackage(null)}
          onSave={handleUpdatePackage}
        />
      )}
    </div>
  );
};

const PackageCard = ({ package: pkg, onEdit, onDelete }) => {
  const colorClasses = {
    gray: 'border-gray-400 bg-gray-50',
    orange: 'border-orange-400 bg-orange-50',
    yellow: 'border-yellow-400 bg-yellow-50',
    purple: 'border-purple-400 bg-purple-50',
    blue: 'border-blue-400 bg-primary-50'
  };

  const getModuleInfo = () => {
    if (pkg.modules === 'all' || !Array.isArray(pkg.modules)) {
      return { moduleCount: 'All', subItemCount: 'All' };
    }
    const moduleCount = pkg.modules.length;
    const subItemCount = pkg.modules.reduce((acc, mod) => {
      if (typeof mod === 'object' && mod.sub_items) {
        return acc + mod.sub_items.length;
      }
      return acc;
    }, 0);
    return { moduleCount, subItemCount };
  };

  const { moduleCount, subItemCount } = getModuleInfo();

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[pkg.color] || 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
          {pkg.is_default && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Default</span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-primary hover:bg-blue-100 rounded"
            title="Edit package"
          >
            <Edit className="h-4 w-4" />
          </button>
          {!pkg.is_default && (
            <button
              onClick={onDelete}
              className="p-1 text-red-600 hover:bg-red-100 rounded"
              title="Delete package"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Users:</span>
          <span className="font-medium">{pkg.max_users}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Storage:</span>
          <span className="font-medium">{pkg.max_storage_gb} GB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Modules:</span>
          <span className="font-medium">{moduleCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Sub-items:</span>
          <span className="font-medium">{subItemCount}</span>
        </div>
      </div>
    </div>
  );
};

const PackageModal = ({ package: pkg, onClose, onSave }) => {
  // Helper to normalize modules to new format
  const normalizeModules = (modules) => {
    // Parse if it's a JSON string
    if (typeof modules === 'string') {
      try {
        modules = JSON.parse(modules);
      } catch (e) {
        return [];
      }
    }
    
    if (modules === 'all') return 'all';
    if (!Array.isArray(modules)) return [];
    
    return modules.map(mod => {
      // Already in new format
      if (typeof mod === 'object' && mod.module_id) {
        return mod;
      }
      
      // Old format (string) - convert to new format
      if (typeof mod === 'string') {
        const module = SIDEBAR_MODULES_ARRAY.find(m => m.id === mod);
        return {
          module_id: mod,
          enabled: true,
          sub_items: module?.subItems?.map(item => item.permissionId || item.id) || []
        };
      }
      
      return mod;
    });
  };

  const [formData, setFormData] = useState({
    name: pkg?.name || '',
    description: pkg?.description || '',
    max_users: pkg?.max_users || 10,
    max_storage_gb: pkg?.max_storage_gb || 25,
    color: pkg?.color || 'blue',
    modules: normalizeModules(pkg?.modules || [])
  });

  const [expandedModules, setExpandedModules] = useState({});
  
  // Initialize expanded state for modules that have sub-items
  useEffect(() => {
    if (formData.modules !== 'all' && Array.isArray(formData.modules)) {
      const expanded = {};
      formData.modules.forEach(mod => {
        if (typeof mod === 'object' && mod.sub_items) {
          expanded[mod.module_id] = true;
        }
      });
      setExpandedModules(expanded);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleModule = (moduleId) => {
    setFormData(prev => {
      if (prev.modules === 'all') {
        return prev;
      }

      const moduleIndex = prev.modules.findIndex(m => 
        typeof m === 'string' ? m === moduleId : m.module_id === moduleId
      );

      if (moduleIndex !== -1) {
        // Remove module
        return {
          ...prev,
          modules: prev.modules.filter((m, i) => i !== moduleIndex)
        };
      } else {
        // Add module with all sub-items
        const module = SIDEBAR_MODULES_ARRAY.find(m => m.id === moduleId);
        const moduleData = {
          module_id: moduleId,
          enabled: true,
          sub_items: module?.subItems?.map(item => item.permissionId || item.id) || []
        };
        return {
          ...prev,
          modules: [...prev.modules, moduleData]
        };
      }
    });
  };

  const toggleSubItem = (moduleId, subItemId) => {
    setFormData(prev => {
      if (prev.modules === 'all') {
        return prev;
      }

      return {
        ...prev,
        modules: prev.modules.map(mod => {
          // Handle both old format (string) and new format (object)
          const currentModuleId = typeof mod === 'string' ? mod : mod.module_id;
          
          if (currentModuleId === moduleId) {
            // Convert to object format if it's a string
            if (typeof mod === 'string') {
              const module = SIDEBAR_MODULES_ARRAY.find(m => m.id === moduleId);
              const allSubItems = module?.subItems?.map(item => item.permissionId || item.id) || [];
              // Toggle the specific sub-item
              const newSubItems = allSubItems.includes(subItemId)
                ? allSubItems.filter(id => id !== subItemId)
                : [...allSubItems, subItemId];
              return {
                module_id: moduleId,
                enabled: true,
                sub_items: newSubItems
              };
            }
            
            // Already object format
            const subItems = mod.sub_items || [];
            const newSubItems = subItems.includes(subItemId)
              ? subItems.filter(id => id !== subItemId)
              : [...subItems, subItemId];
            return { ...mod, sub_items: newSubItems };
          }
          return mod;
        })
      };
    });
  };

  const toggleModuleExpanded = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleAllModules = () => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules === 'all' ? [] : 'all'
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const isModuleSelected = (moduleId) => {
    if (formData.modules === 'all') return true;
    return formData.modules.some(m => 
      typeof m === 'string' ? m === moduleId : m.module_id === moduleId
    );
  };

  const getSelectedModule = (moduleId) => {
    if (formData.modules === 'all') return null;
    const module = formData.modules.find(m => 
      typeof m === 'string' ? m === moduleId : m.module_id === moduleId
    );
    
    // If it's a string, convert it to object format for consistency
    if (typeof module === 'string') {
      const moduleConfig = SIDEBAR_MODULES_ARRAY.find(m => m.id === moduleId);
      return {
        module_id: moduleId,
        enabled: true,
        sub_items: moduleConfig?.subItems?.map(item => item.permissionId || item.id) || []
      };
    }
    
    return module;
  };

  const isSubItemSelected = (moduleId, subItemId) => {
    if (formData.modules === 'all') return true;
    const module = getSelectedModule(moduleId);
    if (!module) return false;
    
    // If module has sub_items array, check if subItemId is in it
    if (module.sub_items && Array.isArray(module.sub_items)) {
      return module.sub_items.includes(subItemId);
    }
    
    // If no sub_items defined, assume all are selected (old format)
    return true;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {pkg ? 'Edit Package' : 'Create New Package'}
              </h2>
              {pkg?.is_default && (
                <p className="text-sm text-green-600 mt-1">
                  Editing default package - changes will be saved
                </p>
              )}
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-150px)]">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <select
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="gray">Gray</option>
                    <option value="orange">Orange</option>
                    <option value="yellow">Yellow</option>
                    <option value="purple">Purple</option>
                    <option value="blue">Blue</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Brief description of this package"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Users
                  </label>
                  <input
                    type="number"
                    name="max_users"
                    value={formData.max_users}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Storage (GB)
                  </label>
                  <input
                    type="number"
                    name="max_storage_gb"
                    value={formData.max_storage_gb}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Module Selection */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Included Modules</h3>
                  <button
                    type="button"
                    onClick={toggleAllModules}
                    className="px-3 py-1 text-sm bg-blue-100 text-primary-700 rounded hover:bg-blue-200"
                  >
                    {formData.modules === 'all' ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {SIDEBAR_MODULES_ARRAY.map((module) => {
                    const isSelected = isModuleSelected(module.id);
                    const selectedModule = getSelectedModule(module.id);
                    const hasSubItems = module.subItems && module.subItems.length > 0;
                    const isExpanded = expandedModules[module.id];

                    return (
                      <div key={module.id} className="border border-gray-200 rounded-lg">
                        {/* Module Header */}
                        <div className="flex items-center gap-3 p-3 hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleModule(module.id)}
                            disabled={formData.modules === 'all'}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{module.name}</div>
                            <div className="text-xs text-gray-500">
                              {module.description}
                              {hasSubItems && (
                                <span className="ml-2 text-primary">
                                  ({module.subItems.length} items)
                                </span>
                              )}
                            </div>
                          </div>
                          {hasSubItems && isSelected && (
                            <button
                              type="button"
                              onClick={() => toggleModuleExpanded(module.id)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-600" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-600" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Sub-items */}
                        {isSelected && hasSubItems && isExpanded && (
                          <div className="border-t border-gray-200 bg-gray-50 p-3">
                            <div className="space-y-2">
                              {module.subItems.map((subItem) => {
                                const subItemId = subItem.permissionId || subItem.id;
                                const isSubSelected = isSubItemSelected(module.id, subItemId);

                                return (
                                  <div key={subItemId} className="flex items-center gap-2 pl-4">
                                    <input
                                      type="checkbox"
                                      checked={isSubSelected}
                                      onChange={() => toggleSubItem(module.id, subItemId)}
                                      disabled={formData.modules === 'all'}
                                      className="h-3 w-3 text-primary focus:ring-primary border-gray-300 rounded"
                                    />
                                    <label className="text-sm text-gray-700 flex-1">
                                      {subItem.name}
                                      {subItem.badge && (
                                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                          {subItem.badge}
                                        </span>
                                      )}
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Selected:</strong>{' '}
                    {formData.modules === 'all' 
                      ? 'All modules with all sub-items' 
                      : (() => {
                          const moduleCount = formData.modules.length;
                          const subItemCount = formData.modules.reduce((acc, mod) => {
                            if (typeof mod === 'object' && mod.sub_items) {
                              return acc + mod.sub_items.length;
                            }
                            return acc;
                          }, 0);
                          return `${moduleCount} modules with ${subItemCount} sub-items`;
                        })()
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {pkg ? 'Update Package' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PackageManagement;
