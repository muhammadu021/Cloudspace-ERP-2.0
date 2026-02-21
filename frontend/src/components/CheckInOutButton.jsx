import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { 
  Clock, 
  Play, 
  Square, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import hrService from '../services/hrService';
import { useAuth } from '../contexts/AuthContext';

const CheckInOutButton = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [location, setLocation] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockInTime, setClockInTime] = useState(null);
  const [isTracking, setIsTracking] = useState(false);

  // Update current time every minute for live elapsed time calculation (only when tracking)
  useEffect(() => {
    let timer;
    if (isTracking) {
      timer = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000); // Update every minute
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isTracking]);

  // Get current location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      if (!navigator.geolocation) {
        console.log('Geolocation is not supported by this browser');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } catch (error) {
      console.log('Location error:', error.message);
    }
  };

  // Fetch today's attendance status (only when needed)
  const { data: todayAttendance, refetch: refetchAttendance } = useQuery(
    'navbar-today-attendance',
    async () => {
      if (!user?.Employee?.id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      const response = await hrService.getAttendance({
        employee_id: user.Employee.id,
        date_from: today,
        date_to: today,
        limit: 1
      });
      
      const attendance = response?.data?.data?.attendance?.[0] || response?.data?.attendance?.[0];
      return attendance;
    },
    {
      enabled: false, // Don't auto-fetch on login
      onError: (error) => {
        console.error('Error fetching today attendance:', error);
      }
    }
  );

  // Check if user is currently clocked in when component mounts
  useEffect(() => {
    if (user?.Employee?.id) {
      refetchAttendance().then((result) => {
        const attendance = result.data;
        if (attendance?.check_in_time && !attendance?.check_out_time) {
          // User is already clocked in, start tracking
          setClockInTime(new Date(`${new Date().toDateString()} ${attendance.check_in_time}`));
          setIsTracking(true);
        }
      });
    }
  }, [user?.Employee?.id, refetchAttendance]);

  // Clock in mutation
  const clockInMutation = useMutation(
    async () => {
      const clockInData = {
        location: location ? `${location.latitude}, ${location.longitude}` : 'Unknown',
        notes: 'Clocked in via navbar'
      };
      return await hrService.checkIn(clockInData);
    },
    {
      onSuccess: () => {
        // Start tracking time from now
        const now = new Date();
        setClockInTime(now);
        setCurrentTime(now);
        setIsTracking(true);
        
        refetchAttendance();
        queryClient.invalidateQueries('recent-attendance');
        queryClient.invalidateQueries('today-attendance');
        // Show success notification
        toast.success('Clocked in successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to clock in');
      }
    }
  );

  // Clock out mutation
  const clockOutMutation = useMutation(
    async () => {
      const clockOutData = {
        notes: 'Clocked out via navbar'
      };
      return await hrService.checkOut(clockOutData);
    },
    {
      onSuccess: () => {
        // Stop tracking time
        setIsTracking(false);
        setClockInTime(null);
        
        refetchAttendance();
        queryClient.invalidateQueries('recent-attendance');
        queryClient.invalidateQueries('today-attendance');
        // Show success notification
        toast.success('Clocked out successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to clock out');
      }
    }
  );



  // Safe state calculations with fallbacks
  const canClockIn = !isTracking;
  const canClockOut = isTracking;
  const isLoading = clockInMutation.isLoading || clockOutMutation.isLoading;

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5); // Extract HH:MM from HH:MM:SS
  };

  const calculateElapsedTime = () => {
    // Safety check - return early if not tracking or no clock in time
    if (!isTracking || !clockInTime) return 'just now';
    
    try {
      const now = currentTime;
      const diffMs = now - clockInTime;
      
      // Handle negative time differences (shouldn't happen but safety first)
      if (diffMs < 0) return 'just now';
      
      const totalMinutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      if (totalMinutes < 1) {
        return 'just now';
      } else if (totalMinutes < 60) {
        return `${totalMinutes} minute${totalMinutes === 1 ? '' : 's'} ago`;
      } else if (hours === 1 && minutes === 0) {
        return '1 hour ago';
      } else if (hours === 1) {
        return `1 hour ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      } else if (minutes === 0) {
        return `${hours} hours ago`;
      } else {
        return `${hours} hours ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
      }
    } catch (error) {
      console.error('Error calculating elapsed time:', error);
      return 'just now';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-600';
      case 'late':
        return 'text-yellow-600';
      case 'absent':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Don't render if user doesn't have employee record or if there's an error
  if (!user?.Employee?.id) {
    return null;
  }

  // Handle loading state
  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      {/* Main Button */}
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {canClockIn ? (
          <button
            onClick={() => clockInMutation.mutate()}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {isLoading ? 'Clocking In...' : 'Clock In'}
            </span>
          </button>
        ) : canClockOut ? (
          <div className="flex items-center space-x-3">
            {/* Elapsed Time Display */}
            <div className="flex items-center space-x-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md">
              <Clock className="h-3 w-3" />
              <span className="text-xs font-medium">
                {calculateElapsedTime()}
              </span>
            </div>
            
            {/* Clock Out Button */}
            <button
              onClick={() => clockOutMutation.mutate()}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {isLoading ? 'Clocking Out...' : 'Clock Out'}
              </span>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Completed</span>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="font-medium text-gray-900">Today's Attendance</span>
            </div>

            {/* Status */}
            {todayAttendance ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`text-sm font-medium capitalize ${getStatusColor(todayAttendance.status)}`}>
                    {todayAttendance.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Clock In:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatTime(todayAttendance.check_in_time)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Clock Out:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatTime(todayAttendance.check_out_time)}
                    {todayAttendance.auto_checkout && (
                      <span className="ml-1 text-xs text-orange-600">(Auto)</span>
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Hours:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {todayAttendance.total_hours || '0.00'}h
                  </span>
                </div>
                
                {/* Show elapsed time if currently clocked in */}
                {isTracking && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Elapsed Time:</span>
                    <span className="text-sm font-medium text-primary-700">
                      {calculateElapsedTime()}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-2">
                No attendance record for today
              </div>
            )}

            {/* Location Status */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Location:</span>
                {location ? (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-sm text-green-600">Detected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3 text-yellow-600" />
                    <span className="text-sm text-yellow-600">Unavailable</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Link */}
            <div className="border-t border-gray-200 pt-3">
              <a
                href="/self-service/time-tracking"
                className="text-sm text-primary hover:text-primary-700 font-medium"
              >
                View full time tracking →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInOutButton;