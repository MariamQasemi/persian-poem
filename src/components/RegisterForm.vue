<template>
  <div class="register-form">
    <div class="form-container">
      <div class="form-header">
        <h2 class="form-title">ورود</h2>
        <p class="form-subtitle">برای استفاده از امکانات بیشتر وارد شوید</p>
      </div>

      <form @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label for="name" class="form-label">نام</label>
          <input
            v-model="formData.name"
            type="text"
            id="name"
            name="name"
            class="form-input"
            :class="{ 'error': errors.name }"
            placeholder="نام خود را وارد کنید"
            required
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

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

        <div class="form-group">
          <label for="password_confirmation" class="form-label">تکرار رمز عبور</label>
          <input
            v-model="formData.password_confirmation"
            type="password"
            id="password_confirmation"
            name="password_confirmation"
            class="form-input"
            :class="{ 'error': errors.password_confirmation }"
            placeholder="رمز عبور را مجدداً وارد کنید"
            required
          />
          <span v-if="errors.password_confirmation" class="error-message">{{ errors.password_confirmation }}</span>
        </div>

        <button 
          type="submit" 
          class="submit-btn"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'در حال ثبت نام...' : 'ثبت نام' }}
        </button>
      </form>

      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="error-message-global">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ApiService } from '../services/api.js'

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const formData = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Name validation
  if (!formData.name.trim()) {
    errors.name = 'نام الزامی است'
    isValid = false
  } else if (formData.name.trim().length < 2) {
    errors.name = 'نام باید حداقل 2 کاراکتر باشد'
    isValid = false
  }

  // Email validation
  if (!formData.email.trim()) {
    errors.email = 'ایمیل الزامی است'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'فرمت ایمیل صحیح نیست'
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'رمز عبور الزامی است'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = 'رمز عبور باید حداقل 6 کاراکتر باشد'
    isValid = false
  }

  // Password confirmation validation
  if (!formData.password_confirmation) {
    errors.password_confirmation = 'تکرار رمز عبور الزامی است'
    isValid = false
  } else if (formData.password !== formData.password_confirmation) {
    errors.password_confirmation = 'رمز عبور و تکرار آن یکسان نیستند'
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
    const result = await ApiService.registerUser(formData)
    console.log('Registration successful:', result)
    
    successMessage.value = 'ثبت نام با موفقیت انجام شد! خوش آمدید.'
    
    // Reset form
    Object.keys(formData).forEach(key => {
      formData[key] = ''
    })
    
  } catch (error) {
    console.error('Registration failed:', error)
    errorMessage.value = error.message || 'خطا در ثبت نام. لطفاً دوباره تلاش کنید.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.register-form {
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
  background: #353535;
  box-shadow: 0 0 0 3px rgba(112, 38, 50, 0.2);
}

.form-input.error {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
}

.form-input::placeholder {
  color: #888;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  font-family: 'Vazirmatn', sans-serif;
}

.submit-btn {
  background: #702632;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 24px;
  font-size: 1.1rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
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

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-message {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid #22c55e;
  color: #22c55e;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Vazirmatn', sans-serif;
  text-align: center;
  margin-top: 20px;
}

.error-message-global {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: 'Vazirmatn', sans-serif;
  text-align: center;
  margin-top: 20px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .register-form {
    padding: 15px;
  }

  .form-container {
    padding: 30px 20px;
  }

  .form-title {
    font-size: 1.6rem;
  }

  .form-subtitle {
    font-size: 0.9rem;
  }

  .form {
    gap: 16px;
  }

  .form-input {
    padding: 10px 14px;
    font-size: 0.95rem;
  }

  .submit-btn {
    padding: 12px 20px;
    font-size: 1rem;
  }
}
</style>
