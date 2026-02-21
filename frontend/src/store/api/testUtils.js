/**
 * Test utilities for RTK Query API testing
 */

import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

/**
 * Setup a test store with an API slice
 * 
 * @param {Object} api - RTK Query API slice
 * @param {Object} extraReducers - Additional reducers to include
 * @returns {Object} Store reference with cleanup
 */
export function setupApiStore(api, extraReducers = {}) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      ...extraReducers,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
  });

  setupListeners(store.dispatch);

  return {
    store,
    cleanup: () => {
      // Cleanup subscriptions
      store.dispatch(api.util.resetApiState());
    },
  };
}

/**
 * Create a mock fetch response
 * 
 * @param {*} data - Response data
 * @param {number} status - HTTP status code
 * @returns {Promise} Mock fetch promise
 */
export function mockFetchResponse(data, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  });
}

/**
 * Create a mock fetch error
 * 
 * @param {string} message - Error message
 * @returns {Promise} Mock fetch promise that rejects
 */
export function mockFetchError(message = 'Network error') {
  return Promise.reject(new Error(message));
}
