#!/usr/bin/env node

/**
 * Lab Assistant Dashboard API Testing Script
 * Tests all lab assistant-specific endpoints through Docker service
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

// Test login with lab assistant credentials
async function testLabAssistantLogin() {
  log.info('Testing Lab Assistant Login...');
  
  const loginData = {
    email: 'lab.assistant@hospital.vn',
    password: 'Lab123'
  };

  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    log.success('Lab Assistant login successful');
    return true;
  } else {
    log.error('Lab Assistant login failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Lab Assistant Dashboard Overview
async function testLabAssistantDashboard() {
  log.info('Testing Lab Assistant Dashboard Overview...');
  
  const result = await apiRequest('GET', '/lab-assistant/dashboard');
  
  if (result.success) {
    log.success('Lab Assistant dashboard retrieved successfully');
    console.log('Dashboard Overview:', JSON.stringify(result.data.data?.overview || {}, null, 2));
    return true;
  } else {
    log.error('Lab Assistant dashboard failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Samples to Collect
async function testSamplesToCollect() {
  log.info('Testing Samples to Collect...');
  
  const result = await apiRequest('GET', '/lab-assistant/samples-to-collect?page=1&limit=5');
  
  if (result.success) {
    log.success('Samples to collect retrieved successfully');
    console.log('Samples Count:', result.data.pagination?.total || result.data.data?.length || 0);
    
    // Test with priority filter
    const filteredResult = await apiRequest('GET', '/lab-assistant/samples-to-collect?priority=urgent');
    
    if (filteredResult.success) {
      log.success('Sample priority filtering works');
      return true;
    } else {
      log.warning('Sample filtering failed: ' + JSON.stringify(filteredResult.error));
      return false;
    }
  } else {
    log.error('Samples to collect failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Sample Collection Recording
async function testSampleCollection() {
  log.info('Testing Sample Collection Recording...');
  
  // First get samples to collect
  const samplesResult = await apiRequest('GET', '/lab-assistant/samples-to-collect?limit=1');
  
  if (samplesResult.success && samplesResult.data.data?.length > 0) {
    const sampleId = samplesResult.data.data[0].record_id;
    
    const collectionData = {
      collection_time: new Date().toISOString(),
      sample_type: 'Blood',
      collection_method: 'Venipuncture',
      container_type: 'EDTA tube',
      volume_collected: '5ml',
      fasting_status: 'fasting',
      notes: 'Sample collected successfully - API test'
    };
    
    const result = await apiRequest('POST', `/lab-assistant/samples/${sampleId}/collect`, collectionData);
    
    if (result.success) {
      log.success('Sample collection recorded successfully');
      return true;
    } else {
      log.warning('Sample collection recording failed: ' + JSON.stringify(result.error));
      return false;
    }
  } else {
    log.warning('No samples available for collection test');
    return false;
  }
}

// Test Sample Processing Queue
async function testProcessingQueue() {
  log.info('Testing Sample Processing Queue...');
  
  const result = await apiRequest('GET', '/lab-assistant/processing-queue?page=1&limit=5');
  
  if (result.success) {
    log.success('Processing queue retrieved successfully');
    console.log('Processing Queue Count:', result.data.pagination?.total || result.data.data?.length || 0);
    
    // Test with test type filter
    const filteredResult = await apiRequest('GET', '/lab-assistant/processing-queue?test_type=blood');
    
    if (filteredResult.success) {
      log.success('Processing queue filtering works');
      return true;
    } else {
      log.warning('Processing queue filtering failed: ' + JSON.stringify(filteredResult.error));
      return false;
    }
  } else {
    log.error('Processing queue failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Sample Processing Status Update
async function testProcessingStatusUpdate() {
  log.info('Testing Sample Processing Status Update...');
  
  // Get processing queue first
  const queueResult = await apiRequest('GET', '/lab-assistant/processing-queue?limit=1');
  
  if (queueResult.success && queueResult.data.data?.length > 0) {
    const sampleId = queueResult.data.data[0].record_id;
    
    const statusData = {
      status: 'processing',
      processing_notes: 'Sample is being processed - API test',
      quality_check: 'passed'
    };
    
    const result = await apiRequest('PUT', `/lab-assistant/samples/${sampleId}/processing-status`, statusData);
    
    if (result.success) {
      log.success('Processing status updated successfully');
      return true;
    } else {
      log.warning('Processing status update failed: ' + JSON.stringify(result.error));
      return false;
    }
  } else {
    log.warning('No samples in processing queue for status update test');
    return false;
  }
}

// Test Lab Inventory
async function testLabInventory() {
  log.info('Testing Lab Inventory...');
  
  const result = await apiRequest('GET', '/lab-assistant/inventory');
  
  if (result.success) {
    log.success('Lab inventory retrieved successfully');
    console.log('Inventory Items:', result.data.data?.length || 0);
    
    // Test low stock filter
    const lowStockResult = await apiRequest('GET', '/lab-assistant/inventory?low_stock=true');
    
    if (lowStockResult.success) {
      log.success('Low stock filtering works');
      console.log('Low Stock Items:', lowStockResult.data.data?.length || 0);
      return true;
    } else {
      log.warning('Low stock filtering failed: ' + JSON.stringify(lowStockResult.error));
      return false;
    }
  } else {
    log.error('Lab inventory failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Inventory Restock Request
async function testInventoryRestockRequest() {
  log.info('Testing Inventory Restock Request...');
  
  const restockData = {
    items: [
      {
        item_id: 1,
        item_name: 'Blood Collection Tubes (EDTA)',
        requested_quantity: 100,
        urgency: 'medium'
      },
      {
        item_id: 2,
        item_name: 'Chemistry Reagent Kit',
        requested_quantity: 5,
        urgency: 'high'
      }
    ],
    urgency: 'medium',
    notes: 'Weekly inventory restock - API test'
  };
  
  const result = await apiRequest('POST', '/lab-assistant/inventory/restock-request', restockData);
  
  if (result.success) {
    log.success('Inventory restock request submitted successfully');
    return true;
  } else {
    log.warning('Inventory restock request failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Collection Schedule
async function testCollectionSchedule() {
  log.info('Testing Collection Schedule...');
  
  const today = new Date().toISOString().split('T')[0];
  const result = await apiRequest('GET', `/lab-assistant/collection-schedule?date=${today}`);
  
  if (result.success) {
    log.success('Collection schedule retrieved successfully');
    console.log('Scheduled Collections:', result.data.data?.length || 0);
    
    // Test default date (today)
    const defaultResult = await apiRequest('GET', '/lab-assistant/collection-schedule');
    
    if (defaultResult.success) {
      log.success('Default collection schedule works');
      return true;
    } else {
      log.warning('Default collection schedule failed: ' + JSON.stringify(defaultResult.error));
      return false;
    }
  } else {
    log.error('Collection schedule failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Main test runner
async function runLabAssistantTests() {
  console.log('🧪 Starting Lab Assistant Dashboard API Tests...\n');
  
  const tests = [
    { name: 'Lab Assistant Login', fn: testLabAssistantLogin, critical: true },
    { name: 'Lab Assistant Dashboard', fn: testLabAssistantDashboard, critical: true },
    { name: 'Samples to Collect', fn: testSamplesToCollect, critical: true },
    { name: 'Sample Collection Recording', fn: testSampleCollection, critical: true },
    { name: 'Processing Queue', fn: testProcessingQueue, critical: true },
    { name: 'Processing Status Update', fn: testProcessingStatusUpdate, critical: true },
    { name: 'Lab Inventory', fn: testLabInventory, critical: true },
    { name: 'Inventory Restock Request', fn: testInventoryRestockRequest, critical: false },
    { name: 'Collection Schedule', fn: testCollectionSchedule, critical: true }
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
  console.log('📊 Lab Assistant API Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚨 Critical Failures: ${criticalFailed}`);
  
  if (criticalFailed > 0) {
    log.error('CRITICAL: Some essential lab assistant features are not working!');
    process.exit(1);
  } else if (failed > 0) {
    log.warning(`${failed} non-critical tests failed. Lab Assistant dashboard partially functional.`);
    process.exit(0);
  } else {
    log.success('🎉 All lab assistant API tests passed! Lab Assistant dashboard fully functional.');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  runLabAssistantTests().catch((error) => {
    log.error('Test execution failed: ' + error.message);
    process.exit(1);
  });
}

module.exports = { runLabAssistantTests };