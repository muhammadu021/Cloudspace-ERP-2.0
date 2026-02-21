import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  RefreshCw,
  Barcode,
  MapPin
} from 'lucide-react'
import { inventoryService } from '@/services/inventoryService'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
// Removed custom Select import - using native HTML select
import { formatCurrency } from '@/utils/formatters'
import { toast } from 'react-hot-toast';

const InventoryItems = () => {
  // Permission checks removed
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    location_id: '',
    status: '',
    low_stock: false
  })
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('DESC')

  // Fetch inventory items
  const { data: itemsData, isLoading, error, refetch } = useQuery(
    ['inventory-items', { page, limit, search: searchTerm, ...filters, sortBy, sortOrder }],
    () => inventoryService.getItems({
      page,
      limit,
      search: searchTerm,
      ...filters,
      sortBy,
      sortOrder
    }),
    {
      select: (response) => {
        // console.log('Items API response:', response)
        return response?.data?.data
      },
      keepPreviousData: true,
      onError: (error) => {
        console.log('Inventory items API error, using mock data:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch locations for filter
  const { data: locationsData } = useQuery(
    'inventory-locations',
    () => inventoryService.getLocations(),
    {
      select: (response) => {
        // console.log('Items - Locations API response:', response)
        return response?.data?.data?.locations || []
      },
      onError: (error) => {
        console.log('Locations API error:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Delete item mutation
  const deleteItemMutation = useMutation(
    (itemId) => inventoryService.deleteItem(itemId),
    {
      onSuccess: (response) => {
        console.log('Item delete success:', response)
        queryClient.invalidateQueries('inventory-items')
        toast.success('Item deleted successfully')
      },
      onError: (error) => {
        console.error('Item delete error:', error)
        toast(error.response?.data?.message || 'Failed to delete item')
      }
    }
  )

  // Mock data for demonstration
  const mockItems = [
    {
      id: 1,
      sku: 'LAP-001',
      name: 'Dell Laptop XPS 13',
      description: 'High-performance laptop for office work',
      category: 'Electronics',
      subcategory: 'Computers',
      unit_of_measure: 'pcs',
      current_stock: 15,
      minimum_stock: 5,
      maximum_stock: 50,
      reorder_point: 8,
      unit_cost: 450000,
      selling_price: 520000,
      currency: 'NGN',
      supplier_name: 'Tech Solutions Ltd',
      barcode: '1234567890123',
      is_active: true,
      is_serialized: true,
      is_batch_tracked: false,
      InventoryLocation: {
        id: 1,
        name: 'Main Warehouse',
        code: 'WH-001',
        type: 'warehouse'
      },
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      sku: 'OFF-002',
      name: 'Office Chair Ergonomic',
      description: 'Comfortable ergonomic office chair',
      category: 'Furniture',
      subcategory: 'Seating',
      unit_of_measure: 'pcs',
      current_stock: 3,
      minimum_stock: 10,
      maximum_stock: 100,
      reorder_point: 15,
      unit_cost: 85000,
      selling_price: 120000,
      currency: 'NGN',
      supplier_name: 'Furniture Plus',
      barcode: '2345678901234',
      is_active: true,
      is_serialized: false,
      is_batch_tracked: false,
      InventoryLocation: {
        id: 2,
        name: 'Office Storage',
        code: 'OF-001',
        type: 'office'
      },
      created_at: '2024-01-10T14:20:00Z'
    },
    {
      id: 3,
      sku: 'STA-003',
      name: 'A4 Paper Ream',
      description: 'High quality A4 printing paper',
      category: 'Stationery',
      subcategory: 'Paper',
      unit_of_measure: 'ream',
      current_stock: 150,
      minimum_stock: 50,
      maximum_stock: 500,
      reorder_point: 75,
      unit_cost: 2500,
      selling_price: 3200,
      currency: 'NGN',
      supplier_name: 'Paper World',
      barcode: '3456789012345',
      is_active: true,
      is_serialized: false,
      is_batch_tracked: true,
      InventoryLocation: {
        id: 3,
        name: 'Stationery Store',
        code: 'ST-001',
        type: 'store'
      },
      created_at: '2024-01-05T09:15:00Z'
    }
  ]

  const mockLocations = [
    { id: 1, name: 'Main Warehouse', code: 'WH-001', type: 'warehouse' },
    { id: 2, name: 'Office Storage', code: 'OF-001', type: 'office' },
    { id: 3, name: 'Stationery Store', code: 'ST-001', type: 'store' }
  ]

  const items = itemsData?.items || (error ? mockItems : [])
  const locations = locationsData || (error ? mockLocations : [])
  const pagination = itemsData?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: mockItems.length,
    itemsPerPage: limit
  }

  const categories = [...new Set(items.map(item => item.category))]
  
  // Debug current data
  console.log('InventoryItems - Current data:', {
    itemsData,
    itemsCount: items?.length || 0,
    locationsCount: locations?.length || 0,
    pagination,
    filters,
    error: error?.message,
    items: items?.slice(0, 2) // Show first 2 for debugging
  })

  const getStockStatus = (item) => {
    const currentStock = parseFloat(item.current_stock) || 0
    const minimumStock = parseFloat(item.minimum_stock) || 0
    const reorderPoint = parseFloat(item.reorder_point) || 0
    
    if (currentStock <= minimumStock) {
      return { status: 'low', color: 'text-red-600 bg-red-100', label: 'Low Stock' }
    } else if (currentStock <= reorderPoint) {
      return { status: 'reorder', color: 'text-yellow-600 bg-yellow-100', label: 'Reorder' }
    } else {
      return { status: 'good', color: 'text-green-600 bg-green-100', label: 'Good' }
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC')
    } else {
      setSortBy(field)
      setSortOrder('ASC')
    }
    setPage(1)
  }

  const handleDeleteItem = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      deleteItemMutation.mutate(item.id)
    }
  }

  const handleExport = () => {
    // Implementation for exporting inventory data
    console.log('Export inventory data:', { items: items.length, filters })
    toast('Export functionality will be implemented')
  }

  const handleImport = () => {
    // Implementation for importing inventory data
    console.log('Import inventory data')
    toast('Import functionality will be implemented')
  }

  if (isLoading && !items.length) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Inventory Items</h1>
          <p className="text-gray-600">Manage your inventory items and stock levels</p>
          {error && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 mt-2">
              Demo Mode - API Unavailable
            </span>
          )}
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Link to="/inventory/items/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
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
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="low-stock"
              checked={filters.low_stock}
              onChange={(e) => handleFilterChange('low_stock', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="low-stock" className="text-sm text-gray-700">
              Low Stock Only
            </label>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Items ({pagination.totalItems})
            </h3>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('sku')}
                >
                  SKU
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('current_stock')}
                >
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('unit_cost')}
                >
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item) => {
                const stockStatus = getStockStatus(item)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">{item.sku}</div>
                        {item.barcode && (
                          <Barcode className="h-4 w-4 text-gray-400 ml-2" title="Has Barcode" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.category}</div>
                      {item.subcategory && (
                        <div className="text-sm text-gray-500">{item.subcategory}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {parseFloat(item.current_stock) || 0} {item.unit_of_measure}
                      </div>
                      <div className="text-xs text-gray-500">
                        Min: {parseFloat(item.minimum_stock) || 0} | Reorder: {parseFloat(item.reorder_point) || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                      {item.current_stock <= item.minimum_stock && (
                        <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(parseFloat(item.unit_cost) || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {item.InventoryLocation?.name}
                      </div>
                      <div className="text-xs text-gray-500">{item.InventoryLocation?.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link to={`/inventory/items/${item.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/inventory/items/${item.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteItem(item)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} items
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
      {!isLoading && items.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || Object.values(filters).some(f => f) 
              ? 'Try adjusting your search or filters.' 
              : 'Get started by adding your first inventory item.'}
          </p>
          {!searchTerm && !Object.values(filters).some(f => f) && (
            <div className="mt-6">
              <Link to="/inventory/items/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InventoryItems