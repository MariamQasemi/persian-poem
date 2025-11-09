<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">ایجاد پست جدید</h2>
        <button @click="closeModal" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-row">
          <label class="form-label" for="title">عنوان</label>
          <input 
            v-model="form.title" 
            id="title" 
            type="text" 
            class="form-input" 
            placeholder="عنوان پست"
            required
          />
        </div>

        <div class="form-row">
          <label class="form-label" for="author">نویسنده</label>
          <input 
            v-model="form.author_username" 
            id="author" 
            type="text" 
            class="form-input" 
            placeholder="نام کاربری نویسنده"
          />
        </div>

        <div class="form-row">
          <label class="form-label" for="content">محتوا</label>
          <textarea 
            v-model="form.content" 
            id="content" 
            rows="5" 
            class="form-textarea" 
            placeholder="متن پست..."
            required
          ></textarea>
        </div>

        <div class="form-row two-cols">
          <div class="col">
            <label class="form-label" for="tags">برچسب‌ها (با , جدا کنید)</label>
            <input 
              v-model="form.tagsInput" 
              id="tags" 
              type="text" 
              class="form-input" 
              placeholder="مثال: شعر,غزل,حافظ"
            />
          </div>
          <div class="col checkbox-col">
            <label class="checkbox">
              <input v-model="form.is_published" type="checkbox" />
              انتشار شود
            </label>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" @click="closeModal" class="cancel-btn">لغو</button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'در حال ایجاد...' : 'ایجاد پست' }}
          </button>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>
        <div v-if="success" class="success-message">{{ success }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ApiService } from '../services/api.js'
import { useAuthStore } from '../stores/auth.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'created'])

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser?.value || {})

const form = ref({
  title: '',
  content: '',
  is_published: true,
  tagsInput: '',
  author_username: ''
})

const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetForm()
  }
})

const resetForm = () => {
  form.value = {
    title: '',
    content: '',
    is_published: true,
    tagsInput: '',
    author_username: ''
  }
  error.value = ''
  success.value = ''
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const handleSubmit = async () => {
  if (!authStore.isAuthenticated.value) {
    error.value = 'برای ایجاد پست باید وارد شوید'
    return
  }

  error.value = ''
  success.value = ''
  isSubmitting.value = true

  try {
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
      error.value = 'عنوان و محتوا الزامی هستند'
      isSubmitting.value = false
      return
    }

    console.log('Submitting post:', payload)
    const created = await ApiService.createBlogPost(payload)
    console.log('Post created:', created)

    success.value = 'پست با موفقیت ایجاد شد'
    emit('created', created)
    
    // Close modal after a short delay
    setTimeout(() => {
      closeModal()
    }, 1500)

  } catch (e) {
    console.error('Create post failed:', e)
    error.value = e?.message || 'خطا در ایجاد پست'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  direction: rtl;
}

.modal-container {
  background: #1a1a1a;
  border: 1px solid #CDC7C6;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(205, 199, 198, 0.2);
}

.modal-title {
  margin: 0;
  color: #fff;
  font-size: 1.5rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: #CDC7C6;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(205, 199, 198, 0.1);
  color: #fff;
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

.modal-form {
  padding: 20px;
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
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  background: #121212;
  border: 1px solid #2c2c2c;
  color: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  font-family: 'Vazirmatn', sans-serif;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.cancel-btn {
  background: transparent;
  color: #CDC7C6;
  border: 1px solid #CDC7C6;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Vazirmatn', sans-serif;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(205, 199, 198, 0.1);
}

.submit-btn {
  background: #702632;
  color: white;
  border: 1px solid #702632;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Vazirmatn', sans-serif;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #8b3a42;
  border-color: #8b3a42;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #e74c3c;
  margin-top: 12px;
  padding: 12px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.success-message {
  color: #27ae60;
  margin-top: 12px;
  padding: 12px;
  background: rgba(39, 174, 96, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(39, 174, 96, 0.3);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }

  .modal-container {
    max-height: 95vh;
  }

  .modal-header {
    padding: 15px;
  }

  .modal-form {
    padding: 15px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
  }

  .two-cols {
    flex-direction: column;
  }
}
</style>

