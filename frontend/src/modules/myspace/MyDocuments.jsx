import React, { useState } from 'react';
import { Card, DataTable, Badge, Button } from '../../design-system/components';
import { useGetMyDocumentsQuery, useDownloadDocumentMutation } from '../../store/api/mySpaceApi';

const MyDocuments = () => {
  const [filters, setFilters] = useState({ category: '' });
  const { data: documents = [], isLoading } = useGetMyDocumentsQuery(filters);
  const [downloadDocument] = useDownloadDocumentMutation();

  const handleDownload = async (documentId, filename) => {
    try {
      const blob = await downloadDocument(documentId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Document Name',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {row.type === 'pdf' ? '📄' : 
             row.type === 'doc' ? '📝' : 
             row.type === 'xls' ? '📊' : '📎'}
          </span>
          <span className="font-medium">{row.name}</span>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      render: (row) => (
        <Badge variant="default">
          {row.category}
        </Badge>
      )
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => new Date(row.date).toLocaleDateString()
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      render: (row) => {
        const kb = row.size / 1024;
        return kb > 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(2)} KB`;
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDownload(row.id, row.name)}
          >
            Download
          </Button>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-sm text-gray-600 mt-1">
            Access your personal documents and files
          </p>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex gap-2">
        <Button 
          variant={filters.category === '' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilters({ category: '' })}
        >
          All Documents
        </Button>
        <Button 
          variant={filters.category === 'payslips' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilters({ category: 'payslips' })}
        >
          Payslips
        </Button>
        <Button 
          variant={filters.category === 'contracts' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilters({ category: 'contracts' })}
        >
          Contracts
        </Button>
        <Button 
          variant={filters.category === 'certificates' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilters({ category: 'certificates' })}
        >
          Certificates
        </Button>
        <Button 
          variant={filters.category === 'tax' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilters({ category: 'tax' })}
        >
          Tax Documents
        </Button>
      </div>

      <Card>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={documents}
            loading={isLoading}
            searchable
            searchPlaceholder="Search documents..."
            pageSize={20}
          />
        </div>
      </Card>

      {/* Document Categories Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Payslips</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {documents.filter(d => d.category === 'payslips').length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Contracts</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {documents.filter(d => d.category === 'contracts').length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Certificates</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {documents.filter(d => d.category === 'certificates').length}
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-4">
            <div className="text-sm text-gray-600">Tax Documents</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              {documents.filter(d => d.category === 'tax').length}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyDocuments;
