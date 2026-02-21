/**
 * ProjectDetail Component - Unified Project Detail View with Tabbed Interface
 * 
 * Consolidates all project-related information into a single page with tabs:
 * - Overview: Project summary, progress, budget, and team
 * - Tasks: Task list with creation and inline editing
 * - Timeline: Gantt chart or timeline visualization
 * - Resources: Team members and resource allocation
 * - Budget: Budget vs. actual spending
 * 
 * Supports inline editing for project name, status, and priority.
 * 
 * Requirements: 4.3, 4.2, 4.6, 4.5
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  ArrowLeft,
  Edit,
  MoreVertical,
  LayoutGrid,
  CheckSquare,
  Calendar,
  Users,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { projectService } from '@/services/projectService';
import { useUpdateProjectFieldMutation } from '@/store/api/projectsApi';
import { useToast } from '@/design-system/components/Toast';
import Button from '@/design-system/components/Button';
import Badge from '@/design-system/components/Badge';
import InlineEditField from '@/design-system/components/InlineEditField';
import Tabs, { TabList, Tab, TabPanel } from '@/design-system/components/Tabs';
import ProjectOverviewTab from './tabs/ProjectOverviewTab';
import ProjectTasksTab from './tabs/ProjectTasksTab';
import ProjectTimelineTab from './tabs/ProjectTimelineTab';
import ProjectResourcesTab from './tabs/ProjectResourcesTab';
import ProjectBudgetTab from './tabs/ProjectBudgetTab';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [updateProjectField] = useUpdateProjectFieldMutation();

  // Fetch project data
  const { 
    data: project, 
    isLoading, 
    error 
  } = useQuery(
    ['project', id],
    () => projectService.getProjectById(id),
    {
      select: (response) => 
        response?.data?.data?.project || 
        response?.data?.project || 
        response?.project,
      enabled: !!id,
    }
  );

  // Fetch project tasks
  const { data: tasks } = useQuery(
    ['project-tasks', id],
    () => projectService.getProjectTasks(id),
    {
      select: (response) => 
        response?.data?.data?.tasks || 
        response?.data?.tasks || 
        [],
      enabled: !!id,
    }
  );

  // Handler for inline field updates
  const handleFieldUpdate = async (field, value) => {
    try {
      await updateProjectField({
        id: project.id,
        field,
        value,
      }).unwrap();
      
      showToast({
        type: 'success',
        message: 'Project updated successfully',
        duration: 3000,
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: error.message || 'Failed to update project',
        duration: 5000,
      });
      throw error; // Re-throw to trigger rollback in InlineEditField
    }
  };

  // Validation for project name
  const validateProjectName = (value) => {
    if (!value || value.trim() === '') {
      return 'Project name is required';
    }
    if (value.length < 3) {
      return 'Project name must be at least 3 characters';
    }
    return null;
  };

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

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4" />
          <div className="h-32 bg-neutral-200 rounded" />
          <div className="h-64 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !project) {
    return (
      <div className="p-6">
        <div className="text-center py-16">
          <AlertCircle className="mx-auto h-16 w-16 text-error-400 mb-4" />
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">
            Project Not Found
          </h3>
          <p className="text-neutral-600 mb-6">
            {error?.message || 'Unable to load project details.'}
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const taskCount = Array.isArray(tasks) ? tasks.length : 0;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/projects')}
            className="min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-8 w-px bg-neutral-200" />
          <p className="text-sm text-neutral-600">{project.code}</p>
        </div>

        {/* Inline editable project name */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex-1 max-w-2xl">
            <InlineEditField
              value={project.name}
              onSave={(value) => handleFieldUpdate('name', value)}
              type="text"
              placeholder="Project name"
              validation={validateProjectName}
              required
              displayFormatter={(value) => (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xl md:text-2xl font-bold text-neutral-900">
                    {value}
                  </span>
                  <Badge variant={getStatusVariant(project.status)}>
                    {project.status?.replace('_', ' ')}
                  </Badge>
                  <Badge variant={getPriorityVariant(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>
              )}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/projects/${id}/edit`)}
              className="min-h-[44px]"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="ghost"
              className="min-h-[44px]"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Inline editable status and priority */}
        <div className="flex flex-wrap gap-4">
          <InlineEditField
            value={project.status}
            onSave={(value) => handleFieldUpdate('status', value)}
            type="select"
            label="Status"
            options={[
              { value: 'planning', label: 'Planning' },
              { value: 'active', label: 'Active' },
              { value: 'on_hold', label: 'On Hold' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            className="w-48"
          />
          <InlineEditField
            value={project.priority}
            onSave={(value) => handleFieldUpdate('priority', value)}
            type="select"
            label="Priority"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'critical', label: 'Critical' },
            ]}
            className="w-48"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
        <TabList>
          <Tab id="overview" icon={LayoutGrid}>
            Overview
          </Tab>
          <Tab id="tasks" icon={CheckSquare} badge={taskCount}>
            Tasks
          </Tab>
          <Tab id="timeline" icon={Calendar}>
            Timeline
          </Tab>
          <Tab id="resources" icon={Users}>
            Resources
          </Tab>
          <Tab id="budget" icon={DollarSign}>
            Budget
          </Tab>
        </TabList>

        {/* Tab Panels */}
        <TabPanel id="overview">
          <ProjectOverviewTab project={project} tasks={tasks} />
        </TabPanel>

        <TabPanel id="tasks" lazy>
          <ProjectTasksTab projectId={id} tasks={tasks} />
        </TabPanel>

        <TabPanel id="timeline" lazy>
          <ProjectTimelineTab project={project} tasks={tasks} />
        </TabPanel>

        <TabPanel id="resources" lazy>
          <ProjectResourcesTab project={project} />
        </TabPanel>

        <TabPanel id="budget" lazy>
          <ProjectBudgetTab project={project} />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default ProjectDetail;
