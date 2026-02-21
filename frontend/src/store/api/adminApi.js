/**
 * Admin API Slice
 * 
 * RTK Query API for Admin space operations
 */

import { baseApi, transformApiResponse } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get admin dashboard data
    getAdminDashboard: builder.query({
      query: () => '/admin/dashboard',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Admin', id: 'DASHBOARD' }],
      keepUnusedDataFor: 60,
    }),
    
    // Get users
    getUsers: builder.query({
      query: (filters = {}) => ({
        url: '/admin/users',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'User', id: 'LIST' }],
      keepUnusedDataFor: 180,
    }),
    
    // Get roles
    getRoles: builder.query({
      query: () => '/admin/roles',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Role', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Get system settings
    getSettings: builder.query({
      query: () => '/admin/settings',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Settings', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Update settings
    updateSettings: builder.mutation({
      query: (settings) => ({
        url: '/admin/settings',
        method: 'PUT',
        body: settings,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: [{ type: 'Settings', id: 'LIST' }],
    }),
    
    // Get assets
    getAssets: builder.query({
      query: (filters = {}) => ({
        url: '/admin/assets',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Asset', id: 'LIST' }],
      keepUnusedDataFor: 180,
    }),
    
    // Get audit logs
    getAuditLogs: builder.query({
      query: (filters = {}) => ({
        url: '/admin/logs',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'AuditLog', id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),
    
    // Bulk user operations
    bulkUserOperation: builder.mutation({
      query: ({ userIds, operation, data }) => ({
        url: '/admin/users/bulk',
        method: 'POST',
        body: { userIds, operation, data },
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAdminDashboardQuery,
  useGetUsersQuery,
  useGetRolesQuery,
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useGetAssetsQuery,
  useGetAuditLogsQuery,
  useBulkUserOperationMutation,
} = adminApi;
