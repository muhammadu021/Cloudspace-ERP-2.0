import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetCustomersQuery } from '../../store/api/salesApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const Customers = () => {
  const navigate = useNavigate();
  const { data: customers = [], isLoading } = useGetCustomersQuery();

  const columns = [
    {
      key: 'name',
      label: 'Customer Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium">
            {row.name.charAt(0)}
          </div>
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'totalOrders', label: 'Orders', sortable: true },
    { key: 'totalSpent', label: 'Total Spent', sortable: true, render: (row) => `$${row.totalSpent?.toLocaleString() || '0'}` },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</Badge>
    }
  ];

  // Set page title and actions in the top nav bar
  usePageTitle('Customers', [
    <Button key="add" variant="primary" size="sm" onClick={() => navigate('/sales/customers/new')}>
      <Plus className="h-4 w-4 mr-1" />
      Add Customer
    </Button>
  ]);

  return (
    <div className="space-y-6">
      <DataTable
        columns={columns}
        data={customers}
        loading={isLoading}
        onRowClick={(customer) => navigate(`/sales/customers/${customer.id}`)}
        searchable
        searchPlaceholder="Search customers..."
        pageSize={50}
      />
    </div>
  );
};
