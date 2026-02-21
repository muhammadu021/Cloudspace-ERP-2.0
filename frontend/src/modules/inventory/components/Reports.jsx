import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Download,
  Calendar,
  Filter,
  AlertTriangle,
  Package,
  MapPin,
  FileText,
  Eye
} from 'lucide-react';

const Reports = () => {
  const [activeReport, setActiveReport] = useState('low-stock');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    movement_type: '',
    category: ''
  });

  const reports = [
    {
      id: 'low-stock',
      name: 'Low Stock Report',
      description: 'Items below minimum stock level',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      id: 'valuation',
      name: 'Stock Valuation Report',
      description: 'Current stock value by category',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'movements',
      name: 'Stock Movement Report',
      description: 'Inventory transactions over time',
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-blue-100'
    }
  ];

  useEffect(() => {
    fetchReportData();
  }, [activeReport, filters]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = `/api/v1/inventory/reports/${activeReport}`;
      
      // Add filters for movement report
      if (activeReport === 'movements') {
        const params = new URLSearchParams(
          Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
        );
        if (params.toString()) {
          url += `?${params}`;
        }
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch report data');
      }

      const data = await response.json();
      setReportData(data.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const formatCurrency = (amount) => {
    return `₦${parseFloat(amount || 0).toLocaleString()}`;
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

  const renderLowStockReport = () => {
    if (!reportData?.items || reportData.items.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-green-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">All items are well stocked!</h3>
          <p className="text-gray-500">No items are currently below minimum stock levels</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
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
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.items.map((item) => {
              const stockStatus = getStockStatus(item);
              return (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {parseFloat(item.current_stock).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {parseFloat(item.minimum_stock).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      {item.InventoryLocation?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
                      {stockStatus.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderValuationReport = () => {
    if (!reportData?.valuation || reportData.valuation.length === 0) {
      return (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No valuation data available</h3>
          <p className="text-gray-500">Add items to your inventory to see valuation reports</p>
        </div>
      );
    }

    const totalValue = reportData.valuation.reduce((sum, cat) => sum + parseFloat(cat.total_value || 0), 0);

    return (
      <div className="space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Total Inventory Value</h3>
              <p className="text-3xl font-bold mt-2">{formatCurrency(totalValue)}</p>
            </div>
            <DollarSign className="h-12 w-12 opacity-80" />
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportData.valuation.map((category, index) => {
            const percentage = totalValue > 0 ? (parseFloat(category.total_value) / totalValue * 100) : 0;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{category.category}</h4>
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-medium">{category.item_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{parseFloat(category.total_quantity || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Value:</span>
                    <span className="font-medium">{formatCurrency(category.total_value)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Percentage:</span>
                    <span className="font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMovementReport = () => {
    if (!reportData?.movements || reportData.movements.length === 0) {
      return (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No movements found</h3>
          <p className="text-gray-500">No stock movements match your current filters</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moved By
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reportData.movements.map((movement) => (
              <tr key={movement.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                    {formatDate(movement.movement_date)}
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
                        {movement.InventoryItem?.sku}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    movement.movement_type === 'in' ? 'bg-green-100 text-green-800' :
                    movement.movement_type === 'out' ? 'bg-red-100 text-red-800' :
                    movement.movement_type === 'adjustment' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {movement.movement_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {parseFloat(movement.quantity).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(movement.total_cost)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {movement.MovedBy?.User?.first_name} {movement.MovedBy?.User?.last_name}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600">Loading report...</span>
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

    switch (activeReport) {
      case 'low-stock':
        return renderLowStockReport();
      case 'valuation':
        return renderValuationReport();
      case 'movements':
        return renderMovementReport();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your inventory data and trends</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`p-6 rounded-xl border-2 transition-all text-left ${
                activeReport === report.id
                  ? 'border-blue-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${report.bgColor}`}>
                  <IconComponent className={`h-6 w-6 ${report.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-600">{report.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters for Movement Report */}
      {activeReport === 'movements' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                <option value="Electronics">Electronics</option>
                <option value="Hardware">Hardware</option>
                <option value="Software">Software</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {reports.find(r => r.id === activeReport)?.name}
          </h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Generated: {new Date().toLocaleString()}</span>
          </div>
        </div>
        
        {renderReportContent()}
      </div>
    </div>
  );
};

export default Reports;