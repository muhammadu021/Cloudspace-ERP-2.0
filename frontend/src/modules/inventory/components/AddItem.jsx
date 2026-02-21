import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Save, 
  X,
  AlertTriangle,
  CheckCircle,
  MapPin,
  DollarSign,
  BarCode,
  FileText
} from 'lucide-react';

const AddItem = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    subcategory: '',
    unit_of_measure: 'pcs',
    current_stock: '',
    minimum_stock: '',
    maximum_stock: '',
    reorder_point: '',
    reorder_quantity: '',
    unit_cost: '',
    selling_price: '',
    location_id: '',
    supplier_name: '',
    barcode: '',
    is_serialized: false,
    is_batch_tracked: false
  });
  
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/v1/inventory/locations', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      setLocations(data.data.locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
      setError('Failed to load locations');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.sku.trim()) {
      errors.sku = 'SKU is required';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Item name is required';
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
    }
    
    if (!formData.unit_of_measure.trim()) {
      errors.unit_of_measure = 'Unit of measure is required';
    }
    
    if (!formData.location_id) {
      errors.location_id = 'Location is required';
    }
    
    if (formData.current_stock && parseFloat(formData.current_stock) < 0) {
      errors.current_stock = 'Current stock cannot be negative';
    }
    
    if (formData.minimum_stock && parseFloat(formData.minimum_stock) < 0) {
      errors.minimum_stock = 'Minimum stock cannot be negative';
    }
    
    if (formData.maximum_stock && parseFloat(formData.maximum_stock) < 0) {
      errors.maximum_stock = 'Maximum stock cannot be negative';
    }
    
    if (formData.unit_cost && parseFloat(formData.unit_cost) < 0) {
      errors.unit_cost = 'Unit cost cannot be negative';
    }
    
    if (formData.selling_price && parseFloat(formData.selling_price) < 0) {
      errors.selling_price = 'Selling price cannot be negative';
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
      const response = await fetch('/api/v1/inventory/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create item');
      }
      
      setSuccess('Item created successfully!');
      
      // Reset form
      setFormData({
        sku: '',
        name: '',
        description: '',
        category: '',
        subcategory: '',
        unit_of_measure: 'pcs',
        current_stock: '',
        minimum_stock: '',
        maximum_stock: '',
        reorder_point: '',
        reorder_quantity: '',
        unit_cost: '',
        selling_price: '',
        location_id: '',
        supplier_name: '',
        barcode: '',
        is_serialized: false,
        is_batch_tracked: false
      });
      
      if (onSuccess) {
        onSuccess(data.data.item);
      }
      
    } catch (error) {
      console.error('Error creating item:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Electronics', 'Hardware', 'Software', 'Office Supplies', 'Furniture', 
    'Equipment', 'Tools', 'Materials', 'Components', 'Other'
  ];

  const units = [
    'pcs', 'kg', 'g', 'lb', 'oz', 'l', 'ml', 'gal', 'm', 'cm', 'mm', 'ft', 'in',
    'box', 'pack', 'set', 'pair', 'dozen', 'case', 'roll', 'sheet'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Item</h1>
          <p className="text-gray-600 mt-1">Create a new inventory item</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        )}
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
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <Package className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU *
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.sku ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter unique SKU"
              />
              {validationErrors.sku && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.sku}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                placeholder="Enter item description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {validationErrors.category && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                placeholder="Enter subcategory"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit of Measure *
              </label>
              <select
                name="unit_of_measure"
                value={formData.unit_of_measure}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.unit_of_measure ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              {validationErrors.unit_of_measure && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.unit_of_measure}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <select
                name="location_id"
                value={formData.location_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.location_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select Location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.name} ({location.code})
                  </option>
                ))}
              </select>
              {validationErrors.location_id && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.location_id}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stock Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <BarCode className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Stock Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock
              </label>
              <input
                type="number"
                name="current_stock"
                value={formData.current_stock}
                onChange={handleInputChange}
                min="0"
                step="0.001"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.current_stock ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {validationErrors.current_stock && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.current_stock}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Stock
              </label>
              <input
                type="number"
                name="minimum_stock"
                value={formData.minimum_stock}
                onChange={handleInputChange}
                min="0"
                step="0.001"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.minimum_stock ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {validationErrors.minimum_stock && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.minimum_stock}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Stock
              </label>
              <input
                type="number"
                name="maximum_stock"
                value={formData.maximum_stock}
                onChange={handleInputChange}
                min="0"
                step="0.001"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.maximum_stock ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {validationErrors.maximum_stock && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.maximum_stock}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reorder Point
              </label>
              <input
                type="number"
                name="reorder_point"
                value={formData.reorder_point}
                onChange={handleInputChange}
                min="0"
                step="0.001"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                placeholder="0"
              />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-6">
            <DollarSign className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Pricing Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.unit_cost ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {validationErrors.unit_cost && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.unit_cost}</p>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500 ${
                  validationErrors.selling_price ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {validationErrors.selling_price && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.selling_price}</p>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name
              </label>
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                placeholder="Enter supplier name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                placeholder="Enter barcode"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_serialized"
                checked={formData.is_serialized}
                onChange={handleInputChange}
                className="mr-3 text-primary focus:ring-primary"
              />
              <label className="text-sm font-medium text-gray-700">
                Track by Serial Number
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_batch_tracked"
                checked={formData.is_batch_tracked}
                onChange={handleInputChange}
                className="mr-3 text-primary focus:ring-primary"
              />
              <label className="text-sm font-medium text-gray-700">
                Track by Batch
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Cancel
            </button>
          )}
          
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
                <Save className="h-4 w-4 mr-2" />
                Create Item
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItem;