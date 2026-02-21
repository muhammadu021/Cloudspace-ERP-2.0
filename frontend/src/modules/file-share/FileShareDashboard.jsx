import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MessageSquare,
  MoreVertical,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Globe,
  Users,
  Lock,
  Shield
} from 'lucide-react'
import { fileShareService } from '@/services/fileShareService'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'

const FileShareDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [fileTypeFilter, setFileTypeFilter] = useState('all')
  const { hasPermission } = useAuth()

  const { data: filesData, isLoading, refetch } = useQuery(
    ['files', { search: searchTerm, visibility: visibilityFilter, category: categoryFilter, file_type: fileTypeFilter }],
    () => fileShareService.getFiles({ 
      search: searchTerm, 
      visibility: visibilityFilter === 'all' ? undefined : visibilityFilter,
      category: categoryFilter === 'all' ? undefined : categoryFilter,
      file_type: fileTypeFilter === 'all' ? undefined : fileTypeFilter
    }),
    {
      select: (response) => response.data,
      keepPreviousData: true
    }
  )

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <Image className="h-8 w-8 text-primary" />
    if (mimeType.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />
    if (mimeType.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />
    if (mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="h-8 w-8 text-yellow-500" />
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public':
        return <Globe className="h-4 w-4 text-green-500" />
      case 'department':
        return <Users className="h-4 w-4 text-primary" />
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'private':
        return <Lock className="h-4 w-4 text-gray-500" />
      default:
        return <Lock className="h-4 w-4 text-gray-500" />
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

  const handleDownload = async (file) => {
    try {
      const response = await fileShareService.downloadFile(file.id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.original_name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">File Sharing</h1>
          <p className="text-gray-600">Share and manage files across your organization</p>
        </div>
        <Link
          to="/file-share/upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload File
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          
          <div>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="department">Department</option>
              <option value="admin">Admin Only</option>
              <option value="private">Private</option>
            </select>
          </div>
          
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              <option value="documents">Documents</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="presentations">Presentations</option>
              <option value="spreadsheets">Spreadsheets</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <select
              value={fileTypeFilter}
              onChange={(e) => setFileTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All File Types</option>
              <option value="pdf">PDF</option>
              <option value="doc">Word Documents</option>
              <option value="xls">Excel Files</option>
              <option value="ppt">PowerPoint</option>
              <option value="jpg">Images</option>
              <option value="mp4">Videos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Files Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filesData?.files?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filesData.files.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file.mime_type)}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/file-share/${file.id}`}
                          className="text-sm font-medium text-gray-900 hover:text-primary-600 truncate block"
                        >
                          {file.title}
                        </Link>
                        <p className="text-xs text-gray-500 truncate">{file.original_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getVisibilityIcon(file.visibility)}
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(file.file_size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Visibility:</span>
                      <span>{getVisibilityLabel(file.visibility)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{format(new Date(file.created_at), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>By:</span>
                      <span>{file.UploadedBy?.User?.first_name} {file.UploadedBy?.User?.last_name}</span>
                    </div>
                    {file.download_count > 0 && (
                      <div className="flex justify-between">
                        <span>Downloads:</span>
                        <span>{file.download_count}</span>
                      </div>
                    )}
                  </div>

                  {file.description && (
                    <p className="mt-2 text-xs text-gray-600 line-clamp-2">{file.description}</p>
                  )}

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/file-share/${file.id}`}
                        className="inline-flex items-center text-xs text-primary-600 hover:text-primary-500"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Link>
                      {file.allow_download && (
                        <button
                          onClick={() => handleDownload(file)}
                          className="inline-flex items-center text-xs text-green-600 hover:text-green-500"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </button>
                      )}
                      {file.allow_comments && (
                        <Link
                          to={`/file-share/${file.id}#comments`}
                          className="inline-flex items-center text-xs text-gray-600 hover:text-gray-500"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Comments
                        </Link>
                      )}
                    </div>
                    
                    {file.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {file.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600 mb-4">Get started by uploading your first file.</p>
              <Link
                to="/file-share/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filesData?.pagination && filesData.pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((filesData.pagination.currentPage - 1) * filesData.pagination.itemsPerPage) + 1} to{' '}
                {Math.min(filesData.pagination.currentPage * filesData.pagination.itemsPerPage, filesData.pagination.totalItems)} of{' '}
                {filesData.pagination.totalItems} files
              </div>
              <div className="flex space-x-2">
                {/* Add pagination controls here */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileShareDashboard