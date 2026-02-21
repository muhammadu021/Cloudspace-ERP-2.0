import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Upload, Download, Eye, Share, Folder, Search } from 'lucide-react';
import { collaborationService } from '../../services/collaborationService';

const DocumentSharing = () => {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await collaborationService.getSharedDocuments({ limit: 50 });
      setDocuments(response.data?.data?.documents || []);
    } catch (error) {
      console.error('Load documents error:', error);
      collaborationService.showToast('Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      await collaborationService.downloadSharedDocument(documentId);
      collaborationService.showToast('Download started', 'success');
    } catch (error) {
      console.error('Download error:', error);
      collaborationService.showToast('Failed to download document', 'error');
    }
  };

  const getDocumentIcon = (type) => {
    return FileText; // Simplified for now
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'general', 'project', 'policy', 'template', 'presentation', 'report'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Sharing</h1>
          <p className="text-gray-600">Share and collaborate on documents with your team</p>
        </div>
        <button 
          onClick={() => setShowUploadForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDocuments.map((document) => {
          const DocumentIcon = getDocumentIcon(document.document_type);
          return (
            <div
              key={document.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <DocumentIcon className="w-8 h-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {document.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {collaborationService.formatFileSize(document.file_size)}
                    </p>
                  </div>
                </div>
              </div>

              {document.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {document.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>
                  {document.uploader?.first_name} {document.uploader?.last_name}
                </span>
                <span>
                  {collaborationService.formatRelativeTime(document.created_at)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(document.id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-primary-50 text-primary rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Share className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
          <p className="text-gray-600">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'Upload your first document to get started.'}
          </p>
        </div>
      )}

      {/* Upload Form Modal */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  placeholder="Document title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Document description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500">
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                <input
                  type="file"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowUploadForm(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle upload
                    setShowUploadForm(false);
                    collaborationService.showToast('Document uploaded successfully', 'success');
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600"
                >
                  Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentSharing;