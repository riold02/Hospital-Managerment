#!/usr/bin/env node

/**
 * Enhanced Medical Records (Technician Dashboard) API Testing Script
 * Tests all technician-specific endpoints through Docker service
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

// Test login with technician credentials
async function testTechnicianLogin() {
  log.info('Testing Technician Login...');
  
  const loginData = {
    email: 'tech.sarah@hospital.vn',
    password: 'Tech123'
  };

  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.token) {
    authToken = result.data.token;
    log.success('Technician login successful');
    return true;
  } else {
    log.error('Technician login failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Technician Dashboard Overview
async function testTechnicianDashboard() {
  log.info('Testing Technician Dashboard Overview...');
  
  const result = await apiRequest('GET', '/medical-records/technician/dashboard');
  
  if (result.success) {
    log.success('Technician dashboard retrieved successfully');
    console.log('Dashboard Overview:', JSON.stringify(result.data.data?.overview || {}, null, 2));
    return true;
  } else {
    log.error('Technician dashboard failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Medical Records Management
async function testMedicalRecordsManagement() {
  log.info('Testing Medical Records Management...');
  
  const result = await apiRequest('GET', '/medical-records?page=1&limit=10');
  
  if (result.success) {
    log.success('Medical records list retrieved successfully');
    console.log('Total Records:', result.data.pagination?.total || result.data.data?.length || 0);
    
    // Test record search functionality
    const searchResult = await apiRequest('GET', '/medical-records?search=test&status=active');
    
    if (searchResult.success) {
      log.success('Medical records search functionality works');
      
      // Test medical record statistics
      const statsResult = await apiRequest('GET', '/medical-records/stats');
      
      if (statsResult.success) {
        log.success('Medical records statistics retrieved');
        return true;
      } else {
        log.warning('Medical records statistics failed: ' + JSON.stringify(statsResult.error));
        return false;
      }
    } else {
      log.warning('Medical records search failed: ' + JSON.stringify(searchResult.error));
      return false;
    }
  } else {
    log.error('Medical records management failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Medical Record Creation and Updates
async function testMedicalRecordOperations() {
  log.info('Testing Medical Record Creation and Updates...');
  
  // Test creating a new medical record
  const newRecordData = {
    patient_id: 'PAT001',
    appointment_id: 'APT001',
    diagnosis: 'API Test Diagnosis - Technician Dashboard Test',
    treatment_plan: 'Test treatment plan for API validation',
    medications: ['Test Medication A', 'Test Medication B'],
    test_results: 'Normal test results - API test',
    notes: 'Technical notes for API testing',
    follow_up_required: true
  };
  
  const createResult = await apiRequest('POST', '/medical-records', newRecordData);
  
  if (createResult.success) {
    log.success('Medical record created successfully');
    const recordId = createResult.data.data?.record_id;
    
    if (recordId) {
      // Test updating the created record
      const updateData = {
        diagnosis: 'Updated API Test Diagnosis',
        notes: 'Updated technical notes - API test completed'
      };
      
      const updateResult = await apiRequest('PUT', `/medical-records/${recordId}`, updateData);
      
      if (updateResult.success) {
        log.success('Medical record updated successfully');
        return true;
      } else {
        log.warning('Medical record update failed: ' + JSON.stringify(updateResult.error));
        return false;
      }
    } else {
      log.warning('Medical record created but ID not returned');
      return false;
    }
  } else {
    log.warning('Medical record creation failed: ' + JSON.stringify(createResult.error));
    return false;
  }
}

// Test Digital Archive Management
async function testDigitalArchiveManagement() {
  log.info('Testing Digital Archive Management...');
  
  // Test getting archived records
  const archiveResult = await apiRequest('GET', '/medical-records/archive?page=1&limit=5');
  
  if (archiveResult.success) {
    log.success('Archived records retrieved successfully');
    
    // Test archive search
    const searchResult = await apiRequest('GET', '/medical-records/archive?search=2024');
    
    if (searchResult.success) {
      log.success('Archive search functionality works');
      
      // Test archive statistics
      const statsResult = await apiRequest('GET', '/medical-records/archive/stats');
      
      if (statsResult.success) {
        log.success('Archive statistics work');
        console.log('Archive Stats:', JSON.stringify(statsResult.data.data || {}, null, 2));
        return true;
      } else {
        log.warning('Archive statistics failed: ' + JSON.stringify(statsResult.error));
        return false;
      }
    } else {
      log.warning('Archive search failed: ' + JSON.stringify(searchResult.error));
      return false;
    }
  } else {
    log.warning('Digital archive management failed: ' + JSON.stringify(archiveResult.error));
    return false;
  }
}

// Test Record Verification and Quality Control
async function testRecordVerification() {
  log.info('Testing Record Verification and Quality Control...');
  
  // Test getting records pending verification
  const pendingResult = await apiRequest('GET', '/medical-records?status=pending_verification');
  
  if (pendingResult.success) {
    log.success('Pending verification records retrieved');
    
    if (pendingResult.data.data?.length > 0) {
      const recordId = pendingResult.data.data[0].record_id;
      
      // Test record verification
      const verificationData = {
        status: 'verified',
        verification_notes: 'API test - Record verified by technician',
        quality_score: 95
      };
      
      const verifyResult = await apiRequest('POST', `/medical-records/${recordId}/verify`, verificationData);
      
      if (verifyResult.success) {
        log.success('Record verification completed successfully');
        return true;
      } else {
        log.warning('Record verification failed: ' + JSON.stringify(verifyResult.error));
        return false;
      }
    } else {
      log.info('No records pending verification - creating test scenario');
      
      // Test quality control overview
      const qcResult = await apiRequest('GET', '/medical-records/quality-control');
      
      if (qcResult.success) {
        log.success('Quality control overview retrieved');
        return true;
      } else {
        log.warning('Quality control overview failed: ' + JSON.stringify(qcResult.error));
        return false;
      }
    }
  } else {
    log.warning('Record verification test failed: ' + JSON.stringify(pendingResult.error));
    return false;
  }
}

// Test Medical Record Analytics
async function testMedicalRecordAnalytics() {
  log.info('Testing Medical Record Analytics...');
  
  const analyticsResult = await apiRequest('GET', '/medical-records/analytics?period=monthly');
  
  if (analyticsResult.success) {
    log.success('Medical record analytics retrieved successfully');
    
    // Test different analytics periods
    const weeklyResult = await apiRequest('GET', '/medical-records/analytics?period=weekly');
    const yearlyResult = await apiRequest('GET', '/medical-records/analytics?period=yearly');
    
    if (weeklyResult.success && yearlyResult.success) {
      log.success('Analytics period filtering works');
      console.log('Analytics Data Available:', {
        monthly: !!analyticsResult.data.data,
        weekly: !!weeklyResult.data.data,
        yearly: !!yearlyResult.data.data
      });
      return true;
    } else {
      log.warning('Analytics period filtering partially failed');
      return false;
    }
  } else {
    log.warning('Medical record analytics failed: ' + JSON.stringify(analyticsResult.error));
    return false;
  }
}

// Test Patient Data Export
async function testPatientDataExport() {
  log.info('Testing Patient Data Export...');
  
  // Test export functionality
  const exportResult = await apiRequest('POST', '/medical-records/export', {
    format: 'pdf',
    patient_ids: ['PAT001', 'PAT002'],
    date_range: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  });
  
  if (exportResult.success) {
    log.success('Patient data export initiated successfully');
    
    // Test export status check
    const exportId = exportResult.data.data?.export_id;
    if (exportId) {
      const statusResult = await apiRequest('GET', `/medical-records/export/${exportId}/status`);
      
      if (statusResult.success) {
        log.success('Export status tracking works');
        return true;
      } else {
        log.warning('Export status tracking failed: ' + JSON.stringify(statusResult.error));
        return false;
      }
    } else {
      log.warning('Export initiated but no export ID returned');
      return false;
    }
  } else {
    log.warning('Patient data export failed: ' + JSON.stringify(exportResult.error));
    return false;
  }
}

// Main test runner
async function runMedicalRecordsTests() {
  console.log('📋 Starting Enhanced Medical Records (Technician Dashboard) API Tests...\n');
  
  const tests = [
    { name: 'Technician Login', fn: testTechnicianLogin, critical: true },
    { name: 'Technician Dashboard', fn: testTechnicianDashboard, critical: true },
    { name: 'Medical Records Management', fn: testMedicalRecordsManagement, critical: true },
    { name: 'Medical Record Operations', fn: testMedicalRecordOperations, critical: true },
    { name: 'Digital Archive Management', fn: testDigitalArchiveManagement, critical: true },
    { name: 'Record Verification', fn: testRecordVerification, critical: true },
    { name: 'Medical Record Analytics', fn: testMedicalRecordAnalytics, critical: false },
    { name: 'Patient Data Export', fn: testPatientDataExport, critical: false }
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
  console.log('📊 Enhanced Medical Records API Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚨 Critical Failures: ${criticalFailed}`);
  
  if (criticalFailed > 0) {
    log.error('CRITICAL: Some essential medical records features are not working!');
    process.exit(1);
  } else if (failed > 0) {
    log.warning(`${failed} non-critical tests failed. Medical records dashboard partially functional.`);
    process.exit(0);
  } else {
    log.success('🎉 All medical records API tests passed! Technician dashboard fully functional.');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  runMedicalRecordsTests().catch((error) => {
    log.error('Test execution failed: ' + error.message);
    process.exit(1);
  });
}

module.exports = { runMedicalRecordsTests };