import api from './api'
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

export const documentService = {
  // Dashboard
  getDocumentDashboard: () => {
    const company_id = getCompanyId();
    return api.get('/documents/dashboard', { params: { company_id } });
  },

  // Documents
  getDocuments: (params) => {
    const company_id = getCompanyId();
    return api.get('/documents', { params: { ...params, company_id } });
  },
  getDocumentById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/documents/${id}`, { params: { company_id } });
  },
  createDocument: (formData) => {
    const company_id = getCompanyId();
    // If formData is already a FormData object, use it directly
    if (formData instanceof FormData) {
      formData.append('company_id', company_id);
      return api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    // Legacy support: if documentData and file are passed separately
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (Array.isArray(formData[key])) {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });
    data.append('company_id', company_id);
    return api.post('/documents', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateDocument: (id, documentData) => {
    const company_id = getCompanyId();
    return api.put(`/documents/${id}`, { ...documentData, company_id });
  },
  deleteDocument: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/documents/${id}`, { params: { company_id } });
  },
  downloadDocument: (id) => {
    const company_id = getCompanyId();
    return api.get(`/documents/${id}/download`, { params: { company_id }, responseType: 'blob' });
  },

  // Workflow
  startWorkflow: (id, workflowData) => {
    const company_id = getCompanyId();
    return api.post(`/documents/${id}/workflow`, { ...workflowData, company_id });
  },
  approveDocument: (id, approvalData) => {
    const company_id = getCompanyId();
    return api.put(`/documents/${id}/approve`, { ...approvalData, company_id });
  },

  // Digital Signatures
  addSignature: (id, signatureData) => {
    const company_id = getCompanyId();
    return api.post(`/documents/${id}/signature`, { ...signatureData, company_id });
  },

  // Search
  searchDocuments: (params) => {
    const company_id = getCompanyId();
    return api.get('/documents/search', { params: { ...params, company_id } });
  },

  // Categories
  getCategories: () => {
    const company_id = getCompanyId();
    return api.get('/documents/categories', { params: { company_id } });
  },
  createCategory: (categoryData) => {
    const company_id = getCompanyId();
    return api.post('/documents/categories', { ...categoryData, company_id });
  },
  updateCategory: (id, categoryData) => {
    const company_id = getCompanyId();
    return api.put(`/documents/categories/${id}`, { ...categoryData, company_id });
  },
  deleteCategory: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/documents/categories/${id}`, { params: { company_id } });
  },

  // Statistics
  getStatistics: () => api.get('/documents/statistics'),

  // Utility functions
  getDocumentTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'text', label: 'Text Document', icon: 'file-text', description: 'Rich text document' },
          { value: 'file', label: 'File Upload', icon: 'upload', description: 'Uploaded file document' },
          { value: 'template', label: 'Template', icon: 'copy', description: 'Document template' },
          { value: 'form', label: 'Form', icon: 'clipboard', description: 'Interactive form' },
          { value: 'contract', label: 'Contract', icon: 'file-signature', description: 'Legal contract' },
          { value: 'policy', label: 'Policy', icon: 'shield', description: 'Company policy' },
          { value: 'procedure', label: 'Procedure', icon: 'list', description: 'Standard procedure' },
          { value: 'manual', label: 'Manual', icon: 'book', description: 'User manual' },
          { value: 'report', label: 'Report', icon: 'bar-chart', description: 'Business report' }
        ]
      }
    }
  }),

  getDocumentStatuses: () => Promise.resolve({
    data: {
      data: {
        statuses: [
          { value: 'draft', label: 'Draft', color: 'gray', icon: 'edit' },
          { value: 'review', label: 'Under Review', color: 'yellow', icon: 'eye' },
          { value: 'approved', label: 'Approved', color: 'green', icon: 'check-circle' },
          { value: 'published', label: 'Published', color: 'blue', icon: 'globe' },
          { value: 'archived', label: 'Archived', color: 'purple', icon: 'archive' },
          { value: 'rejected', label: 'Rejected', color: 'red', icon: 'x-circle' }
        ]
      }
    }
  }),

  getVisibilityOptions: () => Promise.resolve({
    data: {
      data: {
        options: [
          { value: 'public', label: 'Public', description: 'Visible to everyone', icon: 'globe' },
          { value: 'internal', label: 'Internal', description: 'Visible to all employees', icon: 'users' },
          { value: 'department', label: 'Department', description: 'Visible to department members', icon: 'building' },
          { value: 'private', label: 'Private', description: 'Visible to specific users', icon: 'lock' },
          { value: 'confidential', label: 'Confidential', description: 'Visible to administrators only', icon: 'shield' }
        ]
      }
    }
  }),

  getPriorityLevels: () => Promise.resolve({
    data: {
      data: {
        priorities: [
          { value: 'low', label: 'Low Priority', color: 'green' },
          { value: 'normal', label: 'Normal Priority', color: 'blue' },
          { value: 'high', label: 'High Priority', color: 'orange' },
          { value: 'urgent', label: 'Urgent', color: 'red' }
        ]
      }
    }
  }),

  getWorkflowTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'approval', label: 'Approval Workflow', description: 'Document approval process', icon: 'check-circle' },
          { value: 'review', label: 'Review Workflow', description: 'Document review process', icon: 'eye' },
          { value: 'signature', label: 'Signature Workflow', description: 'Digital signature process', icon: 'edit-3' },
          { value: 'publication', label: 'Publication Workflow', description: 'Document publication process', icon: 'globe' },
          { value: 'custom', label: 'Custom Workflow', description: 'Custom workflow process', icon: 'settings' }
        ]
      }
    }
  }),

  getApprovalTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'review', label: 'Review', description: 'Review document content', icon: 'eye' },
          { value: 'approve', label: 'Approve', description: 'Approve document', icon: 'check-circle' },
          { value: 'sign', label: 'Sign', description: 'Digitally sign document', icon: 'edit-3' },
          { value: 'acknowledge', label: 'Acknowledge', description: 'Acknowledge receipt', icon: 'check' },
          { value: 'custom', label: 'Custom', description: 'Custom approval type', icon: 'settings' }
        ]
      }
    }
  }),

  getSignatureTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'electronic', label: 'Electronic Signature', description: 'Standard electronic signature', icon: 'edit' },
          { value: 'digital', label: 'Digital Signature', description: 'Certificate-based digital signature', icon: 'shield' },
          { value: 'wet', label: 'Wet Signature', description: 'Physical signature scan', icon: 'pen-tool' },
          { value: 'biometric', label: 'Biometric Signature', description: 'Biometric verification', icon: 'fingerprint' },
          { value: 'click_to_sign', label: 'Click to Sign', description: 'Simple click confirmation', icon: 'mouse-pointer' }
        ]
      }
    }
  }),

  getSignatureMethods: () => Promise.resolve({
    data: {
      data: {
        methods: [
          { value: 'drawn', label: 'Drawn', description: 'Draw signature with mouse/touch', icon: 'edit' },
          { value: 'typed', label: 'Typed', description: 'Type signature text', icon: 'type' },
          { value: 'uploaded', label: 'Uploaded', description: 'Upload signature image', icon: 'upload' },
          { value: 'certificate', label: 'Certificate', description: 'Use digital certificate', icon: 'shield' },
          { value: 'pin', label: 'PIN', description: 'PIN-based signature', icon: 'lock' },
          { value: 'biometric', label: 'Biometric', description: 'Biometric verification', icon: 'fingerprint' }
        ]
      }
    }
  }),

  // Helper functions
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  },

  getMimeTypeIcon: (mimeType) => {
    if (!mimeType) return '📄';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📽️';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('archive')) return '📦';
    return '📄';
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

  getDocumentIcon: (documentType, mimeType) => {
    const typeIcons = {
      'text': 'file-text',
      'file': 'file',
      'template': 'copy',
      'form': 'clipboard',
      'contract': 'file-signature',
      'policy': 'shield',
      'procedure': 'list',
      'manual': 'book',
      'report': 'bar-chart'
    };

    if (typeIcons[documentType]) {
      return typeIcons[documentType];
    }

    if (mimeType) {
      if (mimeType.includes('pdf')) return 'file-text';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text';
      if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'grid';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'monitor';
      if (mimeType.includes('image')) return 'image';
    }

    return 'file';
  },

  getStatusColor: (status) => {
    const statusColors = {
      'draft': 'gray',
      'review': 'yellow',
      'approved': 'green',
      'published': 'blue',
      'archived': 'purple',
      'rejected': 'red'
    };
    return statusColors[status] || 'gray';
  },

  getPriorityColor: (priority) => {
    const priorityColors = {
      'low': 'green',
      'normal': 'blue',
      'high': 'orange',
      'urgent': 'red'
    };
    return priorityColors[priority] || 'blue';
  },

  getVisibilityIcon: (visibility) => {
    const visibilityIcons = {
      'public': 'globe',
      'internal': 'users',
      'department': 'building',
      'private': 'lock',
      'confidential': 'shield'
    };
    return visibilityIcons[visibility] || 'lock';
  },

  isExpired: (expiresAt) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  },

  isExpiringSoon: (expiresAt, days = 7) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + days);
    return expiryDate <= warningDate && expiryDate > new Date();
  },

  getDaysUntilExpiry: (expiresAt) => {
    if (!expiresAt) return null;
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  validateDocument: (documentData) => {
    const errors = [];

    if (!documentData.title || documentData.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (documentData.title && documentData.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }

    if (documentData.description && documentData.description.length > 2000) {
      errors.push('Description must be less than 2000 characters');
    }

    if (documentData.content && documentData.content.length > 100000) {
      errors.push('Content is too long');
    }

    if (documentData.expires_at && new Date(documentData.expires_at) <= new Date()) {
      errors.push('Expiration date must be in the future');
    }

    if (documentData.review_date && new Date(documentData.review_date) <= new Date()) {
      errors.push('Review date must be in the future');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  generateDocumentNumber: (documentType, departmentCode = 'GEN') => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    const typeCode = documentType.substring(0, 3).toUpperCase();
    return `${departmentCode}-${typeCode}-${year}${month}${day}-${random}`;
  },

  createWorkflowStep: (stepNumber, approvers, type = 'approve', description = '') => {
    return {
      step: stepNumber,
      approvers: Array.isArray(approvers) ? approvers : [approvers],
      type,
      description,
      required: true,
      parallel: false
    };
  },

  createSignatureRequest: (signerId, signerRole, position = null, required = true) => {
    return {
      signer_id: signerId,
      signer_role: signerRole,
      signing_order: 1,
      is_required: required,
      signature_position: position,
      due_date: null
    };
  },

  parseWorkflowSteps: (stepsString) => {
    try {
      return JSON.parse(stepsString);
    } catch (error) {
      console.error('Error parsing workflow steps:', error);
      return [];
    }
  },

  formatWorkflowSteps: (steps) => {
    return steps.map((step, index) => ({
      step: index + 1,
      approvers: step.approvers || [],
      type: step.type || 'approve',
      description: step.description || '',
      required: step.required !== false,
      parallel: step.parallel === true
    }));
  },

  getWorkflowProgress: (workflow) => {
    if (!workflow) return 0;
    return Math.round((workflow.current_step / workflow.total_steps) * 100);
  },

  getWorkflowStatusColor: (status) => {
    const statusColors = {
      'none': 'gray',
      'pending': 'yellow',
      'in_progress': 'blue',
      'completed': 'green',
      'cancelled': 'gray',
      'rejected': 'red'
    };
    return statusColors[status] || 'gray';
  },

  canUserApprove: (document, userId) => {
    // Check if user has pending approval for this document
    return document.approvals && document.approvals.some(
      approval => approval.approver_id === userId && approval.status === 'pending'
    );
  },

  canUserSign: (document, userId) => {
    // Check if user has pending signature for this document
    return document.signatures && document.signatures.some(
      signature => signature.signer_id === userId && signature.status === 'pending'
    );
  },

  canUserEdit: (document, userId) => {
    // Check if user can edit the document
    return document.created_by === userId || 
           document.status === 'draft' ||
           (document.workflow_status === 'none' && !document.is_locked);
  },

  canUserDelete: (document, userId, userRole) => {
    // Check if user can delete the document
    return document.created_by === userId || 
           ['super_admin', 'admin'].includes(userRole);
  },

  exportDocument: (document, format = 'pdf') => {
    // This would integrate with a document export service
    const exportUrl = `/api/v1/documents/${document.id}/export?format=${format}`;
    return api.get(exportUrl, { responseType: 'blob' });
  },

  printDocument: (document) => {
    // This would open a print-friendly version
    const printUrl = `/documents/${document.id}/print`;
    window.open(printUrl, '_blank');
  },

  shareDocument: (documentId, shareData) => {
    return api.post(`/documents/${documentId}/share`, shareData);
  },

  getDocumentHistory: (documentId) => {
    return api.get(`/documents/${documentId}/history`);
  },

  getDocumentVersions: (documentId) => {
    return api.get(`/documents/${documentId}/versions`);
  },

  compareVersions: (documentId, version1, version2) => {
    return api.get(`/documents/${documentId}/compare?v1=${version1}&v2=${version2}`);
  },

  lockDocument: (documentId, lockReason = '') => {
    return api.post(`/documents/${documentId}/lock`, { reason: lockReason });
  },

  unlockDocument: (documentId) => {
    return api.post(`/documents/${documentId}/unlock`);
  }
}

export default documentService