import React, { useState } from 'react';
import { Card, Button, Badge, DataTable } from '../../design-system/components';
import { useGetFAQsQuery } from '../../store/api/supportApi';
import { usePageTitle } from '../../hooks/usePageTitle';
import { Plus } from 'lucide-react';

export const FAQ = () => {
  const [filters, setFilters] = useState({ search: '', category: '' });
  const { data: faqs = [], isLoading } = useGetFAQsQuery(filters);

  // Set page title and actions in the top nav bar
  usePageTitle('FAQ Management', [
    <Button key="create" variant="primary" size="sm">
      <Plus className="h-4 w-4 mr-1" />
      Create FAQ
    </Button>
  ]);

  const columns = [
    {
      key: 'question',
      label: 'Question',
      sortable: true,
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.question}</div>
          <div className="text-sm text-gray-600 mt-1 line-clamp-2">{row.answer}</div>
        </div>
      )
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
      key: 'views',
      label: 'Views',
      sortable: true,
      render: (row) => row.views?.toLocaleString() || 0
    },
    {
      key: 'helpful',
      label: 'Helpful',
      sortable: true,
      render: (row) => {
        const total = (row.helpful || 0) + (row.notHelpful || 0);
        const percentage = total > 0 ? Math.round((row.helpful / total) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{percentage}%</span>
            <span className="text-xs text-gray-600">({row.helpful}/{total})</span>
          </div>
        );
      }
    },
    {
      key: 'published',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <Badge variant={row.published ? 'success' : 'neutral'}>
          {row.published ? 'Published' : 'Draft'}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* FAQ Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total FAQs</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {faqs.length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Published</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {faqs.filter(f => f.published).length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Total Views</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {faqs.reduce((sum, f) => sum + (f.views || 0), 0).toLocaleString()}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Avg Helpfulness</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {Math.round(faqs.reduce((sum, f) => {
                const total = (f.helpful || 0) + (f.notHelpful || 0);
                return sum + (total > 0 ? (f.helpful / total) * 100 : 0);
              }, 0) / faqs.length) || 0}%
            </div>
          </div>
        </Card>
      </div>

      <DataTable
        columns={columns}
        data={faqs}
        loading={isLoading}
        searchable
        searchPlaceholder="Search FAQs..."
        onSearch={(value) => setFilters({ ...filters, search: value })}
        pageSize={50}
      />
    </div>
  );
};
