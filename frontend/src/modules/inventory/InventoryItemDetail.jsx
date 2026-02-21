import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  MapPin,
  Barcode,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Calendar,
  User,
  FileText,
  Plus,
  Minus,
  RotateCcw,
  MoreVertical,
  Eye,
  Download
} from 'lucide-react'
import { inventoryService } from '@/services/inventoryService'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'
import { toast } from 'react-hot-toast';

const InventoryItemDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  // Permission checks removed
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch item details
  const { data: itemData, isLoading, error } = useQuery(
    ['inventory-item', id],
    () => inventoryService.getItemById(id),
    {
      select: (response) => {
        // console.log('ItemDetail - Item API response:', response)
        return response?.data?.data?.item || response?.data?.item
      },
      onError: (error) => {
        console.log('Item detail API error, using mock data:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch item movements
  const { data: movementsData } = useQuery(
    ['inventory-movements', { item_id: id }],
    () => inventoryService.getMovements({ item_id: id, limit: 10 }),
    {
      select: (response) => {
        // console.log('ItemDetail - Movements API response:', response)
        return response?.data?.data?.movements || response?.data?.movements || []
      },
      onError: (error) => {
        console.log('Movements API error:', error.message)
      },
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Delete item mutation
  const deleteItemMutation = useMutation(
    () => inventoryService.deleteItem(id),
    {
      onSuccess: (response) => {
        console.log('Item delete success:', response)
        queryClient.invalidateQueries('inventory-items')
        toast.success('Item deleted successfully')
        navigate('/inventory/items')
      },
      onError: (error) => {
        console.error('Item delete error:', error)
        toast(error.response?.data?.message || 'Failed to delete item')
      }
    }
  )

  // Mock data for demonstration
  const mockItem = {
    id: 1,
    sku: 'LAP-001',
    name: 'Dell Laptop XPS 13',
    description: 'High-performance laptop for office work with Intel Core i7 processor, 16GB RAM, and 512GB SSD storage.',
    category: 'Electronics',
    subcategory: 'Computers',
    unit_of_measure: 'pcs',
    current_stock: 15,
    minimum_stock: 5,
    maximum_stock: 50,
    reorder_point: 8,
    reorder_quantity: 20,
    unit_cost: 450000,
    selling_price: 520000,
    currency: 'NGN',
    supplier_name: 'Tech Solutions Ltd',
    supplier_contact: '+234 801 234 5678',
    barcode: '1234567890123',
    is_active: true,
    is_serialized: true,
    is_batch_tracked: false,
    weight: 1.5,
    dimensions: {
      length: 30.5,
      width: 21.5,
      height: 1.8,
      unit: 'cm'
    },
    image_url: 'https://example.com/laptop.jpg',
    notes: 'Premium business laptop with excellent build quality',
    InventoryLocation: {
      id: 1,
      name: 'Main Warehouse',
      code: 'WH-001',
      type: 'warehouse',
      address: '123 Industrial Area, Lagos'
    },
    created_at: '2024-01-15T10:30:00Z',
    updated_at: '2024-01-20T14:45:00Z'
  }

  const mockMovements = [
    {
      id: 1,
      movement_type: 'in',
      quantity: 10,
      unit_cost: 450000,
      total_cost: 4500000,
      movement_date: '2024-01-20T09:30:00Z',
      reason: 'Purchase order PO-2024-001',
      reference_number: 'PO-2024-001',
      MovedBy: {
        first_name: 'John',
        last_name: 'Doe'
      },
      ToLocation: {
        name: 'Main Warehouse',
        code: 'WH-001'
      }
    },
    {
      id: 2,
      movement_type: 'out',
      quantity: -3,
      unit_cost: 450000,
      total_cost: 1350000,
      movement_date: '2024-01-18T14:15:00Z',
      reason: 'Sales order SO-2024-005',
      reference_number: 'SO-2024-005',
      MovedBy: {
        first_name: 'Jane',
        last_name: 'Smith'
      },
      FromLocation: {
        name: 'Main Warehouse',
        code: 'WH-001'
      }
    },
    {
      id: 3,
      movement_type: 'adjustment',
      quantity: -2,
      unit_cost: 450000,
      total_cost: 900000,
      movement_date: '2024-01-16T11:20:00Z',
      reason: 'Stock count adjustment - damaged items',
      reference_number: 'ADJ-2024-003',
      MovedBy: {
        first_name: 'Mike',
        last_name: 'Johnson'
      }
    }
  ]

  const item = itemData || (error ? mockItem : null)
  const movements = movementsData || (error ? mockMovements : [])

  const getStockStatus = () => {
    if (!item) return { status: 'unknown', color: 'text-gray-600 bg-gray-100', label: 'Unknown' }
    
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

  const getMovementIcon = (type) => {
    switch (type) {
      case 'in':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'out':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'adjustment':
        return <RotateCcw className="h-4 w-4 text-primary" />
      case 'transfer':
        return <Package className="h-4 w-4 text-purple-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getMovementColor = (type) => {
    switch (type) {
      case 'in':
        return 'text-green-600 bg-green-100'
      case 'out':
        return 'text-red-600 bg-red-100'
      case 'adjustment':
        return 'text-primary bg-blue-100'
      case 'transfer':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const handleDeleteItem = () => {
    if (window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
      deleteItemMutation.mutate()
    }
  }

  const stockStatus = getStockStatus()
  const stockValue = item ? (parseFloat(item.current_stock) || 0) * (parseFloat(item.unit_cost) || 0) : 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Item not found</h3>
        <p className="mt-1 text-sm text-gray-500">The requested inventory item could not be found.</p>
        <div className="mt-6">
          <Link to="/inventory/items">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Items
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/inventory/items">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Items
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
            <p className="text-gray-600">SKU: {item.sku}</p>
            {error && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 mt-1">
                Demo Mode - API Unavailable
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Link to={`/inventory/items/${id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleDeleteItem}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-primary" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Current Stock</p>
              <p className="text-2xl font-bold text-gray-900">
                {parseFloat(item.current_stock) || 0} {item.unit_of_measure}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.label}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stockValue)}
              </p>
            </div>
          </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Unit Cost: {formatCurrency(parseFloat(item.unit_cost) || 0)}
              </p>
            </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reorder Point</p>
              <p className="text-2xl font-bold text-gray-900">
                {parseFloat(item.reorder_point) || 0} {item.unit_of_measure}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Min Stock: {parseFloat(item.minimum_stock) || 0} {item.unit_of_measure}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Location</p>
              <p className="text-lg font-bold text-gray-900">
                {item.InventoryLocation?.name}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Code: {item.InventoryLocation?.code}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'movements', label: 'Stock Movements', icon: TrendingUp },
              { id: 'details', label: 'Details', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <p className="mt-1 text-sm text-gray-900">{item.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">SKU</label>
                    <p className="mt-1 text-sm text-gray-900">{item.sku}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Category</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.category}
                      {item.subcategory && ` > ${item.subcategory}`}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Unit of Measure</label>
                    <p className="mt-1 text-sm text-gray-900">{item.unit_of_measure}</p>
                  </div>
                  {item.description && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-500">Description</label>
                      <p className="mt-1 text-sm text-gray-900">{item.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Current Stock</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.current_stock} {item.unit_of_measure}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Minimum Stock</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.minimum_stock} {item.unit_of_measure}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Maximum Stock</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.maximum_stock ? `${item.maximum_stock} ${item.unit_of_measure}` : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Reorder Point</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.reorder_point} {item.unit_of_measure}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Reorder Quantity</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.reorder_quantity} {item.unit_of_measure}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Unit Cost</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(item.unit_cost)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Selling Price</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.selling_price ? formatCurrency(item.selling_price) : 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Total Value</label>
                    <p className="mt-1 text-sm text-gray-900">{formatCurrency(stockValue)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'movements' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Stock Movements</h3>
                <Link to={`/inventory/movements?item_id=${id}`}>
                  <Button variant="outline" size="sm">
                    View All Movements
                  </Button>
                </Link>
              </div>
              
              {movements.length > 0 ? (
                <div className="space-y-3">
                  {movements.map((movement) => (
                    <div key={movement.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getMovementIcon(movement.movement_type)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMovementColor(movement.movement_type)}`}>
                                {movement.movement_type.toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {movement.quantity > 0 ? '+' : ''}{movement.quantity} {item.unit_of_measure}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">{movement.reason}</p>
                            {movement.reference_number && (
                              <p className="text-xs text-gray-400">Ref: {movement.reference_number}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(Math.abs(movement.total_cost || 0))}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(movement.movement_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            by {movement.MovedBy?.first_name} {movement.MovedBy?.last_name}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No stock movements found</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Supplier Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Supplier Name</label>
                    <p className="mt-1 text-sm text-gray-900">{item.supplier_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Supplier Contact</label>
                    <p className="mt-1 text-sm text-gray-900">{item.supplier_contact || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Physical Properties */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Physical Properties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Weight</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.weight ? `${item.weight} kg` : 'Not specified'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Dimensions</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {item.dimensions && (item.dimensions.length || item.dimensions.width || item.dimensions.height)
                        ? `${item.dimensions.length || 0} × ${item.dimensions.width || 0} × ${item.dimensions.height || 0} ${item.dimensions.unit || 'cm'}`
                        : 'Not specified'
                      }
                    </p>
                  </div>
                  {item.barcode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Barcode</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Barcode className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{item.barcode}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking Options */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tracking Options</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.is_serialized ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-900">Serial Number Tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.is_batch_tracked ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="text-sm text-gray-900">Batch Tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.is_active ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-900">Active Item</span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {item.notes && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">{item.notes}</p>
                </div>
              )}

              {/* Timestamps */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Record Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Created</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(item.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoryItemDetail