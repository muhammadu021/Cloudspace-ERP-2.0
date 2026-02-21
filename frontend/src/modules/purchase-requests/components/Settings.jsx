import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Users, 
  CreditCard, 
  Bell, 
  Shield,
  Save,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Building,
  Mail,
  Phone
} from 'lucide-react';
import purchaseRequestService from '@/services/purchaseRequestService';

const Settings = () => {
  const [settings, setSettings] = useState({});
  const [managers, setManagers] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Manager form state
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [managerForm, setManagerForm] = useState({
    employee_id: '',
    name: '',
    email: '',
    department: '',
    department_name: '',
    phone: '',
    position: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [settingsRes, managersRes, employeesRes, departmentsRes] = await Promise.all([
        purchaseRequestService.getSettings(),
        purchaseRequestService.getManagers(),
        purchaseRequestService.getAvailableEmployees(),
        purchaseRequestService.getAvailableDepartments()
      ]);

      if (settingsRes.data.success) setSettings(settingsRes.data.data?.settings || {});
      if (managersRes.data.success) setManagers(managersRes.data.data?.managers || []);
      if (employeesRes.data.success) setAvailableEmployees(employeesRes.data.data?.employees || []);
      if (departmentsRes.data.success) setAvailableDepartments(departmentsRes.data.data?.departments || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const response = await purchaseRequestService.updateSettings(settings);
      
      if (response.data.success) {
        setSuccess('Settings saved successfully!');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save settings');
      }
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleManagerFormChange = (key, value) => {
    setManagerForm(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Auto-fill employee details when employee is selected
    if (key === 'employee_id' && value) {
      const employee = availableEmployees.find(emp => emp.id.toString() === value);
      if (employee) {
        setManagerForm(prev => ({
          ...prev,
          name: `${employee.User.first_name} ${employee.User.last_name}`,
          email: employee.User.email,
          phone: employee.User.phone || '',
          position: employee.position || ''
        }));
      }
    }
    
    // Auto-fill department name when department is selected
    if (key === 'department' && value) {
      const department = availableDepartments.find(dept => dept.code === value);
      if (department) {
        setManagerForm(prev => ({
          ...prev,
          department_name: department.name
        }));
      }
    }
  };

  const saveManager = async () => {
    try {
      setError(null);
      
      const response = editingManager 
        ? await purchaseRequestService.updateManager(editingManager.id, managerForm)
        : await purchaseRequestService.addManager(managerForm);
      
      if (response.data.success) {
        setSuccess(editingManager ? 'Manager updated successfully!' : 'Manager added successfully!');
        setTimeout(() => setSuccess(null), 3000);
        
        // Reset form and refresh data
        setShowManagerForm(false);
        setEditingManager(null);
        setManagerForm({
          employee_id: '',
          name: '',
          email: '',
          department: '',
          department_name: '',
          phone: '',
          position: ''
        });
        
        fetchData();
      } else {
        throw new Error(response.data.message || 'Failed to save manager');
      }
      
    } catch (error) {
      console.error('Error saving manager:', error);
      setError(error.response?.data?.message || error.message || 'Failed to save manager');
    }
  };

  const deleteManager = async (managerId) => {
    if (!window.confirm('Are you sure you want to remove this manager?')) {
      return;
    }
    
    try {
      setError(null);
      
      const response = await purchaseRequestService.removeManager(managerId);
      
      if (response.data.success) {
        setSuccess('Manager removed successfully!');
        setTimeout(() => setSuccess(null), 3000);
        
        fetchData();
      } else {
        throw new Error(response.data.message || 'Failed to delete manager');
      }
      
    } catch (error) {
      console.error('Error deleting manager:', error);
      setError(error.response?.data?.message || error.message || 'Failed to delete manager');
    }
  };

  const editManager = (manager) => {
    setEditingManager(manager);
    setManagerForm({
      employee_id: manager.employee_id.toString(),
      name: manager.name,
      email: manager.email,
      department: manager.department,
      department_name: manager.department_name,
      phone: manager.phone || '',
      position: manager.position || ''
    });
    setShowManagerForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase Request Settings</h1>
          <p className="text-gray-600 mt-1">Configure system settings and manage approval workflows</p>
        </div>
        <SettingsIcon className="h-6 w-6 text-gray-400" />
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-6">
          <SettingsIcon className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Approval Limit (₦)
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={settings.auto_approval_limit || ''}
                onChange={(e) => handleSettingsChange('auto_approval_limit', parseFloat(e.target.value))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                placeholder="50000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Requests below this amount may be auto-approved</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Procurement Threshold (₦)
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                value={settings.procurement_threshold || ''}
                onChange={(e) => handleSettingsChange('procurement_threshold', parseFloat(e.target.value))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                placeholder="1000000"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Requests above this amount require procurement review</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-xs text-gray-500">Send email notifications for workflow updates</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_email_notifications || false}
                onChange={(e) => handleSettingsChange('enable_email_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">SMS Notifications</label>
              <p className="text-xs text-gray-500">Send SMS notifications for urgent requests</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enable_sms_notifications || false}
                onChange={(e) => handleSettingsChange('enable_sms_notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Require Manager Selection</label>
            <p className="text-xs text-gray-500">Require users to select a manager for approval</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.require_manager_selection || false}
              onChange={(e) => handleSettingsChange('require_manager_selection', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Department Managers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Department Managers</h3>
          </div>
          <button
            onClick={() => {
              setShowManagerForm(true);
              setEditingManager(null);
              setManagerForm({
                employee_id: '',
                name: '',
                email: '',
                department: '',
                department_name: '',
                phone: '',
                position: ''
              });
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Manager
          </button>
        </div>
        
        {/* Managers List */}
        <div className="space-y-4">
          {managers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No managers assigned</h3>
              <p className="text-gray-500">Add department managers to handle purchase request approvals</p>
            </div>
          ) : (
            managers.map((manager) => (
              <div key={manager.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{manager.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {manager.department_name || manager.department}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {manager.email}
                      </div>
                      {manager.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {manager.phone}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => editManager(manager)}
                    className="p-2 text-primary hover:text-blue-900 hover:bg-primary-50 rounded"
                    title="Edit Manager"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteManager(manager.id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                    title="Remove Manager"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Manager Form Modal */}
      {showManagerForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingManager ? 'Edit Manager' : 'Add New Manager'}
                </h3>
                <button
                  onClick={() => setShowManagerForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee *
                    </label>
                    <select
                      value={managerForm.employee_id}
                      onChange={(e) => handleManagerFormChange('employee_id', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      disabled={editingManager} // Can't change employee when editing
                    >
                      <option value="">Select Employee</option>
                      {availableEmployees.map(employee => (
                        <option key={employee.id} value={employee.id}>
                          {employee.User.first_name} {employee.User.last_name} - {employee.position}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      value={managerForm.department}
                      onChange={(e) => handleManagerFormChange('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {availableDepartments.map(dept => (
                        <option key={dept.code} value={dept.code}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={managerForm.name}
                      onChange={(e) => handleManagerFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="Full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={managerForm.email}
                      onChange={(e) => handleManagerFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="email@company.com"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={managerForm.phone}
                      onChange={(e) => handleManagerFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      value={managerForm.position}
                      onChange={(e) => handleManagerFormChange('position', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                      placeholder="Job title"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowManagerForm(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveManager}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingManager ? 'Update Manager' : 'Add Manager'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;