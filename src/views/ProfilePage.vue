<template>
  <div class="profile-page">
    <!-- Navbar -->
    <Navbar />
    
    <div class="profile-container">
      <div class="profile-header">
        <h1 class="profile-title">پروفایل کاربری</h1>
      </div>

      <div class="profile-content">
        <!-- Unified User Management Section -->
        <div class="user-management-section">
          <div class="section-header">
            <h2 class="section-title">اطلاعات کاربری</h2>
            <button 
              @click="toggleEditMode" 
              class="edit-toggle-btn"
              :class="{ 'active': isEditMode }"
            >
              {{ isEditMode ? 'لغو' : 'ویرایش' }}
            </button>
          </div>

          <!-- View Mode -->
          <div v-if="!isEditMode" class="user-info">
            <div class="info-item">
              <span class="info-label">نام:</span>
              <span class="info-value">{{ userData.name || userData.full_name || 'تعریف نشده' }}</span>
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

          <!-- Edit Mode -->
          <div v-else class="edit-form-container">
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

              <!-- Password Change Toggle -->
              <div class="password-toggle">
                <button 
                  type="button" 
                  @click="isChangingPassword = !isChangingPassword"
                  class="password-toggle-btn"
                  :class="{ 'active': isChangingPassword }"
                >
                  {{ isChangingPassword ? 'لغو تغییر رمز عبور' : 'تغییر رمز عبور' }}
                </button>
              </div>

              <!-- Password Change Fields -->
              <div v-if="isChangingPassword" class="password-fields">
                <div class="form-group">
                  <label for="current-password" class="form-label">رمز عبور فعلی</label>
                  <input
                    v-model="passwordData.currentPassword"
                    type="password"
                    id="current-password"
                    class="form-input"
                    :class="{ 'error': passwordErrors.currentPassword }"
                    placeholder="رمز عبور فعلی خود را وارد کنید"
                  />
                  <span v-if="passwordErrors.currentPassword" class="error-message">{{ passwordErrors.currentPassword }}</span>
                </div>

                <div class="form-group">
                  <label for="new-password" class="form-label">رمز عبور جدید</label>
                  <input
                    v-model="passwordData.newPassword"
                    type="password"
                    id="new-password"
                    class="form-input"
                    :class="{ 'error': passwordErrors.newPassword }"
                    placeholder="رمز عبور جدید را وارد کنید"
                  />
                  <span v-if="passwordErrors.newPassword" class="error-message">{{ passwordErrors.newPassword }}</span>
                </div>

                <div class="form-group">
                  <label for="confirm-password" class="form-label">تأیید رمز عبور جدید</label>
                  <input
                    v-model="passwordData.confirmPassword"
                    type="password"
                    id="confirm-password"
                    class="form-input"
                    :class="{ 'error': passwordErrors.confirmPassword }"
                    placeholder="رمز عبور جدید را مجدداً وارد کنید"
                  />
                  <span v-if="passwordErrors.confirmPassword" class="error-message">{{ passwordErrors.confirmPassword }}</span>
                </div>
              </div>

              <div class="form-actions">
                <button 
                  type="submit" 
                  class="save-btn"
                  :disabled="isLoading"
                >
                  {{ isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
                </button>
                <button 
                  type="button" 
                  @click="toggleEditMode"
                  class="cancel-btn"
                >
                  لغو
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- User List Section -->
        <div class="users-section">
          <h2 class="section-title">لیست کاربران</h2>
          <div class="users-list">
            <div v-if="isLoading" class="loading">در حال بارگذاری...</div>
            <div v-else-if="users.length === 0" class="no-users">هیچ کاربری یافت نشد</div>
            <div v-else>
              <div v-for="user in users" :key="user.id" class="user-item">
                <div class="user-info">
                  <span class="user-name">{{ user.name || user.full_name || 'نامشخص' }}</span>
                  <span class="user-email">{{ user.email }}</span>
                </div>
                <div class="user-date">{{ formatDate(user.created_at) }}</div>
              </div>
            </div>
          </div>
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
import { CookieManager } from '../utils/cookieManager.js'
import { useAuthStore } from '../stores/auth.js'
import Navbar from '../components/Navbar.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const userData = ref({})
const users = ref([])

// Edit mode state
const isEditMode = ref(false)
const isChangingPassword = ref(false)

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

// Password change data
const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Toggle edit mode
const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (!isEditMode.value) {
    // Reset form when canceling edit
    editData.name = userData.value.name || userData.value.full_name || ''
    editData.email = userData.value.email || ''
    passwordData.currentPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''
    // Clear errors
    Object.keys(errors).forEach(key => errors[key] = '')
    Object.keys(passwordErrors).forEach(key => passwordErrors[key] = '')
  }
}

const loadUserData = async () => {
  try {
    console.log('👤 Loading user data from backend...')
    
    // Try to get fresh user data from backend first
    const currentUser = await ApiService.getCurrentUser()
    if (currentUser) {
      userData.value = currentUser
      editData.name = currentUser.name || currentUser.full_name || ''
      editData.email = currentUser.email || ''
      console.log('✅ User data loaded from backend:', currentUser)
      return
    }
  } catch (error) {
    console.log('⚠️ Could not fetch user data from backend, using cached data')
  }
  
  // Fallback to cached data
  const authUser = authStore.currentUser.value
  const storedUser = CookieManager.getUserData()
  
  if (authUser) {
    userData.value = authUser
    editData.name = authUser.name || authUser.full_name || ''
    editData.email = authUser.email || ''
  } else if (storedUser) {
    userData.value = storedUser
    editData.name = storedUser.name || storedUser.full_name || ''
    editData.email = storedUser.email || ''
  } else {
    // If no user data, redirect to login
    console.log('No user data found, redirecting to login')
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

const loadUsers = async () => {
  try {
    isLoading.value = true
    console.log('👥 Loading users list...')
    
    const usersList = await ApiService.getUsers()
    users.value = usersList || []
    console.log('✅ Users loaded:', users.value)
    
  } catch (error) {
    console.error('❌ Failed to load users:', error)
    users.value = []
  } finally {
    isLoading.value = false
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

const validatePasswordForm = () => {
  // Clear previous errors
  Object.keys(passwordErrors).forEach(key => {
    passwordErrors[key] = ''
  })

  let isValid = true

  // Current password validation
  if (!passwordData.currentPassword.trim()) {
    passwordErrors.currentPassword = 'رمز عبور فعلی الزامی است'
    isValid = false
  }

  // New password validation
  if (!passwordData.newPassword.trim()) {
    passwordErrors.newPassword = 'رمز عبور جدید الزامی است'
    isValid = false
  } else if (passwordData.newPassword.length < 6) {
    passwordErrors.newPassword = 'رمز عبور جدید باید حداقل ۶ کاراکتر باشد'
    isValid = false
  }

  // Confirm password validation
  if (!passwordData.confirmPassword.trim()) {
    passwordErrors.confirmPassword = 'تکرار رمز عبور الزامی است'
    isValid = false
  } else if (passwordData.newPassword !== passwordData.confirmPassword) {
    passwordErrors.confirmPassword = 'رمز عبور و تکرار آن یکسان نیستند'
    isValid = false
  }

  return isValid
}


const handleUpdate = async () => {
  isLoading.value = true
  successMessage.value = ''
  errorMessage.value = ''
  
  // Clear previous errors
  Object.keys(errors).forEach(key => errors[key] = '')
  Object.keys(passwordErrors).forEach(key => passwordErrors[key] = '')

  try {
    console.log('🔄 Starting unified update process...')
    
    // Validate basic fields
    if (!editData.name.trim()) {
      errors.name = 'نام الزامی است'
      isLoading.value = false
      return
    }
    
    if (!editData.email.trim()) {
      errors.email = 'ایمیل الزامی است'
      isLoading.value = false
      return
    }

    // If password change is requested, validate password fields
    if (isChangingPassword.value) {
      if (!passwordData.currentPassword.trim()) {
        passwordErrors.currentPassword = 'رمز عبور فعلی الزامی است'
        isLoading.value = false
        return
      }
      
      if (!passwordData.newPassword.trim()) {
        passwordErrors.newPassword = 'رمز عبور جدید الزامی است'
        isLoading.value = false
        return
      }
      
      if (passwordData.newPassword.length < 6) {
        passwordErrors.newPassword = 'رمز عبور باید حداقل ۶ کاراکتر باشد'
        isLoading.value = false
        return
      }
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        passwordErrors.confirmPassword = 'رمزهای عبور مطابقت ندارند'
        isLoading.value = false
        return
      }
    }

    // Prepare update data
    const updateData = {
      name: editData.name.trim(),
      email: editData.email.trim()
    }

    // If password change is requested, add password data
    if (isChangingPassword.value) {
      updateData.current_password = passwordData.currentPassword
      updateData.password = passwordData.newPassword
      updateData.password_confirmation = passwordData.confirmPassword
    }

    console.log('📤 Sending update data:', updateData)

    // Call the update API
    const result = await ApiService.updateUserProfile(updateData)
    
    if (result) {
      console.log('✅ Update successful:', result)
      
      // Update local user data
      userData.value = { ...userData.value, ...result }
      
      // Update auth store if needed
      if (authStore.currentUser.value) {
        authStore.currentUser.value = { ...authStore.currentUser.value, ...result }
      }
      
      // Clear password fields if password was changed
      if (isChangingPassword.value) {
        passwordData.currentPassword = ''
        passwordData.newPassword = ''
        passwordData.confirmPassword = ''
        isChangingPassword.value = false
      }
      
      // Exit edit mode
      isEditMode.value = false
      
      successMessage.value = 'اطلاعات با موفقیت به‌روزرسانی شد'
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
    
  } catch (error) {
    console.error('❌ Update failed:', error)
    errorMessage.value = error.message || 'خطا در به‌روزرسانی اطلاعات'
    
    // Clear error message after 5 seconds
    setTimeout(() => {
      errorMessage.value = ''
    }, 5000)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUserData()
  loadUsers()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #151515;
  padding: 20px;
  padding-top: 105px; /* Account for fixed navbar (85px height + 20px margin) */
  direction: rtl;
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-header {
  display: flex;
  justify-content: center;
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

.profile-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.user-management-section,
.users-section {
  background: #1a1a1a;
  border: 1px solid #CDC7C6;
  border-radius: 12px;
  padding: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.edit-toggle-btn {
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-toggle-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.edit-toggle-btn.active {
  background: #e74c3c;
}

.edit-toggle-btn.active:hover {
  background: #c0392b;
}

.password-toggle {
  margin: 20px 0;
  text-align: center;
}

.password-toggle-btn {
  background: #f39c12;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.password-toggle-btn:hover {
  background: #e67e22;
  transform: translateY(-1px);
}

.password-toggle-btn.active {
  background: #e74c3c;
}

.password-toggle-btn.active:hover {
  background: #c0392b;
}

.password-fields {
  background: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #444;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.save-btn {
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.save-btn:hover {
  background: #229954;
  transform: translateY(-2px);
}

.save-btn:disabled {
  background: #7f8c8d;
  cursor: not-allowed;
  transform: none;
}

.cancel-btn {
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.cancel-btn:hover {
  background: #7f8c8d;
  transform: translateY(-2px);
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

.password-btn {
  background: #e74c3c;
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

.password-btn:hover:not(:disabled) {
  background: #c0392b;
  transform: translateY(-2px);
}

.password-btn:disabled {
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
  .edit-section,
  .password-section {
    padding: 20px;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>
