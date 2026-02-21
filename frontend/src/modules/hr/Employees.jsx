import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetEmployeesQuery } from '../../store/api/hrApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const Employees = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    position: ''
  });

  const { data: employees = [], isLoading } = useGetEmployeesQuery(filters);

  const columns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
      sortable: true,
      width: '120px'
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
            {row.name.charAt(0)}
          </div>
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'department',
      label: 'Department',
      sortable: true,
      filterable: true
    },
    {
      key: 'position',
      label: 'Position',
      sortable: true,
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant={row.status === 'active' ? 'success' : 'neutral'}>
          {row.status}
        </Badge>
      )
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      sortable: true,
      render: (row) => new Date(row.joinDate).toLocaleDateString()
    }
  ];

  const handleRowClick = (employee) => {
    navigate(`/hr/employees/${employee.id}`);
  };

  // Set page title only (no actions in navbar)
  usePageTitle('Employee Directory');

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Manage employee information and records
      </p>

      <DataTable
        columns={columns}
        data={employees}
        loading={isLoading}
        onRowClick={handleRowClick}
        searchable
        searchPlaceholder="Search employees..."
        onSearch={(value) => setFilters({ ...filters, search: value })}
        pageSize={50}
      />
    </div>
  );
};
