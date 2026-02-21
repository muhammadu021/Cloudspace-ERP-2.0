/**
 * ProjectBoard Component - Kanban Board View
 * 
 * Visual project management using a Kanban board with drag-and-drop.
 * Projects can be moved between status columns.
 * 
 * Features:
 * - Kanban board with status columns
 * - Drag-and-drop project cards
 * - Status-based organization
 * - Quick project actions
 * - Responsive design
 * 
 * Requirements: 4.1
 */

import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  ArrowLeft,
  Plus,
  Calendar,
  Users,
  List,
} from "lucide-react";
import Button from '@/design-system/components/Button';
import FormField from '@/design-system/components/FormField';
import Badge from '@/design-system/components/Badge';
import { projectService } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { selectApiData } from "@/services/api";
import { usePageTitle } from '@/hooks/usePageTitle';
import toast from 'react-hot-toast';

// Kanban columns configuration
const KANBAN_COLUMNS = [
  { id: 'planning', title: 'Planning', color: 'bg-neutral-100' },
  { id: 'active', title: 'Active', color: 'bg-success-100' },
  { id: 'on_hold', title: 'On Hold', color: 'bg-warning-100' },
  { id: 'completed', title: 'Completed', color: 'bg-info-100' },
  { id: 'cancelled', title: 'Cancelled', color: 'bg-error-100' },
];

const ProjectBoard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, token } = useAuth();
  
  const [filters, setFilters] = useState({
    search: '',
  });

  // Fetch projects
  const {
    data: projectsData,
    isLoading,
  } = useQuery(
    ["projects", filters],
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

  // Update project status mutation
  const updateStatusMutation = useMutation(
    ({ projectId, newStatus }) => projectService.updateProject(projectId, { status: newStatus }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        toast.success('Project status updated');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update project status');
        queryClient.invalidateQueries(['projects']); // Revert optimistic update
      },
    }
  );

  // Group projects by status
  const projectsByStatus = React.useMemo(() => {
    const grouped = {};
    KANBAN_COLUMNS.forEach(column => {
      grouped[column.id] = projects.filter(project => project.status === column.id);
    });
    return grouped;
  }, [projects]);

  // Handle drag end
  const handleDragEnd = useCallback((result) => {
    const { source, destination, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const projectId = draggableId;
    const newStatus = destination.droppableId;

    // Optimistic update
    queryClient.setQueryData(['projects', filters], (oldData) => {
      if (!oldData) return oldData;
      
      const updatedProjects = oldData.data.projects.map(project =>
        project.id.toString() === projectId
          ? { ...project, status: newStatus }
          : project
      );
      
      return {
        ...oldData,
        data: {
          ...oldData.data,
          projects: updatedProjects,
        },
      };
    });

    // Update on server
    updateStatusMutation.mutate({ projectId, newStatus });
  }, [filters, queryClient, updateStatusMutation]);

  // Get priority badge variant
  const getPriorityVariant = (priority) => {
    const variants = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error',
    };
    return variants[priority] || 'default';
  };

  // Set page title and actions in the top nav bar
  usePageTitle('Kanban Board', [
    <FormField
      key="search"
      type="text"
      placeholder="Search..."
      value={filters.search}
      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
      className="w-48"
    />,
    <Button
      key="list"
      variant="outline"
      size="sm"
      onClick={() => navigate('/projects')}
    >
      <List className="h-4 w-4 mr-1" />
      List View
    </Button>,
    <Button
      key="new"
      variant="primary"
      size="sm"
      onClick={() => navigate('/projects/new')}
    >
      <Plus className="h-4 w-4 mr-1" />
      New Project
    </Button>
  ]);

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-neutral-400">Loading projects...</div>
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="h-full overflow-x-auto">
              <div className="flex gap-3 h-full p-4 min-w-max">
                {KANBAN_COLUMNS.map(column => (
                  <div key={column.id} className="w-72 flex-shrink-0 flex flex-col">
                    {/* Compact Column Header */}
                    <div className="bg-white border border-neutral-200 rounded-t-lg px-3 py-2 flex items-center justify-between">
                      <h3 className="text-sm font-medium text-neutral-700">
                        {column.title}
                      </h3>
                      <span className="text-xs font-medium text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                        {projectsByStatus[column.id]?.length || 0}
                      </span>
                    </div>

                    {/* Column Content */}
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 bg-neutral-100 border-x border-b border-neutral-200 rounded-b-lg p-2 overflow-y-auto ${
                            snapshot.isDraggingOver ? 'bg-primary-50' : ''
                          }`}
                        >
                          <div className="space-y-2">
                            {projectsByStatus[column.id]?.map((project, index) => (
                              <Draggable
                                key={project.id}
                                draggableId={project.id.toString()}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    {/* Compact Project Card */}
                                    <div
                                      className={`bg-white border border-neutral-200 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow ${
                                        snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                      }`}
                                      onClick={() => navigate(`/projects/${project.id}`)}
                                    >
                                      {/* Project Name */}
                                      <h4 className="text-sm font-medium text-neutral-900 mb-2 line-clamp-2">
                                        {project.name}
                                      </h4>

                                      {/* Priority & Status */}
                                      <div className="flex items-center gap-2 mb-2">
                                        <Badge variant={getPriorityVariant(project.priority)} size="sm">
                                          {project.priority}
                                        </Badge>
                                        <span className="text-xs text-neutral-500">{project.code}</span>
                                      </div>

                                      {/* Compact Stats */}
                                      <div className="space-y-1.5 text-xs text-neutral-600 mb-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <Calendar className="h-3 w-3 mr-1.5 text-neutral-400" />
                                            <span>{new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                          </div>
                                          <div className="flex items-center">
                                            <Users className="h-3 w-3 mr-1 text-neutral-400" />
                                            <span>{project.team_size || 0}</span>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Compact Progress Bar */}
                                      <div>
                                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                                          <span>Progress</span>
                                          <span className="font-medium">{project.progress_percentage}%</span>
                                        </div>
                                        <div className="w-full bg-neutral-200 rounded-full h-1.5">
                                          <div
                                            className="bg-primary-600 h-1.5 rounded-full transition-all"
                                            style={{ width: `${project.progress_percentage}%` }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>

                          {/* Empty State */}
                          {projectsByStatus[column.id]?.length === 0 && (
                            <div className="text-center py-8 text-neutral-400 text-xs">
                              No projects
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
};

export default ProjectBoard;
