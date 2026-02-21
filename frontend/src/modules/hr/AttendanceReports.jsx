import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock,
  BarChart3,
  Download,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react'
import { hrService } from '@/services/hrService'
import { toast } from 'react-hot-toast';

const AttendanceReports = () => {
  const [filters, setFilters] = useState({
    date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    date_to: new Date().toISOString().split('T')[0],
    department_id: '',
    employee_id: '',
    status: ''
  })
  const [activeTab, setActiveTab] = useState('overview')

  // Fetch attendance data
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery(
    ['attendance-reports', filters],
    () => hrService.getAttendance(filters),
    {
      select: (response) => {
        return response?.data?.data?.attendance || response?.data?.attendance || []
      },
      onError: (error) => {
        console.error('Attendance reports API error:', error)
      }
    }
  )

  // Fetch departments for filter
  const { data: departments } = useQuery(
    'hr-departments-filter',
    () => hrService.getDepartments(),
    {
      select: (response) => response?.data?.data?.departments || [],
      onError: (error) => console.error('Departments API error:', error)
    }
  )

  // Fetch employees for filter
  const { data: employees } = useQuery(
    'hr-employees-filter',
    () => hrService.getEmployees({ limit: 1000 }),
    {
      select: (response) => response?.data?.data?.employees || [],
      onError: (error) => console.error('Employees API error:', error)
    }
  )

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!attendanceData || attendanceData.length === 0) {
      return {
        totalRecords: 0,
        presentDays: 0,
        lateDays: 0,
        absentDays: 0,
        totalHours: '0.0',
        averageHours: '0.0'
      }
    }

    const totalRecords = attendanceData.length
    const presentDays = attendanceData.filter(a => a.status === 'present').length || 0
    const lateDays = attendanceData.filter(a => a.status === 'late').length || 0
    const absentDays = attendanceData.filter(a => a.status === 'absent').length || 0
    const totalHours = attendanceData.reduce((sum, a) => sum + parseFloat(a.total_hours || 0), 0) || 0
    const averageHours = totalRecords > 0 ? totalHours / totalRecords : 0

    return {
      totalRecords,
      presentDays,
      lateDays,
      absentDays,
      totalHours: totalHours.toFixed(1),
      averageHours: averageHours.toFixed(1)
    }
  }, [attendanceData])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4" />
      case 'late': return <Timer className="h-4 w-4" />
      case 'absent': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const exportData = () => {
    if (!attendanceData || attendanceData.length === 0) {
      toast('No data to export')
      return
    }

    const csvContent = [
      ['Date', 'Employee', 'Department', 'Check In', 'Check Out', 'Total Hours', 'Status'].join(','),
      ...attendanceData.map(record => [
        record.date,
        record.Employee?.User ? `${record.Employee.User.first_name} ${record.Employee.User.last_name}` : 'Unknown',
        record.Employee?.Department?.name || 'Unknown',
        record.check_in_time || '',
        record.check_out_time || '',
        record.total_hours || '0',
        record.status
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance-report-${filters.date_from}-to-${filters.date_to}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600">Monitor and analyze employee attendance patterns</p>
        </div>
        {/* {JSON.stringify(attendanceData)} */}
        <button
          onClick={exportData}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filters.department_id}
              onChange={(e) => handleFilterChange('department_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments?.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              value={filters.employee_id}
              onChange={(e) => handleFilterChange('employee_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Employees</option>
              {employees?.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.User?.first_name} {emp.User?.last_name} ({emp.employee_id})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="late">Late</option>
              <option value="absent">Absent</option>
              <option value="half_day">Half Day</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalRecords}</div>
              <div className="text-sm text-gray-500">Total Records</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.presentDays}</div>
              <div className="text-sm text-gray-500">Present Days</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Timer className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.lateDays}</div>
              <div className="text-sm text-gray-500">Late Days</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.absentDays}</div>
              <div className="text-sm text-gray-500">Absent Days</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.totalHours}h</div>
              <div className="text-sm text-gray-500">Total Hours</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <div className="text-2xl font-bold text-gray-900">{stats.averageHours}h</div>
              <div className="text-sm text-gray-500">Avg Hours/Day</div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Records Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
        </div>
        <div className="overflow-x-auto">
          {attendanceLoading ? (
            <div className="px-6 py-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading attendance data...</p>
            </div>
          ) : attendanceData && attendanceData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.Employee?.User ? 
                          `${record.Employee.User.first_name} ${record.Employee.User.last_name}` : 
                          'Unknown'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.Employee?.employee_id || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.Employee?.Department?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.check_in_time || '--:--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.check_out_time || '--:--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.total_hours || '0.00'}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getStatusColor(record.status)
                      }`}>
                        {getStatusIcon(record.status)}
                        <span className="ml-1">{record.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendanceReports