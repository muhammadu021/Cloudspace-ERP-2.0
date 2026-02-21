/**
 * ProjectResourcesTab Component
 * 
 * Displays team members and resource allocation for the project.
 */

import React from 'react';
import {
  Users,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  Clock,
} from 'lucide-react';
import Card from '@/design-system/components/Card';
import Badge from '@/design-system/components/Badge';

const ProjectResourcesTab = ({ project }) => {
  const manager = project.Manager;
  const assignments = project.ProjectAssignments || [];

  // Calculate team statistics
  const totalMembers = assignments.length + 1; // +1 for manager
  const activeMembers = assignments.filter(a => a.status === 'active').length + 1;

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary-600" />
            Team Overview
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-neutral-50 rounded-lg">
              <p className="text-3xl font-bold text-neutral-900">{totalMembers}</p>
              <p className="text-sm text-neutral-600 mt-1">Total Members</p>
            </div>
            <div className="text-center p-4 bg-success-50 rounded-lg">
              <p className="text-3xl font-bold text-success-700">{activeMembers}</p>
              <p className="text-sm text-neutral-600 mt-1">Active Members</p>
            </div>
            <div className="text-center p-4 bg-info-50 rounded-lg">
              <p className="text-3xl font-bold text-info-700">
                {assignments.reduce((sum, a) => sum + (a.allocation_percentage || 0), 0) / assignments.length || 0}%
              </p>
              <p className="text-sm text-neutral-600 mt-1">Avg. Allocation</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Manager */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Project Manager
          </h3>

          {manager ? (
            <div className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg">
              {/* Avatar */}
              <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-semibold text-xl flex-shrink-0">
                {(manager.User?.first_name?.[0] || 'P')}
                {(manager.User?.last_name?.[0] || 'M')}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-neutral-900 text-lg">
                      {manager.User?.first_name} {manager.User?.last_name}
                    </h4>
                    <p className="text-sm text-neutral-600">
                      {manager.position || 'Project Manager'}
                    </p>
                  </div>
                  <Badge variant="success">Manager</Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {manager.User?.email && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Mail className="h-4 w-4 text-neutral-400" />
                      <span className="truncate">{manager.User.email}</span>
                    </div>
                  )}
                  {manager.User?.phone && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Phone className="h-4 w-4 text-neutral-400" />
                      <span>{manager.User.phone}</span>
                    </div>
                  )}
                  {manager.Department?.name && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Briefcase className="h-4 w-4 text-neutral-400" />
                      <span>{manager.Department.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">
              No project manager assigned
            </p>
          )}
        </div>
      </Card>

      {/* Team Members */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Team Members ({assignments.length})
          </h3>

          {assignments.length === 0 ? (
            <p className="text-neutral-500 text-center py-8">
              No team members assigned yet
            </p>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => {
                const employee = assignment.Employee;
                const user = employee?.User;

                return (
                  <div
                    key={assignment.id}
                    className="flex items-start gap-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="h-12 w-12 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-600 font-semibold flex-shrink-0">
                      {(user?.first_name?.[0] || 'T')}
                      {(user?.last_name?.[0] || 'M')}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold text-neutral-900">
                            {user?.first_name} {user?.last_name}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {assignment.role || employee?.position || 'Team Member'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {assignment.allocation_percentage && (
                            <Badge variant="info">
                              {assignment.allocation_percentage}% allocated
                            </Badge>
                          )}
                          <Badge
                            variant={
                              assignment.status === 'active'
                                ? 'success'
                                : 'default'
                            }
                          >
                            {assignment.status || 'active'}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        {user?.email && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Mail className="h-4 w-4 text-neutral-400" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        )}
                        {user?.phone && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Phone className="h-4 w-4 text-neutral-400" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {employee?.Department?.name && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Briefcase className="h-4 w-4 text-neutral-400" />
                            <span>{employee.Department.name}</span>
                          </div>
                        )}
                        {assignment.start_date && (
                          <div className="flex items-center gap-2 text-sm text-neutral-600">
                            <Calendar className="h-4 w-4 text-neutral-400" />
                            <span>
                              Since{' '}
                              {new Date(assignment.start_date).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hours/Workload */}
                      {(assignment.estimated_hours || assignment.actual_hours) && (
                        <div className="mt-3 pt-3 border-t border-neutral-200">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-neutral-600">
                              <Clock className="h-4 w-4 text-neutral-400" />
                              <span>Hours</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {assignment.estimated_hours && (
                                <span className="text-neutral-600">
                                  Est: {assignment.estimated_hours}h
                                </span>
                              )}
                              {assignment.actual_hours && (
                                <span className="font-medium text-neutral-900">
                                  Actual: {assignment.actual_hours}h
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Resource Allocation Chart */}
      {assignments.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
              Resource Allocation
            </h3>

            <div className="space-y-3">
              {assignments.map((assignment) => {
                const employee = assignment.Employee;
                const user = employee?.User;
                const allocation = assignment.allocation_percentage || 0;

                return (
                  <div key={assignment.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-900">
                        {user?.first_name} {user?.last_name}
                      </span>
                      <span className="text-sm text-neutral-600">{allocation}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          allocation > 90
                            ? 'bg-error-500'
                            : allocation > 75
                            ? 'bg-warning-500'
                            : 'bg-success-500'
                        }`}
                        style={{ width: `${allocation}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProjectResourcesTab;
