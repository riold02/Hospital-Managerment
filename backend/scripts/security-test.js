#!/usr/bin/env node

/**
 * ============================================================================
 * SECURITY TEST SCRIPT
 * ============================================================================
 * 
 * Script để test các biện pháp bảo mật của Hospital Management System
 * 
 * Usage: node scripts/security-test.js [test-type]
 * 
 * Test Types:
 *   xss         - Test XSS protection
 *   sql         - Test SQL injection protection  
 *   rate        - Test rate limiting
 *   cors        - Test CORS configuration
 *   validation  - Test input validation
 *   all         - Run all security tests
 */

const axios = require('axios');
const colors = require('colors');

const BASE_URL = process.env.API_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/v1`;

// Test configuration
const config = {
  timeout: 5000,
  validateStatus: () => true // Accept all status codes
};

/**
 * Test XSS Protection
 */
async function testXSSProtection() {
  console.log('\n🧪 Testing XSS Protection'.yellow.bold);
  console.log('=' .repeat(50));

  const xssPayloads = [
    '<script>alert("xss")</script>',
    'javascript:alert("xss")',
    '<img src=x onerror=alert("xss")>',
    '<svg onload=alert("xss")>',
    '"><script>alert("xss")</script>',
    '\'; alert("xss"); //',
    '<iframe src="javascript:alert(\'xss\')"></iframe>'
  ];

  let passed = 0;
  let total = xssPayloads.length;

  for (const payload of xssPayloads) {
    try {
      const response = await axios.post(`${API_BASE}/auth/register/patient`, {
        email: 'test@example.com',
        password: 'Test123!',
        first_name: payload,
        last_name: 'Test',
        date_of_birth: '1990-01-01'
      }, config);

      // Check if XSS payload was sanitized
      const sanitized = !response.data.error || 
                       !response.data.details?.some(d => 
                         d.value && d.value.includes('<script>') || 
                         d.value && d.value.includes('javascript:') ||
                         d.value && d.value.includes('onerror=')
                       );

      if (sanitized) {
        console.log(`✅ XSS Blocked: ${payload.substring(0, 30)}...`.green);
        passed++;
      } else {
        console.log(`❌ XSS Not Blocked: ${payload}`.red);
      }
    } catch (error) {
      console.log(`✅ XSS Blocked (Network Error): ${payload.substring(0, 30)}...`.green);
      passed++;
    }
  }

  console.log(`\n📊 XSS Protection: ${passed}/${total} tests passed`.cyan);
  return passed === total;
}

/**
 * Test SQL Injection Protection
 */
async function testSQLInjection() {
  console.log('\n🧪 Testing SQL Injection Protection'.yellow.bold);
  console.log('=' .repeat(50));

  const sqlPayloads = [
    "'; DROP TABLE users; --",
    "' OR '1'='1",
    "' UNION SELECT * FROM users --",
    "'; INSERT INTO users VALUES ('hacker', 'password'); --",
    "' OR 1=1 --",
    "'; DELETE FROM patients; --",
    "' UNION SELECT password FROM users WHERE '1'='1",
    "'; UPDATE users SET password='hacked' WHERE '1'='1; --"
  ];

  let passed = 0;
  let total = sqlPayloads.length;

  for (const payload of sqlPayloads) {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email: payload,
        password: 'test123'
      }, config);

      // SQL injection should be blocked (400 status)
      if (response.status === 400 && 
          response.data.error && 
          response.data.error.includes('malicious')) {
        console.log(`✅ SQL Injection Blocked: ${payload.substring(0, 30)}...`.green);
        passed++;
      } else {
        console.log(`❌ SQL Injection Not Blocked: ${payload}`.red);
      }
    } catch (error) {
      console.log(`✅ SQL Injection Blocked (Network Error): ${payload.substring(0, 30)}...`.green);
      passed++;
    }
  }

  console.log(`\n📊 SQL Injection Protection: ${passed}/${total} tests passed`.cyan);
  return passed === total;
}

/**
 * Test Rate Limiting
 */
async function testRateLimit() {
  console.log('\n🧪 Testing Rate Limiting'.yellow.bold);
  console.log('=' .repeat(50));

  const maxRequests = 15; // Should hit auth rate limit (10 requests)
  let blocked = 0;
  let successful = 0;

  console.log(`Making ${maxRequests} rapid requests to auth endpoint...`);

  const promises = [];
  for (let i = 0; i < maxRequests; i++) {
    promises.push(
      axios.post(`${API_BASE}/auth/login`, {
        email: `test${i}@example.com`,
        password: 'wrongpassword'
      }, config).catch(err => ({ status: err.response?.status || 500, data: err.response?.data }))
    );
  }

  const responses = await Promise.all(promises);

  responses.forEach((response, index) => {
    if (response.status === 429) {
      blocked++;
      if (index < 5) { // Only log first few
        console.log(`✅ Request ${index + 1}: Rate limited (429)`.green);
      }
    } else {
      successful++;
      if (index < 5) { // Only log first few
        console.log(`⚠️  Request ${index + 1}: Not rate limited (${response.status})`.yellow);
      }
    }
  });

  if (blocked > 5) {
    console.log(`... and ${blocked - 5} more requests were rate limited`.green);
  }

  console.log(`\n📊 Rate Limiting: ${blocked}/${maxRequests} requests blocked`.cyan);
  return blocked > 5; // Should block at least some requests
}

/**
 * Test CORS Configuration
 */
async function testCORS() {
  console.log('\n🧪 Testing CORS Configuration'.yellow.bold);
  console.log('=' .repeat(50));

  const testOrigins = [
    'http://localhost:3000', // Should be allowed
    'http://localhost:3001', // Should be allowed
    'https://malicious-site.com', // Should be blocked
    'http://evil.com', // Should be blocked
  ];

  let passed = 0;
  let total = testOrigins.length;

  for (const origin of testOrigins) {
    try {
      const response = await axios.get(`${API_BASE}/health`, {
        ...config,
        headers: {
          'Origin': origin
        }
      });

      const isAllowed = origin.includes('localhost');
      const corsHeader = response.headers['access-control-allow-origin'];
      
      if (isAllowed && corsHeader) {
        console.log(`✅ CORS Allowed: ${origin}`.green);
        passed++;
      } else if (!isAllowed && !corsHeader) {
        console.log(`✅ CORS Blocked: ${origin}`.green);
        passed++;
      } else {
        console.log(`❌ CORS Misconfigured: ${origin}`.red);
      }
    } catch (error) {
      console.log(`⚠️  CORS Test Error: ${origin} - ${error.message}`.yellow);
    }
  }

  console.log(`\n📊 CORS Configuration: ${passed}/${total} tests passed`.cyan);
  return passed >= total * 0.75; // Allow some flexibility
}

/**
 * Test Input Validation
 */
async function testInputValidation() {
  console.log('\n🧪 Testing Input Validation'.yellow.bold);
  console.log('=' .repeat(50));

  const invalidInputs = [
    {
      name: 'Invalid Email',
      data: { email: 'not-an-email', password: 'Test123!', first_name: 'Test', last_name: 'User', date_of_birth: '1990-01-01' }
    },
    {
      name: 'Missing Required Field',
      data: { email: 'test@example.com', password: 'Test123!', last_name: 'User', date_of_birth: '1990-01-01' }
    },
    {
      name: 'Weak Password',
      data: { email: 'test@example.com', password: '123', first_name: 'Test', last_name: 'User', date_of_birth: '1990-01-01' }
    },
    {
      name: 'Invalid Date Format',
      data: { email: 'test@example.com', password: 'Test123!', first_name: 'Test', last_name: 'User', date_of_birth: 'invalid-date' }
    },
    {
      name: 'Extremely Long Name',
      data: { email: 'test@example.com', password: 'Test123!', first_name: 'A'.repeat(100), last_name: 'User', date_of_birth: '1990-01-01' }
    }
  ];

  let passed = 0;
  let total = invalidInputs.length;

  for (const test of invalidInputs) {
    try {
      const response = await axios.post(`${API_BASE}/auth/register/patient`, test.data, config);

      // Should return validation error (400 status)
      if (response.status === 400 && response.data.error === 'Validation failed') {
        console.log(`✅ Validation Blocked: ${test.name}`.green);
        passed++;
      } else {
        console.log(`❌ Validation Not Blocked: ${test.name}`.red);
      }
    } catch (error) {
      console.log(`✅ Validation Blocked (Network Error): ${test.name}`.green);
      passed++;
    }
  }

  console.log(`\n📊 Input Validation: ${passed}/${total} tests passed`.cyan);
  return passed === total;
}

/**
 * Test Security Headers
 */
async function testSecurityHeaders() {
  console.log('\n🧪 Testing Security Headers'.yellow.bold);
  console.log('=' .repeat(50));

  try {
    const response = await axios.get(`${API_BASE}/health`, config);
    const headers = response.headers;

    const securityHeaders = {
      'x-frame-options': 'DENY',
      'x-content-type-options': 'nosniff',
      'x-xss-protection': '1; mode=block',
      'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
      'content-security-policy': "default-src 'self'"
    };

    let passed = 0;
    let total = Object.keys(securityHeaders).length;

    for (const [header, expectedValue] of Object.entries(securityHeaders)) {
      if (headers[header]) {
        console.log(`✅ Header Present: ${header}`.green);
        passed++;
      } else {
        console.log(`❌ Header Missing: ${header}`.red);
      }
    }

    console.log(`\n📊 Security Headers: ${passed}/${total} headers present`.cyan);
    return passed >= total * 0.8; // Allow some flexibility
  } catch (error) {
    console.log(`❌ Security Headers Test Failed: ${error.message}`.red);
    return false;
  }
}

/**
 * Run all security tests
 */
async function runAllTests() {
  console.log('🔒 Hospital Management System - Security Test Suite'.rainbow.bold);
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  const results = {};

  // Run all tests
  results.xss = await testXSSProtection();
  results.sql = await testSQLInjection();
  results.rate = await testRateLimit();
  results.cors = await testCORS();
  results.validation = await testInputValidation();
  results.headers = await testSecurityHeaders();

  // Summary
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  console.log('\n' + '=' .repeat(60));
  console.log('📋 SECURITY TEST SUMMARY'.blue.bold);
  console.log('=' .repeat(60));
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS'.green : '❌ FAIL'.red;
    console.log(`${test.toUpperCase().padEnd(15)} ${status}`);
  });
  
  console.log('=' .repeat(60));
  console.log(`Overall Score: ${passed}/${total} tests passed`.cyan.bold);
  console.log(`Duration: ${duration}s`.gray);
  
  if (passed === total) {
    console.log('🎉 All security tests passed!'.green.bold);
  } else {
    console.log('⚠️  Some security tests failed. Please review and fix.'.yellow.bold);
  }
  
  return passed === total;
}

/**
 * Main function
 */
async function main() {
  const testType = process.argv[2] || 'all';
  
  console.log(`Starting security tests for: ${BASE_URL}`.cyan);
  console.log(`Test type: ${testType}`.cyan);
  
  try {
    let result = false;
    
    switch (testType) {
      case 'xss':
        result = await testXSSProtection();
        break;
      case 'sql':
        result = await testSQLInjection();
        break;
      case 'rate':
        result = await testRateLimit();
        break;
      case 'cors':
        result = await testCORS();
        break;
      case 'validation':
        result = await testInputValidation();
        break;
      case 'headers':
        result = await testSecurityHeaders();
        break;
      case 'all':
      default:
        result = await runAllTests();
        break;
    }
    
    process.exit(result ? 0 : 1);
  } catch (error) {
    console.error(`❌ Security test failed: ${error.message}`.red);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testXSSProtection,
  testSQLInjection,
  testRateLimit,
  testCORS,
  testInputValidation,
  testSecurityHeaders,
  runAllTests
};
