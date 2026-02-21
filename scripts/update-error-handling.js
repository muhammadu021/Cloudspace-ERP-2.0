#!/usr/bin/env node

/**
 * Script to update all catch blocks to use proper error handling
 * This script will replace generic error handling with specific error messages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Directories to process
  directories: [
    'backend/controllers',
    'backend/routes', 
    'backend/services',
    'frontend/src/services',
    'frontend/src/modules',
    'frontend/src/pages'
  ],
  
  // File extensions to process
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
  
  // Patterns to replace
  patterns: [
    // Backend patterns
    {
      // Generic console.error + res.status pattern
      search: /catch\s*\(\s*(\w+)\s*\)\s*\{[\s\S]*?console\.error\([^)]*\);\s*res\.status\(\d+\)\.json\(\s*\{\s*success:\s*false,\s*message:\s*['"](.*?)['"],?\s*\}\s*\);/g,
      replace: (match, errorVar, message, operation) => {
        return `catch (${errorVar}) {
    console.error('${operation} error:', ${errorVar});
    const errorMessage = getErrorMessage ? getErrorMessage(${errorVar}) : '${message}';
    res.status(${errorVar}.response?.status || 500).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: ${errorVar}.stack,
        originalError: ${errorVar}.message 
      })
    });`;
      }
    },
    
    // Frontend patterns
    {
      // Generic toast.error pattern
      search: /catch\s*\(\s*(\w+)\s*\)\s*\{[\s\S]*?toast\.error\(\s*['"](.*?)['"][\s\S]*?\);/g,
      replace: (match, errorVar, message) => {
        return `catch (${errorVar}) {
    console.error('Error:', ${errorVar});
    const errorMessage = getErrorMessage ? getErrorMessage(${errorVar}) : '${message}';
    toast.error(errorMessage);`;
      }
    }
  ]
};

/**
 * Get all files recursively from a directory
 */
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      if (config.extensions.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

/**
 * Update error handling in a file
 */
function updateErrorHandling(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;
    
    // Check if file already imports error handling utilities
    const hasErrorHandling = content.includes('getErrorMessage') || 
                            content.includes('useErrorHandler') ||
                            content.includes('handleApiError');
    
    // Add imports if needed
    if (!hasErrorHandling) {
      if (filePath.includes('backend/')) {
        // Backend files - add require at top
        if (!content.includes('getErrorMessage')) {
          const requirePattern = /^(const|import).*?require.*?;$/m;
          const match = content.match(requirePattern);
          if (match) {
            const insertIndex = content.indexOf(match[0]) + match[0].length;
            content = content.slice(0, insertIndex) + 
                     `\nconst { getErrorMessage } = require('../utils/errorHandler');` +
                     content.slice(insertIndex);
            updated = true;
          }
        }
      } else if (filePath.includes('frontend/')) {
        // Frontend files - add import at top
        if (!content.includes('getErrorMessage') && !content.includes('useErrorHandler')) {
          const importPattern = /^import.*?from.*?;$/m;
          const match = content.match(importPattern);
          if (match) {
            const insertIndex = content.indexOf(match[0]) + match[0].length;
            content = content.slice(0, insertIndex) + 
                     `\nimport { getErrorMessage } from '../utils/errorHandler';` +
                     content.slice(insertIndex);
            updated = true;
          }
        }
      }
    }
    
    // Update catch blocks
    const originalContent = content;
    
    // Pattern 1: Backend generic error responses
    content = content.replace(
      /catch\s*\(\s*(\w+)\s*\)\s*\{[\s\S]*?console\.error\([^)]*\);\s*res\.status\((\d+)\)\.json\(\s*\{\s*success:\s*false,\s*message:\s*['"](.*?)['"],?\s*\}\s*\);/g,
      (match, errorVar, statusCode, message) => {
        return `catch (${errorVar}) {
    console.error('Operation error:', ${errorVar});
    const errorMessage = getErrorMessage ? getErrorMessage(${errorVar}) : '${message}';
    res.status(${errorVar}.response?.status || ${statusCode}).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        stack: ${errorVar}.stack,
        originalError: ${errorVar}.message 
      })
    });
  }`;
      }
    );
    
    // Pattern 2: Frontend toast.error patterns
    content = content.replace(
      /catch\s*\(\s*(\w+)\s*\)\s*\{[\s\S]*?toast\.error\(\s*['"](.*?)['"][\s\S]*?\);/g,
      (match, errorVar, message) => {
        return `catch (${errorVar}) {
    console.error('Error:', ${errorVar});
    const errorMessage = getErrorMessage ? getErrorMessage(${errorVar}) : '${message}';
    toast.error(errorMessage);`;
      }
    );
    
    // Pattern 3: Simple console.error + throw patterns
    content = content.replace(
      /catch\s*\(\s*(\w+)\s*\)\s*\{[\s\S]*?console\.error\([^)]*\);\s*throw\s+(\w+);/g,
      (match, errorVar, throwVar) => {
        return `catch (${errorVar}) {
    console.error('Error:', ${errorVar});
    const errorMessage = getErrorMessage ? getErrorMessage(${errorVar}) : ${errorVar}.message || 'An error occurred';
    throw new Error(errorMessage);`;
      }
    );
    
    if (content !== originalContent) {
      updated = true;
    }
    
    // Write updated content
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`⏭️  Skipped: ${filePath} (no changes needed)`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Create error handler utility if it doesn't exist
 */
function createErrorHandlerUtility() {
  const backendUtilPath = 'backend/utils/errorHandler.js';
  const frontendUtilPath = 'frontend/src/utils/errorHandler.js';
  
  // Backend error handler
  if (!fs.existsSync(backendUtilPath)) {
    const backendDir = path.dirname(backendUtilPath);
    if (!fs.existsSync(backendDir)) {
      fs.mkdirSync(backendDir, { recursive: true });
    }
    
    const backendErrorHandler = `/**
 * Backend error handling utility
 */

/**
 * Extract meaningful error message from error object
 * @param {Error|Object} error - The error object
 * @returns {string} - User-friendly error message
 */
const getErrorMessage = (error) => {
  // Handle Sequelize errors
  if (error.name === 'SequelizeValidationError') {
    const errorMessages = error.errors.map(err => {
      const fieldName = formatFieldName(err.path);
      return \`\${fieldName}: \${err.message}\`;
    });
    return errorMessages.length === 1 
      ? errorMessages[0]
      : \`Validation failed for \${errorMessages.length} field(s): \${errorMessages.join(', ')}\`;
  }
  
  if (error.name === 'SequelizeUniqueConstraintError') {
    const field = error.errors?.[0]?.path || 'field';
    const value = error.errors?.[0]?.value;
    const fieldName = formatFieldName(field);
    
    return value 
      ? \`\${fieldName} '\${value}' is already in use. Please choose a different value.\`
      : \`\${fieldName} must be unique\`;
  }
  
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    const field = error.fields?.[0] || 'field';
    const fieldName = formatFieldName(field);
    return \`Invalid \${fieldName}. The referenced record does not exist.\`;
  }
  
  // Handle validation errors
  if (error.response?.status === 400 && error.response?.data?.errors) {
    const errors = error.response.data.errors;
    if (typeof errors === 'object') {
      const errorMessages = Object.entries(errors).map(([field, message]) => {
        const fieldName = formatFieldName(field);
        return \`\${fieldName}: \${message}\`;
      });
      return errorMessages.join(', ');
    }
  }
  
  // Handle HTTP errors
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Handle network errors
  if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
    return 'Network connection failed. Please check your connection and try again.';
  }
  
  // Default message
  return error.message || 'An unexpected error occurred. Please try again.';
};

/**
 * Format field names to be user-friendly
 * @param {string} fieldName - Raw field name
 * @returns {string} - Formatted field name
 */
const formatFieldName = (fieldName) => {
  if (!fieldName) return 'Field';
  
  return fieldName
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .toLowerCase()
    .replace(/^\\w/, c => c.toUpperCase())
    .trim();
};

module.exports = {
  getErrorMessage,
  formatFieldName
};
`;
    
    fs.writeFileSync(backendUtilPath, backendErrorHandler, 'utf8');
    console.log(`✅ Created: ${backendUtilPath}`);
  }
  
  // Frontend error handler already exists, so we don't need to create it
  console.log(`ℹ️  Frontend error handler already exists at: ${frontendUtilPath}`);
}

/**
 * Main execution function
 */
function main() {
  console.log('🚀 Starting error handling update...\n');
  
  // Create error handler utilities
  createErrorHandlerUtility();
  
  let totalFiles = 0;
  let updatedFiles = 0;
  
  // Process each directory
  config.directories.forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`\n📁 Processing directory: ${dir}`);
      const files = getAllFiles(dir);
      
      files.forEach(file => {
        totalFiles++;
        if (updateErrorHandling(file)) {
          updatedFiles++;
        }
      });
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files updated: ${updatedFiles}`);
  console.log(`   Files skipped: ${totalFiles - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log(`\n✅ Error handling update completed successfully!`);
    console.log(`\n📝 Next steps:`);
    console.log(`   1. Review the updated files`);
    console.log(`   2. Test the application`);
    console.log(`   3. Commit the changes`);
  } else {
    console.log(`\nℹ️  No files needed updating.`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateErrorHandling, getAllFiles };