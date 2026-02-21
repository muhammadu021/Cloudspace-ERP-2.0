/**
 * Finance API Slice
 * 
 * RTK Query API for Finance space operations
 */

import { baseApi, transformApiResponse } from './baseApi';

export const financeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get finance dashboard data
    getFinanceDashboard: builder.query({
      query: () => '/finance/dashboard',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Finance', id: 'DASHBOARD' }],
      keepUnusedDataFor: 180,
    }),
    
    // Get accounts
    getAccounts: builder.query({
      query: () => '/finance/accounts',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Account', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Get transactions
    getTransactions: builder.query({
      query: (filters = {}) => ({
        url: '/finance/transactions',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Transaction', id: 'LIST' }],
      keepUnusedDataFor: 180,
    }),
    
    // Get budgets
    getBudgets: builder.query({
      query: () => '/finance/budgets',
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Budget', id: 'LIST' }],
      keepUnusedDataFor: 300,
    }),
    
    // Get expenses
    getExpenses: builder.query({
      query: (filters = {}) => ({
        url: '/finance/expenses',
        params: filters,
      }),
      transformResponse: transformApiResponse,
      providesTags: [{ type: 'Expense', id: 'LIST' }],
      keepUnusedDataFor: 180,
    }),
    
    // Approve expense
    approveExpense: builder.mutation({
      query: ({ id, status }) => ({
        url: `/finance/expenses/${id}/approve`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: transformApiResponse,
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetFinanceDashboardQuery,
  useGetAccountsQuery,
  useGetTransactionsQuery,
  useGetBudgetsQuery,
  useGetExpensesQuery,
  useApproveExpenseMutation,
} = financeApi;
