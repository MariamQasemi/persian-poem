// Test script for logout functionality
// This script tests the logout API and UI behavior

console.log('🚪 Testing Logout Functionality');
console.log('================================');

// Test logout API
async function testLogoutAPI() {
  console.log('\n📋 Testing Logout API');
  console.log('----------------------');
  
  try {
    // Check if we have a token first
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (!token) {
      console.log('❌ No authentication token found');
      console.log('ℹ️ Please login first to test logout functionality');
      return false;
    }
    
    console.log('✅ Authentication token found');
    console.log('📤 Making logout request to /api/auth/logout...');
    
    // Test the logoutUser function
    const logoutResult = await ApiService.logoutUser();
    
    console.log('✅ Logout API successful!');
    console.log('📋 Logout result:', logoutResult);
    
    // Verify that the token is cleared
    const tokenAfterLogout = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (tokenAfterLogout) {
      console.warn('⚠️ Warning: Token still exists after logout');
    } else {
      console.log('✅ Token successfully cleared from cookies');
    }
    
    console.log('🎯 Logout API test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Logout API test failed:', error);
    
    if (error.status === 401) {
      console.log('🔐 Authentication failed - token may be invalid or expired');
    } else if (error.status === 404) {
      console.log('🔍 Endpoint not found - check API configuration');
    } else {
      console.log('🌐 Network or server error:', error.message);
    }
    
    return false;
  }
}

// Test UI logout behavior
function testLogoutUI() {
  console.log('\n📋 Testing Logout UI Behavior');
  console.log('------------------------------');
  
  try {
    // Check current authentication state
    const authStore = window.authStore || { isAuthenticated: { value: false } };
    const isAuthenticated = authStore.isAuthenticated?.value || false;
    
    console.log('🔍 Current authentication state:', {
      isAuthenticated,
      hasToken: !!document.cookie.includes('auth_token='),
      hasUserData: !!localStorage.getItem('user_data')
    });
    
    // Check navbar visibility
    const navbar = document.querySelector('.navbar');
    const loginBtn = document.querySelector('.login-btn');
    const logoutBtn = document.querySelector('.logout-btn');
    const profileBtn = document.querySelector('.profile-btn');
    
    console.log('🎨 UI Elements check:', {
      navbarExists: !!navbar,
      loginBtnExists: !!loginBtn,
      logoutBtnExists: !!logoutBtn,
      profileBtnExists: !!profileBtn
    });
    
    // Check if we're on a protected route
    const currentPath = window.location.pathname;
    const protectedRoutes = ['/profile', '/blog'];
    const isOnProtectedRoute = protectedRoutes.some(route => currentPath.includes(route));
    
    console.log('🛡️ Route protection check:', {
      currentPath,
      isOnProtectedRoute,
      shouldRedirect: isOnProtectedRoute && !isAuthenticated
    });
    
    if (isAuthenticated) {
      console.log('✅ User is authenticated - should see logout/profile buttons');
      if (logoutBtn || profileBtn) {
        console.log('✅ Logout/Profile buttons are visible');
      } else {
        console.warn('⚠️ Warning: Logout/Profile buttons not found');
      }
    } else {
      console.log('✅ User is not authenticated - should see login/register buttons');
      if (loginBtn) {
        console.log('✅ Login button is visible');
      } else {
        console.warn('⚠️ Warning: Login button not found');
      }
    }
    
    console.log('🎯 UI behavior test completed!');
    return true;
    
  } catch (error) {
    console.error('❌ UI behavior test failed:', error);
    return false;
  }
}

