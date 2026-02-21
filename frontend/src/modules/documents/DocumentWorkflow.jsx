import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Play, Pause, Settings, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react'
import documentWorkflowService from '../../services/documentWorkflowService'
import WorkflowBuilder from './components/WorkflowBuilder.jsx'
import toast from 'react-hot-toast'

const DocumentWorkflow = () => {
  const [showBuilder, setShowBuilder] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const queryClient = useQueryClient()

  const { data: workflowsData, isLoading } = useQuery(
    'document-workflows',
    () => documentWorkflowService.getWorkflows(),
    { select: (res) => res.data?.data?.workflows || [] }
  )

  const { data: instancesData } = useQuery(
    'workflow-instances',
    () => documentWorkflowService.getWorkflowInstances(),
    { select: (res) => res.data?.data?.instances || [] }
  )

  const createMutation = useMutation(
    (data) => documentWorkflowService.createWorkflow(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('document-workflows')
        setShowBuilder(false)
        toast.success('Workflow created successfully')
      },
      onError: (err) => toast.error(err.response?.data?.message || 'Failed to create workflow')
    }
  )

  const workflows = workflowsData || []
  const instances = instancesData || []

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress': return <Clock className="h-5 w-5 text-primary" />
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />
      case 'rejected': return <AlertTriangle className="h-5 w-5 text-red-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Workflow</h1>
          <p className="text-gray-600">Manage document approval workflows</p>
        </div>
        <button
          onClick={() => { setSelectedWorkflow(null); setShowBuilder(true) }}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" /> Create Workflow
        </button>
      </div>

      {/* Workflow Templates */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Workflow Templates</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : workflows.length > 0 ? (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Settings className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{workflow.name}</h3>
                      <p className="text-sm text-gray-500">{workflow.description || 'No description'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${workflow.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => { setSelectedWorkflow(workflow); setShowBuilder(true) }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows yet</h3>
              <p className="text-gray-500 mb-4">Create your first approval workflow</p>
              <button
                onClick={() => setShowBuilder(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Create Workflow
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Workflow Instances */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Active Approvals</h2>
        </div>
        <div className="p-6">
          {instances.length > 0 ? (
            <div className="space-y-4">
              {instances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(instance.status)}
                    <div>
                      <h3 className="font-medium text-gray-900">{instance.document?.title || 'Document'}</h3>
                      <p className="text-sm text-gray-500">Step {instance.current_step} of {instance.total_steps}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    instance.status === 'completed' ? 'bg-green-100 text-green-800' :
                    instance.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {instance.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No active approvals</p>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">{selectedWorkflow ? 'Edit Workflow' : 'Create Workflow'}</h2>
              <button onClick={() => setShowBuilder(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6">
              <WorkflowBuilder
                workflow={selectedWorkflow}
                onSave={(data) => { createMutation.mutate(data); setShowBuilder(false); }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentWorkflow
