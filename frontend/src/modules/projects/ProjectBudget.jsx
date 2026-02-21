import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  ArrowLeft, 
  Plus, 
  Banknote,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Edit,
  Trash2,
  Download
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import { useAuth } from '@/contexts/AuthContext'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'

const ProjectBudget = () => {
  const { id } = useParams()
  // Permission checks removed
  const queryClient = useQueryClient()

  const { data: project } = useQuery(
    ['project', id],
    () => projectService.getProjectById(id),
    {
      select: (response) => response?.data?.data?.project,
      enabled: !!id
    }
  )

  const { data: budget, isLoading } = useQuery(
    ['project-budget', id],
    () => projectService.getProjectBudget(id),
    {
      select: (response) => response?.data || {},
      enabled: !!id
    }
  )

  const budgetEntries = budget?.entries || []
  const budgetAllocated = parseFloat(project?.budget_allocated || 0)
  const budgetSpent = parseFloat(project?.budget_spent || 0)
  const budgetRemaining = budgetAllocated - budgetSpent
  const budgetUtilization = budgetAllocated > 0 ? (budgetSpent / budgetAllocated) * 100 : 0

  const deleteBudgetEntryMutation = useMutation(
    (entryId) => projectService.deleteBudgetEntry(id, entryId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['project-budget', id])
      }
    }
  )

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Are you sure you want to delete this budget entry?')) {
      deleteBudgetEntryMutation.mutate(entryId)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      'labor': 'bg-blue-100 text-blue-800',
      'materials': 'bg-green-100 text-green-800',
      'equipment': 'bg-purple-100 text-purple-800',
      'software': 'bg-indigo-100 text-indigo-800',
      'travel': 'bg-yellow-100 text-yellow-800',
      'other': 'bg-gray-100 text-gray-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getBudgetStatus = () => {
    if (budgetUtilization > 100) return { color: 'text-red-600', status: 'Over Budget' }
    if (budgetUtilization > 90) return { color: 'text-yellow-600', status: 'Near Limit' }
    if (budgetUtilization > 75) return { color: 'text-orange-600', status: 'High Usage' }
    return { color: 'text-green-600', status: 'On Track' }
  }

  const budgetStatus = getBudgetStatus()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={`/projects/${id}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Project
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
            <p className="text-gray-600">{project?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Allocated</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetAllocated)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Banknote className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetSpent)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetRemaining)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Utilization</p>
              <p className={`text-2xl font-bold ${budgetStatus.color}`}>
                {budgetUtilization.toFixed(1)}%
              </p>
              <p className={`text-sm ${budgetStatus.color}`}>
                {budgetStatus.status}
              </p>
            </div>
            <div className={`p-3 rounded-full ${budgetUtilization > 90 ? 'bg-red-100' : 'bg-yellow-100'}`}>
              <AlertTriangle className={`h-6 w-6 ${budgetUtilization > 90 ? 'text-red-600' : 'text-yellow-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Progress */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Progress</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {formatCurrency(budgetSpent)} of {formatCurrency(budgetAllocated)} used
            </span>
            <span className={budgetStatus.color}>
              {budgetUtilization.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                budgetUtilization > 100 ? 'bg-red-600' :
                budgetUtilization > 90 ? 'bg-yellow-600' :
                'bg-green-600'
              }`}
              style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
            ></div>
          </div>
          {budgetUtilization > 100 && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Budget exceeded by {formatCurrency(budgetSpent - budgetAllocated)}
            </p>
          )}
        </div>
      </div>

      {/* Budget Entries */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Budget Entries</h3>
        </div>
        
        {budgetEntries.length === 0 ? (
          <div className="text-center py-12">
            <Banknote className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No budget entries</h3>
            <p className="text-gray-600 mb-4">Start tracking expenses by adding budget entries.</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Entry
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {budgetEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {entry.description}
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-gray-500">{entry.notes}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(entry.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                        entry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteEntry(entry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectBudget