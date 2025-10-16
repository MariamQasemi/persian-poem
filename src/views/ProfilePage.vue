<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="profile-title">پروفایل کاربری</h1>
        <button @click="logout" class="logout-btn">خروج</button>
      </div>

      <div class="profile-content">
        <!-- User Info Display -->
        <div class="user-info-section">
          <h2 class="section-title">اطلاعات کاربری</h2>
          <div class="user-info">
            <div class="info-item">
              <span class="info-label">نام:</span>
              <span class="info-value">{{ userData.name || 'تعریف نشده' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">ایمیل:</span>
              <span class="info-value">{{ userData.email || 'تعریف نشده' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">تاریخ عضویت:</span>
              <span class="info-value">{{ formatDate(userData.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- Edit Form -->
        <div class="edit-section">
          <h2 class="section-title">ویرایش اطلاعات</h2>
          <form @submit.prevent="handleUpdate" class="edit-form">
            <div class="form-group">
              <label for="edit-name" class="form-label">نام</label>
              <input
                v-model="editData.name"
                type="text"
                id="edit-name"
                class="form-input"
                :class="{ 'error': errors.name }"
                placeholder="نام خود را وارد کنید"
              />
              <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
            </div>

            <div class="form-group">
              <label for="edit-email" class="form-label">ایمیل</label>
              <input
                v-model="editData.email"
                type="email"
                id="edit-email"
                class="form-input"
                :class="{ 'error': errors.email }"
                placeholder="ایمیل خود را وارد کنید"
              />
              <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
            </div>

            <div class="form-group">
              <label for="edit-password" class="form-label">رمز عبور جدید (اختیاری)</label>
              <input
                v-model="editData.password"
                type="password"
                id="edit-password"
                class="form-input"
                :class="{ 'error': errors.password }"
                placeholder="رمز عبور جدید را وارد کنید"
              />
              <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
            </div>

            <button 
              type="submit" 
              class="update-btn"
              :disabled="isLoading"
            >
              {{ isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
            </button>
          </form>
        </div>

        <!-- Success/Error Messages -->
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ApiService } from '../services/api.js'

const router = useRouter()

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const userData = ref({})

const editData = reactive({
  name: '',
  email: '',
  password: ''
})

const errors = reactive({
  name: '',
  email: '',
  password: ''
})

const loadUserData = () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    userData.value = JSON.parse(storedUser)
    editData.name = userData.value.name || ''
    editData.email = userData.value.email || ''
  } else {
    // If no user data, redirect to login
    router.push('/login')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'نامشخص'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('fa-IR')
  } catch {
    return 'نامشخص'
  }
}

const validateForm = () => {
  // Clear previous errors
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  let isValid = true

  // Name validation
  if (!editData.name.trim()) {
    errors.name = 'نام الزامی است'
    isValid = false
  }

  // Email validation
  if (!editData.email.trim()) {
    errors.email = 'ایمیل الزامی است'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(editData.email)) {
    errors.email = 'فرمت ایمیل صحیح نیست'
    isValid = false
  }

  // Password validation (optional)
  if (editData.password && editData.password.length < 6) {
    errors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد'
    isValid = false
  }

  return isValid
}

const handleUpdate = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    // Prepare update data (only include password if provided)
    const updateData = {
      name: editData.name,
      email: editData.email
    }
    
    if (editData.password) {
      updateData.password = editData.password
    }

    // Note: You'll need to add an updateUser method to ApiService
    // const result = await ApiService.updateUser(updateData)
    
    // For now, just update local data
    userData.value = { ...userData.value, ...updateData }
    localStorage.setItem('user', JSON.stringify(userData.value))
    
    successMessage.value = 'اطلاعات با موفقیت به‌روزرسانی شد!'
    
    // Clear password field
    editData.password = ''
    
  } catch (error) {
    console.error('Update failed:', error)
    errorMessage.value = error.message || 'خطا در به‌روزرسانی اطلاعات. لطفاً دوباره تلاش کنید.'
  } finally {
    isLoading.value = false
  }
}

const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  router.push('/login')
}

onMounted(() => {
  loadUserData()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #151515;
  padding: 20px;
  direction: rtl;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #CDC7C6;
}

.profile-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #CDC7C6;
  margin: 0;
  font-family: 'Vazirmatn', sans-serif;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.user-info-section,
.edit-section {
  background: #1a1a1a;
  border: 1px solid #CDC7C6;
  border-radius: 12px;
  padding: 30px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #CDC7C6;
  margin: 0 0 20px 0;
  font-family: 'Vazirmatn', sans-serif;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid rgba(205, 199, 198, 0.1);
}

.info-label {
  font-weight: 500;
  color: #888;
  font-family: 'Vazirmatn', sans-serif;
}

.info-value {
  color: #CDC7C6;
  font-family: 'Vazirmatn', sans-serif;
}

.edit-form {
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

.update-btn {
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

.update-btn:hover:not(:disabled) {
  background: #8b3a42;
  transform: translateY(-2px);
}

.update-btn:disabled {
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
  grid-column: 1 / -1;
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
  grid-column: 1 / -1;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .profile-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .profile-header {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  
  .profile-title {
    font-size: 2rem;
  }
  
  .user-info-section,
  .edit-section {
    padding: 20px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
