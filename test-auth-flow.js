// Comprehensive Authentication Flow Test Script
// Run this in the browser console to test registration and login

console.log('🚀 Starting Comprehensive Authentication Flow Test');
console.log('================================================');

// Test data
const testUser = {
  name: 'Test User ' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  password_confirmation: 'password123'
};

console.log('🔗 Backend URLs (via Vite proxy):');
console.log('- Registration: http://localhost:5174/api/auth/register');
console.log('- Login: http://localhost:5174/api/auth/authenticate');
console.log('- Expected fields: email, password (not username)');
console.log('- Proxy: /api → http://165.227.205.3');
console.log('');

console.log('📝 Test user data:', testUser);

async function runAuthTests() {
  try {
    // Test 1: Backend Connectivity
    console.log('\n🔍 Test 1: Backend Connectivity');
    console.log('--------------------------------');
    
    const connectivityResult = await ApiService.testBackendConnectivity();
    console.log('📊 Connectivity result:', connectivityResult);
    
    if (!connectivityResult.reachable) {
      console.error('❌ Backend is not reachable. Stopping tests.');
      return;
    }
    
    // Test 2: Registration Endpoint
    console.log('\n🧪 Test 2: Registration Endpoint');
    console.log('--------------------------------');
    
    const registrationResult = await ApiService.testRegistrationEndpoint();
    console.log('📊 Registration test result:', registrationResult);
    
    // Test 3: User Registration
    console.log('\n👤 Test 3: User Registration');
    console.log('-----------------------------');
    
    try {
      const registrationResponse = await ApiService.registerUser(testUser);
      console.log('✅ Registration successful!');
      console.log('📋 Registration response:', registrationResponse);
      
      // Test 4: User Login
      console.log('\n🔐 Test 4: User Login');
      console.log('--------------------');
      
      const loginCredentials = {
        email: testUser.email,
        password: testUser.password
      };
      
      try {
        const loginResponse = await ApiService.loginUser(loginCredentials);
        console.log('✅ Login successful!');
        console.log('📋 Login response:', loginResponse);
        
        // Test 5: Auth Store Integration
        console.log('\n🏪 Test 5: Auth Store Integration');
        console.log('----------------------------------');
        
        // Import auth store (this will work if you're in the Vue app context)
        if (typeof useAuthStore !== 'undefined') {
          const authStore = useAuthStore();
          authStore.login(loginResponse.user, loginResponse.token);
          console.log('✅ Auth store updated successfully');
          console.log('📋 Auth state:', {
            isAuthenticated: authStore.isAuthenticated.value,
            hasUser: !!authStore.currentUser.value,
            hasToken: !!authStore.authToken.value
          });
        } else {
          console.log('⚠️ Auth store not available in this context');
        }
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('=====================================');
        
      } catch (loginError) {
        console.error('❌ Login test failed:', loginError);
        console.log('📋 Login error details:', {
          message: loginError.message,
          status: loginError.status,
          data: loginError.data
        });
      }
      
    } catch (registrationError) {
      console.error('❌ Registration test failed:', registrationError);
      console.log('📋 Registration error details:', {
        message: registrationError.message,
        status: registrationError.status,
        data: registrationError.data
      });
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Test individual methods
async function testRegistrationOnly() {
  console.log('🧪 Testing Registration Only');
  console.log('============================');
  
  try {
    const result = await ApiService.registerUser(testUser);
    console.log('✅ Registration successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Registration failed:', error);
    throw error;
  }
}

async function testLoginOnly(email, password) {
  console.log('🔐 Testing Login Only');
  console.log('====================');
  
  try {
    const result = await ApiService.loginUser({ email, password });
    console.log('✅ Login successful:', result);
    return result;
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error;
  }
}

// Export functions for manual testing
window.testAuthFlow = {
  runAllTests: runAuthTests,
  testRegistration: testRegistrationOnly,
  testLogin: testLoginOnly,
  testUser: testUser
};

console.log('📚 Available test functions:');
console.log('- testAuthFlow.runAllTests() - Run complete test suite');
console.log('- testAuthFlow.testRegistration() - Test registration only');
console.log('- testAuthFlow.testLogin(email, password) - Test login only');
console.log('- testAuthFlow.testUser - Test user data');
console.log('');
console.log('🚀 Run testAuthFlow.runAllTests() to start testing...');

// Auto-run the tests
runAuthTests();
