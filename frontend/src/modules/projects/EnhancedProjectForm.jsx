import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Calendar,
  Banknote,
  Users,
  AlertCircle,
  Building,
  UserPlus,
  Settings,
  Target,
  FileText,
  Shield
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { departmentService } from '@/services/departmentService'
import { templatesService } from '@/services/templatesService'
// Removed custom Select imports - using native HTML select
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/contexts/AuthContext'
import DepartmentManager from './DepartmentManager'
import { DEFAULT_CURRENCY, CURRENCY_OPTIONS } from '@/utils/constants'
import { hrService } from '../../services/hrService';
import { toast } from 'react-hot-toast';

const EnhancedProjectForm = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const auth = useAuth()
  const user = auth?.user
  const hasPermission = auth?.hasPermission || (() => true)
  const isEditing = !!id
  const templateId = searchParams.get('template')

  const [activeTab, setActiveTab] = useState('basic')
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    code: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    
    // Budget & Financial
    budget_allocated: '',
    currency: DEFAULT_CURRENCY,
    hourly_rate: '',
    is_billable: true,
    
    // Team & Organization
    manager_id: '',
    department_id: '',
    team_members: [], // Array of employee IDs
    required_skills: [],
    
    // Client Information
    client_name: '',
    client_contact: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    
    // Project Details
    deliverables: [''],
    milestones: [{ name: '', date: '', description: '', completed: false, deliverables: [{ name: '', due_date: '', completed: false }] }],
    risks: [{ description: '', impact: 'medium', probability: 'medium', mitigation: '' }],
    
    // Settings
    visibility: 'internal', // internal, client, public
    notifications_enabled: true,
    time_tracking_enabled: true,
    approval_required: false,
    
    // Additional
    tags: [],
    customTag: '',
    notes: '',
    attachments: []
  })

  const [errors, setErrors] = useState({})
  const [showTeamSelector, setShowTeamSelector] = useState(false)
  const [showDepartmentCreator, setShowDepartmentCreator] = useState(false)

  // Fetch project data if editing
  const { data: project } = useQuery(
    ['project', id],
    () => projectService.getProjectById(id),
    {
      enabled: isEditing,
      onSuccess: (response) => {
        const projectData = response?.data?.data?.project || response?.data?.project || response?.data || {}
        console.log('Project data for edit:', projectData)
        if (projectData.id) {
          // Parse JSON fields if they're strings
          let parsedMilestones = projectData.milestones
          if (typeof parsedMilestones === 'string') {
            try { parsedMilestones = JSON.parse(parsedMilestones) } catch { parsedMilestones = [] }
          }
          let parsedTags = projectData.tags
          if (typeof parsedTags === 'string') {
            try { parsedTags = JSON.parse(parsedTags) } catch { parsedTags = [] }
          }
          let parsedRisks = projectData.risks
          if (typeof parsedRisks === 'string') {
            try { parsedRisks = JSON.parse(parsedRisks) } catch { parsedRisks = [] }
          }
          
          // Get team member IDs from ProjectAssignments
          const teamMemberIds = (projectData.ProjectAssignments || []).map(a => a.employee_id || a.Employee?.id).filter(Boolean)
          
          setFormData(prev => ({
            ...prev,
            name: projectData.name || '',
            code: projectData.code || '',
            description: projectData.description || '',
            status: projectData.status || 'planning',
            priority: projectData.priority || 'medium',
            start_date: projectData.start_date?.split('T')[0] || '',
            end_date: projectData.end_date?.split('T')[0] || '',
            manager_id: projectData.manager_id || '',
            department_id: projectData.department_id || '',
            budget_allocated: projectData.budget_allocated || '',
            currency: projectData.currency || 'NGN',
            is_billable: projectData.is_billable ?? true,
            client_name: projectData.client_name || '',
            client_email: projectData.client_email || '',
            client_phone: projectData.client_phone || '',
            client_contact: projectData.client_contact || '',
            client_address: projectData.client_address || '',
            visibility: projectData.visibility || 'internal',
            notifications_enabled: projectData.notifications_enabled ?? true,
            time_tracking_enabled: projectData.time_tracking_enabled ?? true,
            approval_required: projectData.approval_required ?? false,
            notes: projectData.notes || '',
            tags: Array.isArray(parsedTags) ? parsedTags : [],
            milestones: Array.isArray(parsedMilestones) && parsedMilestones.length > 0
              ? parsedMilestones.map(m => ({
                  name: m.name || '',
                  date: (m.date || '')?.split?.('T')?.[0] || m.date || '',
                  description: m.description || '',
                  completed: m.completed || false,
                  deliverables: Array.isArray(m.deliverables) && m.deliverables.length > 0
                    ? m.deliverables.map(d => ({ 
                        name: d.name || '', 
                        due_date: (d.due_date || '')?.split?.('T')?.[0] || d.due_date || '', 
                        completed: d.completed || false 
                      }))
                    : [{ name: '', due_date: '', completed: false }]
                }))
              : [{ name: '', date: '', description: '', completed: false, deliverables: [{ name: '', due_date: '', completed: false }] }],
            risks: Array.isArray(parsedRisks) && parsedRisks.length > 0
              ? parsedRisks
              : [{ description: '', impact: 'medium', probability: 'medium', mitigation: '' }],
            team_members: teamMemberIds
          }))
        }
      }
    }
  )

  // Fetch template data if creating from template
  const { data: template } = useQuery(
    ['template', templateId],
    () => templatesService.getTemplateById(templateId),
    {
      enabled: !!templateId && !isEditing,
      select: (response) => response?.data?.template,
      onSuccess: (templateData) => {
        if (templateData) {
          console.log('Template data loaded:', templateData)
          setFormData(prev => ({
            ...prev,
            name: templateData.name || '',
            description: templateData.description || '',
            budget_allocated: templateData.estimated_budget || '',
            deliverables: Array.isArray(templateData.tags) ? templateData.tags : [''],
            tags: Array.isArray(templateData.tags) ? templateData.tags : [],
            notes: `Created from template: ${templateData.name}\n\n${templateData.description || ''}`,
            // Set reasonable defaults for template-based projects
            status: 'planning',
            priority: 'medium',
            currency: DEFAULT_CURRENCY,
            is_billable: true,
            visibility: 'internal',
            notifications_enabled: true,
            time_tracking_enabled: true
          }))
        }
      },
      onError: (error) => {
        console.error('Failed to load template:', error)
        // Show user-friendly message
        toast.error('Failed to load template data. You can still create the project manually.')
      }
    }
  )

  // Fetch employees for team selection
  const { data: employees, isLoading: employeesLoading, error: employeesError } = useQuery(
    'hr-employees-managers',
    () => hrService.getEmployees({ limit: 1000 }),
    {
      select: (response) => response?.data?.data?.employees || response?.data?.employees || [],
      retry: false,
      staleTime: 10 * 60 * 1000
    }
  )

  // Fetch departments
  const { data: departments, isLoading: departmentsLoading, error: departmentsError } = useQuery(
    'departments',
    () => departmentService.getDepartments({is_active:'all'}),
    {
      select: (response) => response.data.data?.departments || response.data.departments || [],
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
      onSuccess: () => {
        queryClient.invalidateQueries('projects')
        navigate('/projects')
      },
      onError: (error) => {
        setErrors(error.response?.data?.errors || {})
      }
    }
  )

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'team', label: 'Team & Organization', icon: Users },
    { id: 'budget', label: 'Budget & Timeline', icon: Banknote },
    { id: 'client', label: 'Client Details', icon: Building },
    { id: 'planning', label: 'Planning', icon: Target },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

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

  const currencyOptions = CURRENCY_OPTIONS || [
    { value: 'NGN', label: 'NGN (₦)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'JPY', label: 'JPY (¥)' },
    { value: 'CAD', label: 'CAD (₦)' },
    { value: 'AUD', label: 'AUD (₦)' }
  ]

  const visibilityOptions = [
    { value: 'internal', label: 'Internal Only' },
    { value: 'client', label: 'Client Access' },
    { value: 'public', label: 'Public' }
  ]
const skillOptions = [
  { value: 'finance', label: 'Financial Management' },
  { value: 'operations', label: 'Operations Management' },
  { value: 'procurement', label: 'Procurement & Supply Chain' },
  { value: 'legal', label: 'Legal & Compliance' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'it', label: 'Information Technology' },
  { value: 'marketing', label: 'Marketing & Communications' },
  { value: 'sales', label: 'Sales & Business Development' },
  { value: 'customer_service', label: 'Customer Service' },
  { value: 'project_management', label: 'Project Management' },
  { value: 'strategy', label: 'Corporate Strategy & Planning' },
  { value: 'research', label: 'Research & Development (R&D)' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
  { value: 'client', label: 'Client Project' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'development', label: 'Development' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'training', label: 'Training' },
  { value: 'others', label: 'Others' }
];


  const managerOptions = employees || []

  const departmentOptions = departments?.map(dept => ({
    value: dept.id,
    label: dept.name
  })) || []

  const teamMemberOptions = employees?.map(emp => ({
    value: emp.id,
    label: `${emp.User?.first_name || emp.first_name || ''} ${emp.User?.last_name || emp.last_name || ''} - ${emp.Department?.name || emp.department || 'No Dept'}`
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
    if (!formData.start_date) newErrors.start_date = 'Start date is required'
    if (!formData.end_date) newErrors.end_date = 'End date is required'
    if (!formData.manager_id) newErrors.manager_id = 'Project manager is required'
    
    if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
      newErrors.end_date = 'End date must be after start date'
    }

    if (formData.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.client_email)) {
      newErrors.client_email = 'Invalid email format'
    }

    // Validate milestones have deliverables and dates are valid
    const validMilestones = formData.milestones.filter(m => m.name.trim())
    for (let i = 0; i < validMilestones.length; i++) {
      const m = validMilestones[i]
      const validDeliverables = (m.deliverables || []).filter(d => d.name.trim())
      if (validDeliverables.length === 0) {
        newErrors.milestones = `Milestone "${m.name}" must have at least one deliverable`
        break
      }
      for (const d of validDeliverables) {
        if (d.due_date && m.date && d.due_date > m.date) {
          newErrors.milestones = `Deliverable "${d.name}" due date cannot exceed milestone "${m.name}" date`
          break
        }
      }
      if (newErrors.milestones) break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted, validating...')
    if (validateForm()) {
      console.log('Validation passed, submitting...')
      const submitData = {
        ...formData,
        milestones: formData.milestones.filter(m => m.name.trim()),
        risks: formData.risks.filter(r => r.description?.trim())
      }
      delete submitData.deliverables
      delete submitData.customTag
      mutation.mutate(submitData)
    } else {
      console.log('Validation failed:', errors)
    }
  }

  const renderBasicInfo = () => (
    <div className="space-y-6">
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
            Project Code
          </label>
          <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
            {isEditing ? formData.code : 'Auto-generated (PUF_PRO_XXX)'}
          </div>
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
              <option key={option.value} value={option.value}>{option.label}</option>
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
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
          </label>
          <select
            multiple
            value={formData.tags.filter(t => skillOptions.some(o => o.value === t))}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value)
              const customTags = formData.tags.filter(t => !skillOptions.some(o => o.value === t))
              handleInputChange('tags', [...values, ...customTags])
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            size="4"
          >
            {skillOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              placeholder="Add custom tag..."
              value={formData.customTag}
              onChange={(e) => handleInputChange('customTag', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && formData.customTag.trim()) {
                  e.preventDefault()
                  if (!formData.tags.includes(formData.customTag.trim())) {
                    handleInputChange('tags', [...formData.tags, formData.customTag.trim()])
                  }
                  handleInputChange('customTag', '')
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (formData.customTag.trim() && !formData.tags.includes(formData.customTag.trim())) {
                  handleInputChange('tags', [...formData.tags, formData.customTag.trim()])
                }
                handleInputChange('customTag', '')
              }}
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-sm hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {formData.tags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">
                  {skillOptions.find(o => o.value === tag)?.label || tag}
                  <button type="button" onClick={() => handleInputChange('tags', formData.tags.filter(t => t !== tag))} className="hover:text-primary-600">&times;</button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderTeamOrganization = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* {JSON.stringify({employees})} */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Manager *
          </label>
          {employeesLoading ? (
            <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-sm text-gray-500">Loading employees...</span>
            </div>
          ) : employeesError ? (
            <div className="p-3 border border-red-300 rounded-md bg-red-50">
              <span className="text-sm text-red-600">Error loading employees: {employeesError.message}</span>
            </div>
          ) : (
             <select
                name="manager_id"
                value={formData.manager_id}
                onChange={(e) => handleInputChange('manager_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Manager</option>
                {managerOptions.filter(emp => emp.id !== parseInt(id)).map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.User.first_name} {emp.User.last_name} ({emp.employee_id})
                  </option>
                ))}
              </select>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            {hasPermission('departments:create') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowDepartmentCreator(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New Dept
              </Button>
            )}
          </div>
          {departmentsLoading ? (
            <div className="flex items-center justify-center p-3 border border-gray-300 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span className="ml-2 text-sm text-gray-500">Loading departments...</span>
            </div>
          ) : departmentsError ? (
            <div className="p-3 border border-red-300 rounded-md bg-red-50">
              <span className="text-sm text-red-600">Error loading departments: {departmentsError.message}</span>
            </div>
          ) : (
             <select
                name="department_id"
                value={formData.department_id}
                onChange={(e) => handleInputChange('department_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
          )}
        </div>
      </div>

      {/* Team Members Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Team Members
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTeamSelector(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Team Members
          </Button>
        </div>

        {/* Selected Team Members */}
        <div className="border border-gray-200 rounded-lg p-4 min-h-[100px]">
          {formData.team_members.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No team members selected</p>
              <p className="text-sm">Click "Add Team Members" to select team</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {formData.team_members.map((memberId) => {
                const member = employees?.find(emp => emp.id === memberId)
                if (!member) return null
                
                return (
                  <div key={memberId} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-600">
                          {(member.User?.first_name || member.first_name || '')[0]}{(member.User?.last_name || member.last_name || '')[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.User?.first_name || member.first_name || ''} {member.User?.last_name || member.last_name || ''}
                        </p>
                        <p className="text-xs text-gray-500">{member.Department?.name || member.department || 'No Dept'}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newMembers = formData.team_members.filter(id => id !== memberId)
                        handleInputChange('team_members', newMembers)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Required Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Required Skills
        </label>
        <select
          multiple
          value={formData.required_skills}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value)
            handleInputChange('required_skills', values)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          size="4"
        >
          {skillOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Department Manager Modal */}
      {showDepartmentCreator && (
        <DepartmentManager
          onClose={() => setShowDepartmentCreator(false)}
          onDepartmentCreated={(department) => {
            // Refresh departments query
            queryClient.invalidateQueries('departments')
            // Auto-select the new department
            handleInputChange('department_id', department.id)
            setShowDepartmentCreator(false)
          }}
        />
      )}

      {/* Team Selector Modal */}
      {showTeamSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Select Team Members</h3>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowTeamSelector(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {employeesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                  <span className="ml-2 text-sm text-gray-500">Loading employees...</span>
                </div>
              ) : employeesError ? (
                <div className="text-center py-8">
                  <p className="text-sm text-red-600">Error loading employees: {employeesError.message}</p>
                </div>
              ) : employees?.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">No employees available</p>
                </div>
              ) : (
                employees?.map((employee) => (
                  <div key={employee.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.team_members.includes(employee.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChange('team_members', [...formData.team_members, employee.id])
                        } else {
                          handleInputChange('team_members', formData.team_members.filter(id => id !== employee.id))
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {(employee.User?.first_name || employee.first_name || '')[0]}{(employee.User?.last_name || employee.last_name || '')[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {employee.User?.first_name || employee.first_name || ''} {employee.User?.last_name || employee.last_name || ''}
                      </p>
                      <p className="text-xs text-gray-500">{employee.Department?.name || employee.department || 'No Dept'} • {employee.User?.email || employee.email || ''}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowTeamSelector(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setShowTeamSelector(false)}
              >
                Done ({formData.team_members.length} selected)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderBudgetTimeline = () => (
    <div className="space-y-6">
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
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-y-4">
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
  )

  const renderClientDetails = () => (
    <div className="space-y-6">
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
            Client Contact Person
          </label>
          <Input
            value={formData.client_contact}
            onChange={(e) => handleInputChange('client_contact', e.target.value)}
            placeholder="Contact person name"
          />
        </div>

        <div>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Phone
          </label>
          <Input
            value={formData.client_phone}
            onChange={(e) => handleInputChange('client_phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client Address
          </label>
          <textarea
            value={formData.client_address}
            onChange={(e) => handleInputChange('client_address', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            placeholder="Client address"
          />
        </div>
      </div>
    </div>
  )

  const renderPlanning = () => (
    <div className="space-y-6">
      {/* Milestones */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-900">Milestones</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('milestones', { name: '', date: '', description: '', completed: false, deliverables: [{ name: '', due_date: '', completed: false }] })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </div>
        
        {errors.milestones && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{errors.milestones}</div>
        )}

        <div className="space-y-4">
          {formData.milestones.map((milestone, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Milestone Name *
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
              
              {/* Deliverables */}
              <div className="mt-4 pl-4 border-l-2 border-primary-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Deliverables</label>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...formData.milestones]
                      updated[index].deliverables = [...(updated[index].deliverables || []), { name: '', due_date: '', completed: false }]
                      handleInputChange('milestones', updated)
                    }}
                    className="text-xs text-primary-600 hover:text-primary-800"
                  >
                    + Add Deliverable
                  </button>
                </div>
                {(milestone.deliverables || []).map((del, dIndex) => (
                  <div key={dIndex} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={del.name}
                      onChange={(e) => {
                        const updated = [...formData.milestones]
                        updated[index].deliverables[dIndex].name = e.target.value
                        handleInputChange('milestones', updated)
                      }}
                      placeholder="Deliverable name"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    <input
                      type="date"
                      value={del.due_date}
                      max={milestone.date}
                      onChange={(e) => {
                        const updated = [...formData.milestones]
                        updated[index].deliverables[dIndex].due_date = e.target.value
                        handleInputChange('milestones', updated)
                      }}
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                    />
                    {milestone.deliverables.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = [...formData.milestones]
                          updated[index].deliverables = updated[index].deliverables.filter((_, i) => i !== dIndex)
                          handleInputChange('milestones', updated)
                        }}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
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
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Visibility
          </label>
          <select
            value={formData.visibility}
            onChange={(e) => handleInputChange('visibility', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            {visibilityOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.notifications_enabled}
              onChange={(e) => handleInputChange('notifications_enabled', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable notifications</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.time_tracking_enabled}
              onChange={(e) => handleInputChange('time_tracking_enabled', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Enable time tracking</span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.approval_required}
              onChange={(e) => handleInputChange('approval_required', e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="ml-2 text-sm text-gray-700">Require approval for changes</span>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          placeholder="Any additional notes or comments about the project"
        />
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return renderBasicInfo()
      case 'team':
        return renderTeamOrganization()
      case 'budget':
        return renderBudgetTimeline()
      case 'client':
        return renderClientDetails()
      case 'planning':
        return renderPlanning()
      case 'settings':
        return renderSettings()
      default:
        return renderBasicInfo()
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Project' : (templateId ? `Create Project from Template` : 'Create New Project')}
          </h1>
          <p className="text-gray-600">
            {isEditing ? 'Update project details and settings' : 
             templateId ? `Creating project from template: ${template?.name || 'Loading...'}` :
             'Set up a new project with team selection and advanced features'}
          </p>
          {templateId && template && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              Template: {template.name}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/projects')}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      <form className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
          {/* Tab Content */}
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t bg-white rounded-lg shadow p-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/projects')}
          >
            Cancel
          </Button>
          <Button
          
            loading={mutation.isLoading}
            disabled={mutation.isLoading}
            onClick={handleSubmit}
          >
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default EnhancedProjectForm