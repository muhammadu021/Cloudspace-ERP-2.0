/**
 * ProjectOverviewTab Component
 * 
 * Displays project summary, progress, budget overview, and team information.
 * Supports inline editing for key project fields.
 */

import React from 'react';
import {
  Calendar,
  Users,
  Banknote,
  CheckCircle,
  Target,
  Flag,
  Building,
  Mail,
  Phone,
  MapPin,
  Tag,
  Clock,
  TrendingUp,
} from 'lucide-react';
import Card from '@/design-system/components/Card';
import Badge from '@/design-system/components/Badge';
import InlineEditField from '@/design-system/components/InlineEditField';
import { useToast } from '@/design-system/components/Toast';
import { useUpdateProjectFieldMutation } from '@/store/api/projectsApi';
import { formatCurrency } from '@/utils/formatters';

const ProjectOverviewTab = ({ project, tasks = [] }) => {
  const { showToast } = useToast();
  const [updateProjectField] = useUpdateProjectFieldMutation();

  const safeArray = (data) => {
    if (Array.isArray(data)) return data;
    if (!data) return [];
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  };

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

  // Validation functions
  const validateRequired = (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return null;
  };

  const validateDate = (value) => {
    if (!value) return 'Date is required';
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    return null;
  };

  const validateEndDate = (value) => {
    const error = validateDate(value);
    if (error) return error;
    
    const startDate = new Date(project.start_date);
    const endDate = new Date(value);
    if (endDate < startDate) {
      return 'End date must be after start date';
    }
    return null;
  };

  const milestones = safeArray(project.milestones);
  const tags = safeArray(project.tags);
  const displayTasks = Array.isArray(tasks) ? tasks : [];

  const completedTasks = displayTasks.filter(t => t.status === 'completed').length;
  const totalTasks = displayTasks.length;
  const progress = project.progress_percentage || 
    (totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0);

  const budgetSpent = project.budget_spent || 0;
  const budgetAllocated = project.budget_allocated || 0;
  const budgetRemaining = budgetAllocated - budgetSpent;
  const budgetPercentage = budgetAllocated > 0 
    ? Math.min(100, (budgetSpent / budgetAllocated) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Project Description - Inline Editable */}
      <Card>
        <div className="p-6">
          <InlineEditField
            value={project.description || ''}
            onSave={(value) => handleFieldUpdate('description', value)}
            type="textarea"
            label="Description"
            placeholder="Add a project description..."
            multiline
            rows={4}
          />
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress */}
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary-600" />
              </div>
              <span className="text-2xl font-bold text-neutral-900">
                {progress}%
              </span>
            </div>
            <p className="text-sm text-neutral-600 mb-2">Progress</p>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Tasks */}
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-success-600" />
              </div>
              <span className="text-2xl font-bold text-neutral-900">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <p className="text-sm text-neutral-600">Tasks Completed</p>
          </div>
        </Card>

        {/* Budget */}
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-warning-100 rounded-lg">
                <Banknote className="h-5 w-5 text-warning-600" />
              </div>
              <span className="text-2xl font-bold text-neutral-900">
                {Math.round(budgetPercentage)}%
              </span>
            </div>
            <p className="text-sm text-neutral-600 mb-2">Budget Used</p>
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  budgetPercentage > 90 ? 'bg-error-600' : 
                  budgetPercentage > 75 ? 'bg-warning-600' : 
                  'bg-success-600'
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Team Size */}
        <Card>
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-info-100 rounded-lg">
                <Users className="h-5 w-5 text-info-600" />
              </div>
              <span className="text-2xl font-bold text-neutral-900">
                {(project.ProjectAssignments || []).length + 1}
              </span>
            </div>
            <p className="text-sm text-neutral-600">Team Members</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                Timeline
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InlineEditField
                  value={project.start_date}
                  onSave={(value) => handleFieldUpdate('start_date', value)}
                  type="date"
                  label="Start Date"
                  validation={validateDate}
                  required
                  displayFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }
                />
                <InlineEditField
                  value={project.end_date}
                  onSave={(value) => handleFieldUpdate('end_date', value)}
                  type="date"
                  label="End Date"
                  validation={validateEndDate}
                  required
                  displayFormatter={(value) =>
                    new Date(value).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Milestones */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary-600" />
                Milestones
              </h3>
              {milestones.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  No milestones defined
                </p>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone, idx) => {
                    const deliverables = safeArray(milestone.deliverables);
                    const completedDel = deliverables.filter(d => d.completed).length;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg"
                      >
                        <div
                          className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            milestone.completed
                              ? 'bg-success-100 text-success-600'
                              : 'bg-neutral-200 text-neutral-500'
                          }`}
                        >
                          {milestone.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Target className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-neutral-900">
                              {milestone.name}
                            </h4>
                            {milestone.date && (
                              <span className="text-sm text-neutral-600 whitespace-nowrap">
                                {new Date(milestone.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                          </div>
                          {milestone.description && (
                            <p className="text-sm text-neutral-600 mb-2">
                              {milestone.description}
                            </p>
                          )}
                          {deliverables.length > 0 && (
                            <p className="text-xs text-neutral-500">
                              {completedDel}/{deliverables.length} deliverables completed
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* Tags */}
          {tags.length > 0 && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary-600" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <Badge key={i} variant="default">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Manager */}
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
                Project Manager
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-lg flex-shrink-0">
                  {(project.Manager?.User?.first_name?.[0] || 'P')}
                  {(project.Manager?.User?.last_name?.[0] || 'M')}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-neutral-900 truncate">
                    {project.Manager?.User?.first_name}{' '}
                    {project.Manager?.User?.last_name}
                  </p>
                  <p className="text-sm text-neutral-500 truncate">
                    {project.Manager?.position || 'Project Manager'}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Budget Breakdown */}
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
                Budget
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Allocated</span>
                  <span className="font-semibold text-neutral-900">
                    {formatCurrency(budgetAllocated)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Spent</span>
                  <span className="font-semibold text-warning-600">
                    {formatCurrency(budgetSpent)}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-sm text-neutral-600">Remaining</span>
                  <span className="font-semibold text-success-600">
                    {formatCurrency(budgetRemaining)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Project Details */}
          <Card>
            <div className="p-6">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-4">
                Project Details
              </h3>
              <dl className="space-y-4">
                {project.Department?.name && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <dt className="text-xs text-neutral-500">Department</dt>
                      <dd className="text-sm font-medium text-neutral-900 truncate">
                        {project.Department.name}
                      </dd>
                    </div>
                  </div>
                )}
                {project.client_name && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <dt className="text-xs text-neutral-500">Client</dt>
                      <dd className="text-sm font-medium text-neutral-900 truncate">
                        {project.client_name}
                      </dd>
                    </div>
                  </div>
                )}
                {project.client_email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <dt className="text-xs text-neutral-500">Email</dt>
                      <dd className="text-sm font-medium text-neutral-900 truncate">
                        {project.client_email}
                      </dd>
                    </div>
                  </div>
                )}
                {project.client_phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <dt className="text-xs text-neutral-500">Phone</dt>
                      <dd className="text-sm font-medium text-neutral-900 truncate">
                        {project.client_phone}
                      </dd>
                    </div>
                  </div>
                )}
                {project.client_address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <dt className="text-xs text-neutral-500">Address</dt>
                      <dd className="text-sm font-medium text-neutral-900">
                        {project.client_address}
                      </dd>
                    </div>
                  </div>
                )}
              </dl>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewTab;
