import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetOrdersQuery } from '../../store/api/salesApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const Orders = () => {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useGetOrdersQuery();

  const columns = [
    { key: 'orderNumber', label: 'Order #', sortable: true },
    { key: 'customer', label: 'Customer', sortable: true },
    { key: 'date', label: 'Date', sortable: true, render: (row) => new Date(row.date).toLocaleDateString() },
    { key: 'items', label: 'Items', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (row) => `$${row.amount?.toLocaleString() || '0'}` },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (row) => {
        const variants = { pending: 'warning', processing: 'info', completed: 'success', cancelled: 'error' };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    }
  ];

  // Set page title and actions in the top nav bar
  usePageTitle('Orders', [
    <Button key="create" variant="primary" size="sm" onClick={() => navigate('/sales/orders/new')}>
      <Plus className="h-4 w-4 mr-1" />
      Create Order
    </Button>
  ]);

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={orders} loading={isLoading} searchable pageSize={50} />
    </div>
  );
};
