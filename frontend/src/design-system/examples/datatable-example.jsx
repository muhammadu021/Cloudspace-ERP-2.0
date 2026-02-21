/**
 * DataTable Component Examples
 * 
 * Comprehensive examples demonstrating all DataTable features:
 * - Basic table with sorting
 * - Table with filtering
 * - Table with pagination
 * - Table with column visibility toggle
 * - Table with row selection
 * - Custom cell renderers
 * - Loading and empty states
 */

import React, { useState, useMemo } from 'react';
import { DataTable, Badge, Button } from '../components';
import { Edit, Trash2, Eye } from 'lucide-react';

// Sample data
const sampleEmployees = [
  { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering', position: 'Senior Developer', salary: 95000, status: 'active', hireDate: '2020-01-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'Marketing', position: 'Marketing Manager', salary: 85000, status: 'active', hireDate: '2019-03-22' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', department: 'Sales', position: 'Sales Representative', salary: 65000, status: 'active', hireDate: '2021-06-10' },
  { id: 4, name: 'Alice Williams', email: 'alice@example.com', department: 'Engineering', position: 'Junior Developer', salary: 70000, status: 'active', hireDate: '2022-02-01' },
  { id: 5, name: 'Charlie Brown', email: 'charlie@example.com', department: 'HR', position: 'HR Manager', salary: 80000, status: 'on-leave', hireDate: '2018-11-05' },
  { id: 6, name: 'Diana Prince', email: 'diana@example.com', department: 'Finance', position: 'Financial Analyst', salary: 75000, status: 'active', hireDate: '2020-08-17' },
  { id: 7, name: 'Ethan Hunt', email: 'ethan@example.com', department: 'Operations', position: 'Operations Manager', salary: 90000, status: 'active', hireDate: '2019-05-30' },
  { id: 8, name: 'Fiona Green', email: 'fiona@example.com', department: 'Engineering', position: 'Tech Lead', salary: 110000, status: 'active', hireDate: '2017-09-12' },
  { id: 9, name: 'George Miller', email: 'george@example.com', department: 'Sales', position: 'Sales Manager', salary: 95000, status: 'active', hireDate: '2018-04-25' },
  { id: 10, name: 'Hannah Lee', email: 'hannah@example.com', department: 'Marketing', position: 'Content Writer', salary: 60000, status: 'active', hireDate: '2021-10-08' },
  { id: 11, name: 'Ian Malcolm', email: 'ian@example.com', department: 'Engineering', position: 'DevOps Engineer', salary: 88000, status: 'active', hireDate: '2020-12-03' },
  { id: 12, name: 'Julia Roberts', email: 'julia@example.com', department: 'HR', position: 'Recruiter', salary: 65000, status: 'active', hireDate: '2022-01-20' },
];

const sampleProjects = [
  { id: 1, name: 'Website Redesign', status: 'active', priority: 'high', progress: 65, budget: 50000, spent: 32500, manager: 'John Doe', dueDate: '2024-06-30' },
  { id: 2, name: 'Mobile App Development', status: 'active', priority: 'critical', progress: 40, budget: 120000, spent: 48000, manager: 'Jane Smith', dueDate: '2024-08-15' },
  { id: 3, name: 'CRM Integration', status: 'planning', priority: 'medium', progress: 10, budget: 35000, spent: 3500, manager: 'Bob Johnson', dueDate: '2024-09-30' },
  { id: 4, name: 'Security Audit', status: 'completed', priority: 'high', progress: 100, budget: 25000, spent: 24000, manager: 'Alice Williams', dueDate: '2024-03-31' },
  { id: 5, name: 'Data Migration', status: 'on-hold', priority: 'low', progress: 25, budget: 40000, spent: 10000, manager: 'Charlie Brown', dueDate: '2024-12-31' },
];

// Example 1: Basic Table with Sorting
export const BasicTableExample = () => {
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Department',
        accessor: 'department',
      },
      {
        Header: 'Position',
        accessor: 'position',
      },
      {
        Header: 'Salary',
        accessor: 'salary',
        Cell: ({ value }) => `$${value.toLocaleString()}`,
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Basic Table with Sorting</h2>
      <DataTable
        columns={columns}
        data={sampleEmployees}
        enableSorting
        enablePagination
      />
    </div>
  );
};

