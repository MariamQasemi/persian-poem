// Test script specifically for /api/auth/me endpoint
// This script tests the getCurrentUser functionality

console.log('🔍 Testing /api/auth/me endpoint');
console.log('================================');

// Import the API service (assuming it's available globally or via import)
// For browser testing, we'll assume ApiService is available globally

async function testGetCurrentUser() {
  console.log('\n📋 Testing getCurrentUser API');
  console.log('-------------------------------');
  
  try {
    // Check if we have a token first
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (!token) {
      console.log('❌ No authentication token found');
      console.log('ℹ️ Please login first to test this endpoint');
      return false;
    }
    
    console.log('✅ Authentication token found');
    console.log('📤 Making request to /api/auth/me...');
    
    // Test the getCurrentUser function
    const currentUser = await ApiService.getCurrentUser();
    
    console.log('✅ getCurrentUser successful!');
    console.log('📋 User data received:', {
      id: currentUser.id,
      name: currentUser.name || currentUser.full_name,
      email: currentUser.email,
      createdAt: currentUser.created_at,
      hasAllFields: !!(currentUser.id && currentUser.email)
    });
    
    // Validate the response structure
    if (!currentUser.id) {
      console.warn('⚠️ Warning: No user ID in response');
    }
    
    if (!currentUser.email) {
      console.warn('⚠️ Warning: No email in response');
    }
    
    if (!currentUser.name && !currentUser.full_name) {
      console.warn('⚠️ Warning: No name field in response');
    }
    
    console.log('🎯 Test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ getCurrentUser test failed:', error);
    
    if (error.status === 401) {
      console.log('🔐 Authentication failed - token may be invalid or expired');
    } else if (error.status === 403) {
      console.log('🚫 Access forbidden - user may not have permission');
    } else if (error.status === 404) {
      console.log('🔍 Endpoint not found - check API configuration');
    } else {
      console.log('🌐 Network or server error:', error.message);
    }
    
    return false;
  }
}

// Test the endpoint with different scenarios
async function runAuthMeTests() {
  console.log('🧪 Running /api/auth/me endpoint tests...');
  
  const results = {
    getCurrentUser: false
  };
  
  try {
    results.getCurrentUser = await testGetCurrentUser();
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log('✅ getCurrentUser:', results.getCurrentUser ? 'PASSED' : 'FAILED');
    
    const allPassed = results.getCurrentUser;
    console.log('\n🎯 Overall Result:', allPassed ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED');
    
    if (allPassed) {
      console.log('\n🎉 The /api/auth/me endpoint is working correctly!');
      console.log('📝 This endpoint can be used to:');
      console.log('   - Get current user information');
      console.log('   - Verify authentication status');
      console.log('   - Update user profile data');
      console.log('   - Check user permissions');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Export for manual testing
window.testAuthMe = {
  runTests: runAuthMeTests,
  testGetCurrentUser
};

console.log('📚 Available test functions:');
console.log('- testAuthMe.runTests() - Run complete test suite');
console.log('- testAuthMe.testGetCurrentUser() - Test getCurrentUser only');
console.log('');
console.log('🚀 Run testAuthMe.runTests() to start testing...');

// Auto-run the tests
runAuthMeTests();
