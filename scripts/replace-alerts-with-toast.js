#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  // Directories to search
  searchDirs: [
    'frontend/src/modules',
    'frontend/src/components',
    'frontend/src/utils'
  ],
  
  // File extensions to process
  fileExtensions: ['.js', '.jsx', '.ts', '.tsx'],
  
  // Patterns to replace
  patterns: [
    {
      // Simple alert calls
      search: /alert\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
      replace: (match, message) => {
        // Determine toast type based on message content
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('success') || lowerMessage.includes('created') || 
            lowerMessage.includes('updated') || lowerMessage.includes('sent') ||
            lowerMessage.includes('saved') || lowerMessage.includes('completed')) {
          return `toast.success('${message}')`;
        } else if (lowerMessage.includes('error') || lowerMessage.includes('failed') || 
                   lowerMessage.includes('cannot') || lowerMessage.includes('unable')) {
          return `toast.error('${message}')`;
        } else if (lowerMessage.includes('warning') || lowerMessage.includes('please')) {
          return `toast.warning('${message}')`;
        } else {
          return `toast('${message}')`;
        }
      }
    },
    {
      // Alert calls with template literals
      search: /alert\s*\(\s*`([^`]+)`\s*\)/g,
      replace: (match, message) => {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('success') || lowerMessage.includes('created') || 
            lowerMessage.includes('updated') || lowerMessage.includes('sent') ||
            lowerMessage.includes('saved') || lowerMessage.includes('completed')) {
          return `toast.success(\`${message}\`)`;
        } else if (lowerMessage.includes('error') || lowerMessage.includes('failed') || 
                   lowerMessage.includes('cannot') || lowerMessage.includes('unable')) {
          return `toast.error(\`${message}\`)`;
        } else if (lowerMessage.includes('warning') || lowerMessage.includes('please')) {
          return `toast.warning(\`${message}\`)`;
        } else {
          return `toast(\`${message}\`)`;
        }
      }
    },
    {
      // Alert calls with variables or expressions
      search: /alert\s*\(\s*([^)]+)\s*\)/g,
      replace: (match, expression) => {
        // Skip if it's already a string literal (handled above)
        if (expression.match(/^['"`].*['"`]$/) || expression.match(/^`.*`$/)) {
          return match;
        }
        // For variables and expressions, use generic toast
        return `toast(${expression})`;
      }
    }
  ],
  
  // Import patterns to add
  importPatterns: [
    {
      // Check if toast import already exists
      check: /import\s+.*toast.*from\s+['"]react-hot-toast['"]/,
      // Add import if not present
      add: "import { toast } from 'react-hot-toast';"
    }
  ]
};

// Utility functions
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file);
      if (config.fileExtensions.includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

function hasAlertCalls(content) {
  return /alert\s*\(/.test(content);
}

function hasToastImport(content) {
  return config.importPatterns[0].check.test(content);
}

function addToastImport(content) {
  // Find the last import statement
  const importLines = content.split('\n');
  let lastImportIndex = -1;
  
  for (let i = 0; i < importLines.length; i++) {
    if (importLines[i].trim().startsWith('import ') && !importLines[i].includes('//')) {
      lastImportIndex = i;
    }
  }
  
  if (lastImportIndex >= 0) {
    // Insert after the last import
    importLines.splice(lastImportIndex + 1, 0, config.importPatterns[0].add);
    return importLines.join('\n');
  } else {
    // No imports found, add at the beginning
    return config.importPatterns[0].add + '\n' + content;
  }
}

function replaceAlerts(content) {
  let modifiedContent = content;
  
  config.patterns.forEach(pattern => {
    if (typeof pattern.replace === 'function') {
      modifiedContent = modifiedContent.replace(pattern.search, pattern.replace);
    } else {
      modifiedContent = modifiedContent.replace(pattern.search, pattern.replace);
    }
  });
  
  return modifiedContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if no alert calls
    if (!hasAlertCalls(content)) {
      return { processed: false, reason: 'No alert calls found' };
    }
    
    let modifiedContent = content;
    
    // Replace alert calls
    modifiedContent = replaceAlerts(modifiedContent);
    
    // Add toast import if needed and not already present
    if (!hasToastImport(modifiedContent)) {
      modifiedContent = addToastImport(modifiedContent);
    }
    
    // Write back to file
    fs.writeFileSync(filePath, modifiedContent, 'utf8');
    
    return { 
      processed: true, 
      changes: content !== modifiedContent,
      alertCount: (content.match(/alert\s*\(/g) || []).length
    };
  } catch (error) {
    return { processed: false, reason: `Error: ${error.message}` };
  }
}

// Main execution
function main() {
  console.log('🔄 Starting alert to toast replacement...\n');
  
  const allFiles = [];
  
  // Collect all files from search directories
  config.searchDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = getAllFiles(dir);
      allFiles.push(...files);
      console.log(`📁 Found ${files.length} files in ${dir}`);
    } else {
      console.log(`⚠️  Directory not found: ${dir}`);
    }
  });
  
  console.log(`\n📊 Total files to process: ${allFiles.length}\n`);
  
  let processedCount = 0;
  let changedCount = 0;
  let totalAlerts = 0;
  const results = [];
  
  // Process each file
  allFiles.forEach(filePath => {
    const result = processFile(filePath);
    
    if (result.processed) {
      processedCount++;
      if (result.changes) {
        changedCount++;
        totalAlerts += result.alertCount || 0;
        console.log(`✅ ${filePath} - Replaced ${result.alertCount} alert(s)`);
        results.push({
          file: filePath,
          alerts: result.alertCount
        });
      }
    } else if (result.reason !== 'No alert calls found') {
      console.log(`❌ ${filePath} - ${result.reason}`);
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 REPLACEMENT SUMMARY');
  console.log('='.repeat(60));
  console.log(`📁 Total files scanned: ${allFiles.length}`);
  console.log(`🔄 Files processed: ${processedCount}`);
  console.log(`✏️  Files modified: ${changedCount}`);
  console.log(`🚨 Total alerts replaced: ${totalAlerts}`);
  
  if (results.length > 0) {
    console.log('\n📝 Modified files:');
    results.forEach(result => {
      console.log(`   ${result.file} (${result.alerts} alerts)`);
    });
  }
  
  console.log('\n✨ Alert to toast replacement completed!');
  
  if (changedCount > 0) {
    console.log('\n💡 Next steps:');
    console.log('   1. Review the changes to ensure they look correct');
    console.log('   2. Test the application to verify toast notifications work');
    console.log('   3. Make sure react-hot-toast is properly configured in your app');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { processFile, replaceAlerts, addToastImport };