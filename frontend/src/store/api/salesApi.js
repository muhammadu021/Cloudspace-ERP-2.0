/**
 * Sales API Slice
 * 
 * RTK Query API for Sales space operations
 */

import { baseApi, transformApiResponse } from './baseApi';

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get sales dashboard data
    getSalesDashboard: builder.query({
      query: () => '/sales/dashboard',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Sales', id: 'DASHBOARD' }],
      keepUnusedDataFor: 180,
    }),
    
    // Get customers
    getCustomers: builder.query({
      query: (filters = {}) => ({
        url: '/sales/customers',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Customer', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Get orders
    getOrders: builder.query({
      query: (filters = {}) => ({
        url: '/sales/orders',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Order', id: 'LIST' }],
      keepUnusedDataFor: 180,
    }),
    
    // Get leads
    getLeads: builder.query({
      query: () => '/sales/leads',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Lead', id: 'LIST' }],
      keepUnusedDataFor: 180,
    }),
  }),
});

export const {
  useGetSalesDashboardQuery,
  useGetCustomersQuery,
  useGetOrdersQuery,
  useGetLeadsQuery,
} = salesApi;
