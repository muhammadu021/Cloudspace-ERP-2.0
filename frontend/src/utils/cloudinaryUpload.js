/**
 * Frontend utility for handling file uploads with Cloudinary integration
 */

// API base URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5050/api";

/**
 * Upload a single file to the server (which will upload to Cloudinary)
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadFile = async (file, options = {}) => {
  const {
    endpoint = "/upload/file",
    category = "general",
    folder = "cleardesk/uploads",
    optimization = true,
    onProgress = null,
  } = options;

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    formData.append("folder", folder);
    formData.append("optimization", optimization);

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Handle progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (parseError) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.message || "Upload failed"));
          } catch (parseError) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      // Handle timeout
      xhr.addEventListener("timeout", () => {
        reject(new Error("Upload timeout"));
      });

      // Configure and send request
      xhr.timeout = 300000; // 5 minutes
      xhr.open("POST", `${API_BASE_URL}${endpoint}`);

      // Add auth token if available
      const token = localStorage.getItem("token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Upload preparation failed: ${error.message}`);
  }
};

/**
 * Upload multiple files
 * @param {FileList|Array} files - Files to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleFiles = async (files, options = {}) => {
  const { concurrent = 3, onProgress = null, onFileComplete = null } = options;

  const fileArray = Array.from(files);
  const results = [];
  let completed = 0;

  // Process files in batches
  for (let i = 0; i < fileArray.length; i += concurrent) {
    const batch = fileArray.slice(i, i + concurrent);

    const batchPromises = batch.map(async (file, index) => {
      try {
        const fileOptions = {
          ...options,
          onProgress: onProgress
            ? (progress) => {
                onProgress(file, progress, completed + index, fileArray.length);
              }
            : null,
        };

        const result = await uploadFile(file, fileOptions);

        if (onFileComplete) {
          onFileComplete(file, result, completed + index + 1, fileArray.length);
        }

        return { success: true, file, result };
      } catch (error) {
        if (onFileComplete) {
          onFileComplete(
            file,
            { error: error.message },
            completed + index + 1,
            fileArray.length
          );
        }
        return { success: false, file, error: error.message };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map((r) => r.value || r.reason));
    completed += batch.length;
  }

  return results;
};

/**
 * Upload document with metadata
 * @param {File} file - Document file
 * @param {Object} metadata - Document metadata
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadDocument = async (file, metadata = {}, options = {}) => {
  const { endpoint = "/documents", onProgress = null } = options;

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Add metadata
    Object.keys(metadata).forEach((key) => {
      if (metadata[key] !== null && metadata[key] !== undefined) {
        if (typeof metadata[key] === "object") {
          formData.append(key, JSON.stringify(metadata[key]));
        } else {
          formData.append(key, metadata[key]);
        }
      }
    });

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Handle progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (parseError) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(
              new Error(errorResponse.message || "Document upload failed")
            );
          } catch (parseError) {
            reject(
              new Error(`Document upload failed with status ${xhr.status}`)
            );
          }
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during document upload"));
      });

      // Configure and send request
      xhr.timeout = 300000; // 5 minutes
      xhr.open("POST", `${API_BASE_URL}${endpoint}`);

      // Add auth token if available
      const token = localStorage.getItem("token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(`Document upload preparation failed: ${error.message}`);
  }
};

/**
 * Upload employee profile image
 * @param {number} employeeId - Employee ID
 * @param {File} file - Image file
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadProfileImage = async (employeeId, file, options = {}) => {
  const { onProgress = null } = options;

  return uploadFile(file, {
    endpoint: `/employees/${employeeId}/profile-image`,
    category: "profile",
    folder: "cleardesk/employees/avatars",
    optimization: true,
    onProgress,
  });
};

/**
 * Upload employee document
 * @param {number} employeeId - Employee ID
 * @param {File} file - Document file
 * @param {Object} metadata - Document metadata
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadEmployeeDocument = async (
  employeeId,
  file,
  metadata = {},
  options = {}
) => {
  const { onProgress = null } = options;

  try {
    const formData = new FormData();
    formData.append("document", file);

    // Add metadata
    Object.keys(metadata).forEach((key) => {
      if (metadata[key] !== null && metadata[key] !== undefined) {
        formData.append(key, metadata[key]);
      }
    });

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      // Handle progress
      if (onProgress) {
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (parseError) {
            reject(new Error("Failed to parse response"));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(
              new Error(
                errorResponse.message || "Employee document upload failed"
              )
            );
          } catch (parseError) {
            reject(
              new Error(
                `Employee document upload failed with status ${xhr.status}`
              )
            );
          }
        }
      });

      // Handle errors
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during employee document upload"));
      });

      // Configure and send request
      xhr.timeout = 300000; // 5 minutes
      xhr.open("POST", `${API_BASE_URL}/employees/${employeeId}/documents`);

      // Add auth token if available
      const token = localStorage.getItem("token");
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  } catch (error) {
    throw new Error(
      `Employee document upload preparation failed: ${error.message}`
    );
  }
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {Object} constraints - Validation constraints
 * @returns {Object} - Validation result
 */
export const validateFile = (file, constraints = {}) => {
  const {
    maxSize = 100 * 1024 * 1024, // 100MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = constraints;

  const errors = [];

  // Check file size
  if (file.size > maxSize) {
    errors.push(
      `File size (${formatFileSize(
        file.size
      )}) exceeds maximum allowed size (${formatFileSize(maxSize)})`
    );
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split(".").pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      errors.push(`File extension .${extension} is not allowed`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file type category
 * @param {File} file - File object
 * @returns {string} - File category
 */
export const getFileCategory = (file) => {
  const type = file.type.toLowerCase();

  if (type.startsWith("image/")) {
    return "image";
  } else if (type.startsWith("video/")) {
    return "video";
  } else if (type.startsWith("audio/")) {
    return "audio";
  } else if (type.includes("pdf")) {
    return "pdf";
  } else if (type.includes("word") || type.includes("document")) {
    return "document";
  } else if (type.includes("sheet") || type.includes("excel")) {
    return "spreadsheet";
  } else if (type.includes("presentation") || type.includes("powerpoint")) {
    return "presentation";
  } else if (type.includes("text")) {
    return "text";
  } else if (
    type.includes("zip") ||
    type.includes("rar") ||
    type.includes("7z")
  ) {
    return "archive";
  } else {
    return "other";
  }
};

/**
 * Create a preview URL for uploaded file
 * @param {string} cloudinaryUrl - Cloudinary URL
 * @param {Object} options - Preview options
 * @returns {string} - Preview URL
 */
export const createPreviewUrl = (cloudinaryUrl, options = {}) => {
  const {
    width = 300,
    height = 200,
    crop = "fill",
    quality = "auto",
    format = "auto",
  } = options;

  if (!cloudinaryUrl || !cloudinaryUrl.includes("cloudinary.com")) {
    return cloudinaryUrl;
  }

  // Extract the public ID and build transformation URL
  const parts = cloudinaryUrl.split("/");
  const uploadIndex = parts.findIndex((part) => part === "upload");

  if (uploadIndex === -1) {
    return cloudinaryUrl;
  }

  const beforeUpload = parts.slice(0, uploadIndex + 1);
  const afterUpload = parts.slice(uploadIndex + 1);

  const transformation = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;

  return [...beforeUpload, transformation, ...afterUpload].join("/");
};

export default {
  uploadFile,
  uploadMultipleFiles,
  uploadDocument,
  uploadProfileImage,
  uploadEmployeeDocument,
  validateFile,
  formatFileSize,
  getFileCategory,
  createPreviewUrl,
};
