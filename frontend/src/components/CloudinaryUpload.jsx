import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { 
  uploadFile, 
  uploadMultipleFiles, 
  validateFile, 
  formatFileSize, 
  getFileCategory,
  createPreviewUrl 
} from '../utils/cloudinaryUpload';

const CloudinaryUpload = ({
  onUploadComplete,
  onUploadError,
  multiple = false,
  accept = '*/*',
  maxSize = 100 * 1024 * 1024, // 100MB
  allowedTypes = [],
  allowedExtensions = [],
  category = 'general',
  folder = 'cleardesk/uploads',
  optimization = true,
  className = '',
  disabled = false,
  children,
  showPreview = true,
  showProgress = true
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = useCallback((files) => {
    const fileArray = Array.from(files);
    
    // Validate files
    const validatedFiles = fileArray.map(file => {
      const validation = validateFile(file, {
        maxSize,
        allowedTypes,
        allowedExtensions
      });
      
      return {
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        validation,
        status: validation.isValid ? 'pending' : 'error',
        progress: 0,
        result: null,
        error: validation.errors.join(', ')
      };
    });

    setUploads(prev => [...prev, ...validatedFiles]);

    // Start uploading valid files
    const validFiles = validatedFiles.filter(f => f.validation.isValid);
    if (validFiles.length > 0) {
      startUpload(validFiles);
    }
  }, [maxSize, allowedTypes, allowedExtensions]);

  // Start upload process
  const startUpload = useCallback(async (filesToUpload) => {
    const uploadOptions = {
      category,
      folder,
      optimization,
      onProgress: (file, progress, current, total) => {
        setUploads(prev => prev.map(upload => {
          if (upload.file === file) {
            return { ...upload, progress, status: 'uploading' };
          }
          return upload;
        }));
      },
      onFileComplete: (file, result, current, total) => {
        setUploads(prev => prev.map(upload => {
          if (upload.file === file) {
            if (result.error) {
              return { 
                ...upload, 
                status: 'error', 
                error: result.error,
                progress: 0
              };
            } else {
              return { 
                ...upload, 
                status: 'completed', 
                result: result.data,
                progress: 100
              };
            }
          }
          return upload;
        }));

        // Call completion callback
        if (result.error) {
          onUploadError?.(file, result.error);
        } else {
          onUploadComplete?.(file, result.data);
        }
      }
    };

    try {
      if (multiple) {
        await uploadMultipleFiles(filesToUpload.map(f => f.file), uploadOptions);
      } else {
        const file = filesToUpload[0];
        setUploads(prev => prev.map(upload => {
          if (upload.id === file.id) {
            return { ...upload, status: 'uploading' };
          }
          return upload;
        }));

        const result = await uploadFile(file.file, {
          ...uploadOptions,
          onProgress: (progress) => {
            setUploads(prev => prev.map(upload => {
              if (upload.id === file.id) {
                return { ...upload, progress };
              }
              return upload;
            }));
          }
        });

        setUploads(prev => prev.map(upload => {
          if (upload.id === file.id) {
            return { 
              ...upload, 
              status: 'completed', 
              result: result.data,
              progress: 100
            };
          }
          return upload;
        }));

        onUploadComplete?.(file.file, result.data);
      }
    } catch (error) {
      console.error('Upload error:', error);
      filesToUpload.forEach(file => {
        setUploads(prev => prev.map(upload => {
          if (upload.id === file.id) {
            return { 
              ...upload, 
              status: 'error', 
              error: error.message,
              progress: 0
            };
          }
          return upload;
        }));
        onUploadError?.(file.file, error.message);
      });
    }
  }, [category, folder, optimization, multiple, onUploadComplete, onUploadError]);

  // Handle drag and drop
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  }, [disabled, handleFileSelect]);

  // Handle click to select files
  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle file input change
  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelect]);

  // Remove upload
  const removeUpload = useCallback((uploadId) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
  }, []);

  // Retry upload
  const retryUpload = useCallback((uploadId) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (upload && upload.validation.isValid) {
      setUploads(prev => prev.map(u => 
        u.id === uploadId 
          ? { ...u, status: 'pending', progress: 0, error: null }
          : u
      ));
      startUpload([upload]);
    }
  }, [uploads, startUpload]);

  // Clear all uploads
  const clearUploads = useCallback(() => {
    setUploads([]);
  }, []);

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <Loader className="w-4 h-4 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  // Get file icon
  const getFileIcon = (file) => {
    const category = getFileCategory(file);
    switch (category) {
      case 'image':
        return <Image className="w-8 h-8 text-primary" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className={`cloudinary-upload ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-primary-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {children || (
          <div className="space-y-2">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-gray-500">
                {multiple ? 'Multiple files supported' : 'Single file only'} • Max {formatFileSize(maxSize)}
              </p>
              {allowedExtensions.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Allowed: {allowedExtensions.join(', ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Upload List */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-gray-700">
              Uploads ({uploads.length})
            </h4>
            <button
              onClick={clearUploads}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {showPreview && upload.result?.url && getFileCategory(upload.file) === 'image' ? (
                    <img
                      src={createPreviewUrl(upload.result.url, { width: 40, height: 40 })}
                      alt={upload.file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    getFileIcon(upload.file)
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {upload.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(upload.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {showProgress && upload.status === 'uploading' && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div
                          className="bg-primary-500 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${upload.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {Math.round(upload.progress)}%
                      </p>
                    </div>
                  )}

                  {/* Error Message */}
                  {upload.status === 'error' && upload.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {upload.error}
                    </p>
                  )}

                  {/* Success Message */}
                  {upload.status === 'completed' && upload.result && (
                    <p className="text-xs text-green-600 mt-1">
                      Uploaded successfully
                    </p>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="flex items-center space-x-2">
                  {getStatusIcon(upload.status)}
                  
                  {upload.status === 'error' && (
                    <button
                      onClick={() => retryUpload(upload.id)}
                      className="text-xs text-primary hover:text-blue-800"
                    >
                      Retry
                    </button>
                  )}
                  
                  <button
                    onClick={() => removeUpload(upload.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudinaryUpload;