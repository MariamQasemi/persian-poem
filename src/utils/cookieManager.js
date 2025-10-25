// Cookie utility functions for JWT token management
export class CookieManager {
  // Set a cookie with JWT token
  static setToken(token, expiresInDays = 7) {
    const expires = new Date()
    expires.setTime(expires.getTime() + (expiresInDays * 24 * 60 * 60 * 1000))
    
    document.cookie = `auth_token=${token}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`
  }

  // Get JWT token from cookies
  static getToken() {
    const name = 'auth_token='
    const decodedCookie = decodeURIComponent(document.cookie)
    const cookieArray = decodedCookie.split(';')
    
    for (let cookie of cookieArray) {
      let c = cookie.trim()
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length)
      }
    }
    return null
  }

  // Remove JWT token from cookies
  static removeToken() {
    document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
  }

  // Set user data in localStorage (for non-sensitive data)
  static setUserData(userData) {
    localStorage.setItem('user_data', JSON.stringify(userData))
  }

  // Get user data from localStorage
  static getUserData() {
    const userData = localStorage.getItem('user_data')
    return userData ? JSON.parse(userData) : null
  }

  // Remove user data from localStorage
  static removeUserData() {
    localStorage.removeItem('user_data')
  }

  // Check if user is authenticated
  static isAuthenticated() {
    const token = this.getToken()
    const userData = this.getUserData()
    
    // More robust check - require both token and user data
    const isAuth = !!(token && userData)
    
    console.log('🔍 CookieManager.isAuthenticated():', {
      hasToken: !!token,
      hasUserData: !!userData,
      isAuthenticated: isAuth
    })
    
    return isAuth
  }

  // Clear all authentication data
  static clearAuth() {
    console.log('🧹 CookieManager: Clearing auth data...')
    console.log('Before clear - Token:', !!this.getToken(), 'User:', !!this.getUserData())
    
    // Remove token from cookies
    this.removeToken()
    
    // Remove user data from localStorage
    this.removeUserData()
    
    // Additional cleanup - clear any other auth-related data
    try {
      // Clear any additional localStorage items that might contain auth data
      const authKeys = ['auth_token', 'user_token', 'access_token', 'refresh_token', 'auth_data']
      authKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key)
          console.log(`🧹 Removed ${key} from localStorage`)
        }
      })
      
      // Clear any sessionStorage items
      const sessionKeys = ['auth_token', 'user_token', 'access_token', 'refresh_token', 'auth_data']
      sessionKeys.forEach(key => {
        if (sessionStorage.getItem(key)) {
          sessionStorage.removeItem(key)
          console.log(`🧹 Removed ${key} from sessionStorage`)
        }
      })
      
    } catch (error) {
      console.warn('⚠️ Error during additional auth cleanup:', error)
    }
    
    console.log('After clear - Token:', !!this.getToken(), 'User:', !!this.getUserData())
    console.log('✅ CookieManager: Auth data cleared')
  }
}
