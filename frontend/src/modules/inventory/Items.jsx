import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Button, Badge, Modal } from '../../design-system/components';
import { useGetItemsQuery, useAdjustStockMutation } from '../../store/api/inventoryApi';

export const Items = () => {
  const navigate = useNavigate();
  const { data: items = [], isLoading } = useGetItemsQuery();
  const [adjustStock] = useAdjustStockMutation();
  const [adjustModal, setAdjustModal] = useState(null);

  const handleAdjust = async (data) => {
    await adjustStock({ id: adjustModal.id, ...data });
    setAdjustModal(null);
  };

  const columns = [
    { key: 'sku', label: 'SKU', sortable: true, width: '120px' },
    { key: 'name', label: 'Item Name', sortable: true },
    { key: 'category', label: 'Category', sortable: true, filterable: true },
    { key: 'currentStock', label: 'Stock', sortable: true },
    { key: 'reorderLevel', label: 'Reorder Level', sortable: true },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        if (row.currentStock === 0) return <Badge variant="error">Out of Stock</Badge>;
        if (row.currentStock <= row.reorderLevel) return <Badge variant="warning">Low Stock</Badge>;
        return <Badge variant="success">In Stock</Badge>;
      }
    },
    { key: 'unitPrice', label: 'Unit Price', sortable: true, render: (row) => `$${row.unitPrice?.toFixed(2) || '0.00'}` },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Button variant="outline" size="sm" onClick={() => setAdjustModal(row)}>
          Adjust
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Items</h1>
        <Button onClick={() => navigate('/inventory/items/new')}>Add Item</Button>
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={isLoading}
        onRowClick={(item) => navigate(`/inventory/items/${item.id}`)}
        searchable
        searchPlaceholder="Search by SKU, name, or category..."
        pageSize={50}
      />

      {/* Quick Adjust Modal */}
      {adjustModal && (
        <Modal
          isOpen={!!adjustModal}
          onClose={() => setAdjustModal(null)}
          title="Adjust Stock"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
              <div className="text-gray-900">{adjustModal.name}</div>
              <div className="text-sm text-gray-600">Current Stock: {adjustModal.currentStock}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                <option value="add">Add Stock</option>
                <option value="remove">Remove Stock</option>
                <option value="set">Set to Quantity</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows="3" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAdjustModal(null)}>Cancel</Button>
              <Button onClick={handleAdjust}>Adjust Stock</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
