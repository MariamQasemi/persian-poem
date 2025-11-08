<template>
  <div class="blog-page">
    <Navbar />

    <div class="blog-container">
      <div class="blog-header">
        <h1 class="blog-title">بلاگ</h1>
        <p class="blog-subtitle">در اینجا نوشته‌های آینده نمایش داده می‌شوند</p>
      </div>

      <div class="blog-content">
        <!-- Create Post Form -->
        <div class="create-post">
          <h2 class="section-title">ایجاد پست جدید</h2>
          <form @submit.prevent="handleCreatePost" class="create-form">
            <div class="form-row">
              <label class="form-label" for="title">عنوان</label>
              <input v-model="form.title" id="title" type="text" class="form-input" placeholder="عنوان پست" />
            </div>

            <div class="form-row">
              <label class="form-label" for="author">نویسنده</label>
              <input v-model="form.author_username" id="author" type="text" class="form-input" placeholder="نام کاربری نویسنده" />
            </div>

            <div class="form-row">
              <label class="form-label" for="content">محتوا</label>
              <textarea v-model="form.content" id="content" rows="5" class="form-textarea" placeholder="متن پست..."></textarea>
            </div>

            <div class="form-row two-cols">
              <div class="col">
                <label class="form-label" for="tags">برچسب‌ها (با , جدا کنید)</label>
                <input v-model="form.tagsInput" id="tags" type="text" class="form-input" placeholder="مثال: شعر,غزل,حافظ" />
              </div>
              <div class="col checkbox-col">
                <label class="checkbox">
                  <input v-model="form.is_published" type="checkbox" />
                  انتشار شود
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button class="save-btn" type="submit" :disabled="isSubmitting" @click="handleCreatePost">
                {{ isSubmitting ? 'در حال ایجاد...' : 'ایجاد پست' }}
              </button>
              <span v-if="submitError" class="error-inline">{{ submitError }}</span>
              <span v-if="submitSuccess" class="success-inline">{{ submitSuccess }}</span>
            </div>
          </form>
        </div>

        <!-- Blog Posts List -->
        <div class="posts-section">
          <h2 class="section-title">پست‌های بلاگ</h2>
          
          <div v-if="isLoading" class="loading">در حال بارگذاری...</div>
          <div v-else-if="posts.length === 0" class="empty-state">
            هنوز پستی اضافه نشده است.
          </div>
          <div v-else class="posts-list">
            <article v-for="post in posts" :key="post.id" class="post-card">
              <div class="post-header">
                <h2 class="post-title">{{ post.title }}</h2>
                <button 
                  v-if="authStore.isAuthenticated.value"
                  @click="handleDeletePost(post.id)" 
                  class="delete-btn"
                  :disabled="isDeleting === post.id"
                >
                  {{ isDeleting === post.id ? 'در حال حذف...' : 'حذف' }}
                </button>
              </div>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(post.created_at) }}</span>
                <span class="post-author">{{ post.author || post.author_name || 'نویسنده نامشخص' }}</span>
                <span v-if="post.published === false" class="post-status draft">پیش‌نویس</span>
              </div>
              <p class="post-excerpt">{{ post.excerpt || post.summary || post.content?.substring(0, 150) + '...' }}</p>
              <router-link :to="`/blog/${post.id}`" class="read-more">ادامه مطلب</router-link>
            </article>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Navbar from '../components/Navbar.vue'
import { ApiService } from '../services/api.js'
import { useAuthStore } from '../stores/auth.js'
import { LikedVersesManager } from '../utils/likedVersesManager.js'

const posts = ref([])
const likedPoems = ref([])
const isLoading = ref(false)
const isLoadingLikedPoems = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(null)
const isRemovingPoem = ref(null) // Track which poem is being removed
const submitError = ref('')
const submitSuccess = ref('')
const likedPoemsOffset = ref(0)
const hasMoreLikedPoems = ref(false)

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser?.value || {})

const form = ref({
  title: '',
  content: '',
  is_published: true,
  tagsInput: '', // comma separated; will be converted to array
  author_username: ''
})

const formatDate = (iso) => {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fa-IR')
  } catch (e) {
    return '—'
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

async function loadPosts() {
  try {
    isLoading.value = true
    const result = await ApiService.getBlogPosts()
    posts.value = result.posts || []
  } catch (e) {
    console.error('Failed to load posts', e)
    posts.value = []
  } finally {
    isLoading.value = false
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

async function handleCreatePost() {
  submitError.value = ''
  submitSuccess.value = ''

  // Check if user is authenticated
  if (!authStore.isAuthenticated.value) {
    submitError.value = 'برای ایجاد پست باید وارد شوید'
    return
  }

  const payload = {
    title: form.value.title?.trim(),
    content: form.value.content?.trim(),
    author_name: currentUser.value?.name || currentUser.value?.full_name || 'نویسنده',
    author_username: form.value.author_username?.trim() || currentUser.value?.username || currentUser.value?.email || 'anonymous',
    is_published: !!form.value.is_published,
    tags: (form.value.tagsInput || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
  }

  if (!payload.title || !payload.content) {
    submitError.value = 'عنوان و محتوا الزامی هستند'
    return
  }

  try {
    isSubmitting.value = true
    console.log('Submitting create post payload:', payload)
    console.log('Current user:', currentUser.value)
    console.log('Auth status:', authStore.isAuthenticated.value)
    
    const created = await ApiService.createBlogPost(payload)
    console.log('Create post result:', created)
    submitSuccess.value = 'پست با موفقیت ایجاد شد'
    
    // Reset form
    form.value.title = ''
    form.value.content = ''
    form.value.tagsInput = ''
    form.value.is_published = true
    form.value.author_username = ''
    
    // Reload list
    await loadPosts()
  } catch (e) {
    console.error('Create post failed:', e)
    submitError.value = e?.message || 'خطا در ایجاد پست'
  } finally {
    isSubmitting.value = false
    setTimeout(() => { submitSuccess.value = '' }, 2000)
  }
}

async function handleDeletePost(postId) {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟')) {
    return
  }

  try {
    isDeleting.value = postId
    await ApiService.deleteBlogPost(postId)
    submitSuccess.value = 'پست با موفقیت حذف شد'
    await loadPosts()
  } catch (e) {
    console.error('Delete post failed:', e)
    submitError.value = e?.message || 'خطا در حذف پست'
    setTimeout(() => { submitError.value = '' }, 3000)
  } finally {
    isDeleting.value = null
    setTimeout(() => { submitSuccess.value = '' }, 2000)
  }
}

onMounted(async () => {
  // Load liked verses from localStorage on mount
  const likedVerses = LikedVersesManager.getLikedVerses()
  console.log('📖 BlogPage: Loaded liked verses from localStorage:', likedVerses.size, 'verses')
  
  await loadPosts()
  await loadLikedPoems(true)
})
</script>

<style scoped>
.blog-page {
  min-height: 100vh;
  background: #0f0f0f;
  color: #CDC7C6;
}

.blog-container {
  padding: 120px 20px 40px;
  max-width: 960px;
  margin: 0 auto;
}

.blog-header {
  margin-bottom: 24px;
}

.blog-title {
  margin: 0 0 8px 0;
}

.blog-subtitle {
  margin: 0;
  color: #9aa0a6;
}

.blog-content {
  background: #1a1a1a;
  border: 1px solid #CDC7C6;
  border-radius: 12px;
  padding: 24px;
}

.create-post {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #2c2c2c;
}

.section-title {
  margin: 0 0 12px 0;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.two-cols {
  flex-direction: row;
  gap: 16px;
}

.two-cols .col {
  flex: 1;
}

.checkbox-col {
  display: flex;
  align-items: flex-end;
}

.form-label {
  color: #9aa0a6;
}

.form-input, .form-textarea {
  background: #121212;
  border: 1px solid #2c2c2c;
  color: #fff;
  border-radius: 8px;
  padding: 10px 12px;
}

.form-textarea {
  resize: vertical;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 100%;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.save-btn {
  background: #702632;
  color: white;
  border: 1px solid #702632;
  padding: 8px 14px;
  border-radius: 8px;
}

.save-btn[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-inline {
  color: #e74c3c;
}

.success-inline {
  color: #27ae60;
}

.loading,
.empty-state {
  text-align: center;
  padding: 24px 0;
  color: #9aa0a6;
}

.posts-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.post-card {
  background: #121212;
  border: 1px solid #2c2c2c;
  border-radius: 10px;
  padding: 16px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}

.post-title {
  margin: 0;
  color: #fff;
  flex: 1;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border: 1px solid #e74c3c;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.delete-btn:hover:not(:disabled) {
  background: #c0392b;
  border-color: #c0392b;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.post-meta {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: #9aa0a6;
  margin-bottom: 8px;
}

.post-excerpt {
  margin: 0 0 12px 0;
  color: #ddd;
}

.read-more {
  color: #702632;
  text-decoration: underline;
  padding: 6px 10px;
  border-radius: 6px;
}

.read-more:hover {
  background: #702632;
  color: white;
}

.posts-section {
  margin-top: 24px;
}

.liked-poems-section {
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px dashed #2c2c2c;
}

.liked-poems-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

.poem-card {
  background: #121212;
  border: 1px solid #2c2c2c;
  border-radius: 10px;
  padding: 16px;
  transition: all 0.3s ease;
}

.poem-card:hover {
  border-color: #702632;
  background: #1a1a1a;
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
  color: #fff;
  font-size: 1.2rem;
  flex: 1;
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
}

.poem-title-text {
  color: #ddd;
}

.poem-excerpt {
  margin: 0;
  color: #ddd;
  line-height: 1.6;
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
}

.load-more-btn:hover:not(:disabled) {
  background: #702632;
  color: white;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.post-status {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.post-status.draft {
  background: #f39c12;
  color: #000;
}

.post-meta {
  display: flex;
  gap: 12px;
  font-size: 0.85rem;
  color: #9aa0a6;
  margin-bottom: 8px;
  flex-wrap: wrap;
  align-items: center;
}
</style>


