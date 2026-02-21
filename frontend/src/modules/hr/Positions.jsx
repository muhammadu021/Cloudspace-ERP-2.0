import React from 'react';
import { DataTable, Button } from '../../design-system/components';
import { useGetPositionsQuery } from '../../store/api/hrApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const Positions = () => {
  const { data: positions = [], isLoading } = useGetPositionsQuery();

  const columns = [
    { key: 'title', label: 'Position Title', sortable: true },
    { key: 'department', label: 'Department', sortable: true, filterable: true },
    { key: 'level', label: 'Level', sortable: true },
    { key: 'employeeCount', label: 'Employees', sortable: true },
    { key: 'salaryRange', label: 'Salary Range', sortable: true }
  ];

  // Set page title and actions in the top nav bar
  usePageTitle('Positions', [
    <Button key="add" variant="primary" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Add Position
    </Button>
  ]);

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={positions} loading={isLoading} pageSize={50} />
    </div>
  );
};
