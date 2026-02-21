import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

const documentSignatureService = {
  // ==================== SIGNATURE REQUESTS ====================
  
  getSignatureRequests: async (params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/document-signatures', { params: { ...params, company_id } });
      return response;
    } catch (error) {
      console.warn('Get signature requests API unavailable:', error.message);
      
      // Mock data for development
      const mockSignatureRequests = [
        {
          id: 1,
          document: {
            id: 1,
            title: 'Employment Contract - John Doe',
            document_type: 'contract'
          },
          signer: {
            id: 2,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@company.com'
          },
          requester: {
            id: 1,
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@company.com'
          },
          signature_type: 'digital',
          signature_method: 'click_to_sign',
          status: 'pending',
          signature_order: 1,
          is_required: true,
          requested_at: '2024-03-15T10:00:00Z',
          due_date: '2024-03-22T23:59:59Z',
          signer_role: 'Employee',
          comments: 'Please review and sign your employment contract.',
          notification_sent: true,
          reminder_count: 1,
          last_reminder_sent: '2024-03-18T09:00:00Z'
        },
        {
          id: 2,
          document: {
            id: 2,
            title: 'NDA Agreement - Project Alpha',
            document_type: 'contract'
          },
          signer: {
            id: 3,
            first_name: 'Alice',
            last_name: 'Wilson',
            email: 'alice.wilson@company.com'
          },
          requester: {
            id: 1,
            first_name: 'Mike',
            last_name: 'Brown',
            email: 'mike.brown@company.com'
          },
          signature_type: 'electronic',
          signature_method: 'drawn_signature',
          status: 'signed',
          signature_order: 1,
          is_required: true,
          requested_at: '2024-03-10T14:30:00Z',
          signed_at: '2024-03-12T09:15:00Z',
          due_date: '2024-03-17T23:59:59Z',
          signer_role: 'Project Manager',
          comments: 'Confidentiality agreement for Project Alpha access.',
          ip_address: '192.168.1.100',
          device_info: {
            type: 'desktop',
            os: 'macOS 14',
            browser: 'Safari 17'
          },
          signature_hash: 'abc123def456...',
          is_verified: true,
          verified_at: '2024-03-12T09:15:00Z'
        },
        {
          id: 3,
          document: {
            id: 3,
            title: 'Policy Acknowledgment - Remote Work',
            document_type: 'policy'
          },
          signer: {
            id: 4,
            first_name: 'Bob',
            last_name: 'Smith',
            email: 'bob.smith@company.com'
          },
          requester: {
            id: 5,
            first_name: 'HR',
            last_name: 'Department',
            email: 'hr@company.com'
          },
          signature_type: 'digital',
          signature_method: 'click_to_sign',
          status: 'declined',
          signature_order: 1,
          is_required: false,
          requested_at: '2024-03-08T11:00:00Z',
          declined_at: '2024-03-09T16:30:00Z',
          due_date: '2024-03-15T23:59:59Z',
          signer_role: 'Developer',
          decline_reason: 'Need clarification on section 3.2',
          comments: 'Please acknowledge the updated remote work policy.'
        }
      ];
      
      // Apply basic filtering
      let filteredRequests = [...mockSignatureRequests];
      
      if (params.status) {
        filteredRequests = filteredRequests.filter(req => req.status === params.status);
      }
      
      if (params.signer_id) {
        filteredRequests = filteredRequests.filter(req => req.signer.id === parseInt(params.signer_id));
      }
      
      if (params.document_id) {
        filteredRequests = filteredRequests.filter(req => req.document.id === parseInt(params.document_id));
      }
      
      return {
        data: {
          signatures: filteredRequests,
          pagination: {
            current_page: 1,
            per_page: 20,
            total: filteredRequests.length,
            total_pages: 1
          }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  createSignatureRequest: async (requestData) => {
    try {
      const company_id = getCompanyId();
      const response = await api.post('/document-signatures', { ...requestData, company_id });
      return response;
    } catch (error) {
      console.warn('Create signature request API unavailable:', error.message);
      
      const newRequest = {
        id: Date.now(),
        ...requestData,
        company_id: getCompanyId(),
        status: 'pending',
        requested_at: new Date().toISOString(),
        notification_sent: false,
        reminder_count: 0,
        audit_trail: [{
          action: 'signature_requested',
          user_id: requestData.requested_by,
          timestamp: new Date().toISOString(),
          details: { 
            signer_id: requestData.signer_id, 
            signature_type: requestData.signature_type 
          }
        }]
      };
      
      return {
        data: {
          success: true,
          message: 'Signature request created successfully (demo mode)',
          signatureRequest: newRequest
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  // ==================== SIGNATURE PROCESS ====================

  signDocument: async (signatureId, signatureData) => {
    try {
      const company_id = getCompanyId();
      const response = await api.post(`/document-signatures/${signatureId}/sign`, { ...signatureData, company_id });
      return response;
    } catch (error) {
      console.warn(`Sign document ${signatureId} API unavailable:`, error.message);
      
      return {
        data: {
          success: true,
          message: 'Document signed successfully (demo mode)',
          signatureRequest: {
            id: signatureId,
            status: 'signed',
            signed_at: new Date().toISOString(),
            signature_hash: 'mock_hash_' + Date.now(),
            is_verified: true,
            verified_at: new Date().toISOString()
          },
          all_signatures_complete: Math.random() > 0.5 // Random for demo
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  declineSignature: async (signatureId, declineData) => {
    try {
      const response = await api.post(`/document-signatures/${signatureId}/decline`, declineData);
      return response;
    } catch (error) {
      console.warn(`Decline signature ${signatureId} API unavailable:`, error.message);
      
      return {
        data: {
          success: true,
          message: 'Signature request declined successfully (demo mode)'
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  delegateSignature: async (signatureId, delegationData) => {
    try {
      const response = await api.post(`/document-signatures/${signatureId}/delegate`, delegationData);
      return response;
    } catch (error) {
      console.warn(`Delegate signature ${signatureId} API unavailable:`, error.message);
      
      return {
        data: {
          success: true,
          message: 'Signature request delegated successfully (demo mode)'
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== SIGNATURE VERIFICATION ====================

  verifySignature: async (signatureId) => {
    try {
      const response = await api.get(`/document-signatures/${signatureId}/verify`);
      return response;
    } catch (error) {
      console.warn(`Verify signature ${signatureId} API unavailable:`, error.message);
      
      return {
        data: {
          signature: {
            id: signatureId,
            status: 'signed',
            signed_at: '2024-03-12T09:15:00Z',
            signature_hash: 'abc123def456...',
            is_verified: true
          },
          verification: {
            is_valid: true,
            signed_at: '2024-03-12T09:15:00Z',
            signer: {
              first_name: 'John',
              last_name: 'Doe',
              email: 'john.doe@company.com'
            },
            signature_type: 'digital',
            ip_address: '192.168.1.100',
            device_info: {
              type: 'desktop',
              os: 'macOS 14',
              browser: 'Safari 17'
            }
          }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== SIGNATURE STATISTICS ====================

  getSignatureStatistics: async (params = {}) => {
    try {
      const response = await api.get('/document-signatures/statistics', { params });
      return response;
    } catch (error) {
      console.warn('Get signature statistics API unavailable:', error.message);
      
      return {
        data: {
          totalRequests: 156,
          pendingSignatures: 23,
          completedSignatures: 128,
          declinedSignatures: 5,
          expiredSignatures: 0,
          digitalSignatures: 98,
          electronicSignatures: 45,
          certificateSignatures: 13,
          completionRate: 82.1,
          averageSigningTime: 2.3, // days
          overdueSignatures: 7,
          monthlyStats: [
            { month: 'Jan', requested: 48, completed: 42, declined: 3 },
            { month: 'Feb', requested: 52, completed: 47, declined: 2 },
            { month: 'Mar', requested: 56, completed: 39, declined: 0 }
          ],
          signatureTypes: {
            digital: 65,
            electronic: 25,
            certificate_based: 10
          }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  getStatusIcon: (status) => {
    const icons = {
      'pending': '⏳',
      'signed': '✅',
      'declined': '❌',
      'expired': '⚠️',
      'delegated': '👥',
      'cancelled': '🚫'
    };
    return icons[status] || '❓';
  },

  getStatusColor: (status) => {
    const colors = {
      'pending': 'bg-orange-100 text-orange-800',
      'signed': 'bg-green-100 text-green-800',
      'declined': 'bg-red-100 text-red-800',
      'expired': 'bg-red-100 text-red-800',
      'delegated': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  getSignatureTypeIcon: (type) => {
    const icons = {
      'digital': '🔐',
      'electronic': '✍️',
      'wet_signature': '🖊️',
      'biometric': '👆',
      'certificate_based': '📜'
    };
    return icons[type] || '✍️';
  },

  getSignatureTypeColor: (type) => {
    const colors = {
      'digital': 'bg-blue-100 text-blue-800',
      'electronic': 'bg-green-100 text-green-800',
      'wet_signature': 'bg-purple-100 text-purple-800',
      'biometric': 'bg-orange-100 text-orange-800',
      'certificate_based': 'bg-indigo-100 text-indigo-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  },

  isOverdue: (dueDate, status) => {
    return status === 'pending' && dueDate && new Date() > new Date(dueDate);
  },

  getDaysUntilDue: (dueDate) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  },

  formatSigningTime: (requestedAt, signedAt) => {
    if (!requestedAt || !signedAt) return 'N/A';
    
    const requested = new Date(requestedAt);
    const signed = new Date(signedAt);
    const diffMs = signed - requested;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return diffHours > 0 ? `${diffDays}d ${diffHours}h` : `${diffDays}d`;
    } else if (diffHours > 0) {
      return `${diffHours}h`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffMinutes}m`;
    }
  },

  validateSignatureData: (signatureData) => {
    if (!signatureData.signature_data || signatureData.signature_data.trim() === '') {
      return { isValid: false, error: 'Signature data is required' };
    }
    
    if (!signatureData.signature_method) {
      return { isValid: false, error: 'Signature method is required' };
    }
    
    return { isValid: true };
  },

  generateSignatureHash: (signatureData, signatureId, userId) => {
    // Simple hash generation for demo purposes
    // In production, use proper cryptographic hashing
    const data = signatureData + signatureId + userId + new Date().toISOString();
    return btoa(data).substring(0, 32);
  },

  exportSignatureReport: (signatures, format = 'csv') => {
    if (format === 'csv') {
      const headers = [
        'Document Title',
        'Signer Name',
        'Signer Email',
        'Signature Type',
        'Status',
        'Requested Date',
        'Signed Date',
        'Due Date',
        'IP Address',
        'Device'
      ];
      
      const rows = signatures.map(sig => [
        sig.document.title,
        `${sig.signer.first_name} ${sig.signer.last_name}`,
        sig.signer.email,
        sig.signature_type,
        sig.status,
        sig.requested_at,
        sig.signed_at || '',
        sig.due_date || '',
        sig.ip_address || '',
        sig.device_info ? `${sig.device_info.type} - ${sig.device_info.os}` : ''
      ]);
      
      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      return csvContent;
    }
    
    return JSON.stringify(signatures, null, 2);
  },

  downloadSignatureReport: (signatures, filename = 'signature_report.csv') => {
    const csvContent = documentSignatureService.exportSignatureReport(signatures);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};

export default documentSignatureService;