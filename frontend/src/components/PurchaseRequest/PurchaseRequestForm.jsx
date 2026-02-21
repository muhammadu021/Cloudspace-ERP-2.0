import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import purchaseRequestService from '../../services/purchaseRequestService';
import employeeService from '../../services/employeeService';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const PurchaseRequestForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    requester_name: '',
    requester_email: user?.email || '',
    department: '',
    item_service_requested: '',
    amount: '',
    vendor_name: '',
    vendor_bank_details: '',
    priority: 'medium',
    notes: '',
    selected_manager: ''
  });
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [hrDepartments, setHrDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [selectedManagers, setSelectedManagers] = useState([]);
  // Load HR departments on component mount
  useEffect(() => {
    loadHRDepartments();
    loadManager();
  }, []);

  // Update requester email when user data loads
  useEffect(() => {
    if (user?.email && !formData.requester_email) {
      setFormData(prev => ({
        ...prev,
        requester_email: user.email
      }));
    }
  }, [user]);

  const loadHRDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const response = await employeeService.getDepartments();
      const departments = response.data.data?.departments || response.data.departments || [];
      
      // Transform departments for the form
      const transformedDepartments = departments.map(dept => ({
        value: dept.code || dept.name.toLowerCase().replace(/\s+/g, '_'),
        label: dept.name,
        id: dept.id
      }));
      
      setHrDepartments(transformedDepartments);
      console.log('Loaded HR departments:', transformedDepartments);
    } catch (error) {
      console.error('Load HR departments error:', error);
      // Fallback to default departments
      const fallbackDepartments = [
        { value: 'operations_1', label: 'Operations 1', id: 1 },
        { value: 'operations_2', label: 'Operations 2', id: 2 },
        { value: 'admin', label: 'Admin', id: 3 },
        { value: 'farm_manager', label: 'Farm Manager', id: 4 }
      ];
      setHrDepartments(fallbackDepartments);
      toast.error('Failed to load departments. Using default departments.');
    } finally {
      setLoadingDepartments(false);
    }
  };

const loadManager = async () => {
    try {
      const managersResponse = await purchaseRequestService.getManagers();
      const dbManagers = managersResponse.data.data?.managers || [];
      
      // Transform managers to have the correct structure for the select field
      const transformedManagers = dbManagers.map(manager => ({
        id: manager.id,
        value: manager.id.toString(), // Use ID as value
        label: `${manager.name} - ${manager.department_name || manager.department}`,
        name: manager.name,
        position: manager.position || manager.department_name || manager.department,
        department: manager.department_name || manager.department
      }));
      
      console.log('Loaded and transformed managers:', transformedManagers);
      setSelectedManagers(transformedManagers);
    } catch (error) {
      console.error('Load managers error:', error);
      toast.error('Failed to load managers.');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const managers = selectedManagers;

  // Handle department change - clear manager selection to force user choice
  const handleDepartmentChange = (department) => {
    setFormData(prev => ({
      ...prev,
      department: department,
      selected_manager: '' // Clear manager selection to force user to choose
    }));
    
    // Clear manager error when department changes
    if (errors.selected_manager) {
      setErrors(prev => ({
        ...prev,
        selected_manager: ''
      }));
    }
  };

  // Get threshold from settings (default 1,000,000)
  const getThreshold = () => {
    const savedSettings = localStorage.getItem('purchaseRequestSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      return settings.procurement_threshold || 1000000;
    }
    return 1000000;
  };

  const threshold = getThreshold();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for department change
    if (name === 'department') {
      handleDepartmentChange(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png', 'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF, DOC, DOCX, JPG, PNG, XLS, XLSX files are allowed');
        return;
      }
      
      setSupportingDocument(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.requester_name.trim()) {
      newErrors.requester_name = 'Requester name is required';
    }
    
    if (!formData.requester_email.trim()) {
      newErrors.requester_email = 'Requester email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requester_email)) {
      newErrors.requester_email = 'Please enter a valid email address';
    }
    
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }
    
    if (!formData.item_service_requested.trim()) {
      newErrors.item_service_requested = 'Item/Service description is required';
    } else if (formData.item_service_requested.length < 10) {
      newErrors.item_service_requested = 'Description must be at least 10 characters';
    }
    
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    
    if (!formData.vendor_name.trim()) {
      newErrors.vendor_name = 'Vendor name is required';
    }
    
    if (!formData.vendor_bank_details.trim()) {
      newErrors.vendor_bank_details = 'Vendor bank details are required';
    } else if (formData.vendor_bank_details.length < 20) {
      newErrors.vendor_bank_details = 'Bank details must include bank name, account number, account name, and sort code';
    }
    
    if (!formData.selected_manager) {
      newErrors.selected_manager = 'Please select a manager to approve this request';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);
    
    try {
      const submitData = new FormData();
      
      // Append form data with field name mapping
      Object.keys(formData).forEach(key => {
        // Map selected_manager to approving_manager_id for backend compatibility
        if (key === 'selected_manager') {
          submitData.append('approving_manager_id', formData[key]);
          console.log('Mapped selected_manager to approving_manager_id:', formData[key]);
        } else {
          submitData.append(key, formData[key]);
        }
      });
      
      // Log what we're sending
      console.log('Submitting purchase request with data:');
      for (let [key, value] of submitData.entries()) {
        if (key !== 'vendor_bank_details') {
          console.log(`  ${key}:`, value);
        }
      }
      
      // Append file if selected
      if (supportingDocument) {
        submitData.append('supporting_document', supportingDocument);
      }
      
      const response = await purchaseRequestService.createRequest(submitData);
      
      toast.success('Purchase request created successfully!');
      navigate(`/purchase-requests/${response.data.data.request_id}`);
      
    } catch (error) {
      console.error('Create purchase request error:', error);
      toast.error(error.response?.data?.message || 'Failed to create purchase request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create Purchase Request</h2>
          <p className="text-gray-600 mt-1">Submit a new purchase request for approval</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Requester Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requester Name *
              </label>
              <input
                type="text"
                name="requester_name"
                value={formData.requester_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.requester_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {errors.requester_name && (
                <p className="text-red-500 text-sm mt-1">{errors.requester_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requester Email *
              </label>
              <input
                type="email"
                name="requester_email"
                value={formData.requester_email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.requester_email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
              {errors.requester_email && (
                <p className="text-red-500 text-sm mt-1">{errors.requester_email}</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              disabled={loadingDepartments}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.department ? 'border-red-500' : 'border-gray-300'
              } ${loadingDepartments ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="">
                {loadingDepartments ? 'Loading departments...' : 'Select Department'}
              </option>
              {hrDepartments.map((dept) => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            {errors.department && (
              <p className="text-red-500 text-sm mt-1">{errors.department}</p>
            )}
            {loadingDepartments && (
              <p className="text-primary text-sm mt-1">Loading departments from HR system...</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              Select your department from the HR system
            </p>
            </div>
          </div>
          
          {/* Request Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item/Service Requested *
            </label>
            <textarea
              name="item_service_requested"
              value={formData.item_service_requested}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.item_service_requested ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the item or service you are requesting in detail..."
            />
            {errors.item_service_requested && (
              <p className="text-red-500 text-sm mt-1">{errors.item_service_requested}</p>
            )}
            <p className="text-gray-500 text-sm mt-1">
              {formData.item_service_requested.length}/2000 characters
            </p>
          </div>
          
          {/* Manager Selection - Required user selection */}
          {formData.department && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Approving Manager *
              </label>
              {(() => {
               
                
                return (
                  <div>
                    <select
                      name="selected_manager"
                      value={formData.selected_manager}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors.selected_manager ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Choose a manager to approve this request</option>
                      {managers.map(manager => (
                        <option key={manager.value} value={manager.value}>
                          {manager.name} {manager.position ? `(${manager.position})` : ''}
                        </option>
                      ))}
                    </select>
                    
                    {/* Show selected manager details */}
                    {formData.selected_manager && (() => {
                      const selectedManager = managers.find(m => m.value === formData.selected_manager);
                      return selectedManager ? (
                        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <span className="text-green-600">✓</span>
                            </div>
                            <div className="ml-2">
                              <p className="text-sm font-medium text-green-900">
                                Selected: {selectedManager.label}
                              </p>
                              <p className="text-xs text-green-700">
                                {selectedManager.position} • {selectedManager.value}
                              </p>
                              <p className="text-xs text-green-600 mt-1">
                                This manager will receive the approval request
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                    
                    <p className="text-gray-500 text-sm mt-1">
                      You must select a manager who will approve this purchase request
                    </p>
                  </div>
                );
              })()}
              {errors.selected_manager && (
                <p className="text-red-500 text-sm mt-1">{errors.selected_manager}</p>
              )}
            </div>
          )}
          
          {/* Amount and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (NGN) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">₦</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  min="1"
                  step="0.01"
                  className={`w-full pl-8 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.amount && (
                <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
              )}
              {formData.amount && parseFloat(formData.amount) >= threshold && (
                <p className="text-primary text-sm mt-1">
                  ⚠️ Amounts ≥ ₦{threshold.toLocaleString()} require procurement review
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Vendor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name *
              </label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.vendor_name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter vendor/supplier name"
              />
              {errors.vendor_name && (
                <p className="text-red-500 text-sm mt-1">{errors.vendor_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Document
              </label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-gray-500 text-sm mt-1">
                Optional. Max 10MB. Allowed: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX
              </p>
              {supportingDocument && (
                <p className="text-green-600 text-sm mt-1">
                  ✓ {supportingDocument.name} selected
                </p>
              )}
            </div>
          </div>
          
          {/* Vendor Bank Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor Bank Details *
            </label>
            <textarea
              name="vendor_bank_details"
              value={formData.vendor_bank_details}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.vendor_bank_details ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Bank Name, Account Number, Account Name, Sort Code"
            />
            {errors.vendor_bank_details && (
              <p className="text-red-500 text-sm mt-1">{errors.vendor_bank_details}</p>
            )}
          </div>
          
          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Any additional information or special instructions..."
            />
          </div>
          
          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/purchase-requests')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseRequestForm;