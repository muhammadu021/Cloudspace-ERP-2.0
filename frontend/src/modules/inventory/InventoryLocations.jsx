import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Plus,
  Search,
  MapPin,
  Building,
  Edit,
  Trash2,
  Eye,
  Package,
  Users,
  Phone,
  Mail,
  MoreVertical
} from 'lucide-react'
import { inventoryService } from '@/services/inventoryService'
import { useCompany } from '@/hooks/useCompany'
import Button from '@/components/ui/Button'
import { toast } from 'react-hot-toast';
// Removed custom Select import - using native HTML select

const InventoryLocations = () => {
  const { companyId } = useCompany()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'warehouse',
    address: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    capacity: '',
    capacity_unit: 'sqm',
    notes: '',
    company_id: companyId
  })

  // Fetch locations
  const { data: locationsData, isLoading, error, refetch } = useQuery(
    'inventory-locations',
    () => inventoryService.getLocations(),
    {
      select: (response) => {
        // console.log('Locations API response:', response)
        return response?.data?.data?.locations || []
      },
      onError: (error) => {
        console.log('Locations API error, using mock data:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Create/Update location mutation
  const saveLocationMutation = useMutation(
    (data) => editingLocation 
      ? inventoryService.updateLocation(editingLocation.id, data)
      : inventoryService.createLocation(data),
    {
      onSuccess: (response) => {
        console.log('Location save success:', response)
        queryClient.invalidateQueries('inventory-locations')
        toast.success(`Location ${editingLocation ? 'updated' : 'created'} successfully`)
        resetForm()
      },
      onError: (error) => {
        console.error('Location save error:', error)
        toast(error.response?.data?.message || `Failed to ${editingLocation ? 'update' : 'create'} location`)
      }
    }
  )

  // Delete location mutation
  const deleteLocationMutation = useMutation(
    (locationId) => inventoryService.deleteLocation(locationId),
    {
      onSuccess: (response) => {
        console.log('Location delete success:', response)
        queryClient.invalidateQueries('inventory-locations')
        toast.success('Location deleted successfully')
      },
      onError: (error) => {
        console.error('Location delete error:', error)
        toast(error.response?.data?.message || 'Failed to delete location')
      }
    }
  )

  // Mock data for demonstration
  const mockLocations = [
    {
      id: 1,
      name: 'Main Warehouse',
      code: 'WH-001',
      type: 'warehouse',
      address: '123 Industrial Area, Victoria Island, Lagos',
      contact_person: 'John Warehouse',
      contact_phone: '+234 801 234 5678',
      contact_email: 'warehouse@company.com',
      capacity: 5000,
      capacity_unit: 'sqm',
      is_active: true,
      is_default: true,
      notes: 'Primary storage facility',
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: 2,
      name: 'Office Storage',
      code: 'OF-001',
      type: 'office',
      address: '456 Business District, Ikoyi, Lagos',
      contact_person: 'Jane Office',
      contact_phone: '+234 802 345 6789',
      contact_email: 'office@company.com',
      capacity: 200,
      capacity_unit: 'sqm',
      is_active: true,
      is_default: false,
      notes: 'Office supplies and equipment storage',
      created_at: '2024-01-05T00:00:00Z'
    },
    {
      id: 3,
      name: 'Stationery Store',
      code: 'ST-001',
      type: 'store',
      address: '789 Commercial Avenue, Surulere, Lagos',
      contact_person: 'Mike Store',
      contact_phone: '+234 803 456 7890',
      contact_email: 'store@company.com',
      capacity: 150,
      capacity_unit: 'sqm',
      is_active: true,
      is_default: false,
      notes: 'Retail stationery and supplies',
      created_at: '2024-01-10T00:00:00Z'
    }
  ]

  const locations = locationsData || (error ? mockLocations : [])
  
  // Debug current data
  console.log('InventoryLocations - Current data:', {
    locationsData,
    locationsCount: locations?.length || 0,
    error: error?.message,
    isLoading,
    locations: locations?.slice(0, 2) // Show first 2 for debugging
  })

  const locationTypes = [
    { value: 'warehouse', label: 'Warehouse', icon: Building },
    { value: 'store', label: 'Store', icon: Package },
    { value: 'office', label: 'Office', icon: Building },
    { value: 'production', label: 'Production', icon: Building },
    { value: 'transit', label: 'Transit', icon: MapPin },
    { value: 'virtual', label: 'Virtual', icon: Package }
  ]

  const capacityUnits = [
    { value: 'sqm', label: 'Square Meters' },
    { value: 'sqft', label: 'Square Feet' },
    { value: 'cbm', label: 'Cubic Meters' },
    { value: 'cbft', label: 'Cubic Feet' },
    { value: 'pallets', label: 'Pallets' },
    { value: 'shelves', label: 'Shelves' }
  ]

  const filteredLocations = locations.filter(location => {
    const matchesSearch = !searchTerm || 
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !typeFilter || location.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const getTypeIcon = (type) => {
    const typeConfig = locationTypes.find(t => t.value === type)
    return typeConfig ? typeConfig.icon : Building
  }

  const getTypeColor = (type) => {
    const colors = {
      warehouse: 'text-primary bg-blue-100',
      store: 'text-green-600 bg-green-100',
      office: 'text-purple-600 bg-purple-100',
      production: 'text-orange-600 bg-orange-100',
      transit: 'text-yellow-600 bg-yellow-100',
      virtual: 'text-gray-600 bg-gray-100'
    }
    return colors[type] || 'text-gray-600 bg-gray-100'
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'warehouse',
      address: '',
      contact_person: '',
      contact_phone: '',
      contact_email: '',
      capacity: '',
      capacity_unit: 'sqm',
      notes: '',
      company_id: companyId
    })
    setEditingLocation(null)
    setShowForm(false)
  }

  const handleEdit = (location) => {
    setFormData({
      name: location.name,
      code: location.code,
      type: location.type,
      address: location.address || '',
      contact_person: location.contact_person || '',
      contact_phone: location.contact_phone || '',
      contact_email: location.contact_email || '',
      capacity: location.capacity || '',
      capacity_unit: location.capacity_unit || 'sqm',
      notes: location.notes || '',
      company_id: location.company_id || companyId
    })
    setEditingLocation(location)
    setShowForm(true)
  }

  const handleDelete = (location) => {
    if (window.confirm(`Are you sure you want to delete "${location.name}"?`)) {
      deleteLocationMutation.mutate(location.id)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.code.trim()) {
      toast('Name and code are required')
      return
    }

    const submitData = {
      ...formData,
      capacity: parseFloat(formData.capacity) || null,
      company_id: companyId // Ensure company_id is always set
    }
    
    console.log('Submitting location data:', submitData)
    saveLocationMutation.mutate(submitData)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Locations</h1>
          <p className="text-gray-600">Manage your inventory storage locations</p>
          {error && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 mt-2">
              Demo Mode - API Unavailable
            </span>
          )}
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Types</option>
            {locationTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Location Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., Main Warehouse"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., WH-001"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      {locationTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Contact person name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Full address of the location"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity Unit
                    </label>
                    <select
                      value={formData.capacity_unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity_unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      {capacityUnits.map(unit => (
                        <option key={unit.value} value={unit.value}>{unit.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Additional notes about this location"
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saveLocationMutation.isLoading}>
                    {saveLocationMutation.isLoading ? 'Saving...' : (editingLocation ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((location) => {
          const TypeIcon = getTypeIcon(location.type)
          return (
            <div key={location.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(location.type)}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{location.name}</h3>
                      <p className="text-sm text-gray-500">{location.code}</p>
                    </div>
                  </div>
                  
                  {location.is_default && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      Default
                    </span>
                  )}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(location.type)}`}>
                      {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                    </span>
                  </div>
                  
                  {location.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{location.address}</span>
                    </div>
                  )}
                  
                  {location.contact_person && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{location.contact_person}</span>
                    </div>
                  )}
                  
                  {location.contact_phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{location.contact_phone}</span>
                    </div>
                  )}
                  
                  {location.contact_email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{location.contact_email}</span>
                    </div>
                  )}
                  
                  {location.capacity && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2" />
                      <span>{location.capacity} {location.capacity_unit}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Created {new Date(location.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(location)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!location.is_default && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDelete(location)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No locations found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || typeFilter 
              ? 'Try adjusting your search or filters.' 
              : 'Get started by adding your first inventory location.'}
          </p>
          {!searchTerm && !typeFilter && (
            <div className="mt-6">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Location
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InventoryLocations