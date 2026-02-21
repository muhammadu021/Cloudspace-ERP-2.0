import React, { useState, useEffect } from 'react'
import { FileText, Plus, Search, Download, Eye, Filter, Upload } from 'lucide-react'
import { adminService } from '@/services/adminService'
import documentService from '@/services/documentService'
import { toast } from 'react-hot-toast'

const DocumentRepository = () => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const response = await adminService.getDocuments()
      const documents = response.data.documents || []
      
      // Debug: Log the first document to see its structure
      if (documents.length > 0) {
        console.log('Document structure:', documents[0])
      }
      
      setDocuments(documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleUploadDocument = async (documentData) => {
    try {
      // Enhanced validation for required fields
      console.log('Received document data:', documentData)
      
      if (!documentData || typeof documentData !== 'object') {
        toast.error('Invalid document data')
        return
      }
      
      if (!documentData.name || typeof documentData.name !== 'string' || documentData.name.trim().length === 0) {
        toast.error('Document title is required and cannot be empty')
        return
      }
      
      if (documentData.name.trim().length > 255) {
        toast.error('Document title must be less than 255 characters')
        return
      }
      
      if (!documentData.file) {
        toast.error('Please select a file to upload')
        return
      }
      
      // Create FormData for file upload
      const formData = new FormData()
      
      // Debug: Log the data being sent
      console.log('Document data being sent:', {
        title: documentData.name.trim(),
        description: documentData.description?.trim() || '',
        document_type: documentData.category || 'other',
        visibility: 'internal',
        priority: 'normal',
        file: documentData.file
      })
      
      // Add document fields with proper validation
      const titleValue = documentData.name.trim()
      console.log('Title value:', titleValue, 'Length:', titleValue.length)
      
      // Double-check title is not empty
      if (!titleValue || titleValue.length === 0) {
        toast.error('Document title cannot be empty')
        return
      }
      
      formData.append('title', titleValue)
      formData.append('description', documentData.description?.trim() || '')
      formData.append('document_type', documentData.category || 'other')
      formData.append('visibility', 'internal')
      formData.append('priority', 'normal')
      
      // Add file
      formData.append('file', documentData.file)
      
      // Debug: Log FormData contents
      console.log('FormData contents:')
      for (let [key, value] of formData.entries()) {
        console.log(key, ':', value)
      }
      
      await documentService.createDocument(formData)
      toast.success('Document uploaded successfully')
      setShowUploadModal(false)
      fetchDocuments()
    } catch (error) {
      console.error('Error uploading document:', error)
      
      // Handle validation errors specifically
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        const errorMessages = Object.values(errors).join(', ')
        toast.error(`Validation error: ${errorMessages}`)
      } else if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`)
      } else {
        toast.error('Failed to upload document')
      }
    }
  }

  const handleDownloadDocument = async (document) => {
    try {
      const response = await documentService.downloadDocument(document.id)
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: document.mime_type })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = document.file_name || document.title || 'document'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Document downloaded successfully')
    } catch (error) {
      console.error('Error downloading document:', error)
      toast.error('Failed to download document')
    }
  }

  const handleViewDocument = async (document) => {
    try {
      // For now, just download the document
      // In a real implementation, you might open it in a viewer
      await handleDownloadDocument(document)
    } catch (error) {
      console.error('Error viewing document:', error)
      toast.error('Failed to view document')
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Repository</h1>
          <p className="text-gray-600">Manage and organize company documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {documents.length === 0 ? 'No documents found' : 'No documents match your search'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {documents.length === 0 
                ? 'Get started by uploading a new document.' 
                : 'Try adjusting your search terms.'}
            </p>
          </div>
        ) : (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-blue-100 rounded-md flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {doc.title || 'Untitled Document'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {doc.document_type || 'Document'} • {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Unknown date'}
                    </p>
                    {doc.description && (
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">{doc.description}</p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {doc.document_type?.toUpperCase() || 'DOC'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="text-gray-400 hover:text-primary-600"
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="text-gray-400 hover:text-primary-600"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Document Modal */}
      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onSubmit={handleUploadDocument}
        />
      )}
    </div>
  )
}

const UploadDocumentModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    file: null
  })

  // Debug: Log form data changes
  React.useEffect(() => {
    console.log('Form data updated:', formData)
  }, [formData])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Enhanced client-side validation
    console.log('Form submission - current formData:', formData)
    
    if (!formData.name || typeof formData.name !== 'string' || formData.name.trim().length === 0) {
      toast.warning('Please enter a document title')
      return
    }
    
    if (formData.name.trim().length > 255) {
      toast('Document title must be less than 255 characters')
      return
    }
    
    if (!formData.file) {
      toast.warning('Please select a file to upload')
      return
    }
    
    // Ensure we're passing clean data
    const cleanData = {
      name: formData.name.trim(),
      category: formData.category || 'other',
      description: formData.description?.trim() || '',
      file: formData.file
    }
    
    console.log('Submitting clean data:', cleanData)
    onSubmit(cleanData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upload New Document</h3>
          <p className="text-sm text-gray-500 mt-1">Fill in the document details and select a file to upload</p>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Enter document title"
              className="mt-1 block w-full border-2 border-gray-300 rounded-md shadow-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm font-medium"
              value={formData.name}
              onChange={(e) => {
                console.log('Title input changed:', e.target.value)
                setFormData({...formData, name: e.target.value})
              }}
              maxLength={255}
            />
            <p className="text-xs text-gray-500">This will be the main title of your document (max 255 characters)</p>
            {formData.name && (
              <p className="text-xs text-gray-400">Current length: {formData.name.length}/255</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select a category</option>
              <option value="policy">Policy</option>
              <option value="procedure">Procedure</option>
              <option value="contract">Contract</option>
              <option value="report">Report</option>
              <option value="manual">Manual</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              maxLength={2000}
            />
            {formData.description && (
              <p className="text-xs text-gray-400 mt-1">Current length: {formData.description.length}/2000</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              File <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              required
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
              className="mt-1 block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100"
              onChange={(e) => {
                console.log('File selected:', e.target.files[0])
                setFormData({...formData, file: e.target.files[0]})
              }}
            />
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: PDF, Word, Excel, PowerPoint, Text, Images
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              disabled={!formData.name?.trim() || !formData.file}
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DocumentRepository