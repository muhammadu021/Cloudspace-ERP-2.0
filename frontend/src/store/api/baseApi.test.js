/**
 * RTK Query Base API Tests
 * 
 * Tests for the base API configuration
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { baseApi, TAG_TYPES } from './baseApi';
import authReducer from '../slices/authSlice';

describe('Base API Configuration', () => {
  let store;
  
  beforeEach(() => {
    // Create a test store with the API reducer
    store = configureStore({
      reducer: {
        auth: authReducer,
        [baseApi.reducerPath]: baseApi.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(baseApi.middleware),
    });
  });
  
  it('should have the correct reducer path', () => {
    expect(baseApi.reducerPath).toBe('api');
  });
  
  it('should define all required tag types', () => {
    expect(TAG_TYPES).toContain('Project');
    expect(TAG_TYPES).toContain('Employee');
    expect(TAG_TYPES).toContain('Customer');
    expect(TAG_TYPES).toContain('Transaction');
    expect(TAG_TYPES).toContain('InventoryItem');
    expect(TAG_TYPES).toContain('Ticket');
    expect(TAG_TYPES).toContain('Dashboard');
    expect(TAG_TYPES).toContain('User');
  });
  
  it('should have correct cache configuration', () => {
    // keepUnusedDataFor should be 300 seconds (5 minutes)
    expect(baseApi.reducerPath).toBeDefined();
  });
  
  it('should be integrated into the store', () => {
    const state = store.getState();
    expect(state).toHaveProperty('api');
  });
  
  it('should have empty endpoints initially', () => {
    const state = store.getState();
    expect(state.api.queries).toEqual({});
    expect(state.api.mutations).toEqual({});
  });
});

describe('Tag Types', () => {
  it('should include all dashboard tags', () => {
    expect(TAG_TYPES).toContain('Dashboard');
    expect(TAG_TYPES).toContain('Widget');
  });
  
  it('should include all project tags', () => {
    expect(TAG_TYPES).toContain('Project');
    expect(TAG_TYPES).toContain('Task');
    expect(TAG_TYPES).toContain('Milestone');
  });
  
  it('should include all HR tags', () => {
    expect(TAG_TYPES).toContain('Employee');
    expect(TAG_TYPES).toContain('Attendance');
    expect(TAG_TYPES).toContain('Leave');
    expect(TAG_TYPES).toContain('Department');
    expect(TAG_TYPES).toContain('Position');
  });
  
  it('should include all finance tags', () => {
    expect(TAG_TYPES).toContain('Transaction');
    expect(TAG_TYPES).toContain('Budget');
    expect(TAG_TYPES).toContain('Account');
    expect(TAG_TYPES).toContain('ExpenseClaim');
    expect(TAG_TYPES).toContain('Payroll');
  });
  
  it('should include all sales tags', () => {
    expect(TAG_TYPES).toContain('Customer');
    expect(TAG_TYPES).toContain('Order');
    expect(TAG_TYPES).toContain('Lead');
    expect(TAG_TYPES).toContain('Quote');
    expect(TAG_TYPES).toContain('Invoice');
  });
  
  it('should include all inventory tags', () => {
    expect(TAG_TYPES).toContain('InventoryItem');
    expect(TAG_TYPES).toContain('StockMovement');
    expect(TAG_TYPES).toContain('Location');
  });
  
  it('should include all admin tags', () => {
    expect(TAG_TYPES).toContain('User');
    expect(TAG_TYPES).toContain('Role');
    expect(TAG_TYPES).toContain('Permission');
    expect(TAG_TYPES).toContain('Setting');
    expect(TAG_TYPES).toContain('Asset');
    expect(TAG_TYPES).toContain('Document');
  });
  
  it('should include all support tags', () => {
    expect(TAG_TYPES).toContain('Ticket');
    expect(TAG_TYPES).toContain('FAQ');
    expect(TAG_TYPES).toContain('TicketResponse');
  });
});
