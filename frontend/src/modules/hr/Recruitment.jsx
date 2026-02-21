import React from 'react';
import { DataTable, Button, Badge } from '../../design-system/components';
import { useGetJobPostingsQuery } from '../../store/api/hrApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const Recruitment = () => {
  const { data: jobs = [], isLoading } = useGetJobPostingsQuery();

  const columns = [
    { key: 'title', label: 'Job Title', sortable: true },
    { key: 'department', label: 'Department', sortable: true, filterable: true },
    { key: 'location', label: 'Location', sortable: true },
    { key: 'applicants', label: 'Applicants', sortable: true },
    { key: 'postedDate', label: 'Posted', sortable: true, render: (row) => new Date(row.postedDate).toLocaleDateString() },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const variants = { open: 'success', closed: 'neutral', draft: 'warning' };
        return <Badge variant={variants[row.status]}>{row.status}</Badge>;
      }
    }
  ];

  // Set page title and actions in the top nav bar
  usePageTitle('Job Postings', [
    <Button key="create" variant="primary" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Create Job Posting
    </Button>
  ]);

  return (
    <div className="space-y-6">
      <DataTable columns={columns} data={jobs} loading={isLoading} pageSize={50} />
    </div>
  );
};