// Example 2: Table with Filtering
export const FilteringTableExample = () => {
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Department',
        accessor: 'department',
      },
      {
        Header: 'Position',
        accessor: 'position',
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <Badge variant={value === 'active' ? 'success' : 'warning'}>
            {value}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Table with Filtering</h2>
      <DataTable
        columns={columns}
        data={sampleEmployees}
        enableSorting
        enableFiltering
        enablePagination
      />
    </div>
  );
};

// Example 3: Table with Column Visibility
export const ColumnVisibilityExample = () => {
  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Department',
        accessor: 'department',
      },
      {
        Header: 'Position',
        accessor: 'position',
      },
      {
        Header: 'Salary',
        accessor: 'salary',
        Cell: ({ value }) => `$${value.toLocaleString()}`,
      },
      {
        Header: 'Hire Date',
        accessor: 'hireDate',
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Table with Column Visibility Toggle</h2>
      <DataTable
        columns={columns}
        data={sampleEmployees}
        enableSorting
        enablePagination
        enableColumnVisibility
      />
    </div>
  );
};

// Example 4: Table with Row Selection
export const RowSelectionExample = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Department',
        accessor: 'department',
      },
      {
        Header: 'Position',
        accessor: 'position',
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Table with Row Selection</h2>
      {selectedRows.length > 0 && (
        <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm font-medium text-primary-700">
            {selectedRows.length} row(s) selected
          </p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="primary">
              Export Selected
            </Button>
            <Button size="sm" variant="outline">
              Bulk Edit
            </Button>
            <Button size="sm" variant="danger">
              Delete Selected
            </Button>
          </div>
        </div>
      )}
      <DataTable
        columns={columns}
        data={sampleEmployees}
        enableSorting
        enablePagination
        enableRowSelection
        onSelectionChange={setSelectedRows}
      />
    </div>
  );
};

// Example 5: Table with Custom Cell Renderers and Actions
export const CustomCellsExample = () => {
  const handleEdit = (row) => {
    console.log('Edit:', row);
  };

  const handleDelete = (row) => {
    console.log('Delete:', row);
  };

  const handleView = (row) => {
    console.log('View:', row);
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Project',
        accessor: 'name',
        Cell: ({ value }) => (
          <span className="font-medium text-neutral-900">{value}</span>
        ),
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => {
          const variants = {
            active: 'success',
            planning: 'info',
            'on-hold': 'warning',
            completed: 'default',
          };
          return <Badge variant={variants[value]}>{value}</Badge>;
        },
      },
      {
        Header: 'Priority',
        accessor: 'priority',
        Cell: ({ value }) => {
          const variants = {
            critical: 'error',
            high: 'warning',
            medium: 'info',
            low: 'default',
          };
          return <Badge variant={variants[value]}>{value}</Badge>;
        },
      },
      {
        Header: 'Progress',
        accessor: 'progress',
        Cell: ({ value }) => (
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 transition-all"
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-sm text-neutral-600 w-12 text-right">{value}%</span>
          </div>
        ),
      },
      {
        Header: 'Budget',
        accessor: 'budget',
        Cell: ({ value, row }) => {
          const spent = row.original.spent;
          const percentage = (spent / value) * 100;
          return (
            <div className="text-sm">
              <div className="font-medium">${value.toLocaleString()}</div>
              <div className={`text-xs ${percentage > 100 ? 'text-error-600' : 'text-neutral-500'}`}>
                ${spent.toLocaleString()} spent ({percentage.toFixed(0)}%)
              </div>
            </div>
          );
        },
      },
      {
        Header: 'Manager',
        accessor: 'manager',
      },
      {
        Header: 'Due Date',
        accessor: 'dueDate',
      },
      {
        Header: 'Actions',
        accessor: 'id',
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleView(row.original);
              }}
              className="p-1.5 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row.original);
              }}
              className="p-1.5 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.original);
              }}
              className="p-1.5 text-neutral-600 hover:text-error-600 hover:bg-error-50 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Table with Custom Cells and Actions</h2>
      <DataTable
        columns={columns}
        data={sampleProjects}
        enableSorting
        enableFiltering
        enablePagination
        enableColumnVisibility
        onRowClick={(row) => console.log('Row clicked:', row)}
      />
    </div>
  );
};

