import React, { useState, useEffect } from 'react'
import { Eye, Search, Filter, Download, Calendar } from 'lucide-react'
import { adminService } from '@/services/adminService'

const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [filters, setFilters] = useState({
    user_id: '',
    action: '',
    resource_type: '',
    module: ''
  })

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const response = await adminService.getAuditLogs()
      setAuditLogs(response?.data?.data.auditLogs || [])
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportLogs = () => {
    // In a real implementation, you would export the logs
    console.log('Exporting audit logs...')
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.User?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.User?.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.User?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilters = 
      (!filters.user_id || log.user_id.toString() === filters.user_id) &&
      (!filters.action || log.action === filters.action) &&
      (!filters.resource_type || log.resource_type === filters.resource_type) &&
      (!filters.module || log.module === filters.module)
    
    return matchesSearch && matchesFilters
  })

  const getActionIcon = (action) => {
    switch (action) {
      case 'create': return '➕'
      case 'update': return '✏️'
      case 'delete': return '🗑️'
      case 'login': return '🔑'
      case 'logout': return '🚪'
      default: return '📝'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600">View system activity and user actions</p>
        </div>
        <button
          onClick={handleExportLogs}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Action</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
            >
              <option value="">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Resource Type</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.resource_type}
              onChange={(e) => setFilters({...filters, resource_type: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="user">User</option>
              <option value="project">Project</option>
              <option value="task">Task</option>
              <option value="employee">Employee</option>
              <option value="asset">Asset</option>
              <option value="document">Document</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Module</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={filters.module}
              onChange={(e) => setFilters({...filters, module: e.target.value})}
            >
              <option value="">All Modules</option>
              <option value="projects">Projects</option>
              <option value="hr">HR</option>
              <option value="finance">Finance</option>
              <option value="inventory">Inventory</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilters({ user_id: '', action: '', resource_type: '', module: '' })
                setDateRange({ from: '', to: '' })
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Module
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-800 text-sm font-medium">
                            {log.User?.first_name?.charAt(0)}{log.User?.last_name?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {log.User ? `${log.User.first_name} ${log.User.last_name}` : 'System'}
                          </div>
                          <div className="text-sm text-gray-500">{log.User?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getActionIcon(log.action)}</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.resource_type}</div>
                      {log.resource_id && (
                        <div className="text-sm text-gray-500">ID: {log.resource_id}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md truncate" title={log.description}>
                        {log.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditLogs