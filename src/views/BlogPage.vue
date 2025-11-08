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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import Navbar from '../components/Navbar.vue'
import { ApiService } from '../services/api.js'
import { useAuthStore } from '../stores/auth.js'

const posts = ref([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(null)
const submitError = ref('')
const submitSuccess = ref('')

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
  await loadPosts()
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


