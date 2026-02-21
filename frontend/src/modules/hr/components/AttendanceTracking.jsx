import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Calendar, 
  Users, 
  Search, 
  Filter, 
  Download,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  X,
  MapPin,
  Timer
} from 'lucide-react';

const AttendanceTracking = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [attendanceStats, setAttendanceStats] = useState({
    totalRecords: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0
  });

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
    calculateStats();
  }, [currentPage, searchTerm, selectedEmployee, selectedStatus, dateFrom, dateTo]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedEmployee && { employee_id: selectedEmployee }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      });

      const response = await fetch(`/api/v1/hr/attendance?${params}`);
      const data = await response.json();

      if (data.success) {
        setAttendance(data.data.attendance);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        setError('Failed to fetch attendance records');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/v1/hr/employees?limit=1000');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data.employees);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const calculateStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/v1/hr/attendance?date_from=${today}&date_to=${today}&limit=1000`);
      const data = await response.json();

      if (data.success) {
        const todayAttendance = data.data.attendance;
        const presentToday = todayAttendance.filter(att => att.status === 'present').length;
        const absentToday = todayAttendance.filter(att => att.status === 'absent').length;
        const lateToday = todayAttendance.filter(att => {
          if (!att.check_in_time) return false;
          const checkInTime = new Date(`2000-01-01T${att.check_in_time}`);
          const nineAM = new Date('2000-01-01T09:00:00');
          return checkInTime > nineAM;
        }).length;

        setAttendanceStats({
          totalRecords: todayAttendance.length,
          presentToday,
          absentToday,
          lateToday
        });
      }
    } catch (error) {
      console.error('Error calculating stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      absent: { color: 'bg-red-100 text-red-800', icon: UserX },
      late: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      on_leave: { color: 'bg-blue-100 text-blue-800', icon: Calendar }
    };

    const config = statusConfig[status] || statusConfig.present;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A';
    
    const checkInTime = new Date(`2000-01-01T${checkIn}`);
    const checkOutTime = new Date(`2000-01-01T${checkOut}`);
    const diffMs = checkOutTime - checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return `${diffHours.toFixed(2)} hrs`;
  };

  const exportAttendance = async () => {
    try {
      const params = new URLSearchParams({
        ...(selectedEmployee && { employee_id: selectedEmployee }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo }),
        limit: 10000 // Get all records for export
      });

      const response = await fetch(`/api/v1/hr/attendance?${params}`);
      const data = await response.json();

      if (data.success) {
        // Convert to CSV
        const csvContent = [
          ['Date', 'Employee', 'Check In', 'Check Out', 'Total Hours', 'Status', 'Location'].join(','),
          ...data.data.attendance.map(att => [
            att.date,
            `"${att.Employee?.User?.first_name} ${att.Employee?.User?.last_name}"`,
            formatTime(att.check_in_time),
            formatTime(att.check_out_time),
            calculateWorkingHours(att.check_in_time, att.check_out_time),
            att.status,
            att.location || 'N/A'
          ].join(','))
        ].join('\n');

        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
      setError('Failed to export attendance data');
    }
  };

  if (loading && attendance.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-gray-600">Loading attendance...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Tracking</h1>
          <p className="text-gray-600 mt-1">Monitor and manage employee attendance records</p>
        </div>
        <button
          onClick={exportAttendance}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Present Today</p>
              <p className="text-3xl font-bold text-green-600">{attendanceStats.presentToday}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Absent Today</p>
              <p className="text-3xl font-bold text-red-600">{attendanceStats.absentToday}</p>
            </div>
            <UserX className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Late Today</p>
              <p className="text-3xl font-bold text-yellow-600">{attendanceStats.lateToday}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Records</p>
              <p className="text-3xl font-bold text-primary">{attendanceStats.totalRecords}</p>
            </div>
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.User?.first_name} {emp.User?.last_name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="late">Late</option>
            <option value="on_leave">On Leave</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="From Date"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="To Date"
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedEmployee('');
              setSelectedStatus('');
              setDateFrom('');
              setDateTo('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Working Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {record.Employee?.User?.first_name} {record.Employee?.User?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {record.Employee?.employee_id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-green-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatTime(record.check_in_time)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-red-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {formatTime(record.check_out_time)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Timer className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {calculateWorkingHours(record.check_in_time, record.check_out_time)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">
                        {record.location || 'N/A'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {!loading && attendance.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedEmployee || selectedStatus || dateFrom || dateTo
                ? 'Try adjusting your filters to see more results.'
                : 'Attendance records will appear here once employees start checking in.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceTracking;