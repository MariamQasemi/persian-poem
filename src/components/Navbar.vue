<template>
  <nav class="navbar">
    <div class="navbar-container">

      <!-- Mobile Sidebar Toggle -->
      <button 
          @click="toggleSidebar"
          class="sidebar-toggle-btn"
          :class="{ 'active': showSidebar }"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      <!-- Logo and Welcome Message -->
      <div class="navbar-brand">
        
        <div class="logo" @click="goToHome">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-icon">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">شعر یاب</span>
        </div>
      </div>


      <!-- Auth Buttons -->
      <div class="navbar-auth">
        <!-- Show Login/Register buttons when not authenticated -->
        <template v-if="!isAuthenticated">
          <router-link to="/login" class="auth-btn login-btn">
            ورود
          </router-link>
          <router-link to="/register" class="auth-btn register-btn">
            ثبت نام
          </router-link>
        </template>
        
        <!-- Show Profile button when authenticated (but not on profile page) -->
        <template v-else-if="route.name !== 'Profile'">
          <router-link to="/profile" class="auth-btn profile-btn">
            پروفایل
          </router-link>
          <!-- Debug button - remove in production -->
          <button @click="forceRefresh" class="debug-btn" style="margin-right: 10px; padding: 5px; background: #f39c12; color: white; border: none; border-radius: 4px; font-size: 12px;">
            🔄
          </button>
        </template>
        
        <!-- Show Logout button when on profile page -->
        <template v-else>
          <button @click="handleLogout" class="auth-btn logout-btn">
            خروج
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth.js'
import { CookieManager } from '../utils/cookieManager.js'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '../services/api.js'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const showSidebar = ref(false)
const authStateUpdate = ref(0) // Force reactivity trigger

// Navigate to home page
const goToHome = () => {
  console.log('🏠 Logo clicked - navigating to home')
  router.push('/')
}

// Watch for route changes to refresh auth state
watch(() => route.path, (newPath, oldPath) => {
  console.log('🔄 Navbar: Route changed from', oldPath, 'to', newPath)
  authStateUpdate.value++
}, { immediate: false })

// Computed property to check authentication status
const isAuthenticated = computed(() => {
  // Use authStateUpdate to force reactivity
  authStateUpdate.value
  
  // Check both auth store and cookies
  const authStoreAuth = authStore.isAuthenticated
  const cookieAuth = CookieManager.isAuthenticated()
  const hasToken = !!CookieManager.getToken()
  const hasUser = !!CookieManager.getUserData()
  
  // More strict check - require both token and user data
  const result = authStoreAuth && hasToken && hasUser
  
  console.log('🔍 Navbar auth check:', {
    authStoreAuth,
    cookieAuth,
    hasToken,
    hasUser,
    result,
    authStateUpdate: authStateUpdate.value
  })
  
  return result
})

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
  // Emit event to parent components to handle sidebar toggle
  // This will be handled by the FilterPanel component
  window.dispatchEvent(new CustomEvent('toggleSidebar'))
}

// Debug function to force refresh
const forceRefresh = () => {
  console.log('🔄 Manual refresh triggered')
  authStateUpdate.value++
  console.log('Current auth state:', {
    authStore: authStore.isAuthenticated,
    token: !!CookieManager.getToken(),
    user: !!CookieManager.getUserData(),
    computed: isAuthenticated.value
  })
}

// Handle logout from navbar
const handleLogout = async () => {
  try {
    console.log('🚪 Navbar logout called...')
    
    // Call backend logout API
    await ApiService.logoutUser()
    
    // Clear local auth state
    authStore.logout()
    
    // Redirect to home page
    router.push('/')
    
  } catch (error) {
    console.error('Logout error:', error)
    // Even if backend logout fails, clear local state
    authStore.logout()
    router.push('/')
  }
}

// Listen for authentication state changes
const handleAuthChange = (event) => {
  console.log('🔄 Navbar: Auth state change event received:', event.detail)
  
  // Force reactivity update when auth state changes
  authStateUpdate.value++
  
  // Add a small delay to ensure all state is cleared
  setTimeout(() => {
    authStateUpdate.value++
    console.log('🔄 Navbar: Delayed auth state refresh, isAuthenticated:', isAuthenticated.value)
  }, 100)
}

