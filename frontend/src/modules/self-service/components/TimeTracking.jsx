import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  Clock, 
  MapPin, 
  Calendar, 
  Coffee,
  Play,
  Square,
  AlertCircle,
  CheckCircle,
  Timer,
  Navigation,
  TrendingUp,
  Info,
  Shield
} from 'lucide-react'
import { selfServiceService } from '../../../services/selfServiceService'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast';

const TimeTracking = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [location, setLocation] = useState(null)
  const [isOnBreak, setIsOnBreak] = useState(false)

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    getCurrentLocation()

    return () => clearInterval(timer)
  }, [])

  // Get current location
  const getCurrentLocation = async () => {
    try {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser')
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          console.log('Location access denied or unavailable:', error.message)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      )
    } catch (error) {
      console.log('Location error:', error.message)
    }
  }

  // Fetch today's attendance
  const { data: todayAttendance, refetch: refetchAttendance } = useQuery(
    'today-attendance',
    async () => {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      // Get current month's attendance
      const response = await selfServiceService.getMyAttendance({
        month: today.getMonth() + 1,
        year: today.getFullYear(),
        limit: 100 // Get enough records to find today
      })
      
      // Extract attendance array from response
      const attendanceList = response?.data?.data?.attendance || response?.data?.attendance || []
      
      // Find today's attendance record
      const attendance = attendanceList.find(record => {
        const recordDate = new Date(record.date).toISOString().split('T')[0]
        return recordDate === todayStr
      })
      
      if (attendance) {
        setIsOnBreak(attendance.break_start_time && !attendance.break_end_time)
      }
      
      console.log('Today attendance:', attendance)
      return attendance || null
    },
    {
      enabled: !!user.Employee?.id,
      refetchInterval: 30000, // Refetch every 30 seconds
      onError: (error) => {
        console.error('Error fetching today attendance:', error)
      }
    }
  )

  // Fetch recent attendance
  const { data: recentAttendance } = useQuery(
    'recent-attendance',
    async () => {
      const response = await selfServiceService.getMyAttendance({
        limit: 7
      })
      return response?.data?.data?.attendance || response?.data?.attendance || []
    },
    {
      enabled: !!user.Employee?.id,
      onError: (error) => {
        console.error('Error fetching recent attendance:', error)
      }
    }
  )

  // Clock in mutation
  const clockInMutation = useMutation(
    async () => {
      const clockInData = {
        location: location ? `${location.latitude}, ${location.longitude}` : 'Unknown',
        notes: 'Clocked in via self-service portal'
      }
      return await selfServiceService.checkIn(clockInData)
    },
    {
      onSuccess: (response) => {
        toast.success('Clocked in successfully!')
        refetchAttendance()
        queryClient.invalidateQueries('recent-attendance')
      },
      onError: (error) => {
        toast(error.response?.data?.message || 'Failed to clock in')
      }
    }
  )

  // Clock out mutation
  const clockOutMutation = useMutation(
    async () => {
      const clockOutData = {
        notes: 'Clocked out via self-service portal'
      }
      return await selfServiceService.checkOut(clockOutData)
    },
    {
      onSuccess: (response) => {
        toast.success('Clocked out successfully!')
        refetchAttendance()
        queryClient.invalidateQueries('recent-attendance')
      },
      onError: (error) => {
        toast(error.response?.data?.message || 'Failed to clock out')
      }
    }
  )

  const formatTime = (time) => {
    return time.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-green-600 bg-green-100'
      case 'late': return 'text-yellow-600 bg-yellow-100'
      case 'absent': return 'text-red-600 bg-red-100'
      case 'half_day': return 'text-primary bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const canClockIn = !todayAttendance?.check_in_time
  const canClockOut = todayAttendance?.check_in_time && !todayAttendance?.check_out_time
  const isLoading = clockInMutation.isLoading || clockOutMutation.isLoading
  
  // Debug logging
  console.log('Attendance Debug:', {
    todayAttendance,
    check_in_time: todayAttendance?.check_in_time,
    check_out_time: todayAttendance?.check_out_time,
    canClockIn,
    canClockOut,
    isLoading
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600">Clock in/out and track your working hours</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Navigation className="h-4 w-4" />
          <span>{location ? 'Location detected' : 'Location unavailable'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Clock Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Time Display */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-gray-900 mb-2">
                {formatTime(currentTime)}
              </div>
              <div className="text-lg text-gray-600">
                {formatDate(currentTime)}
              </div>
              {todayAttendance && (
                <div className="mt-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    getStatusColor(todayAttendance.status)
                  }`}>
                    {todayAttendance.status?.charAt(0).toUpperCase() + todayAttendance.status?.slice(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => clockInMutation.mutate()}
                disabled={!canClockIn || isLoading}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium ${
                  canClockIn && !isLoading
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Play className="h-5 w-5" />
                <span>{isLoading && clockInMutation.isLoading ? 'Clocking In...' : 'Clock In'}</span>
              </button>

              <button
                onClick={() => clockOutMutation.mutate()}
                disabled={!canClockOut || isLoading}
                className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium ${
                  canClockOut && !isLoading
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Square className="h-5 w-5" />
                <span>{isLoading && clockOutMutation.isLoading ? 'Clocking Out...' : 'Clock Out'}</span>
              </button>
            </div>
          </div>

          {/* Today's Summary */}
          {todayAttendance && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Summary</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {todayAttendance.check_in_time || '--:--'}
                  </div>
                  <div className="text-sm text-gray-500">Clock In</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {todayAttendance.check_out_time || '--:--'}
                  </div>
                  <div className="text-sm text-gray-500">
                    Clock Out
                    {todayAttendance.auto_checkout && (
                      <span className="block text-xs text-orange-600 mt-1">
                        (Auto)
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {todayAttendance.total_hours || '0.00'}h
                  </div>
                  <div className="text-sm text-gray-500">Total Hours</div>
                </div>
              </div>
              
              {/* Auto Checkout Notice */}
              {todayAttendance.auto_checkout && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-start">
                    <Shield className="h-4 w-4 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-800">Automatic Checkout</p>
                      <p className="text-orange-700 mt-1">
                        You were automatically checked out at 8:00 PM (Nigeria time) as you didn't check out manually.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Automatic Checkout Information */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-2">Automatic Checkout Policy</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p>
                    <strong>Daily Auto-Checkout:</strong> If you forget to check out, the system will automatically 
                    check you out at <strong>8:00 PM (20:00) Nigeria time</strong> every day.
                  </p>
                  <p>
                    <strong>Why this helps:</strong> Ensures accurate time tracking and prevents overnight clock-in sessions 
                    that could affect your attendance records.
                  </p>
                  <p className="text-xs text-primary mt-3">
                    💡 <strong>Tip:</strong> Always remember to check out manually for the most accurate time tracking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Location Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </h3>
            {location ? (
              <div className="space-y-2">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Location detected</span>
                </div>
                <div className="text-xs text-gray-500">
                  Accuracy: ±{Math.round(location.accuracy)}m
                </div>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <AlertCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">Location unavailable</span>
              </div>
            )}
          </div>

          {/* Break Status */}
          {isOnBreak && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <Coffee className="h-5 w-5 text-orange-600 mr-2" />
                <span className="font-medium text-orange-800">On Break</span>
              </div>
              <div className="text-sm text-orange-600 mt-1">
                Started at {todayAttendance?.break_start_time}
              </div>
            </div>
          )}

          {/* Recent Attendance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Days</h3>
            <div className="space-y-3">
              {recentAttendance?.slice(0, 5).map((attendance) => (
                <div key={attendance.id} className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(attendance.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-gray-500">
                      {attendance.total_hours || '0.00'}h
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(attendance.status)
                  }`}>
                    {attendance.status}
                  </span>
                </div>
              )) || (
                <div className="text-center text-gray-500 text-sm">
                  No recent attendance records
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Attendance History</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {recentAttendance?.length > 0 ? (
            recentAttendance.map((attendance) => (
              <div key={attendance.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {new Date(attendance.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {attendance.check_in_time} - {attendance.check_out_time || 'Not clocked out'}
                      {attendance.auto_checkout && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          Auto Checkout
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(attendance.status)
                    }`}>
                      {attendance.status}
                    </span>
                    <div className="text-sm text-gray-500 mt-1">
                      {attendance.total_hours || '0.00'}h total
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No attendance records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TimeTracking