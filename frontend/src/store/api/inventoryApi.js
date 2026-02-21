/**
 * Inventory API Slice
 * 
 * RTK Query API for Inventory space operations
 */

import { baseApi, transformApiResponse } from './baseApi';

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get inventory dashboard data
    getInventoryDashboard: builder.query({
      query: () => '/inventory/dashboard',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Inventory', id: 'DASHBOARD' }],
      keepUnusedDataFor: 180,
    }),
    
    // Get items
    getItems: builder.query({
      query: (filters = {}) => ({
        url: '/inventory/items',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Item', id: 'LIST' }],
      keepUnusedDataFor: 180,
    }),
    
    // Get locations
    getLocations: builder.query({
      query: () => '/inventory/locations',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Location', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Get movements
    getMovements: builder.query({
      query: (filters = {}) => ({
        url: '/inventory/movements',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Movement', id: 'LIST' }],
      keepUnusedDataFor: 180,
    }),
    
    // Adjust stock
    adjustStock: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/inventory/items/${id}/adjust`,
        method: 'POST',
        body: data,
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: [
        { type: 'Item', id: 'LIST' },
        { type: 'Movement', id: 'LIST' },
        { type: 'Inventory', id: 'DASHBOARD' },
      ],
    }),
  }),
});

export const {
  useGetInventoryDashboardQuery,
  useGetItemsQuery,
  useGetLocationsQuery,
  useGetMovementsQuery,
  useAdjustStockMutation,
} = inventoryApi;
