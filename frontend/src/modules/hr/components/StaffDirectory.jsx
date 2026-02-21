import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Building2, 
  UserCheck, 
  UserX,
  Briefcase,
  Award,
  GraduationCap,
  Heart,
  Gift,
  Trophy,
  TreePine,
  Cake
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Label,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui';
import hrService from '@/services/hrService';
import taskService from '@/services/taskService';

const StaffDirectory = ({ onAssignTask }) => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeDetail, setShowEmployeeDetail] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    department_id: '',
    position: '',
    employment_status: '',
    sortBy: 'last_name',
    sortOrder: 'ASC'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [filters, pagination.currentPage]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [departmentsRes, positionsRes] = await Promise.all([
        hrService.getDepartments(),
        hrService.getPositions()
      ]);
      
      setDepartments(departmentsRes.data.departments || []);
      setPositions(positionsRes.data.positions || []);
    } catch (error) {
      console.error('Load initial data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      };

      const response = await hrService.getEmployees(params);
      
      if (response.success) {
        setEmployees(response.data.employees || []);
        setPagination({
          currentPage: response.data.pagination.currentPage,
          totalPages: response.data.pagination.totalPages,
          totalItems: response.data.pagination.totalItems,
          itemsPerPage: response.data.pagination.itemsPerPage
        });
      }
    } catch (error) {
      console.error('Load employees error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1
    }));
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetail(true);
  };

  const handleAssignTaskToEmployee = (employee) => {
    if (onAssignTask) {
      onAssignTask(employee);
    }
  };

  const getEmployeeName = (employee) => {
    const user = employee.User || {};
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown Employee';
  };

  const getEmployeeEmail = (employee) => {
    const user = employee.User || {};
    return user.email || 'No email';
  };

  const getEmployeePosition = (employee) => {
    return employee.position || 'Not specified';
  };

  const getEmployeeDepartment = (employee) => {
    const department = employee.Department || {};
    return department.name || 'No department';
  };

  const getEmployeeStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-red-100 text-red-800',
      on_leave: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'No phone';
    // Simple phone formatting
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  };

  const formatHireDate = (date) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTenure = (hireDate) => {
    if (!hireDate) return 'N/A';
    
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now - hire);
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffYears > 0) {
      return `${diffYears} year${diffYears > 1 ? 's' : ''}`;
    }
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Directory</h1>
          <p className="text-gray-600">Browse and manage all employees</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter and search employees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search employees..."
                className="pl-10"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <select 
  value={filters.department_id} 
  onChange={(e) => (e.target.value) => handleFilterChange('department_id', value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Departments</option>
</select>
            
            <select 
  value={filters.position} 
  onChange={(e) => (e.target.value) => handleFilterChange('position', value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Positions</option>
</select>
            
            <select 
  value={filters.employment_status} 
  onChange={(e) => (e.target.value) => handleFilterChange('employment_status', value)}
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
>
    <option value="">All Status</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
    <option value="on_leave">On Leave</option>
    <option value="terminated">Terminated</option>
</select>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employees</CardTitle>
          <CardDescription>All employees matching your filters</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No employees found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your filters or search terms.
              </p>
              <div className="mt-6">
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map(employee => (
                  <TableRow key={employee.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                          {getEmployeeName(employee).charAt(0)}
                        </div>
                        <div className="ml-3">
                          <div className="font-medium">{getEmployeeName(employee)}</div>
                          <div className="text-sm text-gray-500">{getEmployeeEmail(employee)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        {getEmployeeDepartment(employee)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                        {getEmployeePosition(employee)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {formatPhoneNumber(employee.phone)}
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {getEmployeeEmail(employee)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getEmployeeStatusColor(employee.employment_status)}>
                        {employee.employment_status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {calculateTenure(employee.hire_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Tooltip>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewEmployee(employee)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                        <Tooltip>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleAssignTaskToEmployee(employee)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {/* Pagination */}
          {employees.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-700">
                Showing {Math.min((pagination.currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} employees
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: Math.min(prev.totalPages, prev.currentPage + 1) }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Detail Dialog */}
      <Dialog open={showEmployeeDetail} onOpenChange={setShowEmployeeDetail}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Employee Details</DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-center space-x-6">
                <div className="h-20 w-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-medium">
                  {getEmployeeName(selectedEmployee).charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{getEmployeeName(selectedEmployee)}</h2>
                  <p className="text-gray-600">{getEmployeePosition(selectedEmployee)}</p>
                  <div className="flex items-center mt-1">
                    <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{getEmployeeDepartment(selectedEmployee)}</span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{getEmployeeEmail(selectedEmployee)}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <div className="flex items-center mt-1">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatPhoneNumber(selectedEmployee.phone)}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Address</Label>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{selectedEmployee.address || 'Not specified'}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Hire Date</Label>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{formatHireDate(selectedEmployee.hire_date)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Employee ID</Label>
                    <p className="mt-1 font-medium">{selectedEmployee.employee_id}</p>
                  </div>
                  <div>
                    <Label>Employment Status</Label>
                    <Badge className={`mt-1 ${getEmployeeStatusColor(selectedEmployee.employment_status)}`}>
                      {selectedEmployee.employment_status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div>
                    <Label>Tenure</Label>
                    <p className="mt-1 font-medium">{calculateTenure(selectedEmployee.hire_date)}</p>
                  </div>
                  <div>
                    <Label>Employment Type</Label>
                    <p className="mt-1 font-medium">{selectedEmployee.employment_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>Work Location</Label>
                    <p className="mt-1 font-medium">{selectedEmployee.work_location || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label>Salary</Label>
                    <p className="mt-1 font-medium">${selectedEmployee.salary?.toLocaleString() || 'Not specified'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setShowEmployeeDetail(false)}>
                  Close
                </Button>
                <Button onClick={() => handleAssignTaskToEmployee(selectedEmployee)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign Task
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StaffDirectory;