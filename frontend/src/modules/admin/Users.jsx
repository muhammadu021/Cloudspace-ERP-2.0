import React, { useState } from 'react';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetUsersQuery, useBulkUserOperationMutation } from '../../store/api/adminApi';

export const Users = () => {
  const [filters, setFilters] = useState({ search: '', role: '', status: '' });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { data: users = [], isLoading } = useGetUsersQuery(filters);
  const [bulkOperation] = useBulkUserOperationMutation();

  const columns = [
    {
      accessor: 'name',
      Header: 'Name',
      sortable: true,
      Cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium">
            {row.original.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-gray-600">{row.original.email}</div>
          </div>
        </div>
      )
    },
    {
      accessor: 'role',
      Header: 'Role',
      sortable: true,
      filterable: true,
      Cell: ({ value }) => (
        <Badge variant="info">{value}</Badge>
      )
    },
    {
      accessor: 'department',
      Header: 'Department',
      sortable: true,
      filterable: true
    },
    {
      accessor: 'status',
      Header: 'Status',
      sortable: true,
      filterable: true,
      Cell: ({ value }) => (
        <Badge variant={value === 'active' ? 'success' : 'neutral'}>
          {value}
        </Badge>
      )
    },
    {
      accessor: 'lastLogin',
      Header: 'Last Login',
      sortable: true,
      Cell: ({ value }) => value ? new Date(value).toLocaleString() : 'Never'
    }
  ];

  const handleBulkOperation = async (operation) => {
    if (selectedUsers.length === 0) return;
    await bulkOperation({ userIds: selectedUsers, operation });
    setSelectedUsers([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage system users and access control
          </p>
        </div>
        <Button>Add User</Button>
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-gray-900">
            {selectedUsers.length} user(s) selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => handleBulkOperation('assign_role')}>
              Assign Role
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkOperation('deactivate')}>
              Deactivate
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkOperation('send_email')}>
              Send Email
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        enableRowSelection
        onSelectionChange={setSelectedUsers}
        enablePagination
        pagination={{ pageSize: 50 }}
      />
    </div>
  );
};