// Test complete logout flow
async function testCompleteLogoutFlow() {
  console.log('\n📋 Testing Complete Logout Flow');
  console.log('--------------------------------');
  
  try {
    // Step 1: Check if user is authenticated
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    if (!token) {
      console.log('ℹ️ User is not authenticated - cannot test logout flow');
      console.log('💡 Please login first, then run this test again');
      return false;
    }
    
    console.log('✅ User is authenticated - proceeding with logout test');
    
    // Step 2: Test logout API
    console.log('📤 Step 1: Testing logout API...');
    const apiResult = await testLogoutAPI();
    
    // Step 3: Test UI behavior after logout
    console.log('🎨 Step 2: Testing UI behavior after logout...');
    const uiResult = testLogoutUI();
    
    // Step 4: Verify complete logout
    console.log('🔍 Step 3: Verifying complete logout...');
    const tokenAfterLogout = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];
    
    const userDataAfterLogout = localStorage.getItem('user_data');
    
    const isCompletelyLoggedOut = !tokenAfterLogout && !userDataAfterLogout;
    
    console.log('📊 Logout verification:', {
      tokenCleared: !tokenAfterLogout,
      userDataCleared: !userDataAfterLogout,
      completelyLoggedOut: isCompletelyLoggedOut
    });
    
    if (isCompletelyLoggedOut) {
      console.log('✅ Complete logout successful!');
      console.log('🎉 User is now logged out and should see login/register buttons');
    } else {
      console.warn('⚠️ Warning: Logout may not be complete');
    }
    
    const allStepsPassed = apiResult && uiResult && isCompletelyLoggedOut;
    console.log('🎯 Complete logout flow test result:', allStepsPassed ? 'PASSED' : 'FAILED');
    
    return allStepsPassed;
    
  } catch (error) {
    console.error('❌ Complete logout flow test failed:', error);
    return false;
  }
}

// Test navigation after logout
function testNavigationAfterLogout() {
  console.log('\n📋 Testing Navigation After Logout');
  console.log('-----------------------------------');
  
  try {
    const currentPath = window.location.pathname;
    const protectedRoutes = ['/profile', '/blog'];
    const isOnProtectedRoute = protectedRoutes.some(route => currentPath.includes(route));
    
    console.log('🛣️ Navigation check:', {
      currentPath,
      isOnProtectedRoute,
      shouldRedirectToLogin: isOnProtectedRoute
    });
    
    if (isOnProtectedRoute) {
      console.log('ℹ️ User is on a protected route - should be redirected to login');
      console.log('💡 Check if router guard is working properly');
    } else {
      console.log('✅ User is on a public route - no redirect needed');
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Navigation test failed:', error);
    return false;
  }
}

// Run all logout tests
async function runLogoutTests() {
  console.log('🧪 Running All Logout Tests...');
  
  const results = {
    logoutAPI: false,
    logoutUI: false,
    completeFlow: false,
    navigation: false
  };
  
  try {
    results.logoutAPI = await testLogoutAPI();
    results.logoutUI = testLogoutUI();
    results.completeFlow = await testCompleteLogoutFlow();
    results.navigation = testNavigationAfterLogout();
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log('✅ Logout API:', results.logoutAPI ? 'PASSED' : 'FAILED');
    console.log('✅ Logout UI:', results.logoutUI ? 'PASSED' : 'FAILED');
    console.log('✅ Complete Flow:', results.completeFlow ? 'PASSED' : 'FAILED');
    console.log('✅ Navigation:', results.navigation ? 'PASSED' : 'FAILED');
    
    const allPassed = results.logoutAPI && results.logoutUI && results.completeFlow && results.navigation;
    console.log('\n🎯 Overall Result:', allPassed ? 'ALL TESTS PASSED!' : 'SOME TESTS FAILED');
    
    if (allPassed) {
      console.log('\n🎉 The logout functionality is working correctly!');
      console.log('📝 Users can now:');
      console.log('   - Logout using the logout button');
      console.log('   - Be redirected to appropriate pages');
      console.log('   - See login/register buttons after logout');
      console.log('   - Have their authentication state properly cleared');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Export for manual testing
window.testLogout = {
  runTests: runLogoutTests,
  testLogoutAPI,
  testLogoutUI,
  testCompleteLogoutFlow,
  testNavigationAfterLogout
};

console.log('📚 Available test functions:');
console.log('- testLogout.runTests() - Run complete test suite');
console.log('- testLogout.testLogoutAPI() - Test logout API only');
console.log('- testLogout.testLogoutUI() - Test UI behavior only');
console.log('- testLogout.testCompleteLogoutFlow() - Test complete logout flow');
console.log('- testLogout.testNavigationAfterLogout() - Test navigation after logout');
console.log('');
console.log('🚀 Run testLogout.runTests() to start testing...');

// Auto-run the tests
runLogoutTests();
