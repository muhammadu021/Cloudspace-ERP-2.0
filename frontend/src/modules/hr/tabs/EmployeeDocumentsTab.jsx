import React from 'react';
import { Button, Badge } from '../../../design-system/components';
import { useGetEmployeeDocumentsQuery } from '../../../store/api/hrApi';

export const EmployeeDocumentsTab = ({ employee }) => {
  const { data: documents = [], isLoading } = useGetEmployeeDocumentsQuery(employee.id);

  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <Button>Upload Document</Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No documents uploaded yet</p>
          <Button variant="outline" className="mt-4">
            Upload First Document
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{doc.name}</div>
                  <div className="text-sm text-gray-600">
                    {doc.type} • {doc.size} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={doc.verified ? 'success' : 'warning'}>
                  {doc.verified ? 'Verified' : 'Pending'}
                </Badge>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
