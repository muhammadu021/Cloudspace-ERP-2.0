/**
 * My Space API Slice
 * 
 * RTK Query API for My Space (Self-Service Portal) operations
 * Handles employee self-service actions like clock in/out, leave requests, expenses, etc.
 */

import { baseApi, transformApiResponse } from './baseApi';

export const mySpaceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get My Space dashboard data
    getMySpaceDashboard: builder.query({
      query: () => '/myspace/dashboard',
      transformResponse: transformApiResponse,
      providesTags: ['MySpace'],
      keepUnusedDataFor: 60, // 1 minute - frequently updated data
    }),
    
    // Clock in/out (instant action)
    clockInOut: builder.mutation({
      query: ({ type, timestamp }) => ({
        url: '/myspace/clock',
        method: 'POST',
        body: { type, timestamp },
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: ['MySpace', 'Attendance'],
    }),
    
    // Submit leave request
    submitLeaveRequest: builder.mutation({
      query: (data) => ({
        url: '/myspace/leave-requests',
        method: 'POST',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: ['MySpace', 'Leave'],
    }),
    
    // Submit expense claim
    submitExpense: builder.mutation({
      query: (data) => ({
        url: '/myspace/expenses',
        method: 'POST',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: ['MySpace', 'Expense'],
    }),
    
    // Report issue
    reportIssue: builder.mutation({
      query: (data) => ({
        url: '/myspace/issues',
        method: 'POST',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: ['MySpace'],
    }),
    
    // Get employee profile
    getMyProfile: builder.query({
      query: () => '/myspace/profile',
      transformResponse: transformApiResponse,
      providesTags: ['Profile'],
      keepUnusedDataFor: 300,
    }),
    
    // Update employee profile
    updateMyProfile: builder.mutation({
      query: (data) => ({
        url: '/myspace/profile',
        method: 'PATCH',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: ['Profile', 'MySpace'],
    }),
    
    // Get my requests (leave, expenses, issues)
    getMyRequests: builder.query({
      query: (filters = {}) => ({
        url: '/myspace/requests',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: ['MyRequests'],
      keepUnusedDataFor: 180,
    }),
    
    // Get my documents
    getMyDocuments: builder.query({
      query: (filters = {}) => ({
        url: '/myspace/documents',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: ['MyDocuments'],
      keepUnusedDataFor: 300,
    }),
    
    // Get my attendance history
    getMyAttendance: builder.query({
      query: ({ startDate, endDate }) => ({
        url: '/myspace/attendance',
        params: { startDate, endDate },
      }),
      transformResponse: transformApiResponse,
      providesTags: ['Attendance'],
      keepUnusedDataFor: 180,
    }),
    
    // Get my leave balance
    getMyLeaveBalance: builder.query({
      query: () => '/myspace/leave-balance',
      transformResponse: transformApiResponse,
      providesTags: ['LeaveBalance'],
      keepUnusedDataFor: 300,
    }),
    
    // Get my payslips
    getMyPayslips: builder.query({
      query: () => '/myspace/payslips',
      transformResponse: transformApiResponse,
      providesTags: ['Payslips'],
      keepUnusedDataFor: 600, // 10 minutes - payslips don't change often
    }),
    
    // Download document
    downloadDocument: builder.mutation({
      query: (documentId) => ({
        url: `/myspace/documents/${documentId}/download`,
        method: 'GET',
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetMySpaceDashboardQuery,
  useClockInOutMutation,
  useSubmitLeaveRequestMutation,
  useSubmitExpenseMutation,
  useReportIssueMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetMyRequestsQuery,
  useGetMyDocumentsQuery,
  useGetMyAttendanceQuery,
  useGetMyLeaveBalanceQuery,
  useGetMyPayslipsQuery,
  useDownloadDocumentMutation,
} = mySpaceApi;
