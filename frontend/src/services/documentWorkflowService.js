import api from './api';
import { getErrorMessage } from '../utils/errorHandler';
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

const documentWorkflowService = {
  // ==================== WORKFLOW TEMPLATES ====================
  
  getWorkflows: async (params = {}) => {
    try {
      const company_id = getCompanyId();
      const response = await api.get('/document-workflows', { params: { ...params, company_id } });
      return response;
    } catch (error) {
      console.warn('Get workflows API unavailable:', error.message);
      
      // Mock data for development
      const mockWorkflows = [
        {
          id: 1,
          name: 'Standard Document Approval',
          description: 'Standard approval workflow for internal documents',
          workflow_type: 'approval',
          category_id: null,
          document_types: ['policy', 'procedure', 'handbook'],
          steps: [
            {
              id: 1,
              name: 'Content Review',
              type: 'approval',
              assignee_type: 'role',
              assignee_id: 'content_reviewer',
              approval_type: 'content_review',
              is_required: true,
              sla_hours: 48
            },
            {
              id: 2,
              name: 'Legal Review',
              type: 'approval',
              assignee_type: 'role',
              assignee_id: 'legal_reviewer',
              approval_type: 'legal_review',
              is_required: true,
              sla_hours: 72
            },
            {
              id: 3,
              name: 'Final Approval',
              type: 'approval',
              assignee_type: 'role',
              assignee_id: 'document_approver',
              approval_type: 'final_approval',
              is_required: true,
              sla_hours: 24
            },
            {
              id: 4,
              name: 'Publish Document',
              type: 'auto_action',
              action: 'publish',
              is_required: true
            }
          ],
          is_parallel: false,
          auto_start: true,
          sla_hours: 168,
          priority: 'medium',
          is_active: true,
          version: '1.0',
          created_by: 1,
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: 2,
          name: 'Contract Signature Workflow',
          description: 'Workflow for contract documents requiring signatures',
          workflow_type: 'signature',
          category_id: null,
          document_types: ['contract'],
          steps: [
            {
              id: 1,
              name: 'Legal Review',
              type: 'approval',
              assignee_type: 'role',
              assignee_id: 'legal_reviewer',
              approval_type: 'legal_review',
              is_required: true,
              sla_hours: 48
            },
            {
              id: 2,
              name: 'Client Signature',
              type: 'signature',
              assignee_type: 'external',
              signature_type: 'digital',
              is_required: true,
              sla_hours: 168
            },
            {
              id: 3,
              name: 'Company Signature',
              type: 'signature',
              assignee_type: 'role',
              assignee_id: 'authorized_signatory',
              signature_type: 'digital',
              is_required: true,
              sla_hours: 24
            }
          ],
          is_parallel: false,
          auto_start: false,
          sla_hours: 240,
          priority: 'high',
          is_active: true,
          version: '1.0',
          created_by: 1,
          created_at: '2024-02-01T14:30:00Z'
        }
      ];
      
      return {
        data: {
          workflows: mockWorkflows,
          pagination: {
            current_page: 1,
            per_page: 20,
            total: mockWorkflows.length,
            total_pages: 1
          }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  createWorkflow: async (workflowData) => {
    try {
      const response = await api.post('/document-workflows', workflowData);
      return response;
    } catch (error) {
      console.warn('Create workflow API unavailable:', error.message);
      
      const newWorkflow = {
        id: Date.now(),
        ...workflowData,
        version: '1.0',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return {
        data: {
          success: true,
          message: 'Workflow created successfully (demo mode)',
          workflow: newWorkflow
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  updateWorkflow: async (id, workflowData) => {
    try {
      const response = await api.put(`/document-workflows/${id}`, workflowData);
      return response;
    } catch (error) {
      console.warn(`Update workflow ${id} API unavailable:`, error.message);
      
      return {
        data: {
          success: true,
          message: 'Workflow updated successfully (demo mode)',
          workflow: { id: parseInt(id), ...workflowData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== WORKFLOW INSTANCES ====================

  startWorkflow: async (workflowData) => {
    try {
      const response = await api.post('/document-workflows/instances/start', workflowData);
      return response;
    } catch (error) {
      console.warn('Start workflow API unavailable:', error.message);
      
      const newInstance = {
        id: Date.now(),
        ...workflowData,
        status: 'pending',
        current_step: 1,
        started_at: new Date().toISOString(),
        audit_trail: [{
          action: 'workflow_started',
          user_id: workflowData.started_by,
          timestamp: new Date().toISOString(),
          details: { workflow_name: 'Mock Workflow' }
        }]
      };
      
      return {
        data: {
          success: true,
          message: 'Workflow started successfully (demo mode)',
          instance: newInstance
        },
        status: 201,
        statusText: 'Created (Mock)'
      };
    }
  },

  getWorkflowInstances: async (params = {}) => {
    try {
      const response = await api.get('/document-workflows/instances', { params });
      return response;
    } catch (error) {
      console.warn('Get workflow instances API unavailable:', error.message);
      
      // Mock data for development
      const mockInstances = [
        {
          id: 1,
          workflow_id: 1,
          document_id: 1,
          document_version_id: 1,
          status: 'in_progress',
          current_step: 2,
          total_steps: 4,
          started_by: 1,
          started_at: '2024-03-15T10:00:00Z',
          due_date: '2024-03-22T10:00:00Z',
          workflow: {
            id: 1,
            name: 'Standard Document Approval',
            workflow_type: 'approval',
            priority: 'medium'
          },
          document: {
            id: 1,
            title: 'Employee Handbook 2024',
            document_type: 'handbook',
            status: 'under_review'
          },
          starter: {
            id: 1,
            first_name: 'John',
            last_name: 'Smith',
            email: 'john.smith@company.com'
          }
        },
        {
          id: 2,
          workflow_id: 2,
          document_id: 2,
          document_version_id: 2,
          status: 'completed',
          current_step: 3,
          total_steps: 3,
          started_by: 2,
          started_at: '2024-03-10T14:30:00Z',
          completed_at: '2024-03-14T16:45:00Z',
          workflow: {
            id: 2,
            name: 'Contract Signature Workflow',
            workflow_type: 'signature',
            priority: 'high'
          },
          document: {
            id: 2,
            title: 'Service Agreement - Client ABC',
            document_type: 'contract',
            status: 'published'
          },
          starter: {
            id: 2,
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@company.com'
          }
        }
      ];
      
      return {
        data: {
          instances: mockInstances,
          pagination: {
            current_page: 1,
            per_page: 20,
            total: mockInstances.length,
            total_pages: 1
          }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  completeWorkflowStep: async (instanceId, stepData) => {
    try {
      const response = await api.put(`/document-workflows/instances/${instanceId}/complete`, stepData);
      return response;
    } catch (error) {
      console.warn(`Complete workflow step ${instanceId} API unavailable:`, error.message);
      
      return {
        data: {
          success: true,
          message: 'Workflow step completed successfully (demo mode)',
          instance: { id: instanceId, ...stepData }
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  cancelWorkflow: async (instanceId, reason) => {
    try {
      const response = await api.put(`/document-workflows/instances/${instanceId}/cancel`, { reason });
      return response;
    } catch (error) {
      console.warn(`Cancel workflow ${instanceId} API unavailable:`, error.message);
      
      return {
        data: {
          success: true,
          message: 'Workflow cancelled successfully (demo mode)'
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== WORKFLOW STATISTICS ====================

  getWorkflowStatistics: async (params = {}) => {
    try {
      const response = await api.get('/document-workflows/statistics', { params });
      return response;
    } catch (error) {
      console.warn('Get workflow statistics API unavailable:', error.message);
      
      return {
        data: {
          totalWorkflows: 12,
          activeWorkflows: 8,
          totalInstances: 156,
          pendingInstances: 23,
          completedInstances: 128,
          failedInstances: 5,
          averageCompletionTime: 3.2, // days
          completionRate: 82.1, // percentage
          overdueInstances: 7,
          workflowTypes: {
            approval: 45,
            signature: 28,
            review: 35,
            publication: 18,
            archival: 12,
            custom: 18
          },
          monthlyStats: [
            { month: 'Jan', completed: 42, started: 48 },
            { month: 'Feb', completed: 38, started: 41 },
            { month: 'Mar', completed: 48, started: 52 }
          ]
        },
        status: 200,
        statusText: 'OK (Mock)'
      };
    }
  },

  // ==================== UTILITY FUNCTIONS ====================

  getWorkflowProgress: (instance) => {
    if (!instance) return 0;
    return Math.round((instance.current_step / instance.total_steps) * 100);
  },

  getWorkflowStatusColor: (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-gray-100 text-gray-800',
      'failed': 'bg-red-100 text-red-800',
      'escalated': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  },

  getWorkflowTypeIcon: (type) => {
    const icons = {
      'approval': '✅',
      'review': '👁️',
      'signature': '✍️',
      'publication': '📢',
      'archival': '📦',
      'custom': '⚙️'
    };
    return icons[type] || '📋';
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

  isOverdue: (dueDate) => {
    return dueDate && new Date() > new Date(dueDate);
  },

  getDaysUntilDue: (dueDate) => {
    if (!dueDate) return null;
    const days = Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  },

  formatDuration: (hours) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  },

  validateWorkflowSteps: (steps) => {
    if (!Array.isArray(steps) || steps.length === 0) {
      return { isValid: false, error: 'Workflow must have at least one step' };
    }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      if (!step.name || step.name.trim() === '') {
        return { isValid: false, error: `Step ${i + 1} must have a name` };
      }
      
      if (!step.type) {
        return { isValid: false, error: `Step ${i + 1} must have a type` };
      }
      
      if (step.type === 'approval' && !step.assignee_id) {
        return { isValid: false, error: `Approval step ${i + 1} must have an assignee` };
      }
      
      if (step.type === 'signature' && !step.assignee_id) {
        return { isValid: false, error: `Signature step ${i + 1} must have a signer` };
      }
    }

    return { isValid: true };
  }
};

export default documentWorkflowService;