import React, { useState, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  CreditCard,
  ShoppingCart,
  Users,
  Package,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react';
import { API_URL } from '@/services/api';

const SalesReports = () => {
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [statusFilter, setStatusFilter] = useState('all'); // Default to completed
  
  // Report data
  const [dailySales, setDailySales] = useState([]);
  const [summary, setSummary] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalItems: 0,
    averageOrderValue: 0
  });
  const [topProducts, setTopProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'pending', label: 'Pending' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    loadReportData();
  }, [dateRange, activeReport, statusFilter]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Load sales with date and status filter
      const params = new URLSearchParams();
      params.append('company_id', localStorage.getItem('company_id'));
      params.append('start_date', dateRange.startDate);
      params.append('end_date', dateRange.endDate);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', '1000');
      
      console.log('Fetching sales with params:', params.toString());
      
      const salesResponse = await fetch(
        `${API_URL}/sales?${params.toString()}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!salesResponse.ok) {
        throw new Error(`HTTP error! status: ${salesResponse.status}`);
      }
      
      const salesData = await salesResponse.json();
      console.log('Sales data received:', salesData);
      
      if (salesData.success) {
        // Handle both possible response structures
        const sales = salesData.data?.sales || salesData.data || [];
        console.log('Parsed sales:', sales);
        setDailySales(sales);
        
        // Calculate summary
        const totalRevenue = sales.reduce((sum, sale) => {
          const amount = parseFloat(sale.total_amount || 0);
          return sum + amount;
        }, 0);
        
        // Count total items (sum of quantities)
        let totalItems = 0;
        sales.forEach(sale => {
          if (sale.items && Array.isArray(sale.items)) {
            sale.items.forEach(item => {
              totalItems += parseFloat(item.quantity || 0);
            });
          }
        });
        
        setSummary({
          totalSales: sales.length,
          totalRevenue,
          totalItems,
          averageOrderValue: sales.length > 0 ? totalRevenue / sales.length : 0
        });
        
        // Calculate top products
        calculateTopProducts(sales);
        
        // Calculate payment methods breakdown
        calculatePaymentMethods(sales);
      } else {
        console.error('API returned success: false', salesData);
      }
    } catch (error) {
      console.error('Error loading report data:', error);
      alert('Error loading sales data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateTopProducts = (sales) => {
    const productMap = {};
    
    sales.forEach(sale => {
      // Check if sale has items array
      const items = sale.items || [];
      
      items.forEach(item => {
        // Use item_name or name field
        const key = item.item_name || item.name || 'Unknown Product';
        
        if (!productMap[key]) {
          productMap[key] = {
            name: key,
            quantity: 0,
            revenue: 0
          };
        }
        
        // Add quantity and revenue
        const quantity = parseFloat(item.quantity || 0);
        const total = parseFloat(item.total || item.subtotal || 0);
        
        productMap[key].quantity += quantity;
        productMap[key].revenue += total;
      });
    });
    
    // Convert to array and sort by revenue
    const products = Object.values(productMap)
      .filter(p => p.revenue > 0) // Only include products with revenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
    
    console.log('Top products calculated:', products);
    setTopProducts(products);
  };

  const calculatePaymentMethods = (sales) => {
    const methodMap = {};
    
    sales.forEach(sale => {
      const method = (sale.payment_method || 'Not Specified').toLowerCase();
      const displayMethod = method.charAt(0).toUpperCase() + method.slice(1);
      
      if (!methodMap[displayMethod]) {
        methodMap[displayMethod] = {
          method: displayMethod,
          count: 0,
          amount: 0
        };
      }
      
      methodMap[displayMethod].count += 1;
      methodMap[displayMethod].amount += parseFloat(sale.total_amount || 0);
    });
    
    const methods = Object.values(methodMap)
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending
    
    console.log('Payment methods calculated:', methods);
    setPaymentMethods(methods);
  };

  const exportToCSV = () => {
    let csvContent = '';
    
    if (activeReport === 'daily') {
      csvContent = 'Date,Receipt #,Customer,Items,Total,Payment Method,Status\n';
      dailySales.forEach(sale => {
        csvContent += `${new Date(sale.sale_date).toLocaleDateString()},${sale.sale_number},${sale.customer_name || 'Walk-in'},${sale.items?.length || 0},₦${parseFloat(sale.total_amount).toFixed(2)},${sale.payment_method},${sale.status}\n`;
      });
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${dateRange.startDate}-${dateRange.endDate}.csv`;
    a.click();
  };

  const reports = [
    { id: 'daily', name: 'Daily Sales', icon: Calendar },
    { id: 'summary', name: 'Sales Summary', icon: BarChart3 },
    { id: 'products', name: 'Top Products', icon: Package },
    { id: 'payments', name: 'Payment Methods', icon: CreditCard }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Sales Reports</h1>
        <p className="text-gray-600">Analyze your sales performance and trends</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={loadReportData}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={exportToCSV}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Sales</span>
            <ShoppingCart className="h-5 w-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{summary.totalSales}</div>
          <div className="text-xs text-gray-500 mt-1">Transactions</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Revenue</span>
            <CreditCard className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            ₦{summary.totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total earnings</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Items Sold</span>
            <Package className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{summary.totalItems}</div>
          <div className="text-xs text-gray-500 mt-1">Total items</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Avg Order Value</span>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-800">
            ₦{summary.averageOrderValue.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-500 mt-1">Per transaction</div>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {reports.map(report => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap flex items-center gap-2 border-b-2 transition-colors ${
                    activeReport === report.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {report.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* Daily Sales Report */}
          {activeReport === 'daily' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Daily Sales Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Receipt #</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Items Purchased</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Payment</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailySales.length > 0 ? (
                      dailySales.map(sale => (
                        <tr key={sale.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(sale.sale_date).toLocaleDateString('en-NG')}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">
                            {sale.sale_number}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {sale.customer_name || 'Walk-in Customer'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {sale.items && sale.items.length > 0 ? (
                              <div className="space-y-1">
                                {sale.items.map((item, idx) => (
                                  <div key={idx} className="text-xs">
                                    <span className="font-medium">{item.item_name}</span>
                                    <span className="text-gray-500"> x{item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No items</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800 text-right">
                            ₦{parseFloat(sale.total_amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 uppercase">
                            {sale.payment_method}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              sale.status === 'completed' ? 'bg-green-100 text-green-800' :
                              sale.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="py-8 text-center text-gray-500">
                          No sales data for selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sales Summary Report */}
          {activeReport === 'summary' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Sales Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Overview</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Transactions:</span>
                      <span className="font-semibold">{summary.totalSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Revenue:</span>
                      <span className="font-semibold">₦{summary.totalRevenue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items Sold:</span>
                      <span className="font-semibold">{summary.totalItems}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Average Order:</span>
                      <span className="font-semibold">₦{summary.averageOrderValue.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Period</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start Date:</span>
                      <span className="font-semibold">{new Date(dateRange.startDate).toLocaleDateString('en-NG')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End Date:</span>
                      <span className="font-semibold">{new Date(dateRange.endDate).toLocaleDateString('en-NG')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Days:</span>
                      <span className="font-semibold">
                        {Math.ceil((new Date(dateRange.endDate) - new Date(dateRange.startDate)) / (1000 * 60 * 60 * 24)) + 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Products Report */}
          {activeReport === 'products' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Product</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Quantity Sold</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.length > 0 ? (
                      topProducts.map((product, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-600">#{index + 1}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800">{product.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">{product.quantity}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800 text-right">
                            ₦{product.revenue.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500">
                          No product data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Methods Report */}
          {activeReport === 'payments' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Methods Breakdown</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Payment Method</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Transactions</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Total Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMethods.length > 0 ? (
                      paymentMethods.map((method, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-800 uppercase">{method.method}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">{method.count}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-800 text-right">
                            ₦{method.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">
                            {summary.totalRevenue > 0 ? ((method.amount / summary.totalRevenue) * 100).toFixed(1) : 0}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-gray-500">
                          No payment data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReports;
