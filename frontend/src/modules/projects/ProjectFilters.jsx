import React, { useState } from 'react'
import { 
  Filter, 
  X, 
  Calendar, 
  Banknote, 
  Users, 
  Search,
  SlidersHorizontal,
  Download,
  RefreshCw
} from 'lucide-react'
// Removed custom Select imports - using native HTML select
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const ProjectFilters = ({ 
  filters, 
  onFiltersChange, 
  onExport, 
  onRefresh,
  employees = [],
  departments = []
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ]

  const managerOptions = employees.map(emp => ({
    value: emp.id,
    label: `${emp.first_name} ${emp.last_name}`
  }))

  const departmentOptions = departments.map(dept => ({
    value: dept.id,
    label: dept.name
  }))

  const budgetRangeOptions = [
    { value: '0-10000', label: '₦0 - ₦10,000' },
    { value: '10000-50000', label: '₦10,000 - ₦50,000' },
    { value: '50000-100000', label: '₦50,000 - ₦100,000' },
    { value: '100000-500000', label: '₦100,000 - ₦500,000' },
    { value: '500000+', label: '₦500,000+' }
  ]

  const progressRangeOptions = [
    { value: '0-25', label: '0% - 25%' },
    { value: '25-50', label: '25% - 50%' },
    { value: '50-75', label: '50% - 75%' },
    { value: '75-100', label: '75% - 100%' }
  ]

  const sortOptions = [
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'created_at_desc', label: 'Newest First' },
    { value: 'created_at_asc', label: 'Oldest First' },
    { value: 'start_date_desc', label: 'Start Date (Latest)' },
    { value: 'start_date_asc', label: 'Start Date (Earliest)' },
    { value: 'end_date_desc', label: 'End Date (Latest)' },
    { value: 'end_date_asc', label: 'End Date (Earliest)' },
    { value: 'budget_desc', label: 'Budget (High to Low)' },
    { value: 'budget_asc', label: 'Budget (Low to High)' },
    { value: 'progress_desc', label: 'Progress (High to Low)' },
    { value: 'progress_asc', label: 'Progress (Low to High)' }
  ]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      status: [],
      priority: [],
      manager_id: [],
      department_id: [],
      budget_range: '',
      progress_range: '',
      start_date_from: '',
      start_date_to: '',
      end_date_from: '',
      end_date_to: '',
      is_billable: '',
      sort: 'created_at_desc'
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return Object.entries(localFilters).some(([key, value]) => {
      if (key === 'sort') return false
      if (Array.isArray(value)) return value.length > 0
      return value !== '' && value !== null && value !== undefined
    })
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Basic Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search projects by name, code, or description..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={localFilters.status?.[0] || ''}
              onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : [])}
              className="w-40 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <select
              value={localFilters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide' : 'More'} Filters
              {hasActiveFilters() && (
                <span className="ml-2 bg-primary-100 text-primary-800 text-xs px-2 py-0.5 rounded-full">
                  {Object.entries(localFilters).filter(([key, value]) => {
                    if (key === 'sort') return false
                    if (Array.isArray(value)) return value.length > 0
                    return value !== '' && value !== null && value !== undefined
                  }).length}
                </span>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={onRefresh}
              size="icon"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              onClick={onExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Status Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                multiple
                value={localFilters.status || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  handleFilterChange('status', values)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                size="4"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Priority Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                multiple
                value={localFilters.priority || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  handleFilterChange('priority', values)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                size="4"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Manager Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Manager
              </label>
              <select
                multiple
                value={localFilters.manager_id || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  handleFilterChange('manager_id', values)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                size="4"
              >
                {managerOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Department Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                multiple
                value={localFilters.department_id || []}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value)
                  handleFilterChange('department_id', values)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                size="4"
              >
                {departmentOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <select
                value={localFilters.budget_range || ''}
                onChange={(e) => handleFilterChange('budget_range', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any Budget</option>
                {budgetRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Progress Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Range
              </label>
              <select
                value={localFilters.progress_range || ''}
                onChange={(e) => handleFilterChange('progress_range', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Any Progress</option>
                {progressRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Billable Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Type
              </label>
              <select
                value={localFilters.is_billable || ''}
                onChange={(e) => handleFilterChange('is_billable', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Projects</option>
                <option value="true">Billable Only</option>
                <option value="false">Non-Billable Only</option>
              </select>
            </div>
          </div>

          {/* Date Range Filters */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Date Ranges</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date From
                </label>
                <Input
                  type="date"
                  value={localFilters.start_date_from || ''}
                  onChange={(e) => handleFilterChange('start_date_from', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date To
                </label>
                <Input
                  type="date"
                  value={localFilters.start_date_to || ''}
                  onChange={(e) => handleFilterChange('start_date_to', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date From
                </label>
                <Input
                  type="date"
                  value={localFilters.end_date_from || ''}
                  onChange={(e) => handleFilterChange('end_date_from', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date To
                </label>
                <Input
                  type="date"
                  value={localFilters.end_date_to || ''}
                  onChange={(e) => handleFilterChange('end_date_to', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Filter Actions */}
          {hasActiveFilters() && (
            <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {Object.entries(localFilters).filter(([key, value]) => {
                  if (key === 'sort') return false
                  if (Array.isArray(value)) return value.length > 0
                  return value !== '' && value !== null && value !== undefined
                }).length} filter(s) applied
              </div>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                size="sm"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ProjectFilters