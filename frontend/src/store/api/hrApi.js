/**
 * HR API Slice
 * 
 * RTK Query API for HR space operations
 * Handles employees, attendance, and leave management
 */

import { baseApi, transformApiResponse } from './baseApi';

export const hrApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all employees with optional filters
    getEmployees: builder.query({
      query: (filters = {}) => ({
        url: '/employees',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Employee', id })),
              { type: 'Employee', id: 'LIST' },
            ]
          : [{ type: 'Employee', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Get single employee by ID
    getEmployee: builder.query({
      query: (id) => `/employees/${id}`,
      transformResponse: transformApiResponse,
      providesTags: (result, error, id) => [{ type: 'Employee', id }],
      keepUnusedDataFor: 600,
    }),
    
    // Get employee attendance records
    getEmployeeAttendance: builder.query({
      query: ({ employeeId, startDate, endDate }) => ({
        url: `/employees/${employeeId}/attendance`,
        params: { startDate, endDate },
      }),
      transformResponse: transformApiResponse,
      providesTags: (result, error, { employeeId }) => [
        { type: 'Attendance', id: `EMPLOYEE_${employeeId}` },
      ],
      keepUnusedDataFor: 180, // 3 minutes for attendance data
    }),
    
    // Clock in/out
    clockInOut: builder.mutation({
      query: ({ employeeId, type, timestamp }) => ({
        url: `/employees/${employeeId}/clock`,
        method: 'POST',
        body: { type, timestamp },
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: (result, error, { employeeId }) => [
        { type: 'Attendance', id: `EMPLOYEE_${employeeId}` },
      ],
    }),
    
    // Get leave requests
    getLeaveRequests: builder.query({
      query: (filters = {}) => ({
        url: '/leave-requests',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Leave', id })),
              { type: 'Leave', id: 'LIST' },
            ]
          : [{ type: 'Leave', id: 'LIST' }],
    }),
    
    // Create leave request
    createLeaveRequest: builder.mutation({
      query: (data) => ({
        url: '/leave-requests',
        method: 'POST',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: [{ type: 'Leave', id: 'LIST' }],
    }),
    
    // Approve/reject leave request
    updateLeaveStatus: builder.mutation({
      query: ({ id, status, comment }) => ({
        url: `/leave-requests/${id}/status`,
        method: 'PATCH',
        body: { status, comment },
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Leave', id },
        { type: 'Leave', id: 'LIST' },
      ],
    }),
    
    // Get departments
    getDepartments: builder.query({
      query: () => '/departments',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Department', id: 'LIST' }],
      keepUnusedDataFor: 600, // Departments don't change often
    }),
    
    // Update employee
    updateEmployee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/employees/${id}`,
        method: 'PATCH',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
      ],
    }),
    
    // Get employee payroll
    getEmployeePayroll: builder.query({
      query: (employeeId) => `/employees/${employeeId}/payroll`,
      transformResponse: transformApiResponse,
      providesTags: (result, error, employeeId) => [
        { type: 'Payroll', id: `EMPLOYEE_${employeeId}` },
      ],
      keepUnusedDataFor: 300,
    }),
    
    // Get employee documents
    getEmployeeDocuments: builder.query({
      query: (employeeId) => `/employees/${employeeId}/documents`,
      transformResponse: transformApiResponse,
      providesTags: (result, error, employeeId) => [
        { type: 'Document', id: `EMPLOYEE_${employeeId}` },
      ],
      keepUnusedDataFor: 300,
    }),
    
    // Get employee performance
    getEmployeePerformance: builder.query({
      query: (employeeId) => `/employees/${employeeId}/performance`,
      transformResponse: transformApiResponse,
      providesTags: (result, error, employeeId) => [
        { type: 'Performance', id: `EMPLOYEE_${employeeId}` },
      ],
      keepUnusedDataFor: 300,
    }),
    
    // Get attendance records
    getAttendance: builder.query({
      query: (filters = {}) => ({
        url: '/attendance',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Attendance', id: 'LIST' }],
      keepUnusedDataFor: 180,
    }),
    
    // Get payroll runs
    getPayrollRuns: builder.query({
      query: () => '/payroll/runs',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Payroll', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Get job postings
    getJobPostings: builder.query({
      query: () => '/recruitment/jobs',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Job', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Get positions
    getPositions: builder.query({
      query: () => '/positions',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Position', id: 'LIST' }],
      keepUnusedDataFor: 600,
    }),
  }),
});

export const {
  useGetEmployeesQuery,
  useGetEmployeeQuery,
  useGetEmployeeAttendanceQuery,
  useClockInOutMutation,
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveStatusMutation,
  useGetDepartmentsQuery,
  useUpdateEmployeeMutation,
  useGetEmployeePayrollQuery,
  useGetEmployeeDocumentsQuery,
  useGetEmployeePerformanceQuery,
  useGetAttendanceQuery,
  useGetPayrollRunsQuery,
  useGetJobPostingsQuery,
  useGetPositionsQuery,
} = hrApi;
