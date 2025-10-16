import { reactive, computed } from 'vue'
import { CookieManager } from '../utils/cookieManager.js'

// Global authentication state
const authState = reactive({
  isAuthenticated: false,
  user: null,
  token: null
})

// Initialize auth state from cookies/localStorage
const initializeAuth = () => {
  const token = CookieManager.getToken()
  const user = CookieManager.getUserData()
  
  authState.isAuthenticated = !!token
  authState.user = user
  authState.token = token
  
  console.log('Auth initialized:', {
    isAuthenticated: authState.isAuthenticated,
    hasUser: !!authState.user,
    hasToken: !!authState.token
  })
}

// Authentication store
export const useAuthStore = () => {
  // Computed properties
  const isAuthenticated = computed(() => authState.isAuthenticated)
  const currentUser = computed(() => authState.user)
  const authToken = computed(() => authState.token)

  // Actions
  const login = (user, token) => {
    console.log('🔐 Auth store login called:', {
      hasUser: !!user,
      hasToken: !!token,
      userEmail: user?.email,
      tokenLength: token?.length
    })
    
    authState.isAuthenticated = true
    authState.user = user
    authState.token = token
    
    // Store in cookies/localStorage
    CookieManager.setToken(token, 7)
    CookieManager.setUserData(user)
    
    console.log('✅ Auth state updated:', {
      isAuthenticated: authState.isAuthenticated,
      hasUser: !!authState.user,
      hasToken: !!authState.token,
      cookieToken: !!CookieManager.getToken(),
      cookieUser: !!CookieManager.getUserData()
    })
    
    // Emit auth state change event
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isAuthenticated: true, user, token } 
    }))
  }

  const logout = () => {
    console.log('🚪 Auth store logout called')
    
    authState.isAuthenticated = false
    authState.user = null
    authState.token = null
    
    // Clear cookies/localStorage
    CookieManager.clearAuth()
    
    console.log('✅ Auth state cleared:', {
      isAuthenticated: authState.isAuthenticated,
      hasUser: !!authState.user,
      hasToken: !!authState.token,
      cookieToken: !!CookieManager.getToken(),
      cookieUser: !!CookieManager.getUserData()
    })
    
    // Emit auth state change event
    window.dispatchEvent(new CustomEvent('authStateChanged', { 
      detail: { isAuthenticated: false, user: null, token: null } 
    }))
    
    console.log('📡 Auth state change event emitted')
  }

  const updateUser = (userData) => {
    authState.user = userData
    CookieManager.setUserData(userData)
  }

  // Initialize auth state
  initializeAuth()

  return {
    // State
    isAuthenticated,
    currentUser,
    authToken,
    
    // Actions
    login,
    logout,
    updateUser,
    initializeAuth
  }
}
