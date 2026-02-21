import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Search, Eye, Download, Users, Globe, Lock, Shield, FileText, Image, Video, Music, Archive } from 'lucide-react'
import { fileShareService } from '@/services/fileShareService'
import { format } from 'date-fns'
import { API_URL } from '@/services/api'

const MyFiles = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: filesData, isLoading } = useQuery(
    ['my-files', { search: searchTerm }],
    async () => {
      // Fetch files visible to me: department + public
      const res = await fileShareService.getFiles({ search: searchTerm, visibility: undefined })
      const payload = res.data
      // Expect payload like { files, pagination } or array
      const files = Array.isArray(payload) ? payload : payload?.files || []
      // Filter down to public or department visibility
      return files.filter(f => ['public', 'department'].includes(f.visibility))
    },
    { keepPreviousData: true }
  )

  const getFileIcon = (mimeType = '') => {
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

  const formatFileSize = (bytes = 0) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const files = filesData || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Department & Public Files</h1>
          <p className="text-gray-600">Files shared publicly or with your department</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
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
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : files.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {files.map((file) => (
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
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(file.file_size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Visibility:</span>
                      <span className="capitalize">{file.visibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{format(new Date(file.created_at), 'MMM dd, yyyy')}</span>
                    </div>
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
                        <a
                          href={`${API_URL}/file-share/files/${file.id}/download`}
                          className="inline-flex items-center text-xs text-green-600 hover:text-green-500"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files available</h3>
              <p className="text-gray-600">There are no public or department files to show.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyFiles
