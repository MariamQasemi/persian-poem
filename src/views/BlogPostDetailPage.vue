<template>
  <div class="blog-post-detail-page">
    <Navbar />

    <div class="blog-post-container">
      <button @click="goBack" class="back-btn">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        بازگشت
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>در حال بارگذاری پست...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadPost" class="retry-btn">تلاش مجدد</button>
      </div>

      <!-- Post Content -->
      <div v-else-if="post" class="post-detail">
        <!-- Post Header -->
        <div class="post-header">
          <div class="post-title-section">
            <h1 class="post-title">{{ post.title }}</h1>
            <div class="post-meta">
              <span class="post-author">{{ post.author_username || post.author_name || 'نویسنده نامشخص' }}</span>
              <span v-if="post.tags && post.tags.length > 0" class="post-tags">
                <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
              </span>
              <span v-if="post.is_published === false" class="post-status draft">پیش‌نویس</span>
            </div>
          </div>
          
          <div v-if="authStore.isAuthenticated.value" class="post-actions">
            <button @click="toggleEditMode" class="action-btn edit-btn">
              {{ isEditMode ? 'لغو ویرایش' : 'ویرایش' }}
            </button>
            <button @click="handleDelete" class="action-btn delete-btn" :disabled="isDeleting">
              {{ isDeleting ? 'در حال حذف...' : 'حذف' }}
            </button>
          </div>
        </div>

        <!-- Edit Mode -->
        <div v-if="isEditMode" class="edit-form-container">
          <form @submit.prevent="handleUpdatePost" class="edit-form">
            <div class="form-row">
              <label class="form-label" for="edit-title">عنوان</label>
              <input v-model="editForm.title" id="edit-title" type="text" class="form-input" />
            </div>

            <div class="form-row">
              <label class="form-label" for="edit-content">محتوا</label>
              <textarea v-model="editForm.content" id="edit-content" rows="10" class="form-textarea"></textarea>
            </div>

            <div class="form-row two-cols">
              <div class="col">
                <label class="form-label" for="edit-tags">برچسب‌ها (با , جدا کنید)</label>
                <input v-model="editForm.tagsInput" id="edit-tags" type="text" class="form-input" />
              </div>
              <div class="col checkbox-col">
                <label class="checkbox">
                  <input v-model="editForm.is_published" type="checkbox" />
                  انتشار شود
                </label>
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="save-btn" :disabled="isSubmitting">
                {{ isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
              </button>
              <button type="button" @click="toggleEditMode" class="cancel-btn">لغو</button>
            </div>
          </form>
        </div>

        <!-- View Mode -->
        <div v-else class="post-content">
          <div class="post-body" v-html="formatContent(post.content)"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '../services/api.js'
import { useAuthStore } from '../stores/auth.js'
import Navbar from '../components/Navbar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const post = ref(null)
const loading = ref(false)
const error = ref(null)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)

const editForm = ref({
  title: '',
  content: '',
  tagsInput: '',
  is_published: true
})

const loadPost = async () => {
  const postId = route.params.id
  if (!postId) {
    error.value = 'شناسه پست یافت نشد'
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log('Loading blog post with ID:', postId)
    const postData = await ApiService.getBlogPost(postId)
    console.log('Loaded post:', postData)
    post.value = postData
    
    // Initialize edit form with post data
    editForm.value = {
      title: postData.title || '',
      content: postData.content || '',
      tagsInput: (postData.tags || []).join(', '),
      is_published: postData.is_published !== false
    }
  } catch (err) {
    console.error('Error loading post:', err)
    error.value = 'خطا در بارگذاری پست. لطفاً دوباره تلاش کنید.'
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (isEditMode.value && post.value) {
    // Reset edit form when entering edit mode
    editForm.value = {
      title: post.value.title || '',
      content: post.value.content || '',
      tagsInput: (post.value.tags || []).join(', '),
      is_published: post.value.is_published !== false
    }
  }
}

const handleUpdatePost = async () => {
  if (!post.value) return

  try {
    isSubmitting.value = true
    
    const payload = {
      title: editForm.value.title?.trim(),
      content: editForm.value.content?.trim(),
      is_published: !!editForm.value.is_published,
      tags: (editForm.value.tagsInput || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
    }

    if (!payload.title || !payload.content) {
      alert('عنوان و محتوا الزامی هستند')
      return
    }

    const updated = await ApiService.updateBlogPost(post.value.id, payload)
    post.value = updated
    isEditMode.value = false
    alert('پست با موفقیت به‌روزرسانی شد')
  } catch (e) {
    console.error('Update post failed:', e)
    alert(e?.message || 'خطا در به‌روزرسانی پست')
  } finally {
    isSubmitting.value = false
  }
}

const handleDelete = async () => {
  if (!post.value) return

  if (!confirm('آیا مطمئن هستید که می‌خواهید این پست را حذف کنید؟')) {
    return
  }

  try {
    isDeleting.value = true
    await ApiService.deleteBlogPost(post.value.id)
    alert('پست با موفقیت حذف شد')
    router.push('/blog')
  } catch (e) {
    console.error('Delete post failed:', e)
    alert(e?.message || 'خطا در حذف پست')
  } finally {
    isDeleting.value = false
  }
}

const formatContent = (content) => {
  if (!content) return ''
  // Convert newlines to <br> tags and escape HTML
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>')
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.blog-post-detail-page {
  min-height: 100vh;
  background: #0f0f0f;
  color: #CDC7C6;
}

.blog-post-container {
  padding: 120px 20px 40px;
  max-width: 960px;
  margin: 0 auto;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid #CDC7C6;
  color: #CDC7C6;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

.back-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #CDC7C6;
  font-size: 1.2rem;
}

.error-state {
  color: #ff6b6b;
}

.retry-btn {
  background: #702632;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #8b3a42;
}

.post-detail {
  background: #1a1a1a;
  border: 1px solid #CDC7C6;
  border-radius: 12px;
  padding: 40px;
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(205, 199, 198, 0.2);
}

.post-title-section {
  flex: 1;
}

.post-title {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  margin: 0 0 12px 0;
}

.post-meta {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: #9aa0a6;
  flex-wrap: wrap;
}

.post-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-family: 'Vazirmatn', sans-serif;
  transition: all 0.3s ease;
  border: 1px solid;
}

.edit-btn {
  background: #702632;
  color: white;
  border-color: #702632;
}

.edit-btn:hover {
  background: #8b3a42;
  border-color: #8b3a42;
}

.delete-btn {
  background: #e74c3c;
  color: white;
  border-color: #e74c3c;
}

.delete-btn:hover:not(:disabled) {
  background: #c0392b;
  border-color: #c0392b;
}

.delete-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.post-content {
  margin-top: 20px;
}

.post-body {
  font-size: 1.1rem;
  line-height: 2;
  color: #ddd;
  white-space: pre-wrap;
}

.post-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(112, 38, 50, 0.3);
  color: #702632;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.post-status.draft {
  background: #f39c12;
  color: #000;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.edit-form-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(205, 199, 198, 0.2);
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
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

.form-input,
.form-textarea {
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
}

.form-actions {
  display: flex;
  gap: 12px;
}

.save-btn {
  background: #702632;
  color: white;
  border: 1px solid #702632;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cancel-btn {
  background: transparent;
  color: #CDC7C6;
  border: 1px solid #CDC7C6;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: rgba(205, 199, 198, 0.1);
}

@media (max-width: 768px) {
  .blog-post-container {
    padding: 100px 15px 20px;
  }

  .post-detail {
    padding: 20px;
  }

  .post-header {
    flex-direction: column;
  }

  .post-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .two-cols {
    flex-direction: column;
  }
}
</style>

