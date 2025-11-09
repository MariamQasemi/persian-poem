<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2 class="modal-title">ایجاد یادداشت جدید</h2>
        <button @click="closeModal" class="close-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <!-- Verse Context Section (Collapsible) -->
        <div v-if="selectedVerseId && verseInfo" class="verse-context-section">
          <button 
            type="button" 
            @click="isVerseContextExpanded = !isVerseContextExpanded" 
            class="verse-context-toggle"
          >
            <span class="toggle-icon" :class="{ expanded: isVerseContextExpanded }">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span>اطلاعات بیت</span>
          </button>
          <div v-if="isVerseContextExpanded" class="verse-context-content">
            <div class="verse-context-item">
              <strong>شاعر:</strong> {{ verseInfo.poet_name || verseInfo.poet || 'نامشخص' }}
            </div>
            <div class="verse-context-item">
              <strong>شعر:</strong> {{ verseInfo.poem_title || verseInfo.poem_name || verseInfo.title || 'نامشخص' }}
            </div>
            <div class="verse-context-item">
              <strong>بیت:</strong>
              <div class="verse-text">{{ verseInfo.verse_text || verseInfo.text || 'متن بیت در دسترس نیست' }}</div>
            </div>
          </div>
        </div>
        <div v-if="selectedVerseId && loadingVerseInfo" class="verse-context-loading">
          در حال بارگذاری اطلاعات بیت...
        </div>
        <div v-if="selectedVerseId && verseError" class="verse-context-error">
          خطا در بارگذاری اطلاعات بیت: {{ verseError }}
        </div>

        <div class="form-row">
          <label class="form-label" for="title">عنوان</label>
          <input 
            v-model="form.title" 
            id="title" 
            type="text" 
            class="form-input" 
            placeholder="عنوان یادداشت"
            required
          />
        </div>

        <div class="form-row">
          <label class="form-label" for="text">متن یادداشت</label>
          <textarea 
            v-model="form.text" 
            id="text" 
            rows="5" 
            class="form-textarea" 
            placeholder="متن یادداشت..."
          ></textarea>
        </div>

        <div class="form-row">
          <label class="form-label" for="tags">برچسب‌ها (با , جدا کنید)</label>
          <input 
            v-model="form.tagsInput" 
            id="tags" 
            type="text" 
            class="form-input" 
            placeholder="مثال: شعر,غزل,حافظ"
          />
        </div>

        <!-- Photo Section -->
        <div class="form-row">
          <label class="form-label">عکس</label>
          <div class="file-input-section">
            <div class="input-toggle">
              <button 
                type="button"
                @click="photoInputType = 'file'"
                :class="['toggle-btn', { active: photoInputType === 'file' }]"
              >
                آپلود فایل
              </button>
              <button 
                type="button"
                @click="photoInputType = 'url'"
                :class="['toggle-btn', { active: photoInputType === 'url' }]"
              >
                لینک URL
              </button>
            </div>
            
            <div v-if="photoInputType === 'file'" class="file-upload-area">
              <input 
                ref="photoFileInput"
                type="file" 
                accept="image/*"
                @change="handlePhotoFileChange"
                class="file-input"
              />
              <div v-if="photoPreview" class="preview-container">
                <img :src="photoPreview" alt="Photo preview" class="preview-image" />
                <button type="button" @click="clearPhoto" class="clear-btn">حذف</button>
              </div>
            </div>
            
            <input 
              v-else
              v-model="form.photoUrl" 
              type="url" 
              class="form-input" 
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <!-- Voice Section -->
        <div class="form-row">
          <label class="form-label">صدا</label>
          <div class="file-input-section">
            <div class="input-toggle">
              <button 
                type="button"
                @click="voiceInputType = 'file'"
                :class="['toggle-btn', { active: voiceInputType === 'file' }]"
              >
                آپلود فایل
              </button>
              <button 
                type="button"
                @click="voiceInputType = 'url'"
                :class="['toggle-btn', { active: voiceInputType === 'url' }]"
              >
                لینک URL
              </button>
            </div>
            
            <div v-if="voiceInputType === 'file'" class="file-upload-area">
              <input 
                ref="voiceFileInput"
                type="file" 
                accept="audio/*"
                @change="handleVoiceFileChange"
                class="file-input"
              />
              <div v-if="voicePreview" class="preview-container">
                <audio :src="voicePreview" controls class="preview-audio"></audio>
                <button type="button" @click="clearVoice" class="clear-btn">حذف</button>
              </div>
            </div>
            
            <input 
              v-else
              v-model="form.voiceUrl" 
              type="url" 
              class="form-input" 
              placeholder="https://example.com/audio.mp3"
            />
          </div>
        </div>


        <div class="form-actions">
          <button type="button" @click="closeModal" class="cancel-btn">لغو</button>
          <button type="submit" class="submit-btn" :disabled="isSubmitting">
            {{ isSubmitting ? 'در حال ایجاد...' : 'ایجاد یادداشت' }}
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
import { getVerseInfo, setVerseInfo } from '../utils/verseCache.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  verseId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['close', 'created'])

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser?.value || {})

const form = ref({
  title: '',
  text: '',
  tagsInput: '',
  photoUrl: '',
  voiceUrl: ''
})

const photoInputType = ref('file')
const voiceInputType = ref('file')
const photoFile = ref(null)
const voiceFile = ref(null)
const photoPreview = ref(null)
const voicePreview = ref(null)
const photoFileInput = ref(null)
const voiceFileInput = ref(null)
const isSubmitting = ref(false)
const error = ref('')
const success = ref('')

const selectedVerseId = computed(() => props.verseId)
const verseInfo = ref(null)
const loadingVerseInfo = ref(false)
const verseError = ref(null)
const isVerseContextExpanded = ref(false)

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    resetForm()
    if (props.verseId) {
      loadVerseInfo()
    }
  }
})

watch(() => props.verseId, (newVal) => {
  // Verse ID is set, load verse info
  if (newVal) {
    loadVerseInfo()
  } else {
    verseInfo.value = null
    verseError.value = null
  }
})

const loadVerseInfo = async () => {
  if (!selectedVerseId.value) {
    verseInfo.value = null
    return
  }

  // Check cache first
  const cached = getVerseInfo(selectedVerseId.value)
  if (cached) {
    verseInfo.value = cached
    return
  }

  // Fetch from API
  loadingVerseInfo.value = true
  verseError.value = null

  try {
    const verseData = await ApiService.getVerseDetails(selectedVerseId.value)
    
    // Normalize verse data structure
    const normalized = {
      verse_id: verseData.id || verseData.verse_id || selectedVerseId.value,
      verse_text: verseData.text || verseData.verse_text || '',
      poem_id: verseData.poem_id || verseData.poem?.id,
      poem_title: verseData.poem_title || verseData.poem?.title || verseData.poem_name || '',
      poet_name: verseData.poet_name || verseData.poet?.name || verseData.poet || ''
    }
    
    verseInfo.value = normalized
    setVerseInfo(selectedVerseId.value, normalized)
  } catch (err) {
    console.error('Error loading verse info:', err)
    verseError.value = err?.message || 'خطا در بارگذاری اطلاعات بیت'
    verseInfo.value = null
  } finally {
    loadingVerseInfo.value = false
  }
}

const resetForm = () => {
  form.value = {
    title: '',
    text: '',
    tagsInput: '',
    photoUrl: '',
    voiceUrl: ''
  }
  photoFile.value = null
  voiceFile.value = null
  photoPreview.value = null
  voicePreview.value = null
  photoInputType.value = 'file'
  voiceInputType.value = 'file'
  error.value = ''
  success.value = ''
}

const handlePhotoFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      error.value = 'لطفاً یک فایل تصویری انتخاب کنید'
      return
    }
    
    // Validate file size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error.value = 'حجم فایل نباید بیشتر از 10 مگابایت باشد'
      return
    }
    
    photoFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      photoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
    error.value = ''
  }
}

const handleVoiceFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      error.value = 'لطفاً یک فایل صوتی انتخاب کنید'
      return
    }
    
    // Validate file size (e.g., max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      error.value = 'حجم فایل نباید بیشتر از 50 مگابایت باشد'
      return
    }
    
    voiceFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      voicePreview.value = e.target.result
    }
    reader.readAsDataURL(file)
    error.value = ''
  }
}

const clearPhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  if (photoFileInput.value) {
    photoFileInput.value.value = ''
  }
}

const clearVoice = () => {
  voiceFile.value = null
  voicePreview.value = null
  if (voiceFileInput.value) {
    voiceFileInput.value.value = ''
  }
}

const closeModal = () => {
  emit('close')
  resetForm()
}

const handleSubmit = async () => {
  if (!authStore.isAuthenticated.value) {
    error.value = 'برای ایجاد یادداشت باید وارد شوید'
    return
  }

  error.value = ''
  success.value = ''
  isSubmitting.value = true

  try {
    // Prepare tags
    const tags = (form.value.tagsInput || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    // Determine file URL and type
    let fileUrl = null
    let fileType = null

    // Handle photo
    if (photoInputType.value === 'file' && photoFile.value) {
      // For file upload, we need to upload the file first
      // For now, we'll use the preview URL as a placeholder
      // In production, you'd upload to a file storage service first
      fileUrl = photoPreview.value
      fileType = 'image'
    } else if (photoInputType.value === 'url' && form.value.photoUrl) {
      fileUrl = form.value.photoUrl.trim()
      fileType = 'image'
    }

    // Handle voice
    if (voiceInputType.value === 'file' && voiceFile.value) {
      // For file upload, we need to upload the file first
      // For now, we'll use the preview URL as a placeholder
      // In production, you'd upload to a file storage service first
      if (!fileUrl) {
        fileUrl = voicePreview.value
        fileType = 'voice'
      }
    } else if (voiceInputType.value === 'url' && form.value.voiceUrl) {
      if (!fileUrl) {
        fileUrl = form.value.voiceUrl.trim()
        fileType = 'voice'
      }
    }

    const noteData = {
      title: form.value.title.trim(),
      text: form.value.text.trim(),
      tags: tags,
      writer: currentUser.value?.name || currentUser.value?.full_name || currentUser.value?.username || 'نویسنده',
      related_verse_id: selectedVerseId.value || null,
      file_url: fileUrl,
      file_type: fileType
    }

    // Remove null/empty fields
    if (!noteData.related_verse_id) {
      delete noteData.related_verse_id
    }
    if (!noteData.file_url) {
      delete noteData.file_url
      delete noteData.file_type
    }

    if (!noteData.title) {
      error.value = 'عنوان الزامی است'
      isSubmitting.value = false
      return
    }

    console.log('Submitting note:', noteData)
    const created = await ApiService.createNote(noteData)
    console.log('Note created:', created)

    success.value = 'یادداشت با موفقیت ایجاد شد'
    emit('created', created)
    
    // Close modal after a short delay
    setTimeout(() => {
      closeModal()
    }, 1500)

  } catch (e) {
    console.error('Create note failed:', e)
    error.value = e?.message || 'خطا در ایجاد یادداشت'
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

.file-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-toggle {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  background: #121212;
  border: 1px solid #2c2c2c;
  color: #CDC7C6;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Vazirmatn', sans-serif;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: #2c2c2c;
}

.toggle-btn.active {
  background: #702632;
  border-color: #702632;
  color: #fff;
}

.file-upload-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.file-input {
  background: #121212;
  border: 1px solid #2c2c2c;
  color: #fff;
  border-radius: 8px;
  padding: 10px 12px;
  font-family: 'Vazirmatn', sans-serif;
}

.preview-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.preview-image {
  max-width: 100%;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #2c2c2c;
}

.preview-audio {
  width: 100%;
  max-width: 100%;
}

.clear-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  font-family: 'Vazirmatn', sans-serif;
}

.clear-btn:hover {
  background: #c0392b;
}

.info-row {
  background: rgba(112, 38, 50, 0.1);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(112, 38, 50, 0.3);
}

.info-text {
  color: #9aa0a6;
  font-size: 0.9rem;
}

.verse-context-section {
  margin-bottom: 20px;
  border: 1px solid rgba(205, 199, 198, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.verse-context-toggle {
  width: 100%;
  background: rgba(112, 38, 50, 0.1);
  border: none;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #CDC7C6;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 0.95rem;
  transition: background 0.3s ease;
}

.verse-context-toggle:hover {
  background: rgba(112, 38, 50, 0.2);
}

.toggle-icon {
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.toggle-icon svg {
  width: 20px;
  height: 20px;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.verse-context-content {
  padding: 16px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(205, 199, 198, 0.1);
}

.verse-context-item {
  margin-bottom: 12px;
  color: #ddd;
  font-size: 0.9rem;
  line-height: 1.6;
}

.verse-context-item:last-child {
  margin-bottom: 0;
}

.verse-context-item strong {
  color: #CDC7C6;
  margin-left: 8px;
}

.verse-text {
  margin-top: 8px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  font-style: italic;
  color: #fff;
  line-height: 1.8;
  text-align: right;
}

.verse-context-loading {
  padding: 12px;
  text-align: center;
  color: #9aa0a6;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

.verse-context-error {
  padding: 12px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 16px;
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
}
</style>

