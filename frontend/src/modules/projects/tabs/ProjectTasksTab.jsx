/**
 * ProjectTasksTab Component
 * 
 * Displays task list with creation and inline editing capabilities.
 */

import React, { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  User,
} from 'lucide-react';
import Card from '@/design-system/components/Card';
import Button from '@/design-system/components/Button';
import Badge from '@/design-system/components/Badge';
import DataTable from '@/design-system/components/DataTable';
import Modal from '@/design-system/components/Modal';
import FormField from '@/design-system/components/FormField';
import { projectService } from '@/services/projectService';
import toast from 'react-hot-toast';

const ProjectTasksTab = ({ projectId, tasks = [] }) => {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: '',
    assigned_to: '',
  });

  // Create task mutation
  const createTaskMutation = useMutation(
    (taskData) => projectService.createTask(projectId, taskData),
    {
      onSuccess: () => {
        toast.success('Task created successfully');
        queryClient.invalidateQueries(['project-tasks', projectId]);
        setShowCreateModal(false);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to create task');
      },
    }
  );

  // Update task mutation
  const updateTaskMutation = useMutation(
    ({ taskId, data }) => projectService.updateTask(taskId, data),
    {
      onSuccess: () => {
        toast.success('Task updated successfully');
        queryClient.invalidateQueries(['project-tasks', projectId]);
        setEditingTask(null);
        resetForm();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update task');
      },
    }
  );

  // Delete task mutation
  const deleteTaskMutation = useMutation(
    (taskId) => projectService.deleteTask(taskId),
    {
      onSuccess: () => {
        toast.success('Task deleted successfully');
        queryClient.invalidateQueries(['project-tasks', projectId]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete task');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      assigned_to: '',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      updateTaskMutation.mutate({ taskId: editingTask.id, data: formData });
    } else {
      createTaskMutation.mutate(formData);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: task.due_date || '',
      assigned_to: task.assigned_to?.id || '',
    });
    setShowCreateModal(true);
  };

  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(taskId);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingTask(null);
    resetForm();
  };

  // Status badge variant
  const getStatusVariant = (status) => {
    const variants = {
      todo: 'default',
      in_progress: 'info',
      review: 'warning',
      done: 'success',
      completed: 'success',
    };
    return variants[status] || 'default';
  };

  // Priority badge variant
  const getPriorityVariant = (priority) => {
    const variants = {
      low: 'success',
      medium: 'warning',
      high: 'error',
    };
    return variants[priority] || 'default';
  };

  // Status icon
  const getStatusIcon = (status) => {
    if (status === 'completed' || status === 'done') {
      return <CheckCircle className="h-4 w-4 text-success-600" />;
    }
    if (status === 'in_progress') {
      return <Clock className="h-4 w-4 text-info-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-neutral-400" />;
  };

  // DataTable columns
  const columns = [
    {
      key: 'title',
      header: 'Task',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(row.status)}
          <div>
            <p className="font-medium text-neutral-900">{value}</p>
            {row.description && (
              <p className="text-sm text-neutral-500 truncate max-w-md">
                {row.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value?.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (value) => (
        <Badge variant={getPriorityVariant(value)}>
          {value}
        </Badge>
      ),
    },
    {
      key: 'assigned_to',
      header: 'Assigned To',
      render: (value) => (
        <div className="flex items-center gap-2">
          {value ? (
            <>
              <User className="h-4 w-4 text-neutral-400" />
              <span className="text-sm text-neutral-700">
                {value.first_name} {value.last_name}
              </span>
            </>
          ) : (
            <span className="text-sm text-neutral-400">Unassigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'due_date',
      header: 'Due Date',
      sortable: true,
      render: (value) => (
        value ? (
          <span className="text-sm text-neutral-700">
            {new Date(value).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ) : (
          <span className="text-sm text-neutral-400">No due date</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            title="Edit Task"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row.id)}
            title="Delete Task"
          >
            <Trash2 className="h-4 w-4 text-error-600" />
          </Button>
        </div>
      ),
    },
  ];

  const displayTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900">Tasks</h3>
          <p className="text-sm text-neutral-600">
            {displayTasks.length} task{displayTasks.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="min-h-[44px]"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Tasks Table */}
      <Card>
        <DataTable
          data={displayTasks}
          columns={columns}
          pagination
          pageSize={20}
          emptyMessage="No tasks yet. Create your first task to get started."
        />
      </Card>

      {/* Create/Edit Task Modal */}
      <Modal
        open={showCreateModal}
        onClose={handleCloseModal}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            type="text"
            label="Task Title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Enter task title"
          />

          <FormField
            type="textarea"
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Enter task description"
            rows={3}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              type="select"
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="review">Review</option>
              <option value="done">Done</option>
            </FormField>

            <FormField
              type="select"
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </FormField>
          </div>

          <FormField
            type="date"
            label="Due Date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={createTaskMutation.isLoading || updateTaskMutation.isLoading}
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectTasksTab;
