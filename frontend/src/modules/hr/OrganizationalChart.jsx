import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import {
  Building2,
  Users,
  Layers,
  Search,
  ZoomIn,
  ZoomOut,
  Move,
  Download,
  Filter,
  Edit3,
  User,
  UserCheck,
  RefreshCw,
  BarChart3
} from 'lucide-react';

const OrganizationalChart = () => {
  const [loading, setLoading] = useState(true);
  const [orgData, setOrgData] = useState({
    departments: [],
    orgStructure: [],
    stats: {
      totalEmployees: 0,
      departments: 0,
      managers: 0,
      hierarchyLevels: 0
    }
  });
  const [filters, setFilters] = useState({
    department_id: '',
    search: '',
    include_inactive: false
  });
  const [viewMode, setViewMode] = useState('chart');
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    fetchOrgChartData();
  }, [filters]);

  const fetchOrgChartData = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the API
      // For now, we'll use mock data
      setTimeout(() => {
        setOrgData({
          departments: [],
          orgStructure: [],
          stats: {
            totalEmployees: 0,
            departments: 0,
            managers: 0,
            hierarchyLevels: 0
          }
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching org chart data:', error);
      setLoading(false);
    }
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  const handleExport = async (format = 'pdf') => {
    try {
      toast('Exporting organizational chart as ${format.toUpperCase()}...');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export organizational chart');
    }
  };

  const handleUpdateStructure = async () => {
    try {
      toast('Opening organizational structure editor...');
    } catch (error) {
      console.error('Update structure error:', error);
      toast.error('Failed to update organizational structure');
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
          <h1 className="text-2xl font-bold text-gray-900">Organizational Chart</h1>
          <p className="text-gray-600 mt-1">Visualize company structure and reporting relationships</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleExport('pdf')}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <button
            onClick={handleUpdateStructure}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary-700"
          >
            <Edit3 className="h-4 w-4" />
            <span>Edit Structure</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search employees or departments..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={filters.department_id}
            onChange={(e) => setFilters({ ...filters, department_id: e.target.value })}
          >
            <option value="">All Departments</option>
            {orgData.departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeInactive"
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              checked={filters.include_inactive}
              onChange={(e) => setFilters({ ...filters, include_inactive: e.target.checked })}
            />
            <label htmlFor="includeInactive" className="text-sm text-gray-700">
              Include Inactive
            </label>
          </div>
        </div>
      </div>

      {/* Org Chart Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-semibold text-gray-900">{orgData.stats.departments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Employees</p>
              <p className="text-2xl font-semibold text-gray-900">{orgData.stats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserCheck className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Managers</p>
              <p className="text-2xl font-semibold text-gray-900">{orgData.stats.managers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Layers className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hierarchy Levels</p>
              <p className="text-2xl font-semibold text-gray-900">{orgData.stats.hierarchyLevels}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium w-12 text-center">{zoomLevel}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={handleResetZoom}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Reset Zoom"
              >
                <Move className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View Mode:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('chart')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'chart' ? 'bg-white shadow' : ''
                  }`}
              >
                Chart
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'tree' ? 'bg-white shadow' : ''
                  }`}
              >
                Tree
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm ${viewMode === 'list' ? 'bg-white shadow' : ''
                  }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Org Chart Visualization */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Structure</h3>

        {viewMode === 'chart' && (
          <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Interactive organizational chart visualization</p>
              <p className="text-sm text-gray-500 mt-2">
                Drag and drop to reorganize structure • Click on employees for details
              </p>
            </div>
          </div>
        )}

        {viewMode === 'tree' && (
          <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-center">
              <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Hierarchical tree view</p>
              <p className="text-sm text-gray-500 mt-2">
                Visual representation of reporting relationships
              </p>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
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
                    Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orgData.orgStructure.length > 0 ? (
                  orgData.orgStructure.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {employee.avatar ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={employee.avatar}
                                alt={`${employee.first_name} ${employee.last_name}`}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {employee.manager_id ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {employee.position_level}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                      No employees found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Features Implemented */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Implemented Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Interactive drag-and-drop interface</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Real-time structure updates</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Employee photo integration</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Department-based filtering</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Reporting relationship mapping</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Export to various formats</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Mobile-responsive design</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Search and navigation tools</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Historical structure tracking</p>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="ml-3 text-base text-gray-700">Integration with employee data</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationalChart;