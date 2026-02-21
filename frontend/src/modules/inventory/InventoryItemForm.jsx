import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  ArrowLeft,
  Save,
  Package,
  MapPin,
  DollarSign,
  Upload,
  X,
  Image as ImageIcon
} from 'lucide-react'
import { inventoryService } from '@/services/inventoryService'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast'

const InventoryItemForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    unit_of_measure: 'pcs',
    current_stock: 0,
    quantity_to_add: 0,
    reorder_quantity: 0,
    unit_cost: '',
    selling_price: '',
    currency: 'NGN',
    location_id: '',
    supplier_name: '',
    supplier_contact: '',
    barcode: '',
    is_active: true,
    image_url: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [itemSuggestions, setItemSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Fetch existing items for autocomplete
  const { data: existingItemsData } = useQuery(
    'inventory-items-autocomplete',
    () => inventoryService.getItems({ limit: 1000 }),
    {
      select: (response) => response?.data?.data?.items || [],
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch item data for editing
  const { data: itemData, isLoading: itemLoading, error: itemError } = useQuery(
    ['inventory-item', id],
    () => inventoryService.getItemById(id),
    {
      enabled: isEdit && !!id,
      select: (response) => response?.data?.data?.item,
      onSuccess: (item) => {
        if (item) {
          setFormData({
            name: item.name || '',
            category: item.category || '',
            subcategory: item.subcategory || '',
            unit_of_measure: item.unit_of_measure || 'pcs',
            current_stock: parseFloat(item.current_stock) || 0,
            quantity_to_add: 0,
            reorder_quantity: parseFloat(item.reorder_quantity) || 0,
            unit_cost: parseFloat(item.unit_cost) || '',
            selling_price: parseFloat(item.selling_price) || '',
            currency: item.currency || 'NGN',
            location_id: item.location_id ? item.location_id.toString() : '',
            supplier_name: item.supplier_name || '',
            supplier_contact: item.supplier_contact || '',
            barcode: item.barcode || '',
            is_active: item.is_active !== undefined ? item.is_active : true,
            image_url: item.image_url || '',
            notes: item.notes || ''
          })
          if (item.image_url) {
            setImagePreview(item.image_url)
          }
        }
      },
      onError: (error) => {
        console.error('Load item error:', error)
        toast.error('Failed to load item data')
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch locations
  const { data: locationsData } = useQuery(
    'inventory-locations',
    () => inventoryService.getLocations(),
    {
      select: (response) => response?.data?.data?.locations || [],
      onError: (error) => {
        console.log('Locations API error:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  const locations = locationsData || []

  const categories = [
    'Electronics',
    'Furniture',
    'Stationery',
    'Equipment',
    'Supplies',
    'Tools',
    'Software',
    'Hardware',
    'Consumables',
    'Raw Materials'
  ]

  const commonSuppliers = [
    'Dell Technologies',
    'HP Inc.',
    'Lenovo',
    'Microsoft Corporation',
    'Apple Inc.',
    'Samsung Electronics',
    'Canon Inc.',
    'Epson',
    'Brother Industries',
    'Xerox Corporation',
    'Office Depot',
    'Staples',
    'Amazon Business',
    'Best Buy Business',
    'Local Supplier',
    'Other'
  ]

  const unitOptions = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kilograms' },
    { value: 'g', label: 'Grams' },
    { value: 'l', label: 'Liters' },
    { value: 'ml', label: 'Milliliters' },
    { value: 'm', label: 'Meters' },
    { value: 'cm', label: 'Centimeters' },
    { value: 'box', label: 'Boxes' },
    { value: 'pack', label: 'Packs' },
    { value: 'ream', label: 'Reams' },
    { value: 'roll', label: 'Rolls' },
    { value: 'set', label: 'Sets' }
  ]

  // Handle item name autocomplete
  const handleNameChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, name: value }))
    
    if (value.length > 1 && existingItemsData) {
      const filtered = existingItemsData.filter(item =>
        item.name.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5)
      setItemSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setShowSuggestions(false)
    }
    
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: null }))
    }
  }

  const handleSelectSuggestion = (item) => {
    setFormData(prev => ({
      ...prev,
      name: item.name,
      category: item.category || prev.category,
      subcategory: item.subcategory || prev.subcategory,
      unit_of_measure: item.unit_of_measure || prev.unit_of_measure,
      unit_cost: item.unit_cost || prev.unit_cost,
      selling_price: item.selling_price || prev.selling_price,
      supplier_name: item.supplier_name || prev.supplier_name,
      supplier_contact: item.supplier_contact || prev.supplier_contact
    }))
    setShowSuggestions(false)
  }

  // Handle image upload to Cloudinary
  const handleImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setImageFile(file)
    // Clear the URL field when a file is selected
    setFormData(prev => ({ ...prev, image_url: '' }))
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const uploadImageToBackend = async (file) => {
    const formData = new FormData()
    formData.append('image', file)

    try {
      setUploadingImage(true)
      
      // Get auth token
      const token = localStorage.getItem('token')
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/inventory/items/upload-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Image upload error:', errorData)
        throw new Error(errorData.message || 'Failed to upload image')
      }

      const data = await response.json()
      
      if (!data.success || !data.data?.url) {
        throw new Error('Invalid response from server')
      }
      
      return data.data.url
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error(`Image upload failed: ${error.message}`, { duration: 5000 })
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image_url: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Item name is required'
    if (!formData.category.trim()) newErrors.category = 'Category is required'
    if (!formData.unit_of_measure) newErrors.unit_of_measure = 'Unit of measure is required'
    if (!formData.location_id) newErrors.location_id = 'Location is required'
    if (formData.unit_cost && isNaN(parseFloat(formData.unit_cost))) {
      newErrors.unit_cost = 'Unit cost must be a valid number'
    }
    if (formData.selling_price && isNaN(parseFloat(formData.selling_price))) {
      newErrors.selling_price = 'Selling price must be a valid number'
    }
    if (!isEdit && formData.quantity_to_add < 0) {
      newErrors.quantity_to_add = 'Quantity to add cannot be negative'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Create/Update mutation
  const saveMutation = useMutation(
    async (data) => {
      // Upload image if there's a new file
      if (imageFile) {
        try {
          const imageUrl = await uploadImageToBackend(imageFile)
          data.image_url = imageUrl
        } catch (error) {
          // Image upload failed, but we can still save the item without the image
          console.error('Image upload failed, saving item without image:', error)
          // Don't throw - allow the item to be saved without the image
          // The error toast is already shown in uploadImageToBackend
        }
      }

      if (isEdit) {
        return inventoryService.updateItem(id, data)
      } else {
        return inventoryService.createItem(data)
      }
    },
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('inventory-items')
        queryClient.invalidateQueries('inventory-items-autocomplete')
        toast.success(`Item ${isEdit ? 'updated' : 'created'} successfully`)
        navigate('/inventory/items')
      },
      onError: (error) => {
        console.error('Item save error:', error)
        const message = error.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} item`
        toast.error(message)
        
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors)
        }
      }
    }
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    // Prepare data for submission
    const submitData = {
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      unit_of_measure: formData.unit_of_measure,
      unit_cost: parseFloat(formData.unit_cost) || 0,
      selling_price: parseFloat(formData.selling_price) || null,
      reorder_quantity: parseFloat(formData.reorder_quantity) || 0,
      location_id: parseInt(formData.location_id),
      supplier_name: formData.supplier_name,
      supplier_contact: formData.supplier_contact,
      barcode: formData.barcode || null,
      is_active: formData.is_active,
      image_url: formData.image_url,
      notes: formData.notes,
      currency: formData.currency
    }

    if (isEdit) {
      // For edit, if quantity_to_add is provided, we need to adjust stock
      if (formData.quantity_to_add && parseFloat(formData.quantity_to_add) !== 0) {
        submitData.current_stock = parseFloat(formData.current_stock) + parseFloat(formData.quantity_to_add)
      } else {
        submitData.current_stock = parseFloat(formData.current_stock)
      }
    } else {
      // For new items, quantity_to_add becomes the initial stock
      submitData.current_stock = parseFloat(formData.quantity_to_add) || 0
    }

    // Set minimum and maximum stock to 0 (as per requirements)
    submitData.minimum_stock = 0
    submitData.maximum_stock = 0
    submitData.reorder_point = 0

    saveMutation.mutate(submitData)
  }

  if (isEdit && itemLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (isEdit && itemError) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="text-red-600 mb-4">Failed to load item data</div>
          <div className="text-gray-500 text-sm">Error: {itemError.message}</div>
          <div className="mt-4">
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/inventory/items')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Items
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Item' : 'Add New Item'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update item information' : 'Create a new inventory item'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => {
                  if (itemSuggestions.length > 0) setShowSuggestions(true)
                }}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., Dell Laptop XPS 13"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              
              {/* Autocomplete suggestions */}
              {showSuggestions && itemSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {itemSuggestions.map((item) => (
                    <div
                      key={item.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onMouseDown={() => handleSelectSuggestion(item)}
                    >
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {item.category} • {item.unit_of_measure}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={formData.subcategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Computers"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit of Measure <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.unit_of_measure}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_of_measure: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.unit_of_measure ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {unitOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.unit_of_measure && (
                <p className="mt-1 text-sm text-red-600">{errors.unit_of_measure}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Package className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Stock Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Stock
                </label>
                <input
                  type="number"
                  name="current_stock"
                  value={formData.current_stock}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Read-only. Use "Quantity to Add" to adjust.</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEdit ? 'Quantity to Add' : 'Initial Quantity'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity_to_add"
                value={formData.quantity_to_add}
                onChange={handleInputChange}
                min="0"
                step="0.001"
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.quantity_to_add ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.quantity_to_add && (
                <p className="mt-1 text-sm text-red-600">{errors.quantity_to_add}</p>
              )}
              {isEdit && (
                <p className="mt-1 text-xs text-gray-500">
                  New stock will be: {parseFloat(formData.current_stock || 0) + parseFloat(formData.quantity_to_add || 0)}
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Quantity
              </label>
              <input
                type="number"
                name="reorder_quantity"
                value={formData.reorder_quantity}
                onChange={handleInputChange}
                min="0"
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-gray-500">Suggested quantity to reorder</p>
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Pricing Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit Cost
              </label>
              <input
                type="number"
                name="unit_cost"
                value={formData.unit_cost}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.unit_cost ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.unit_cost && (
                <p className="mt-1 text-sm text-red-600">{errors.unit_cost}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selling Price
              </label>
              <input
                type="number"
                name="selling_price"
                value={formData.selling_price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.selling_price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.selling_price && (
                <p className="mt-1 text-sm text-red-600">{errors.selling_price}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="NGN">Nigerian Naira (₦)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location & Supplier */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Location & Supplier</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.location_id.toString()}
                onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.location_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Location</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id.toString()}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
              {errors.location_id && (
                <p className="mt-1 text-sm text-red-600">{errors.location_id}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name
              </label>
              <select
                value={formData.supplier_name}
                onChange={(e) => setFormData(prev => ({ ...prev, supplier_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select Supplier</option>
                {commonSuppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Contact
              </label>
              <input
                type="text"
                name="supplier_contact"
                value={formData.supplier_contact}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Phone, email, or contact person"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode <span className="text-gray-400 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter barcode or scan"
              />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <ImageIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Item Image</h3>
          </div>
          
          <div className="space-y-4">
            {/* Image Preview */}
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="Item preview"
                  className="h-48 w-48 object-cover rounded-lg border-2 border-gray-300"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">OR</span>
              </div>
            </div>
            
            {/* Image URL Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={(e) => {
                  const url = e.target.value
                  setFormData(prev => ({ ...prev, image_url: url }))
                  // Update preview if valid URL
                  if (url && url.trim()) {
                    setImagePreview(url)
                    setImageFile(null) // Clear file upload if URL is provided
                  } else if (!url) {
                    setImagePreview(null)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste an image URL here if you already have the image hosted online
              </p>
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Active Item</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Additional notes or comments..."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 bg-white rounded-lg shadow p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/inventory/items')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saveMutation.isLoading || uploadingImage}
          >
            {saveMutation.isLoading || uploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {uploadingImage ? 'Uploading Image...' : isEdit ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEdit ? 'Update Item' : 'Create Item'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default InventoryItemForm
