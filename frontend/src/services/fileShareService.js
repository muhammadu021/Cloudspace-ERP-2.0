import api from './api'
import { getCompanyId } from '../utils/company';
// Helper function to get company_id from Redux store

export const fileShareService = {
  // Dashboard
  getFileShareDashboard: () => {
    const company_id = getCompanyId();
    return api.get('/file-share/dashboard', { params: { company_id } });
  },

  // Files
  getFiles: async (params) => {
    const company_id = getCompanyId();
    const res = await api.get('/file-share/files', { params: { ...params, company_id } });
    // Ensure consistent shape: return the actual list payload
    return { data: res.data?.data ?? res.data };
  },
  getFileById: async (id) => {
    const company_id = getCompanyId();
    const res = await api.get(`/file-share/files/${id}`, { params: { company_id } });
    return { data: res.data?.data ?? res.data };
  },
  uploadFile: (formData) => {
    const company_id = getCompanyId();
    // Accept FormData directly from the component
    // If it's not FormData, convert it (for backward compatibility)
    if (!(formData instanceof FormData)) {
      const newFormData = new FormData();
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          newFormData.append(key, JSON.stringify(formData[key]));
        } else {
          newFormData.append(key, formData[key]);
        }
      });
      formData = newFormData;
    }
    return api.post('/file-share/files', formData);
    // Note: Don't set Content-Type header manually for FormData
    // The browser will set it automatically with the correct boundary
  },
  updateFile: (id, fileData) => api.put(`/file-share/files/${id}`, fileData),
  deleteFile: (id) => api.delete(`/file-share/files/${id}`),
  downloadFile: (id, password) => api.post(`/file-share/files/${id}/download`, { password }, {
    responseType: 'blob'
  }),

  // File Versions
  getFileVersions: (id) => api.get(`/file-share/files/${id}/versions`),
  createFileVersion: (id, file, versionNotes) => {
    const formData = new FormData();
    formData.append('file', file);
    if (versionNotes) {
      formData.append('version_notes', versionNotes);
    }
    return api.post(`/file-share/files/${id}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Folders
  getFolders: (params) => api.get('/file-share/folders', { params }),
  createFolder: (folderData) => api.post('/file-share/folders', folderData),

  // Permissions
  getFilePermissions: (id) => api.get(`/file-share/files/${id}/permissions`),
  setFilePermissions: (fileId, permissions) => api.put('/file-share/permissions', {
    file_id: fileId,
    permissions
  }),

  // Comments
  addFileComment: (id, commentData) => api.post(`/file-share/files/${id}/comments`, commentData),

  // Search
  searchFiles: (params) => api.get('/file-share/search', { params }),

  // Access Logs
  getFileAccessLogs: (id, params) => api.get(`/file-share/files/${id}/access-logs`, { params }),

  // Public Files (no authentication required)
  getPublicFiles: (params) => api.get('/file-share/public', { params }),
  getPublicFileById: (id) => api.get(`/file-share/public/${id}`),
  downloadPublicFile: (id, password) => api.post(`/file-share/public/${id}/download`, { password }, {
    responseType: 'blob'
  }),

  // Legacy endpoints for backward compatibility
  getFilesLegacy: (params) => api.get('/file-share', { params }),
  getFileByIdLegacy: (id) => api.get(`/file-share/${id}`),
  uploadFileLegacy: (fileData, file) => {
    const formData = new FormData();
    Object.keys(fileData).forEach(key => {
      if (Array.isArray(fileData[key])) {
        formData.append(key, JSON.stringify(fileData[key]));
      } else {
        formData.append(key, fileData[key]);
      }
    });
    if (file) {
      formData.append('file', file);
    }
    return api.post('/file-share', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateFileLegacy: (id, fileData) => api.put(`/file-share/${id}`, fileData),
  deleteFileLegacy: (id) => api.delete(`/file-share/${id}`),
  downloadFileLegacy: (id, password) => api.post(`/file-share/${id}/download`, { password }, {
    responseType: 'blob'
  }),

  // Utility functions
  getFileCategories: () => Promise.resolve({
    data: {
      data: {
        categories: [
          { value: 'document', label: 'Documents', icon: 'file-text', color: 'blue' },
          { value: 'image', label: 'Images', icon: 'image', color: 'green' },
          { value: 'video', label: 'Videos', icon: 'video', color: 'purple' },
          { value: 'audio', label: 'Audio', icon: 'music', color: 'orange' },
          { value: 'archive', label: 'Archives', icon: 'archive', color: 'gray' },
          { value: 'presentation', label: 'Presentations', icon: 'monitor', color: 'red' },
          { value: 'spreadsheet', label: 'Spreadsheets', icon: 'grid', color: 'yellow' },
          { value: 'code', label: 'Code Files', icon: 'code', color: 'indigo' },
          { value: 'other', label: 'Other', icon: 'file', color: 'gray' }
        ]
      }
    }
  }),

  getVisibilityOptions: () => Promise.resolve({
    data: {
      data: {
        options: [
          { value: 'public', label: 'Public', description: 'Visible to everyone', icon: 'globe' },
          { value: 'department', label: 'Department', description: 'Visible to department members', icon: 'building' },
          { value: 'admin', label: 'Admin Only', description: 'Visible to administrators only', icon: 'shield' },
          { value: 'private', label: 'Private', description: 'Visible to specific users only', icon: 'lock' }
        ]
      }
    }
  }),

  getAccessLevels: () => Promise.resolve({
    data: {
      data: {
        levels: [
          { value: 'view', label: 'View Only', description: 'Can view file details', icon: 'eye' },
          { value: 'download', label: 'Download', description: 'Can view and download', icon: 'download' },
          { value: 'comment', label: 'Comment', description: 'Can view, download, and comment', icon: 'message-circle' },
          { value: 'edit', label: 'Edit', description: 'Can view, download, comment, and edit', icon: 'edit' },
          { value: 'delete', label: 'Delete', description: 'Can perform all actions including delete', icon: 'trash' },
          { value: 'share', label: 'Share', description: 'Can manage permissions and share', icon: 'share' }
        ]
      }
    }
  }),

  getPermissionTypes: () => Promise.resolve({
    data: {
      data: {
        types: [
          { value: 'user', label: 'Specific User', description: 'Grant access to a specific user', icon: 'user' },
          { value: 'department', label: 'Department', description: 'Grant access to all department members', icon: 'building' },
          { value: 'role', label: 'Role', description: 'Grant access to users with specific role', icon: 'shield' }
        ]
      }
    }
  }),

  // Helper functions
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  getFileIcon: (mimeType, fileName) => {
    if (!mimeType && fileName) {
      const ext = fileName.split('.').pop()?.toLowerCase();
      if (ext) {
        const extensionMap = {
          'pdf': 'file-text',
          'doc': 'file-text',
          'docx': 'file-text',
          'xls': 'grid',
          'xlsx': 'grid',
          'ppt': 'monitor',
          'pptx': 'monitor',
          'txt': 'file-text',
          'zip': 'archive',
          'rar': 'archive',
          '7z': 'archive',
          'mp3': 'music',
          'wav': 'music',
          'mp4': 'video',
          'avi': 'video',
          'mov': 'video',
          'jpg': 'image',
          'jpeg': 'image',
          'png': 'image',
          'gif': 'image',
          'svg': 'image',
          'js': 'code',
          'ts': 'code',
          'html': 'code',
          'css': 'code',
          'json': 'code',
          'xml': 'code'
        };
        return extensionMap[ext] || 'file';
      }
    }

    if (mimeType) {
      if (mimeType.startsWith('image/')) return 'image';
      if (mimeType.startsWith('video/')) return 'video';
      if (mimeType.startsWith('audio/')) return 'music';
      if (mimeType.includes('pdf')) return 'file-text';
      if (mimeType.includes('word') || mimeType.includes('document')) return 'file-text';
      if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'grid';
      if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'monitor';
      if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('archive')) return 'archive';
      if (mimeType.includes('text')) return 'file-text';
    }

    return 'file';
  },

  getFileTypeColor: (mimeType, fileName) => {
    const icon = fileShareService.getFileIcon(mimeType, fileName);
    const colorMap = {
      'image': 'green',
      'video': 'purple',
      'music': 'orange',
      'file-text': 'blue',
      'grid': 'yellow',
      'monitor': 'red',
      'archive': 'gray',
      'code': 'indigo',
      'file': 'gray'
    };
    return colorMap[icon] || 'gray';
  },

  isImageFile: (mimeType) => {
    return mimeType && mimeType.startsWith('image/');
  },

  isVideoFile: (mimeType) => {
    return mimeType && mimeType.startsWith('video/');
  },

  isAudioFile: (mimeType) => {
    return mimeType && mimeType.startsWith('audio/');
  },

  isPdfFile: (mimeType) => {
    return mimeType && mimeType.includes('pdf');
  },

  isDocumentFile: (mimeType) => {
    return mimeType && (
      mimeType.includes('document') ||
      mimeType.includes('word') ||
      mimeType.includes('text') ||
      mimeType.includes('pdf')
    );
  },

  isArchiveFile: (mimeType) => {
    return mimeType && (
      mimeType.includes('zip') ||
      mimeType.includes('rar') ||
      mimeType.includes('archive') ||
      mimeType.includes('compressed')
    );
  },

  canPreview: (mimeType) => {
    return fileShareService.isImageFile(mimeType) ||
           fileShareService.isPdfFile(mimeType) ||
           (mimeType && mimeType.includes('text'));
  },

  generateThumbnail: (file) => {
    return new Promise((resolve, reject) => {
      if (!fileShareService.isImageFile(file.type)) {
        resolve(null);
        return;
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxSize = 200;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(resolve, 'image/jpeg', 0.8);
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  },

  validateFile: (file, options = {}) => {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB default
      allowedTypes = [],
      allowedExtensions = []
    } = options;

    const errors = [];

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size exceeds ${fileShareService.formatFileSize(maxSize)}`);
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // Check file extension
    if (allowedExtensions.length > 0) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        errors.push(`File extension .${extension} is not allowed`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  createBreadcrumb: (currentFolder, folders = []) => {
    const breadcrumb = [{ id: null, title: 'Root', path: '/' }];
    
    if (currentFolder && folders.length > 0) {
      // Build path from root to current folder
      const buildPath = (folderId, path = []) => {
        const folder = folders.find(f => f.id === folderId);
        if (folder) {
          path.unshift(folder);
          if (folder.parent_file_id) {
            return buildPath(folder.parent_file_id, path);
          }
        }
        return path;
      };

      const path = buildPath(currentFolder.id);
      path.forEach((folder, index) => {
        breadcrumb.push({
          id: folder.id,
          title: folder.title,
          path: `/${path.slice(0, index + 1).map(f => f.title).join('/')}`
        });
      });
    }

    return breadcrumb;
  },

  sortFiles: (files, sortBy = 'created_at', sortOrder = 'DESC') => {
    return [...files].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle different data types
      if (sortBy === 'file_size') {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (sortBy === 'created_at' || sortBy === 'updated_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      let comparison = 0;
      if (aValue > bValue) {
        comparison = 1;
      } else if (aValue < bValue) {
        comparison = -1;
      }

      return sortOrder === 'DESC' ? -comparison : comparison;
    });
  },

  filterFiles: (files, filters = {}) => {
    return files.filter(file => {
      // Filter by category
      if (filters.category && file.category !== filters.category) {
        return false;
      }

      // Filter by file type
      if (filters.fileType && !file.file_type.includes(filters.fileType)) {
        return false;
      }

      // Filter by visibility
      if (filters.visibility && file.visibility !== filters.visibility) {
        return false;
      }

      // Filter by date range
      if (filters.dateFrom && new Date(file.created_at) < new Date(filters.dateFrom)) {
        return false;
      }

      if (filters.dateTo && new Date(file.created_at) > new Date(filters.dateTo)) {
        return false;
      }

      // Filter by size range
      if (filters.sizeMin && file.file_size < filters.sizeMin) {
        return false;
      }

      if (filters.sizeMax && file.file_size > filters.sizeMax) {
        return false;
      }

      return true;
    });
  },

  getStorageQuota: (storageUsed, storageLimit = 5 * 1024 * 1024 * 1024) => { // 5GB default
    const usedPercentage = (storageUsed / storageLimit) * 100;
    return {
      used: storageUsed,
      limit: storageLimit,
      available: storageLimit - storageUsed,
      usedPercentage: Math.min(usedPercentage, 100),
      usedFormatted: fileShareService.formatFileSize(storageUsed),
      limitFormatted: fileShareService.formatFileSize(storageLimit),
      availableFormatted: fileShareService.formatFileSize(storageLimit - storageUsed)
    };
  }
}

export default fileShareService