<template>
  <div class="auth-form">
    <div class="form-container">
      <!-- Auth Toggle Buttons -->
      <div class="auth-toggle">
        <button 
          @click="setActiveTab('login')"
          :class="{ 'active': activeTab === 'login' }"
          class="toggle-btn"
        >
          ورود
        </button>
        <button 
          @click="setActiveTab('register')"
          :class="{ 'active': activeTab === 'register' }"
          class="toggle-btn"
        >
          ثبت نام
        </button>
      </div>

      <!-- Login Form -->
      <div v-if="activeTab === 'login'" class="form-section">
        <div class="form-header">
          <h2 class="form-title">ورود</h2>
          <p class="form-subtitle">وارد حساب کاربری خود شوید</p>
        </div>

        <form @submit.prevent="handleLogin" class="form">
          <div class="form-group">
            <label for="login-email" class="form-label">ایمیل</label>
            <input
              v-model="loginData.email"
              type="email"
              id="login-email"
              class="form-input"
              :class="{ 'error': loginErrors.email }"
              placeholder="ایمیل خود را وارد کنید"
              required
            />
            <span v-if="loginErrors.email" class="error-message">{{ loginErrors.email }}</span>
          </div>

          <div class="form-group">
            <label for="login-password" class="form-label">رمز عبور</label>
            <input
              v-model="loginData.password"
              type="password"
              id="login-password"
              class="form-input"
              :class="{ 'error': loginErrors.password }"
              placeholder="رمز عبور خود را وارد کنید"
              required
            />
            <span v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</span>
          </div>

          <button 
            type="submit" 
            class="submit-btn"
            :disabled="isLoading"
          >
            {{ isLoading ? 'در حال ورود...' : 'ورود' }}
          </button>
        </form>
      </div>

      <!-- Register Form -->
      <div v-if="activeTab === 'register'" class="form-section">
        <div class="form-header">
          <h2 class="form-title">ثبت نام</h2>
          <p class="form-subtitle">برای استفاده از امکانات بیشتر ثبت نام کنید</p>
        </div>

        <form @submit.prevent="handleRegister" class="form">
          <div class="form-group">
            <label for="register-name" class="form-label">نام</label>
            <input
              v-model="registerData.name"
              type="text"
              id="register-name"
              class="form-input"
              :class="{ 'error': registerErrors.name }"
              placeholder="نام خود را وارد کنید"
              required
            />
            <span v-if="registerErrors.name" class="error-message">{{ registerErrors.name }}</span>
          </div>

          <div class="form-group">
            <label for="register-email" class="form-label">ایمیل</label>
            <input
              v-model="registerData.email"
              type="email"
              id="register-email"
              class="form-input"
              :class="{ 'error': registerErrors.email }"
              placeholder="ایمیل خود را وارد کنید"
              required
            />
            <span v-if="registerErrors.email" class="error-message">{{ registerErrors.email }}</span>
          </div>

          <div class="form-group">
            <label for="register-password" class="form-label">رمز عبور</label>
            <input
              v-model="registerData.password"
              type="password"
              id="register-password"
              class="form-input"
              :class="{ 'error': registerErrors.password }"
              placeholder="رمز عبور خود را وارد کنید"
              required
            />
            <span v-if="registerErrors.password" class="error-message">{{ registerErrors.password }}</span>
          </div>

          <div class="form-group">
            <label for="register-password-confirm" class="form-label">تکرار رمز عبور</label>
            <input
              v-model="registerData.password_confirmation"
              type="password"
              id="register-password-confirm"
              class="form-input"
              :class="{ 'error': registerErrors.password_confirmation }"
              placeholder="رمز عبور را مجدداً وارد کنید"
              required
            />
            <span v-if="registerErrors.password_confirmation" class="error-message">{{ registerErrors.password_confirmation }}</span>
          </div>

          <button 
            type="submit" 
            class="submit-btn"
            :disabled="isLoading"
          >
            {{ isLoading ? 'در حال ثبت نام...' : 'ثبت نام' }}
          </button>
        </form>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiService } from '../services/api.js'
import { CookieManager } from '../utils/cookieManager.js'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({
  initialTab: {
    type: String,
    default: 'login'
  }
})

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref(props.initialTab)
const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Login form data
const loginData = reactive({
  email: '',
  password: ''
})

const loginErrors = reactive({
  email: '',
  password: ''
})

// Register form data
const registerData = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const registerErrors = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const setActiveTab = (tab) => {
  activeTab.value = tab
  clearMessages()
  clearFormErrors()
}

const clearMessages = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const clearFormErrors = () => {
  Object.keys(loginErrors).forEach(key => {
    loginErrors[key] = ''
  })
  Object.keys(registerErrors).forEach(key => {
    registerErrors[key] = ''
  })
}

const validateLoginForm = () => {
  clearFormErrors()
  let isValid = true

  if (!loginData.email.trim()) {
    loginErrors.email = 'ایمیل الزامی است'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
    loginErrors.email = 'فرمت ایمیل صحیح نیست'
    isValid = false
  }

  if (!loginData.password.trim()) {
    loginErrors.password = 'رمز عبور الزامی است'
    isValid = false
  }

  return isValid
}

