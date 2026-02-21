import api from './api'
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

export const crmService = {
  // Customers
  getCustomers: (params) => {
    const company_id = getCompanyId();
    return api.get('/crm/customers', { params: { ...params, company_id } });
  },
  getCustomerById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/crm/customers/${id}`, { params: { company_id } });
  },
  createCustomer: (customerData) => {
    const company_id = getCompanyId();
    return api.post('/crm/customers', { ...customerData, company_id });
  },
  updateCustomer: (id, customerData) => {
    const company_id = getCompanyId();
    return api.put(`/crm/customers/${id}`, { ...customerData, company_id });
  },
  deleteCustomer: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/crm/customers/${id}`, { params: { company_id } });
  },
  
  // Suppliers
  getSuppliers: (params) => {
    const company_id = getCompanyId();
    return api.get('/crm/suppliers', { params: { ...params, company_id } });
  },
  getSupplierById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/crm/suppliers/${id}`, { params: { company_id } });
  },
  createSupplier: (supplierData) => {
    const company_id = getCompanyId();
    return api.post('/crm/suppliers', { ...supplierData, company_id });
  },
  updateSupplier: (id, supplierData) => {
    const company_id = getCompanyId();
    return api.put(`/crm/suppliers/${id}`, { ...supplierData, company_id });
  },
  deleteSupplier: (id) => {
    const company_id = getCompanyId();
    return api.delete(`/crm/suppliers/${id}`, { params: { company_id } });
  },
  
  // Leads
  getLeads: (params) => {
    const company_id = getCompanyId();
    return api.get('/crm/leads', { params: { ...params, company_id } });
  },
  createLead: (leadData) => {
    const company_id = getCompanyId();
    return api.post('/crm/leads', { ...leadData, company_id });
  },
  updateLead: (id, leadData) => {
    const company_id = getCompanyId();
    return api.put(`/crm/leads/${id}`, { ...leadData, company_id });
  },
  convertLead: (id, customerData) => {
    const company_id = getCompanyId();
    return api.post(`/crm/leads/${id}/convert`, { ...customerData, company_id });
  },
  
  // Opportunities
  getOpportunities: (params) => {
    const company_id = getCompanyId();
    return api.get('/crm/opportunities', { params: { ...params, company_id } });
  },
  createOpportunity: (opportunityData) => {
    const company_id = getCompanyId();
    return api.post('/crm/opportunities', { ...opportunityData, company_id });
  },
  updateOpportunity: (id, opportunityData) => {
    const company_id = getCompanyId();
    return api.put(`/crm/opportunities/${id}`, { ...opportunityData, company_id });
  },
  
  // Sales Orders
  getSalesOrders: (params) => {
    const company_id = getCompanyId();
    return api.get('/crm/sales-orders', { params: { ...params, company_id } });
  },
  getSalesOrderById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/crm/sales-orders/${id}`, { params: { company_id } });
  },
  createSalesOrder: (orderData) => {
    const company_id = getCompanyId();
    return api.post('/crm/sales-orders', { ...orderData, company_id });
  },
  updateSalesOrder: (id, orderData) => {
    const company_id = getCompanyId();
    return api.put(`/crm/sales-orders/${id}`, { ...orderData, company_id });
  },
  approveSalesOrder: (id) => {
    const company_id = getCompanyId();
    return api.patch(`/crm/sales-orders/${id}/approve`, { company_id });
  },
  
  // Purchase Orders
  getPurchaseOrders: (params) => {
    const company_id = getCompanyId();
    return api.get('/crm/purchase-orders', { params: { ...params, company_id } });
  },
  getPurchaseOrderById: (id) => {
    const company_id = getCompanyId();
    return api.get(`/crm/purchase-orders/${id}`, { params: { company_id } });
  },
  createPurchaseOrder: (orderData) => {
    const company_id = getCompanyId();
    return api.post('/crm/purchase-orders', { ...orderData, company_id });
  },
  updatePurchaseOrder: (id, orderData) => {
    const company_id = getCompanyId();
    return api.put(`/crm/purchase-orders/${id}`, { ...orderData, company_id });
  },
  approvePurchaseOrder: (id) => {
    const company_id = getCompanyId();
    return api.patch(`/crm/purchase-orders/${id}/approve`, { company_id });
  },
  
  // Communications
  getCustomerCommunications: (customerId) => {
    const company_id = getCompanyId();
    return api.get(`/crm/customers/${customerId}/communications`, { params: { company_id } });
  },
  addCommunication: (customerId, communicationData) => {
    const company_id = getCompanyId();
    return api.post(`/crm/customers/${customerId}/communications`, { ...communicationData, company_id });
  },
  
  // Reports
  getSalesReport: (params) => {
    const company_id = getCompanyId();
    return api.get('/crm/reports/sales', { params: { ...params, company_id } });
  },
  getCustomerReport: (params) => {
    const company_id = getCompanyId();
    return api.get('/crm/reports/customers', { params: { ...params, company_id } });
  },
  getSupplierReport: (params) => {
    const company_id = getCompanyId();
    return api.get('/crm/reports/suppliers', { params: { ...params, company_id } });
  },
}