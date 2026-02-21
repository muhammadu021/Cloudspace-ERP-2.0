import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  Building2, 
  DollarSign,
  ChevronRight,
  ChevronDown,
  Filter,
  MoreVertical,
  Eye
} from 'lucide-react';
import { departmentService } from '../../services/departmentService';
import employeeService from '../../services/employeeService';
import { toast } from 'react-hot-toast';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'hierarchy'
  const [expandedDepartments, setExpandedDepartments] = useState(new Set());
  const [filterActive, setFilterActive] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parent_department_id: '',
    head_employee_id: '',
    budget_allocated: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentService.getDepartments({
        is_active: filterActive
      });
      const departments = response.data.data?.departments || response.data.departments || [];
      setDepartments(departments);
    } catch (error) {
      console.error('DepartmentManager: Error fetching departments:', error);
      // Set empty array on error so user can see the "no departments" message
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // console.log('DepartmentManager: Fetching employees');
      const response = await employeeService.getEmployees();
      // console.log('DepartmentManager: Employee API response:', response);
      const employees = response.data.data?.employees || response.data.employees || [];
      // console.log('DepartmentManager: Extracted employees:', employees);
      setEmployees(employees);
    } catch (error) {
      console.error('DepartmentManager: Error fetching employees:', error);
      // Set empty array on error
      setEmployees([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editingDepartment) {
        await departmentService.updateDepartment(editingDepartment.id, formData);
      } else {
        await departmentService.createDepartment(formData);
      }
      
      setShowForm(false);
      setEditingDepartment(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        parent_department_id: '',
        head_employee_id: '',
        budget_allocated: ''
      });
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name || '',
      code: department.code || '',
      description: department.description || '',
      parent_department_id: department.parent_department_id || '',
      head_employee_id: department.head_employee_id || '',
      budget_allocated: department.budget_allocated || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (department) => {
    if (window.confirm(`Are you sure you want to delete the department "${department.name}"?`)) {
      try {
        await departmentService.deleteDepartment(department.id);
        fetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
        toast.error('Failed to delete department. It may have employees or child departments.');
      }
    }
  };

  const toggleExpanded = (departmentId) => {
    const newExpanded = new Set(expandedDepartments);
    if (newExpanded.has(departmentId)) {
      newExpanded.delete(departmentId);
    } else {
      newExpanded.add(departmentId);
    }
    setExpandedDepartments(newExpanded);
  };

  const filteredDepartments = departments.filter(dept =>
    dept.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      // Handle both direct name fields and User association
      if (employee.User) {
        return `${employee.User.first_name} ${employee.User.last_name}`;
      } else if (employee.first_name && employee.last_name) {
        return `${employee.first_name} ${employee.last_name}`;
      }
    }
    return 'Not assigned';
  };
  
  const getDepartmentHeadName = (headEmployee) => {
    if (!headEmployee) return 'Not assigned';
    
    // Handle the new structure with User association
    if (headEmployee.User) {
      return `${headEmployee.User.first_name} ${headEmployee.User.last_name}`;
    }
    
    // Fallback for old structure
    if (headEmployee.first_name && headEmployee.last_name) {
      return `${headEmployee.first_name} ${headEmployee.last_name}`;
    }
    
    return 'Not assigned';
  };

  const getParentDepartmentName = (parentId) => {
    const parent = departments.find(dept => dept.id === parentId);
    return parent ? parent.name : 'None';
  };

  const buildHierarchy = (depts, parentId = null) => {
    return depts
      .filter(dept => dept.parent_department_id === parentId)
      .map(dept => ({
        ...dept,
        children: buildHierarchy(depts, dept.id)
      }));
  };

  const renderDepartmentRow = (department, level = 0) => {
    const hasChildren = departments.some(d => d.parent_department_id === department.id);
    const isExpanded = expandedDepartments.has(department.id);

    return (
      <React.Fragment key={department.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center" style={{ paddingLeft: `${level * 20}px` }}>
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(department.id)}
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              )}
              <div className="flex items-center">
                <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{department.name}</div>
                  <div className="text-sm text-gray-500">{department.code}</div>
                </div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {department.description || 'No description'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {getDepartmentHeadName(department.HeadEmployee)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {getParentDepartmentName(department.parent_department_id)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            ${(department.budget_allocated || 0).toLocaleString()}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              department.is_active 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {department.is_active ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleEdit(department)}
                className="text-indigo-600 hover:text-indigo-900"
                title="Edit Department"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(department)}
                className="text-red-600 hover:text-red-900"
                title="Delete Department"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </td>
        </tr>
        {hasChildren && isExpanded && 
          departments
            .filter(d => d.parent_department_id === department.id)
            .map(child => renderDepartmentRow(child, level + 1))
        }
      </React.Fragment>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Manager</h1>
          <p className="text-gray-600">Manage organizational departments and hierarchy</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingDepartment(null);
            setFormData({
              name: '',
              code: '',
              description: '',
              parent_department_id: '',
              head_employee_id: '',
              budget_allocated: ''
            });
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Department</span>
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterActive}
              onChange={(e) => setFilterActive(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'list' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('hierarchy')}
                className={`px-3 py-2 text-sm ${
                  viewMode === 'hierarchy' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Hierarchy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Department Table */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Head
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {viewMode === 'hierarchy' 
              ? buildHierarchy(filteredDepartments).map(dept => renderDepartmentRow(dept))
              : filteredDepartments.map(dept => renderDepartmentRow(dept))
            }
          </tbody>
        </table>
        
        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new department.'}
            </p>
          </div>
        )}
      </div>

      {/* Department Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingDepartment ? 'Edit Department' : 'Add New Department'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Parent Department
                  </label>
                  <select
                    value={formData.parent_department_id}
                    onChange={(e) => setFormData({ ...formData, parent_department_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">None (Top Level)</option>
                    {departments
                      .filter(dept => dept.id !== editingDepartment?.id)
                      .map(dept => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head
                  </label>
                  <select
                    value={formData.head_employee_id}
                    onChange={(e) => setFormData({ ...formData, head_employee_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => {
                      const name = emp.User 
                        ? `${emp.User.first_name} ${emp.User.last_name}` 
                        : (emp.first_name && emp.last_name 
                          ? `${emp.first_name} ${emp.last_name}` 
                          : `Employee ${emp.id}`);
                      return (
                        <option key={emp.id} value={emp.id}>
                          {name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Allocated
                  </label>
                  <input
                    type="number"
                    value={formData.budget_allocated}
                    onChange={(e) => setFormData({ ...formData, budget_allocated: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingDepartment(null);
                      setErrors({});
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                  >
                    {editingDepartment ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;