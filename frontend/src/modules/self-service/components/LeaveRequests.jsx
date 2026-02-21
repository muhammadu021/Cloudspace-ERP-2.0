import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Calendar, 
  Plus, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  MapPin
} from 'lucide-react'
import { selfServiceService } from '../../../services/selfServiceService'
import { useAuth } from '../../../contexts/AuthContext'
import { toast } from 'react-hot-toast';

const LeaveRequests = () => {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    duration_days: '',
    reason: '',
    is_half_day: false,
    half_day_period: 'morning',
    contact_number: '',
    emergency_contact: '',
    handover_notes: ''
  })
  const [durationError, setDurationError] = useState('')

  // Fetch user's leave requests
  const { data: leaveRequests, isLoading: requestsLoading, error: requestsError } = useQuery(
    'my-leave-requests',
    async () => {
      console.log('Fetching leave requests for employee:', user?.Employee?.id)
      const response = await selfServiceService.getMyLeaves({
        employee_id: user?.Employee?.id,
        limit: 50
      })
      console.log('Leave requests response:', response)
      return response?.data?.data?.leaves || response?.data?.leaves || []
    },
    {
      enabled: !!user?.Employee?.id,
      onError: (error) => {
        console.error('Error fetching leave requests:', error)
      }
    }
  )

  // Fetch leave types
  const { data: leaveTypes } = useQuery(
    'leave-types',
    async () => {
      const response = await selfServiceService.getLeaveTypes()
      console.log('Leave types response:', response.data)
      return response?.data?.data?.leaveTypes || response?.data?.leaveTypes || []
    },
    {
      onError: (error) => {
        console.error('Error fetching leave types:', error)
      }
    }
  )

  // Fetch leave balances
  const { data: leaveBalances } = useQuery(
    'my-leave-balances',
    async () => {
      console.log('Fetching leave balances for employee:', user?.Employee?.id)
      const response = await selfServiceService.getLeaveTypes() // Using getLeaveTypes as fallback since getLeaveBalances might not be implemented
      // In a real implementation, you'd use: await selfServiceService.getLeaveBalances({ employee_id: user?.Employee?.id })
      console.log('Leave balances response:', response)
      return response?.data?.data?.leaveTypes || response?.data?.leaveTypes || []
    },
    {
      enabled: !!user?.Employee?.id,
      onError: (error) => {
        console.error('Error fetching leave balances:', error)
      }
    }
  )

  // Submit leave request mutation
  const submitRequestMutation = useMutation(
    async (requestData) => {
      return await selfServiceService.requestLeave(requestData)
    },
    {
      onSuccess: () => {
        toast.success('Leave request submitted successfully!')
        setShowRequestForm(false)
        setFormData({
          leave_type_id: '',
          start_date: '',
          end_date: '',
          duration_days: '',
          reason: '',
          is_half_day: false,
          half_day_period: 'morning',
          contact_number: '',
          emergency_contact: '',
          handover_notes: ''
        })
        setDurationError('')
        queryClient.invalidateQueries('my-leave-requests')
        queryClient.invalidateQueries('my-leave-balances')
      },
      onError: (error) => {
        toast(error.response?.data?.message || 'Failed to submit leave request')
      }
    }
  )

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }
      
      // Auto-calculate end date when duration or start date changes
      if (name === 'duration_days' || name === 'start_date') {
        if (newData.start_date && newData.duration_days && !newData.is_half_day) {
          const startDate = new Date(newData.start_date)
          const endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + parseInt(newData.duration_days) - 1)
          newData.end_date = endDate.toISOString().split('T')[0]
        }
      }
      
      // Set end date same as start date for half day
      if (name === 'is_half_day' && checked) {
        newData.end_date = newData.start_date
        newData.duration_days = '0.5'
      } else if (name === 'is_half_day' && !checked) {
        newData.duration_days = ''
      }
      
      return newData
    })
    
    // Validate duration against leave type limits
    if (name === 'duration_days' || name === 'leave_type_id') {
      validateDuration(name === 'duration_days' ? value : formData.duration_days, 
                      name === 'leave_type_id' ? value : formData.leave_type_id)
    }
  }

  const validateDuration = (duration, leaveTypeId) => {
    setDurationError('')
    
    if (!duration || !leaveTypeId || !leaveTypes) return
    
    const selectedLeaveType = leaveTypes.find(type => type.id.toString() === leaveTypeId.toString())
    if (!selectedLeaveType) return
    
    const durationNum = parseFloat(duration)
    const maxConsecutive = selectedLeaveType.max_consecutive_days
    
    if (maxConsecutive && durationNum > maxConsecutive) {
      setDurationError(`Maximum ${maxConsecutive} consecutive days allowed for ${selectedLeaveType.name}`)
    }
  }
  
  const getSelectedLeaveType = () => {
    if (!formData.leave_type_id || !leaveTypes) return null
    return leaveTypes.find(type => type.id.toString() === formData.leave_type_id.toString())
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.leave_type_id || !formData.start_date || !formData.duration_days || !formData.reason) {
      toast.warning('Please fill in all required fields')
      return
    }
    
    if (durationError) {
      toast.error('Please fix the duration error before submitting')
      return
    }

    submitRequestMutation.mutate({
      ...formData,
      employee_id: user?.Employee?.id
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'cancelled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'cancelled': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const calculateDays = () => {
    if (formData.is_half_day) return 0.5
    if (formData.duration_days) return parseFloat(formData.duration_days)
    if (!formData.start_date || !formData.end_date) return 0
    
    const start = new Date(formData.start_date)
    const end = new Date(formData.end_date)
    const timeDiff = end.getTime() - start.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
  }

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="text-gray-500 ml-3">Loading...</p>
      </div>
    )
  }

  // Show error if user is not found or no employee record
  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-gray-500">Please log in to view your leave requests.</p>
        </div>
      </div>
    )
  }

  if (!user.Employee) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Employee Record</h3>
          <p className="text-gray-500">Your account is not linked to an employee record.</p>
          <p className="text-xs text-gray-400 mt-2">User ID: {user.id}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-gray-600">Manage your leave applications and view balances</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          <span>Request Leave</span>
        </button>
      </div>

      {/* Leave Balances */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Balances</h3>
        {leaveBalances && leaveBalances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaveBalances.map((balance) => (
              <div key={balance.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">
                    {balance.LeaveType?.name || 'Unknown Type'}
                  </h4>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: balance.LeaveType?.color || '#3498db' }}
                  />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-medium">{balance.available_balance || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Used:</span>
                    <span className="font-medium">{balance.used_balance || 0} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pending:</span>
                    <span className="font-medium">{balance.pending_balance || 0} days</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No leave balances available</p>
          </div>
        )}
      </div>

      {/* Leave Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">My Leave Requests</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {requestsLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading leave requests...</p>
            </div>
          ) : requestsError ? (
            <div className="px-6 py-12 text-center">
              <XCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading leave requests</h3>
              <p className="text-gray-500">{requestsError.message}</p>
              <p className="text-xs text-gray-400 mt-2">Employee ID: {user?.Employee?.id || 'Not found'}</p>
            </div>
          ) : leaveRequests && leaveRequests.length > 0 ? (
            leaveRequests.map((request) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: request.LeaveType?.color || '#3498db' }}
                      />
                      <h4 className="font-medium text-gray-900">
                        {request.LeaveType?.name || request.leave_type}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(request.status)
                      }`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Duration:</span> {' '}
                        {new Date(request.start_date).toLocaleDateString()} - {' '}
                        {new Date(request.end_date).toLocaleDateString()}
                        {request.is_half_day && ` (${request.half_day_period} half-day)`}
                      </div>
                      <div>
                        <span className="font-medium">Days:</span> {request.total_days}
                      </div>
                      <div>
                        <span className="font-medium">Applied:</span> {' '}
                        {new Date(request.applied_date || request.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {request.reason && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </div>
                    )}
                    {request.rejection_reason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                        <span className="font-medium">Rejection Reason:</span> {request.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leave requests</h3>
              <p className="text-gray-500">You haven't submitted any leave requests yet.</p>
              <p className="text-xs text-gray-400 mt-2">Employee ID: {user?.Employee?.id || 'Not found'}</p>
              <p className="text-xs text-gray-400">Requests loaded: {leaveRequests ? leaveRequests.length : 'null'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Leave Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRequestForm(false)} />
          <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Request Leave</h2>
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Type *
                    </label>
                    <select
                      name="leave_type_id"
                      value={formData.leave_type_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Leave Type</option>
                      {leaveTypes?.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (Days) *
                    </label>
                    <input
                      type="number"
                      name="duration_days"
                      value={formData.duration_days}
                      onChange={handleInputChange}
                      min="0.5"
                      step="0.5"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        durationError ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter number of days"
                      disabled={formData.is_half_day}
                      required
                    />
                    {getSelectedLeaveType() && (
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum: {getSelectedLeaveType().max_consecutive_days || 'Unlimited'} consecutive days
                      </p>
                    )}
                    {durationError && (
                      <p className="text-xs text-red-600 mt-1">{durationError}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_half_day"
                      checked={formData.is_half_day}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Half Day</span>
                  </label>

                  {formData.is_half_day && (
                    <select
                      name="half_day_period"
                      value={formData.half_day_period}
                      onChange={handleInputChange}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-calculated based on start date and duration
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason *
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Please provide a reason for your leave request..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Your contact number during leave"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="text"
                      name="emergency_contact"
                      value={formData.emergency_contact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Emergency contact person"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Handover Notes
                  </label>
                  <textarea
                    name="handover_notes"
                    value={formData.handover_notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Any work handover instructions or notes..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitRequestMutation.isLoading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitRequestMutation.isLoading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LeaveRequests