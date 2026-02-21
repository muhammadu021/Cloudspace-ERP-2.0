#!/usr/bin/env node

/**
 * Script to help identify and update loading spinners to use ClearDesk components
 * 
 * Usage:
 * node scripts/update-loading-spinners.js [--dry-run] [--path=frontend/src/modules/auth]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_SEARCH_PATH = 'frontend/src';
const SPINNER_PATTERNS = [
  {
    pattern: /className="[^"]*animate-spin[^"]*"/g,
    description: 'animate-spin classes'
  },
  {
    pattern: /<div className="animate-spin rounded-full h-\d+ w-\d+ border-b-2 border-[^"]+"><\/div>/g,
    description: 'Standard spinner divs'
  },
  {
    pattern: /Loading\.\.\.|loading\.\.\./g,
    description: 'Loading text patterns'
  }
];

const REPLACEMENT_SUGGESTIONS = {
  'animate-spin rounded-full h-4 w-4': 'PuffinLoader size="xs"',
  'animate-spin rounded-full h-6 w-6': 'PuffinLoader size="xs"',
  'animate-spin rounded-full h-8 w-8': 'PuffinLoader size="sm"',
  'animate-spin rounded-full h-12 w-12': 'PuffinLoader size="md"',
  'animate-spin rounded-full h-16 w-16': 'PuffinLoader size="lg"',
  'animate-spin rounded-full h-20 w-20': 'PuffinLoader size="xl"',
  'animate-spin rounded-full h-32 w-32': 'PuffinLoader size="xl"'
};

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const pathArg = args.find(arg => arg.startsWith('--path='));
const searchPath = pathArg ? pathArg.split('=')[1] : DEFAULT_SEARCH_PATH;

console.log('🔍 ClearDesk Loading Spinner Update Tool');
console.log('=====================================');
console.log(`Search path: ${searchPath}`);
console.log(`Mode: ${isDryRun ? 'DRY RUN (no changes)' : 'UPDATE FILES'}`);
console.log('');

// Results tracking
let results = {
  filesScanned: 0,
  filesWithSpinners: 0,
  totalMatches: 0,
  suggestions: []
};

/**
 * Recursively scan directory for JS/JSX files
 */
function scanDirectory(dirPath) {
  const files = [];
  
  function scan(currentPath) {
    const items = fs.readdirSync(currentPath);
    
    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        scan(fullPath);
      } else if (stat.isFile() && /\.(jsx?|tsx?)$/.test(item)) {
        files.push(fullPath);
      }
    }
  }
  
  scan(dirPath);
  return files;
}

/**
 * Analyze a file for spinner patterns
 */
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];
  
  for (const { pattern, description } of SPINNER_PATTERNS) {
    const found = content.match(pattern);
    if (found) {
      matches.push({
        pattern: description,
        matches: found,
        count: found.length
      });
    }
  }
  
  return {
    filePath,
    content,
    matches,
    hasMatches: matches.length > 0
  };
}

/**
 * Generate suggestions for a file
 */
function generateSuggestions(fileAnalysis) {
  const suggestions = [];
  const { filePath, content, matches } = fileAnalysis;
  
  // Check if PuffinLoader is already imported
  const hasImport = content.includes('PuffinLoader') || content.includes('PuffinSpinner');
  
  if (!hasImport && matches.length > 0) {
    suggestions.push({
      type: 'import',
      suggestion: "Add import: import { PuffinLoader } from '../ui/PuffinLoader';",
      line: 1
    });
  }
  
  // Analyze specific patterns
  for (const match of matches) {
    for (const found of match.matches) {
      // Try to suggest specific replacements
      let suggestion = null;
      
      for (const [pattern, replacement] of Object.entries(REPLACEMENT_SUGGESTIONS)) {
        if (found.includes(pattern)) {
          suggestion = `Replace "${found}" with <${replacement} />`;
          break;
        }
      }
      
      if (!suggestion) {
        suggestion = `Consider replacing "${found}" with PuffinLoader component`;
      }
      
      suggestions.push({
        type: 'replacement',
        suggestion,
        original: found
      });
    }
  }
  
  return suggestions;
}

/**
 * Main execution
 */
function main() {
  try {
    // Check if search path exists
    if (!fs.existsSync(searchPath)) {
      console.error(`❌ Path does not exist: ${searchPath}`);
      process.exit(1);
    }
    
    // Scan for files
    console.log('📁 Scanning for JavaScript/TypeScript files...');
    const files = scanDirectory(searchPath);
    console.log(`Found ${files.length} files to analyze\\n`);
    
    // Analyze each file
    for (const filePath of files) {
      results.filesScanned++;
      
      const analysis = analyzeFile(filePath);
      
      if (analysis.hasMatches) {
        results.filesWithSpinners++;
        results.totalMatches += analysis.matches.reduce((sum, m) => sum + m.count, 0);
        
        console.log(`🎯 ${filePath}`);
        
        for (const match of analysis.matches) {
          console.log(`   ${match.pattern}: ${match.count} matches`);
        }
        
        const suggestions = generateSuggestions(analysis);
        results.suggestions.push({
          filePath,
          suggestions
        });
        
        console.log('   Suggestions:');
        for (const suggestion of suggestions) {
          console.log(`   → ${suggestion.suggestion}`);
        }
        console.log('');
      }
    }
    
    // Summary
    console.log('📊 Summary');
    console.log('==========');
    console.log(`Files scanned: ${results.filesScanned}`);
    console.log(`Files with spinners: ${results.filesWithSpinners}`);
    console.log(`Total spinner matches: ${results.totalMatches}`);
    console.log('');
    
    if (results.filesWithSpinners === 0) {
      console.log('✅ No loading spinners found that need updating!');
    } else {
      console.log('📋 Next Steps:');
      console.log('1. Review the suggestions above');
      console.log('2. Add PuffinLoader imports where needed');
      console.log('3. Replace spinner divs with PuffinLoader components');
      console.log('4. Test the loading states');
      console.log('');
      console.log('💡 Tip: Use the PUFFIN_LOADING_GUIDE.md for detailed examples');
    }
    
    // Generate report file
    if (!isDryRun && results.filesWithSpinners > 0) {
      const reportPath = 'spinner-update-report.json';
      fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
      console.log(`📄 Detailed report saved to: ${reportPath}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();