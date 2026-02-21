import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  User,
  Building2,
  Calendar,
  MoreVertical,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmployeeDirectory = () => {
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  });

  useEffect(() => {
    fetchEmployees();
  }, [pagination.currentPage, searchTerm, departmentFilter, locationFilter, sortBy, sortOrder]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(departmentFilter && { department_id: departmentFilter }),
        ...(locationFilter && { location: locationFilter }),
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/v1/hr/directory?${params}`);
      const data = await response.json();

      if (data.success) {
        setEmployees(data.data.employees);
        setFilteredEmployees(data.data.employees);
        setDepartments(data.data.departments);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      // Fallback to mock data
      const mockEmployees = [];
      setEmployees(mockEmployees);
      setFilteredEmployees(mockEmployees);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const exportDirectory = () => {
    // In a real implementation, this would generate and download a file
    toast.success('Exporting employee directory...');
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Directory</h1>
          <p className="text-gray-600 mt-1">Search and browse employee contact information and details</p>
        </div>
        <button
          onClick={exportDirectory}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700"
        >
          <Download className="h-4 w-4" />
          <span>Export Directory</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search employees..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          >
            <option value="">All Locations</option>
            <option value="San Francisco">San Francisco, CA</option>
            <option value="New York">New York, NY</option>
            <option value="Austin">Austin, TX</option>
            <option value="Seattle">Seattle, WA</option>
            <option value="Chicago">Chicago, IL</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name">Sort by Name</option>
            <option value="department">Sort by Department</option>
            <option value="position">Sort by Position</option>
            <option value="hire_date">Sort by Hire Date</option>
          </select>
        </div>
      </div>

      {/* Directory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ClipboardList className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{pagination.totalItems}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Emails</p>
              <p className="text-2xl font-semibold text-gray-900">
                {employees.filter(emp => emp.User?.email).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Phone className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Phone Numbers</p>
              <p className="text-2xl font-semibold text-gray-900">
                {employees.filter(emp => emp.phone).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-semibold text-gray-900">
                {departments.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Directory */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">
            Employee Directory ({pagination.totalItems} employees)
          </h3>
        </div>

        {employees.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      <span>Employee</span>
                      {sortBy === 'name' && (
                        sortOrder === 'asc' ?
                          <ChevronUp className="h-4 w-4 ml-1" /> :
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('position')}
                  >
                    <div className="flex items-center">
                      <span>Position</span>
                      {sortBy === 'position' && (
                        sortOrder === 'asc' ?
                          <ChevronUp className="h-4 w-4 ml-1" /> :
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('department')}
                  >
                    <div className="flex items-center">
                      <span>Department</span>
                      {sortBy === 'department' && (
                        sortOrder === 'asc' ?
                          <ChevronUp className="h-4 w-4 ml-1" /> :
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('hire_date')}
                  >
                    <div className="flex items-center">
                      <span>Hire Date</span>
                      {sortBy === 'hire_date' && (
                        sortOrder === 'asc' ?
                          <ChevronUp className="h-4 w-4 ml-1" /> :
                          <ChevronDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {employee.User?.avatar ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={employee.User.avatar}
                              alt={`${employee.User.first_name} ${employee.User.last_name}`}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.User?.first_name} {employee.User?.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.employee_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.Department?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {employee.User?.email && (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-2 text-gray-400" />
                            <span className="truncate">{employee.User.email}</span>
                          </div>
                        )}
                        {employee.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-2 text-gray-400" />
                            <span>{employee.phone}</span>
                          </div>
                        )}
                        {employee.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                            <span className="truncate">{employee.location}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.itemsPerPage + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                      </span>{' '}
                      of <span className="font-medium">{pagination.totalItems}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.currentPage === i + 1
                              ? 'z-10 bg-primary-50 border-blue-500 text-primary'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDirectory;