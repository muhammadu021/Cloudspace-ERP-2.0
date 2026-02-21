import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  User, 
  Building, 
  CreditCard, 
  FileText, 
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Save,
  Send,
  LayoutGrid,
  List,
  BarChart3
} from 'lucide-react';
import purchaseRequestService from '@/services/purchaseRequestService';

const CreateRequest = () => {
  const [formData, setFormData] = useState({
    requester_name: '',
    department: '',
    item_service_requested: '',
    amount: '',
    vendor_name: '',
    vendor_bank_details: '',
    priority: 'medium',
    notes: '',
    approving_manager_id: ''
  });
  
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [managers, setManagers] = useState([]);
  const [loadingManagers, setLoadingManagers] = useState(false);

  // Fetch available managers
  const fetchManagers = async () => {
    try {
      setLoadingManagers(true);
      const response = await purchaseRequestService.getManagers();
      setManagers(response.data.data?.managers || response.data.data || []);
    } catch (error) {
      console.error('Error fetching managers:', error);
      setError('Failed to load managers. Please refresh the page.');
    } finally {
      setLoadingManagers(false);
    }
  };

  // Load user data and managers on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData) {
      setFormData(prev => ({
        ...prev,
        requester_name: userData.first_name && userData.last_name 
          ? `${userData.first_name} ${userData.last_name}` 
          : userData.username || '',
        department: userData.Employee?.Department?.name || ''
      }));
    }
    
    // Fetch managers
    fetchManagers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Only PDF, DOC, DOCX, JPG, PNG, XLS, XLSX files are allowed');
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.requester_name.trim()) {
      errors.requester_name = 'Requester name is required';
    }
    
    if (!formData.department.trim()) {
      errors.department = 'Department is required';
    }
    
    if (!formData.item_service_requested.trim()) {
      errors.item_service_requested = 'Item/Service description is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Valid amount is required';
    }
    
    if (!formData.vendor_name.trim()) {
      errors.vendor_name = 'Vendor name is required';
    }
    
    if (!formData.vendor_bank_details.trim()) {
      errors.vendor_bank_details = 'Vendor bank details are required';
    }
    
    if (!formData.approving_manager_id) {
      errors.approving_manager_id = 'Approving manager must be selected';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors below');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Debug logging
      console.log('Form data before submission:', formData);
      console.log('Approving manager ID value:', formData.approving_manager_id, 'Type:', typeof formData.approving_manager_id);
      
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        submitData.append(key, value);
        if (key === 'approving_manager_id') {
          console.log('Appending approving_manager_id:', value, 'Type:', typeof value);
        }
      });
      
      // Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of submitData.entries()) {
        console.log(`  ${key}:`, value);
      }
      
      // Append file if selected
      if (file) {
        submitData.append('supporting_document', file);
      }
      
      const response = await purchaseRequestService.createRequest(submitData);
      
      if (response.data.success) {
        setSuccess(`Purchase request created successfully! Request ID: ${response.data.data.request_id}`);
        
        // Reset form
        setFormData({
          requester_name: formData.requester_name, // Keep requester name
          department: formData.department, // Keep department
          item_service_requested: '',
          amount: '',
          vendor_name: '',
          vendor_bank_details: '',
          priority: 'medium',
          notes: '',
          approving_manager_id: ''
        });
        setFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('supporting_document');
        if (fileInput) {
          fileInput.value = '';
        }
      } else {
        throw new Error(response.data.message || 'Failed to create purchase request');
      }
      
    } catch (error) {
      console.error('Error creating purchase request:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create purchase request');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'IT', 'HR', 'Finance', 'Operations', 'Marketing', 'Admin', 'Procurement', 'Legal', 'Support'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-primary' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create & Track Requests</h1>
          <p className="text-gray-600 mt-1">Submit a new purchase request for approval</p>
        </div>
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
        </div>
      </div>

      {/* View Buttons */}
      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={() => window.location.href = '/purchase-requests/create?view=kanban'}
          className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-primary transition-all font-medium"
        >
          <LayoutGrid className="h-5 w-5" />
          <span>Kanban</span>
        </button>
        <button
          onClick={() => window.location.href = '/purchase-requests/create?view=list'}
          className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-primary transition-all font-medium"
        >
          <List className="h-5 w-5" />
          <span>List</span>
        </button>
        <button
          onClick={() => window.location.href = '/purchase-requests/dashboard'}
          className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:border-blue-500 hover:text-primary transition-all font-medium"
        >
          <BarChart3 className="h-5 w-5" />
          <span>Dashboard</span>
        </button>
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Requester Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <User className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Requester Information</h3>
          </div>
          
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.requester_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
              />
              {validationErrors.requester_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.requester_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.department ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
              {validationErrors.department && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.department}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Approving Manager *
            </label>
            <select
              name="approving_manager_id"
              value={formData.approving_manager_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                validationErrors.approving_manager_id ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loadingManagers}
            >
              <option value="">Select Approving Manager</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} - {manager.department_name || manager.department}
                </option>
              ))}
            </select>
            {loadingManagers && (
              <p className="mt-1 text-sm text-gray-500">Loading managers...</p>
            )}
            {validationErrors.approving_manager_id && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.approving_manager_id}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              You must select a manager who will approve this purchase request
            </p>
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <FileText className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Request Details</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item/Service Requested *
              </label>
              <textarea
                name="item_service_requested"
                value={formData.item_service_requested}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.item_service_requested ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe the item or service you need..."
              />
              {validationErrors.item_service_requested && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.item_service_requested}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₦) *
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                      validationErrors.amount ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {validationErrors.amount && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.amount}</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vendor Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <Building className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Vendor Information</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name *
              </label>
              <input
                type="text"
                name="vendor_name"
                value={formData.vendor_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.vendor_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter vendor/supplier name"
              />
              {validationErrors.vendor_name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.vendor_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Bank Details *
              </label>
              <textarea
                name="vendor_bank_details"
                value={formData.vendor_bank_details}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.vendor_bank_details ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Bank name, account number, account name, etc."
              />
              {validationErrors.vendor_bank_details && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.vendor_bank_details}</p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <FileText className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                placeholder="Any additional notes or requirements..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Document
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="supporting_document"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="supporting_document"
                        name="supporting_document"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, JPG, PNG, XLS, XLSX up to 10MB
                  </p>
                  {file && (
                    <div className="mt-2 text-sm text-green-600">
                      Selected: {file.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            onClick={() => {
              setFormData({
                requester_name: formData.requester_name,
                department: formData.department,
                item_service_requested: '',
                amount: '',
                vendor_name: '',
                vendor_bank_details: '',
                priority: 'medium',
                notes: '',
                approving_manager_id: ''
              });
              setFile(null);
              setValidationErrors({});
              setError(null);
              setSuccess(null);
            }}
          >
            <Save className="h-4 w-4 mr-2 inline" />
            Reset
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequest;