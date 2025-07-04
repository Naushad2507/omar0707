# Instoredealz Platform - Comprehensive Testing Guide

## Overview
This guide provides step-by-step instructions for testing all features of the Instoredealz platform, including test data setup, mock configurations, and verification procedures.

## Prerequisites

### 1. Server Setup
Ensure the application is running:
```bash
npm run dev
```
The server should be available at `http://localhost:5000`

### 2. Test Environment Configuration
All test scripts and configurations are ready in the project root:
- `test-data-setup.js` - Creates test users, vendors, and deals
- `test-config.js` - Contains mock data and configurations
- `run-tests.js` - Comprehensive automated test runner

## Quick Start Testing

### 1. Create Test Data
Run the automated test data setup:
```bash
node test-data-setup.js
```

This creates:
- Test customers (basic, premium, ultimate tiers)
- Test vendors with approved businesses
- Test deals with unique 4-digit PINs
- Test admin accounts

### 2. Run Automated Tests
Execute comprehensive test suite:
```bash
node run-tests.js
```

Results will be saved to:
- `test-results.json` - Detailed JSON report
- `test-results.txt` - Human-readable summary

## Manual Testing Procedures

### A. Customer Journey Testing

#### 1. Customer Registration & Login
**Test Account:**
- Username: `test_customer_basic`
- Email: `basic@test.instoredealz.com`
- Password: `test123`

**Steps:**
1. Navigate to `/signup`
2. Register new customer account
3. Login with credentials
4. Verify dashboard loads correctly

#### 2. Deal Discovery & Claiming
**Steps:**
1. Browse deals on homepage
2. Filter by categories (fashion, electronics, food, etc.)
3. Click on a deal to view details
4. Claim a basic tier deal
5. Verify deal appears in "My Claims"

#### 3. PIN Verification Testing
**Test PINs:**
- Fashion Deal: `1111`
- Electronics Deal: `2222`
- Food Deal: `3333`

**Steps:**
1. Claim a deal first
2. Navigate to deal details
3. Click "Verify with PIN"
4. Enter correct PIN
5. Verify success message and savings update

#### 4. Bill Amount Tracking
**Steps:**
1. After PIN verification success
2. Bill amount dialog should appear automatically
3. Enter test amount (e.g., ₹500)
4. Verify savings calculation
5. Check updated total savings in dashboard

#### 5. Membership Upgrade Testing
**Steps:**
1. Try to claim a premium/ultimate deal
2. Should show "Upgrade to Premium" button
3. Click upgrade button
4. Navigate to `/customer/upgrade`
5. Test Razorpay payment (see payment testing section)

### B. Vendor Workflow Testing

#### 1. Vendor Registration
**Test Account:**
- Username: `test_vendor_fashion`
- Email: `fashion@test.vendor.com`
- Password: `vendor123`

**Steps:**
1. Register as vendor
2. Complete business profile
3. Wait for admin approval (or approve via admin account)
4. Access vendor dashboard

#### 2. Deal Creation
**Steps:**
1. Navigate to vendor deals section
2. Click "Create New Deal"
3. Fill in deal details:
   - Title, description, category
   - Discount percentage
   - 4-digit PIN
   - Membership tier requirement
4. Submit for approval

#### 3. POS System Testing
**Steps:**
1. Navigate to vendor POS section
2. Start new POS session
3. Select deals for sale
4. Process customer redemptions using PINs
5. End session and view analytics

### C. Admin Operations Testing

#### 1. Admin Login
**Test Account:**
- Username: `test_admin`
- Email: `admin@test.instoredealz.com`
- Password: `admin123`

#### 2. Vendor Approval
**Steps:**
1. Navigate to admin vendor management
2. Review pending vendor applications
3. Approve/reject vendors
4. Verify vendor status updates

#### 3. Deal Moderation
**Steps:**
1. Navigate to admin deal management
2. Review pending deals
3. Approve/reject deals
4. Modify deal requirements if needed

### D. Geolocation Testing

#### Chrome DevTools Setup
1. Open Chrome DevTools (F12)
2. Click menu (⋮) → More tools → Sensors
3. Set custom location using coordinates:

**Test Locations:**
- Mumbai: `19.0760, 72.8777`
- Delhi: `28.6139, 77.2090`
- Bangalore: `12.9716, 77.5946`
- Chennai: `13.0827, 80.2707`

#### Testing Steps
1. Set mock location in DevTools
2. Navigate to `/customer/nearby-deals`
3. Allow location permission
4. Verify nearby deals are filtered by distance
5. Test different radius settings (1-25km)

### E. Payment Testing (Razorpay Test Mode)

#### Setup Test Environment
1. Ensure `VITE_RAZORPAY_KEY_ID` environment variable is set with test key
2. Application is configured for test mode automatically

#### Test Payment Scenarios

**Successful Payment:**
- Card Number: `4111111111111111`
- Expiry: `12/25`
- CVV: `123`
- Name: `Test Customer`

