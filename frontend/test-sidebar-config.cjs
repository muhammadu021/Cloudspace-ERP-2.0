// Test script to verify sidebar configuration
// Run with: node frontend/test-sidebar-config.js

// Mock the Lucide icons
const mockIcon = () => {};
const LayoutDashboard = mockIcon;
const BarChart3 = mockIcon;
const ShoppingCart = mockIcon;
const ShoppingBag = mockIcon;
const Truck = mockIcon;
const FolderKanban = mockIcon;
const FolderOpen = mockIcon;
const DollarSign = mockIcon;
const Wallet = mockIcon;
const Receipt = mockIcon;
const Users = mockIcon;
const UserPlus = mockIcon;
const GraduationCap = mockIcon;
const Heart = mockIcon;
const MessageSquare = mockIcon;
const Briefcase = mockIcon;
const Settings = mockIcon;
const UserCheck = mockIcon;
const Mail = mockIcon;
const HeadphonesIcon = mockIcon;
const FileCheck = mockIcon;
const Wrench = mockIcon;
const Package = mockIcon;
const Share2 = mockIcon;
const FileText = mockIcon;

// Mock the imports
global.LayoutDashboard = LayoutDashboard;
global.BarChart3 = BarChart3;
global.ShoppingCart = ShoppingCart;
global.ShoppingBag = ShoppingBag;
global.Truck = Truck;
global.FolderKanban = FolderKanban;
global.FolderOpen = FolderOpen;
global.DollarSign = DollarSign;
global.Wallet = Wallet;
global.Receipt = Receipt;
global.Users = Users;
global.UserPlus = UserPlus;
global.GraduationCap = GraduationCap;
global.Heart = Heart;
global.MessageSquare = MessageSquare;
global.Briefcase = Briefcase;
global.Settings = Settings;
global.UserCheck = UserCheck;
global.Mail = Mail;
global.HeadphonesIcon = HeadphonesIcon;
global.FileCheck = FileCheck;
global.Wrench = Wrench;
global.Package = Package;
global.Share2 = Share2;
global.FileText = FileText;

// Load the config (we'll need to use require and handle ES6 exports)
const fs = require('fs');
const path = require('path');

// Read the config file
const configPath = path.join(__dirname, 'src/config/sidebarConfig.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace ES6 exports with CommonJS
configContent = configContent.replace(/export const/g, 'const');
configContent = configContent.replace(/export default/g, 'module.exports =');

// Add module.exports at the end for the functions
configContent += `
module.exports = {
  DESK_MODULES,
  DESK_MODULES_ARRAY,
  SIDEBAR_MODULES_ARRAY,
  SIDEBAR_MODULES,
  getSidebarModulesForDynamicSidebar,
  MODULE_STATUS
};
`;

// Write to temp file and require it
const tempPath = path.join(__dirname, 'temp-sidebar-config.js');
fs.writeFileSync(tempPath, configContent);

try {
  const config = require(tempPath);
  
  console.log('🔍 Testing Sidebar Configuration');
  console.log('='.repeat(60));
  
  const allModules = config.getSidebarModulesForDynamicSidebar();
  
  console.log(`\n📊 Total modules in config: ${Object.keys(allModules).length}`);
  console.log('\n📋 Available Module IDs:');
  console.log('─'.repeat(60));
  
  Object.keys(allModules).forEach((moduleId, index) => {
    const module = allModules[moduleId];
    console.log(`${String(index + 1).padStart(2, ' ')}. ${moduleId.padEnd(25, ' ')} - ${module.name}`);
  });
  
  console.log('─'.repeat(60));
  
  // Test with the module IDs from the database
  const dbModuleIds = [
    'my-desk', 'sales-desk', 'purchase-desk', 'procurement-desk',
    'project-desk', 'finance-desk', 'payroll-desk', 'expense-desk',
    'hr-desk', 'recruitment-desk', 'school-desk', 'health-desk',
    'collaboration-desk', 'office-desk', 'admin-desk', 'visitor-desk',
    'mail-desk', 'support-desk', 'compliance-desk', 'inventory-desk',
    'dashboard'
  ];
  
  console.log('\n🔍 Checking if all database module IDs exist in config:');
  console.log('─'.repeat(60));
  
  let foundCount = 0;
  let missingCount = 0;
  
  dbModuleIds.forEach(moduleId => {
    const exists = allModules[moduleId] !== undefined;
    if (exists) {
      foundCount++;
      console.log(`✅ ${moduleId.padEnd(25, ' ')} - Found`);
    } else {
      missingCount++;
      console.log(`❌ ${moduleId.padEnd(25, ' ')} - MISSING!`);
    }
  });
  
  console.log('─'.repeat(60));
  console.log(`\n📈 Summary:`);
  console.log(`   Found: ${foundCount}/${dbModuleIds.length}`);
  console.log(`   Missing: ${missingCount}/${dbModuleIds.length}`);
  
  if (missingCount === 0) {
    console.log('\n✅ All database module IDs exist in frontend config!');
  } else {
    console.log('\n❌ Some module IDs are missing from frontend config!');
  }
  
  // Clean up
  fs.unlinkSync(tempPath);
  
} catch (error) {
  console.error('❌ Error testing config:', error);
  // Clean up on error
  if (fs.existsSync(tempPath)) {
    fs.unlinkSync(tempPath);
  }
  process.exit(1);
}
