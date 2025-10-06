#!/usr/bin/env node

/**
 * Enhanced Ambulance (Driver Dashboard) API Testing Script
 * Tests all driver-specific endpoints through Docker service
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

// Test login with driver credentials
async function testDriverLogin() {
  log.info('Testing Driver Login...');
  
  const loginData = {
    email: 'driver.mike@hospital.vn',
    password: 'Driver123'
  };

  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    log.success('Driver login successful');
    return true;
  } else {
    log.error('Driver login failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Driver Dashboard Overview
async function testDriverDashboard() {
  log.info('Testing Driver Dashboard Overview...');
  
  const result = await apiRequest('GET', '/ambulances/driver/dashboard');
  
  if (result.success) {
    log.success('Driver dashboard retrieved successfully');
    console.log('Dashboard Overview:', JSON.stringify(result.data.data?.overview || {}, null, 2));
    return true;
  } else {
    log.error('Driver dashboard failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Emergency Dispatches
async function testEmergencyDispatches() {
  log.info('Testing Emergency Dispatches...');
  
  const result = await apiRequest('GET', '/ambulances/emergency-dispatches?status=pending');
  
  if (result.success) {
    log.success('Emergency dispatches retrieved successfully');
    console.log('Pending Dispatches:', result.data.data?.length || 0);
    
    // Test different status filters
    const activeResult = await apiRequest('GET', '/ambulances/emergency-dispatches?status=active');
    const completedResult = await apiRequest('GET', '/ambulances/emergency-dispatches?status=completed');
    
    if (activeResult.success && completedResult.success) {
      log.success('Dispatch status filtering works');
      return true;
    } else {
      log.warning('Dispatch filtering partially failed');
      return false;
    }
  } else {
    log.error('Emergency dispatches failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Dispatch Acceptance
async function testDispatchAcceptance() {
  log.info('Testing Dispatch Acceptance...');
  
  // First get available dispatches
  const dispatchesResult = await apiRequest('GET', '/ambulances/emergency-dispatches?status=pending');
  
  if (dispatchesResult.success && dispatchesResult.data.data?.length > 0) {
    const dispatchId = dispatchesResult.data.data[0].appointment_id;
    
    const acceptanceData = {
      ambulance_id: 'AMB001',
      estimated_arrival: '15 minutes'
    };
    
    const result = await apiRequest('POST', `/ambulances/dispatches/${dispatchId}/accept`, acceptanceData);
    
    if (result.success) {
      log.success('Dispatch accepted successfully');
      return true;
    } else {
      log.warning('Dispatch acceptance failed: ' + JSON.stringify(result.error));
      return false;
    }
  } else {
    log.warning('No pending dispatches available for acceptance test');
    return false;
  }
}

// Test Transport Status Updates
async function testTransportStatusUpdate() {
  log.info('Testing Transport Status Update...');
  
  // Get ambulance logs for transport update
  const logsResult = await apiRequest('GET', '/ambulance-log?limit=1');
  
  if (logsResult.success && logsResult.data.data?.length > 0) {
    const transportId = logsResult.data.data[0].log_id;
    
    const statusData = {
      status: 'en_route',
      current_location: '123 Main Street',
      patient_condition: 'stable',
      estimated_arrival: '10 minutes',
      notes: 'Transport proceeding normally - API test'
    };
    
    const result = await apiRequest('PUT', `/ambulances/transports/${transportId}/status`, statusData);
    
    if (result.success) {
      log.success('Transport status updated successfully');
      return true;
    } else {
      log.warning('Transport status update failed: ' + JSON.stringify(result.error));
      return false;
    }
  } else {
    log.warning('No transport logs available for status update test');
    return false;
  }
}

// Test Regular Ambulance Operations
async function testRegularAmbulanceOperations() {
  log.info('Testing Regular Ambulance Operations...');
  
  // Test getting all ambulances
  const ambulancesResult = await apiRequest('GET', '/ambulances?page=1&limit=5');
  
  if (ambulancesResult.success) {
    log.success('Ambulance list retrieved successfully');
    
    // Test ambulance statistics
    const statsResult = await apiRequest('GET', '/ambulances/stats');
    
    if (statsResult.success) {
      log.success('Ambulance statistics work');
      
      // Test available ambulances
      const availableResult = await apiRequest('GET', '/ambulances/available');
      
      if (availableResult.success) {
        log.success('Available ambulances endpoint works');
        console.log('Available Ambulances:', availableResult.data.data?.length || 0);
        return true;
      } else {
        log.warning('Available ambulances failed: ' + JSON.stringify(availableResult.error));
        return false;
      }
    } else {
      log.warning('Ambulance statistics failed: ' + JSON.stringify(statsResult.error));
      return false;
    }
  } else {
    log.error('Regular ambulance operations failed: ' + JSON.stringify(ambulancesResult.error));
    return false;
  }
}

// Test Ambulance Log Operations
async function testAmbulanceLogOperations() {
  log.info('Testing Ambulance Log Operations...');
  
  const result = await apiRequest('GET', '/ambulance-log?page=1&limit=5');
  
  if (result.success) {
    log.success('Ambulance logs retrieved successfully');
    console.log('Log Records:', result.data.pagination?.total || result.data.data?.length || 0);
    
    // Test log statistics
    const statsResult = await apiRequest('GET', '/ambulance-log/stats');
    
    if (statsResult.success) {
      log.success('Ambulance log statistics work');
      return true;
    } else {
      log.warning('Log statistics failed: ' + JSON.stringify(statsResult.error));
      return false;
    }
  } else {
    log.error('Ambulance log operations failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Main test runner
async function runAmbulanceTests() {
  console.log('🚑 Starting Enhanced Ambulance (Driver Dashboard) API Tests...\n');
  
  const tests = [
    { name: 'Driver Login', fn: testDriverLogin, critical: true },
    { name: 'Driver Dashboard', fn: testDriverDashboard, critical: true },
    { name: 'Emergency Dispatches', fn: testEmergencyDispatches, critical: true },
    { name: 'Dispatch Acceptance', fn: testDispatchAcceptance, critical: true },
    { name: 'Transport Status Update', fn: testTransportStatusUpdate, critical: true },
    { name: 'Regular Ambulance Operations', fn: testRegularAmbulanceOperations, critical: true },
    { name: 'Ambulance Log Operations', fn: testAmbulanceLogOperations, critical: false }
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
  console.log('📊 Enhanced Ambulance API Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚨 Critical Failures: ${criticalFailed}`);
  
  if (criticalFailed > 0) {
    log.error('CRITICAL: Some essential ambulance features are not working!');
    process.exit(1);
  } else if (failed > 0) {
    log.warning(`${failed} non-critical tests failed. Ambulance dashboard partially functional.`);
    process.exit(0);
  } else {
    log.success('🎉 All ambulance API tests passed! Driver dashboard fully functional.');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  runAmbulanceTests().catch((error) => {
    log.error('Test execution failed: ' + error.message);
    process.exit(1);
  });
}

module.exports = { runAmbulanceTests };