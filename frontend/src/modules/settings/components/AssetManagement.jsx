import React, { useState, useEffect } from 'react'
import { Package, Plus, Search, Edit, Trash2, Filter } from 'lucide-react'
import { adminService } from '@/services/adminService'
import { formatCurrency } from '@/utils/formatters'
import { hrService } from '../../../services/hrService';

const AssetManagement = () => {
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState(null)

  useEffect(() => {
    fetchAssets()
  }, [])

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAssets()
      setAssets(response?.data?.data.assets || [])
    } catch (error) {
      console.error('Error fetching assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAsset = async (assetData) => {
    try {
      await adminService.createAsset(assetData)
      setShowCreateModal(false)
      fetchAssets()
    } catch (error) {
      console.error('Error creating asset:', error)
    }
  }

  const handleEditAsset = (asset) => {
    setSelectedAsset(asset)
    setShowCreateModal(true)
  }

  const handleDeleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await adminService.deleteAsset(assetId)
        fetchAssets()
      } catch (error) {
        console.error('Error deleting asset:', error)
      }
    }
  }

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.asset_tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Asset Management</h1>
          <p className="text-gray-600">Manage company assets and equipment</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Assets Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Asset
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No assets found
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-md flex items-center justify-center">
                          <Package className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                          <div className="text-sm text-gray-500">{asset.asset_tag}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{asset.category}</div>
                      {asset.subcategory && (
                        <div className="text-sm text-gray-500">{asset.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        asset.status === 'active' ? 'bg-green-100 text-green-800' :
                        asset.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                        asset.status === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asset.purchase_cost ? formatCurrency(asset.purchase_cost) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asset.AssignedTo?.User ? 
                        `${asset.AssignedTo.User.first_name} ${asset.AssignedTo.User.last_name}` : 
                        'Unassigned'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditAsset(asset)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAsset(asset.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Asset Modal */}
      {showCreateModal && (
        <CreateAssetModal
          asset={selectedAsset}
          onClose={() => {
            setShowCreateModal(false)
            setSelectedAsset(null)
          }}
          onSubmit={handleCreateAsset}
        />
      )}
    </div>
  )
}

const CreateAssetModal = ({ asset, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    asset_tag: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    serial_number: '',
    description: '',
    purchase_date: '',
    purchase_cost: '',
    current_value: '',
    currency: 'USD',
    depreciation_method: 'straight_line',
    useful_life_years: '',
    salvage_value: '',
    status: 'active',
    condition: 'good',
    location: '',
    department_id: '',
    assigned_to: '',
    supplier_name: '',
    warranty_start: '',
    warranty_end: '',
    insurance_policy: '',
    insurance_value: '',
    notes: '',
    ...asset
  })
  
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [categories, setCategories] = useState([])
  const [statuses, setStatuses] = useState([])
  const [depreciationMethods, setDepreciationMethods] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  
  useEffect(() => {
    fetchDropdownData()
  }, [])

  const fetchDropdownData = async () => {
    try {
      console.log('🔄 Fetching dropdown data for asset form...');
      
      const [employeesRes, departmentsRes, categoriesRes, statusesRes, methodsRes] = await Promise.all([
        hrService.getEmployees(),
        hrService.getDepartments(),
        adminService.getAssetCategories(),
        adminService.getAssetStatuses(),
        adminService.getDepreciationMethods()
      ])
      
      console.log('📊 Employees response:', employeesRes?.data);
      console.log('📊 Departments response:', departmentsRes?.data);
      
      // Fix the data extraction based on actual API response structure
      const employees = employeesRes?.data?.data?.employees || employeesRes?.data?.employees || [];
      const departments = departmentsRes?.data?.data?.departments || departmentsRes?.data?.departments || [];
      const categories = categoriesRes?.data?.data?.categories || [];
      const statuses = statusesRes?.data?.data?.statuses || [];
      const methods = methodsRes?.data?.data?.methods || [];
      
      console.log('✅ Extracted data:', {
        employees: employees.length,
        departments: departments.length,
        categories: categories.length,
        statuses: statuses.length,
        methods: methods.length
      });
      
      setEmployees(employees);
      setDepartments(departments);
      setCategories(categories);
      setStatuses(statuses);
      setDepreciationMethods(methods);
    } catch (error) {
      console.error('❌ Error fetching dropdown data:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Asset name is required'
    }
    
    if (!formData.asset_tag?.trim()) {
      newErrors.asset_tag = 'Asset tag is required'
    }
    
    if (!formData.category?.trim()) {
      newErrors.category = 'Category is required'
    }
    
    if (formData.current_value && parseFloat(formData.current_value) < 0) {
      newErrors.current_value = 'Current value must be a positive number'
    }
    
    if (formData.useful_life_years && (parseInt(formData.useful_life_years) < 1 || !Number.isInteger(parseFloat(formData.useful_life_years)))) {
      newErrors.useful_life_years = 'Useful life must be a positive integer'
    }
    
    if (formData.assigned_to && !employees.find(emp => emp.id === parseInt(formData.assigned_to))) {
      newErrors.assigned_to = 'Assigned to must be an employee ID'
    }
    
    if (formData.department_id && !departments.find(dept => dept.id === parseInt(formData.department_id))) {
      newErrors.department_id = 'Department ID must be an integer'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    try {
      // Clean up form data - convert empty strings to null for optional fields
      const cleanedData = { ...formData }
      
      // Convert empty strings to null for optional numeric fields
      if (!cleanedData.current_value) cleanedData.current_value = null
      if (!cleanedData.useful_life_years) cleanedData.useful_life_years = null
      if (!cleanedData.salvage_value) cleanedData.salvage_value = null
      if (!cleanedData.insurance_value) cleanedData.insurance_value = null
      if (!cleanedData.assigned_to) cleanedData.assigned_to = null
      if (!cleanedData.department_id) cleanedData.department_id = null
      
      await onSubmit(cleanedData)
    } catch (error) {
      console.error('Error submitting form:', error)
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {asset ? 'Edit Asset' : 'Create New Asset'}
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <form id="asset-form" onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text"
                required
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Asset Tag *</label>
              <input
                type="text"
                required
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.asset_tag ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.asset_tag}
                onChange={(e) => setFormData({...formData, asset_tag: e.target.value})}
              />
              {errors.asset_tag && <p className="mt-1 text-sm text-red-600">{errors.asset_tag}</p>}
            </div>
          </div>
          
          {/* Category and Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category *</label>
              <select
                required
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subcategory</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.subcategory}
                onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
              />
            </div>
          </div>
          
          {/* Brand and Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Brand</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
          </div>
          
          {/* Serial Number and Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Serial Number</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.serial_number}
                onChange={(e) => setFormData({...formData, serial_number: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>
          </div>
          
          {/* Status and Condition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Condition</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.condition}
                onChange={(e) => setFormData({...formData, condition: e.target.value})}
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="damaged">Damaged</option>
              </select>
            </div>
          </div>
          
          {/* Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned To</label>
              <select
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.assigned_to ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.assigned_to}
                onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
              >
                <option value="">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.User ? `${emp.User.first_name} ${emp.User.last_name}` : `Employee ${emp.id}`} - {emp.employee_id}
                  </option>
                ))}
              </select>
              {errors.assigned_to && <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.department_id ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.department_id}
                onChange={(e) => setFormData({...formData, department_id: e.target.value})}
              >
                <option value="">No Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {errors.department_id && <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>}
            </div>
          </div>
          
          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Cost</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.purchase_cost}
                onChange={(e) => setFormData({...formData, purchase_cost: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Value</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.current_value ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.current_value}
                onChange={(e) => setFormData({...formData, current_value: e.target.value})}
              />
              {errors.current_value && <p className="mt-1 text-sm text-red-600">{errors.current_value}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Currency</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>
          
          {/* Depreciation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Depreciation Method</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.depreciation_method}
                onChange={(e) => setFormData({...formData, depreciation_method: e.target.value})}
              >
                {depreciationMethods.map(method => (
                  <option key={method.value} value={method.value}>{method.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Useful Life (Years)</label>
              <input
                type="number"
                min="1"
                className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                  errors.useful_life_years ? 'border-red-300' : 'border-gray-300'
                }`}
                value={formData.useful_life_years}
                onChange={(e) => setFormData({...formData, useful_life_years: e.target.value})}
              />
              {errors.useful_life_years && <p className="mt-1 text-sm text-red-600">{errors.useful_life_years}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Salvage Value</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.salvage_value}
                onChange={(e) => setFormData({...formData, salvage_value: e.target.value})}
              />
            </div>
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.purchase_date}
                onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Warranty Start</label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.warranty_start}
                onChange={(e) => setFormData({...formData, warranty_start: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Warranty End</label>
              <input
                type="date"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.warranty_end}
                onChange={(e) => setFormData({...formData, warranty_end: e.target.value})}
              />
            </div>
          </div>
          
          {/* Supplier and Insurance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.supplier_name}
                onChange={(e) => setFormData({...formData, supplier_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance Policy</label>
              <input
                type="text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={formData.insurance_policy}
                onChange={(e) => setFormData({...formData, insurance_policy: e.target.value})}
              />
            </div>
          </div>
          
          {/* Insurance Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Insurance Value</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={formData.insurance_value}
              onChange={(e) => setFormData({...formData, insurance_value: e.target.value})}
            />
          </div>
          
          {/* Description and Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="asset-form"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {asset ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetManagement