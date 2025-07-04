// Test PIN verification system
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function testPinVerification() {
  try {
    console.log('Testing PIN verification system...\n');
    
    // Test 1: Check if PIN debug endpoint works
    console.log('1. Testing PIN debug endpoint...');
    const debugResponse = await axios.get(`${BASE_URL}/api/deals/1/debug-pin`);
    console.log('Debug response:', debugResponse.data);
    
    // Test 2: Check if we can get deal details (public)
    console.log('\n2. Testing public deal details...');
    const dealResponse = await axios.get(`${BASE_URL}/api/deals/1`);
    console.log('Public deal PIN (should be undefined):', dealResponse.data.verificationPin);
    
    // Test 3: Register a test user
    console.log('\n3. Registering test user...');
    const userEmail = `test-${Date.now()}@example.com`;
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        username: `testuser${Date.now()}`,
        email: userEmail,
        password: 'password123',
        name: 'Test User',
        phone: '9876543210',
        city: 'Mumbai',
        state: 'Maharashtra'
      });
      console.log('User registered successfully');
    } catch (error) {
      console.log('Registration error (expected if user exists):', error.response?.data?.message);
    }
    
    // Test 4: Login the test user
    console.log('\n4. Logging in test user...');
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: userEmail,
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, got token');
    
    // Test 5: Check secure deal details (with auth)
    console.log('\n5. Testing secure deal details (with auth)...');
    const secureResponse = await axios.get(`${BASE_URL}/api/deals/1/secure`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Secure deal PIN (should be available):', secureResponse.data.verificationPin);
    
    // Test 6: First claim the deal
    console.log('\n6. Claiming deal first...');
    try {
      const claimResponse = await axios.post(`${BASE_URL}/api/deals/1/claim`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Deal claimed successfully');
    } catch (error) {
      console.log('Claim error (may already be claimed):', error.response?.data?.message);
    }
    
    // Test 7: Test PIN verification (with auth)
    console.log('\n7. Testing PIN verification (with auth)...');
    try {
      const pinResponse = await axios.post(`${BASE_URL}/api/deals/1/verify-pin`, 
        { pin: '1000' }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('PIN verification response:', pinResponse.data);
    } catch (error) {
      console.log('PIN verification error:', error.response?.data?.error || error.message);
    }
    
    console.log('\n✅ PIN verification system test completed!');
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

testPinVerification();