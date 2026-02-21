/**
 * Projects API Slice
 * 
 * RTK Query API for Projects space operations
 * Demonstrates standard CRUD operations with caching and optimistic updates
 */

import { baseApi, transformApiResponse } from './baseApi';

export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all projects with optional filters
    getProjects: builder.query({
      query: (filters = {}) => ({
        url: '/projects',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Project', id })),
              { type: 'Project', id: 'LIST' },
            ]
          : [{ type: 'Project', id: 'LIST' }],
      // Keep project list data for 5 minutes
      keepUnusedDataFor: 300,
    }),
    
    // Get single project by ID
    getProject: builder.query({
      query: (id) => `/projects/${id}`,
      transformResponse: transformApiResponse,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
      // Keep individual project data for 10 minutes
      keepUnusedDataFor: 600,
    }),
    
    // Get project tasks
    getProjectTasks: builder.query({
      query: (projectId) => `/projects/${projectId}/tasks`,
      transformResponse: transformApiResponse,
      providesTags: (result, error, projectId) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task', id })),
              { type: 'Task', id: `PROJECT_${projectId}` },
            ]
          : [{ type: 'Task', id: `PROJECT_${projectId}` }],
    }),
    
    // Create new project
    createProject: builder.mutation({
      query: (data) => ({
        url: '/projects',
        method: 'POST',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: [{ type: 'Project', id: 'LIST' }],
      // Optimistic update
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          const { data: newProject } = await queryFulfilled;
          
          // Update the project list cache
          dispatch(
            projectsApi.util.updateQueryData('getProjects', undefined, (draft) => {
              draft.push(newProject);
            })
          );
        } catch {
          // Error handled by RTK Query
        }
      },
    }),
    
    // Update project
    updateProject: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/projects/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
      // Optimistic update
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          projectsApi.util.updateQueryData('getProject', id, (draft) => {
            Object.assign(draft, patch);
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    // Delete project
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Project', id },
        { type: 'Project', id: 'LIST' },
      ],
    }),
    
    // Update project status
    updateProjectStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/projects/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
      // Optimistic update for better UX
      async onQueryStarted({ id, status }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          projectsApi.util.updateQueryData('getProject', id, (draft) => {
            draft.status = status;
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
    
    // Update project field (for inline editing)
    updateProjectField: builder.mutation({
      query: ({ id, field, value }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body: { [field]: value },
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: (result, error, { id }) => [{ type: 'Project', id }],
      // Optimistic update for instant feedback
      async onQueryStarted({ id, field, value }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          projectsApi.util.updateQueryData('getProject', id, (draft) => {
            draft[field] = value;
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useGetProjectTasksQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useUpdateProjectStatusMutation,
  useUpdateProjectFieldMutation,
} = projectsApi;