**Failed Payment:**
- Card Number: `4000000000000002`
- Expiry: `12/25`
- CVV: `123`
- Name: `Test Failure`

**Test UPI:**
- UPI ID: `success@razorpay`

#### Payment Testing Steps
1. Navigate to membership upgrade
2. Select premium plan (₹500)
3. Click "Upgrade Now"
4. Razorpay modal should open with "TEST MODE" indicator
5. Use test card details above
6. Verify payment success/failure handling

### F. Offline Testing

#### Enable Offline Mode
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Click "Online" dropdown
4. Select "Offline"

#### Test Offline Features
1. **PIN Verification** - Should work without internet
2. **Deal Viewing** - Cached deals should be accessible
3. **QR Code Generation** - Should work offline
4. **POS Operations** - Basic functionality should work

#### Features Requiring Online Connection
- User authentication
- Deal syncing
- Payment processing
- Real-time analytics

### G. Mobile Responsiveness Testing

#### Device Simulation
1. Open Chrome DevTools
2. Click device toolbar icon (📱)
3. Test on different screen sizes:
   - iPhone SE: 375×667
   - iPhone 12: 390×844
   - Samsung Galaxy S21: 360×800
   - iPad: 768×1024

#### Mobile-Specific Features
1. Camera integration for deal images
2. Touch-friendly interface
3. Geolocation accuracy
4. Mobile payment experience

## Performance Testing

### Load Testing Scenarios
1. Multiple users browsing deals simultaneously
2. Concurrent PIN verifications
3. Multiple POS sessions running
4. High volume of deal claims

### Performance Monitoring
1. Use Chrome DevTools Performance tab
2. Monitor Network requests timing
3. Check memory usage
4. Test with throttled network (Fast 3G, Slow 3G)

## Error Scenario Testing

### Network Errors
- Complete offline mode
- Intermittent connectivity
- API timeout scenarios
- Slow network conditions

### User Input Errors
- Invalid PIN entry
- Expired deal redemption
- Insufficient membership tier
- Duplicate deal claims

### System Errors
- Database connection issues
- Payment gateway failures
- Email service unavailable
- File upload problems

## Test Results Documentation

### Automated Reports
After running tests, check these files:
- `test-results.json` - Detailed test data
- `test-results.txt` - Summary report

### Manual Test Documentation
Create a test log with:
- Test case name
- Steps performed
- Expected result
- Actual result
- Pass/Fail status
- Screenshots if needed

## Security Testing

### Authentication Testing
1. Test invalid login attempts
2. Verify token expiration handling
3. Test role-based access control
4. Check password security

### Data Protection
1. Verify PIN security (not exposed in APIs)
2. Test payment data handling
3. Check user data privacy
4. Verify admin access controls

## Troubleshooting Common Issues

### Application Won't Start
- Check if port 5000 is available
- Verify DATABASE_URL environment variable
- Check Node.js version compatibility

### Test Data Creation Fails
- Ensure server is running
- Check database connection
- Verify API endpoints are responsive

### Geolocation Not Working
- Enable location permissions in browser
- Use Chrome DevTools sensors override
- Check for HTTPS requirement in production

### Payments Fail in Test Mode
- Verify Razorpay test key is configured
- Check browser console for errors
- Ensure test card details are correct

### PIN Verification Issues
- Confirm PIN matches the one in database
- Check if deal has been claimed first
- Verify user authentication status

## Best Practices

### Before Testing
1. Clear browser cache and localStorage
2. Use incognito/private browsing mode
3. Disable browser extensions that might interfere
4. Ensure stable internet connection

### During Testing
1. Test one feature at a time
2. Document all issues immediately
3. Take screenshots of errors
4. Note browser console messages

### After Testing
1. Review all test results
2. Document any bugs found
3. Verify fixes work as expected
4. Update test documentation if needed

## Support and Resources

### Test Data Access
All test accounts and their credentials are documented in:
- `test-results.json` under `testAccounts` section
- `/test-flows` page in the application

### Debug Information
- Browser console logs
- Network tab in DevTools
- Application logs in terminal
- Database query logs if needed

### Contact Information
For issues or questions about testing:
- Check application logs first
- Review this guide thoroughly
- Document specific error messages
- Note steps to reproduce issues

---

## Quick Reference

### Test Accounts Summary
```
Customer (Basic): basic@test.instoredealz.com / test123
Customer (Premium): premium@test.instoredealz.com / test123
Customer (Ultimate): ultimate@test.instoredealz.com / test123
Vendor (Fashion): fashion@test.vendor.com / vendor123
Admin: admin@test.instoredealz.com / admin123
```

### Test PINs
```
Fashion Deal: 1111
Electronics Deal: 2222
Food Deal: 3333
```

### Mock Locations
```
Mumbai: 19.0760, 72.8777
Delhi: 28.6139, 77.2090
Bangalore: 12.9716, 77.5946
```

### Test Cards
```
Success: 4111111111111111
Failure: 4000000000000002
UPI: success@razorpay
```