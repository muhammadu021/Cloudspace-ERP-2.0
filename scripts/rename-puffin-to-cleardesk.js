#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔄 Renaming Puffin to ClearDesk across the project...');
console.log('==================================================\n');

// Replacement mappings (order matters - more specific first)
const replacements = [
  { from: /Puffin ERP/g, to: 'ClearDesk ERP', desc: 'Puffin ERP → ClearDesk ERP' },
  { from: /Puffin Group/g, to: 'ClearDesk', desc: 'Puffin Group → ClearDesk' },
  { from: /puffin-erp/g, to: 'cleardesk-erp', desc: 'puffin-erp → cleardesk-erp' },
  { from: /puffin_erp/g, to: 'cleardesk_erp', desc: 'puffin_erp → cleardesk_erp' },
  { from: /puffingroup\.com/g, to: 'cleardesk.com', desc: 'puffingroup.com → cleardesk.com' },
  { from: /puffingroupltd\.com/g, to: 'cleardesk.com', desc: 'puffingroupltd.com → cleardesk.com' },
  { from: /erppuffin\.netlify\.app/g, to: 'erpcleardesk.netlify.app', desc: 'erppuffin.netlify.app → erpcleardesk.netlify.app' },
  { from: /'puffin\//g, to: "'cleardesk/", desc: "Cloudinary folder paths" },
  { from: /`puffin\//g, to: "`cleardesk/", desc: "Template literal paths" },
  { from: /\"puffin\//g, to: '"cleardesk/', desc: "Double-quoted paths" },
  { from: /puffin_feedback/g, to: 'company_feedback', desc: 'puffin_feedback → company_feedback' },
  { from: /q4a_puffin_goals/g, to: 'q4a_company_goals', desc: 'q4a_puffin_goals → q4a_company_goals' },
  { from: /q4b_puffin_accomplishment/g, to: 'q4b_company_accomplishment', desc: 'q4b_puffin_accomplishment → q4b_company_accomplishment' },
  { from: /q4c_puffin_contributions/g, to: 'q4c_company_contributions', desc: 'q4c_puffin_contributions → q4c_company_contributions' },
  { from: /q20_recommend_puffin/g, to: 'q20_recommend_company', desc: 'q20_recommend_puffin → q20_recommend_company' },
  { from: /\bPuffin\b/g, to: 'ClearDesk', desc: 'Puffin (standalone) → ClearDesk' },
];

// File extensions to process
const extensions = ['.js', '.jsx', '.json', '.md', '.html', '.css', '.env', '.sql', '.txt'];

// Directories to skip
const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];

// Files to skip
const skipFiles = ['package-lock.json', 'rename-puffin-to-cleardesk.js', 'rename-puffin-to-cleardesk.sh'];

let filesProcessed = 0;
let filesModified = 0;
let totalReplacements = 0;

function shouldProcessFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(filePath);
  
  // Skip if in skip list
  if (skipFiles.includes(fileName)) return false;
  
  // Skip if not in allowed extensions
  if (!extensions.includes(ext)) return false;
  
  // Skip if in skip directories
  const parts = filePath.split(path.sep);
  for (const skipDir of skipDirs) {
    if (parts.includes(skipDir)) return false;
  }
  
  return true;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let fileReplacements = 0;
    
    // Apply all replacements
    for (const { from, to } of replacements) {
      const matches = content.match(from);
      if (matches) {
        content = content.replace(from, to);
        modified = true;
        fileReplacements += matches.length;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesModified++;
      totalReplacements += fileReplacements;
      console.log(`✓ ${filePath} (${fileReplacements} replacements)`);
    }
    
    filesProcessed++;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip directories in skip list
        if (!skipDirs.includes(file)) {
          walkDirectory(filePath);
        }
      } else if (stat.isFile()) {
        if (shouldProcessFile(filePath)) {
          processFile(filePath);
        }
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error.message);
  }
}

// Start processing from project root
const projectRoot = path.resolve(__dirname, '..');
console.log(`Starting from: ${projectRoot}\n`);

walkDirectory(projectRoot);

console.log('\n' + '='.repeat(50));
console.log('✅ Replacement complete!\n');
console.log('📊 Statistics:');
console.log(`  Files processed: ${filesProcessed}`);
console.log(`  Files modified: ${filesModified}`);
console.log(`  Total replacements: ${totalReplacements}\n`);

console.log('📋 Replacements made:');
replacements.forEach(({ desc }) => {
  console.log(`  - ${desc}`);
});

console.log('\n⚠️  IMPORTANT NEXT STEPS:');
console.log('  1. Review the changes with: git diff');
console.log('  2. Rename database files if needed:');
console.log('     - backend/database/puffin_erp.sqlite → cleardesk_erp.sqlite');
console.log('  3. Update .env file manually if needed');
console.log('  4. Test the application thoroughly');
console.log('  5. Commit the changes: git add . && git commit -m "rebrand: Rename Puffin to ClearDesk"');
console.log('');
