import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  UserPlus, 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye,
  EyeOff,
  Edit,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Key,
  UserX,
  UserCheck,
  AlertTriangle
} from 'lucide-react'
import employeeService from '../../services/employeeService'
import { toast } from 'react-hot-toast'

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    department_id: '',
    employment_status: '',
    employment_type: ''
  })
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })
  const [departments, setDepartments] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false)
  const [showSuspensionModal, setShowSuspensionModal] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchEmployees()
    fetchDepartments()
  }, [pagination?.currentPage, searchTerm, filters])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination?.currentPage || 1,
        limit: pagination?.itemsPerPage || 10,
        search: searchTerm,
        ...filters
      }
      
      const response = await employeeService.getEmployees(params)
      
      // Ensure we have valid data
      const employees = response.data?.data?.employees || []
      const paginationData = response.data?.data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      }
      
      setEmployees(employees)
      setPagination(paginationData)
    } catch (error) {
      toast.error('Failed to fetch employees')
      console.error('Error fetching employees:', error)
      
      // Set empty state on error
      setEmployees([])
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      console.log('Fetching departments...');
      const response = await employeeService.getDepartments();
      console.log('Departments response:', response);
      setDepartments(response.data.departments || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...(prev || {}), currentPage: 1 }))
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...(prev || {}), currentPage: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      department_id: '',
      employment_status: '',
      employment_type: ''
    })
    setSearchTerm('')
    setPagination(prev => ({ ...(prev || {}), currentPage: 1 }))
  }

  const handlePasswordReset = async () => {
    if (!selectedEmployee) return
    
    // Validate password
    if (!newPassword || newPassword.trim().length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }
    
    try {
      setActionLoading(true)
      await employeeService.resetEmployeePassword(selectedEmployee.id, newPassword)
      toast.success(`Password reset successfully for ${selectedEmployee.User.first_name} ${selectedEmployee.User.last_name}`)
      setShowPasswordResetModal(false)
      setSelectedEmployee(null)
      setNewPassword('')
      setShowPassword(false)
    } catch (error) {
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSuspension = async (suspend) => {
    if (!selectedEmployee) return
    
    try {
      setActionLoading(true)
      await employeeService.toggleEmployeeSuspension(selectedEmployee.id, suspend, suspensionReason)
      toast.success(`Employee ${suspend ? 'suspended' : 'unsuspended'} successfully`)
      setShowSuspensionModal(false)
      setSelectedEmployee(null)
      setSuspensionReason('')
      fetchEmployees() // Refresh the list
    } catch (error) {
      toast.error(error.message || `Failed to ${suspend ? 'suspend' : 'unsuspend'} employee`)
    } finally {
      setActionLoading(false)
    }
  }

  const openPasswordResetModal = (employee) => {
    setSelectedEmployee(employee)
    setShowPasswordResetModal(true)
  }

  const openSuspensionModal = (employee) => {
    setSelectedEmployee(employee)
    setShowSuspensionModal(true)
    setSuspensionReason('')
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      terminated: 'bg-red-100 text-red-800',
      on_leave: 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  const getEmploymentTypeBadge = (type) => {
    const typeColors = {
      full_time: 'bg-blue-100 text-blue-800',
      part_time: 'bg-purple-100 text-purple-800',
      contract: 'bg-orange-100 text-orange-800',
      intern: 'bg-pink-100 text-pink-800'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[type] || 'bg-gray-100 text-gray-800'}`}>
        {type.replace('_', ' ').toUpperCase()}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage employee information, roles, and organizational structure</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <Link 
            to="/hr/employees/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Employee</span>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search employees by name, email, or employee ID..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    value={filters.department_id}
                    onChange={(e) => handleFilterChange('department_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.employment_status}
                    onChange={(e) => handleFilterChange('employment_status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="terminated">Terminated</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={filters.employment_type}
                    onChange={(e) => handleFilterChange('employment_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Employees ({pagination?.totalItems || 0})
            </h3>
          </div>
        </div>
        
        {loading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : employees.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first employee'
              }
            </p>
            {!searchTerm && !Object.values(filters).some(f => f) && (
              <Link 
                to="/hr/employees/new"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add First Employee
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hire Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {employee.User.avatar ? (
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={employee.User.avatar} 
                              alt="" 
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {employee.User.first_name[0]}{employee.User.last_name[0]}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.User.first_name} {employee.User.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.employee_id} • {employee.User.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                      {employee.Manager && (
                        <div className="text-sm text-gray-500">
                          Reports to: {employee.Manager.User.first_name} {employee.Manager.User.last_name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.Department?.name || 'No Department'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {employee.Department?.code}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(employee.employment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEmploymentTypeBadge(employee.employment_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/hr/employees/${employee.id}`}
                          className="text-primary-600 hover:text-primary-900 p-1"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/hr/employees/${employee.id}/edit`}
                          className="text-gray-600 hover:text-gray-900 p-1"
                          title="Edit Employee"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          className="text-primary hover:text-blue-900 p-1"
                          title="Reset Password"
                          onClick={() => openPasswordResetModal(employee)}
                        >
                          <Key className="h-4 w-4" />
                        </button>
                        {employee.employment_status === 'active' ? (
                          <button
                            className="text-orange-600 hover:text-orange-900 p-1"
                            title="Suspend Employee"
                            onClick={() => openSuspensionModal(employee)}
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : employee.employment_status === 'inactive' ? (
                          <button
                            className="text-green-600 hover:text-green-900 p-1"
                            title="Unsuspend Employee"
                            onClick={() => openSuspensionModal(employee)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...(prev || {}), currentPage: (prev?.currentPage || 1) - 1 }))}
                  disabled={pagination.currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...(prev || {}), currentPage: (prev?.currentPage || 1) + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-blue-100 rounded-full">
                <Key className="h-6 w-6 text-primary" />
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Reset Password
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500 mb-4">
                    Reset password for{' '}
                    <span className="font-medium">
                      {selectedEmployee?.User.first_name} {selectedEmployee?.User.last_name}
                    </span>
                  </p>
                  <div className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min 8 characters)"
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <button
                    onClick={() => {
                      setShowPasswordResetModal(false)
                      setSelectedEmployee(null)
                      setNewPassword('')
                      setShowPassword(false)
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordReset}
                    className="px-4 py-2 bg-primary text-white text-base font-medium rounded-md shadow-sm hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    {actionLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suspension Modal */}
      {showSuspensionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full">
                {selectedEmployee?.employment_status === 'active' ? (
                  <UserX className="h-6 w-6 text-orange-600" />
                ) : (
                  <UserCheck className="h-6 w-6 text-green-600" />
                )}
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {selectedEmployee?.employment_status === 'active' ? 'Suspend' : 'Unsuspend'} Employee
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to {selectedEmployee?.employment_status === 'active' ? 'suspend' : 'unsuspend'}{' '}
                    <span className="font-medium">
                      {selectedEmployee?.User.first_name} {selectedEmployee?.User.last_name}
                    </span>?
                  </p>
                  {selectedEmployee?.employment_status === 'active' && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 text-left">
                        Reason (Optional)
                      </label>
                      <textarea
                        value={suspensionReason}
                        onChange={(e) => setSuspensionReason(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        rows={3}
                        placeholder="Enter reason for suspension..."
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <button
                    onClick={() => {
                      setShowSuspensionModal(false)
                      setSelectedEmployee(null)
                      setSuspensionReason('')
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSuspension(selectedEmployee?.employment_status === 'active')}
                    className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 disabled:opacity-50 ${
                      selectedEmployee?.employment_status === 'active'
                        ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                    }`}
                    disabled={actionLoading}
                  >
                    {actionLoading 
                      ? (selectedEmployee?.employment_status === 'active' ? 'Suspending...' : 'Unsuspending...')
                      : (selectedEmployee?.employment_status === 'active' ? 'Suspend' : 'Unsuspend')
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeManagement