import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetTicketsQuery, useBulkTicketOperationMutation } from '../../store/api/supportApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const Tickets = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', priority: '', status: '', category: '' });
  const [selectedTickets, setSelectedTickets] = useState([]);
  const { data: tickets = [], isLoading } = useGetTicketsQuery(filters);
  const [bulkOperation] = useBulkTicketOperationMutation();

  // Set page title and actions in the top nav bar
  usePageTitle('Support Tickets', [
    <Button key="create" variant="primary" size="sm" onClick={() => navigate('/support/tickets/new')}>
      <Plus className="h-4 w-4 mr-1" />
      Create Ticket
    </Button>
  ]);

  const columns = [
    {
      key: 'ticketNumber',
      label: 'Ticket #',
      sortable: true,
      width: '100px'
    },
    {
      key: 'subject',
      label: 'Subject',
      sortable: true
    },
    {
      key: 'customer',
      label: 'Customer',
      sortable: true
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant="info">{row.category}</Badge>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant={
          row.priority === 'urgent' ? 'error' :
          row.priority === 'high' ? 'warning' :
          row.priority === 'medium' ? 'info' : 'default'
        }>
          {row.priority}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant={
          row.status === 'resolved' ? 'success' :
          row.status === 'open' ? 'warning' :
          row.status === 'closed' ? 'neutral' : 'default'
        }>
          {row.status}
        </Badge>
      )
    },
    {
      key: 'assignedTo',
      label: 'Assigned To',
      sortable: true
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString()
    }
  ];

  const handleBulkOperation = async (operation) => {
    if (selectedTickets.length === 0) return;
    await bulkOperation({ ticketIds: selectedTickets, operation });
    setSelectedTickets([]);
  };

  const handleRowClick = (ticket) => {
    navigate(`/support/tickets/${ticket.id}`);
  };

  return (
    <div className="space-y-6">
      {selectedTickets.length > 0 && (
        <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm font-medium text-gray-900">
            {selectedTickets.length} ticket(s) selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={() => handleBulkOperation('assign')}>
              Assign
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkOperation('change_priority')}>
              Change Priority
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleBulkOperation('close')}>
              Close
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={tickets}
        loading={isLoading}
        onRowClick={handleRowClick}
        searchable
        searchPlaceholder="Search tickets..."
        onSearch={(value) => setFilters({ ...filters, search: value })}
        selectable
        selectedRows={selectedTickets}
        onSelectionChange={setSelectedTickets}
        pageSize={50}
      />
    </div>
  );
};
