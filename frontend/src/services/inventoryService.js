import api from './api'
import { getCompanyId } from '../utils/company';
// Note: company_id is automatically handled by the api interceptor in api.js
// which gets it from localStorage user data

const inventoryService = {
  // Items
  getItems: (params) => {
    const company_id = getCompanyId();
    return api.get('/inventory/items', { params: { ...params, company_id } });
  },
  getItemById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/inventory/items/${id}`, { params: { company_id } });
  },
  createItem: (itemData) => {
    const company_id = getCompanyId();
    return api.post('/inventory/items', { ...itemData, company_id });
  },
  updateItem: (id, itemData) => {
    const company_id = getCompanyId();
    return api.put(`/inventory/items/${id}`, { ...itemData, company_id });
  },
  deleteItem: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/inventory/items/${id}`, { params: { company_id } });
  },
  
  // Locations
  getLocations: () => {
    const company_id = getCompanyId();
    return api.get('/inventory/locations', { params: { company_id } });
  },
  createLocation: (locationData) => {
    const company_id = getCompanyId();
    return api.post('/inventory/locations', { ...locationData, company_id });
  },
  
  // Movements
  getMovements: (params) => {
    const company_id = getCompanyId();
    return api.get('/inventory/movements', { params: { ...params, company_id } });
  },
  createMovement: (movementData) => {
    const company_id = getCompanyId();
    return api.post('/inventory/movements', { ...movementData, company_id });
  },
  
  // Batches
  getBatches: (params) => {
    const company_id = getCompanyId();
    return api.get('/inventory/batches', { params: { ...params, company_id } });
  },
  createBatch: (batchData) => {
    const company_id = getCompanyId();
    return api.post('/inventory/batches', { ...batchData, company_id });
  },
  updateBatch: (id, batchData) => {
    const company_id = getCompanyId();
    return api.put(`/inventory/batches/${id}`, { ...batchData, company_id });
  },
  
  // Serial Numbers
  getSerials: (params) => {
    const company_id = getCompanyId();
    return api.get('/inventory/serials', { params: { ...params, company_id } });
  },
  createSerial: (serialData) => {
    const company_id = getCompanyId();
    return api.post('/inventory/serials', { ...serialData, company_id });
  },
  updateSerial: (id, serialData) => {
    const company_id = getCompanyId();
    return api.put(`/inventory/serials/${id}`, { ...serialData, company_id });
  },
  
  // Stock Adjustments
  adjustStock: (itemId, adjustmentData) => {
    const company_id = getCompanyId();
    return api.post(`/inventory/items/${itemId}/adjust`, { ...adjustmentData, company_id });
  },
  
  // Reports
  getLowStockReport: () => {
    const company_id = getCompanyId();
    return api.get('/inventory/reports/low-stock', { params: { company_id } });
  },
  getStockValuationReport: () => {
    const company_id = getCompanyId();
    return api.get('/inventory/reports/valuation', { params: { company_id } });
  },
  getMovementReport: (params) => {
    const company_id = getCompanyId();
    return api.get('/inventory/reports/movements', { params: { ...params, company_id } });
  },
  getDashboardStats: (params) => {
    const company_id = getCompanyId();
    return api.get('/inventory/dashboard/stats', { params: { ...params, company_id } });
  },
  getReports: (params) => {
    const company_id = getCompanyId();
    return api.get('/inventory/reports', { params: { ...params, company_id } });
  },
  
  // Location management
  updateLocation: (id, locationData) => {
    const company_id = getCompanyId();
    return api.put(`/inventory/locations/${id}`, { ...locationData, company_id });
  },
  deleteLocation: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/inventory/locations/${id}`, { params: { company_id } });
  },
}

export { inventoryService };
export default inventoryService;