import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Calendar,
  Eye,
  Plus,
  Search,
  Filter
} from 'lucide-react';

const InventoryDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/inventory/dashboard/stats', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
        return <ArrowUpRight className="h-4 w-4 text-purple-600" />;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">Error loading dashboard: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage your inventory operations</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData?.stats?.totalItems || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600 font-medium">Active inventory</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Locations</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData?.stats?.totalLocations || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Storage facilities</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardData?.stats?.lowStockCount || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            {dashboardData?.stats?.lowStockCount > 0 ? (
              <span className="text-red-600 font-medium">Requires attention</span>
            ) : (
              <span className="text-green-600 font-medium">All items in stock</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(dashboardData?.stats?.totalValue)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Current inventory value</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown and Recent Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dashboardData?.categoryStats?.length > 0 ? (
              dashboardData.categoryStats.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-primary-500"></div>
                    <span className="text-sm font-medium text-gray-900">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{category.count} items</div>
                    <div className="text-xs text-gray-500">{formatCurrency(category.value)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Movements */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Movements</h3>
            <Eye className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {dashboardData?.recentMovements?.length > 0 ? (
              dashboardData.recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getMovementIcon(movement.movement_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {movement.InventoryItem?.name}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementColor(movement.movement_type)}`}>
                        {movement.movement_type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>Qty: {parseFloat(movement.quantity).toLocaleString()}</span>
                      <span>By: {movement.MovedBy?.User?.first_name} {movement.MovedBy?.User?.last_name}</span>
                      <span>{formatDate(movement.movement_date)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ArrowUpRight className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent movements</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 bg-primary-50 hover:bg-blue-100 text-primary-700 px-4 py-3 rounded-lg transition-colors">
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Item</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg transition-colors">
            <MapPin className="h-5 w-5" />
            <span className="font-medium">Manage Locations</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg transition-colors">
            <ArrowUpRight className="h-5 w-5" />
            <span className="font-medium">Stock Movement</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-3 rounded-lg transition-colors">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Low Stock Alert</span>
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {dashboardData?.stats?.lowStockCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Low Stock Alert</h3>
                <p className="text-red-700">
                  {dashboardData.stats.lowStockCount} item(s) are running low on stock
                </p>
              </div>
            </div>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;