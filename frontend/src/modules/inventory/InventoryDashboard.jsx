import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Alert } from '../../design-system/components';
import { useGetInventoryDashboardQuery } from '../../store/api/inventoryApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus, Download, LayoutDashboard, Package, MapPin, TrendingUp, BarChart3 } from 'lucide-react';

export const InventoryDashboard = () => {
  const navigate = useNavigate();
  const { data: dashboard, isLoading } = useGetInventoryDashboardQuery();

  // Set page title only (no actions in navbar)
  usePageTitle('Inventory Dashboard');

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 p-6">
      {/* Navigation Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inventory/items')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Package className="h-3.5 w-3.5" />
          Items
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inventory/items/new')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Item
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inventory/locations')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <MapPin className="h-3.5 w-3.5" />
          Locations
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inventory/movements')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <TrendingUp className="h-3.5 w-3.5" />
          Stock Movements
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inventory/reports')}
          className="flex items-center gap-1 px-3 py-1.5 text-xs whitespace-nowrap"
        >
          <BarChart3 className="h-3.5 w-3.5" />
          Reports
        </Button>
      </div>

      {/* Alerts */}
      {dashboard?.alerts?.length > 0 && (
        <div className="space-y-2">
          {dashboard.alerts.map((alert) => (
            <Alert key={alert.id} type={alert.type}>
              <div className="flex items-center justify-between">
                <span>{alert.message}</span>
                <Button variant="outline" size="sm">{alert.action}</Button>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total Items</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {dashboard?.totalItems || 0}
            </div>
            <div className="text-xs text-gray-600 mt-1">Across all locations</div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-red-600">Low Stock Items</div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {dashboard?.lowStockItems || 0}
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full">View Items</Button>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-red-600">Out of Stock</div>
            <div className="text-2xl font-bold text-red-900 mt-1">
              {dashboard?.outOfStockItems || 0}
            </div>
            <Button variant="outline" size="sm" className="mt-2 w-full">Generate PO</Button>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total Value</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              ${dashboard?.totalValue?.toLocaleString() || '0'}
            </div>
            <div className="text-xs text-gray-600 mt-1">Current inventory</div>
          </div>
        </Card>
      </div>

      {/* Recent Stock Movements */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Stock Movements</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-3">
            {dashboard?.recentMovements?.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{movement.item}</div>
                  <div className="text-sm text-gray-600">
                    {movement.type} • {movement.location} • {new Date(movement.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={movement.type === 'in' ? 'success' : 'error'}>
                    {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                  </Badge>
                  <span className="text-sm text-gray-600">{movement.user}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Low Stock Items */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Items Requiring Attention</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-2">
            {dashboard?.lowStockList?.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-medium text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">SKU: {item.sku}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-600">
                      {item.currentStock} / {item.reorderLevel}
                    </div>
                    <div className="text-xs text-gray-600">Current / Reorder</div>
                  </div>
                  <Button variant="outline" size="sm">Order</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};
