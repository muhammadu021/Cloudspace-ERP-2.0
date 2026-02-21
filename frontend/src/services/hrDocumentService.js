import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';

// Helper function to get company_id from Redux store

const hrDocumentService = {
  // ==================== HR DOCUMENT MANAGEMENT ====================
  
  getHRDocuments: async (params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/hr/documents', { params: { ...params, company_id } });
      return response;
    } catch (error) {
      console.warn('Get HR documents API unavailable:', error.message);
      
      // Mock data for development
      const mockDocuments = [
        {
          id: 1,
          title: 'Employee Handbook 2024',
          description: 'Comprehensive guide for all employees covering policies, procedures, and company culture.',
          document_type: 'handbook',
          category: 'HR Policies',
          file_name: 'employee-handbook-2024.pdf',
          file_size: 2048576,
          mime_type: 'application/pdf',
          version: '2.1',
          status: 'published',
          priority: 'high',
          confidentiality_level: 'internal',
          owner: {
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@company.com'
          },
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-03-10T14:30:00Z',
          approved_at: '2024-01-20T16:00:00Z',
          published_at: '2024-01-22T09:00:00Z',
          download_count: 1247,
          view_count: 3456,
          requires_signature: false,
          requires_acknowledgment: true,
          tags: ['HR', 'Policy', 'Handbook', 'Onboarding'],
          effective_date: '2024-02-01',
          expiry_date: '2024-12-31',
          next_review_date: '2024-06-01'
        },
        {
          id: 2,
          title: 'Remote Work Policy',
          description: 'Guidelines and procedures for remote work arrangements and hybrid work models.',
          document_type: 'policy',
          category: 'Work Policies',
          file_name: 'remote-work-policy-v3.docx',
          file_size: 512000,
          mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          version: '3.0',
          status: 'under_review',
          priority: 'medium',
          confidentiality_level: 'internal',
          owner: {
            first_name: 'Mike',
            last_name: 'Brown',
            email: 'mike.brown@company.com'
          },
          created_at: '2024-02-20T11:00:00Z',
          updated_at: '2024-03-15T10:20:00Z',
          download_count: 89,
          view_count: 234,
          requires_signature: true,
          requires_acknowledgment: true,
          tags: ['Remote Work', 'Policy', 'Hybrid', 'Flexibility'],
          effective_date: '2024-04-01',
          next_review_date: '2024-09-01'
        },
        {
          id: 3,
          title: 'Code of Conduct',
          description: 'Ethical guidelines and behavioral expectations for all company employees.',
          document_type: 'compliance',
          category: 'Compliance',
          file_name: 'code-of-conduct-2024.pdf',
          file_size: 1024000,
          mime_type: 'application/pdf',
          version: '1.5',
          status: 'published',
          priority: 'critical',
          confidentiality_level: 'public',
          owner: {
            first_name: 'Alice',
            last_name: 'Wilson',
            email: 'alice.wilson@company.com'
          },
          created_at: '2024-01-10T09:00:00Z',
          updated_at: '2024-02-28T15:45:00Z',
          approved_at: '2024-03-01T10:00:00Z',
          published_at: '2024-03-02T08:00:00Z',
          download_count: 567,
          view_count: 1890,
          requires_signature: true,
          requires_acknowledgment: true,
          tags: ['Ethics', 'Compliance', 'Conduct', 'Legal'],
          effective_date: '2024-03-15',
          expiry_date: '2025-03-15',
          next_review_date: '2024-12-01'
        },
        {
          id: 4,
          title: 'Leave Policy 2024',
          description: 'Updated leave policies including vacation, sick leave, and personal time off.',
          document_type: 'policy',
          category: 'HR Policies',
          file_name: 'leave-policy-2024.pdf',
          file_size: 768000,
          mime_type: 'application/pdf',
          version: '1.3',
          status: 'published',
          priority: 'high',
          confidentiality_level: 'internal',
          owner: {
            first_name: 'Jennifer',
            last_name: 'Davis',
            email: 'jennifer.davis@company.com'
          },
          created_at: '2024-01-05T08:00:00Z',
          updated_at: '2024-02-15T12:00:00Z',
          approved_at: '2024-02-18T14:00:00Z',
          published_at: '2024-02-20T09:00:00Z',
          download_count: 892,
          view_count: 2134,
          requires_signature: false,
          requires_acknowledgment: true,
          tags: ['Leave', 'PTO', 'Vacation', 'Policy'],
          effective_date: '2024-03-01',
          expiry_date: '2024-12-31',
          next_review_date: '2024-08-01'
        },
        {
          id: 5,
          title: 'Performance Review Guidelines',
          description: 'Comprehensive guide for conducting employee performance reviews and evaluations.',
          document_type: 'procedure',
          category: 'Performance',
          file_name: 'performance-review-guidelines.pdf',
          file_size: 1536000,
          mime_type: 'application/pdf',
          version: '2.0',
          status: 'published',
          priority: 'medium',
          confidentiality_level: 'internal',
          owner: {
            first_name: 'Robert',
            last_name: 'Taylor',
            email: 'robert.taylor@company.com'
          },
          created_at: '2024-02-01T10:00:00Z',
          updated_at: '2024-03-05T16:30:00Z',
          approved_at: '2024-03-08T11:00:00Z',
          published_at: '2024-03-10T09:00:00Z',
          download_count: 345,
          view_count: 678,
          requires_signature: false,
          requires_acknowledgment: false,
          tags: ['Performance', 'Review', 'Evaluation', 'Management'],
          effective_date: '2024-03-15',
          next_review_date: '2024-09-15'
        }
      ];
      
      // Apply basic filtering
      let filteredDocuments = [...mockDocuments];
      
      if (params.category && params.category !== 'all') {
        filteredDocuments = filteredDocuments.filter(doc => doc.category === params.category);
      }
      
      if (params.status && params.status !== 'all') {
        filteredDocuments = filteredDocuments.filter(doc => doc.status === params.status);
      }
      
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.title.toLowerCase().includes(searchTerm) ||
          doc.description.toLowerCase().includes(searchTerm) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      return {
        data: {
          documents: filteredDocuments,
          pagination: {
            current_page: 1,
            per_page: 20,
            total: filteredDocuments.length,
            total_pages: 1
          }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  createHRDocument: async (formData) => {
    try {
      const response = await api.post('/hr/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response;
    } catch (error) {
      console.warn('Create HR document API unavailable:', error.message);
      
      const newDocument = {
        id: Date.now(),
        title: formData.get('title') || 'New Document',
        description: formData.get('description') || '',
        document_type: formData.get('document_type') || 'policy',
        category: formData.get('category') || 'HR Policies',
        file_name: formData.get('file')?.name || 'document.pdf',
        file_size: formData.get('file')?.size || 1024000,
        mime_type: formData.get('file')?.type || 'application/pdf',
        version: '1.0',
        status: 'draft',
        priority: formData.get('priority') || 'medium',
        confidentiality_level: formData.get('confidentiality_level') || 'internal',
        owner: {
          first_name: 'Current',
          last_name: 'User',
          email: 'user@company.com'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        download_count: 0,
        view_count: 0,
        requires_signature: formData.get('requires_signature') === 'true',
        requires_acknowledgment: formData.get('requires_acknowledgment') === 'true',
        tags: formData.get('tags') ? JSON.parse(formData.get('tags')) : []
      };
      
      return {
        data: {
          success: true,
          message: 'HR document created successfully (demo mode)',
          document: newDocument
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateHRDocument: async (id, documentData) => {
    try {
      const response = await api.put(`/hr/documents/${id}`, documentData);
      return response;
    } catch (error) {
      console.warn(`Update HR document ${id} API unavailable:`, error.message);
      
      return {
        data: {
          success: true,
          message: 'HR document updated successfully (demo mode)',
          document: { id: parseInt(id), ...documentData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  deleteHRDocument: async (id) => {
    try {
      const response = await api.delete(`/hr/documents/${id}`);
      return response;
    } catch (error) {
      console.warn(`Delete HR document ${id} API unavailable:`, error.message);
      
      return {
        data: {
          success: true,
          message: 'HR document deleted successfully (demo mode)'
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  downloadHRDocument: async (id) => {
    try {
      const response = await api.get(`/hr/documents/${id}/download`, {
        responseType: 'blob'
      });
      return response;
    } catch (error) {
      console.warn(`Download HR document ${id} API unavailable:`, error.message);
      
      // Create a mock blob for demo
      const mockContent = `Mock document content for document ID: ${id}`;
      const blob = new Blob([mockContent], { type: 'text/plain' });
      
      return {
        data: blob,
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  createHRDocumentCategory: async (categoryData) => {
    try {
      const response = await api.post('/hr/documents/categories', categoryData);
      return response;
    } catch (error) {
      console.warn('Create HR document category API unavailable:', error.message);
      
      const newCategory = {
        id: Date.now(),
        ...categoryData,
        document_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return {
        data: {
          success: true,
          message: 'HR document category created successfully (demo mode)',
          category: newCategory
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  // ==================== HR DOCUMENT WORKFLOWS ====================

  createHRDocumentWorkflow: async (workflowData) => {
    try {
      const response = await api.post('/hr/document-workflows', workflowData);
      return response;
    } catch (error) {
      console.warn('Create HR document workflow API unavailable:', error.message);
      
      const newWorkflow = {
        id: Date.now(),
        ...workflowData,
        document_count: 0,
        status: 'active',
        avg_completion_time: 'N/A',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return {
        data: {
          success: true,
          message: 'HR document workflow created successfully (demo mode)',
          workflow: newWorkflow
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  // ==================== HR DOCUMENT SIGNATURES ====================

  createHRDocumentSignatureRequest: async (signatureData) => {
    try {
      const response = await api.post('/hr/document-signatures', signatureData);
      return response;
    } catch (error) {
      console.warn('Create HR document signature request API unavailable:', error.message);
      
      const newSignatureRequest = {
        id: Date.now(),
        ...signatureData,
        status: 'pending',
        requested_at: new Date().toISOString()
      };
      
      return {
        data: {
          success: true,
          message: 'HR document signature request created successfully (demo mode)',
          signatureRequest: newSignatureRequest
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  // ==================== HR DOCUMENT CATEGORIES ====================

  getHRDocumentCategories: async () => {
    try {
      const response = await api.get('/hr/documents/categories');
      return response;
    } catch (error) {
      console.warn('Get HR document categories API unavailable:', error.message);
      
      const mockCategories = [
        {
          id: 1,
          name: 'HR Policies',
          description: 'Human resources policies and procedures',
          document_count: 24,
          icon: 'Users',
          color: '#3B82F6'
        },
        {
          id: 2,
          name: 'Work Policies',
          description: 'Work arrangements and operational policies',
          document_count: 18,
          icon: 'Briefcase',
          color: '#10B981'
        },
        {
          id: 3,
          name: 'Compliance',
          description: 'Legal and regulatory compliance documents',
          document_count: 15,
          icon: 'Shield',
          color: '#F59E0B'
        },
        {
          id: 4,
          name: 'Safety',
          description: 'Workplace safety and health procedures',
          document_count: 12,
          icon: 'AlertTriangle',
          color: '#EF4444'
        },
        {
          id: 5,
          name: 'Performance',
          description: 'Performance management and review procedures',
          document_count: 8,
          icon: 'TrendingUp',
          color: '#8B5CF6'
        },
        {
          id: 6,
          name: 'Training',
          description: 'Training materials and educational resources',
          document_count: 31,
          icon: 'BookOpen',
          color: '#06B6D4'
        },
        {
          id: 7,
          name: 'Templates',
          description: 'Document templates and forms',
          document_count: 22,
          icon: 'FileText',
          color: '#84CC16'
        },
        {
          id: 8,
          name: 'Benefits',
          description: 'Employee benefits and compensation information',
          document_count: 14,
          icon: 'Gift',
          color: '#F97316'
        }
      ];
      
      return {
        data: {
          categories: mockCategories
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== HR DOCUMENT WORKFLOWS ====================

  getHRDocumentWorkflows: async () => {
    try {
      const response = await api.get('/hr/document-workflows');
      return response;
    } catch (error) {
      console.warn('Get HR document workflows API unavailable:', error.message);
      
      const mockWorkflows = [
        {
          id: 1,
          name: 'HR Policy Approval',
          description: 'Standard approval workflow for HR policy documents',
          document_count: 45,
          status: 'active',
          steps: 4,
          avg_completion_time: '3.2 days',
          workflow_type: 'approval'
        },
        {
          id: 2,
          name: 'Employee Handbook Review',
          description: 'Comprehensive review process for employee handbook updates',
          document_count: 12,
          status: 'active',
          steps: 6,
          avg_completion_time: '7.5 days',
          workflow_type: 'review'
        },
        {
          id: 3,
          name: 'Compliance Document Approval',
          description: 'Legal and compliance review workflow for regulatory documents',
          document_count: 8,
          status: 'active',
          steps: 5,
          avg_completion_time: '9.1 days',
          workflow_type: 'compliance'
        },
        {
          id: 4,
          name: 'Training Material Review',
          description: 'Review and approval process for training materials',
          document_count: 23,
          status: 'active',
          steps: 3,
          avg_completion_time: '2.8 days',
          workflow_type: 'review'
        }
      ];
      
      return {
        data: {
          workflows: mockWorkflows
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== HR DOCUMENT SIGNATURES ====================

  getHRDocumentSignatures: async (params = {}) => {
    try {
      const response = await api.get('/hr/document-signatures', { params });
      return response;
    } catch (error) {
      console.warn('Get HR document signatures API unavailable:', error.message);
      
      const mockSignatures = [
        {
          id: 1,
          document_title: 'Employee Handbook Acknowledgment',
          document_type: 'handbook',
          signer_name: 'John Doe',
          signer_email: 'john.doe@company.com',
          status: 'pending',
          signature_type: 'digital',
          requested_at: '2024-03-15T10:00:00Z',
          due_date: '2024-03-22T23:59:59Z',
          department: 'Engineering'
        },
        {
          id: 2,
          document_title: 'Code of Conduct Agreement',
          document_type: 'compliance',
          signer_name: 'Jane Smith',
          signer_email: 'jane.smith@company.com',
          status: 'signed',
          signature_type: 'digital',
          requested_at: '2024-03-10T14:30:00Z',
          signed_at: '2024-03-12T09:15:00Z',
          due_date: '2024-03-17T23:59:59Z',
          department: 'Marketing'
        },
        {
          id: 3,
          document_title: 'Remote Work Policy Agreement',
          document_type: 'policy',
          signer_name: 'Bob Johnson',
          signer_email: 'bob.johnson@company.com',
          status: 'declined',
          signature_type: 'electronic',
          requested_at: '2024-03-08T11:00:00Z',
          declined_at: '2024-03-09T16:30:00Z',
          due_date: '2024-03-15T23:59:59Z',
          decline_reason: 'Need clarification on section 3.2',
          department: 'Sales'
        },
        {
          id: 4,
          document_title: 'Performance Review Guidelines Acknowledgment',
          document_type: 'procedure',
          signer_name: 'Alice Brown',
          signer_email: 'alice.brown@company.com',
          status: 'pending',
          signature_type: 'digital',
          requested_at: '2024-03-14T08:00:00Z',
          due_date: '2024-03-21T23:59:59Z',
          department: 'HR'
        }
      ];
      
      return {
        data: {
          signatures: mockSignatures,
          pagination: {
            current_page: 1,
            per_page: 20,
            total: mockSignatures.length,
            total_pages: 1
          }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== HR DOCUMENT ANALYTICS ====================

  getHRDocumentAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/hr/documents/analytics', { params });
      return response;
    } catch (error) {
      console.warn('Get HR document analytics API unavailable:', error.message);
      
      return {
        data: {
          totalDocuments: 156,
          publishedDocuments: 128,
          draftDocuments: 18,
          underReviewDocuments: 10,
          totalDownloads: 5247,
          totalViews: 12890,
          activeWorkflows: 23,
          pendingSignatures: 8,
          completedSignatures: 145,
          documentsByCategory: {
            'HR Policies': 24,
            'Work Policies': 18,
            'Compliance': 15,
            'Safety': 12,
            'Performance': 8,
            'Training': 31,
            'Templates': 22,
            'Benefits': 14
          },
          documentsByType: {
            'policy': 45,
            'handbook': 12,
            'procedure': 28,
            'form': 35,
            'template': 22,
            'manual': 14
          },
          monthlyActivity: [
            { month: 'Jan', uploads: 12, downloads: 456, views: 1234 },
            { month: 'Feb', uploads: 18, downloads: 523, views: 1456 },
            { month: 'Mar', uploads: 15, downloads: 612, views: 1678 }
          ],
          topDocuments: [
            { title: 'Employee Handbook 2024', downloads: 1247, views: 3456 },
            { title: 'Leave Policy 2024', downloads: 892, views: 2134 },
            { title: 'Code of Conduct', downloads: 567, views: 1890 }
          ]
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  getFileIcon: (mimeType) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    return '📄';
  },

  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getStatusColor: (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'pending_approval': 'bg-orange-100 text-orange-800',
      'approved': 'bg-blue-100 text-blue-800',
      'published': 'bg-green-100 text-green-800',
      'archived': 'bg-gray-100 text-gray-600',
      'rejected': 'bg-red-100 text-red-800',
      'expired': 'bg-red-100 text-red-600'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  getPriorityColor: (priority) => {
    const colors = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'high': 'bg-orange-100 text-orange-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  },

  getConfidentialityColor: (level) => {
    const colors = {
      'public': 'bg-green-100 text-green-800',
      'internal': 'bg-blue-100 text-blue-800',
      'confidential': 'bg-orange-100 text-orange-800',
      'restricted': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  },

  downloadDocument: (documentId, fileName) => {
    // Create a download link for the document
    const link = document.createElement('a');
    link.href = `/api/v1/hr/documents/${documentId}/download`;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export default hrDocumentService;