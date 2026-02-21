import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../../design-system/components';
import { useGetSalesDashboardQuery } from '../../store/api/salesApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus, Download, TrendingUp, LayoutDashboard, ShoppingCart, Receipt, Users, BarChart3 } from 'lucide-react';

export const SalesDashboard = () => {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useGetSalesDashboardQuery();

  // Set page title only (no actions in navbar)
  usePageTitle('Sales Dashboard');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-6">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/pos')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Point of Sale
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/orders')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Receipt className="h-3.5 w-3.5" />
          Sales Orders
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/leads')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Leads
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/customers')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Users className="h-3.5 w-3.5" />
          Customers
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/sales/reports')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Reports
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total Sales (MTD)</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ${dashboard?.totalSales?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-green-600 mt-1">+15.3% vs last month</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Pipeline Value</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ${dashboard?.pipelineValue?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-blue-600 mt-1">{dashboard?.pipelineCount || 0} opportunities</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Conversion Rate</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.conversionRate || '0'}%
            </div>
            <div className="text-xs text-green-600 mt-1">+2.1% vs last month</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Active Customers</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.activeCustomers || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">This month</div>
          </div>
        </Card>
      </div>

      {/* Top Customers */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Customers</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {dashboard?.topCustomers?.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  <div className="text-sm text-gray-600">{customer.orders} orders</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${customer.totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total spent</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-2">
            {dashboard?.recentOrders?.map((order) => (
              <div key={order.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-medium text-gray-900">{order.orderNumber}</div>
                  <div className="text-sm text-gray-600">{order.customer}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${order.amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
