import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save, X, Plus, Trash2, Upload, User as UserIcon } from 'lucide-react'
import { hrService } from '@/services/hrService'
import { useQuery } from 'react-query'
import { toast } from 'react-hot-toast';

// Helper function to safely parse array fields
const parseArrayField = (field) => {
  if (Array.isArray(field)) {
    return field
  }
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

// Helper function to format date for input field
const formatDateForInput = (dateValue) => {
  if (!dateValue || dateValue === 'null' || dateValue === 'undefined') {
    return ''
  }
  
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) {
      return ''
    }
    // Format as YYYY-MM-DD for date input
    return date.toISOString().split('T')[0]
  } catch {
    return ''
  }
}

// Helper function to prepare date for submission
const prepareDateForSubmission = (dateValue) => {
  if (!dateValue || dateValue.trim() === '') {
    return null
  }
  
  try {
    const date = new Date(dateValue)
    if (isNaN(date.getTime())) {
      return null
    }
    return dateValue
  } catch {
    return null
  }
}

const EmployeeForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    // User data
    username: '',
    email: '',
    notification_email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role_id: '',
    
    // Employee data
    employee_id: '',
    department_id: '',
    manager_id: '',
    position: '',
    employment_type: 'full_time',
    employment_status: 'active',
    hire_date: '',
    salary: '',
    currency: 'USD',
    work_location: '',
    
    // Personal information
    date_of_birth: '',
    address: '',
    national_id: '',
    tax_id: '',
    bank_account: '',
    
    // Emergency contact
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    
    // Skills and certifications
    skills: [],
    certifications: [],
    notes: ''
  })
  
  const [errors, setErrors] = useState({})
  const [newSkill, setNewSkill] = useState('')
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: ''
  })
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  // Fetch departments
  const { data: departmentsData } = useQuery(
    'hr-departments',
    () => hrService.getDepartments(),
    {
      select: (response) => {
        // console.log('EmployeeForm - Departments API response:', response)
        return response?.data?.data?.departments || []
      },
      onError: (error) => {
        console.log('Departments API error:', error.message)
        toast.error('Failed to load departments')
      }
    }
  )

  // Fetch employees for manager selection
  const { data: employeesData } = useQuery(
    'hr-employees-managers',
    () => hrService.getEmployees({ limit: 1000 }),
    {
      select: (response) => {
        // console.log('EmployeeForm - Employees API response:', response)
        return response?.data?.data?.employees || []
      },
      onError: (error) => {
        console.log('Employees API error:', error.message)
        toast.error('Failed to load employees for manager selection')
      }
    }
  )

  const departments = departmentsData || []
  const managers = employeesData || []
  
  // Mock roles data (would need to add roles endpoint to hrService)
  const roles = [
    { id: 1, display_name: 'Administrator' },
    { id: 2, display_name: 'Manager' },
    { id: 3, display_name: 'Employee' },
    { id: 4, display_name: 'HR Manager' },
    { id: 5, display_name: 'Finance Manager' }
  ]

  // Fetch employee data for editing
  const { data: employeeData, isLoading: employeeLoading } = useQuery(
    ['hr-employee', id],
    () => hrService.getEmployeeById(id),
    {
      enabled: isEdit,
      select: (response) => {
        // console.log('EmployeeForm - Employee API response:', response)
        return response?.data?.data?.employee || response?.data?.employee
      },
      onSuccess: (employee) => {
        if (employee) {
          console.log('EmployeeForm - Setting form data:', employee)
          
          // Set image preview if employee has avatar
          if (employee.User?.cloudinary_avatar_url || employee.User?.avatar) {
            setImagePreview(employee.User.cloudinary_avatar_url || employee.User.avatar)
          }
          
          setFormData({
            // User data
            username: employee.User?.username || '',
            email: employee.User?.email || '',
            notification_email: employee.notification_email || '',
            password: '', // Don't populate password for security
            first_name: employee.User?.first_name || '',
            last_name: employee.User?.last_name || '',
            phone: employee.User?.phone || '',
            role_id: employee.User?.role_id || '',
            
            // Employee data
            employee_id: employee.employee_id || '',
            department_id: employee.department_id || '',
            manager_id: employee.manager_id || '',
            position: employee.position || '',
            employment_type: employee.employment_type || 'full_time',
            employment_status: employee.employment_status || 'active',
            hire_date: formatDateForInput(employee.hire_date),
            salary: employee.salary || '',
            currency: employee.currency || 'USD',
            work_location: employee.work_location || '',
            
            // Personal information
            date_of_birth: formatDateForInput(employee.date_of_birth),
            address: employee.address || '',
            national_id: employee.national_id || '',
            tax_id: employee.tax_id || '',
            bank_account: employee.bank_account || '',
            
            // Emergency contact
            emergency_contact_name: employee.emergency_contact_name || '',
            emergency_contact_phone: employee.emergency_contact_phone || '',
            emergency_contact_relationship: employee.emergency_contact_relationship || '',
            
            // Skills and certifications
            skills: parseArrayField(employee.skills),
            certifications: parseArrayField(employee.certifications),
            notes: employee.notes || ''
          })
        }
      },
      onError: (error) => {
        console.error('Employee API error:', error)
        toast.error('Failed to load employee data')
      }
    }
  )

  // Debug current data
  console.log('EmployeeForm - Current data:', {
    departments: departments?.slice(0, 3),
    managers: managers?.slice(0, 3),
    employeeData,
    isEdit,
    employeeLoading
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !(formData.skills || []).includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(skill => skill !== skillToRemove)
    }))
  }

  const addCertification = () => {
    if (newCertification.name.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), { ...newCertification }]
      }))
      setNewCertification({ name: '', issuer: '', date: '' })
    }
  }

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index)
    }))
  }
  
  // Image handling functions
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }
  
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Required fields
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required'
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.employee_id.trim()) newErrors.employee_id = 'Employee ID is required'
    if (!formData.position.trim()) newErrors.position = 'Position is required'
    if (!formData.hire_date) newErrors.hire_date = 'Hire date is required'
    
    // Only validate username and password for new employees
    if (!isEdit) {
      if (!formData.username.trim()) newErrors.username = 'Username is required'
      if (!formData.password.trim()) newErrors.password = 'Password is required'
      else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }
    
    try {
      setLoading(true)
      
      if (isEdit) {
        // For edit mode, update both user and employee data
        const submitData = { ...formData }
        
        // Remove password from update data if it's empty
        if (!submitData.password) {
          delete submitData.password
        }
        
        // Remove username from update data in edit mode (username shouldn't be changed)
        delete submitData.username
        
        // Properly handle date fields
        submitData.date_of_birth = prepareDateForSubmission(formData.date_of_birth)
        submitData.hire_date = prepareDateForSubmission(formData.hire_date)
        
        console.log('Updating employee data:', submitData)
        await hrService.updateEmployee(id, submitData)
        
        // Upload image if selected
        if (selectedImage) {
          try {
            console.log('Uploading employee avatar for ID:', id)
            const imageFormData = new FormData()
            imageFormData.append('avatar', selectedImage)
            console.log('Image FormData created, file:', selectedImage.name, 'size:', selectedImage.size)
            const uploadResponse = await hrService.uploadEmployeeAvatar(id, imageFormData)
            console.log('Image upload response:', uploadResponse)
            toast.success('Employee and profile image updated successfully')
          } catch (imageError) {
            console.error('Error uploading image:', imageError)
            console.error('Image error response:', imageError.response?.data)
            toast.error(`Employee updated, but image upload failed: ${imageError.response?.data?.message || imageError.message}`)
          }
        } else {
          toast.success('Employee updated successfully')
        }
      } else {
        // For create mode, we need to create user first, then employee
        console.log('Creating new employee...')
        
        // Step 1: Create user account
        const userData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          ...(formData.phone && { phone: formData.phone }),
          role_id: 3 // Default to employee role
        }
        
        console.log('Creating user:', userData)
        const userResponse = await hrService.createUser(userData)
        const userId = userResponse.data?.data?.user?.id
        
        if (!userId) {
          throw new Error('Failed to get user ID from registration response')
        }
        
        console.log('User created with ID:', userId)
        
        // Step 2: Create employee record
        const employeeData = {
          employee_id: formData.employee_id,
          user_id: userId,
          department_id: formData.department_id ? parseInt(formData.department_id) : null,
          manager_id: formData.manager_id ? parseInt(formData.manager_id) : null,
          position: formData.position,
          employment_type: formData.employment_type,
          employment_status: formData.employment_status,
          hire_date: prepareDateForSubmission(formData.hire_date),
          salary: formData.salary ? parseFloat(formData.salary) : null,
          currency: formData.currency,
          work_location: formData.work_location,
          date_of_birth: prepareDateForSubmission(formData.date_of_birth),
          address: formData.address,
          national_id: formData.national_id,
          tax_id: formData.tax_id,
          bank_account: formData.bank_account,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          emergency_contact_relationship: formData.emergency_contact_relationship,
          skills: formData.skills,
          certifications: formData.certifications,
          notes: formData.notes
        }
        
        console.log('Creating employee:', employeeData)
        const employeeResponse = await hrService.createEmployee(employeeData)
        
        // Upload image if selected
        if (selectedImage && employeeResponse.data?.data?.employee?.id) {
          try {
            console.log('Uploading employee avatar for ID:', employeeResponse.data.data.employee.id)
            const imageFormData = new FormData()
            imageFormData.append('avatar', selectedImage)
            console.log('Image FormData created, file:', selectedImage.name, 'size:', selectedImage.size)
            const uploadResponse = await hrService.uploadEmployeeAvatar(employeeResponse.data.data.employee.id, imageFormData)
            console.log('Image upload response:', uploadResponse)
            toast.success('Employee created with profile image')
          } catch (imageError) {
            console.error('Error uploading image:', imageError)
            console.error('Image error response:', imageError.response?.data)
            toast.error(`Employee created, but image upload failed: ${imageError.response?.data?.message || imageError.message}`)
          }
        } else {
          if (selectedImage) {
            console.log('Employee ID not found in response:', employeeResponse)
          }
          toast.success('Employee created successfully')
        }
      }
      
      navigate('/hr/employees')
    } catch (error) {
      console.error('Error saving employee:', error)
      toast(error.response?.data?.message || error.message || 'Failed to save employee')
    } finally {
      setLoading(false)
    }
  }

  if (isEdit && employeeLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/hr/employees"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Employee' : 'Add New Employee'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Update employee information' : 'Create a new employee record'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Image</h2>
          <div className="flex items-center space-x-6">
            {/* Image Preview */}
            <div className="flex-shrink-0">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserIcon className="h-16 w-16 text-gray-400" />
                )}
              </div>
            </div>
            
            {/* Upload Controls */}
            <div className="flex-1">
              <div className="flex items-center space-x-4">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 flex items-center space-x-2">
                    <Upload className="h-4 w-4" />
                    <span>{imagePreview ? 'Change Image' : 'Upload Image'}</span>
                  </div>
                </label>
                
                {imagePreview && (
                  <button
                    type="button"
                    onClick={removeImage}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Recommended: Square image, at least 400x400px. Max size: 5MB
              </p>
              <p className="text-xs text-gray-400">
                Supported formats: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>
        
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.first_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.last_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Login) *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Used for login and authentication</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Email
              </label>
              <input
                type="email"
                name="notification_email"
                value={formData.notification_email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Leave empty to use login email"
              />
              <p className="mt-1 text-xs text-gray-500">Separate email for notifications (optional)</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {!isEdit && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.username ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password * (min 8 characters)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Employment Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.employee_id ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.employee_id && (
                <p className="mt-1 text-sm text-red-600">{errors.employee_id}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.position ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-600">{errors.position}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department_id"
                value={formData.department_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager
              </label>
              <select
                name="manager_id"
                value={formData.manager_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Manager</option>
                {managers.filter(emp => emp.id !== parseInt(id)).map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.User.first_name} {emp.User.last_name} ({emp.employee_id})
                  </option>
                ))}
              </select>
            </div>
            

            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Type
              </label>
              <select
                name="employment_type"
                value={formData.employment_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="intern">Intern</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employment Status
              </label>
              <select
                name="employment_status"
                value={formData.employment_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hire Date *
              </label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.hire_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.hire_date && (
                <p className="mt-1 text-sm text-red-600">{errors.hire_date}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Salary
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work Location
              </label>
              <input
                type="text"
                name="work_location"
                value={formData.work_location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                National ID
              </label>
              <input
                type="text"
                name="national_id"
                value={formData.national_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID
              </label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bank Account
              </label>
              <input
                type="text"
                name="bank_account"
                value={formData.bank_account}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                name="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                name="emergency_contact_phone"
                value={formData.emergency_contact_phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <input
                type="text"
                name="emergency_contact_relationship"
                value={formData.emergency_contact_relationship}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Skills</h2>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add a skill"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {(formData.skills || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(formData.skills || []).map((skill, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-primary hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Certifications</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                value={newCertification.name}
                onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Certification name"
              />
              <input
                type="text"
                value={newCertification.issuer}
                onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Issuing organization"
              />
              <input
                type="date"
                value={newCertification.date}
                onChange={(e) => setNewCertification(prev => ({ ...prev, date: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addCertification}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            
            {(formData.certifications || []).length > 0 && (
              <div className="space-y-2">
                {(formData.certifications || []).map((cert, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{cert.name}</div>
                      {cert.issuer && (
                        <div className="text-sm text-gray-600">Issued by: {cert.issuer}</div>
                      )}
                      {cert.date && (
                        <div className="text-sm text-gray-600">Date: {new Date(cert.date).toLocaleDateString()}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Any additional notes about the employee..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Link
            to="/hr/employees"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Saving...' : (isEdit ? 'Update Employee' : 'Create Employee')}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default EmployeeForm