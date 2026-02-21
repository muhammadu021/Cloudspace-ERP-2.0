import api from './api'
import { getCompanyId } from '../utils/company'

export const templatesService = {
  getTemplates: async (params = {}) => {
    const company_id = getCompanyId()
    return api.get('/projects/templates', { params: { ...params, company_id } })
  },

  getTemplateById: async (id) => {
    const company_id = getCompanyId()
    return api.get(`/projects/templates/${id}`, { params: { company_id } })
  },

  createTemplate: async (data) => {
    const company_id = getCompanyId()
    return api.post('/projects/templates', { ...data, company_id })
  },

  updateTemplate: async (id, data) => {
    const company_id = getCompanyId()
    return api.put(`/projects/templates/${id}`, { ...data, company_id })
  },

  deleteTemplate: async (id) => {
    const company_id = getCompanyId()
    return api.delete(`/projects/templates/${id}`, { params: { company_id } })
  },

  createProjectFromTemplate: async (templateId, projectData = {}) => {
    const company_id = getCompanyId()
    return api.post(`/projects/templates/${templateId}/create`, { ...projectData, company_id })
  }
}

export default templatesService
