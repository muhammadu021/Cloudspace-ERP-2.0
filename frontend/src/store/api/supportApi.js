/**
 * Support API Slice
 * 
 * RTK Query API for Support space operations
 */

import { baseApi, transformApiResponse } from './baseApi';

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get support dashboard data
    getSupportDashboard: builder.query({
      query: () => '/support/dashboard',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Support', id: 'DASHBOARD' }],
      keepUnusedDataFor: 60,
    }),
    
    // Get tickets
    getTickets: builder.query({
      query: (filters = {}) => ({
        url: '/support/tickets',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Ticket', id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),
    
    // Get ticket by ID
    getTicket: builder.query({
      query: (id) => `/support/tickets/${id}`,
      transformResponse: transformApiResponse,
      providesTags: (result, error, id) => [{ type: 'Ticket', id }],
    }),
    
    // Create ticket
    createTicket: builder.mutation({
      query: (ticket) => ({
        url: '/support/tickets',
        method: 'POST',
        body: ticket,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),
    
    // Update ticket
    updateTicket: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/support/tickets/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ticket', id },
        { type: 'Ticket', id: 'LIST' }
      ],
    }),
    
    // Get FAQs
    getFAQs: builder.query({
      query: (filters = {}) => ({
        url: '/support/faq',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'FAQ', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Get support analytics
    getSupportAnalytics: builder.query({
      query: (params = {}) => ({
        url: '/support/analytics',
        params,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Support', id: 'ANALYTICS' }],
      keepUnusedDataFor: 180,
    }),
    
    // Bulk ticket operations
    bulkTicketOperation: builder.mutation({
      query: ({ ticketIds, operation, data }) => ({
        url: '/support/tickets/bulk',
        method: 'POST',
        body: { ticketIds, operation, data },
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: [{ type: 'Ticket', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetSupportDashboardQuery,
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useUpdateTicketMutation,
  useGetFAQsQuery,
  useGetSupportAnalyticsQuery,
  useBulkTicketOperationMutation,
} = supportApi;
