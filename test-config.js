/**
 * Test Configuration for Instoredealz Platform
 * Contains all test settings, mock data, and external service configurations
 */

// Razorpay Test Configuration
const RAZORPAY_TEST_CONFIG = {
  testMode: true,
  testKeyId: process.env.RAZORPAY_TEST_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXX',
  testKeySecret: process.env.RAZORPAY_TEST_KEY_SECRET || 'test_secret_key',
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret',
  
  // Test payment scenarios
  testScenarios: {
    // Success scenarios
    successCard: {
      number: '4111111111111111',
      expiry: '12/25',
      cvv: '123',
      name: 'Test Customer'
    },
    successUPI: {
      vpa: 'success@razorpay'
    },
    
    // Failure scenarios for testing error handling
    failureCard: {
      number: '4000000000000002',
      expiry: '12/25',
      cvv: '123',
      name: 'Test Failure'
    },
    
    // Test amounts (in paisa)
    premiumPlan: 50000, // ₹500
    ultimatePlan: 100000, // ₹1000
    testAmount: 100 // ₹1 for testing
  },
  
  // Test webhook events
  webhookEvents: {
    paymentSuccess: 'payment.captured',
    paymentFailed: 'payment.failed',
    subscriptionCreated: 'subscription.charged'
  }
};

// Mock Geolocation Data for Testing
const MOCK_LOCATIONS = {
  // Major Indian cities with accurate coordinates
  mumbai: {
    latitude: 19.0760,
    longitude: 72.8777,
    name: 'Mumbai',
    state: 'Maharashtra',
    address: 'Mumbai, Maharashtra, India'
  },
  delhi: {
    latitude: 28.6139,
    longitude: 77.2090,
    name: 'Delhi',
    state: 'Delhi',
    address: 'New Delhi, Delhi, India'
  },
  bangalore: {
    latitude: 12.9716,
    longitude: 77.5946,
    name: 'Bangalore',
    state: 'Karnataka',
    address: 'Bangalore, Karnataka, India'
  },
  chennai: {
    latitude: 13.0827,
    longitude: 80.2707,
    name: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Chennai, Tamil Nadu, India'
  },
  hyderabad: {
    latitude: 17.3850,
    longitude: 78.4867,
    name: 'Hyderabad',
    state: 'Telangana',
    address: 'Hyderabad, Telangana, India'
  },
  pune: {
    latitude: 18.5204,
    longitude: 73.8567,
    name: 'Pune',
    state: 'Maharashtra',
    address: 'Pune, Maharashtra, India'
  },
  kolkata: {
    latitude: 22.5726,
    longitude: 88.3639,
    name: 'Kolkata',
    state: 'West Bengal',
    address: 'Kolkata, West Bengal, India'
  },
  ahmedabad: {
    latitude: 23.0225,
    longitude: 72.5714,
    name: 'Ahmedabad',
    state: 'Gujarat',
    address: 'Ahmedabad, Gujarat, India'
  }
};

// Chrome DevTools Geolocation Override Instructions
const GEOLOCATION_TESTING_INSTRUCTIONS = {
  chromeDevTools: {
    steps: [
      '1. Open Chrome DevTools (F12)',
      '2. Click the three dots menu (⋮) in DevTools',
      '3. Go to More tools → Sensors',
      '4. In the Location section, select "Custom location"',
      '5. Enter latitude and longitude from MOCK_LOCATIONS',
      '6. Refresh the page to apply new location'
    ],
    commonLocations: MOCK_LOCATIONS
  },
  
  firefoxDevTools: {
    steps: [
      '1. Open Firefox Developer Tools (F12)',
      '2. Go to Settings (gear icon)',
      '3. Scroll to Available Toolbox Buttons',
      '4. Check "Toggle the responsive design mode"',
      '5. Use responsive mode to set custom location'
    ]
  }
};

// Offline Testing Configuration
const OFFLINE_TESTING_CONFIG = {
  chromeOfflineMode: {
    steps: [
      '1. Open Chrome DevTools (F12)',
      '2. Go to Network tab',
      '3. Click "Online" dropdown',
      '4. Select "Offline" to simulate no internet',
      '5. Test PIN verification functionality',
      '6. Test POS system functionality'
    ]
  },
  
  // Features that should work offline
  offlineCapabilities: [
    'PIN verification (stored locally)',
    'POS deal scanning',
    'Basic deal viewing (cached)',
    'QR code generation',
    'Local data caching'
  ],
  
  // Features that require internet
  onlineRequired: [
    'User authentication',
    'Deal syncing',
    'Payment processing',
    'Real-time analytics',
    'Email notifications'
  ]
};

