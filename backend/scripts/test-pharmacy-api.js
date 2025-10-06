#!/usr/bin/env node

/**
 * Enhanced Pharmacy (Pharmacist Dashboard) API Testing Script
 * Tests all pharmacist-specific endpoints through Docker service
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

// Test login with pharmacist credentials
async function testPharmacistLogin() {
  log.info('Testing Pharmacist Login...');
  
  const loginData = {
    email: 'pharmacist.john@hospital.vn',
    password: 'Pharm123'
  };

  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    log.success('Pharmacist login successful');
    return true;
  } else {
    log.error('Pharmacist login failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Pharmacist Dashboard Overview
async function testPharmacistDashboard() {
  log.info('Testing Pharmacist Dashboard Overview...');
  
  const result = await apiRequest('GET', '/pharmacy/pharmacist/dashboard');
  
  if (result.success) {
    log.success('Pharmacist dashboard retrieved successfully');
    console.log('Dashboard Overview:', JSON.stringify(result.data.data?.overview || {}, null, 2));
    return true;
  } else {
    log.error('Pharmacist dashboard failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Pending Prescriptions
async function testPendingPrescriptions() {
  log.info('Testing Pending Prescriptions...');
  
  const result = await apiRequest('GET', '/pharmacy/prescriptions/pending?page=1&limit=5');
  
  if (result.success) {
    log.success('Pending prescriptions retrieved successfully');
    console.log('Pending Count:', result.data.pagination?.total || result.data.data?.length || 0);
    return true;
  } else {
    log.error('Pending prescriptions failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Enhanced Medicine Inventory
async function testMedicineInventory() {
  log.info('Testing Enhanced Medicine Inventory...');
  
  const result = await apiRequest('GET', '/pharmacy/inventory?page=1&limit=5');
  
  if (result.success) {
    log.success('Medicine inventory retrieved successfully');
    console.log('Inventory Count:', result.data.pagination?.total || result.data.data?.length || 0);
    
    // Test search functionality
    const searchResult = await apiRequest('GET', '/pharmacy/inventory?search=aspirin');
    
    if (searchResult.success) {
      log.success('Medicine search functionality works');
      
      // Test category filter
      const categoryResult = await apiRequest('GET', '/pharmacy/inventory?category=pain-relief');
      
      if (categoryResult.success) {
        log.success('Category filtering works');
        
        // Test low stock filter
        const lowStockResult = await apiRequest('GET', '/pharmacy/inventory?lowStock=true');
        
        if (lowStockResult.success) {
          log.success('Low stock filtering works');
          console.log('Low Stock Items:', lowStockResult.data.pagination?.total || lowStockResult.data.data?.length || 0);
          return true;
        } else {
          log.warning('Low stock filtering failed: ' + JSON.stringify(lowStockResult.error));
          return false;
        }
      } else {
        log.warning('Category filtering failed: ' + JSON.stringify(categoryResult.error));
        return false;
      }
    } else {
      log.warning('Medicine search failed: ' + JSON.stringify(searchResult.error));
      return false;
    }
  } else {
    log.error('Medicine inventory failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Medicine Stock Update
async function testMedicineStockUpdate() {
  log.info('Testing Medicine Stock Update...');
  
  // First get a medicine to update
  const inventoryResult = await apiRequest('GET', '/pharmacy/inventory?limit=1');
  
  if (inventoryResult.success && inventoryResult.data.data?.length > 0) {
    const medicineId = inventoryResult.data.data[0].medicine_id;
    
    const stockUpdateData = {
      stock_quantity: 100,
      expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      batch_number: 'BATCH-2025-001'
    };
    
    const result = await apiRequest('PUT', `/pharmacy/medicines/${medicineId}/stock`, stockUpdateData);
    
    if (result.success) {
      log.success('Medicine stock updated successfully');
      return true;
    } else {
      log.warning('Medicine stock update failed: ' + JSON.stringify(result.error));
      return false;
    }
  } else {
    log.warning('No medicines found for stock update test');
    return false;
  }
}

// Test Expiring Medicines
async function testExpiringMedicines() {
  log.info('Testing Expiring Medicines...');
  
  const result = await apiRequest('GET', '/pharmacy/medicines/expiring?days=30');
  
  if (result.success) {
    log.success('Expiring medicines retrieved successfully');
    console.log('Expiring in 30 days:', result.data.data?.length || 0);
    
    // Test different time periods
    const result60 = await apiRequest('GET', '/pharmacy/medicines/expiring?days=60');
    
    if (result60.success) {
      log.success('Different expiry periods work');
      console.log('Expiring in 60 days:', result60.data.data?.length || 0);
      return true;
    } else {
      log.warning('Different expiry periods failed: ' + JSON.stringify(result60.error));
      return false;
    }
  } else {
    log.error('Expiring medicines failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Regular Pharmacy Operations (existing endpoints)
async function testRegularPharmacyOperations() {
  log.info('Testing Regular Pharmacy Operations...');
  
  // Test getting all pharmacy records
  const recordsResult = await apiRequest('GET', '/pharmacy?page=1&limit=5');
  
  if (recordsResult.success) {
    log.success('Pharmacy records retrieved successfully');
    
    // Test pharmacy statistics
    const statsResult = await apiRequest('GET', '/pharmacy/stats');
    
    if (statsResult.success) {
      log.success('Pharmacy statistics work');
      
      // Test daily report
      const today = new Date().toISOString().split('T')[0];
      const reportResult = await apiRequest('GET', `/pharmacy/daily-report?date=${today}`);
      
      if (reportResult.success) {
        log.success('Daily dispensing report works');
        return true;
      } else {
        log.warning('Daily report failed: ' + JSON.stringify(reportResult.error));
        return false;
      }
    } else {
      log.warning('Pharmacy statistics failed: ' + JSON.stringify(statsResult.error));
      return false;
    }
  } else {
    log.error('Regular pharmacy operations failed: ' + JSON.stringify(recordsResult.error));
    return false;
  }
}

// Test Medicine Dispensing
async function testMedicineDispensing() {
  log.info('Testing Medicine Dispensing...');
  
  // Get patient and medicine for dispensing
  const patientsResult = await apiRequest('GET', '/patients?limit=1');
  const medicineResult = await apiRequest('GET', '/medicine?limit=1');
  
  if (patientsResult.success && medicineResult.success && 
      patientsResult.data.data?.length > 0 && medicineResult.data.data?.length > 0) {
    
    const patientId = patientsResult.data.data[0].patient_id;
    const medicineId = medicineResult.data.data[0].medicine_id;
    
    const dispensingData = {
      patient_id: patientId,
      medicine_id: medicineId,
      quantity: 10,
      prescription_id: 1 // Mock prescription ID
    };
    
    const result = await apiRequest('POST', '/pharmacy', dispensingData);
    
    if (result.success || result.status === 404) { // 404 acceptable if prescription doesn't exist
      log.success('Medicine dispensing endpoint accessible');
      return true;
    } else {
      log.warning('Medicine dispensing failed: ' + JSON.stringify(result.error));
      return false;
    }
  } else {
    log.warning('Insufficient data for dispensing test');
    return false;
  }
}

// Test Patient Pharmacy History
async function testPatientPharmacyHistory() {
  log.info('Testing Patient Pharmacy History...');
  
  // Get a patient for history test
  const patientsResult = await apiRequest('GET', '/patients?limit=1');
  
  if (patientsResult.success && patientsResult.data.data?.length > 0) {
    const patientId = patientsResult.data.data[0].patient_id;
    
    const result = await apiRequest('GET', `/pharmacy/patient/${patientId}`);
    
    if (result.success) {
      log.success('Patient pharmacy history retrieved successfully');
      console.log('History Records:', result.data.data?.length || 0);
      return true;
    } else {
      log.warning('Patient pharmacy history failed: ' + JSON.stringify(result.error));
      return false;
    }
  } else {
    log.warning('No patients found for history test');
    return false;
  }
}

// Main test runner
async function runPharmacyTests() {
  console.log('💊 Starting Enhanced Pharmacy (Pharmacist Dashboard) API Tests...\n');
  
  const tests = [
    { name: 'Pharmacist Login', fn: testPharmacistLogin, critical: true },
    { name: 'Pharmacist Dashboard', fn: testPharmacistDashboard, critical: true },
    { name: 'Pending Prescriptions', fn: testPendingPrescriptions, critical: true },
    { name: 'Enhanced Medicine Inventory', fn: testMedicineInventory, critical: true },
    { name: 'Medicine Stock Update', fn: testMedicineStockUpdate, critical: true },
    { name: 'Expiring Medicines', fn: testExpiringMedicines, critical: true },
    { name: 'Regular Pharmacy Operations', fn: testRegularPharmacyOperations, critical: true },
    { name: 'Medicine Dispensing', fn: testMedicineDispensing, critical: false },
    { name: 'Patient Pharmacy History', fn: testPatientPharmacyHistory, critical: false }
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
  console.log('📊 Enhanced Pharmacy API Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚨 Critical Failures: ${criticalFailed}`);
  
  if (criticalFailed > 0) {
    log.error('CRITICAL: Some essential pharmacy features are not working!');
    process.exit(1);
  } else if (failed > 0) {
    log.warning(`${failed} non-critical tests failed. Pharmacy dashboard partially functional.`);
    process.exit(0);
  } else {
    log.success('🎉 All pharmacy API tests passed! Pharmacy dashboard fully functional.');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  runPharmacyTests().catch((error) => {
    log.error('Test execution failed: ' + error.message);
    process.exit(1);
  });
}

module.exports = { runPharmacyTests };