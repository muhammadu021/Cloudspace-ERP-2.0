#!/usr/bin/env node

/**
 * Script to update frontend service files to use improved error handling
 */

const fs = require('fs');
const path = require('path');

// List of service files to update
const serviceFiles = [
  'frontend/src/services/communicationService.js',
  'frontend/src/services/employeeService.js',
  'frontend/src/services/taskService.js',
  'frontend/src/services/notificationService.js',
  'frontend/src/services/leaveService.js',
  'frontend/src/services/documentService.js',
  'frontend/src/services/documentWorkflowService.js',
  'frontend/src/services/financeService.js',
  'frontend/src/services/attendanceService.js',
  'frontend/src/services/documentSignatureService.js',
  'frontend/src/services/templatesService.js',
  'frontend/src/services/projectDetailService.js',
  'frontend/src/services/recruitmentService.js',
  'frontend/src/services/departmentService.js',
  'frontend/src/services/hrDocumentService.js',
  'frontend/src/services/payrollService.js',
  'frontend/src/services/projectsService.js'
];

/**
 * Update a service file to use improved error handling
 */
function updateServiceFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Add import for error handler if not present
    if (!content.includes('getErrorMessage')) {
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

    // Pattern 1: Replace simple throw error patterns
    const originalContent = content;
    
    // Replace: throw error; with: throw new Error(getErrorMessage(error));
    content = content.replace(
      /catch\s*\(\s*(\w+)\s*\)\s*\{[\s\S]*?throw\s+\1;/g,
      (match, errorVar) => {
        return `catch (${errorVar}) {
      console.error('Service error:', ${errorVar});
      const errorMessage = getErrorMessage(${errorVar});
      throw new Error(errorMessage);`;
      }
    );

    // Pattern 2: Replace console.error + throw patterns
    content = content.replace(
      /catch\s*\(\s*(\w+)\s*\)\s*\{[\s\S]*?console\.error\([^)]*\);\s*throw\s+(\w+);/g,
      (match, errorVar, throwVar) => {
        return `catch (${errorVar}) {
      console.error('Service error:', ${errorVar});
      const errorMessage = getErrorMessage(${errorVar});
      throw new Error(errorMessage);`;
      }
    );

    // Pattern 3: Replace console.error + throw new Error patterns
    content = content.replace(
      /catch\s*\(\s*(\w+)\s*\)\s*\{[\s\S]*?console\.error\([^)]*\);\s*throw\s+new\s+Error\([^)]*\);/g,
      (match, errorVar) => {
        return `catch (${errorVar}) {
      console.error('Service error:', ${errorVar});
      const errorMessage = getErrorMessage(${errorVar});
      throw new Error(errorMessage);`;
      }
    );

    if (content !== originalContent) {
      updated = true;
    }

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
 * Main execution function
 */
function main() {
  console.log('🚀 Starting frontend service files update...\n');
  
  let totalFiles = 0;
  let updatedFiles = 0;

  serviceFiles.forEach(filePath => {
    totalFiles++;
    if (updateServiceFile(filePath)) {
      updatedFiles++;
    }
  });

  console.log(`\n📊 Summary:`);
  console.log(`   Total files processed: ${totalFiles}`);
  console.log(`   Files updated: ${updatedFiles}`);
  console.log(`   Files skipped: ${totalFiles - updatedFiles}`);
  
  if (updatedFiles > 0) {
    console.log(`\n✅ Frontend services update completed successfully!`);
  } else {
    console.log(`\nℹ️  No files needed updating.`);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateServiceFile };