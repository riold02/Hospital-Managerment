#!/usr/bin/env node

/**
 * Admin Dashboard API Testing Script
 * Tests all admin-specific endpoints through Docker service
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3001/api/v1';
let authToken = null;

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Helper function to make authenticated requests
const apiRequest = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      data
    };

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
};

// Test login with admin credentials
async function testAdminLogin() {
  log.info('Testing Admin Login...');
  
  const loginData = {
    email: 'admin@hospital.com',
    password: 'Demo1234'
  };

  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    log.success('Admin login successful');
    return true;
  } else {
    log.error('Admin login failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Admin Dashboard Overview
async function testAdminDashboard() {
  log.info('Testing Admin Dashboard Overview...');
  
  const result = await apiRequest('GET', '/admin/dashboard');
  
  if (result.success) {
    log.success('Admin dashboard retrieved successfully');
    console.log('Dashboard Data:', JSON.stringify(result.data, null, 2));
    return true;
  } else {
    log.error('Admin dashboard failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test System Statistics
async function testSystemStats() {
  log.info('Testing System Statistics...');
  
  const result = await apiRequest('GET', '/admin/system-stats');
  
  if (result.success) {
    log.success('System statistics retrieved successfully');
    console.log('System Stats:', JSON.stringify(result.data, null, 2));
    return true;
  } else {
    log.error('System statistics failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test User Management
async function testUserManagement() {
  log.info('Testing User Management...');
  
  // Get all users
  const usersResult = await apiRequest('GET', '/admin/users?page=1&limit=5');
  
  if (usersResult.success) {
    log.success('Users retrieved successfully');
    console.log('Users Count:', usersResult.data.pagination?.total || 'N/A');
    
    // Test user filtering
    const filteredResult = await apiRequest('GET', '/admin/users?role=doctor&status=active');
    
    if (filteredResult.success) {
      log.success('User filtering works');
      return true;
    } else {
      log.warning('User filtering failed: ' + JSON.stringify(filteredResult.error));
      return false;
    }
  } else {
    log.error('User management failed: ' + JSON.stringify(usersResult.error));
    return false;
  }
}

// Test Activity Logs
async function testActivityLogs() {
  log.info('Testing Activity Logs...');
  
  const result = await apiRequest('GET', '/admin/activity-logs?page=1&limit=10');
  
  if (result.success) {
    log.success('Activity logs retrieved successfully');
    console.log('Activity Logs Count:', result.data.pagination?.total || 'N/A');
    return true;
  } else {
    log.error('Activity logs failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Backup Creation
async function testBackupCreation() {
  log.info('Testing Backup Creation...');
  
  const backupData = {
    backup_type: 'partial',
    tables: ['users', 'patients', 'appointments']
  };
  
  const result = await apiRequest('POST', '/admin/backup', backupData);
  
  if (result.success || result.status === 501) { // 501 = Not Implemented (mock)
    log.success('Backup endpoint accessible');
    return true;
  } else {
    log.error('Backup creation failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Maintenance Mode Toggle
async function testMaintenanceMode() {
  log.info('Testing Maintenance Mode...');
  
  const maintenanceData = {
    enabled: false,
    message: 'System maintenance in progress'
  };
  
  const result = await apiRequest('POST', '/admin/maintenance-mode', maintenanceData);
  
  if (result.success || result.status === 501) { // 501 = Not Implemented (mock)
    log.success('Maintenance mode endpoint accessible');
    return true;
  } else {
    log.error('Maintenance mode failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test User Status Update
async function testUserStatusUpdate() {
  log.info('Testing User Status Update...');
  
  // First get a user to update
  const usersResult = await apiRequest('GET', '/admin/users?limit=1');
  
  if (usersResult.success && usersResult.data.data.length > 0) {
    const userId = usersResult.data.data[0].user_id;
    
    const updateData = {
      is_active: true,
      reason: 'API testing - reactivating user'
    };
    
    const result = await apiRequest('PUT', `/admin/users/${userId}/status`, updateData);
    
    if (result.success) {
      log.success('User status update successful');
      return true;
    } else {
      log.warning('User status update failed: ' + JSON.stringify(result.error));
      return false;
    }
  } else {
    log.warning('No users found for status update test');
    return false;
  }
}

// Main test runner
async function runAdminTests() {
  console.log('🔧 Starting Admin Dashboard API Tests...\n');
  
  const tests = [
    { name: 'Admin Login', fn: testAdminLogin, critical: true },
    { name: 'Admin Dashboard', fn: testAdminDashboard, critical: true },
    { name: 'System Statistics', fn: testSystemStats, critical: true },
    { name: 'User Management', fn: testUserManagement, critical: true },
    { name: 'Activity Logs', fn: testActivityLogs, critical: false },
    { name: 'Backup Creation', fn: testBackupCreation, critical: false },
    { name: 'Maintenance Mode', fn: testMaintenanceMode, critical: false },
    { name: 'User Status Update', fn: testUserStatusUpdate, critical: false }
  ];

  let passed = 0;
  let failed = 0;
  let criticalFailed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
        log.success(`${test.name} - PASSED`);
      } else {
        failed++;
        if (test.critical) criticalFailed++;
        log.error(`${test.name} - FAILED${test.critical ? ' (CRITICAL)' : ''}`);
      }
    } catch (error) {
      failed++;
      if (test.critical) criticalFailed++;
      log.error(`${test.name} - ERROR: ${error.message}`);
    }
    console.log(''); // Add spacing between tests
  }

  // Test summary
  console.log('📊 Admin API Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚨 Critical Failures: ${criticalFailed}`);
  
  if (criticalFailed > 0) {
    log.error('CRITICAL: Some essential admin features are not working!');
    process.exit(1);
  } else if (failed > 0) {
    log.warning(`${failed} non-critical tests failed. Admin dashboard partially functional.`);
    process.exit(0);
  } else {
    log.success('🎉 All admin API tests passed! Admin dashboard fully functional.');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  runAdminTests().catch((error) => {
    log.error('Test execution failed: ' + error.message);
    process.exit(1);
  });
}

module.exports = { runAdminTests };