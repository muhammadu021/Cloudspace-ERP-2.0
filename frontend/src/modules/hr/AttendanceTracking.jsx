import React from 'react'
import { 
  Clock, 
  Users, 
  TrendingUp, 
  BarChart3,
  ArrowRight,
  Info
} from 'lucide-react'
import { Link } from 'react-router-dom'

const AttendanceTracking = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600">Manage employee attendance and view reports</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-primary mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Attendance System Reorganized</h3>
            <p className="text-sm text-primary-700 mt-1">
              Employee clock in/out functionality has been moved to the Self-Service portal for better user experience. 
              HR managers can view attendance reports and analytics here.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link 
          to="/hr/attendance-reports"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 p-3 rounded-md">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Attendance Reports</h3>
                <p className="text-sm text-gray-500">View detailed attendance analytics</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>

        <Link 
          to="/self-service/time-tracking"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow cursor-pointer block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 p-3 rounded-md">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Employee Time Tracking</h3>
                <p className="text-sm text-gray-500">Clock in/out portal for employees</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 p-3 rounded-md">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
              <p className="text-sm text-gray-500">Coming soon - Advanced analytics</p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Attendance Management Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">For Employees (Self-Service)</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Clock in/out with location tracking</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">View personal attendance history</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Real-time working hours tracking</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Mobile-friendly interface</p>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">For HR/Managers</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Comprehensive attendance reports</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Filter by department, employee, date range</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Export attendance data to CSV</p>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 text-sm text-gray-700">Real-time attendance statistics</p>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Quick Stats Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            to="/hr/attendance-reports"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-primary-50 transition-colors"
          >
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">View Reports</div>
              <div className="text-xs text-gray-500">Detailed analytics</div>
            </div>
          </Link>
          
          <Link 
            to="/self-service/time-tracking"
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900">Employee Portal</div>
              <div className="text-xs text-gray-500">Clock in/out</div>
            </div>
          </Link>
          
          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-center">
              <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-500">Team Analytics</div>
              <div className="text-xs text-gray-400">Coming soon</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceTracking