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

        <!-- Liked Poems Section -->
        <div class="liked-poems-section">
          <h2 class="section-title">اشعار با بیت‌های لایک شده</h2>
          
          <div v-if="isLoadingLikedPoems" class="loading">در حال بارگذاری...</div>
          <div v-else-if="likedPoems.length === 0" class="empty-state">
            هنوز بیتی لایک نکرده‌اید.
          </div>
          <div v-else class="liked-poems-list">
            <article v-for="poem in likedPoems" :key="poem.id || poem.poem_id" class="poem-card">
              <div class="poem-header">
                <h3 class="poem-title">{{ poem.poet_name || poem.poet || 'نامشخص' }}</h3>
                <div class="poem-header-actions">
                  <router-link :to="`/poem/${poem.poem_id || poem.id}`" class="view-poem-btn">
                    مشاهده شعر
                  </router-link>
                  <button 
                    v-if="authStore.isAuthenticated.value"
                    @click="removeLikedPoem(poem)" 
                    class="remove-poem-btn"
                    :disabled="isRemovingPoem === (poem.poem_id || poem.id)"
                    :title="'حذف تمام بیت‌های لایک شده'"
                  >
                    <svg v-if="isRemovingPoem !== (poem.poem_id || poem.id)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span v-else class="removing-text">در حال حذف...</span>
                  </button>
                </div>
              </div>
              <div class="poem-meta">
                <span class="poem-category">{{ poem.category || 'عمومی' }}</span>
                <span v-if="poem.title" class="poem-title-text">{{ poem.title }}</span>
              </div>
              <!-- Liked Verses Display -->
              <div v-if="getLikedVerses(poem).length > 0" class="liked-verses-section">
                <h4 class="liked-verses-title">بیت‌های لایک شده:</h4>
                <div class="liked-verses-list">
                  <div 
                    v-for="(verse, index) in getLikedVerses(poem)" 
                    :key="index" 
                    class="liked-verse-item"
                  >
                    {{ verse }}
                  </div>
                </div>
              </div>
              <p v-if="poem.excerpt && !getLikedVerses(poem).length" class="poem-excerpt">{{ poem.excerpt }}</p>
            </article>
          </div>
          
          <div v-if="hasMoreLikedPoems" class="load-more-container">
            <button @click="loadMoreLikedPoems" class="load-more-btn" :disabled="isLoadingLikedPoems">
              بارگذاری بیشتر
            </button>
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
import { LikedVersesManager } from '../utils/likedVersesManager.js'
import Navbar from '../components/Navbar.vue'

const router = useRouter()
const authStore = useAuthStore()

const isLoading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const userData = ref({})
const users = ref([])

// Liked poems state
const likedPoems = ref([])
const isLoadingLikedPoems = ref(false)
const isRemovingPoem = ref(null)
const likedPoemsOffset = ref(0)
const hasMoreLikedPoems = ref(false)

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

// Helper function to extract liked verses from poem data
// This function checks both API response and localStorage
const getLikedVerses = (poem) => {
  if (!poem) return []
  
  const likedVerses = []
  const likedVerseIds = LikedVersesManager.getLikedVerses()
  
  // Check if poem has liked_verses field (array of verse texts)
  if (poem.liked_verses && Array.isArray(poem.liked_verses)) {
    return poem.liked_verses
  }
  
  // Check if poem has liked_verse_texts field
  if (poem.liked_verse_texts && Array.isArray(poem.liked_verse_texts)) {
    return poem.liked_verse_texts
  }
  
  // Check if poem has verses array with liked status
  if (poem.verses && Array.isArray(poem.verses)) {
    return poem.verses
      .filter(v => {
        const verseId = v.id || v.verse_id
        return (v.is_liked || v.liked) || (verseId && likedVerseIds.has(String(verseId)))
      })
      .map(v => v.text || v.verse_text || v)
  }
  
  // Check if poem has couplets with liked verses
  if (poem.couplets && Array.isArray(poem.couplets)) {
    poem.couplets.forEach(couplet => {
      if (couplet.fullWidth && couplet.verseId) {
        // Check both API data and localStorage
        if (couplet.isLiked || likedVerseIds.has(String(couplet.verseId))) {
          if (couplet.text) {
            likedVerses.push(couplet.text)
          }
        }
      } else if (couplet.verseIds && Array.isArray(couplet.verseIds)) {
        if (couplet.text && Array.isArray(couplet.text)) {
          couplet.verseIds.forEach((verseId, index) => {
            if (verseId) {
              // Check both API data and localStorage
              const isLikedInApi = couplet.verseLiked && Array.isArray(couplet.verseLiked) && couplet.verseLiked[index]
              const isLikedInStorage = likedVerseIds.has(String(verseId))
              if (isLikedInApi || isLikedInStorage) {
                if (couplet.text[index]) {
                  likedVerses.push(couplet.text[index])
                }
              }
            }
          })
        }
      }
    })
    return likedVerses
  }
  
  return []
}

