/**
 * RTK Query Usage Examples
 * 
 * This file demonstrates various RTK Query patterns and best practices
 */

import React, { useState } from 'react';
import {
  useGetProjectsQuery,
  useGetProjectQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectStatusMutation,
} from '@/store/api';

/**
 * Example 1: Basic Query
 * Demonstrates fetching a list of projects with automatic caching
 */
export function BasicQueryExample() {
  const { data: projects, isLoading, isError, error, refetch } = useGetProjectsQuery();
  
  if (isLoading) {
    return <div className="p-4">Loading projects...</div>;
  }
  
  if (isError) {
    return (
      <div className="p-4 text-red-600">
        Error loading projects: {error?.message || 'Unknown error'}
      </div>
    );
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-2">
        {projects?.map((project) => (
          <div key={project.id} className="p-3 border rounded">
            <h3 className="font-medium">{project.name}</h3>
            <p className="text-sm text-gray-600">{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example 2: Query with Filters
 * Demonstrates filtering data with automatic refetching when filters change
 */
export function FilteredQueryExample() {
  const [filters, setFilters] = useState({ status: 'active' });
  
  const { data: projects, isLoading } = useGetProjectsQuery(filters);
  
  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Filter by Status:</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ status: e.target.value })}
          className="px-3 py-2 border rounded"
        >
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="on-hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-2">
          {projects?.map((project) => (
            <div key={project.id} className="p-3 border rounded">
              <h3 className="font-medium">{project.name}</h3>
              <span className="text-sm text-gray-600">Status: {project.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 3: Detail View with Conditional Query
 * Demonstrates fetching a single item with skip option
 */
export function DetailViewExample({ projectId }) {
  const { data: project, isLoading } = useGetProjectQuery(projectId, {
    skip: !projectId, // Skip query if no projectId
  });
  
  if (!projectId) {
    return <div className="p-4">Select a project to view details</div>;
  }
  
  if (isLoading) {
    return <div className="p-4">Loading project details...</div>;
  }
  
  if (!project) {
    return <div className="p-4">Project not found</div>;
  }
  
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{project.name}</h2>
      <div className="space-y-2">
        <p><strong>Description:</strong> {project.description}</p>
        <p><strong>Status:</strong> {project.status}</p>
        <p><strong>Priority:</strong> {project.priority}</p>
        <p><strong>Budget:</strong> ${project.budget}</p>
        <p><strong>Spent:</strong> ${project.spent}</p>
      </div>
    </div>
  );
}

/**
 * Example 4: Create Mutation
 * Demonstrates creating new data with loading and error states
 */
export function CreateProjectExample() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
  });
  
  const [createProject, { isLoading, isError, error, isSuccess }] = useCreateProjectMutation();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createProject(formData).unwrap();
      console.log('Project created:', result);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
      });
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="on-hold">On Hold</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Project'}
        </button>
        
        {isSuccess && (
          <div className="p-3 bg-green-50 text-green-700 rounded">
            Project created successfully!
          </div>
        )}
        
        {isError && (
          <div className="p-3 bg-red-50 text-red-700 rounded">
            Error: {error?.message || 'Failed to create project'}
          </div>
        )}
      </form>
    </div>
  );
}

/**
 * Example 5: Update Mutation with Optimistic Updates
 * Demonstrates updating data with immediate UI feedback
 */
export function OptimisticUpdateExample({ project }) {
  const [updateStatus] = useUpdateProjectStatusMutation();
  
  const handleStatusChange = (newStatus) => {
    // The UI will update immediately (optimistically)
    // If the request fails, it will rollback automatically
    updateStatus({
      id: project.id,
      status: newStatus,
    });
  };
  
  return (
    <div className="p-4">
      <h3 className="font-medium mb-2">{project.name}</h3>
      <p className="text-sm text-gray-600 mb-4">Current Status: {project.status}</p>
      
      <div className="space-x-2">
        <button
          onClick={() => handleStatusChange('active')}
          className="px-3 py-1 bg-green-500 text-white rounded text-sm"
        >
          Mark Active
        </button>
        <button
          onClick={() => handleStatusChange('completed')}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
        >
          Mark Complete
        </button>
        <button
          onClick={() => handleStatusChange('on-hold')}
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
        >
          Put On Hold
        </button>
      </div>
    </div>
  );
}

/**
 * Example 6: Delete Mutation with Confirmation
 * Demonstrates deleting data with user confirmation
 */
export function DeleteProjectExample({ project, onDeleted }) {
  const [deleteProject, { isLoading }] = useDeleteProjectMutation();
  
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }
    
    try {
      await deleteProject(project.id).unwrap();
      console.log('Project deleted');
      onDeleted?.();
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Failed to delete project');
    }
  };
  
  return (
    <button
      onClick={handleDelete}
      disabled={isLoading}
      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 disabled:opacity-50"
    >
      {isLoading ? 'Deleting...' : 'Delete'}
    </button>
  );
}

/**
 * Example 7: Polling (Auto-refresh)
 * Demonstrates automatic data refetching at intervals
 */
export function PollingExample() {
  const [pollingEnabled, setPollingEnabled] = useState(false);
  
  const { data: projects, isLoading } = useGetProjectsQuery(undefined, {
    pollingInterval: pollingEnabled ? 30000 : 0, // Poll every 30 seconds when enabled
  });
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Projects (Auto-refresh)</h2>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={pollingEnabled}
            onChange={(e) => setPollingEnabled(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Enable auto-refresh (30s)</span>
        </label>
      </div>
      
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-2">
          {projects?.map((project) => (
            <div key={project.id} className="p-3 border rounded">
              <h3 className="font-medium">{project.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Example 8: Complete CRUD Example
 * Demonstrates all operations together
 */
export function CompleteCRUDExample() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { data: projects, isLoading } = useGetProjectsQuery();
  const { data: selectedProject } = useGetProjectQuery(selectedProjectId, {
    skip: !selectedProjectId,
  });
  
  return (
    <div className="p-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Project List */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Projects</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
            >
              New Project
            </button>
          </div>
          
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {projects?.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedProjectId === project.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Right: Project Details or Create Form */}
        <div>
          {showCreateForm ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Create Project</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
              <CreateProjectExample />
            </div>
          ) : selectedProject ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Project Details</h2>
              <DetailViewExample projectId={selectedProjectId} />
              <div className="mt-4">
                <OptimisticUpdateExample project={selectedProject} />
              </div>
              <div className="mt-4">
                <DeleteProjectExample
                  project={selectedProject}
                  onDeleted={() => setSelectedProjectId(null)}
                />
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Select a project to view details</div>
          )}
        </div>
      </div>
    </div>
  );
}
