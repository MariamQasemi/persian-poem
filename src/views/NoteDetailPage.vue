<template>
  <div class="note-detail-page">
    <Navbar />

    <div class="note-container">
      <button @click="goBack" class="back-btn">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        بازگشت
      </button>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>در حال بارگذاری یادداشت...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
        <button @click="loadNote" class="retry-btn">تلاش مجدد</button>
      </div>

      <!-- Note Content -->
      <div v-else-if="note" class="note-detail">
        <!-- Note Header -->
        <div class="note-header">
          <div class="note-title-section">
            <h1 class="note-title">{{ note.title }}</h1>
            <div class="note-meta">
              <span class="note-writer">{{ note.writer || 'نویسنده نامشخص' }}</span>
              <span v-if="note.tags && note.tags.length > 0" class="note-tags">
                <span v-for="tag in note.tags" :key="tag" class="tag">{{ tag }}</span>
              </span>
              <!-- Verse context will be shown below in collapsible section -->
            </div>
          </div>
          
          <div v-if="authStore.isAuthenticated.value" class="note-actions">
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
          <form @submit.prevent="handleUpdateNote" class="edit-form">
            <div class="form-row">
              <label class="form-label" for="edit-title">عنوان</label>
              <input v-model="editForm.title" id="edit-title" type="text" class="form-input" required />
            </div>

            <div class="form-row">
              <label class="form-label" for="edit-text">متن یادداشت</label>
              <textarea v-model="editForm.text" id="edit-text" rows="10" class="form-textarea"></textarea>
            </div>

            <div class="form-row">
              <label class="form-label" for="edit-tags">برچسب‌ها (با , جدا کنید)</label>
              <input v-model="editForm.tagsInput" id="edit-tags" type="text" class="form-input" />
            </div>

            <div class="form-row">
              <label class="form-label" for="edit-writer">نویسنده</label>
              <input v-model="editForm.writer" id="edit-writer" type="text" class="form-input" />
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
                  <div v-if="photoPreview || (note.file_url && note.file_type === 'image')" class="preview-container">
                    <img :src="photoPreview || note.file_url" alt="Photo preview" class="preview-image" />
                    <button type="button" @click="clearPhoto" class="clear-btn">حذف</button>
                  </div>
                </div>
                
                <input 
                  v-else
                  v-model="editForm.photoUrl" 
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
                  <div v-if="voicePreview || (note.file_url && note.file_type === 'voice')" class="preview-container">
                    <audio :src="voicePreview || note.file_url" controls class="preview-audio"></audio>
                    <button type="button" @click="clearVoice" class="clear-btn">حذف</button>
                  </div>
                </div>
                
                <input 
                  v-else
                  v-model="editForm.voiceUrl" 
                  type="url" 
                  class="form-input" 
                  placeholder="https://example.com/audio.mp3"
                />
              </div>
            </div>

            <div class="form-actions">
              <button type="submit" class="save-btn" :disabled="isSubmitting">
                {{ isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
              </button>
              <button type="button" @click="toggleEditMode" class="cancel-btn">لغو</button>
            </div>
            
            <div v-if="error" class="error-message">{{ error }}</div>
          </form>
        </div>

        <!-- View Mode -->
        <div v-else class="note-content">
          <!-- Verse Context Section (Collapsible) -->
          <div v-if="note && note.related_verse_id && verseInfo" class="verse-context-section">
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
              <span>اطلاعات بیت مرتبط</span>
            </button>
            <div v-if="isVerseContextExpanded" class="verse-context-content">
              <div class="verse-context-item">
                <strong>شاعر:</strong> 
                <router-link v-if="verseInfo.poet_id" :to="`/poet/${verseInfo.poet_id}`" class="verse-link">
                  {{ verseInfo.poet_name || verseInfo.poet || 'نامشخص' }}
                </router-link>
                <span v-else>{{ verseInfo.poet_name || verseInfo.poet || 'نامشخص' }}</span>
              </div>
              <div class="verse-context-item">
                <strong>شعر:</strong> 
                <router-link v-if="verseInfo.poem_id" :to="`/poem/${verseInfo.poem_id}`" class="verse-link">
                  {{ verseInfo.poem_title || verseInfo.poem_name || verseInfo.title || 'نامشخص' }}
                </router-link>
                <span v-else>{{ verseInfo.poem_title || verseInfo.poem_name || verseInfo.title || 'نامشخص' }}</span>
              </div>
              <div class="verse-context-item">
                <strong>بیت:</strong>
                <div class="verse-text">{{ getVerseText(verseInfo) || 'متن بیت در دسترس نیست' }}</div>
              </div>
            </div>
          </div>
          <div v-if="note && note.related_verse_id && loadingVerseInfo" class="verse-context-loading">
            در حال بارگذاری اطلاعات بیت...
          </div>
          <div v-if="note && note.related_verse_id && verseError" class="verse-context-error">
            خطا در بارگذاری اطلاعات بیت: {{ verseError }}
          </div>

          <!-- Note Body - Display note text here -->
          <div v-if="note && (note.text || note.content)" class="note-body" v-html="formatContent(note.text || note.content)"></div>
          <div v-else-if="note" class="note-body empty-text">این یادداشت متن ندارد</div>
          
          <!-- Note Image -->
          <div v-if="note.file_url && note.file_type === 'image'" class="note-image">
            <img :src="note.file_url" alt="Note image" />
          </div>
          
          <!-- Note Voice -->
          <div v-if="note.file_url && note.file_type === 'voice'" class="note-voice">
            <audio :src="note.file_url" controls></audio>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '../services/api.js'
import { useAuthStore } from '../stores/auth.js'
import { getVerseInfo, setVerseInfo } from '../utils/verseCache.js'
import Navbar from '../components/Navbar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const note = ref(null)
const loading = ref(false)
const error = ref(null)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const verseInfo = ref(null)
const loadingVerseInfo = ref(false)
const verseError = ref(null)
const isVerseContextExpanded = ref(false)

const editForm = ref({
  title: '',
  text: '',
  tagsInput: '',
  writer: '',
  photoUrl: '',
  voiceUrl: ''
})

const photoInputType = ref('url')
const voiceInputType = ref('url')
const photoFile = ref(null)
const voiceFile = ref(null)
const photoPreview = ref(null)
const voicePreview = ref(null)
const photoFileInput = ref(null)
const voiceFileInput = ref(null)

const loadNote = async () => {
  const noteId = route.params.id
  if (!noteId) {
    error.value = 'شناسه یادداشت یافت نشد'
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log('Loading note with ID:', noteId)
    const noteData = await ApiService.getNote(noteId)
    console.log('Loaded note:', noteData)
    console.log('Note text field:', noteData.text)
    console.log('Note content field:', noteData.content)
    
    // Handle different field names (text vs content)
    // Note: The API response might not have a 'text' field - it might be empty or not exist
    const noteText = noteData.text !== undefined ? noteData.text : (noteData.content !== undefined ? noteData.content : '')
    
    // Ensure note object has text field for display (even if empty)
    note.value = {
      ...noteData,
      text: noteText || '' // Ensure text field exists, even if empty
    }
    
    console.log('Normalized note text:', note.value.text)
    console.log('Note verses array:', noteData.verses)
    console.log('Related verse ID:', noteData.related_verse_id)
    
    // Initialize edit form with note data
    editForm.value = {
      title: noteData.title || '',
      text: noteText,
      tagsInput: (noteData.tags || []).join(', '),
      writer: noteData.writer || '',
      photoUrl: noteData.file_type === 'image' ? noteData.file_url || '' : '',
      voiceUrl: noteData.file_type === 'voice' ? noteData.file_url || '' : ''
    }
    
    // Set input types based on existing file
    if (noteData.file_type === 'image' && noteData.file_url) {
      photoInputType.value = 'url'
      // Store original URL to detect if it was cleared
      photoPreview.value = noteData.file_url
    } else if (noteData.file_type === 'voice' && noteData.file_url) {
      voiceInputType.value = 'url'
      // Store original URL to detect if it was cleared
      voicePreview.value = noteData.file_url
    }
    
    // Load verse info if note is linked to a verse
    // Extract verse info from note's verses array if available
    if (noteData.related_verse_id) {
      loadVerseInfo(noteData.related_verse_id, noteData)
    }
  } catch (err) {
    console.error('Error loading note:', err)
    error.value = 'خطا در بارگذاری یادداشت. لطفاً دوباره تلاش کنید.'
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (isEditMode.value && note.value) {
    // Reset edit form when entering edit mode
    editForm.value = {
      title: note.value.title || '',
      text: note.value.text || '',
      tagsInput: (note.value.tags || []).join(', '),
      writer: note.value.writer || '',
      photoUrl: note.value.file_type === 'image' ? note.value.file_url || '' : '',
      voiceUrl: note.value.file_type === 'voice' ? note.value.file_url || '' : ''
    }
    
    // Reset file inputs
    photoFile.value = null
    voiceFile.value = null
    
    // Set previews to existing files if they exist
    if (note.value.file_type === 'image' && note.value.file_url) {
      photoInputType.value = 'url'
      photoPreview.value = note.value.file_url
    } else {
      photoPreview.value = null
    }
    
    if (note.value.file_type === 'voice' && note.value.file_url) {
      voiceInputType.value = 'url'
      voicePreview.value = note.value.file_url
    } else {
      voicePreview.value = null
    }
    
    // Clear file inputs
    if (photoFileInput.value) {
      photoFileInput.value.value = ''
    }
    if (voiceFileInput.value) {
      voiceFileInput.value.value = ''
    }
  }
}

const handlePhotoFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      error.value = 'لطفاً یک فایل تصویری انتخاب کنید'
      return
    }
    
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
    if (!file.type.startsWith('audio/')) {
      error.value = 'لطفاً یک فایل صوتی انتخاب کنید'
      return
    }
    
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
  editForm.value.photoUrl = ''
  // Mark that photo should be removed
  if (photoFileInput.value) {
    photoFileInput.value.value = ''
  }
  // Also clear voice if photo was set (only one file type allowed)
  if (note.value && note.value.file_type === 'image') {
    editForm.value.voiceUrl = ''
  }
}

const clearVoice = () => {
  voiceFile.value = null
  voicePreview.value = null
  editForm.value.voiceUrl = ''
  // Mark that voice should be removed
  if (voiceFileInput.value) {
    voiceFileInput.value.value = ''
  }
  // Also clear photo if voice was set (only one file type allowed)
  if (note.value && note.value.file_type === 'voice') {
    editForm.value.photoUrl = ''
  }
}

const handleUpdateNote = async () => {
  if (!note.value) return

  try {
    isSubmitting.value = true
    error.value = ''
    
    // Prepare tags
    const tags = (editForm.value.tagsInput || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    // Determine file URL and type
    let fileUrl = null
    let fileType = null

    // Handle photo - priority: new file > new URL > existing file (if not cleared)
    const hasNewPhotoFile = photoInputType.value === 'file' && photoFile.value
    const hasNewPhotoUrl = photoInputType.value === 'url' && editForm.value.photoUrl && editForm.value.photoUrl.trim()
    const hadExistingPhoto = note.value.file_type === 'image' && note.value.file_url
    
    // Photo was cleared if: had existing photo, no new file uploaded, and URL is empty
    // (If user switched to file mode but didn't upload, we check if URL was originally set but is now empty)
    const photoWasCleared = hadExistingPhoto && !hasNewPhotoFile && !hasNewPhotoUrl && 
                            ((photoInputType.value === 'url' && !editForm.value.photoUrl) || 
                             (photoInputType.value === 'file' && !photoFile.value && !editForm.value.photoUrl))
    
    if (hasNewPhotoFile) {
      // New file uploaded
      fileUrl = photoPreview.value
      fileType = 'image'
    } else if (hasNewPhotoUrl) {
      // New URL provided
      fileUrl = editForm.value.photoUrl.trim()
      fileType = 'image'
    } else if (hadExistingPhoto && !photoWasCleared) {
      // Keep existing image if not cleared
      fileUrl = note.value.file_url
      fileType = 'image'
    }

    // Handle voice - only if no photo is set
    if (!fileUrl) {
      const hasNewVoiceFile = voiceInputType.value === 'file' && voiceFile.value
      const hasNewVoiceUrl = voiceInputType.value === 'url' && editForm.value.voiceUrl && editForm.value.voiceUrl.trim()
      const hadExistingVoice = note.value.file_type === 'voice' && note.value.file_url
      
      // Voice was cleared if: had existing voice, no new file uploaded, and URL is empty
      const voiceWasCleared = hadExistingVoice && !hasNewVoiceFile && !hasNewVoiceUrl && 
                              ((voiceInputType.value === 'url' && !editForm.value.voiceUrl) || 
                               (voiceInputType.value === 'file' && !voiceFile.value && !editForm.value.voiceUrl))
      
      if (hasNewVoiceFile) {
        // New file uploaded
        fileUrl = voicePreview.value
        fileType = 'voice'
      } else if (hasNewVoiceUrl) {
        // New URL provided
        fileUrl = editForm.value.voiceUrl.trim()
        fileType = 'voice'
      } else if (hadExistingVoice && !voiceWasCleared) {
        // Keep existing voice if not cleared
        fileUrl = note.value.file_url
        fileType = 'voice'
      }
    }

    const noteData = {
      title: editForm.value.title.trim(),
      text: editForm.value.text.trim(),
      tags: tags,
      writer: editForm.value.writer.trim() || note.value.writer || '',
      related_verse_id: note.value.related_verse_id || null,
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

    const updated = await ApiService.updateNote(note.value.id, noteData)
    note.value = updated
    isEditMode.value = false
    
    // Reload note to get fresh data
    await loadNote()
    
    alert('یادداشت با موفقیت به‌روزرسانی شد')
  } catch (e) {
    console.error('Update note failed:', e)
    error.value = e?.message || 'خطا در به‌روزرسانی یادداشت'
  } finally {
    isSubmitting.value = false
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

const handleDelete = async () => {
  if (!note.value) return

  if (!confirm('آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟')) {
    return
  }

  try {
    isDeleting.value = true
    await ApiService.deleteNote(note.value.id)
    alert('یادداشت با موفقیت حذف شد')
    router.push('/blog')
  } catch (e) {
    console.error('Delete note failed:', e)
    error.value = e?.message || 'خطا در حذف یادداشت'
    alert(error.value)
  } finally {
    isDeleting.value = false
  }
}

const loadVerseInfo = async (verseId, noteData = null) => {
  if (!verseId) {
    verseInfo.value = null
    return
  }

  // Check cache first
  const cached = getVerseInfo(verseId)
  if (cached) {
    verseInfo.value = cached
    return
  }

  // Fetch from API (pass noteData if available to extract verse from verses array)
  loadingVerseInfo.value = true
  verseError.value = null

  try {
    const verseData = await ApiService.getVerseDetails(verseId, noteData)
    
    // Normalize verse data structure
    // CRITICAL: Use verseData.text/verse_text (NOT note.text) for verse text
    // Ensure we never use note.text or note.content for verse text
    const noteText = noteData?.text || noteData?.content || ''
    let verseText = verseData.verse_text || verseData.text || ''
    
    // Safety check: if verse text matches note text, it's wrong - clear it
    if (verseText === noteText && noteText) {
      console.warn('⚠️ Verse text matches note text - this is incorrect, clearing verse text')
      verseText = ''
    }
    
    const normalized = {
      verse_id: verseData.id || verseData.verse_id || verseId,
      verse_text: verseText, // Use verse text, not note text
      poem_id: verseData.poem_id || verseData.poem?.id || null,
      poem_title: verseData.poem_title || verseData.poem?.title || verseData.poem_name || '',
      poet_id: verseData.poet_id || verseData.poet?.id || null,
      poet_name: verseData.poet_name || verseData.poet?.name || verseData.poet || ''
    }
    
    console.log('Normalized verse info:', normalized)
    console.log('Note text (should NOT be in verse):', noteText)
    console.log('Verse text (should be different from note):', verseText)
    verseInfo.value = normalized
    setVerseInfo(verseId, normalized)
  } catch (err) {
    console.error('Error loading verse info:', err)
    verseError.value = err?.message || 'خطا در بارگذاری اطلاعات بیت'
    verseInfo.value = null
  } finally {
    loadingVerseInfo.value = false
  }
}

// Helper function to get verse text, ensuring it's not note text
const getVerseText = (verseInfo) => {
  if (!verseInfo) return ''
  
  const verseText = verseInfo.verse_text || verseInfo.text || ''
  const noteText = note.value?.text || note.value?.content || ''
  
  // Safety check: if verse text matches note text, return empty (it's wrong)
  if (verseText && noteText && verseText === noteText) {
    console.warn('⚠️ Verse text matches note text - not displaying')
    return ''
  }
  
  return verseText
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  loadNote()
})
</script>

<style scoped>
.note-detail-page {
  min-height: 100vh;
  background: #0f0f0f;
  color: #CDC7C6;
}

.note-container {
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

.note-detail {
  background: #1a1a1a;
  border: 1px solid #CDC7C6;
  border-radius: 12px;
  padding: 40px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(205, 199, 198, 0.2);
}

.note-actions {
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

.edit-form-container {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(205, 199, 198, 0.2);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.save-btn {
  background: #702632;
  color: white;
  border: 1px solid #702632;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Vazirmatn', sans-serif;
  transition: all 0.3s ease;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.save-btn:hover:not(:disabled) {
  background: #8b3a42;
  border-color: #8b3a42;
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

.error-message {
  color: #e74c3c;
  margin-top: 12px;
  padding: 12px;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.note-title-section {
  flex: 1;
}

.note-title {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  margin: 0 0 12px 0;
}

.note-meta {
  display: flex;
  gap: 12px;
  font-size: 0.9rem;
  color: #9aa0a6;
  flex-wrap: wrap;
}

.note-content {
  margin-top: 20px;
}

.note-body {
  font-size: 1.1rem;
  line-height: 2;
  color: #ddd;
  white-space: pre-wrap;
  margin-bottom: 24px;
}

.note-body.empty-text {
  color: #9aa0a6;
  font-style: italic;
  padding: 20px;
  text-align: center;
  background: rgba(154, 160, 166, 0.1);
  border-radius: 8px;
}

.verse-context-section {
  margin-bottom: 24px;
  border: 1px solid rgba(205, 199, 198, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.verse-context-toggle {
  width: 100%;
  background: rgba(112, 38, 50, 0.1);
  border: none;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #CDC7C6;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 1rem;
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
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(205, 199, 198, 0.1);
}

.verse-context-item {
  margin-bottom: 16px;
  color: #ddd;
  font-size: 0.95rem;
  line-height: 1.8;
}

.verse-context-item:last-child {
  margin-bottom: 0;
}

.verse-context-item strong {
  color: #CDC7C6;
  margin-left: 8px;
}

.verse-link {
  color: #8b9dc3;
  text-decoration: none;
  transition: color 0.3s ease;
}

.verse-link:hover {
  color: #a8c0e0;
  text-decoration: underline;
}

.verse-text {
  margin-top: 12px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-style: italic;
  color: #fff;
  line-height: 2;
  text-align: right;
  border-right: 3px solid rgba(112, 38, 50, 0.5);
}

.verse-context-loading {
  padding: 16px;
  text-align: center;
  color: #9aa0a6;
  font-size: 0.9rem;
  margin-bottom: 20px;
  background: rgba(154, 160, 166, 0.1);
  border-radius: 8px;
}

.verse-context-error {
  padding: 16px;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: 8px;
  color: #e74c3c;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.note-tags {
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

.verse-reference {
  background: rgba(112, 38, 50, 0.2);
  color: #702632;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.note-image {
  margin: 24px 0;
}

.note-image img {
  max-width: 100%;
  border-radius: 8px;
  border: 1px solid #2c2c2c;
}

.note-voice {
  margin: 24px 0;
}

.note-voice audio {
  width: 100%;
  max-width: 100%;
}

@media (max-width: 768px) {
  .note-container {
    padding: 100px 15px 20px;
  }

  .note-detail {
    padding: 20px;
  }

  .note-header {
    flex-direction: column;
  }

  .note-title {
    font-size: 1.5rem;
  }
}
</style>

