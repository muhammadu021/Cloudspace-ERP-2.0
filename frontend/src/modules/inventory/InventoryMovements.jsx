import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Package,
  Calendar,
  User,
  MapPin,
  FileText,
  Download,
  RefreshCw,
  ArrowRight
} from 'lucide-react'
import { inventoryService } from '@/services/inventoryService'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
// Removed custom Select import - using native HTML select
import { formatCurrency } from '@/utils/formatters'
import { toast } from 'react-hot-toast';

const InventoryMovements = () => {
  // Permission checks removed
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    movement_type: '',
    item_id: '',
    location_id: '',
    date_from: '',
    date_to: ''
  })
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    item_id: '',
    movement_type: 'in',
    quantity: '',
    unit_cost: '',
    from_location_id: '',
    to_location_id: '',
    reference_type: '',
    reference_number: '',
    reason: '',
    batch_number: '',
    notes: ''
  })

  // Fetch movements
  const { data: movementsData, isLoading, error, refetch } = useQuery(
    ['inventory-movements', { page, limit, search: searchTerm, ...filters }],
    () => inventoryService.getMovements({
      page,
      limit,
      search: searchTerm,
      ...filters
    }),
    {
      select: (response) => {
        // console.log('Movements API response:', response)
        return response?.data?.data
      },
      keepPreviousData: true,
      onError: (error) => {
        console.log('Movements API error, using mock data:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch items for dropdown
  const { data: itemsData } = useQuery(
    'inventory-items-list',
    () => inventoryService.getItems({ limit: 1000 }),
    {
      select: (response) => {
        // console.log('Movements - Items API response:', response)
        return response?.data?.data?.items || []
      },
      onError: (error) => {
        console.log('Items API error:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch locations for dropdown
  const { data: locationsData } = useQuery(
    'inventory-locations',
    () => inventoryService.getLocations(),
    {
      select: (response) => {
        // console.log('Movements - Locations API response:', response)
        return response?.data?.data?.locations || []
      },
      onError: (error) => {
        console.log('Locations API error:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Create movement mutation
  const createMovementMutation = useMutation(
    (data) => {
      console.log('Creating movement with data:', data)
      return inventoryService.createMovement(data)
    },
    {
      onSuccess: (response) => {
        console.log('Movement create success:', response)
        queryClient.invalidateQueries('inventory-movements')
        queryClient.invalidateQueries('inventory-items')
        toast.success('Movement created successfully')
        resetForm()
      },
      onError: (error) => {
        console.error('Movement create error:', error)
        toast(error.response?.data?.message || 'Failed to create movement')
      }
    }
  )

  // Mock data for demonstration
  const mockMovements = [
    {
      id: 1,
      movement_type: 'in',
      quantity: 10,
      unit_cost: 450000,
      total_cost: 4500000,
      movement_date: '2024-01-20T09:30:00Z',
      reason: 'Purchase order received',
      reference_type: 'purchase_order',
      reference_number: 'PO-2024-001',
      batch_number: 'BATCH-001',
      InventoryItem: {
        id: 1,
        name: 'Dell Laptop XPS 13',
        sku: 'LAP-001',
        unit_of_measure: 'pcs'
      },
      MovedBy: {
        first_name: 'John',
        last_name: 'Doe'
      },
      ToLocation: {
        name: 'Main Warehouse',
        code: 'WH-001'
      },
      FromLocation: null
    },
    {
      id: 2,
      movement_type: 'out',
      quantity: -3,
      unit_cost: 450000,
      total_cost: 1350000,
      movement_date: '2024-01-18T14:15:00Z',
      reason: 'Sales order fulfillment',
      reference_type: 'sales_order',
      reference_number: 'SO-2024-005',
      batch_number: null,
      InventoryItem: {
        id: 1,
        name: 'Dell Laptop XPS 13',
        sku: 'LAP-001',
        unit_of_measure: 'pcs'
      },
      MovedBy: {
        first_name: 'Jane',
        last_name: 'Smith'
      },
      FromLocation: {
        name: 'Main Warehouse',
        code: 'WH-001'
      },
      ToLocation: null
    },
    {
      id: 3,
      movement_type: 'transfer',
      quantity: 5,
      unit_cost: 85000,
      total_cost: 425000,
      movement_date: '2024-01-17T11:20:00Z',
      reason: 'Stock redistribution',
      reference_type: 'transfer',
      reference_number: 'TRF-2024-003',
      batch_number: null,
      InventoryItem: {
        id: 2,
        name: 'Office Chair Ergonomic',
        sku: 'OFF-002',
        unit_of_measure: 'pcs'
      },
      MovedBy: {
        first_name: 'Mike',
        last_name: 'Johnson'
      },
      FromLocation: {
        name: 'Main Warehouse',
        code: 'WH-001'
      },
      ToLocation: {
        name: 'Office Storage',
        code: 'OF-001'
      }
    },
    {
      id: 4,
      movement_type: 'adjustment',
      quantity: -2,
      unit_cost: 2500,
      total_cost: 5000,
      movement_date: '2024-01-16T16:45:00Z',
      reason: 'Stock count adjustment - damaged items',
      reference_type: 'adjustment',
      reference_number: 'ADJ-2024-003',
      batch_number: 'BATCH-A4-001',
      InventoryItem: {
        id: 3,
        name: 'A4 Paper Ream',
        sku: 'STA-003',
        unit_of_measure: 'ream'
      },
      MovedBy: {
        first_name: 'Sarah',
        last_name: 'Wilson'
      },
      FromLocation: {
        name: 'Stationery Store',
        code: 'ST-001'
      },
      ToLocation: null
    }
  ]

  const mockItems = [
    { id: 1, name: 'Dell Laptop XPS 13', sku: 'LAP-001', unit_of_measure: 'pcs' },
    { id: 2, name: 'Office Chair Ergonomic', sku: 'OFF-002', unit_of_measure: 'pcs' },
    { id: 3, name: 'A4 Paper Ream', sku: 'STA-003', unit_of_measure: 'ream' }
  ]

  const mockLocations = [
    { id: 1, name: 'Main Warehouse', code: 'WH-001' },
    { id: 2, name: 'Office Storage', code: 'OF-001' },
    { id: 3, name: 'Stationery Store', code: 'ST-001' }
  ]

  const movements = movementsData?.movements || (error ? mockMovements : [])
  const items = itemsData || (error ? mockItems : [])
  const locations = locationsData || (error ? mockLocations : [])
  const pagination = movementsData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: mockMovements.length,
    itemsPerPage: limit
  }
  
  // Debug current data
  console.log('InventoryMovements - Current data:', {
    movementsData,
    movementsCount: movements?.length || 0,
    itemsCount: items?.length || 0,
    locationsCount: locations?.length || 0,
    pagination,
    error: error?.message,
    movements: movements?.slice(0, 2) // Show first 2 for debugging
  })

  const movementTypes = [
    { value: 'in', label: 'Stock In', icon: TrendingUp, color: 'text-green-600 bg-green-100' },
    { value: 'out', label: 'Stock Out', icon: TrendingDown, color: 'text-red-600 bg-red-100' },
    { value: 'transfer', label: 'Transfer', icon: Package, color: 'text-purple-600 bg-purple-100' },
    { value: 'adjustment', label: 'Adjustment', icon: RotateCcw, color: 'text-primary bg-blue-100' },
    { value: 'return', label: 'Return', icon: RotateCcw, color: 'text-orange-600 bg-orange-100' }
  ]

  const referenceTypes = [
    { value: 'purchase_order', label: 'Purchase Order' },
    { value: 'sales_order', label: 'Sales Order' },
    { value: 'project', label: 'Project' },
    { value: 'adjustment', label: 'Adjustment' },
    { value: 'return', label: 'Return' },
    { value: 'transfer', label: 'Transfer' },
    { value: 'production', label: 'Production' }
  ]

  const getMovementIcon = (type) => {
    const config = movementTypes.find(t => t.value === type)
    return config ? config.icon : Package
  }

  const getMovementColor = (type) => {
    const config = movementTypes.find(t => t.value === type)
    return config ? config.color : 'text-gray-600 bg-gray-100'
  }

  const resetForm = () => {
    setFormData({
      item_id: '',
      movement_type: 'in',
      quantity: '',
      unit_cost: '',
      from_location_id: '',
      to_location_id: '',
      reference_type: '',
      reference_number: '',
      reason: '',
      batch_number: '',
      notes: ''
    })
    setShowForm(false)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.item_id || !formData.quantity || !formData.reason) {
      toast('Item, quantity, and reason are required')
      return
    }

    const submitData = {
      ...formData,
      item_id: parseInt(formData.item_id),
      quantity: parseFloat(formData.quantity),
      unit_cost: parseFloat(formData.unit_cost) || null,
      from_location_id: formData.from_location_id ? parseInt(formData.from_location_id) : null,
      to_location_id: formData.to_location_id ? parseInt(formData.to_location_id) : null
    }
    
    console.log('Submitting movement data:', submitData)
    createMovementMutation.mutate(submitData)
  }

  if (isLoading && !movements.length) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-600">Track all inventory movements and transactions</p>
          {error && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 mt-2">
              Demo Mode - API Unavailable
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Movement
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search movements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={filters.movement_type}
            onChange={(e) => handleFilterChange('movement_type', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Types</option>
            {movementTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          <select
            value={filters.item_id}
            onChange={(e) => handleFilterChange('item_id', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Items</option>
            {items.map(item => (
              <option key={item.id} value={item.id.toString()}>{item.name} ({item.sku})</option>
            ))}
          </select>
          
          <select
            value={filters.location_id}
            onChange={(e) => handleFilterChange('location_id', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Locations</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id.toString()}>{loc.name}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="From Date"
          />
          
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="To Date"
          />
        </div>
      </div>

      {/* Movement Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Stock Movement</h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.item_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, item_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      <option value="">Select Item</option>
                      {items.map(item => (
                        <option key={item.id} value={item.id.toString()}>
                          {item.name} ({item.sku})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Movement Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.movement_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, movement_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      {movementTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter quantity"
                      step="0.001"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Cost
                    </label>
                    <input
                      type="number"
                      value={formData.unit_cost}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_cost: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      From Location
                    </label>
                    <select
                      value={formData.from_location_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, from_location_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Location</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id.toString()}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To Location
                    </label>
                    <select
                      value={formData.to_location_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, to_location_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Location</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id.toString()}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Type
                    </label>
                    <select
                      value={formData.reference_type}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference_type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Type</option>
                      {referenceTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={formData.reference_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, reference_number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g., PO-2024-001"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Batch Number
                    </label>
                    <input
                      type="text"
                      value={formData.batch_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, batch_number: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Batch number (if applicable)"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Reason for this movement"
                    required
                  />
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
                    placeholder="Additional notes"
                  />
                </div>
                
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMovementMutation.isLoading}>
                    {createMovementMutation.isLoading ? 'Creating...' : 'Create Movement'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Movements List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Movements ({pagination.totalItems})
            </h3>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {movements.map((movement) => {
            const MovementIcon = getMovementIcon(movement.movement_type)
            const movementColor = getMovementColor(movement.movement_type)
            
            return (
              <div key={movement.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg ${movementColor}`}>
                      <MovementIcon className="h-5 w-5" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${movementColor}`}>
                          {movement.movement_type.toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {parseFloat(movement.quantity) > 0 ? '+' : ''}{parseFloat(movement.quantity) || 0} {movement.InventoryItem?.unit_of_measure}
                        </span>
                        <span className="text-sm text-gray-500">
                          {movement.InventoryItem?.name} ({movement.InventoryItem?.sku})
                        </span>
                      </div>
                      
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(movement.movement_date).toLocaleString()}
                        </div>
                        
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {movement.MovedBy?.first_name} {movement.MovedBy?.last_name}
                        </div>
                        
                        {movement.reference_number && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {movement.reference_number}
                          </div>
                        )}
                        
                        {movement.batch_number && (
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-1" />
                            Batch: {movement.batch_number}
                          </div>
                        )}
                      </div>
                      
                      {(movement.FromLocation || movement.ToLocation) && (
                        <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          {movement.FromLocation && (
                            <span>{movement.FromLocation.name}</span>
                          )}
                          {movement.FromLocation && movement.ToLocation && (
                            <ArrowRight className="h-4 w-4" />
                          )}
                          {movement.ToLocation && (
                            <span>{movement.ToLocation.name}</span>
                          )}
                        </div>
                      )}
                      
                      <p className="mt-1 text-sm text-gray-600">{movement.reason}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-medium text-gray-900">
                      {formatCurrency(Math.abs(parseFloat(movement.total_cost) || 0))}
                    </p>
                    {movement.unit_cost && (
                      <p className="text-sm text-gray-500">
                        @ {formatCurrency(parseFloat(movement.unit_cost) || 0)} per {movement.InventoryItem?.unit_of_measure}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} movements
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!isLoading && movements.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No movements found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters.' 
              : 'Stock movements will appear here as they are recorded.'}
          </p>
          {!searchTerm && !Object.values(filters).some(f => f) && (
            <div className="mt-6">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Movement
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InventoryMovements