import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../views/HomePage.vue'
import PoetDetailPage from '../views/PoetDetailPage.vue'
import PoemDetailPage from '../views/PoemDetailPage.vue'
import RegisterPage from '../views/RegisterPage.vue'
import LoginPage from '../views/LoginPage.vue'
import ProfilePage from '../views/ProfilePage.vue'
import BlogPage from '../views/BlogPage.vue'
import { CookieManager } from '../utils/cookieManager.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/blog',
    name: 'Blog',
    component: BlogPage
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
    meta: { requiresGuest: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: { requiresAuth: true }
  },
  {
    path: '/poet/:id',
    name: 'PoetDetail',
    component: PoetDetailPage,
    props: true
  },
  {
    path: '/poem/:id',
    name: 'PoemDetail',
    component: PoemDetailPage,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory('/poems'), 
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  // More robust authentication check
  const hasToken = !!CookieManager.getToken()
  const hasUserData = !!CookieManager.getUserData()
  const isAuthenticated = hasToken && hasUserData
  
  console.log('🛡️ Route guard check:', {
    to: to.path,
    from: from.path,
    hasToken,
    hasUserData,
    isAuthenticated,
    requiresAuth: to.meta.requiresAuth,
    requiresGuest: to.meta.requiresGuest,
    cookieToken: !!CookieManager.getToken(),
    cookieUser: !!CookieManager.getUserData()
  })
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('🚫 Redirecting to login - authentication required')
    next('/login')
    return
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated) {
    console.log('🚫 Redirecting to profile - already authenticated')
    next('/profile')
    return
  }
  
  console.log('✅ Route access allowed')
  next()
})

export default router
