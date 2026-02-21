import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  entities: {},
  queries: {},
  metadata: {},
};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    setEntity: (state, action) => {
      const { entityType, id, data } = action.payload;
      if (!state.entities[entityType]) {
        state.entities[entityType] = {};
      }
      state.entities[entityType][id] = {
        ...data,
        _cached: Date.now(),
      };
    },
    setEntities: (state, action) => {
      const { entityType, entities } = action.payload;
      if (!state.entities[entityType]) {
        state.entities[entityType] = {};
      }
      entities.forEach((entity) => {
        state.entities[entityType][entity.id] = {
          ...entity,
          _cached: Date.now(),
        };
      });
    },
    updateEntity: (state, action) => {
      const { entityType, id, updates } = action.payload;
      if (state.entities[entityType]?.[id]) {
        state.entities[entityType][id] = {
          ...state.entities[entityType][id],
          ...updates,
          _cached: Date.now(),
        };
      }
    },
    removeEntity: (state, action) => {
      const { entityType, id } = action.payload;
      if (state.entities[entityType]?.[id]) {
        delete state.entities[entityType][id];
      }
    },
    clearEntityType: (state, action) => {
      const entityType = action.payload;
      if (state.entities[entityType]) {
        delete state.entities[entityType];
      }
    },
    setQueryResult: (state, action) => {
      const { queryKey, result, ttl } = action.payload;
      state.queries[queryKey] = {
        result,
        timestamp: Date.now(),
        ttl: ttl || 300000, // Default 5 minutes
      };
    },
    invalidateQuery: (state, action) => {
      const queryKey = action.payload;
      if (state.queries[queryKey]) {
        delete state.queries[queryKey];
      }
    },
    invalidateQueriesByPattern: (state, action) => {
      const pattern = action.payload;
      Object.keys(state.queries).forEach((key) => {
        if (key.includes(pattern)) {
          delete state.queries[key];
        }
      });
    },
    setMetadata: (state, action) => {
      const { key, value } = action.payload;
      state.metadata[key] = {
        value,
        timestamp: Date.now(),
      };
    },
    clearMetadata: (state, action) => {
      const key = action.payload;
      if (state.metadata[key]) {
        delete state.metadata[key];
      }
    },
    clearExpiredQueries: (state) => {
      const now = Date.now();
      Object.keys(state.queries).forEach((key) => {
        const query = state.queries[key];
        if (now - query.timestamp > query.ttl) {
          delete state.queries[key];
        }
      });
    },
    clearAllCache: (state) => {
      state.entities = {};
      state.queries = {};
      state.metadata = {};
    },
  },
});

export const {
  setEntity,
  setEntities,
  updateEntity,
  removeEntity,
  clearEntityType,
  setQueryResult,
  invalidateQuery,
  invalidateQueriesByPattern,
  setMetadata,
  clearMetadata,
  clearExpiredQueries,
  clearAllCache,
} = cacheSlice.actions;

// Selectors
export const selectEntity = (entityType, id) => (state) =>
  state.cache.entities[entityType]?.[id] || null;

export const selectEntities = (entityType) => (state) => {
  const entities = state.cache.entities[entityType];
  return entities ? Object.values(entities) : [];
};

export const selectQueryResult = (queryKey) => (state) => {
  const query = state.cache.queries[queryKey];
  if (!query) return null;
  
  const now = Date.now();
  if (now - query.timestamp > query.ttl) {
    return null; // Expired
  }
  
  return query.result;
};

export const selectMetadata = (key) => (state) =>
  state.cache.metadata[key]?.value || null;

export const selectIsEntityCached = (entityType, id) => (state) =>
  !!state.cache.entities[entityType]?.[id];

export const selectIsQueryCached = (queryKey) => (state) => {
  const query = state.cache.queries[queryKey];
  if (!query) return false;
  
  const now = Date.now();
  return now - query.timestamp <= query.ttl;
};

export default cacheSlice.reducer;
