// Debug script for logout issues
// Run this in the browser console to debug authentication state

console.log('🔍 Authentication State Debug Tool');
console.log('===================================');

function debugAuthState() {
  console.log('\n📊 Current Authentication State:');
  console.log('--------------------------------');
  
  // Check cookies
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
  
  // Check localStorage
  const userData = localStorage.getItem('user_data');
  
  // Check if auth store exists globally
  const authStore = window.authStore || null;
  
  console.log('🍪 Cookie Token:', token ? 'EXISTS' : 'NOT FOUND');
  console.log('💾 User Data:', userData ? 'EXISTS' : 'NOT FOUND');
  console.log('🏪 Auth Store:', authStore ? 'EXISTS' : 'NOT FOUND');
  
  if (authStore) {
    console.log('🔐 Auth Store State:', {
      isAuthenticated: authStore.isAuthenticated?.value,
      hasUser: !!authStore.currentUser?.value,
      hasToken: !!authStore.authToken?.value
    });
  }
  
  // Check navbar state
  const navbar = document.querySelector('.navbar');
  const loginBtn = document.querySelector('.login-btn');
  const logoutBtn = document.querySelector('.logout-btn');
  const profileBtn = document.querySelector('.profile-btn');
  
  console.log('🎨 UI Elements:');
  console.log('  - Navbar:', navbar ? 'EXISTS' : 'NOT FOUND');
  console.log('  - Login Button:', loginBtn ? 'EXISTS' : 'NOT FOUND');
  console.log('  - Logout Button:', logoutBtn ? 'EXISTS' : 'NOT FOUND');
  console.log('  - Profile Button:', profileBtn ? 'EXISTS' : 'NOT FOUND');
  
  // Check current route
  console.log('🛣️ Current Route:', window.location.pathname);
  
  return {
    hasToken: !!token,
    hasUserData: !!userData,
    hasAuthStore: !!authStore,
    uiElements: {
      navbar: !!navbar,
      loginBtn: !!loginBtn,
      logoutBtn: !!logoutBtn,
      profileBtn: !!profileBtn
    }
  };
}

function forceLogout() {
  console.log('\n🚪 Force Logout - Clearing All Auth Data');
  console.log('----------------------------------------');
  
  try {
    // Clear cookies
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    console.log('✅ Cleared auth_token cookie');
    
    // Clear localStorage
    localStorage.removeItem('user_data');
    console.log('✅ Cleared user_data from localStorage');
    
    // Clear any other auth-related data
    const authKeys = ['auth_token', 'user_token', 'access_token', 'refresh_token', 'auth_data'];
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`✅ Cleared ${key} from localStorage`);
      }
    });
    
    // Clear sessionStorage
    authKeys.forEach(key => {
      if (sessionStorage.getItem(key)) {
        sessionStorage.removeItem(key);
        console.log(`✅ Cleared ${key} from sessionStorage`);
      }
    });
    
    console.log('🎯 Force logout completed!');
    console.log('💡 Now refresh the page or navigate to see the changes');
    
  } catch (error) {
    console.error('❌ Error during force logout:', error);
  }
}

function testLoginButton() {
  console.log('\n🔍 Testing Login Button');
  console.log('------------------------');
  
  const loginBtn = document.querySelector('.login-btn');
  
  if (!loginBtn) {
    console.log('❌ Login button not found');
    return false;
  }
  
  console.log('✅ Login button found');
  console.log('🔗 Login button href:', loginBtn.href);
  console.log('📍 Login button text:', loginBtn.textContent);
  
  // Test clicking the button
  console.log('🖱️ Testing login button click...');
  loginBtn.click();
  
  return true;
}

function refreshAuthState() {
  console.log('\n🔄 Refreshing Authentication State');
  console.log('-----------------------------------');
  
  // Try to trigger auth state refresh
  if (window.authStore) {
    console.log('🔄 Triggering auth store refresh...');
    // This might not work depending on the implementation
  }
  
  // Force page refresh
  console.log('🔄 Refreshing page...');
  window.location.reload();
}

// Export functions for manual use
window.authDebug = {
  debugAuthState,
  forceLogout,
  testLoginButton,
  refreshAuthState
};

console.log('\n📚 Available debug functions:');
console.log('- authDebug.debugAuthState() - Check current auth state');
console.log('- authDebug.forceLogout() - Force clear all auth data');
console.log('- authDebug.testLoginButton() - Test login button functionality');
console.log('- authDebug.refreshAuthState() - Refresh page to reset state');
console.log('');
console.log('🚀 Run authDebug.debugAuthState() to check current state...');

// Auto-run the debug
debugAuthState();
