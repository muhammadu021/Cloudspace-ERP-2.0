import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import employeeService from '../../services/employeeService';
import purchaseRequestService from '../../services/purchaseRequestService';

const PurchaseRequestSettings = () => {
  const [settings, setSettings] = useState({
    procurement_threshold: 1000000, // Default 1 million NGN
    auto_approval_limit: 50000,     // Auto-approve below this amount
    require_manager_selection: true,
    default_currency: 'NGN',
    notification_enabled: true,
    email_notifications: true,
    md_signature_url: ''  // MD signature image URL
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Managers and employees
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showAddManager, setShowAddManager] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  useEffect(() => {
    loadSettings();
    loadEmployees();
    loadDepartments();
  }, []);

  useEffect(() => {
    // Load signature preview if URL exists
    if (settings.md_signature_url) {
      setSignaturePreview(settings.md_signature_url);
    }
  }, [settings.md_signature_url]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load settings from database
      try {
        const settingsResponse = await purchaseRequestService.getSettings();
        const dbSettings = settingsResponse.data.data?.settings || {};
        setSettings(prev => ({ ...prev, ...dbSettings }));
        console.log('Loaded settings from database:', dbSettings);
      } catch (settingsError) {
        console.warn('Failed to load settings from database, using defaults:', settingsError);
        // Fallback to localStorage if database fails
        const savedSettings = localStorage.getItem('purchaseRequestSettings');
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      }
      
      // Load managers from database
      try {
        const managersResponse = await purchaseRequestService.getManagers();
        const dbManagers = managersResponse.data.data?.managers || [];
        setSelectedManagers(dbManagers);
        console.log('Loaded managers from database:', dbManagers);
      } catch (managersError) {
        console.warn('Failed to load managers from database, using localStorage:', managersError);
       
      }
    } catch (error) {
      console.error('Load settings error:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
   
      const response = await employeeService.getEmployees({ limit: 1000 });
 
      
      const employees = response.data.data?.employees || response.data.employees || [];
      console.log('Extracted employees array:', employees);
      
      if (employees.length === 0) {
        console.warn('No employees found in response');
        toast.error('No employees found in the system');
        return;
      }
      
      // Transform employee data to include flattened user information
      const transformedEmployees = employees.map(employee => {
        console.log('Processing employee:', employee);
        return {
          id: employee.id,
          employee_id: employee.employee_id,
          first_name: employee.User?.first_name || '',
          last_name: employee.User?.last_name || '',
          email: employee.User?.email || '',
          phone: employee.User?.phone || '',
          position: employee.position || '',
          department_id: employee.department_id,
          department_name: employee.Department?.name || '',
          employment_status: employee.employment_status,
          User: employee.User // Keep original User object for reference
        };
      });
      
      console.log('Loaded employees count:', transformedEmployees.length);
      console.log('Sample transformed employees:', transformedEmployees.slice(0, 3));
      setAvailableEmployees(transformedEmployees);
    } catch (error) {
      console.error('Load employees error:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error(`Failed to load employees: ${error.response?.data?.message || error.message}`);
    }
  };

  const loadDepartments = async () => {
    try {
      console.log('Loading departments...');
      const response = await employeeService.getDepartments();
      console.log('Departments response:', response);
      const departments = response.data.data?.departments || response.data.departments || [];
      setDepartments(departments);
    } catch (error) {
      console.error('Load departments error:', error);
      console.error('Department error details:', error.response?.data || error.message);
      // Fallback to default departments
      const fallbackDepartments = [
        { id: 1, name: 'Operations 1', code: 'operations_1' },
        { id: 2, name: 'Operations 2', code: 'operations_2' },
        { id: 3, name: 'Admin', code: 'admin' },
        { id: 4, name: 'Farm Manager', code: 'farm_manager' }
      ];
      console.log('Using fallback departments:', fallbackDepartments);
      setDepartments(fallbackDepartments);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      // Validate settings
      if (settings.procurement_threshold <= 0) {
        toast.error('Procurement threshold must be a positive number');
        return;
      }
      
      if (settings.auto_approval_limit < 0) {
        toast.error('Auto-approval limit must be a positive number');
        return;
      }

      // Save settings to database
      try {
        await purchaseRequestService.updateSettings(settings);
        console.log('Settings saved to database successfully');
      } catch (dbError) {
        console.warn('Failed to save settings to database, saving to localStorage:', dbError);
        // Fallback to localStorage if database fails
        localStorage.setItem('purchaseRequestSettings', JSON.stringify(settings));
      }
      
      // Note: Managers are saved individually when added/updated, not in bulk
      // Keep localStorage as backup
      localStorage.setItem('purchaseRequestSettings', JSON.stringify(settings));
      localStorage.setItem('purchaseRequestManagers', JSON.stringify(selectedManagers));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Save settings error:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const addManager = async () => {
    if (!selectedEmployee || !selectedDepartment) {
      toast.error('Please select both employee and department');
      return;
    }

    const employee = availableEmployees.find(emp => emp.id.toString() === selectedEmployee);
    if (!employee) {
      toast.error('Selected employee not found');
      return;
    }

    // Check if manager already exists
    const existingManager = selectedManagers.find(manager => 
      manager.employee_id === employee.id && manager.department === selectedDepartment
    );

    if (existingManager) {
      toast.error('This employee is already assigned as a manager for this department');
      return;
    }

    const managerData = {
      employee_id: employee.id,
      name: `${employee.first_name} ${employee.last_name}`.trim(),
      email: employee.email,
      department: selectedDepartment,
      department_name: departments.find(dept => dept.code === selectedDepartment)?.name || selectedDepartment,
      phone: employee.phone || '',
      position: employee.position || ''
    };

    try {
      // Save to database
      const response = await purchaseRequestService.addManager(managerData);
      const savedManager = response.data.data?.manager;
      
      if (savedManager) {
        setSelectedManagers(prev => [...prev, savedManager]);
      } else {
        // Fallback to local data if response doesn't contain manager
        const localManager = {
          id: Date.now(),
          ...managerData,
          is_active: true,
          created_at: new Date().toISOString()
        };
        setSelectedManagers(prev => [...prev, localManager]);
      }
      
      setSelectedEmployee('');
      setSelectedDepartment('');
      setShowAddManager(false);
      toast.success('Manager added successfully');
      
      console.log('Manager saved to database:', savedManager || managerData);
    } catch (error) {
      console.error('Failed to save manager to database:', error);
      
      // Fallback to local storage
      const localManager = {
        id: Date.now(),
        ...managerData,
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      setSelectedManagers(prev => [...prev, localManager]);
      setSelectedEmployee('');
      setSelectedDepartment('');
      setShowAddManager(false);
      
      toast.error('Failed to save to database, saved locally. Please check your connection.');
    }
  };

  const removeManager = async (managerId) => {
    try {
      // Try to remove from database first
      await purchaseRequestService.removeManager(managerId);
      
      // Remove from local state
      setSelectedManagers(prev => prev.filter(manager => manager.id !== managerId));
      toast.success('Manager removed successfully');
      
      console.log('Manager removed from database:', managerId);
    } catch (error) {
      console.error('Failed to remove manager from database:', error);
      
      // Still remove from local state as fallback
      setSelectedManagers(prev => prev.filter(manager => manager.id !== managerId));
      toast.error('Failed to remove from database, removed locally. Please check your connection.');
    }
  };

  const toggleManagerStatus = async (managerId) => {
    const manager = selectedManagers.find(m => m.id === managerId);
    if (!manager) return;
    
    const newStatus = !manager.is_active;
    
    try {
      // Update in database
      await purchaseRequestService.updateManager(managerId, { is_active: newStatus });
      
      // Update local state
      setSelectedManagers(prev => prev.map(manager => 
        manager.id === managerId 
          ? { ...manager, is_active: newStatus }
          : manager
      ));
      
      toast.success(`Manager ${newStatus ? 'activated' : 'deactivated'} successfully`);
      console.log('Manager status updated in database:', managerId, newStatus);
    } catch (error) {
      console.error('Failed to update manager status in database:', error);
      
      // Still update local state as fallback
      setSelectedManagers(prev => prev.map(manager => 
        manager.id === managerId 
          ? { ...manager, is_active: newStatus }
          : manager
      ));
      
      toast.error('Failed to update in database, updated locally. Please check your connection.');
    }
  };

  const filteredEmployees = availableEmployees.filter(employee => {
    if (!employeeSearchTerm) return true; // Show all if no search term
    
    const searchLower = employeeSearchTerm.toLowerCase();
    const fullName = `${employee.first_name || ''} ${employee.last_name || ''}`.toLowerCase().trim();
    const email = (employee.email || '').toLowerCase();
    const employeeId = (employee.employee_id || '').toLowerCase();
    
    return fullName.includes(searchLower) || 
           email.includes(searchLower) ||
           employeeId.includes(searchLower);
  });

  const getDepartmentName = (departmentCode) => {
    const dept = departments.find(d => d.code === departmentCode);
    return dept ? dept.name : departmentCode.replace('_', ' ').toUpperCase();
  };

  const handleSignatureFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    setSignatureFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setSignaturePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadSignature = async () => {
    if (!signatureFile) {
      toast.error('Please select a signature image');
      return;
    }

    try {
      setUploadingSignature(true);

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', signatureFile);
      formData.append('upload_preset', 'ml_default'); // You may need to create this preset in Cloudinary
      formData.append('folder', 'signatures');

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(
        'https://api.cloudinary.com/v1_1/dxsc0fqrt/image/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error('Failed to upload to Cloudinary');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      const signatureUrl = cloudinaryData.secure_url;

      console.log('Signature uploaded to Cloudinary:', signatureUrl);

      // Update settings with Cloudinary URL
      const updatedSettings = {
        ...settings,
        md_signature_url: signatureUrl,
        md_signature_cloudinary_id: cloudinaryData.public_id
      };
      
      setSettings(updatedSettings);
      
      // Save to localStorage
      localStorage.setItem('purchaseRequestSettings', JSON.stringify(updatedSettings));
      
      // Save to database
      try {
        await purchaseRequestService.updateSettings(updatedSettings);
        toast.success('MD signature uploaded successfully');
      } catch (dbError) {
        console.warn('Failed to save signature to database:', dbError);
        toast.success('MD signature uploaded to cloud, saved locally');
      }
      
      setSignatureFile(null);
    } catch (error) {
      console.error('Upload signature error:', error);
      toast.error('Failed to upload signature: ' + error.message);
    } finally {
      setUploadingSignature(false);
    }
  };

  const removeSignature = async () => {
    try {
      const updatedSettings = {
        ...settings,
        md_signature_url: ''
      };
      
      setSettings(updatedSettings);
      setSignaturePreview(null);
      setSignatureFile(null);
      
      // Save to localStorage
      localStorage.setItem('purchaseRequestSettings', JSON.stringify(updatedSettings));
      
      // Try to save to database
      try {
        await purchaseRequestService.updateSettings(updatedSettings);
        toast.success('MD signature removed successfully');
      } catch (dbError) {
        console.warn('Failed to remove signature from database:', dbError);
        toast.success('MD signature removed locally');
      }
    } catch (error) {
      console.error('Remove signature error:', error);
      toast.error('Failed to remove signature');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Purchase Request Settings</h2>
          <p className="text-gray-600 mt-1">Configure workflow thresholds and approval settings</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Threshold Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Workflow Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Procurement Review Threshold
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₦</span>
                  <input
                    type="number"
                    value={settings.procurement_threshold}
                    onChange={(e) => handleInputChange('procurement_threshold', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1000000"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Requests above {formatCurrency(settings.procurement_threshold)} require procurement review
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-Approval Limit
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₦</span>
                  <input
                    type="number"
                    value={settings.auto_approval_limit}
                    onChange={(e) => handleInputChange('auto_approval_limit', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="50000"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Requests below {formatCurrency(settings.auto_approval_limit)} can be auto-approved
                </p>
              </div>
            </div>
          </div>

          {/* Workflow Logic Explanation */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Workflow Logic</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>• <strong>Below {formatCurrency(settings.auto_approval_limit)}:</strong> Auto-approved → Finance → Payment</p>
              <p>• <strong>Below {formatCurrency(settings.procurement_threshold)}:</strong> Manager Approval → Finance → Payment</p>
              <p>• <strong>Above {formatCurrency(settings.procurement_threshold)}:</strong> Manager Approval → Procurement → Finance → Payment</p>
            </div>
          </div>

          {/* Manager Selection Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Manager Assignment</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="require_manager_selection"
                  checked={settings.require_manager_selection}
                  onChange={(e) => handleInputChange('require_manager_selection', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="require_manager_selection" className="ml-2 block text-sm text-gray-900">
                  Require manager selection during request creation
                </label>
              </div>

              {/* Selected Managers List */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-900">Assigned Managers ({selectedManagers.length})</h4>
                  <button
                    onClick={() => setShowAddManager(true)}
                    className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-600"
                  >
                    + Add Manager
                  </button>
                </div>
                
                {selectedManagers.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">No managers assigned yet</p>
                    <p className="text-xs mt-1">Click "Add Manager" to select from employee list</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedManagers.map((manager) => (
                      <div key={manager.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">{manager.name}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              manager.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {manager.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{manager.email}</p>
                          <p className="text-xs text-primary">{getDepartmentName(manager.department)}</p>
                          {manager.position && (
                            <p className="text-xs text-gray-400">{manager.position}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleManagerStatus(manager.id)}
                            className={`px-2 py-1 text-xs rounded ${
                              manager.is_active 
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                            }`}
                          >
                            {manager.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => removeManager(manager.id)}
                            className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notification_enabled"
                  checked={settings.notification_enabled}
                  onChange={(e) => handleInputChange('notification_enabled', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="notification_enabled" className="ml-2 block text-sm text-gray-900">
                  Enable in-app notifications
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onChange={(e) => handleInputChange('email_notifications', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-900">
                  Enable email notifications
                </label>
              </div>
            </div>
          </div>

          {/* Currency Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Currency Settings</h3>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select
                value={settings.default_currency}
                onChange={(e) => handleInputChange('default_currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="NGN">Nigerian Naira (NGN)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
                <option value="GBP">British Pound (GBP)</option>
              </select>
            </div>
          </div>

          {/* MD Signature Upload */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">GMD Signature</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                Upload the Managing Director's signature to be displayed on payment letters and official documents.
              </p>
              
              {signaturePreview ? (
                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Signature:</p>
                    <div className="flex items-center justify-center bg-gray-50 p-4 rounded">
                      <img 
                        src={signaturePreview} 
                        alt="MD Signature" 
                        className="max-h-32 max-w-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <label className="flex-1 px-4 py-2 bg-primary text-white text-center rounded-md hover:bg-primary-600 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSignatureFileChange}
                        className="hidden"
                      />
                      Change Signature
                    </label>
                    <button
                      onClick={removeSignature}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Remove Signature
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {signatureFile ? (
                    <div className="space-y-4">
                      <div className="bg-white border-2 border-primary-200 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        <div className="flex items-center justify-center bg-gray-50 p-4 rounded">
                          <img 
                            src={signaturePreview} 
                            alt="Signature Preview" 
                            className="max-h-32 max-w-full object-contain"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">File: {signatureFile.name}</p>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={uploadSignature}
                          disabled={uploadingSignature}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploadingSignature ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Uploading...
                            </div>
                          ) : (
                            'Upload Signature'
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setSignatureFile(null);
                            setSignaturePreview(null);
                          }}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <div className="space-y-2">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary">
                            <span>Upload a signature</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleSignatureFileChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> The signature will be displayed on payment letters generated from the Finance module.
                  Recommended size: 200x80 pixels with transparent background.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add Manager Modal */}
      {showAddManager && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Add Manager</h3>
              <button
                onClick={() => {
                  setShowAddManager(false);
                  setSelectedEmployee('');
                  setSelectedDepartment('');
                  setEmployeeSearchTerm('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Employee Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Employee
                </label>
                <input
                  type="text"
                  value={employeeSearchTerm}
                  onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or employee ID..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                
                {/* Debug Info */}
                <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
                  <p>Total employees: {availableEmployees.length}</p>
                  <p>Filtered employees: {filteredEmployees.length}</p>
                  <p>Search term: "{employeeSearchTerm}"</p>
                </div>
                
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose an employee...</option>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => {
                      const displayName = `${employee.first_name} ${employee.last_name}`.trim() || 'No Name';
                      return (
                        <option key={employee.id} value={employee.id}>
                          {displayName} - {employee.email} ({employee.employee_id})
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>
                      {availableEmployees.length === 0 ? 'Loading employees...' : 'No employees found'}
                    </option>
                  )}
                </select>
                
                {filteredEmployees.length === 0 && employeeSearchTerm && (
                  <p className="text-sm text-gray-500 mt-1">No employees found matching your search</p>
                )}
                
                {availableEmployees.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">No employees loaded. Check console for errors.</p>
                )}
              </div>

              {/* Department Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Department *
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Choose a department...</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.code || department.name.toLowerCase().replace(' ', '_')}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Employee Preview */}
              {selectedEmployee && (
                <div className="bg-primary-50 border border-primary-200 rounded p-3">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Selected Employee Preview</h4>
                  {(() => {
                    const employee = availableEmployees.find(emp => emp.id.toString() === selectedEmployee);
                    if (!employee) return null;
                    
                    const displayName = `${employee.first_name} ${employee.last_name}`.trim() || 'No Name';
                    return (
                      <div className="text-sm text-blue-800">
                        <p><strong>Name:</strong> {displayName}</p>
                        <p><strong>Email:</strong> {employee.email}</p>
                        <p><strong>Employee ID:</strong> {employee.employee_id}</p>
                        {employee.position && <p><strong>Position:</strong> {employee.position}</p>}
                        {employee.phone && <p><strong>Phone:</strong> {employee.phone}</p>}
                        {employee.department_name && <p><strong>Current Department:</strong> {employee.department_name}</p>}
                        <p><strong>Status:</strong> {employee.employment_status}</p>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
            
            {/* Modal Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowAddManager(false);
                  setSelectedEmployee('');
                  setSelectedDepartment('');
                  setEmployeeSearchTerm('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addManager}
                disabled={!selectedEmployee || !selectedDepartment}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Manager
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestSettings;