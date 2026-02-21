import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  MapPin,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Items = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location_id: '',
    status: '',
    low_stock: false,
    sortBy: 'created_at',
    sortOrder: 'DESC'
  });

  useEffect(() => {
    fetchItems();
    fetchLocations();
  }, [pagination.currentPage, filters]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== false))
      });

      const response = await fetch(`/api/v1/inventory/items?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.data.items);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching items:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStockStatus = (item) => {
    const currentStock = parseFloat(item.current_stock);
    const minimumStock = parseFloat(item.minimum_stock);
    const reorderPoint = parseFloat(item.reorder_point);

    if (currentStock <= minimumStock) {
      return { status: 'critical', color: 'bg-red-100 text-red-800', text: 'Critical' };
    } else if (currentStock <= reorderPoint) {
      return { status: 'low', color: 'bg-yellow-100 text-yellow-800', text: 'Low Stock' };
    } else {
      return { status: 'good', color: 'bg-green-100 text-green-800', text: 'In Stock' };
    }
  };

  const categories = [
    'Electronics', 'Hardware', 'Software', 'Office Supplies', 'Furniture', 
    'Equipment', 'Tools', 'Materials', 'Components', 'Other'
  ];

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Items</h1>
          <p className="text-gray-600 mt-1">Manage your inventory items and stock levels</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          {/* Location Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
            value={filters.location_id}
            onChange={(e) => handleFilterChange('location_id', e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>{location.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Additional Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.low_stock}
              onChange={(e) => handleFilterChange('low_stock', e.target.checked)}
              className="mr-2 text-primary focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Show only low stock items</span>
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No items found</h3>
                      <p className="text-gray-500">No inventory items match your current filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                            {item.description && (
                              <div className="text-xs text-gray-400 max-w-xs truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.category}</div>
                        {item.subcategory && (
                          <div className="text-sm text-gray-500">{item.subcategory}</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {parseFloat(item.current_stock).toLocaleString()} {item.unit_of_measure}
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {parseFloat(item.minimum_stock).toLocaleString()} | 
                          Max: {parseFloat(item.maximum_stock).toLocaleString()}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {item.InventoryLocation?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.InventoryLocation?.code}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          {formatCurrency(item.unit_cost)}
                        </div>
                        {item.selling_price && (
                          <div className="text-xs text-gray-500">
                            Sell: {formatCurrency(item.selling_price)}
                          </div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </span>
                        {!item.is_active && (
                          <div className="text-xs text-red-500 mt-1">Inactive</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-primary hover:text-blue-900 p-1 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Edit Item"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                            title="Stock Adjustment"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">
                    {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                  </span>{' '}
                  to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium">{pagination.totalItems}</span>{' '}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.currentPage === i + 1
                          ? 'z-10 bg-primary-50 border-blue-500 text-primary'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;