// Example 6: Loading State
export const LoadingStateExample = () => {
  const [loading, setLoading] = useState(true);

  const columns = useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Email', accessor: 'email' },
      { Header: 'Department', accessor: 'department' },
    ],
    []
  );

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Loading State</h2>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setLoading(!loading)}
        className="mb-4"
      >
        Toggle Loading
      </Button>
      <DataTable
        columns={columns}
        data={sampleEmployees}
        loading={loading}
        enablePagination
      />
    </div>
  );
};

// Example 7: Empty State
export const EmptyStateExample = () => {
  const columns = useMemo(
    () => [
      { Header: 'Name', accessor: 'name' },
      { Header: 'Email', accessor: 'email' },
      { Header: 'Department', accessor: 'department' },
    ],
    []
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Empty State</h2>
      <DataTable
        columns={columns}
        data={[]}
        emptyMessage="No employees found. Add your first employee to get started."
        enablePagination
      />
    </div>
  );
};

// Example 8: All Features Combined
export const CompleteExample = () => {
  const [selectedRows, setSelectedRows] = useState([]);

  const columns = useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Department',
        accessor: 'department',
      },
      {
        Header: 'Position',
        accessor: 'position',
      },
      {
        Header: 'Salary',
        accessor: 'salary',
        Cell: ({ value }) => `$${value.toLocaleString()}`,
      },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <Badge variant={value === 'active' ? 'success' : 'warning'}>
            {value}
          </Badge>
        ),
      },
      {
        Header: 'Hire Date',
        accessor: 'hireDate',
      },
    ],
    []
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Complete Example - All Features</h2>
      <p className="text-neutral-600 mb-6">
        This example demonstrates all DataTable features: sorting, filtering, pagination,
        column visibility, and row selection.
      </p>
      {selectedRows.length > 0 && (
        <div className="mb-4 p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm font-medium text-primary-700">
            {selectedRows.length} employee(s) selected
          </p>
        </div>
      )}
      <DataTable
        columns={columns}
        data={sampleEmployees}
        enableSorting
        enableFiltering
        enablePagination
        enableColumnVisibility
        enableRowSelection
        onSelectionChange={setSelectedRows}
        pagination={{
          pageSize: 5,
          pageSizeOptions: [5, 10, 25, 50],
        }}
      />
    </div>
  );
};

// Main demo component
const DataTableExamples = () => {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-8 px-6">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            DataTable Component Examples
          </h1>
          <p className="text-lg text-neutral-600">
            Comprehensive examples showcasing all DataTable features and capabilities.
          </p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow">
            <BasicTableExample />
          </div>
          <div className="bg-white rounded-lg shadow">
            <FilteringTableExample />
          </div>
          <div className="bg-white rounded-lg shadow">
            <ColumnVisibilityExample />
          </div>
          <div className="bg-white rounded-lg shadow">
            <RowSelectionExample />
          </div>
          <div className="bg-white rounded-lg shadow">
            <CustomCellsExample />
          </div>
          <div className="bg-white rounded-lg shadow">
            <LoadingStateExample />
          </div>
          <div className="bg-white rounded-lg shadow">
            <EmptyStateExample />
          </div>
          <div className="bg-white rounded-lg shadow">
            <CompleteExample />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTableExamples;
