import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Calendar,
  Banknote,
  Users,
  AlertCircle
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { templatesService } from '@/services/templatesService'
// Removed custom Select imports - using native HTML select
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'

const ProjectForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isEditing = !!id
  
  // Check if we're editing a template based on the current URL
  const isTemplate = window.location.pathname.includes('/templates/')
  
  console.log('ProjectForm - Mode:', { isEditing, isTemplate, id, pathname: window.location.pathname })

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    budget_allocated: '',
    currency: 'NGN',
    manager_id: '',
    department_id: '',
    client_name: '',
    client_contact: '',
    client_email: '',
    is_billable: true,
    deliverables: [''],
    milestones: [{ name: '', date: '', description: '' }],
    risks: [{ description: '', impact: 'medium', probability: 'medium', mitigation: '' }],
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // Fetch project or template data if editing
  const { data: project, isLoading: projectLoading } = useQuery(
    [isTemplate ? 'template' : 'project', id],
    () => isTemplate ? templatesService.getTemplateById(id) : projectService.getProjectById(id),
    {
      enabled: isEditing,
      select: (response) => {
        // console.log('ProjectForm - Raw API response:', response)
        if (isTemplate) {
          return response?.data?.template
        } else {
          return response?.data?.data?.project
        }
      },
      onSuccess: (projectData) => {
        console.log('ProjectForm - Project data received:', projectData)
        if (projectData) {
          // Parse JSON fields - they are double-encoded as strings
          let deliverables = ['']
          if (projectData.deliverables) {
            try {
              // First parse to get the JSON string, then parse again to get the array
              const parsed = JSON.parse(projectData.deliverables)
              deliverables = typeof parsed === 'string' ? JSON.parse(parsed) : parsed
              if (!Array.isArray(deliverables)) deliverables = ['']
            } catch (e) {
              console.warn('Failed to parse deliverables:', e)
              deliverables = ['']
            }
          }
          
          let milestones = [{ name: '', date: '', description: '' }]
          if (projectData.milestones) {
            try {
              const parsed = JSON.parse(projectData.milestones)
              milestones = typeof parsed === 'string' ? JSON.parse(parsed) : parsed
              if (!Array.isArray(milestones)) milestones = [{ name: '', date: '', description: '' }]
            } catch (e) {
              console.warn('Failed to parse milestones:', e)
              milestones = [{ name: '', date: '', description: '' }]
            }
          }
          
          let risks = [{ description: '', impact: 'medium', probability: 'medium', mitigation: '' }]
          if (projectData.risks) {
            try {
              const parsed = JSON.parse(projectData.risks)
              risks = typeof parsed === 'string' ? JSON.parse(parsed) : parsed
              if (!Array.isArray(risks) || risks.length === 0) {
                risks = [{ description: '', impact: 'medium', probability: 'medium', mitigation: '' }]
              }
            } catch (e) {
              console.warn('Failed to parse risks:', e)
              risks = [{ description: '', impact: 'medium', probability: 'medium', mitigation: '' }]
            }
          }
          
          if (isTemplate) {
            // Handle template data structure
            setFormData({
              name: projectData.name || '',
              code: '', // Templates don't have codes
              description: projectData.description || '',
              status: 'planning', // Default for new projects from templates
              priority: 'medium', // Default priority
              start_date: '',
              end_date: '',
              budget_allocated: projectData.estimated_budget || '',
              currency: 'NGN',
              manager_id: '',
              department_id: '',
              client_name: '',
              client_contact: '',
              client_email: '',
              is_billable: true,
              deliverables: Array.isArray(projectData.tags) ? projectData.tags : [''],
              milestones: [{ name: '', date: '', description: '' }],
              risks: [{ description: '', impact: 'medium', probability: 'medium', mitigation: '' }],
              notes: projectData.description || ''
            })
          } else {
            // Handle project data structure
            setFormData({
              name: projectData.name || '',
              code: projectData.code || '',
              description: projectData.description || '',
              status: projectData.status || 'planning',
              priority: projectData.priority || 'medium',
              start_date: projectData.start_date ? projectData.start_date.split('T')[0] : '',
              end_date: projectData.end_date ? projectData.end_date.split('T')[0] : '',
              budget_allocated: projectData.budget_allocated || '',
              currency: projectData.currency || 'NGN',
              manager_id: projectData.manager_id || '',
              department_id: projectData.department_id || '',
              client_name: projectData.client_name || '',
              client_contact: projectData.client_contact || '',
              client_email: projectData.client_email || '',
              is_billable: projectData.is_billable !== undefined ? projectData.is_billable : true,
              deliverables: Array.isArray(deliverables) ? deliverables : [''],
              milestones: Array.isArray(milestones) ? milestones : [{ name: '', date: '', description: '' }],
              risks: Array.isArray(risks) ? risks : [{ description: '', impact: 'medium', probability: 'medium', mitigation: '' }],
              notes: projectData.notes || ''
            })
          }
          console.log('ProjectForm - Form data updated:', {
            name: projectData.name,
            code: projectData.code,
            status: projectData.status,
            manager_id: projectData.manager_id,
            department_id: projectData.department_id
          })
        }
      }
    }
  )

  // Fetch employees for manager selection
  const { data: employees } = useQuery(
    'employees',
    () => projectService.getEmployees(),
    {
      select: (response) => response?.data?.employees || [],
      retry: false,
      staleTime: 10 * 60 * 1000
    }
  )

  // Fetch departments
  const { data: departments } = useQuery(
    'departments',
    () => projectService.getDepartments(),
    {
      select: (response) => response?.data?.departments || [],
      retry: false,
      staleTime: 10 * 60 * 1000
    }
  )

  // Create/Update mutation
  const mutation = useMutation(
    (data) => isEditing 
      ? projectService.updateProject(id, data)
      : projectService.createProject(data),
    {
      onMutate: () => {
        setIsLoading(true)
        setErrors({})
      },
      onSuccess: (response) => {
        console.log('Save successful:', response)
        if (isTemplate) {
          queryClient.invalidateQueries('project-templates')
          queryClient.invalidateQueries(['template', id])
          navigate('/projects/templates')
        } else {
          queryClient.invalidateQueries('projects')
          queryClient.invalidateQueries(['project', id])
          navigate('/projects')
        }
        setIsLoading(false)
      },
      onError: (error) => {
        setIsLoading(false)
        console.error('Project save error:', error)
        const errorData = error.response?.data
        if (errorData?.errors) {
          setErrors(errorData.errors)
        } else if (errorData?.message) {
          setErrors({ general: errorData.message })
        } else {
          setErrors({ general: 'Failed to save project. Please try again.' })
        }
      }
    }
  )

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]

  const currencyOptions = [
    { value: 'NGN', label: 'NGN (₦)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'JPY', label: 'JPY (¥)' },
    { value: 'CAD', label: 'CAD (₦)' },
    { value: 'AUD', label: 'AUD (₦)' }
  ]

  const impactOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]

  const probabilityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'very_high', label: 'Very High' }
  ]

  const managerOptions = employees?.map(emp => ({
    value: emp.id,
    label: `${emp.User?.first_name || emp.first_name || ''} ${emp.User?.last_name || emp.last_name || ''} (${emp.employee_id || emp.id})`
  })) || []

  const departmentOptions = departments?.map(dept => ({
    value: dept.id,
    label: dept.name
  })) || []

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }))
  }

  const handleObjectArrayChange = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => 
        i === index ? { ...item, [key]: value } : item
      )
    }))
  }

  const addArrayItem = (field, defaultValue) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], defaultValue]
    }))
  }

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Project name is required'
    if (!formData.code.trim()) newErrors.code = 'Project code is required'
    if (!formData.start_date) newErrors.start_date = 'Start date is required'
    if (!formData.end_date) newErrors.end_date = 'End date is required'
    if (!formData.manager_id) newErrors.manager_id = 'Project manager is required'
    
    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = 'End date must be after start date'
    }

    if (formData.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted with data:', formData)
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        // Convert string values to proper types
        budget_allocated: formData.budget_allocated ? parseFloat(formData.budget_allocated) : null,
        manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
        department_id: formData.department_id ? parseInt(formData.department_id) : null,
        // Filter and clean array data
        deliverables: formData.deliverables.filter(d => d.trim()),
        milestones: formData.milestones.filter(m => m.name.trim()),
        risks: formData.risks.filter(r => r.description.trim())
      }
      
      console.log('Submitting data:', submitData)
      mutation.mutate(submitData)
    } else {
      console.log('Form validation failed:', errors)
    }
  }

  // Show loading state when editing and project data is loading
  if (isEditing && projectLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Debug current form state
  console.log('ProjectForm - Current form state:', {
    isEditing,
    projectId: id,
    formDataName: formData.name,
    formDataCode: formData.code,
    projectLoading,
    hasProject: !!project
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? (isTemplate ? 'Edit Template' : 'Edit Project') : (isTemplate ? 'Create New Template' : 'Create New Project')}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 
              (isTemplate ? 'Update template details and settings' : 'Update project details and settings') : 
              (isTemplate ? 'Set up a new project template' : 'Set up a new project with all necessary details')
            }
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(isTemplate ? '/projects/templates' : '/projects')}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* General Error Display */}
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{errors.general}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter project name"
                error={errors.name}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Code *
              </label>
              <Input
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                placeholder="e.g., PROJ-2024-001"
                error={errors.code}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Describe the project objectives and scope"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Timeline & Budget */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Timeline & Budget</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                error={errors.start_date}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                error={errors.end_date}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Allocated
              </label>
              <Input
                type="number"
                value={formData.budget_allocated}
                onChange={(e) => handleInputChange('budget_allocated', e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                {currencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_billable}
                  onChange={(e) => handleInputChange('is_billable', e.target.checked)}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">This is a billable project</span>
              </label>
            </div>
          </div>
        </div>

        {/* Team & Organization */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Team & Organization</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Manager *
              </label>
              <select
                value={formData.manager_id}
                onChange={(e) => handleInputChange('manager_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-primary-500 focus:border-primary-500 ${
                  errors.manager_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select a manager</option>
                {managerOptions.map(option => (
                  <option key={option.value} value={option.value.toString()}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.manager_id && (
                <p className="mt-1 text-sm text-red-600">{errors.manager_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={formData.department_id}
                onChange={(e) => handleInputChange('department_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a department</option>
                {departmentOptions.map(option => (
                  <option key={option.value} value={option.value.toString()}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <Input
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                placeholder="Enter client name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Contact
              </label>
              <Input
                value={formData.client_contact}
                onChange={(e) => handleInputChange('client_contact', e.target.value)}
                placeholder="Contact person name"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Email
              </label>
              <Input
                type="email"
                value={formData.client_email}
                onChange={(e) => handleInputChange('client_email', e.target.value)}
                placeholder="client@example.com"
                error={errors.client_email}
              />
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Deliverables</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('deliverables', '')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Deliverable
            </Button>
          </div>
          
          <div className="space-y-3">
            {formData.deliverables.map((deliverable, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Input
                  value={deliverable}
                  onChange={(e) => handleArrayChange('deliverables', index, e.target.value)}
                  placeholder="Enter deliverable description"
                  className="flex-1"
                />
                {formData.deliverables.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeArrayItem('deliverables', index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Milestones</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('milestones', { name: '', date: '', description: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Milestone
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.milestones.map((milestone, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Milestone Name
                    </label>
                    <Input
                      value={milestone.name}
                      onChange={(e) => handleObjectArrayChange('milestones', index, 'name', e.target.value)}
                      placeholder="Enter milestone name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target Date
                    </label>
                    <Input
                      type="date"
                      value={milestone.date}
                      onChange={(e) => handleObjectArrayChange('milestones', index, 'date', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={milestone.description}
                      onChange={(e) => handleObjectArrayChange('milestones', index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe the milestone"
                    />
                  </div>
                </div>
                {formData.milestones.length > 1 && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('milestones', index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Risk Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Risk Management</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('risks', { description: '', impact: 'medium', probability: 'medium', mitigation: '' })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Risk
            </Button>
          </div>
          
          <div className="space-y-4">
            {formData.risks.map((risk, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Risk Description
                    </label>
                    <textarea
                      value={risk.description}
                      onChange={(e) => handleObjectArrayChange('risks', index, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Describe the potential risk"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Impact
                    </label>
                    <select
                      value={risk.impact}
                      onChange={(e) => handleObjectArrayChange('risks', index, 'impact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      {impactOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Probability
                    </label>
                    <select
                      value={risk.probability}
                      onChange={(e) => handleObjectArrayChange('risks', index, 'probability', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      {probabilityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mitigation Strategy
                    </label>
                    <textarea
                      value={risk.mitigation}
                      onChange={(e) => handleObjectArrayChange('risks', index, 'mitigation', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="How will this risk be mitigated?"
                    />
                  </div>
                </div>
                {formData.risks.length > 1 && (
                  <div className="mt-3 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeArrayItem('risks', index)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Any additional notes or comments about the project"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(isTemplate ? '/projects/templates' : '/projects')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? (isTemplate ? 'Update Template' : 'Update Project') : (isTemplate ? 'Create Template' : 'Create Project')}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm