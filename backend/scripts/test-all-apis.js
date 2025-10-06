#!/usr/bin/env node

/**
 * API Test Summary Report
 * Runs all API tests and provides overall status
 */

const { spawn } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  header: (msg) => console.log(`${colors.cyan}🚀 ${msg}${colors.reset}`)
};

const testScripts = [
  { name: 'Admin API', script: 'test-admin-api.js', critical: true },
  { name: 'Doctor API', script: 'test-doctor-api.js', critical: true },
  { name: 'Nurse API', script: 'test-nurse-api.js', critical: true },
  { name: 'Lab Assistant API', script: 'test-lab-assistant-api.js', critical: true },
  { name: 'Pharmacy API', script: 'test-pharmacy-api.js', critical: true },
  { name: 'Medical Records API', script: 'test-medical-records-api.js', critical: false }
];

async function runTest(testScript) {
  return new Promise((resolve) => {
    const child = spawn('docker', ['exec', 'hospital_backend', 'node', testScript.script], {
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      // Parse test results from output
      const passedMatch = output.match(/✅ Passed: (\d+)/);
      const failedMatch = output.match(/❌ Failed: (\d+)/);
      const criticalMatch = output.match(/🚨 Critical Failures: (\d+)/);

      const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
      const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
      const critical = criticalMatch ? parseInt(criticalMatch[1]) : 0;
      const total = passed + failed;

      const result = {
        name: testScript.name,
        passed,
        failed,
        critical,
        total,
        success: code === 0,
        percentage: total > 0 ? Math.round((passed / total) * 100) : 0,
        output: output,
        error: errorOutput
      };

      resolve(result);
    });
  });
}

async function runAllTests() {
  log.header('Hospital Management System - API Test Summary');
  console.log('='.repeat(60));
  
  const results = [];
  
  for (const testScript of testScripts) {
    log.info(`Running ${testScript.name}...`);
    const result = await runTest(testScript);
    results.push(result);
    
    if (result.success && result.critical === 0) {
      log.success(`${testScript.name}: ${result.passed}/${result.total} tests passed (${result.percentage}%)`);
    } else if (result.critical > 0) {
      log.error(`${testScript.name}: ${result.passed}/${result.total} tests passed (${result.percentage}%) - ${result.critical} CRITICAL failures`);
    } else {
      log.warning(`${testScript.name}: ${result.passed}/${result.total} tests passed (${result.percentage}%) - ${result.failed} failures`);
    }
  }

  console.log('\n' + '='.repeat(60));
  log.header('OVERALL TEST SUMMARY');
  console.log('='.repeat(60));

  let totalPassed = 0;
  let totalFailed = 0;
  let totalCritical = 0;
  let totalTests = 0;
  let criticalAPIs = 0;
  let fullyFunctional = 0;

  results.forEach(result => {
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalCritical += result.critical;
    totalTests += result.total;
    
    if (result.critical > 0) {
      criticalAPIs++;
    }
    
    if (result.success && result.critical === 0) {
      fullyFunctional++;
    }
  });

  const overallPercentage = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${totalPassed} (${overallPercentage}%)`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`🚨 Critical Failures: ${totalCritical}`);
  console.log(`🎯 Fully Functional APIs: ${fullyFunctional}/${results.length}`);
  console.log(`⚠️  APIs with Critical Issues: ${criticalAPIs}`);

  console.log('\n' + '='.repeat(60));
  log.header('DETAILED BREAKDOWN');
  console.log('='.repeat(60));

  results.forEach(result => {
    const status = result.success && result.critical === 0 ? '🟢 FULLY FUNCTIONAL' : 
                  result.critical > 0 ? '🔴 CRITICAL ISSUES' : '🟡 MINOR ISSUES';
    
    console.log(`${result.name}: ${status} (${result.percentage}%)`);
    
    if (result.critical > 0) {
      console.log(`  └─ ${result.critical} critical failures need immediate attention`);
    }
    if (result.failed > 0 && result.critical === 0) {
      console.log(`  └─ ${result.failed} non-critical issues`);
    }
  });

  console.log('\n' + '='.repeat(60));
  
  if (overallPercentage === 100) {
    log.success('🎉 ALL APIS ARE 100% FUNCTIONAL!');
  } else if (overallPercentage >= 80) {
    log.warning(`System is ${overallPercentage}% functional. Minor fixes needed.`);
  } else if (overallPercentage >= 60) {
    log.error(`System is ${overallPercentage}% functional. Major fixes required.`);
  } else {
    log.error(`System is ${overallPercentage}% functional. Critical issues need immediate attention.`);
  }

  console.log('='.repeat(60));
  
  process.exit(overallPercentage === 100 ? 0 : 1);
}

runAllTests().catch(error => {
  console.error('Test execution failed:', error.message);
  process.exit(1);
});
