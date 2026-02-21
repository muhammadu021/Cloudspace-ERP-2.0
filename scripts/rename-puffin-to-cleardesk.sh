#!/bin/bash

# Script to rename all "Puffin" references to "ClearDesk"
# This script handles case-sensitive replacements

echo "🔄 Renaming Puffin to ClearDesk across the project..."
echo "=================================================="

# Function to replace in files
replace_in_files() {
    local pattern=$1
    local replacement=$2
    local file_types=$3
    
    echo "Replacing '$pattern' with '$replacement'..."
    
    # Use find and sed for replacement
    find . -type f \( $file_types \) -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" -exec sed -i.bak "s/$pattern/$replacement/g" {} \;
    
    # Remove backup files
    find . -name "*.bak" -type f -delete
}

# Replace in different contexts
echo ""
echo "1. Replacing 'Puffin ERP' with 'ClearDesk ERP'..."
replace_in_files "Puffin ERP" "ClearDesk ERP" "-name '*.js' -o -name '*.jsx' -o -name '*.md' -o -name '*.html' -o -name '*.json'"

echo "2. Replacing 'Puffin Group' with 'ClearDesk'"...
replace_in_files "Puffin Group" "ClearDesk" "-name '*.js' -o -name '*.jsx' -o -name '*.md' -o -name '*.html'"

echo "3. Replacing 'puffin-erp' with 'cleardesk-erp'..."
replace_in_files "puffin-erp" "cleardesk-erp" "-name '*.js' -o -name '*.jsx' -o -name '*.json' -o -name '*.md'"

echo "4. Replacing 'puffin_erp' with 'cleardesk_erp'..."
replace_in_files "puffin_erp" "cleardesk_erp" "-name '*.js' -o -name '*.jsx' -o -name '*.env' -o -name '*.md' -o -name '*.sql'"

echo "5. Replacing 'puffingroup.com' with 'cleardesk.com'..."
replace_in_files "puffingroup.com" "cleardesk.com" "-name '*.js' -o -name '*.jsx' -o -name '*.md' -o -name '*.html'"

echo "6. Replacing 'puffingroupltd.com' with 'cleardesk.com'..."
replace_in_files "puffingroupltd.com" "cleardesk.com" "-name '*.js' -o -name '*.jsx' -o -name '*.md'"

echo "7. Replacing 'erppuffin.netlify.app' with 'erpcleardesk.netlify.app'..."
replace_in_files "erppuffin.netlify.app" "erpcleardesk.netlify.app" "-name '*.js' -o -name '*.jsx'"

echo "8. Replacing folder paths 'puffin/' with 'cleardesk/'..."
replace_in_files "puffin/" "cleardesk/" "-name '*.js' -o -name '*.jsx'"

echo "9. Replacing 'Puffin' (standalone) with 'ClearDesk'..."
replace_in_files "\\bPuffin\\b" "ClearDesk" "-name '*.md' -o -name '*.html'"

echo "10. Replacing database/file references..."
replace_in_files "puffin" "cleardesk" "-name '*.env'"

echo ""
echo "✅ Replacement complete!"
echo ""
echo "📋 Summary of changes:"
echo "  - Puffin ERP → ClearDesk ERP"
echo "  - Puffin Group → ClearDesk"
echo "  - puffin-erp → cleardesk-erp"
echo "  - puffin_erp → cleardesk_erp"
echo "  - puffingroup.com → cleardesk.com"
echo "  - puffingroupltd.com → cleardesk.com"
echo "  - erppuffin.netlify.app → erpcleardesk.netlify.app"
echo "  - puffin/ (folders) → cleardesk/"
echo ""
echo "⚠️  IMPORTANT: Review the changes before committing!"
echo "⚠️  You may need to:"
echo "  1. Rename database files manually"
echo "  2. Update .env file"
echo "  3. Update any hardcoded paths"
echo "  4. Test the application"
echo ""
