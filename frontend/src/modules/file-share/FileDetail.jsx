import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useForm } from 'react-hook-form'
import { 
  ArrowLeft,
  Download, 
  Edit, 
  Trash2,
  MessageSquare,
  Send,
  Globe,
  Users,
  Lock,
  Shield,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Calendar,
  User,
  Eye
} from 'lucide-react'
import { fileShareService } from '@/services/fileShareService'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const FileDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCommentForm, setShowCommentForm] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const { data: fileData, isLoading } = useQuery(
    ['file', id],
    () => fileShareService.getFileById(id),
    {
      select: (response) => response.data?.file ?? response.data
    }
  )

  const addCommentMutation = useMutation(
    (commentData) => fileShareService.addFileComment(id, commentData),
    {
      onSuccess: () => {
        toast.success('Comment added successfully!')
        queryClient.invalidateQueries(['file', id])
        reset()
        setShowCommentForm(false)
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add comment')
      }
    }
  )

  const deleteMutation = useMutation(
    () => fileShareService.deleteFile(id),
    {
      onSuccess: () => {
        toast.success('File deleted successfully!')
        navigate('/file-share')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete file')
      }
    }
  )

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <Image className="h-12 w-12 text-primary" />
    if (mimeType?.startsWith('video/')) return <Video className="h-12 w-12 text-purple-500" />
    if (mimeType?.startsWith('audio/')) return <Music className="h-12 w-12 text-green-500" />
    if (mimeType?.includes('zip') || mimeType?.includes('rar')) return <Archive className="h-12 w-12 text-yellow-500" />
    return <FileText className="h-12 w-12 text-gray-500" />
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

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case 'public':
        return 'Public'
      case 'department':
        return 'Department'
      case 'admin':
        return 'Admin Only'
      case 'private':
        return 'Private'
      default:
        return 'Private'
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = async () => {
    try {
      const response = await fileShareService.downloadFile(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileData.original_name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download file')
    }
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      deleteMutation.mutate()
    }
  }

  const onSubmitComment = (data) => {
    addCommentMutation.mutate(data)
  }

  const canEdit = fileData && (
    fileData.uploaded_by === user?.Employee?.id || 
    ['super_admin', 'admin'].includes(user?.Role?.name)
  )

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/4"></div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (!fileData) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">File not found</h3>
        <p className="text-gray-600">The file you're looking for doesn't exist or you don't have permission to view it.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/file-share')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Files
        </button>
        
        <div className="flex items-center space-x-2">
          {fileData.allow_download && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </button>
          )}
          
          {canEdit && (
            <>
              <button
                onClick={() => navigate(`/file-share/${id}/edit`)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
              
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* File Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start space-x-4">
          {getFileIcon(fileData.mime_type)}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{fileData.title}</h1>
              <div className="flex items-center space-x-1">
                {getVisibilityIcon(fileData.visibility)}
                <span className="text-sm text-gray-500">{getVisibilityLabel(fileData.visibility)}</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{fileData.original_name}</p>
            
            {fileData.description && (
              <p className="text-gray-700 mb-4">{fileData.description}</p>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Size:</span>
                <p className="font-medium">{formatFileSize(fileData.file_size)}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Type:</span>
                <p className="font-medium">{fileData.file_type}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Downloads:</span>
                <p className="font-medium">{fileData.download_count}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Version:</span>
                <p className="font-medium">{fileData.version}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Uploaded:</span>
                <p className="font-medium">{format(new Date(fileData.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
              
              <div>
                <span className="text-gray-500">By:</span>
                <p className="font-medium">
                  {fileData.UploadedBy?.User?.first_name} {fileData.UploadedBy?.User?.last_name}
                </p>
              </div>
              
              {fileData.Department && (
                <div>
                  <span className="text-gray-500">Department:</span>
                  <p className="font-medium">{fileData.Department.name}</p>
                </div>
              )}
              
              {fileData.category && (
                <div>
                  <span className="text-gray-500">Category:</span>
                  <p className="font-medium">{fileData.category}</p>
                </div>
              )}
            </div>
            
            {(() => {
              // Normalize tags to an array (backend may return string, null, or already an array)
              const tags = Array.isArray(fileData.tags)
                ? fileData.tags
                : typeof fileData.tags === 'string' && fileData.tags.trim().length > 0
                  ? fileData.tags.split(',').map(t => t.trim()).filter(Boolean)
                  : [];
              return tags.length > 0 ? (
                <div className="mt-4">
                  <span className="text-sm text-gray-500">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}
            
            {fileData.expires_at && (
              <div className="mt-4 flex items-center text-sm text-amber-600">
                <Calendar className="h-4 w-4 mr-1" />
                Expires: {format(new Date(fileData.expires_at), 'MMM dd, yyyy HH:mm')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {fileData.allow_comments && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Comments</h2>
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-primary-600 bg-primary-100 hover:bg-primary-200"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </button>
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <form onSubmit={handleSubmit(onSubmitComment)} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="mb-4">
                <textarea
                  {...register('comment', { required: 'Comment is required' })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Write your comment..."
                />
                {errors.comment && (
                  <p className="mt-1 text-sm text-red-600">{errors.comment.message}</p>
                )}
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCommentForm(false)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCommentMutation.isLoading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {fileData.FileComments && fileData.FileComments.length > 0 ? (
              fileData.FileComments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {comment.Employee?.User?.first_name} {comment.Employee?.User?.last_name}
                      </span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                      {comment.is_edited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                    <p className="mt-1 text-gray-700">{comment.comment}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FileDetail