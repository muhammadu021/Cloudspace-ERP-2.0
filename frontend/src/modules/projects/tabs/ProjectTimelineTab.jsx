/**
 * ProjectTimelineTab Component
 * 
 * Displays project timeline with milestones and tasks visualization.
 * Shows a simplified Gantt-style timeline view.
 */

import React from 'react';
import {
  Calendar,
  Flag,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import Card from '@/design-system/components/Card';
import Badge from '@/design-system/components/Badge';

const ProjectTimelineTab = ({ project, tasks = [] }) => {
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

  const milestones = safeArray(project.milestones);
  const displayTasks = Array.isArray(tasks) ? tasks : [];

  // Calculate project duration
  const startDate = new Date(project.start_date);
  const endDate = new Date(project.end_date);
  const today = new Date();
  const totalDuration = endDate - startDate;
  const elapsed = today - startDate;
  const progressPercentage = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  // Get position percentage for a date
  const getDatePosition = (date) => {
    if (!date) return 0;
    const dateObj = new Date(date);
    const position = ((dateObj - startDate) / totalDuration) * 100;
    return Math.min(100, Math.max(0, position));
  };

  // Status colors
  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-neutral-300',
      in_progress: 'bg-info-500',
      review: 'bg-warning-500',
      done: 'bg-success-500',
      completed: 'bg-success-500',
    };
    return colors[status] || 'bg-neutral-300';
  };

  // Sort milestones by date
  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });

  // Sort tasks by due date
  const sortedTasks = [...displayTasks]
    .filter(task => task.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

  return (
    <div className="space-y-6">
      {/* Project Timeline Overview */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            Project Timeline
          </h3>

          {/* Timeline Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-neutral-600 mb-2">
              <span>
                {startDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
              <span>
                {endDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="relative h-8 bg-neutral-200 rounded-lg overflow-hidden">
              {/* Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-primary-500 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
              {/* Today marker */}
              {progressPercentage >= 0 && progressPercentage <= 100 && (
                <div
                  className="absolute top-0 h-full w-0.5 bg-error-600"
                  style={{ left: `${progressPercentage}%` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs text-error-600 font-medium whitespace-nowrap">
                    Today
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Start</span>
              <span>{Math.round(progressPercentage)}% elapsed</span>
              <span>End</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-neutral-900">
                {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))}
              </p>
              <p className="text-sm text-neutral-600">Total Days</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-neutral-900">
                {Math.max(0, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)))}
              </p>
              <p className="text-sm text-neutral-600">Days Elapsed</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <p className="text-2xl font-bold text-neutral-900">
                {Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)))}
              </p>
              <p className="text-sm text-neutral-600">Days Remaining</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones Timeline */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Flag className="h-5 w-5 text-primary-600" />
            Milestones
          </h3>

          {sortedMilestones.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">
              No milestones defined
            </p>
          ) : (
            <div className="space-y-4">
              {sortedMilestones.map((milestone, idx) => {
                const position = getDatePosition(milestone.date);
                const deliverables = safeArray(milestone.deliverables);
                const completedDel = deliverables.filter(d => d.completed).length;

                return (
                  <div key={idx} className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-neutral-200 last:hidden" />

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          milestone.completed
                            ? 'bg-success-100 text-success-600'
                            : 'bg-neutral-200 text-neutral-500'
                        }`}
                      >
                        {milestone.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Flag className="h-4 w-4" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h4 className="font-semibold text-neutral-900">
                              {milestone.name}
                            </h4>
                            {milestone.description && (
                              <p className="text-sm text-neutral-600 mt-1">
                                {milestone.description}
                              </p>
                            )}
                          </div>
                          {milestone.date && (
                            <Badge variant={milestone.completed ? 'success' : 'default'}>
                              {new Date(milestone.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Badge>
                          )}
                        </div>

                        {deliverables.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-neutral-500 mb-2">
                              {completedDel}/{deliverables.length} deliverables completed
                            </p>
                            <div className="w-full bg-neutral-200 rounded-full h-1.5">
                              <div
                                className="bg-success-500 h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${(completedDel / deliverables.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Tasks Timeline */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary-600" />
            Upcoming Tasks
          </h3>

          {sortedTasks.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">
              No tasks with due dates
            </p>
          ) : (
            <div className="space-y-3">
              {sortedTasks.slice(0, 10).map((task) => {
                const dueDate = new Date(task.due_date);
                const isOverdue = dueDate < today && task.status !== 'completed' && task.status !== 'done';
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    {/* Status Icon */}
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        task.status === 'completed' || task.status === 'done'
                          ? 'bg-success-100 text-success-600'
                          : task.status === 'in_progress'
                          ? 'bg-info-100 text-info-600'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {task.status === 'completed' || task.status === 'done' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : task.status === 'in_progress' ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                    </div>

                    {/* Task Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-neutral-900 truncate">
                        {task.title}
                      </p>
                      <p className="text-sm text-neutral-600">
                        {task.assigned_to
                          ? `${task.assigned_to.first_name} ${task.assigned_to.last_name}`
                          : 'Unassigned'}
                      </p>
                    </div>

                    {/* Due Date */}
                    <div className="text-right flex-shrink-0">
                      <Badge
                        variant={
                          isOverdue
                            ? 'error'
                            : daysUntilDue <= 3
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {dueDate.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Badge>
                      {isOverdue && (
                        <p className="text-xs text-error-600 mt-1">
                          {Math.abs(daysUntilDue)} days overdue
                        </p>
                      )}
                      {!isOverdue && daysUntilDue >= 0 && daysUntilDue <= 7 && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {daysUntilDue === 0
                            ? 'Due today'
                            : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}
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
    </div>
  );
};

export default ProjectTimelineTab;
