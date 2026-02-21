import React from 'react';
import { DataTable, Button } from '../../design-system/components';
import { useGetDepartmentsQuery } from '../../store/api/hrApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const Departments = () => {
  const { data: departments = [], isLoading } = useGetDepartmentsQuery();

  const columns = [
    { key: 'name', label: 'Department Name', sortable: true },
    { key: 'manager', label: 'Manager', sortable: true },
    { key: 'employeeCount', label: 'Employees', sortable: true },
    { key: 'budget', label: 'Budget', sortable: true, render: (row) => `$${row.budget?.toLocaleString() || 0}` },
    { key: 'location', label: 'Location', sortable: true }
  ];

  // Set page title and actions in the top nav bar
  usePageTitle('Departments', [
    <Button key="add" variant="primary" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Add Department
    </Button>
  ]);

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={departments} loading={isLoading} pageSize={50} />
    </div>
  );
};
