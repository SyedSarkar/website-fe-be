console.log('🔍 Simple Data Test...\n');

// Test 1: Check if files exist
const fs = require('fs');
const path = require('path');

const modelsPath = path.join(__dirname, 'backend', 'models');
const adminDashboardPath = path.join(__dirname, 'src', 'components', 'admin', 'ImprovedAdminDashboard.tsx');

console.log('📁 Checking models directory:', modelsPath);
console.log('📱 Checking admin dashboard:', adminDashboardPath);

try {
  const modelFiles = fs.readdirSync(modelsPath);
  console.log('📄 Model files:', modelFiles);
  
  const hasRequiredModels = modelFiles.includes('ModuleEnrollment.js') && 
                           modelFiles.includes('User.js') && 
                           modelFiles.includes('ScaleResponse.js');
  console.log('✅ Required models exist:', hasRequiredModels);
  
  const adminDashboardExists = fs.existsSync(adminDashboardPath);
  console.log('✅ Admin dashboard exists:', adminDashboardExists);
  
  if (adminDashboardExists) {
    const content = fs.readFileSync(adminDashboardPath, 'utf8');
    const hasModuleProgressColumn = content.includes('Module Progress');
    const hasModuleData = content.includes('moduleEnrollments');
    const hasPerformanceData = content.includes('moduleCount');
    
    console.log('✅ Dashboard has Module Progress column:', hasModuleProgressColumn);
    console.log('✅ Dashboard uses moduleEnrollments data:', hasModuleData);
    console.log('✅ Dashboard has moduleCount in performance:', hasPerformanceData);
  }
  
  console.log('\n🎯 SUMMARY:');
  if (hasRequiredModels && adminDashboardExists && hasModuleProgressColumn && hasModuleData) {
    console.log('✅ Everything is properly set up!');
    console.log('\n📋 Next steps:');
    console.log('1. Start your backend server (cd backend && npm start)');
    console.log('2. Start your frontend (npm run dev)');
    console.log('3. Login as admin user');
    console.log('4. Check Performance tab - should show Syed Hassan with module progress');
    console.log('5. Check Modules tab - should show enrollment details');
  } else {
    console.log('❌ Some components are missing. Check the output above.');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n🏁 Test completed!');
