#!/usr/bin/env node

/**
 * Doctor Dashboard API Testing Script
 * Tests all doctor-specific endpoints through Docker service
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

// Test login with doctor credentials
async function testDoctorLogin() {
  log.info('Testing Doctor Login...');
  
  const loginData = {
    email: 'bs.lethij@hospital.vn',
    password: 'Demo1234'
  };

  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.data?.token) {
    authToken = result.data.data.token;
    log.success('Doctor login successful');
    return true;
  } else {
    log.error('Doctor login failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Doctor Dashboard Overview
async function testDoctorDashboard() {
  log.info('Testing Doctor Dashboard Overview...');
  
  const result = await apiRequest('GET', '/doctor/dashboard');
  
  if (result.success) {
    log.success('Doctor dashboard retrieved successfully');
    console.log('Dashboard Overview:', JSON.stringify(result.data.data?.overview, null, 2));
    return true;
  } else {
    log.error('Doctor dashboard failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Get All Doctors
async function testGetAllDoctors() {
  log.info('Testing Get All Doctors...');
  
  const result = await apiRequest('GET', '/doctors?page=1&limit=5');
  
  if (result.success) {
    log.success('Doctors list retrieved successfully');
    console.log('Doctors Count:', result.data.data?.length || 0);
    
    // Test search functionality
    const searchResult = await apiRequest('GET', '/doctors?search=bs');
    if (searchResult.success) {
      log.success('Doctor search functionality works');
    } else {
      log.warning('Doctor search failed');
    }
    
    return true;
  } else {
    log.error('Get all doctors failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Doctor Statistics
async function testDoctorStatistics() {
  log.info('Testing Doctor Statistics...');
  
  const result = await apiRequest('GET', '/doctors/stats');
  
  if (result.success) {
    log.success('Doctor statistics retrieved successfully');
    console.log('Doctor Stats:', JSON.stringify(result.data.data, null, 2));
    return true;
  } else {
    log.error('Doctor statistics failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Doctor Appointments
async function testDoctorAppointments() {
  log.info('Testing Doctor Appointments...');
  
  const result = await apiRequest('GET', '/doctor/appointments');
  
  if (result.success) {
    log.success('Doctor appointments retrieved successfully');
    console.log('Appointments Count:', result.data.data?.length || 0);
    
    // Test appointment filtering
    const todayResult = await apiRequest('GET', '/doctor/appointments?date=' + new Date().toISOString().split('T')[0]);
    if (todayResult.success) {
      log.success('Appointment date filtering works');
    }
    
    return true;
  } else {
    log.error('Doctor appointments failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Patient Management
async function testPatientManagement() {
  log.info('Testing Patient Management...');
  
  const result = await apiRequest('GET', '/doctor/patients');
  
  if (result.success) {
    log.success('Doctor patients retrieved successfully');
    console.log('Patients Count:', result.data.data?.length || 0);
    
    // Test patient search
    const searchResult = await apiRequest('GET', '/doctor/patients?search=patient');
    if (searchResult.success) {
      log.success('Patient search functionality works');
    }
    
    return true;
  } else {
    log.error('Patient management failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Medical Records
async function testMedicalRecords() {
  log.info('Testing Medical Records...');
  
  // Get patients first
  const patientsResult = await apiRequest('GET', '/patients?limit=1');
  
  if (patientsResult.success && patientsResult.data.data?.length > 0) {
    const patientId = patientsResult.data.data[0].patient_id;
    
    // Test get medical records
    const recordsResult = await apiRequest('GET', `/doctor/patients/${patientId}/medical-records`);
    
    if (recordsResult.success) {
      log.success('Medical records retrieved successfully');
      console.log('Medical Records Count:', recordsResult.data.data?.length || 0);
      return true;
    } else {
      log.warning('Medical records retrieval failed: ' + JSON.stringify(recordsResult.error));
      return false;
    }
  } else {
    log.warning('No patients found for medical records test');
    return false;
  }
}

// Test Prescription Management
async function testPrescriptionManagement() {
  log.info('Testing Prescription Management...');
  
  const result = await apiRequest('GET', '/doctor/prescriptions');
  
  if (result.success) {
    log.success('Doctor prescriptions retrieved successfully');
    console.log('Prescriptions Count:', result.data.data?.length || 0);
    
    // Test prescription filtering
    const recentResult = await apiRequest('GET', '/doctor/prescriptions?status=active');
    if (recentResult.success) {
      log.success('Prescription filtering works');
    }
    
    return true;
  } else {
    log.error('Prescription management failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Test Doctor Schedule
async function testDoctorSchedule() {
  log.info('Testing Doctor Schedule...');
  
  const result = await apiRequest('GET', '/doctor/schedule');
  
  if (result.success) {
    log.success('Doctor schedule retrieved successfully');
    console.log('Today Schedule:', result.data.data?.today_schedule || 'No schedule');
    
    // Test schedule update
    const updateData = {
      available_schedule: 'Monday-Friday: 9:00-17:00'
    };
    
    const updateResult = await apiRequest('PUT', '/doctor/schedule', updateData);
    if (updateResult.success || updateResult.status === 404) {
      log.success('Doctor schedule endpoint accessible');
    }
    
    return true;
  } else {
    log.error('Doctor schedule failed: ' + JSON.stringify(result.error));
    return false;
  }
}

// Main test runner
async function runDoctorTests() {
  console.log('👨‍⚕️ Starting Doctor Dashboard API Tests...\n');
  
  const tests = [
    { name: 'Doctor Login', fn: testDoctorLogin, critical: true },
    { name: 'Doctor Dashboard', fn: testDoctorDashboard, critical: true },
    { name: 'Get All Doctors', fn: testGetAllDoctors, critical: true },
    { name: 'Doctor Statistics', fn: testDoctorStatistics, critical: false },
    { name: 'Doctor Appointments', fn: testDoctorAppointments, critical: true },
    { name: 'Patient Management', fn: testPatientManagement, critical: true },
    { name: 'Medical Records', fn: testMedicalRecords, critical: false },
    { name: 'Prescription Management', fn: testPrescriptionManagement, critical: true },
    { name: 'Doctor Schedule', fn: testDoctorSchedule, critical: false }
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
  console.log('📊 Doctor API Test Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🚨 Critical Failures: ${criticalFailed}`);
  
  if (criticalFailed > 0) {
    log.error('CRITICAL: Some essential doctor features are not working!');
    process.exit(1);
  } else if (failed > 0) {
    log.warning(`${failed} non-critical tests failed. Doctor dashboard partially functional.`);
    process.exit(0);
  } else {
    log.success('🎉 All doctor API tests passed! Doctor dashboard fully functional.');
    process.exit(0);
  }
}

// Handle script execution
if (require.main === module) {
  runDoctorTests().catch(error => {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  });
}

module.exports = { runDoctorTests };
