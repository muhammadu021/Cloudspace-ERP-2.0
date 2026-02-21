import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Search, Eye, Download, Users, Globe, Lock, Shield, FileText, Image, Video, Music, Archive, Share2 } from 'lucide-react'
import { fileShareService } from '@/services/fileShareService'
import { format } from 'date-fns'

const SharedWithMe = () => {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: filesData, isLoading } = useQuery(
    ['shared-with-me', { search: searchTerm }],
    async () => {
      const res = await fileShareService.getFiles({ search: searchTerm })
      const payload = res.data
      const files = Array.isArray(payload) ? payload : payload?.files || []
      return files.filter(f => f.visibility !== 'private' || f.shared_with_me)
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
      case 'public': return <Globe className="h-4 w-4 text-green-500" />
      case 'department': return <Users className="h-4 w-4 text-primary" />
      case 'admin': return <Shield className="h-4 w-4 text-red-500" />
      default: return <Lock className="h-4 w-4 text-gray-500" />
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
          <h1 className="text-2xl font-bold text-gray-900">Shared with Me</h1>
          <p className="text-gray-600">Files that others have shared with you</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search shared files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-32 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
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
                    <div>
                      <h3 className="font-medium text-gray-900 truncate max-w-[180px]">{file.title}</h3>
                      <p className="text-sm text-gray-500">{formatFileSize(file.file_size)}</p>
                    </div>
                  </div>
                  {getVisibilityIcon(file.visibility)}
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{file.description || 'No description'}</p>
                <div className="text-xs text-gray-500 mb-3">
                  Shared by: {file.UploadedBy?.User?.first_name || 'Unknown'}
                </div>
                <div className="flex space-x-2">
                  <Link to={`/file-share/${file.id}`} className="flex-1 flex items-center justify-center px-3 py-2 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 text-sm">
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shared files</h3>
            <p className="text-gray-500">Files shared with you will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SharedWithMe
