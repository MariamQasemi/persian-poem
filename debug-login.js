// Debug script for login page routing issues
// Run this in the browser console to debug the login flow

console.log('🔍 Login Page Routing Debug Tool');
console.log('=================================');

function debugLoginRouting() {
  console.log('\n📊 Current Authentication State:');
  console.log('--------------------------------');
  
  // Check cookies
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
  
  // Check localStorage
  const userData = localStorage.getItem('user_data');
  
  // Check CookieManager
  const cookieAuth = CookieManager.isAuthenticated();
  
  console.log('🍪 Cookie Token:', token ? 'EXISTS' : 'NOT FOUND');
  console.log('💾 User Data:', userData ? 'EXISTS' : 'NOT FOUND');
  console.log('🔐 CookieManager.isAuthenticated():', cookieAuth);
  
  // Check current route
  console.log('🛣️ Current Route:', window.location.pathname);
  
  // Check if we're on login page
  const isOnLoginPage = window.location.pathname.includes('/login');
  console.log('📄 On Login Page:', isOnLoginPage);
  
  // Check navbar buttons
  const loginBtn = document.querySelector('.login-btn');
  const logoutBtn = document.querySelector('.logout-btn');
  const profileBtn = document.querySelector('.profile-btn');
  
  console.log('🎨 Navbar Buttons:');
  console.log('  - Login Button:', loginBtn ? 'EXISTS' : 'NOT FOUND');
  console.log('  - Logout Button:', logoutBtn ? 'EXISTS' : 'NOT FOUND');
  console.log('  - Profile Button:', profileBtn ? 'EXISTS' : 'NOT FOUND');
  
  // Check if login form is visible
  const authForm = document.querySelector('.auth-form');
  const loginForm = document.querySelector('.login-form');
  
  console.log('📝 Login Form Elements:');
  console.log('  - Auth Form:', authForm ? 'EXISTS' : 'NOT FOUND');
  console.log('  - Login Form:', loginForm ? 'EXISTS' : 'NOT FOUND');
  
  return {
    hasToken: !!token,
    hasUserData: !!userData,
    isAuthenticated: cookieAuth,
    isOnLoginPage,
    uiElements: {
      loginBtn: !!loginBtn,
      logoutBtn: !!logoutBtn,
      profileBtn: !!profileBtn,
      authForm: !!authForm,
      loginForm: !!loginForm
    }
  };
}

function testLoginNavigation() {
  console.log('\n🧪 Testing Login Navigation');
  console.log('----------------------------');
  
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
  
  // Add a click listener to see what happens
  loginBtn.addEventListener('click', (e) => {
    console.log('🖱️ Login button clicked!');
    console.log('🛣️ Current path before click:', window.location.pathname);
    
    // Check if we're being redirected
    setTimeout(() => {
      console.log('🛣️ Current path after click:', window.location.pathname);
      console.log('📄 On login page after click:', window.location.pathname.includes('/login'));
    }, 100);
  });
  
  return true;
}

function forceNavigateToLogin() {
  console.log('\n🚀 Force Navigate to Login');
  console.log('---------------------------');
  
  console.log('🛣️ Current path:', window.location.pathname);
  console.log('🔄 Navigating to /login...');
  
  // Use Vue Router if available
  if (window.router) {
    window.router.push('/login');
  } else {
    // Fallback to direct navigation
    window.location.href = '/login';
  }
}

function clearAllAuthData() {
  console.log('\n🧹 Clearing All Auth Data');
  console.log('--------------------------');
  
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
    
    console.log('🎯 All auth data cleared!');
    console.log('💡 Now try navigating to /login');
    
  } catch (error) {
    console.error('❌ Error during auth data clearing:', error);
  }
}

// Export functions for manual use
window.loginDebug = {
  debugLoginRouting,
  testLoginNavigation,
  forceNavigateToLogin,
  clearAllAuthData
};

console.log('\n📚 Available debug functions:');
console.log('- loginDebug.debugLoginRouting() - Check current auth state and UI');
console.log('- loginDebug.testLoginNavigation() - Test login button functionality');
console.log('- loginDebug.forceNavigateToLogin() - Force navigate to login page');
console.log('- loginDebug.clearAllAuthData() - Clear all authentication data');
console.log('');
console.log('🚀 Run loginDebug.debugLoginRouting() to check current state...');

// Auto-run the debug
debugLoginRouting();
