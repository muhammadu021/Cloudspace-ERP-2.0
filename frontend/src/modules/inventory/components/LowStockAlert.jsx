import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Package, 
  MapPin, 
  TrendingDown,
  RefreshCw,
  ShoppingCart,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

const LowStockAlert = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/inventory/reports/low-stock', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch low stock items');
      }

      const data = await response.json();
      setLowStockItems(data.data.items);
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLowStockItems();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount).toLocaleString()}`;
  };

  const getStockStatus = (item) => {
    const currentStock = parseFloat(item.current_stock);
    const minimumStock = parseFloat(item.minimum_stock);
    const reorderPoint = parseFloat(item.reorder_point);

    if (currentStock <= 0) {
      return { 
        status: 'out_of_stock', 
        color: 'bg-red-100 text-red-800 border-red-200', 
        text: 'Out of Stock',
        icon: AlertTriangle,
        iconColor: 'text-red-600'
      };
    } else if (currentStock <= minimumStock) {
      return { 
        status: 'critical', 
        color: 'bg-red-100 text-red-800 border-red-200', 
        text: 'Critical Low',
        icon: AlertTriangle,
        iconColor: 'text-red-600'
      };
    } else if (currentStock <= reorderPoint) {
      return { 
        status: 'low', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: 'Low Stock',
        icon: TrendingDown,
        iconColor: 'text-yellow-600'
      };
    } else {
      return { 
        status: 'good', 
        color: 'bg-green-100 text-green-800 border-green-200', 
        text: 'In Stock',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      };
    }
  };

  const getUrgencyLevel = (item) => {
    const currentStock = parseFloat(item.current_stock);
    const minimumStock = parseFloat(item.minimum_stock);
    
    if (currentStock <= 0) return 'immediate';
    if (currentStock <= minimumStock * 0.5) return 'urgent';
    if (currentStock <= minimumStock) return 'high';
    return 'medium';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'immediate':
        return 'bg-red-600 text-white';
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const calculateReorderSuggestion = (item) => {
    const currentStock = parseFloat(item.current_stock);
    const reorderQuantity = parseFloat(item.reorder_quantity);
    const maximumStock = parseFloat(item.maximum_stock);
    
    if (reorderQuantity > 0) {
      return reorderQuantity;
    }
    
    // Suggest bringing stock to maximum level
    return Math.max(0, maximumStock - currentStock);
  };

  const calculateEstimatedCost = (item) => {
    const suggestedQuantity = calculateReorderSuggestion(item);
    const unitCost = parseFloat(item.unit_cost);
    return suggestedQuantity * unitCost;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading low stock alerts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Low Stock Alerts</h1>
          <p className="text-gray-600 mt-1">Monitor items that need immediate attention</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
            <ShoppingCart className="h-4 w-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Critical Items</p>
              <p className="text-3xl font-bold text-red-900">
                {lowStockItems.filter(item => getUrgencyLevel(item) === 'immediate' || getUrgencyLevel(item) === 'urgent').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-900">{lowStockItems.length}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Estimated Reorder Cost</p>
              <p className="text-3xl font-bold text-blue-900">
                {formatCurrency(lowStockItems.reduce((sum, item) => sum + calculateEstimatedCost(item), 0))}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Categories Affected</p>
              <p className="text-3xl font-bold text-purple-900">
                {new Set(lowStockItems.map(item => item.category)).size}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {lowStockItems.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All items are well stocked!</h3>
            <p className="text-gray-600">No items are currently below minimum stock levels</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Urgency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Minimum Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reorder Suggestion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockItems
                  .sort((a, b) => {
                    const urgencyOrder = { immediate: 0, urgent: 1, high: 2, medium: 3 };
                    return urgencyOrder[getUrgencyLevel(a)] - urgencyOrder[getUrgencyLevel(b)];
                  })
                  .map((item) => {
                    const stockStatus = getStockStatus(item);
                    const urgency = getUrgencyLevel(item);
                    const reorderSuggestion = calculateReorderSuggestion(item);
                    const estimatedCost = calculateEstimatedCost(item);
                    const IconComponent = stockStatus.icon;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(urgency)}`}>
                            {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                          </span>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                              <div className="text-xs text-gray-400">{item.category}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {parseFloat(item.current_stock).toLocaleString()} {item.unit_of_measure}
                          </div>
                          {parseFloat(item.current_stock) <= 0 && (
                            <div className="text-xs text-red-600 font-medium">OUT OF STOCK</div>
                          )}
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {parseFloat(item.minimum_stock).toLocaleString()} {item.unit_of_measure}
                          </div>
                          <div className="text-xs text-gray-500">
                            Reorder at: {parseFloat(item.reorder_point).toLocaleString()}
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
                          <div className="text-sm font-medium text-gray-900">
                            {reorderSuggestion.toLocaleString()} {item.unit_of_measure}
                          </div>
                          <div className="text-xs text-gray-500">
                            Est. Cost: {formatCurrency(estimatedCost)}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                            <IconComponent className={`h-3 w-3 mr-1 ${stockStatus.iconColor}`} />
                            {stockStatus.text}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Recommendations */}
      {lowStockItems.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Recommended Actions</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• <strong>Immediate attention:</strong> {lowStockItems.filter(item => getUrgencyLevel(item) === 'immediate').length} items are out of stock</p>
                <p>• <strong>Urgent reorder:</strong> {lowStockItems.filter(item => getUrgencyLevel(item) === 'urgent').length} items need immediate reordering</p>
                <p>• <strong>Total estimated cost:</strong> {formatCurrency(lowStockItems.reduce((sum, item) => sum + calculateEstimatedCost(item), 0))} for all reorders</p>
                <p>• <strong>Supplier contact:</strong> Review supplier lead times and minimum order quantities</p>
              </div>
              <div className="mt-4 flex space-x-3">
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors text-sm">
                  Generate Purchase Orders
                </button>
                <button className="bg-white text-primary border border-primary px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors text-sm">
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LowStockAlert;