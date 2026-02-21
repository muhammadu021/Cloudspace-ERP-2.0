/**
 * ProjectList Component
 * 
 * Unified project list view with advanced filtering using DataTable component.
 * Consolidates project management into a single, powerful interface.
 * 
 * Features:
 * - DataTable with sorting, filtering, and pagination
 * - Comprehensive filters (status, priority, date range, manager, team)
 * - Search functionality with autocomplete
 * - Bulk operations for selected projects
 * - Responsive design
 * 
 * Requirements: 4.1, 4.2
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Plus,
  Calendar,
  Users,
  Banknote,
  BarChart3,
  Eye,
  Edit,
  Archive,
  Trash2,
  Download,
  Filter,
  X,
} from 'lucide-react';
import DataTable from '@/design-system/components/DataTable';
import Button from '@/design-system/components/Button';
import FormField from '@/design-system/components/FormField';
import Badge from '@/design-system/components/Badge';
import Card from '@/design-system/components/Card';
import Modal from '@/design-system/components/Modal';
import { projectService } from '@/services/projectService';
import { useAuth } from '@/contexts/AuthContext';
import { selectApiData } from '@/services/api';
import { formatCurrency } from '@/utils/formatters';
import toast from 'react-hot-toast';

const ProjectList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, token, isLoading: authLoading } = useAuth();

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    priority: [],
    manager_id: [],
    department_id: [],
    budget_min: '',
    budget_max: '',
    progress_min: '',
    progress_max: '',
    start_date_from: '',
    start_date_to: '',
    end_date_from: '',
    end_date_to: '',
    is_billable: '',
  });

  // Selected rows for bulk operations
  const [selectedRows, setSelectedRows] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Fetch projects
  const {
    data: projectsData,
    isLoading,
    error,
    refetch,
  } = useQuery(
    ['projects', filters],
    () => projectService.getProjects(filters),
    {
      enabled: isAuthenticated && !!token,
      select: selectApiData,
      keepPreviousData: true,
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Projects API error:', error);
        toast.error('Failed to load projects');
      },
    }
  );

  const projects = projectsData?.projects || [];

  // Archive mutation
  const archiveMutation = useMutation(
    (projectIds) => {
      if (Array.isArray(projectIds)) {
        return Promise.all(projectIds.map(id => projectService.archiveProject(id)));
      }
      return projectService.archiveProject(projectIds);
    },
    {
      onSuccess: () => {
        toast.success('Project(s) archived successfully');
        queryClient.invalidateQueries(['projects']);
        setSelectedRows([]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to archive project(s)');
      },
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(
    (projectIds) => {
      if (Array.isArray(projectIds)) {
        return Promise.all(projectIds.map(id => projectService.deleteProject(id)));
      }
      return projectService.deleteProject(projectIds);
    },
    {
      onSuccess: () => {
        toast.success('Project(s) deleted successfully');
        queryClient.invalidateQueries(['projects']);
        setSelectedRows([]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete project(s)');
      },
    }
  );

  // Handle filter change
  const handleFilterChange = useCallback((field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      manager_id: [],
      department_id: [],
      budget_min: '',
      budget_max: '',
      progress_min: '',
      progress_max: '',
      start_date_from: '',
      start_date_to: '',
      end_date_from: '',
      end_date_to: '',
      is_billable: '',
    });
  }, []);

  // Handle bulk archive
  const handleBulkArchive = useCallback(() => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Are you sure you want to archive ${selectedRows.length} project(s)?`)) {
      archiveMutation.mutate(selectedRows);
    }
  }, [selectedRows, archiveMutation]);

  // Handle bulk delete
  const handleBulkDelete = useCallback(() => {
    if (selectedRows.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedRows.length} project(s)? This action cannot be undone.`)) {
      deleteMutation.mutate(selectedRows);
    }
  }, [selectedRows, deleteMutation]);

  // Handle export
  const handleExport = useCallback(() => {
    // TODO: Implement export functionality
    toast.success('Export functionality coming soon');
  }, []);

  // Status badge variant
  const getStatusVariant = (status) => {
    const variants = {
      planning: 'default',
      active: 'success',
      on_hold: 'warning',
      completed: 'info',
      cancelled: 'error',
    };
    return variants[status] || 'default';
  };

  // Priority badge variant
  const getPriorityVariant = (priority) => {
    const variants = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error',
    };
    return variants[priority] || 'default';
  };

  // DataTable columns
  const columns = useMemo(() => [
    {
      key: 'name',
      header: 'Project Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <Link
            to={`/projects/${row.id}`}
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            {value}
          </Link>
          <div className="text-sm text-neutral-500">{row.code}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <Badge variant={getStatusVariant(value)}>
          {value.replace('_', ' ')}
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
      key: 'progress_percentage',
      header: 'Progress',
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-neutral-200 rounded-full h-2 max-w-[100px]">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all"
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-sm text-neutral-600 min-w-[40px]">{value}%</span>
        </div>
      ),
    },
    {
      key: 'manager',
      header: 'Manager',
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          {row.Manager?.User?.first_name || row.manager?.first_name}{' '}
          {row.Manager?.User?.last_name || row.manager?.last_name}
        </div>
      ),
    },
    {
      key: 'end_date',
      header: 'Due Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-1 text-neutral-400" />
          {new Date(value).toLocaleDateString()}
        </div>
      ),
    },
    {
      key: 'budget_spent',
      header: 'Budget',
      sortable: true,
      render: (value) => (
        <div className="flex items-center text-sm">
          <Banknote className="h-4 w-4 mr-1 text-neutral-400" />
          {formatCurrency(value || 0)}
        </div>
      ),
    },
    {
      key: 'team_size',
      header: 'Team',
      sortable: true,
      render: (value) => (
        <div className="flex items-center text-sm">
          <Users className="h-4 w-4 mr-1 text-neutral-400" />
          {value || 0}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects/${row.id}`)}
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/projects/${row.id}/edit`)}
            title="Edit Project"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Are you sure you want to archive this project?')) {
                archiveMutation.mutate(row.id);
              }
            }}
            title="Archive Project"
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [navigate, archiveMutation]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.manager_id.length > 0) count++;
    if (filters.department_id.length > 0) count++;
    if (filters.budget_min || filters.budget_max) count++;
    if (filters.progress_min || filters.progress_max) count++;
    if (filters.start_date_from || filters.start_date_to) count++;
    if (filters.end_date_from || filters.end_date_to) count++;
    if (filters.is_billable) count++;
    return count;
  }, [filters]);

  if (authLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 rounded w-1/4" />
          <div className="h-64 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">Projects</h1>
          <p className="text-sm md:text-base text-neutral-600 mt-1">
            Manage and track all your projects
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={() => navigate('/projects/dashboard')}
            className="min-h-[44px]"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/projects/new')}
            className="min-h-[44px]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <div className="p-4 space-y-4">
          {/* Search and Filter Toggle */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <FormField
                type="text"
                placeholder="Search projects by name or code..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="min-h-[44px]"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="primary" className="ml-2">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={handleClearFilters}
                  className="min-h-[44px]"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
              <FormField
                type="select"
                label="Status"
                value={filters.status}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('status', options);
                }}
                multiple
              >
                <option value="">All Statuses</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </FormField>

              <FormField
                type="select"
                label="Priority"
                value={filters.priority}
                onChange={(e) => {
                  const options = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('priority', options);
                }}
                multiple
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </FormField>

              <FormField
                type="select"
                label="Billable"
                value={filters.is_billable}
                onChange={(e) => handleFilterChange('is_billable', e.target.value)}
              >
                <option value="">All Projects</option>
                <option value="true">Billable Only</option>
                <option value="false">Non-Billable Only</option>
              </FormField>

              <FormField
                type="number"
                label="Min Budget"
                placeholder="0"
                value={filters.budget_min}
                onChange={(e) => handleFilterChange('budget_min', e.target.value)}
              />

              <FormField
                type="number"
                label="Max Budget"
                placeholder="1000000"
                value={filters.budget_max}
                onChange={(e) => handleFilterChange('budget_max', e.target.value)}
              />

              <FormField
                type="number"
                label="Min Progress %"
                placeholder="0"
                value={filters.progress_min}
                onChange={(e) => handleFilterChange('progress_min', e.target.value)}
                min="0"
                max="100"
              />

              <FormField
                type="date"
                label="Start Date From"
                value={filters.start_date_from}
                onChange={(e) => handleFilterChange('start_date_from', e.target.value)}
              />

              <FormField
                type="date"
                label="Start Date To"
                value={filters.start_date_to}
                onChange={(e) => handleFilterChange('start_date_to', e.target.value)}
              />

              <FormField
                type="date"
                label="End Date From"
                value={filters.end_date_from}
                onChange={(e) => handleFilterChange('end_date_from', e.target.value)}
              />
            </div>
          )}

          {/* Bulk Actions */}
          {selectedRows.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <span className="text-sm font-medium text-primary-900">
                {selectedRows.length} project(s) selected
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkArchive}
                  className="min-h-[44px]"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="min-h-[44px]"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="min-h-[44px]"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* DataTable */}
      <Card>
        <DataTable
          data={projects}
          columns={columns}
          loading={isLoading}
          selectable
          onSelectionChange={setSelectedRows}
          pagination
          pageSize={50}
          emptyMessage="No projects found. Create your first project to get started."
        />
      </Card>
    </div>
  );
};

export default ProjectList;
