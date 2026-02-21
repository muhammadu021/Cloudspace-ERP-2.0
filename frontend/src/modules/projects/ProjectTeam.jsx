import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { 
  ArrowLeft, 
  Plus, 
  Users,
  Mail,
  Calendar,
  Clock,
  UserMinus,
  Edit,
  X
} from 'lucide-react'
import { projectService } from '@/services/projectService'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/utils/formatters'

const ProjectTeam = () => {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const isGlobalView = !id
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState({
    employee_id: '',
    role: 'developer',
    allocation_percentage: 100,
    hourly_rate: '',
    start_date: '',
    end_date: ''
  })

  const { data: project } = useQuery(
    ['project', id],
    () => projectService.getProjectById(id),
    { select: (r) => r?.data?.data?.project, enabled: !!id }
  )

  const { data: assignments = [], isLoading, error, refetch } = useQuery(
    isGlobalView ? 'all-employees' : ['project-assignments', id],
    () => projectService.getEmployees(),
    {
      select: (r) => {
        if (!r?.data) return []
        return r.data.data?.employees || r.data.employees || []
      },
      enabled: isGlobalView
    }
  )

  const { data: projectAssignments = [], isLoading: loadingAssignments, error: assignmentError } = useQuery(
    ['project-assignments', id],
    () => projectService.getProjectAssignments(id),
    {
      select: (r) => r?.data?.data?.assignments || r?.data?.assignments || [],
      enabled: !isGlobalView && !!id,
      retry: 1
    }
  )

  const teamData = isGlobalView ? assignments : projectAssignments
  const teamLoading = isGlobalView ? isLoading : loadingAssignments
  const teamError = isGlobalView ? error : assignmentError

  const { data: employees = [] } = useQuery(
    'employees-list',
    () => projectService.getEmployees(),
    { select: (r) => r?.data?.data?.employees || r?.data?.employees || [] }
  )

  const addMemberMutation = useMutation(
    (data) => projectService.assignEmployee(id, data),
    { onSuccess: () => { queryClient.invalidateQueries(['project-assignments', id]); setShowAddDialog(false); resetForm() } }
  )

  const updateMemberMutation = useMutation(
    ({ memberId, data }) => projectService.updateAssignment(id, memberId, data),
    { onSuccess: () => { queryClient.invalidateQueries(['project-assignments', id]); setEditingMember(null); resetForm() } }
  )

  const removeMemberMutation = useMutation(
    (employeeId) => projectService.removeEmployee(id, employeeId),
    { onSuccess: () => queryClient.invalidateQueries(['project-assignments', id]) }
  )

  const resetForm = () => {
    setFormData({ employee_id: '', role: 'developer', allocation_percentage: 100, hourly_rate: '', start_date: '', end_date: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingMember) {
      updateMemberMutation.mutate({ memberId: editingMember.employee_id, data: formData })
    } else {
      addMemberMutation.mutate(formData)
    }
  }

  const handleEdit = (member) => {
    setEditingMember(member)
    setFormData({
      employee_id: member.employee_id || member.id,
      role: member.role || 'developer',
      allocation_percentage: member.allocation_percentage || 100,
      hourly_rate: member.hourly_rate || '',
      start_date: member.start_date?.split('T')[0] || '',
      end_date: member.end_date?.split('T')[0] || ''
    })
    setShowAddDialog(true)
  }

  const handleRemove = (employeeId) => {
    if (window.confirm('Remove this team member?')) {
      removeMemberMutation.mutate(employeeId)
    }
  }

  const getRoleColor = (role) => ({
    'project_manager': 'bg-purple-100 text-purple-800',
    'lead_developer': 'bg-blue-100 text-blue-800',
    'developer': 'bg-green-100 text-green-800',
    'designer': 'bg-pink-100 text-pink-800',
    'qa_tester': 'bg-yellow-100 text-yellow-800'
  }[role] || 'bg-gray-100 text-gray-800')

  const safeAssignments = Array.isArray(teamData) ? teamData : []

  if (teamError) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-red-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Error loading team data</h3>
        <p className="text-gray-600 mt-2">{teamError.message}</p>
        <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
      </div>
    )
  }

  if (teamLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>)}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={isGlobalView ? "/projects" : `/projects/${id}`} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-1" /> {isGlobalView ? 'Back to Projects' : 'Back to Project'}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isGlobalView ? 'All Team Members' : 'Team Members'}</h1>
            {!isGlobalView && <p className="text-gray-600">{project?.name}</p>}
          </div>
        </div>
        {!isGlobalView && (
          <Button onClick={() => { resetForm(); setEditingMember(null); setShowAddDialog(true) }}>
            <Plus className="h-4 w-4 mr-2" /> Add Member
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Total Members</p>
          <p className="text-2xl font-bold">{safeAssignments.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold">{safeAssignments.filter(a => a.status === 'active' || !a.status).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600">Avg Allocation</p>
          <p className="text-2xl font-bold">
            {safeAssignments.length > 0 ? Math.round(safeAssignments.reduce((s, a) => s + (a.allocation_percentage || 100), 0) / safeAssignments.length) : 0}%
          </p>
        </div>
      </div>

      {/* Team List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b"><h3 className="text-lg font-medium">Team Members</h3></div>
        {safeAssignments.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No team members yet</p>
            {!isGlobalView && <Button onClick={() => setShowAddDialog(true)} className="mt-4"><Plus className="h-4 w-4 mr-2" /> Add First Member</Button>}
          </div>
        ) : (
          <div className="divide-y">
            {safeAssignments.map((item) => {
              const emp = item.Employee || item
              const user = emp?.User || item
              const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Unknown'
              const email = user?.email || emp?.email || ''
              const role = item.role || emp?.position || 'Team Member'
              
              return (
                <div key={item.id} className="p-6 hover:bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-primary font-medium">
                      {name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">{name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)}`}>
                          {role.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        {email && <span className="flex items-center"><Mail className="h-3 w-3 mr-1" />{email}</span>}
                        {item.allocation_percentage && <span className="flex items-center"><Clock className="h-3 w-3 mr-1" />{item.allocation_percentage}%</span>}
                      </div>
                    </div>
                  </div>
                  {!isGlobalView && (
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleRemove(item.employee_id || item.id)}><UserMinus className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
              <button onClick={() => setShowAddDialog(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingMember && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.User?.first_name || emp.first_name} {emp.User?.last_name || emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="project_manager">Project Manager</option>
                  <option value="lead_developer">Lead Developer</option>
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="qa_tester">QA Tester</option>
                  <option value="business_analyst">Business Analyst</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allocation %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.allocation_percentage}
                  onChange={(e) => setFormData({ ...formData, allocation_percentage: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={addMemberMutation.isLoading || updateMemberMutation.isLoading}>
                  {editingMember ? 'Update' : 'Add'} Member
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectTeam
