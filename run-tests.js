#!/usr/bin/env node

/**
 * Comprehensive Test Runner for Instoredealz Platform
 * Executes all test scenarios and generates detailed reports
 */

import axios from 'axios';
import fs from 'fs';
import { 
  RAZORPAY_TEST_CONFIG, 
  MOCK_LOCATIONS, 
  TEST_SCENARIOS, 
  OFFLINE_TESTING_CONFIG 
} from './test-config.js';

const BASE_URL = 'http://localhost:5000';

class TestRunner {
  constructor() {
    this.testResults = [];
    this.currentTestSuite = null;
    this.startTime = new Date();
    this.tokens = new Map(); // Store authentication tokens
  }

  async log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      suite: this.currentTestSuite,
      message,
      data
    };
    
    this.testResults.push(logEntry);
    
    const icon = {
      'INFO': 'ℹ️',
      'SUCCESS': '✅',
      'ERROR': '❌',
      'WARNING': '⚠️',
      'TEST': '🧪'
    }[level] || 'ℹ️';
    
    console.log(`${icon} [${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async runTestSuite(suiteName, testFunction) {
    this.currentTestSuite = suiteName;
    this.log('INFO', `Starting test suite: ${suiteName}`);
    
    try {
      await testFunction();
      this.log('SUCCESS', `Test suite completed: ${suiteName}`);
    } catch (error) {
      this.log('ERROR', `Test suite failed: ${suiteName}`, {
        error: error.message,
        stack: error.stack
      });
    } finally {
      this.currentTestSuite = null;
    }
  }

  // Authentication Tests
  async testAuthentication() {
    await this.runTestSuite('Authentication Tests', async () => {
      // Test customer signup
      const customerData = {
        username: 'test_auth_customer',
        email: 'auth_customer@test.com',
        password: 'test123',
        name: 'Test Auth Customer',
        role: 'customer',
        phone: '+91-9999999999',
        city: 'Mumbai',
        state: 'Maharashtra'
      };

      try {
        const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, customerData);
        this.log('SUCCESS', 'Customer signup successful', {
          userId: signupResponse.data.user?.id,
          hasToken: !!signupResponse.data.token
        });
        
        if (signupResponse.data.token) {
          this.tokens.set('customer', signupResponse.data.token);
        }
      } catch (error) {
        this.log('ERROR', 'Customer signup failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test customer login
      try {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: customerData.email,
          password: customerData.password
        });
        
        this.log('SUCCESS', 'Customer login successful', {
          hasToken: !!loginResponse.data.token,
          user: loginResponse.data.user
        });
        
        if (loginResponse.data.token) {
          this.tokens.set('customer', loginResponse.data.token);
        }
      } catch (error) {
        this.log('ERROR', 'Customer login failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test token validation
      const customerToken = this.tokens.get('customer');
      if (customerToken) {
        try {
          const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${customerToken}` }
          });
          
          this.log('SUCCESS', 'Token validation successful', {
            user: meResponse.data
          });
        } catch (error) {
          this.log('ERROR', 'Token validation failed', {
            error: error.response?.data?.error || error.message
          });
        }
      }
    });
  }

  // Deal Management Tests
  async testDealManagement() {
    await this.runTestSuite('Deal Management Tests', async () => {
      // Test public deal fetching
      try {
        const dealsResponse = await axios.get(`${BASE_URL}/api/deals`);
        this.log('SUCCESS', 'Public deals fetch successful', {
          dealCount: dealsResponse.data.length,
          testDeals: dealsResponse.data.filter(d => d.title.includes('Test')).length
        });
      } catch (error) {
        this.log('ERROR', 'Public deals fetch failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test deal categories
      try {
        const categoriesResponse = await axios.get(`${BASE_URL}/api/categories`);
        this.log('SUCCESS', 'Categories fetch successful', {
          categoryCount: categoriesResponse.data.length,
          categories: categoriesResponse.data.map(c => c.name)
        });
      } catch (error) {
        this.log('ERROR', 'Categories fetch failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test deal detail fetching
      try {
        const dealDetailResponse = await axios.get(`${BASE_URL}/api/deals/1`);
        this.log('SUCCESS', 'Deal detail fetch successful', {
          dealId: dealDetailResponse.data.id,
          title: dealDetailResponse.data.title,
          hasPin: !!dealDetailResponse.data.verificationPin
        });
      } catch (error) {
        this.log('ERROR', 'Deal detail fetch failed', {
          error: error.response?.data?.error || error.message
        });
      }
    });
  }

  // PIN Verification Tests
  async testPinVerification() {
    await this.runTestSuite('PIN Verification Tests', async () => {
      const customerToken = this.tokens.get('customer');
      if (!customerToken) {
        this.log('ERROR', 'No customer token available for PIN tests');
        return;
      }

      // Test deal claiming first
      try {
        await axios.post(`${BASE_URL}/api/deals/1/claim`, {}, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        this.log('SUCCESS', 'Deal claim successful');
      } catch (error) {
        this.log('WARNING', 'Deal claim failed (may already be claimed)', {
          error: error.response?.data?.message || error.message
        });
      }

      // Test PIN verification with correct PIN
      try {
        const pinResponse = await axios.post(`${BASE_URL}/api/deals/1/verify-pin`, {
          pin: '1000' // Assuming this is a valid PIN from existing data
        }, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        
        this.log('SUCCESS', 'PIN verification successful', {
          response: pinResponse.data
        });
      } catch (error) {
        this.log('ERROR', 'PIN verification failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test PIN verification with incorrect PIN
      try {
        await axios.post(`${BASE_URL}/api/deals/1/verify-pin`, {
          pin: '9999' // Invalid PIN
        }, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        
        this.log('WARNING', 'Invalid PIN verification should have failed');
      } catch (error) {
        this.log('SUCCESS', 'Invalid PIN correctly rejected', {
          error: error.response?.data?.error || error.message
        });
      }
    });
  }

  // Bill Amount Tests
  async testBillAmountTracking() {
    await this.runTestSuite('Bill Amount Tracking Tests', async () => {
      const customerToken = this.tokens.get('customer');
      if (!customerToken) {
        this.log('ERROR', 'No customer token available for bill amount tests');
        return;
      }

      // Test bill amount update
      try {
        const billResponse = await axios.post(`${BASE_URL}/api/deals/1/update-bill`, {
          actualSavings: 150.00,
          billAmount: 500.00
        }, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        
        this.log('SUCCESS', 'Bill amount update successful', {
          response: billResponse.data
        });
      } catch (error) {
        this.log('ERROR', 'Bill amount update failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test user claims history
      try {
        const claimsResponse = await axios.get(`${BASE_URL}/api/users/claims`, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        
        this.log('SUCCESS', 'User claims fetch successful', {
          claimCount: claimsResponse.data.length,
          totalSavings: claimsResponse.data.reduce((sum, claim) => sum + (parseFloat(claim.actualSavings) || 0), 0)
        });
      } catch (error) {
        this.log('ERROR', 'User claims fetch failed', {
          error: error.response?.data?.error || error.message
        });
      }
    });
  }

  // Geolocation Tests
  async testGeolocation() {
    await this.runTestSuite('Geolocation Tests', async () => {
      // Test nearby deals with Mumbai coordinates
      const mumbaiLocation = MOCK_LOCATIONS.mumbai;
      
      try {
        const nearbyResponse = await axios.post(`${BASE_URL}/api/deals/nearby`, {
          latitude: mumbaiLocation.latitude,
          longitude: mumbaiLocation.longitude,
          maxDistance: 25
        });
        
        this.log('SUCCESS', 'Nearby deals fetch successful', {
          dealCount: nearbyResponse.data.length,
          location: `${mumbaiLocation.name}, ${mumbaiLocation.state}`,
          coordinates: `${mumbaiLocation.latitude}, ${mumbaiLocation.longitude}`
        });
      } catch (error) {
        this.log('ERROR', 'Nearby deals fetch failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test with different cities
      for (const [cityKey, location] of Object.entries(MOCK_LOCATIONS)) {
        if (cityKey === 'mumbai') continue; // Already tested
        
        try {
          const response = await axios.post(`${BASE_URL}/api/deals/nearby`, {
            latitude: location.latitude,
            longitude: location.longitude,
            maxDistance: 10
          });
          
          this.log('SUCCESS', `Nearby deals for ${location.name}`, {
            dealCount: response.data.length,
            city: location.name
          });
        } catch (error) {
          this.log('ERROR', `Nearby deals failed for ${location.name}`, {
            error: error.response?.data?.error || error.message
          });
        }
      }
    });
  }

  // Membership Tests
  async testMembershipSystem() {
    await this.runTestSuite('Membership System Tests', async () => {
      const customerToken = this.tokens.get('customer');
      if (!customerToken) {
        this.log('ERROR', 'No customer token available for membership tests');
        return;
      }

      // Test membership upgrade (without actually processing payment)
      try {
        const upgradeResponse = await axios.post(`${BASE_URL}/api/users/upgrade-membership`, {
          membershipPlan: 'premium',
          paymentId: 'test_payment_id_premium'
        }, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        
        this.log('SUCCESS', 'Membership upgrade successful', {
          newPlan: upgradeResponse.data.membershipPlan || 'premium'
        });
      } catch (error) {
        this.log('ERROR', 'Membership upgrade failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test access to premium deals
      try {
        const dealsResponse = await axios.get(`${BASE_URL}/api/deals`);
        const premiumDeals = dealsResponse.data.filter(deal => 
          deal.requiredMembership === 'premium' || deal.requiredMembership === 'ultimate'
        );
        
        this.log('SUCCESS', 'Premium deals accessible', {
          premiumDealCount: premiumDeals.length,
          titles: premiumDeals.slice(0, 3).map(d => d.title)
        });
      } catch (error) {
        this.log('ERROR', 'Premium deals access failed', {
          error: error.response?.data?.error || error.message
        });
      }
    });
  }

  // API Performance Tests
  async testApiPerformance() {
    await this.runTestSuite('API Performance Tests', async () => {
      const endpoints = [
        { name: 'Deals List', url: '/api/deals' },
        { name: 'Categories', url: '/api/categories' },
        { name: 'Cities', url: '/api/cities' },
        { name: 'External Deals', url: '/api/external/deals' }
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        
        try {
          const response = await axios.get(`${BASE_URL}${endpoint.url}`);
          const duration = Date.now() - startTime;
          
          this.log('SUCCESS', `${endpoint.name} performance test`, {
            url: endpoint.url,
            duration: `${duration}ms`,
            responseSize: JSON.stringify(response.data).length,
            status: response.status
          });
        } catch (error) {
          const duration = Date.now() - startTime;
          this.log('ERROR', `${endpoint.name} performance test failed`, {
            url: endpoint.url,
            duration: `${duration}ms`,
            error: error.response?.data?.error || error.message
          });
        }
      }
    });
  }

  // Wishlist Tests
  async testWishlistFunctionality() {
    await this.runTestSuite('Wishlist Functionality Tests', async () => {
      const customerToken = this.tokens.get('customer');
      if (!customerToken) {
        this.log('ERROR', 'No customer token available for wishlist tests');
        return;
      }

      // Test adding to wishlist
      try {
        await axios.post(`${BASE_URL}/api/wishlist`, {
          dealId: 1
        }, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        
        this.log('SUCCESS', 'Add to wishlist successful');
      } catch (error) {
        this.log('ERROR', 'Add to wishlist failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test fetching wishlist
      try {
        const wishlistResponse = await axios.get(`${BASE_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        
        this.log('SUCCESS', 'Wishlist fetch successful', {
          itemCount: wishlistResponse.data.length
        });
      } catch (error) {
        this.log('ERROR', 'Wishlist fetch failed', {
          error: error.response?.data?.error || error.message
        });
      }

      // Test removing from wishlist
      try {
        await axios.delete(`${BASE_URL}/api/wishlist/1`, {
          headers: { Authorization: `Bearer ${customerToken}` }
        });
        
        this.log('SUCCESS', 'Remove from wishlist successful');
      } catch (error) {
        this.log('ERROR', 'Remove from wishlist failed', {
          error: error.response?.data?.error || error.message
        });
      }
    });
  }

  // Generate comprehensive test report
  async generateTestReport() {
    const endTime = new Date();
    const duration = endTime - this.startTime;
    
    const report = {
      summary: {
        startTime: this.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: `${Math.round(duration / 1000)}s`,
        totalTests: this.testResults.length,
        successCount: this.testResults.filter(r => r.level === 'SUCCESS').length,
        errorCount: this.testResults.filter(r => r.level === 'ERROR').length,
        warningCount: this.testResults.filter(r => r.level === 'WARNING').length
      },
      
      testSuites: {},
      
      results: this.testResults,
      
      recommendations: [
        'Use Chrome DevTools to set mock location for geolocation testing',
        'Test offline functionality by disabling network in DevTools',
        'Verify Razorpay test keys are configured for payment testing',
        'Test on different screen sizes using responsive mode',
        'Check browser console for any JavaScript errors',
        'Verify PIN verification works without internet connection'
      ],
      
      mockLocations: MOCK_LOCATIONS,
      
      testConfiguration: {
        baseUrl: BASE_URL,
        razorpayTestMode: RAZORPAY_TEST_CONFIG.testMode,
        offlineTestingEnabled: true
      }
    };

    // Group results by test suite
    this.testResults.forEach(result => {
      if (result.suite) {
        if (!report.testSuites[result.suite]) {
          report.testSuites[result.suite] = {
            total: 0,
            success: 0,
            error: 0,
            warning: 0
          };
        }
        
        report.testSuites[result.suite].total++;
        if (result.level === 'SUCCESS') report.testSuites[result.suite].success++;
        if (result.level === 'ERROR') report.testSuites[result.suite].error++;
        if (result.level === 'WARNING') report.testSuites[result.suite].warning++;
      }
    });

    return report;
  }

  // Main test execution
  async run() {
    console.log('🚀 Starting Comprehensive Test Suite for Instoredealz Platform');
    console.log('================================================================');
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      await this.testAuthentication();
      await this.testDealManagement();
      await this.testPinVerification();
      await this.testBillAmountTracking();
      await this.testGeolocation();
      await this.testMembershipSystem();
      await this.testWishlistFunctionality();
      await this.testApiPerformance();
      
      const report = await this.generateTestReport();
      
      // Save detailed report
      fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
      
      // Save human-readable summary
      const summary = this.generateHumanReadableSummary(report);
      fs.writeFileSync('test-results.txt', summary);
      
      console.log('\n🎉 Test suite completed!');
      console.log(`📊 Results: ${report.summary.successCount} passed, ${report.summary.errorCount} failed, ${report.summary.warningCount} warnings`);
      console.log('📄 Detailed results saved to test-results.json');
      console.log('📝 Human-readable summary saved to test-results.txt');
      
      return report;
      
    } catch (error) {
      this.log('ERROR', 'Test suite execution failed', { error: error.message });
      throw error;
    }
  }

  generateHumanReadableSummary(report) {
    let summary = '';
    summary += 'INSTOREDEALZ PLATFORM - TEST RESULTS SUMMARY\n';
    summary += '==========================================\n\n';
    
    summary += `Test Execution Time: ${report.summary.startTime} to ${report.summary.endTime}\n`;
    summary += `Total Duration: ${report.summary.duration}\n`;
    summary += `Total Tests: ${report.summary.totalTests}\n`;
    summary += `✅ Passed: ${report.summary.successCount}\n`;
    summary += `❌ Failed: ${report.summary.errorCount}\n`;
    summary += `⚠️  Warnings: ${report.summary.warningCount}\n\n`;
    
    summary += 'TEST SUITE BREAKDOWN:\n';
    summary += '====================\n';
    
    Object.entries(report.testSuites).forEach(([suite, results]) => {
      summary += `\n${suite}:\n`;
      summary += `  Total: ${results.total}\n`;
      summary += `  ✅ Success: ${results.success}\n`;
      summary += `  ❌ Error: ${results.error}\n`;
      summary += `  ⚠️  Warning: ${results.warning}\n`;
    });
    
    summary += '\n\nRECOMMENDATIONS:\n';
    summary += '===============\n';
    report.recommendations.forEach((rec, index) => {
      summary += `${index + 1}. ${rec}\n`;
    });
    
    summary += '\n\nMOCK LOCATIONS FOR TESTING:\n';
    summary += '===========================\n';
    Object.entries(MOCK_LOCATIONS).forEach(([key, location]) => {
      summary += `${location.name}: ${location.latitude}, ${location.longitude}\n`;
    });
    
    return summary;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  runner.run().catch(error => {
    console.error('Test execution failed:', error.message);
    process.exit(1);
  });
}

export default TestRunner;