import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  ArrowRightLeft,
  Search, 
  Filter, 
  Plus,
  Calendar,
  Package,
  MapPin,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
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
    item_id: '',
    movement_type: '',
    location_id: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    fetchMovements();
    fetchItems();
    fetchLocations();
  }, [pagination.currentPage, filters]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
      });

      const response = await fetch(`/api/v1/inventory/movements?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch movements');
      }

      const data = await response.json();
      setMovements(data.data.movements);
      setPagination(data.data.pagination);
    } catch (error) {
      console.error('Error fetching movements:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/v1/inventory/items?limit=1000', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.data.items);
    } catch (error) {
      console.error('Error fetching items:', error);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'in':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'out':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'adjustment':
        return <BarChart3 className="h-4 w-4 text-primary" />;
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-purple-600" />;
      default:
        return <Package className="h-4 w-4 text-gray-600" />;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'in':
        return 'bg-green-100 text-green-800';
      case 'out':
        return 'bg-red-100 text-red-800';
      case 'adjustment':
        return 'bg-blue-100 text-blue-800';
      case 'transfer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementDescription = (movement) => {
    switch (movement.movement_type) {
      case 'in':
        return `Stock received at ${movement.ToLocation?.name}`;
      case 'out':
        return `Stock issued from ${movement.FromLocation?.name}`;
      case 'adjustment':
        return `Stock adjustment at ${movement.ToLocation?.name}`;
      case 'transfer':
        return `Transfer from ${movement.FromLocation?.name} to ${movement.ToLocation?.name}`;
      default:
        return 'Stock movement';
    }
  };

  if (loading && movements.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading movements...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Stock Movements</h1>
          <p className="text-gray-600 mt-1">Track all inventory movements and transactions</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Movement</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Item Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Item</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
              value={filters.item_id}
              onChange={(e) => handleFilterChange('item_id', e.target.value)}
            >
              <option value="">All Items</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>{item.name} ({item.sku})</option>
              ))}
            </select>
          </div>

          {/* Movement Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Movement Type</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
              value={filters.movement_type}
              onChange={(e) => handleFilterChange('movement_type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="in">Stock In</option>
              <option value="out">Stock Out</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
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
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
            />
          </div>
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

      {/* Movements List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Movement Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Moved By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movements.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <ArrowUpRight className="h-12 w-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No movements found</h3>
                      <p className="text-gray-500">No stock movements match your current filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getMovementIcon(movement.movement_type)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementColor(movement.movement_type)}`}>
                              {movement.movement_type.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {getMovementDescription(movement)}
                          </div>
                          {movement.reason && (
                            <div className="text-xs text-gray-400 mt-1">
                              Reason: {movement.reason}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {movement.InventoryItem?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            SKU: {movement.InventoryItem?.sku}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {parseFloat(movement.quantity).toLocaleString()}
                      </div>
                      {movement.batch_number && (
                        <div className="text-xs text-gray-500">
                          Batch: {movement.batch_number}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {movement.movement_type === 'transfer' ? (
                          <div>
                            <div className="flex items-center text-red-600">
                              <ArrowDownRight className="h-3 w-3 mr-1" />
                              {movement.FromLocation?.name}
                            </div>
                            <div className="flex items-center text-green-600 mt-1">
                              <ArrowUpRight className="h-3 w-3 mr-1" />
                              {movement.ToLocation?.name}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                            {movement.ToLocation?.name || movement.FromLocation?.name}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(movement.unit_cost)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Total: {formatCurrency(movement.total_cost)}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {movement.MovedBy?.User?.first_name} {movement.MovedBy?.User?.last_name}
                        </div>
                      </div>
                      {movement.MovedBy?.position && (
                        <div className="text-xs text-gray-500">
                          {movement.MovedBy.position}
                        </div>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {formatDate(movement.movement_date)}
                      </div>
                      {movement.reference_number && (
                        <div className="text-xs text-gray-500">
                          Ref: {movement.reference_number}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
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

export default StockMovements;