const validateRegisterForm = () => {
  clearFormErrors()
  let isValid = true

  if (!registerData.name.trim()) {
    registerErrors.name = 'نام الزامی است'
    isValid = false
  }

  if (!registerData.email.trim()) {
    registerErrors.email = 'ایمیل الزامی است'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
    registerErrors.email = 'فرمت ایمیل صحیح نیست'
    isValid = false
  }

  if (!registerData.password.trim()) {
    registerErrors.password = 'رمز عبور الزامی است'
    isValid = false
  } else if (registerData.password.length < 6) {
    registerErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد'
    isValid = false
  }

  if (!registerData.password_confirmation.trim()) {
    registerErrors.password_confirmation = 'تکرار رمز عبور الزامی است'
    isValid = false
  } else if (registerData.password !== registerData.password_confirmation) {
    registerErrors.password_confirmation = 'رمز عبور و تکرار آن یکسان نیستند'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateLoginForm()) {
    return
  }

  isLoading.value = true
  clearMessages()

  try {
    const result = await ApiService.loginUserWithFallback(loginData)
    console.log('Login successful:', result)
    
    successMessage.value = 'ورود با موفقیت انجام شد!'
    
    console.log('🔍 Login result details:', {
      hasToken: !!result.token,
      hasAccessToken: !!result.access_token,
      hasUser: !!result.user,
      resultKeys: Object.keys(result)
    })
    
    // Update auth store
    if ((result.token || result.access_token) && result.user) {
      const token = result.token || result.access_token
      console.log('🔐 Updating auth store with token:', !!token)
      authStore.login(result.user, token)
      
      // Verify auth state was updated
      console.log('✅ Auth state after update:', {
        isAuthenticated: authStore.isAuthenticated.value,
        hasUser: !!authStore.currentUser.value,
        hasToken: !!authStore.authToken.value
      })
    } else {
      console.warn('⚠️ Missing token or user data in login response')
    }
    
    // Redirect to home page after successful login
    console.log('🚀 Attempting redirect to home...')
    
    // Give auth state time to propagate
    await new Promise(resolve => setTimeout(resolve, 100))
    
    try {
      // Use window.location for more reliable redirect on server
      window.location.href = '/poems/'
    } catch (err) {
      console.warn('Direct redirect failed, trying router:', err)
      router.push('/')
    }
    
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = error.message || 'خطا در ورود. لطفاً دوباره تلاش کنید.'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!validateRegisterForm()) {
    return
  }

  isLoading.value = true
  clearMessages()

  try {
    const result = await ApiService.registerUser(registerData)
    console.log('Registration successful:', result)
    
    successMessage.value = 'ثبت نام با موفقیت انجام شد! خوش آمدید.'
    
    // Update auth store if auto-login after registration
    if (result.token && result.user) {
      authStore.login(result.user, result.token)
    }
    
    // Reset form
    Object.keys(registerData).forEach(key => {
      registerData[key] = ''
    })
    
    // Switch to login tab after successful registration (or redirect if auto-logged in)
    setTimeout(() => {
      if (result.token && result.user) {
        // Auto-logged in, redirect to home (search interface)
        window.location.href = '/poems/'
      } else {
        // Not auto-logged in, switch to login tab
        activeTab.value = 'login'
        clearMessages()
      }
    }, 2000)
    
  } catch (error) {
    console.error('Registration failed:', error)
    errorMessage.value = error.message || 'خطا در ثبت نام. لطفاً دوباره تلاش کنید.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-form {
  background: #1a1a1a;
  border: 1px solid #CDC7C6;
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  direction: rtl;
}

.form-container {
  width: 100%;
}

.auth-toggle {
  display: flex;
  margin-bottom: 20px;
  background: #2a2a2a;
  border-radius: 8px;
  padding: 4px;
}

.toggle-btn {
  flex: 1;
  background: transparent;
  color: #CDC7C6;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 0.95rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn.active {
  background: #702632;
  color: white;
}

.toggle-btn:hover:not(.active) {
  background: rgba(112, 38, 50, 0.2);
}

.form-section {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 20px;
}

.form-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #CDC7C6;
  margin: 0 0 8px 0;
  font-family: 'Vazirmatn', sans-serif;
}

.form-subtitle {
  font-size: 0.9rem;
  color: #888;
  margin: 0;
  font-family: 'Vazirmatn', sans-serif;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #CDC7C6;
  font-family: 'Vazirmatn', sans-serif;
  text-align: right;
  padding-right: 8px;
}

.form-input {
  padding: 10px 12px;
  background: #2a2a2a;
  border: 1px solid #CDC7C6;
  border-radius: 6px;
  color: #CDC7C6;
  font-size: 0.9rem;
  font-family: 'Vazirmatn', sans-serif;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #702632;
  box-shadow: 0 0 0 2px rgba(112, 38, 50, 0.2);
}

.form-input.error {
  border-color: #e74c3c;
}

.form-input::placeholder {
  color: #888;
}

.submit-btn {
  background: #702632;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 0.95rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #8b3a42;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #555;
  cursor: not-allowed;
  transform: none;
}

.success-message {
  background: rgba(46, 204, 113, 0.1);
  border: 1px solid #2ecc71;
  color: #2ecc71;
  padding: 10px 12px;
  border-radius: 6px;
  margin-top: 15px;
  font-family: 'Vazirmatn', sans-serif;
  text-align: center;
  font-size: 0.9rem;
}

.error-message {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 10px 12px;
  border-radius: 6px;
  margin-top: 15px;
  font-family: 'Vazirmatn', sans-serif;
  text-align: center;
  font-size: 0.9rem;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .auth-form {
    padding: 15px;
  }
  
  .form-title {
    font-size: 1.3rem;
  }
  
  .form-subtitle {
    font-size: 0.8rem;
  }
  
  .form-input {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
  
  .submit-btn {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
}
</style>