onMounted(() => {
  // Listen for custom auth events
  window.addEventListener('authStateChanged', handleAuthChange)
  console.log('📱 Navbar mounted, isAuthenticated:', isAuthenticated.value)
  
  // Also listen for route changes to refresh auth state
  const handleRouteChange = () => {
    console.log('🔄 Route changed, refreshing auth state')
    authStateUpdate.value++
  }
  
  window.addEventListener('popstate', handleRouteChange)
})

onUnmounted(() => {
  window.removeEventListener('authStateChanged', handleAuthChange)
  window.removeEventListener('popstate', handleAuthChange)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 85px;
  background: #1a1a1a;
  border-bottom: 1px solid #CDC7C6;
  z-index: 1000;
  direction: rtl;
}

.navbar-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 20px;
  margin: 0;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
  min-width: 0;
  overflow: visible;
  margin-right: 350px;
}

.sidebar-toggle-btn {
  display: none;
  background: transparent;
  border: 1px solid #CDC7C6;
  border-radius: 6px;
  padding: 8px;
  color: #CDC7C6;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.sidebar-toggle-btn.active {
  background: #702632;
  border-color: #702632;
  color: white;
}

.sidebar-toggle-btn svg {
  width: 18px;
  height: 18px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 8px;
  position: relative;
  z-index: 10;
}

.logo:hover {
  background: rgba(112, 38, 50, 0.1);
  transform: scale(1.05);
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: #702632;
  transition: color 0.3s ease;
}

.logo:hover .logo-icon {
  color: #8b3a42;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #CDC7C6;
  font-family: 'Vazirmatn', sans-serif;
  transition: color 0.3s ease;
}

.logo:hover .logo-text {
  color: #702632;
}

.welcome-message {
  display: flex;
  align-items: center;
}

.welcome-text {
  font-size: 0.9rem;
  color: #888;
  font-family: 'Vazirmatn', sans-serif;
}

.navbar-auth {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
  max-width: 200px;
}

.auth-btn {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 80px;
}

.login-btn {
  background: transparent;
  color: #CDC7C6;
  border: 1px solid #CDC7C6;
}

.login-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.register-btn {
  background: #702632;
  color: white;
  border: 1px solid #702632;
}

.register-btn:hover {
  background: #8b3a42;
  border-color: #8b3a42;
}

.profile-btn {
  background: #27ae60;
  color: white;
  border: 1px solid #27ae60;
}

.profile-btn:hover {
  background: #229954;
  border-color: #229954;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: 1px solid #e74c3c;
}

.logout-btn:hover {
  background: #c0392b;
  border-color: #c0392b;
}

/* Desktop Styles */
@media (min-width: 769px) {
  .navbar-container {
    padding: 0 30px;
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 15px;
  }
  
  .navbar-auth {
    margin-right: 0; /* Remove margin on mobile */
    gap: 8px;
    flex-shrink: 0; /* Don't shrink auth buttons */
  }
  
  .sidebar-toggle-btn {
    display: flex;
    margin-left: 10px; /* Add space between toggle and logo */
  }
  
  .navbar-brand {
    gap: 10px;
    flex: 1; /* Allow brand to take available space */
    justify-content: flex-start; /* Align to start */
  }
  
  .logo {
    margin-right: auto; /* Push logo to the right side */
    padding: 6px; /* Reduce padding on mobile */
  }
  
  .logo-text {
    font-size: 1rem;
  }
  
  .logo-icon {
    width: 20px;
    height: 20px;
  }
  
  /* Additional mobile improvements */
  .navbar-container {
    gap: 10px; /* Add gap between elements */
  }
  
  .sidebar-toggle-btn {
    flex-shrink: 0;
    margin-right: 10px !important; /* Don't shrink toggle button */
  }
  
  .navbar-brand {
    min-width: 0; /* Allow shrinking */
  }
  
  .logo {
    flex-shrink: 0; /* Don't shrink logo */
  }
  
  .auth-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
    min-width: 70px;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .navbar-container {
    padding: 0 10px;
    gap: 8px;
  }
  
  .welcome-message {
    display: none;
  }
  
  .logo-text {
    font-size: 0.9rem;
  }
  
  .logo-icon {
    width: 18px;
    height: 18px;
  }
  
  .auth-btn {
    padding: 6px 10px;
    font-size: 0.75rem;
    min-width: 60px;
  }
  .sidebar-toggle-btn {
    margin-right: 0px !important;
  }
}
</style>