// Test User Scenarios
const TEST_SCENARIOS = {
  customerJourney: {
    name: 'Complete Customer Journey',
    steps: [
      'Sign up as new customer',
      'Browse deals by category',
      'Use geolocation to find nearby deals',
      'Claim a deal (basic tier)',
      'Attempt to claim premium deal (should show upgrade)',
      'Upgrade to premium membership',
      'Claim premium deal',
      'Visit store and verify PIN',
      'Enter bill amount and calculate savings',
      'Check dashboard and savings history'
    ],
    testData: {
      customer: {
        username: 'test_journey_customer',
        email: 'journey@test.com',
        password: 'test123'
      }
    }
  },
  
  vendorWorkflow: {
    name: 'Vendor Business Workflow',
    steps: [
      'Register as vendor',
      'Complete business verification',
      'Wait for admin approval',
      'Create test deals with different membership tiers',
      'Start POS session',
      'Process customer redemptions using PIN',
      'Track deal analytics',
      'End POS session and view reports'
    ],
    testData: {
      vendor: {
        username: 'test_vendor_workflow',
        email: 'vendor@test.com',
        password: 'vendor123',
        businessName: 'Test Business'
      }
    }
  },
  
  adminOperations: {
    name: 'Admin Management Tasks',
    steps: [
      'Login as admin',
      'Review pending vendor registrations',
      'Approve/reject vendor applications',
      'Review pending deals',
      'Approve/reject deals',
      'Manage user accounts',
      'View platform analytics',
      'Handle help tickets'
    ],
    testData: {
      admin: {
        username: 'test_admin_ops',
        email: 'admin@test.com',
        password: 'admin123'
      }
    }
  },
  
  pinVerificationFlow: {
    name: 'PIN Verification System',
    steps: [
      'Customer claims deal online',
      'Customer visits physical store',
      'Store owner provides 4-digit PIN',
      'Customer enters PIN in app (works offline)',
      'System verifies PIN and completes redemption',
      'Customer enters actual bill amount',
      'System calculates real savings',
      'Data syncs when back online'
    ],
    testPins: {
      'Test Fashion Deal': '1111',
      'Test Electronics Deal': '2222',
      'Test Food Deal': '3333'
    }
  },
  
  paymentTesting: {
    name: 'Razorpay Payment Integration',
    steps: [
      'Customer attempts to upgrade membership',
      'Razorpay checkout modal opens',
      'Test successful payment with test card',
      'Test failed payment with failure card',
      'Verify membership upgrade after success',
      'Test webhook handling',
      'Verify payment records in admin panel'
    ],
    testCards: RAZORPAY_TEST_CONFIG.testScenarios
  }
};

// Performance Testing Configuration
const PERFORMANCE_TESTING = {
  loadTesting: {
    scenarios: [
      'Multiple users browsing deals simultaneously',
      'Concurrent PIN verifications',
      'Multiple POS sessions running',
      'High volume of deal claims'
    ],
    tools: [
      'Chrome DevTools Performance tab',
      'Network throttling simulation',
      'Memory usage monitoring'
    ]
  },
  
  mobileOptimization: {
    testSizes: [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'Samsung Galaxy S21', width: 360, height: 800 },
      { name: 'iPad', width: 768, height: 1024 }
    ]
  }
};

// Error Scenarios for Testing
const ERROR_SCENARIOS = {
  networkErrors: [
    'Complete offline mode',
    'Slow 3G connection',
    'Intermittent connectivity',
    'API timeout scenarios'
  ],
  
  userErrors: [
    'Invalid PIN entry',
    'Expired deal redemption',
    'Insufficient membership tier',
    'Maximum redemption limit reached'
  ],
  
  systemErrors: [
    'Database connection failure',
    'Payment gateway timeout',
    'Email service unavailable',
    'File upload failures'
  ]
};

// Helper function to set mock location in Chrome DevTools
export function setMockLocation(locationKey) {
  const location = MOCK_LOCATIONS[locationKey];
  if (!location) {
    console.error(`Location ${locationKey} not found in MOCK_LOCATIONS`);
    return;
  }
  
  console.log(`🌍 Set Chrome DevTools location to:`);
  console.log(`City: ${location.name}, ${location.state}`);
  console.log(`Coordinates: ${location.latitude}, ${location.longitude}`);
  console.log(`Use these coordinates in DevTools → Sensors → Location`);
  
  return location;
}

export {
  RAZORPAY_TEST_CONFIG,
  MOCK_LOCATIONS,
  GEOLOCATION_TESTING_INSTRUCTIONS,
  OFFLINE_TESTING_CONFIG,
  TEST_SCENARIOS,
  PERFORMANCE_TESTING,
  ERROR_SCENARIOS
};