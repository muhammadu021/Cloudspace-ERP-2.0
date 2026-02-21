import React from 'react';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetMovementsQuery } from '../../store/api/inventoryApi';

export const Movements = () => {
  const { data: movements = [], isLoading } = useGetMovementsQuery();

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'item', label: 'Item', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      filterable: true,
      render: (row) => {
        const variants = { in: 'success', out: 'error', transfer: 'info', adjustment: 'warning' };
        return <Badge variant={variants[row.type]}>{row.type}</Badge>;
      }
    },
    { key: 'quantity', label: 'Quantity', sortable: true, render: (row) => `${row.type === 'in' ? '+' : '-'}${row.quantity}` },
    { key: 'location', label: 'Location', sortable: true, filterable: true },
    { key: 'user', label: 'User', sortable: true },
    { key: 'reference', label: 'Reference', sortable: true }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Stock Movements</h1>
        <Button>Export Report</Button>
      </div>
      <DataTable columns={columns} data={movements} loading={isLoading} searchable pageSize={50} />
    </div>
  );
};
