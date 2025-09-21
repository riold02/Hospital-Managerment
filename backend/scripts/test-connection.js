#!/usr/bin/env node

// ============================================================================
// CONNECTION TEST SCRIPT
// Tests connection between frontend and backend
// ============================================================================

const http = require('http');
const https = require('https');

class ConnectionTester {
  constructor() {
    this.results = [];
  }

  // Test HTTP connection
  testConnection(url, timeout = 5000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const urlObj = new URL(url);
      const client = urlObj.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: timeout,
        headers: {
          'User-Agent': 'Connection-Tester/1.0'
        }
      };

      const req = client.request(options, (res) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            url,
            success: true,
            status: res.statusCode,
            responseTime,
            headers: res.headers,
            data: data.substring(0, 200) // First 200 chars
          });
        });
      });

      req.on('error', (error) => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        resolve({
          url,
          success: false,
          error: error.message,
          responseTime
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          url,
          success: false,
          error: 'Connection timeout',
          responseTime: timeout
        });
      });

      req.end();
    });
  }

  // Test multiple endpoints
  async testEndpoints(endpoints) {
    console.log('🔍 Testing connections...\n');
    
    for (const endpoint of endpoints) {
      console.log(`Testing: ${endpoint.url}`);
      const result = await this.testConnection(endpoint.url, endpoint.timeout);
      this.results.push(result);
      
      if (result.success) {
        console.log(`✅ ${endpoint.name}: OK (${result.responseTime}ms, Status: ${result.status})`);
      } else {
        console.log(`❌ ${endpoint.name}: FAILED - ${result.error}`);
      }
      console.log('');
    }
  }

  // Generate report
  generateReport() {
    console.log('\n📊 CONNECTION TEST REPORT');
    console.log('='.repeat(50));
    
    const successful = this.results.filter(r => r.success);
    const failed = this.results.filter(r => !r.success);
    
    console.log(`\n✅ Successful: ${successful.length}/${this.results.length}`);
    console.log(`❌ Failed: ${failed.length}/${this.results.length}`);
    
    if (successful.length > 0) {
      console.log('\n📈 Response Times:');
      successful.forEach(result => {
        console.log(`  • ${result.url}: ${result.responseTime}ms`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n🚨 Failed Connections:');
      failed.forEach(result => {
        console.log(`  • ${result.url}: ${result.error}`);
      });
    }
    
    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    
    if (failed.length === 0) {
      console.log('🎉 All connections are working perfectly!');
    } else {
      console.log('🔧 Troubleshooting steps:');
      console.log('  1. Check if backend server is running');
      console.log('  2. Verify port numbers are correct');
      console.log('  3. Check firewall settings');
      console.log('  4. Ensure CORS is properly configured');
      console.log('  5. Check network connectivity');
    }
    
    console.log('\n' + '='.repeat(50));
  }
}

// Main execution
async function main() {
  const tester = new ConnectionTester();
  
  // Define endpoints to test
  const endpoints = [
    {
      name: 'Backend Health Check',
      url: 'http://localhost:3001/api/v1/health',
      timeout: 5000
    },
    {
      name: 'Backend API Root',
      url: 'http://localhost:3001/api/v1',
      timeout: 5000
    },
    {
      name: 'Frontend App',
      url: 'http://localhost:3002',
      timeout: 5000
    },
    {
      name: 'PostgreSQL (via pgAdmin)',
      url: 'http://localhost:5050',
      timeout: 5000
    }
  ];

  await tester.testEndpoints(endpoints);
  tester.generateReport();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = ConnectionTester;

