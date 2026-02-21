import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Upload, 
  Package, 
  Shield, 
  Settings as SettingsIcon,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { SIDEBAR_MODULES_ARRAY } from '@/config/sidebarConfig';
import { API_URL } from '@/services/api';

const CompanySettingsModal = ({ company, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState([]);
  const [expandedModules, setExpandedModules] = useState({});
  
  const [formData, setFormData] = useState({
    // General Settings
    name: company?.name || '',
    legal_name: company?.legal_name || '',
    email: company?.email || '',
    phone: company?.phone || '',
    website: company?.website || '',
    
    // Address
    address_line1: company?.address_line1 || '',
    city: company?.city || '',
    state: company?.state || '',
    postal_code: company?.postal_code || '',
    country: company?.country || '',
    
    // Subscription
    subscription_plan: company?.subscription_plan || 'trial',
    subscription_status: company?.subscription_status || 'active',
    max_users: company?.max_users || 10,
    max_storage_gb: company?.max_storage_gb || 10,
    
    // Logo
    logo_url: company?.logo_url || '',
    
    // Extra Modules (beyond package)
    extra_modules: [],
    
    // Status
    is_active: company?.is_active !== false,
    
    // Notes
    notes: company?.notes || ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(company?.logo_url || '');

  useEffect(() => {
    loadPackages();
    loadCompanyModules();
  }, []);

  const loadPackages = () => {
    const savedPackages = localStorage.getItem('subscription_packages');
    if (savedPackages) {
      setPackages(JSON.parse(savedPackages));
    }
  };

  const loadCompanyModules = () => {
    // Load current company modules from allowed_modules
    if (company?.allowed_modules && Array.isArray(company.allowed_modules)) {
      const currentModules = company.allowed_modules.map(moduleId => ({
        module_id: moduleId,
        enabled: true,
        sub_items: []
      }));
      setFormData(prev => ({
        ...prev,
        extra_modules: currentModules
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePackageChange = (packageId) => {
    const selectedPackage = packages.find(p => p.id === packageId);
    if (selectedPackage) {
      setFormData(prev => ({
        ...prev,
        subscription_plan: packageId,
        max_users: selectedPackage.max_users,
        max_storage_gb: selectedPackage.max_storage_gb,
        // Update modules to package modules
        extra_modules: selectedPackage.modules === 'all' 
          ? SIDEBAR_MODULES_ARRAY.map(m => ({
              module_id: m.id,
              enabled: true,
              sub_items: m.subItems?.map(item => item.permissionId || item.id) || []
            }))
          : selectedPackage.modules
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleExtraModule = (moduleId) => {
    setFormData(prev => {
      const existingIndex = prev.extra_modules.findIndex(m => 
        typeof m === 'string' ? m === moduleId : m.module_id === moduleId
      );

      if (existingIndex !== -1) {
        // Remove module
        return {
          ...prev,
          extra_modules: prev.extra_modules.filter((m, i) => i !== existingIndex)
        };
      } else {
        // Add module with all sub-items
        const module = SIDEBAR_MODULES_ARRAY.find(m => m.id === moduleId);
        return {
          ...prev,
          extra_modules: [...prev.extra_modules, {
            module_id: moduleId,
            enabled: true,
            sub_items: module?.subItems?.map(item => item.permissionId || item.id) || []
          }]
        };
      }
    });
  };

  const toggleSubItem = (moduleId, subItemId) => {
    setFormData(prev => ({
      ...prev,
      extra_modules: prev.extra_modules.map(mod => {
        const currentModuleId = typeof mod === 'string' ? mod : mod.module_id;
        
        if (currentModuleId === moduleId) {
          if (typeof mod === 'string') {
            const module = SIDEBAR_MODULES_ARRAY.find(m => m.id === moduleId);
            const allSubItems = module?.subItems?.map(item => item.permissionId || item.id) || [];
            const newSubItems = allSubItems.includes(subItemId)
              ? allSubItems.filter(id => id !== subItemId)
              : [...allSubItems, subItemId];
            return {
              module_id: moduleId,
              enabled: true,
              sub_items: newSubItems
            };
          }
          
          const subItems = mod.sub_items || [];
          const newSubItems = subItems.includes(subItemId)
            ? subItems.filter(id => id !== subItemId)
            : [...subItems, subItemId];
          return { ...mod, sub_items: newSubItems };
        }
        return mod;
      })
    }));
  };

  const isModuleSelected = (moduleId) => {
    return formData.extra_modules.some(m => 
      typeof m === 'string' ? m === moduleId : m.module_id === moduleId
    );
  };

  const getSelectedModule = (moduleId) => {
    return formData.extra_modules.find(m => 
      typeof m === 'object' && m.module_id === moduleId
    );
  };

  const isSubItemSelected = (moduleId, subItemId) => {
    const module = getSelectedModule(moduleId);
    if (!module) return false;
    return module.sub_items?.includes(subItemId) || false;
  };

  const toggleModuleExpanded = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare form data for file upload
      const submitData = new FormData();
      
      // Add all fields
      Object.keys(formData).forEach(key => {
        if (key === 'extra_modules') {
          // Extract module IDs and save to allowed_modules
          const moduleIds = formData.extra_modules.map(m => 
            typeof m === 'string' ? m : m.module_id
          );
          submitData.append('allowed_modules', JSON.stringify(moduleIds));
        } else if (key !== 'logo_url') {
          submitData.append(key, formData[key]);
        }
      });

      // Add logo file if selected
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      const response = await fetch(`${API_URL}/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        alert('Company settings updated successfully!');
        onSuccess();
      } else {
        alert('Failed to update company: ' + data.message);
      }
    } catch (error) {
      console.error('Error updating company:', error);
      alert('An error occurred while updating the company');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!confirm('Are you sure you want to suspend this company? Users will not be able to access the system.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription_status: 'suspended',
          is_active: false
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Company suspended successfully!');
        onSuccess();
      }
    } catch (error) {
      console.error('Error suspending company:', error);
      alert('Failed to suspend company');
    }
  };

  const handleActivate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/companies/${company.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription_status: 'active',
          is_active: true
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('Company activated successfully!');
        onSuccess();
      }
    } catch (error) {
      console.error('Error activating company:', error);
      alert('Failed to activate company');
    }
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      {/* Company Info */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legal Name
            </label>
            <input
              type="text"
              name="legal_name"
              value={formData.legal_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="address_line1"
              value={formData.address_line1}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h3>
        <div className="flex items-start gap-4">
          {logoPreview && (
            <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
              <img 
                src={logoPreview} 
                alt="Company Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="block">
              <div className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPackageTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Package</h3>
        <div className="grid grid-cols-2 gap-4">
          {packages.map((pkg) => {
            const colorClasses = {
              gray: 'border-gray-400 bg-gray-50',
              orange: 'border-orange-400 bg-orange-50',
              yellow: 'border-yellow-400 bg-yellow-50',
              purple: 'border-purple-400 bg-purple-50',
              blue: 'border-blue-400 bg-primary-50'
            };

            const selectedColorClasses = {
              gray: 'border-gray-600 bg-gray-100',
              orange: 'border-orange-600 bg-orange-100',
              yellow: 'border-yellow-600 bg-yellow-100',
              purple: 'border-purple-600 bg-purple-100',
              blue: 'border-primary bg-blue-100'
            };

            const isSelected = formData.subscription_plan === pkg.id;

            return (
              <div
                key={pkg.id}
                onClick={() => handlePackageChange(pkg.id)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? selectedColorClasses[pkg.color] || 'border-primary bg-primary-50'
                    : colorClasses[pkg.color] || 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">{pkg.name}</h4>
                  {isSelected && <CheckCircle className="h-5 w-5 text-green-600" />}
                </div>
                <p className="text-xs text-gray-600 mb-2">{pkg.description}</p>
                <p className="text-sm font-medium text-gray-700">
                  {pkg.max_users} users • {pkg.max_storage_gb} GB
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
    </div>
  );

  const renderModulesTab = () => (
    <div className="space-y-4">
      <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Current Package:</strong> {formData.subscription_plan}
        </p>
        <p className="text-xs text-primary mt-1">
          You can add extra modules beyond the package or customize module access
        </p>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {SIDEBAR_MODULES_ARRAY.map((module) => {
          const isSelected = isModuleSelected(module.id);
          const selectedModule = getSelectedModule(module.id);
          const hasSubItems = module.subItems && module.subItems.length > 0;
          const isExpanded = expandedModules[module.id];

          return (
            <div key={module.id} className="border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 p-3 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleExtraModule(module.id)}
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
                            className="h-3 w-3 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <label className="text-sm text-gray-700 flex-1">
                            {subItem.name}
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

      <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Selected:</strong> {formData.extra_modules.length} modules
        </p>
      </div>
    </div>
  );

  const renderStatusTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Status</h3>
        
        <div className="p-4 border-2 rounded-lg mb-4" style={{
          borderColor: company.subscription_status === 'active' ? '#10b981' : '#ef4444',
          backgroundColor: company.subscription_status === 'active' ? '#d1fae5' : '#fee2e2'
        }}>
          <div className="flex items-center gap-3">
            {company.subscription_status === 'active' ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
            <div>
              <p className="font-semibold text-lg">
                Status: {company.subscription_status?.toUpperCase()}
              </p>
              <p className="text-sm text-gray-600">
                {company.is_active ? 'Company is active' : 'Company is inactive'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {company.subscription_status === 'active' ? (
            <button
              type="button"
              onClick={handleSuspend}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <AlertTriangle className="h-4 w-4" />
              Suspend Company
            </button>
          ) : (
            <button
              type="button"
              onClick={handleActivate}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Activate Company
            </button>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h3>
        <select
          name="subscription_status"
          value={formData.subscription_status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
        >
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          placeholder="Internal notes about this company..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">
          Company is active
        </label>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-primary" />
              Company Settings - {company.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage package, modules, logo, and company status
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex px-6">
            {[
              { id: 'general', label: 'General', icon: SettingsIcon },
              { id: 'package', label: 'Package', icon: Package },
              { id: 'modules', label: 'Modules', icon: Plus },
              { id: 'status', label: 'Status', icon: Shield }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === 'general' && renderGeneralTab()}
            {activeTab === 'package' && renderPackageTab()}
            {activeTab === 'modules' && renderModulesTab()}
            {activeTab === 'status' && renderStatusTab()}
          </div>

          {/* Footer */}
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
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySettingsModal;
