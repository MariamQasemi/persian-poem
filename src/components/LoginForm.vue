<template>
  <div class="login-form">
    <div class="form-container">
      <div class="form-header">
        <h2 class="form-title">ورود</h2>
        <p class="form-subtitle">وارد حساب کاربری خود شوید</p>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="email" class="form-label">ایمیل</label>
          <input
            v-model="formData.email"
            type="email"
            id="email"
            name="email"
            class="form-input"
            :class="{ 'error': errors.email }"
            placeholder="ایمیل خود را وارد کنید"
            required
          />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">رمز عبور</label>
          <input
            v-model="formData.password"
            type="password"
            id="password"
            name="password"
            class="form-input"
            :class="{ 'error': errors.password }"
            placeholder="رمز عبور خود را وارد کنید"
            required
          />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <button 
          type="submit" 
          class="submit-btn"
          :disabled="isLoading"
        >
          {{ isLoading ? 'در حال ورود...' : 'ورود' }}
        </button>
      </form>

      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>

      <!-- Link to Register -->
      <div class="form-footer">
        <p class="footer-text">
          حساب کاربری ندارید؟ 
          <router-link to="/register" class="footer-link">ثبت نام کنید</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiService } from '../services/api.js'
import { useAuthStore } from '../stores/auth.js'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const formData = reactive({
  email: '',
  password: ''
})

const errors = reactive({
  email: '',
  password: ''
})

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Email validation
  if (!formData.email.trim()) {
    errors.email = 'ایمیل الزامی است'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'فرمت ایمیل صحیح نیست'
    isValid = false
  }

  // Password validation
  if (!formData.password.trim()) {
    errors.password = 'رمز عبور الزامی است'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const result = await ApiService.loginUser(formData)
    console.log('Login successful:', result)
    
    successMessage.value = 'ورود با موفقیت انجام شد!'
    
    // Update auth store
    if (result.token && result.user) {
      authStore.login(result.user, result.token)
      
      // Call /auth/me once to get complete user info including favourite_poets
      try {
        console.log('📞 Calling /auth/me to fetch complete user info...')
        const currentUserData = await ApiService.getCurrentUser()
        console.log('✅ Fetched complete user data:', currentUserData)
        
        // Update auth store with fresh complete data
        if (currentUserData) {
          authStore.login(currentUserData, result.token)
          console.log('✅ Auth store updated with complete user data including favourite_poets')
        }
      } catch (meError) {
        console.warn('⚠️ Could not fetch complete user data, using login response data:', meError)
      }
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
</script>

<style scoped>
.login-form {
  min-height: 100vh;
  background: #151515;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  direction: rtl;
}

.form-container {
  background: #1a1a1a;
  border: 1px solid #CDC7C6;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-title {
  font-size: 2rem;
  font-weight: bold;
  color: #CDC7C6;
  margin: 0 0 10px 0;
  font-family: 'Vazirmatn', sans-serif;
}

.form-subtitle {
  font-size: 1rem;
  color: #888;
  margin: 0;
  font-family: 'Vazirmatn', sans-serif;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 1rem;
  font-weight: 500;
  color: #CDC7C6;
  font-family: 'Vazirmatn', sans-serif;
  text-align: right;
  padding-right: 16px;
}

.form-input {
  padding: 12px 16px;
  background: #2a2a2a;
  border: 1px solid #CDC7C6;
  border-radius: 8px;
  color: #CDC7C6;
  font-size: 1rem;
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
  border-radius: 8px;
  padding: 14px 20px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}

.submit-btn:hover:not(:disabled) {
  background: #8b3a42;
  transform: translateY(-2px);
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
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 20px;
  font-family: 'Vazirmatn', sans-serif;
  text-align: center;
}

.error-message {
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 12px 16px;
  border-radius: 8px;
  margin-top: 20px;
  font-family: 'Vazirmatn', sans-serif;
  text-align: center;
}

.form-footer {
  text-align: center;
  margin-top: 30px;
}

.footer-text {
  color: #888;
  font-family: 'Vazirmatn', sans-serif;
  margin: 0;
}

.footer-link {
  color: #702632;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: #8b3a42;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .form-container {
    padding: 30px 20px;
    margin: 20px;
  }
  
  .form-title {
    font-size: 1.8rem;
  }
  
  .form-subtitle {
    font-size: 0.9rem;
  }
}
</style>
