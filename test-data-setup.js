#!/usr/bin/env node

/**
 * Test Data Setup Script for Instoredealz Platform
 * Creates comprehensive test users, vendors, and deals for testing all features
 */

import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000';

// Test Configuration
const TEST_CONFIG = {
  // Razorpay Test Mode Configuration
  razorpay: {
    testMode: true,
    testKeyId: 'rzp_test_key', // User should replace with actual test key
    testKeySecret: 'rzp_test_secret', // User should replace with actual test secret
    webhookSecret: 'test_webhook_secret'
  },
  
  // Mock Geolocation Data for Major Indian Cities
  locations: {
    mumbai: { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
    delhi: { lat: 28.6139, lng: 77.2090, name: 'Delhi' },
    bangalore: { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
    chennai: { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
    hyderabad: { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
    pune: { lat: 18.5204, lng: 73.8567, name: 'Pune' },
    kolkata: { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
    ahmedabad: { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' }
  }
};

// Test Users Data
const TEST_USERS = [
  // Customer Test Accounts
  {
    username: 'test_customer_basic',
    email: 'basic@test.instoredealz.com',
    password: 'test123',
    name: 'Basic Customer',
    role: 'customer',
    phone: '+91-9876543210',
    city: 'Mumbai',
    state: 'Maharashtra',
    membershipPlan: 'basic',
    isPromotionalUser: true
  },
  {
    username: 'test_customer_premium',
    email: 'premium@test.instoredealz.com',
    password: 'test123',
    name: 'Premium Customer',
    role: 'customer',
    phone: '+91-9876543211',
    city: 'Delhi',
    state: 'Delhi',
    membershipPlan: 'premium',
    isPromotionalUser: true
  },
  {
    username: 'test_customer_ultimate',
    email: 'ultimate@test.instoredealz.com',
    password: 'test123',
    name: 'Ultimate Customer',
    role: 'customer',
    phone: '+91-9876543212',
    city: 'Bangalore',
    state: 'Karnataka',
    membershipPlan: 'ultimate',
    isPromotionalUser: true
  },
  
  // Vendor Test Accounts
  {
    username: 'test_vendor_fashion',
    email: 'fashion@test.vendor.com',
    password: 'vendor123',
    name: 'Fashion Store Owner',
    role: 'vendor',
    phone: '+91-9876543220',
    city: 'Mumbai',
    state: 'Maharashtra',
    isPromotionalUser: true
  },
  {
    username: 'test_vendor_electronics',
    email: 'electronics@test.vendor.com',
    password: 'vendor123',
    name: 'Electronics Store Owner',
    role: 'vendor',
    phone: '+91-9876543221',
    city: 'Delhi',
    state: 'Delhi',
    isPromotionalUser: true
  },
  {
    username: 'test_vendor_restaurant',
    email: 'restaurant@test.vendor.com',
    password: 'vendor123',
    name: 'Restaurant Owner',
    role: 'vendor',
    phone: '+91-9876543222',
    city: 'Bangalore',
    state: 'Karnataka',
    isPromotionalUser: true
  },
  
  // Admin Test Accounts
  {
    username: 'test_admin',
    email: 'admin@test.instoredealz.com',
    password: 'admin123',
    name: 'Test Administrator',
    role: 'admin',
    phone: '+91-9876543230',
    city: 'Mumbai',
    state: 'Maharashtra',
    isPromotionalUser: true
  },
  {
    username: 'test_superadmin',
    email: 'superadmin@test.instoredealz.com',
    password: 'superadmin123',
    name: 'Test Super Administrator',
    role: 'superadmin',
    phone: '+91-9876543231',
    city: 'Mumbai',
    state: 'Maharashtra',
    isPromotionalUser: true
  }
];

// Test Vendor Business Data
const TEST_VENDOR_BUSINESSES = [
  {
    userEmail: 'fashion@test.vendor.com',
    businessName: 'Test Fashion Boutique',
    gstNumber: 'TEST27ABCDE1234F1Z5',
    panNumber: 'TESTAB1234F',
    description: 'Premium fashion boutique for testing deal creation and POS functionality',
    address: 'Test Mall, Shop 101, Fashion Street',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: '19.0760',
    longitude: '72.8777'
  },
  {
    userEmail: 'electronics@test.vendor.com',
    businessName: 'Test Electronics Store',
    gstNumber: 'TEST07FGHIJ5678K2L9',
    panNumber: 'TESTCD5678K',
    description: 'Electronics store for testing gadget deals and PIN verification',
    address: 'Test Complex, Shop 201, Tech Hub',
    city: 'Delhi',
    state: 'Delhi',
    latitude: '28.6139',
    longitude: '77.2090'
  },
  {
    userEmail: 'restaurant@test.vendor.com',
    businessName: 'Test Food Corner',
    gstNumber: 'TEST29MNOPQ9012R3S4',
    panNumber: 'TESTEF9012R',
    description: 'Restaurant for testing food deals and bill amount tracking',
    address: 'Test Street, Food Court 301',
    city: 'Bangalore',
    state: 'Karnataka',
    latitude: '12.9716',
    longitude: '77.5946'
  }
];

// Test Deals Data
const TEST_DEALS = [
  {
    vendorEmail: 'fashion@test.vendor.com',
    title: 'Test Fashion Deal - Designer Clothing',
    description: 'Test deal for premium designer clothing with PIN verification',
    category: 'fashion',
    subcategory: 'clothing',
    discountPercentage: 25,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    maxRedemptions: 50,
    requiredMembership: 'basic',
    address: 'Test Mall, Shop 101, Fashion Street, Mumbai',
    latitude: '19.0760',
    longitude: '72.8777',
    verificationPin: '1111'
  },
  {
    vendorEmail: 'electronics@test.vendor.com',
    title: 'Test Electronics Deal - Smartphones',
    description: 'Test deal for latest smartphones with premium membership',
    category: 'electronics',
    subcategory: 'mobile',
    discountPercentage: 15,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxRedemptions: 30,
    requiredMembership: 'premium',
    address: 'Test Complex, Shop 201, Tech Hub, Delhi',
    latitude: '28.6139',
    longitude: '77.2090',
    verificationPin: '2222'
  },
  {
    vendorEmail: 'restaurant@test.vendor.com',
    title: 'Test Food Deal - Ultimate Dining',
    description: 'Test deal for fine dining experience with ultimate membership',
    category: 'food',
    subcategory: 'dining',
    discountPercentage: 30,
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    maxRedemptions: 20,
    requiredMembership: 'ultimate',
    address: 'Test Street, Food Court 301, Bangalore',
    latitude: '12.9716',
    longitude: '77.5946',
    verificationPin: '3333'
  }
];

class TestDataSetup {
  constructor() {
    this.createdUsers = [];
    this.createdVendors = [];
    this.createdDeals = [];
    this.testResults = [];
  }

  async log(message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, data };
    this.testResults.push(logEntry);
    console.log(`[${timestamp}] ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  async createTestUsers() {
    this.log('Creating test users...');
    
    for (const userData of TEST_USERS) {
      try {
        const response = await axios.post(`${BASE_URL}/api/auth/signup`, userData);
        this.createdUsers.push({
          ...userData,
          id: response.data.user?.id,
          token: response.data.token
        });
        this.log(`✅ Created user: ${userData.username}`, { 
          id: response.data.user?.id,
          role: userData.role,
          membership: userData.membershipPlan 
        });
      } catch (error) {
        this.log(`❌ Failed to create user: ${userData.username}`, {
          error: error.response?.data?.error || error.message
        });
      }
    }
  }

  async createTestVendorBusinesses() {
    this.log('Creating test vendor businesses...');
    
    for (const vendorData of TEST_VENDOR_BUSINESSES) {
      try {
        // Find the vendor user
        const vendorUser = this.createdUsers.find(u => u.email === vendorData.userEmail);
        if (!vendorUser) {
          this.log(`❌ Vendor user not found: ${vendorData.userEmail}`);
          continue;
        }

        const response = await axios.post(`${BASE_URL}/api/vendors/register`, vendorData, {
          headers: { Authorization: `Bearer ${vendorUser.token}` }
        });
        
        this.createdVendors.push({
          ...vendorData,
          id: response.data.vendor?.id,
          userId: vendorUser.id
        });
        
        this.log(`✅ Created vendor business: ${vendorData.businessName}`, {
          id: response.data.vendor?.id,
          userId: vendorUser.id
        });
      } catch (error) {
        this.log(`❌ Failed to create vendor business: ${vendorData.businessName}`, {
          error: error.response?.data?.error || error.message
        });
      }
    }
  }

  async approveTestVendors() {
    this.log('Approving test vendors...');
    
    // Find admin user
    const adminUser = this.createdUsers.find(u => u.role === 'admin');
    if (!adminUser) {
      this.log('❌ Admin user not found for vendor approval');
      return;
    }

    for (const vendor of this.createdVendors) {
      try {
        await axios.post(`${BASE_URL}/api/admin/vendors/${vendor.id}/approve`, {}, {
          headers: { Authorization: `Bearer ${adminUser.token}` }
        });
        this.log(`✅ Approved vendor: ${vendor.businessName}`);
      } catch (error) {
        this.log(`❌ Failed to approve vendor: ${vendor.businessName}`, {
          error: error.response?.data?.error || error.message
        });
      }
    }
  }

  async createTestDeals() {
    this.log('Creating test deals...');
    
    for (const dealData of TEST_DEALS) {
      try {
        // Find the vendor user
        const vendorUser = this.createdUsers.find(u => u.email === dealData.vendorEmail);
        if (!vendorUser) {
          this.log(`❌ Vendor user not found: ${dealData.vendorEmail}`);
          continue;
        }

        const response = await axios.post(`${BASE_URL}/api/vendors/deals`, dealData, {
          headers: { Authorization: `Bearer ${vendorUser.token}` }
        });
        
        this.createdDeals.push({
          ...dealData,
          id: response.data.deal?.id
        });
        
        this.log(`✅ Created deal: ${dealData.title}`, {
          id: response.data.deal?.id,
          pin: dealData.verificationPin,
          membership: dealData.requiredMembership
        });
      } catch (error) {
        this.log(`❌ Failed to create deal: ${dealData.title}`, {
          error: error.response?.data?.error || error.message
        });
      }
    }
  }

  async approveTestDeals() {
    this.log('Approving test deals...');
    
    // Find admin user
    const adminUser = this.createdUsers.find(u => u.role === 'admin');
    if (!adminUser) {
      this.log('❌ Admin user not found for deal approval');
      return;
    }

    for (const deal of this.createdDeals) {
      try {
        await axios.post(`${BASE_URL}/api/admin/deals/${deal.id}/approve`, {}, {
          headers: { Authorization: `Bearer ${adminUser.token}` }
        });
        this.log(`✅ Approved deal: ${deal.title}`);
      } catch (error) {
        this.log(`❌ Failed to approve deal: ${deal.title}`, {
          error: error.response?.data?.error || error.message
        });
      }
    }
  }

  async testBasicFlows() {
    this.log('Testing basic application flows...');
    
    try {
      // Test customer login
      const customerUser = this.createdUsers.find(u => u.role === 'customer' && u.membershipPlan === 'basic');
      if (customerUser) {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: customerUser.email,
          password: customerUser.password
        });
        this.log('✅ Customer login test passed', { token: !!loginResponse.data.token });
      }

      // Test deal fetching
      const dealsResponse = await axios.get(`${BASE_URL}/api/deals`);
      this.log('✅ Deal fetching test passed', { 
        dealCount: dealsResponse.data.length,
        testDeals: dealsResponse.data.filter(d => d.title.includes('Test')).length
      });

      // Test categories
      const categoriesResponse = await axios.get(`${BASE_URL}/api/categories`);
      this.log('✅ Categories test passed', { 
        categoryCount: categoriesResponse.data.length 
      });

    } catch (error) {
      this.log('❌ Basic flow test failed', {
        error: error.response?.data?.error || error.message
      });
    }
  }

  async generateTestReport() {
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        usersCreated: this.createdUsers.length,
        vendorsCreated: this.createdVendors.length,
        dealsCreated: this.createdDeals.length,
        totalTests: this.testResults.length
      },
      testAccounts: {
        customers: this.createdUsers.filter(u => u.role === 'customer').map(u => ({
          username: u.username,
          email: u.email,
          password: u.password,
          membership: u.membershipPlan,
          id: u.id
        })),
        vendors: this.createdUsers.filter(u => u.role === 'vendor').map(u => ({
          username: u.username,
          email: u.email,
          password: u.password,
          businessName: this.createdVendors.find(v => v.userEmail === u.email)?.businessName,
          id: u.id
        })),
        admins: this.createdUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').map(u => ({
          username: u.username,
          email: u.email,
          password: u.password,
          role: u.role,
          id: u.id
        }))
      },
      testDeals: this.createdDeals.map(d => ({
        title: d.title,
        category: d.category,
        pin: d.verificationPin,
        membership: d.requiredMembership,
        id: d.id
      })),
      mockLocations: TEST_CONFIG.locations,
      razorpayConfig: {
        testMode: TEST_CONFIG.razorpay.testMode,
        note: 'Replace test keys with actual Razorpay test credentials'
      },
      testResults: this.testResults
    };

    return report;
  }

  async run() {
    console.log('🚀 Starting Test Data Setup for Instoredealz Platform');
    console.log('================================================');
    
    try {
      await this.createTestUsers();
      await this.createTestVendorBusinesses();
      await this.approveTestVendors();
      await this.createTestDeals();
      await this.approveTestDeals();
      await this.testBasicFlows();
      
      const report = await this.generateTestReport();
      
      // Save report to file
      fs.writeFileSync('test-results.json', JSON.stringify(report, null, 2));
      
      this.log('🎉 Test data setup completed successfully!');
      this.log('📄 Test report saved to test-results.json');
      
      return report;
    } catch (error) {
      this.log('💥 Test setup failed', { error: error.message });
      throw error;
    }
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new TestDataSetup();
  setup.run().then(report => {
    console.log('\n📊 Test Setup Summary:');
    console.log(`Users Created: ${report.summary.usersCreated}`);
    console.log(`Vendors Created: ${report.summary.vendorsCreated}`);
    console.log(`Deals Created: ${report.summary.dealsCreated}`);
    console.log('\n💡 Use Chrome DevTools to set mock location for geolocation testing');
    console.log('💡 Check test-results.json for complete test data and credentials');
  }).catch(error => {
    console.error('Setup failed:', error.message);
    process.exit(1);
  });
}

export default TestDataSetup;