// Helper function to extract all liked verse IDs from a poem
const getLikedVerseIds = (poem) => {
  if (!poem) return []
  
  const likedVerseIds = []
  const likedVerseIdsFromStorage = LikedVersesManager.getLikedVerses()
  
  // Check if poem has couplets with liked verses
  if (poem.couplets && Array.isArray(poem.couplets)) {
    poem.couplets.forEach(couplet => {
      if (couplet.fullWidth && couplet.verseId) {
        // Check both API data and localStorage
        if (couplet.isLiked || likedVerseIdsFromStorage.has(String(couplet.verseId))) {
          likedVerseIds.push(couplet.verseId)
        }
      } else if (couplet.verseIds && Array.isArray(couplet.verseIds)) {
        couplet.verseIds.forEach((verseId, index) => {
          if (verseId) {
            // Check both API data and localStorage
            const isLikedInApi = couplet.verseLiked && Array.isArray(couplet.verseLiked) && couplet.verseLiked[index]
            const isLikedInStorage = likedVerseIdsFromStorage.has(String(verseId))
            if (isLikedInApi || isLikedInStorage) {
              likedVerseIds.push(verseId)
            }
          }
        })
      }
    })
  }
  
  // Check if poem has verses array with liked status
  if (poem.verses && Array.isArray(poem.verses)) {
    poem.verses.forEach(verse => {
      const verseId = verse.id || verse.verse_id
      if (verseId && ((verse.is_liked || verse.liked) || likedVerseIdsFromStorage.has(String(verseId)))) {
        likedVerseIds.push(verseId)
      }
    })
  }
  
  return likedVerseIds
}

// Remove a poem by unliking all its verses
const removeLikedPoem = async (poem) => {
  if (!poem || !authStore.isAuthenticated.value) return
  
  const poemId = poem.poem_id || poem.id
  if (!poemId) return
  
  // Confirm before removing
  if (!confirm('آیا مطمئن هستید که می‌خواهید تمام بیت‌های لایک شده این شعر را حذف کنید؟')) {
    return
  }
  
  try {
    isRemovingPoem.value = poemId
    
    // Get all liked verse IDs from this poem
    const likedVerseIds = getLikedVerseIds(poem)
    
    if (likedVerseIds.length === 0) {
      // No liked verses, just remove from list
      likedPoems.value = likedPoems.value.filter(p => (p.poem_id || p.id) !== poemId)
      isRemovingPoem.value = null
      return
    }
    
    console.log('🗑️ Removing poem with', likedVerseIds.length, 'liked verses')
    
    // Unlike each verse via API and track success
    const unlikeResults = await Promise.allSettled(
      likedVerseIds.map(verseId => ApiService.unlikeVerse(verseId))
    )
    
    // Check which operations succeeded
    const successfulUnlikes = []
    const failedUnlikes = []
    
    unlikeResults.forEach((result, index) => {
      const verseId = likedVerseIds[index]
      if (result.status === 'fulfilled') {
        successfulUnlikes.push(verseId)
      } else {
        failedUnlikes.push({ verseId, error: result.reason })
        console.error(`Failed to unlike verse ${verseId}:`, result.reason)
      }
    })
    
    // Only remove successfully unliked verses from localStorage
    successfulUnlikes.forEach(verseId => {
      LikedVersesManager.removeLikedVerse(verseId)
    })
    
    // If all unlike operations succeeded, remove poem from list
    if (failedUnlikes.length === 0) {
      // Remove poem from the list
      likedPoems.value = likedPoems.value.filter(p => (p.poem_id || p.id) !== poemId)
      console.log('✅ Poem removed successfully - all verses unliked')
    } else {
      // Some operations failed - show error but still remove from list if most succeeded
      console.warn(`⚠️ Some unlike operations failed: ${failedUnlikes.length} out of ${likedVerseIds.length}`)
      
      // If at least half succeeded, remove from list (user can manually unlike remaining)
      if (successfulUnlikes.length >= likedVerseIds.length / 2) {
        likedPoems.value = likedPoems.value.filter(p => (p.poem_id || p.id) !== poemId)
        console.log('✅ Poem removed from list (some verses may still be liked on server)')
      } else {
        alert(`خطا در حذف برخی بیت‌ها. ${failedUnlikes.length} بیت حذف نشد. لطفاً دوباره تلاش کنید.`)
      }
    }
  } catch (err) {
    console.error('Error removing poem:', err)
    alert('خطا در حذف شعر. لطفاً دوباره تلاش کنید.')
  } finally {
    isRemovingPoem.value = null
  }
}

