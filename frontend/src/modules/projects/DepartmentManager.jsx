import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { 
  Plus, 
  X, 
  Building, 
  Users, 
  Edit, 
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { departmentService } from '@/services/departmentService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
// Removed custom Select import - using native HTML select

const DepartmentManager = ({ onClose, onDepartmentCreated }) => {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('create')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parent_department_id: '',
    head_employee_id: '',
    budget_allocated: '',
    location: '',
    phone: '',
    email: ''
  })
  const [errors, setErrors] = useState({})
  const [editingDepartment, setEditingDepartment] = useState(null)

  // Fetch departments
  const { data: departments, isLoading } = useQuery(
    'departments',
    () => departmentService.getDepartments(),
    {
      select: (response) => response?.data?.departments || [],
      retry: false,
      staleTime: 5 * 60 * 1000
    }
  )

  // Fetch employees for head selection
  const { data: employees } = useQuery(
    'employees',
    () => projectService.getEmployees(),
    {
      select: (response) => response?.data?.employees || [],
      retry: false,
      staleTime: 10 * 60 * 1000
    }
  )

  // Create department mutation
  const createMutation = useMutation(
    (data) => departmentService.createDepartment(data),
    {
      onSuccess: (response) => {
        queryClient.invalidateQueries('departments')
        setFormData({
          name: '',
          code: '',
          description: '',
          parent_department_id: '',
          head_employee_id: '',
          budget_allocated: '',
          location: '',
          phone: '',
          email: ''
        })
        setErrors({})
        if (onDepartmentCreated) {
          onDepartmentCreated(response.data)
        }
      },
      onError: (error) => {
        setErrors(error.response?.data?.errors || {})
      }
    }
  )

  // Update department mutation
  const updateMutation = useMutation(
    ({ id, data }) => departmentService.updateDepartment(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments')
        setEditingDepartment(null)
        setFormData({
          name: '',
          code: '',
          description: '',
          parent_department_id: '',
          head_employee_id: '',
          budget_allocated: '',
          location: '',
          phone: '',
          email: ''
        })
      },
      onError: (error) => {
        setErrors(error.response?.data?.errors || {})
      }
    }
  )

  // Delete department mutation
  const deleteMutation = useMutation(
    (id) => departmentService.deleteDepartment(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('departments')
      }
    }
  )

  const departmentOptions = departments?.map(dept => ({
    value: dept.id,
    label: dept.name
  })) || []

  const employeeOptions = employees?.map(emp => ({
    value: emp.id,
    label: `${emp.first_name} ${emp.last_name} (${emp.employee_id || 'No ID'})`
  })) || []

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = 'Department name is required'
    if (!formData.code.trim()) newErrors.code = 'Department code is required'
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      if (editingDepartment) {
        updateMutation.mutate({ id: editingDepartment.id, data: formData })
      } else {
        createMutation.mutate(formData)
      }
    }
  }

  const handleEdit = (department) => {
    setEditingDepartment(department)
    setFormData({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      parent_department_id: department.parent_department_id || '',
      head_employee_id: department.head_employee_id || '',
      budget_allocated: department.budget_allocated || '',
      location: department.location || '',
      phone: department.phone || '',
      email: department.email || ''
    })
    setActiveTab('create')
  }

  const handleCancelEdit = () => {
    setEditingDepartment(null)
    setFormData({
      name: '',
      code: '',
      description: '',
      parent_department_id: '',
      head_employee_id: '',
      budget_allocated: '',
      location: '',
      phone: '',
      email: ''
    })
    setErrors({})
  }

  const renderCreateForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {editingDepartment ? 'Edit Department' : 'Create New Department'}
        </h3>
        {editingDepartment && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancelEdit}
          >
            Cancel Edit
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Information Technology"
              error={errors.name}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department Code *
            </label>
            <Input
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
              placeholder="e.g., IT"
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
              placeholder="Describe the department's role and responsibilities"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parent Department
            </label>
            <select 
  value={formData.parent_department_id} 
  onChange={(e) => handleInputChange('parent_department_id', e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="">No Parent Department</option>
  {departmentOptions.filter(dept => dept.value !== editingDepartment?.id).map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))}
</select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department Head
            </label>
            <select 
  value={formData.head_employee_id} 
  onChange={(e) => handleInputChange('head_employee_id', e.target.value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
  <option value="">Select Department Head</option>
  {employeeOptions.map(option => (
    <option key={option.value} value={option.value}>{option.label}</option>
  ))}
</select>
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
              Location
            </label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Building A, Floor 3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="department@company.com"
              error={errors.email}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={createMutation.isLoading || updateMutation.isLoading}
            disabled={createMutation.isLoading || updateMutation.isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {editingDepartment ? 'Update Department' : 'Create Department'}
          </Button>
        </div>
      </form>
    </div>
  )

  const renderDepartmentsList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Existing Departments</h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setActiveTab('create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Department
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : departments?.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <Building className="h-8 w-8 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No departments found</p>
          <p className="text-sm text-gray-400">Create your first department to get started</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {departments?.map((department) => (
            <div key={department.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{department.name}</h4>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {department.code}
                    </span>
                  </div>
                  {department.description && (
                    <p className="text-sm text-gray-600 mb-2">{department.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {department.location && (
                      <span>📍 {department.location}</span>
                    )}
                    {department.phone && (
                      <span>📞 {department.phone}</span>
                    )}
                    {department.email && (
                      <span>✉️ {department.email}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(department)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this department?')) {
                        deleteMutation.mutate(department.id)
                      }
                    }}
                    disabled={deleteMutation.isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Department Management</h2>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {editingDepartment ? 'Edit Department' : 'Create Department'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Departments
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'create' ? renderCreateForm() : renderDepartmentsList()}
        </div>
      </div>
    </div>
  )
}

export default DepartmentManager