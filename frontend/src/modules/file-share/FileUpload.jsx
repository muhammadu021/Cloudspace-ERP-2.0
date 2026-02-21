import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from 'react-query'
import { useForm } from 'react-hook-form'
import { 
  Upload, 
  X, 
  FileText, 
  Globe, 
  Users, 
  Lock, 
  Shield,
  Eye,
  EyeOff,
  Calendar,
  MessageSquare,
  Download
} from 'lucide-react'
import { fileShareService } from '@/services/fileShareService'
import { hrService } from '@/services/hrService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

const FileUpload = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      visibility: 'private',
      allow_comments: true,
      allow_download: true,
      password_protected: false
    }
  })

  const visibility = watch('visibility')
  const passwordProtected = watch('password_protected')

  // Get departments for department visibility option
  const { data: departmentsData } = useQuery(
    'departments',
    () => hrService.getDepartments(),
    {
      select: (response) => response.data.departments
    }
  )

  const uploadMutation = useMutation(
    (formData) => fileShareService.uploadFile(formData),
    {
      onSuccess: (response) => {
        toast.success('File uploaded successfully!')
        navigate('/file-share')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to upload file')
      }
    }
  )

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const onSubmit = (data) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('title', data.title)
    formData.append('description', data.description || '')
    formData.append('visibility', data.visibility)
    formData.append('category', data.category || '')
    formData.append('allow_comments', data.allow_comments)
    formData.append('allow_download', data.allow_download)
    formData.append('password_protected', data.password_protected)
    
    if (data.visibility === 'department' && data.department_id) {
      formData.append('department_id', data.department_id)
    }
    
    if (data.expires_at) {
      formData.append('expires_at', data.expires_at)
    }
    
    if (data.password_protected && data.access_password) {
      formData.append('access_password', data.access_password)
    }
    
    if (data.tags) {
      formData.append('tags', JSON.stringify(data.tags.split(',').map(tag => tag.trim())))
    }

    uploadMutation.mutate(formData)
  }

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-5 w-5 text-green-500" />
      case 'department':
        return <Users className="h-5 w-5 text-primary" />
      case 'admin':
        return <Shield className="h-5 w-5 text-red-500" />
      case 'private':
        return <Lock className="h-5 w-5 text-gray-500" />
      default:
        return <Lock className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload File</h1>
        <p className="text-gray-600">Share files with your team or make them publicly available</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* File Upload Area */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select File</h2>
          
          {!selectedFile ? (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Drop your file here, or{' '}
                  <label className="text-primary-600 hover:text-primary-500 cursor-pointer">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.mp3,.wav,.zip,.rar"
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  Supports: PDF, Word, Excel, PowerPoint, Images, Videos, Audio, Archives
                </p>
                <p className="text-sm text-gray-500">Maximum file size: 100MB</p>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* File Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">File Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                {...register('title', { required: 'Title is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter file title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select category</option>
                <option value="documents">Documents</option>
                <option value="images">Images</option>
                <option value="videos">Videos</option>
                <option value="presentations">Presentations</option>
                <option value="spreadsheets">Spreadsheets</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter file description"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                {...register('tags')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., important, project, documentation"
              />
            </div>
          </div>
        </div>

        {/* Visibility Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Visibility & Access</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Who can access this file?
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="public"
                    {...register('visibility')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3 flex items-center">
                    <Globe className="h-4 w-4 text-green-500 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Public</span>
                      <p className="text-xs text-gray-500">Anyone can view and download this file</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    value="department"
                    {...register('visibility')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3 flex items-center">
                    <Users className="h-4 w-4 text-primary mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Department</span>
                      <p className="text-xs text-gray-500">Only members of selected department can access</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    value="admin"
                    {...register('visibility')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3 flex items-center">
                    <Shield className="h-4 w-4 text-red-500 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Admin Only</span>
                      <p className="text-xs text-gray-500">Only administrators can access this file</p>
                    </div>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    value="private"
                    {...register('visibility')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3 flex items-center">
                    <Lock className="h-4 w-4 text-gray-500 mr-2" />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Private</span>
                      <p className="text-xs text-gray-500">Only you can access this file</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {visibility === 'department' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Department
                </label>
                <select
                  {...register('department_id', { 
                    required: visibility === 'department' ? 'Department is required' : false 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select department</option>
                  {departmentsData?.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
                {errors.department_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.department_id.message}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Advanced Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Allow Comments</span>
                  <p className="text-xs text-gray-500">Users can comment on this file</p>
                </div>
              </div>
              <input
                type="checkbox"
                {...register('allow_comments')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Download className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Allow Download</span>
                  <p className="text-xs text-gray-500">Users can download this file</p>
                </div>
              </div>
              <input
                type="checkbox"
                {...register('allow_download')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Lock className="h-4 w-4 text-gray-500 mr-2" />
                <div>
                  <span className="text-sm font-medium text-gray-900">Password Protection</span>
                  <p className="text-xs text-gray-500">Require password to access file</p>
                </div>
              </div>
              <input
                type="checkbox"
                {...register('password_protected')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>

            {passwordProtected && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('access_password', {
                      required: passwordProtected ? 'Password is required' : false
                    })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter access password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.access_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.access_password.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                type="datetime-local"
                {...register('expires_at')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="mt-1 text-xs text-gray-500">File will be automatically hidden after this date</p>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/file-share')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploadMutation.isLoading || !selectedFile}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadMutation.isLoading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FileUpload