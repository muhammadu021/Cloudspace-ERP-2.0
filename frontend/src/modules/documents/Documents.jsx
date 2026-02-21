import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DocumentManagement from './DocumentManagement';
import DocumentAccessControl from './EnhancedDocumentManagement';

const Documents = () => {
  return (
    <Routes>
      <Route index element={<DocumentManagement />} />
      <Route path="dashboard" element={<DocumentManagement />} />
      <Route path="library" element={<DocumentManagement />} />
      <Route path="access-control" element={<DocumentAccessControl />} />
    </Routes>
  );
};

export default Documents;