async function loadLikedPoems(reset = false) {
  if (!authStore.isAuthenticated.value) {
    likedPoems.value = []
    return
  }
  
  try {
    isLoadingLikedPoems.value = true
    const offset = reset ? 0 : likedPoemsOffset.value
    const result = await ApiService.getLikedPoems({ limit: 20, offset })
    
    let poems = result.poems || result || []
    
    // Sync liked verses from API response with localStorage
    poems.forEach(poem => {
      if (poem.couplets) {
        LikedVersesManager.syncFromPoemData(poem)
      }
    })
    
    // Filter out poems that have no liked verses (shouldn't happen, but safety check)
    const likedVerseIdsFromStorage = LikedVersesManager.getLikedVerses()
    poems = poems.filter(poem => {
      const likedVerseIds = getLikedVerseIds(poem)
      return likedVerseIds.length > 0
    })
    
    if (reset) {
      likedPoems.value = poems
    } else {
      // Merge with existing, avoiding duplicates
      const existingIds = new Set(likedPoems.value.map(p => String(p.poem_id || p.id)))
      const newPoems = poems.filter(p => !existingIds.has(String(p.poem_id || p.id)))
      likedPoems.value = [...likedPoems.value, ...newPoems]
    }
    
    likedPoemsOffset.value = offset + poems.length
    hasMoreLikedPoems.value = poems.length === 20
  } catch (e) {
    console.error('Failed to load liked poems', e)
    if (reset) {
      likedPoems.value = []
    }
  } finally {
    isLoadingLikedPoems.value = false
  }
}

async function loadMoreLikedPoems() {
  await loadLikedPoems(false)
}

onMounted(() => {
  loadUserData()
  loadUsers()
  // Load liked verses from localStorage on mount
  const likedVerses = LikedVersesManager.getLikedVerses()
  console.log('📖 ProfilePage: Loaded liked verses from localStorage:', likedVerses.size, 'verses')
  loadLikedPoems(true)
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

/* Liked Poems Section Styles */
.liked-poems-section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px dashed rgba(205, 199, 198, 0.2);
}

.liked-poems-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 20px;
}

.poem-card {
  background: #1a1a1a;
  border: 1px solid #CDC7C6;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.3s ease;
}

.poem-card:hover {
  border-color: #702632;
  background: #2a2a2a;
}

.poem-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.poem-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.poem-title {
  margin: 0;
  color: #CDC7C6;
  font-size: 1.2rem;
  flex: 1;
  font-family: 'Vazirmatn', sans-serif;
}

.view-poem-btn {
  background: #702632;
  color: white;
  border: 1px solid #702632;
  padding: 6px 12px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: 'Vazirmatn', sans-serif;
}

.view-poem-btn:hover {
  background: #8b3a42;
  border-color: #8b3a42;
}

.remove-poem-btn {
  background: transparent;
  color: #9aa0a6;
  border: 1px solid #2c2c2c;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.remove-poem-btn:hover:not(:disabled) {
  background: #e74c3c;
  border-color: #e74c3c;
  color: white;
  transform: scale(1.05);
}

.remove-poem-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.remove-poem-btn svg {
  width: 16px;
  height: 16px;
}

.removing-text {
  font-size: 0.75rem;
  color: #9aa0a6;
}

.poem-meta {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: #9aa0a6;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.poem-category {
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(112, 38, 50, 0.2);
  color: #702632;
  font-family: 'Vazirmatn', sans-serif;
}

.poem-title-text {
  color: #ddd;
  font-family: 'Vazirmatn', sans-serif;
}

.poem-excerpt {
  margin: 0;
  color: #ddd;
  line-height: 1.6;
  font-family: 'Vazirmatn', sans-serif;
}

.liked-verses-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(112, 38, 50, 0.3);
}

.liked-verses-title {
  margin: 0 0 8px 0;
  color: #702632;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: 'Vazirmatn', sans-serif;
}

.liked-verses-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.liked-verse-item {
  padding: 10px 12px;
  background: rgba(112, 38, 50, 0.15);
  border-right: 3px solid #702632;
  border-radius: 4px;
  color: #CDC7C6;
  line-height: 1.8;
  font-size: 0.95rem;
  direction: rtl;
  text-align: right;
  position: relative;
  padding-right: 35px;
  font-family: 'Vazirmatn', sans-serif;
}

.liked-verse-item::before {
  content: '❤️';
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  opacity: 0.7;
}

.load-more-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.load-more-btn {
  background: transparent;
  color: #702632;
  border: 1px solid #702632;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Vazirmatn', sans-serif;
}

.load-more-btn:hover:not(:disabled) {
  background: #702632;
  color: white;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading,
.empty-state {
  text-align: center;
  padding: 24px 0;
  color: #9aa0a6;
  font-family: 'Vazirmatn', sans-serif;
}
</style>
