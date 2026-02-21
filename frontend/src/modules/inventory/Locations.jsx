import React from 'react';
import { DataTable, Button } from '../../design-system/components';
import { useGetLocationsQuery } from '../../store/api/inventoryApi';

export const Locations = () => {
  const { data: locations = [], isLoading } = useGetLocationsQuery();

  const columns = [
    { key: 'code', label: 'Location Code', sortable: true, width: '120px' },
    { key: 'name', label: 'Location Name', sortable: true },
    { key: 'type', label: 'Type', sortable: true, filterable: true },
    { key: 'itemCount', label: 'Items', sortable: true },
    { key: 'capacity', label: 'Capacity', sortable: true },
    { key: 'utilization', label: 'Utilization', sortable: true, render: (row) => `${row.utilization}%` }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Warehouse Locations</h1>
        <Button>Add Location</Button>
      </div>
      <DataTable columns={columns} data={locations} loading={isLoading} searchable pageSize={50} />
    </div>
  );
};
