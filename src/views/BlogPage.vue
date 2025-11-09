<template>
  <div class="blog-page">
    <Navbar />

    <!-- Note Modal -->
    <NoteModal 
      :isOpen="isNoteModalOpen" 
      :verseId="null"
      @close="closeNoteModal"
      @created="handleNoteCreated"
    />

    <!-- Post Modal -->
    <PostModal 
      :isOpen="isPostModalOpen" 
      @close="closePostModal"
      @created="handlePostCreated"
    />

    <div class="blog-container">
      <div class="blog-header">
        <h1 class="blog-title">بلاگ</h1>
        <p class="blog-subtitle">در اینجا نوشته‌های آینده نمایش داده می‌شوند</p>
      </div>

      <div class="blog-content">
        <!-- Filter Buttons -->
        <div class="filter-section">
          <button 
            @click="activeFilter = 'all'"
            :class="['filter-btn', { active: activeFilter === 'all' }]"
          >
            همه
          </button>
          <button 
            @click="activeFilter = 'posts'"
            :class="['filter-btn', { active: activeFilter === 'posts' }]"
          >
            پست‌ها
          </button>
          <button 
            @click="activeFilter = 'notes'"
            :class="['filter-btn', { active: activeFilter === 'notes' }]"
          >
            یادداشت‌ها
          </button>
        </div>

        <!-- Create Buttons Section -->
        <div class="create-buttons-section">
          <button @click="openPostModal" class="create-post-btn">
            ایجاد پست جدید
          </button>
         <!-- <button @click="openNoteModal" class="create-note-btn">
            ایجاد یادداشت جدید
          </button> -->
        </div>

        <!-- Blog Posts and Notes List -->
        <div class="posts-section">
          <h2 class="section-title">
            {{ activeFilter === 'all' ? 'همه مطالب' : activeFilter === 'posts' ? 'پست‌های بلاگ' : 'یادداشت‌ها' }}
          </h2>
          
          <div v-if="isLoading" class="loading">در حال بارگذاری...</div>
          <div v-else-if="filteredItems.length === 0" class="empty-state">
            {{ activeFilter === 'all' ? 'هنوز مطلبی اضافه نشده است.' : activeFilter === 'posts' ? 'هنوز پستی اضافه نشده است.' : 'هنوز یادداشتی اضافه نشده است.' }}
          </div>
          <div v-else class="posts-list">
            <!-- Blog Posts -->
            <article 
              v-for="post in filteredItems.filter(item => item.type === 'post')" 
              :key="`post-${post.id}`" 
              class="post-card"
            >
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

            <!-- Notes -->
            <article 
              v-for="note in filteredItems.filter(item => item.type === 'note')" 
              :key="`note-${note.id}`" 
              class="post-card note-card"
            >
              <div class="post-header">
                <h2 class="post-title">{{ note.title }}</h2>
                <button 
                  v-if="authStore.isAuthenticated.value"
                  @click="handleDeleteNote(note.id)"
                  class="delete-note-btn"
                  :disabled="isDeleting === note.id"
                  :title="'حذف یادداشت'"
                >
                  <svg v-if="isDeleting !== note.id" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10 11V17M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span v-else>در حال حذف...</span>
                </button>
              </div>
              <div class="post-meta">
                <span class="post-date">{{ formatDate(note.created_at) }}</span>
                <span class="post-author">{{ note.writer || 'نویسنده نامشخص' }}</span>
              </div>
              
              <!-- Verse Context (Collapsible) -->
              <div v-if="note.related_verse_id && note.verseInfo" class="verse-context-section">
                <button 
                  type="button" 
                  @click="toggleVerseContext(note.id)" 
                  class="verse-context-toggle"
                >
                  <span class="toggle-icon" :class="{ expanded: expandedVerses[note.id] }">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span>اطلاعات بیت</span>
                </button>
                <div v-if="expandedVerses[note.id]" class="verse-context-content">
                  <div class="verse-context-item">
                    <strong>شاعر:</strong> {{ note.verseInfo.poet_name || note.verseInfo.poet || 'نامشخص' }}
                  </div>
                  <div class="verse-context-item">
                    <strong>شعر:</strong> {{ note.verseInfo.poem_title || note.verseInfo.poem_name || note.verseInfo.title || 'نامشخص' }}
                  </div>
                  <div class="verse-context-item">
                    <strong>بیت:</strong>
                    <div class="verse-text">{{ note.verseInfo.verse_text || note.verseInfo.text || 'متن بیت در دسترس نیست' }}</div>
                  </div>
                </div>
              </div>
              
              <p class="post-excerpt">{{ (note.text || note.content) ? ((note.text || note.content).length > 150 ? (note.text || note.content).substring(0, 150) + '...' : (note.text || note.content)) : '' }}</p>
              <div v-if="note.file_url && note.file_type === 'image'" class="note-image-preview">
                <img :src="note.file_url" alt="Note image" />
              </div>
              <div v-if="note.tags && note.tags.length > 0" class="note-tags">
                <span v-for="tag in note.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <router-link :to="`/notes/${note.id}`" class="read-more">ادامه مطلب</router-link>
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
import NoteModal from '../components/NoteModal.vue'
import PostModal from '../components/PostModal.vue'
import { ApiService } from '../services/api.js'
import { useAuthStore } from '../stores/auth.js'
import { getVerseInfo, setVerseInfo } from '../utils/verseCache.js'

const posts = ref([])
const notes = ref([])
const isLoading = ref(false)
const isDeleting = ref(null)
const submitError = ref('')
const submitSuccess = ref('')
const activeFilter = ref('all')
const isNoteModalOpen = ref(false)
const isPostModalOpen = ref(false)
const expandedVerses = ref({})

const authStore = useAuthStore()
const currentUser = computed(() => authStore.currentUser?.value || {})

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
    posts.value = (result.posts || []).map(post => ({ ...post, type: 'post' }))
  } catch (e) {
    console.error('Failed to load posts', e)
    posts.value = []
  } finally {
    isLoading.value = false
  }
}

async function loadNotes() {
  if (!authStore.isAuthenticated.value) {
    notes.value = []
    return
  }
  
  try {
    const result = await ApiService.getNotes({ limit: 100, offset: 0 })
    // Handle different response structures
    const notesArray = Array.isArray(result) ? result : (result.notes || [])
    notes.value = await Promise.all(notesArray.map(async (note) => {
      // Ensure text field exists, handle both text and content field names
      const noteText = note.text !== undefined ? note.text : (note.content !== undefined ? note.content : '')
      const noteObj = { 
        ...note, 
        type: 'note',
        text: noteText
      }
      
      // Load verse info if note is linked to a verse
      // Pass note data to extract verse from verses array if available
      if (note.related_verse_id) {
        noteObj.verseInfo = await loadVerseInfoForNote(note.related_verse_id, note)
      }
      
      return noteObj
    }))
    console.log('Loaded notes:', notes.value)
  } catch (e) {
    console.error('Failed to load notes', e)
    notes.value = []
  }
}

const loadVerseInfoForNote = async (verseId, noteData = null) => {
  if (!verseId) return null
  
  // Check cache first
  const cached = getVerseInfo(verseId)
  if (cached) {
    return cached
  }
  
  // Extract verse info from note's verses array if available
  if (noteData && noteData.verses && Array.isArray(noteData.verses)) {
    // Try to find verse matching related_verse_id, or use first verse if available
    let verse = noteData.verses.find(v => v.id === verseId || v.id === parseInt(verseId))
    
    // If not found by ID, use first verse in array (API might return the related verse)
    if (!verse && noteData.verses.length > 0) {
      verse = noteData.verses[0]
    }
    
    if (verse) {
      const normalized = {
        verse_id: verse.id,
        verse_text: verse.text || '',
        poem_id: noteData.poem_id || null,
        poem_title: noteData.poem_title || noteData.poem_name || null,
        poet_id: noteData.poet_id || null,
        poet_name: noteData.poet_name || noteData.poet || null
      }
      setVerseInfo(verseId, normalized)
      return normalized
    }
  }
  
  // Fetch from API (pass noteData if available)
  try {
    const verseData = await ApiService.getVerseDetails(verseId, noteData)
    
    // Normalize verse data structure
    const normalized = {
      verse_id: verseData.id || verseData.verse_id || verseId,
      verse_text: verseData.text || verseData.verse_text || '',
      poem_id: verseData.poem_id || verseData.poem?.id,
      poem_title: verseData.poem_title || verseData.poem?.title || verseData.poem_name || '',
      poet_id: verseData.poet_id || verseData.poet?.id,
      poet_name: verseData.poet_name || verseData.poet?.name || verseData.poet || ''
    }
    
    setVerseInfo(verseId, normalized)
    return normalized
  } catch (err) {
    console.error('Error loading verse info for note:', err)
    return null
  }
}

const toggleVerseContext = (noteId) => {
  expandedVerses.value[noteId] = !expandedVerses.value[noteId]
}

const handleDeleteNote = async (noteId) => {
  if (!confirm('آیا مطمئن هستید که می‌خواهید این یادداشت را حذف کنید؟')) {
    return
  }

  try {
    isDeleting.value = noteId
    await ApiService.deleteNote(noteId)
    
    // Remove note from list
    notes.value = notes.value.filter(note => note.id !== noteId)
    
    alert('یادداشت با موفقیت حذف شد')
  } catch (e) {
    console.error('Delete note failed:', e)
    alert(e?.message || 'خطا در حذف یادداشت')
  } finally {
    isDeleting.value = null
  }
}

const filteredItems = computed(() => {
  const allItems = [...posts.value, ...notes.value]
  
  if (activeFilter.value === 'all') {
    return allItems.sort((a, b) => {
      const dateA = new Date(a.created_at || 0)
      const dateB = new Date(b.created_at || 0)
      return dateB - dateA
    })
  } else if (activeFilter.value === 'posts') {
    return posts.value.sort((a, b) => {
      const dateA = new Date(a.created_at || 0)
      const dateB = new Date(b.created_at || 0)
      return dateB - dateA
    })
  } else if (activeFilter.value === 'notes') {
    return notes.value.sort((a, b) => {
      const dateA = new Date(a.created_at || 0)
      const dateB = new Date(b.created_at || 0)
      return dateB - dateA
    })
  }
  
  return []
})

const openNoteModal = () => {
  if (!authStore.isAuthenticated.value) {
    submitError.value = 'برای ایجاد یادداشت باید وارد شوید'
    return
  }
  isNoteModalOpen.value = true
}

const closeNoteModal = () => {
  isNoteModalOpen.value = false
}

const handleNoteCreated = async (note) => {
  submitSuccess.value = 'یادداشت با موفقیت ایجاد شد'
  await loadNotes()
  setTimeout(() => { submitSuccess.value = '' }, 2000)
}

const openPostModal = () => {
  if (!authStore.isAuthenticated.value) {
    submitError.value = 'برای ایجاد پست باید وارد شوید'
    return
  }
  isPostModalOpen.value = true
}

const closePostModal = () => {
  isPostModalOpen.value = false
}

const handlePostCreated = async (post) => {
  submitSuccess.value = 'پست با موفقیت ایجاد شد'
  await loadPosts()
  setTimeout(() => { submitSuccess.value = '' }, 2000)
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
  await loadNotes()
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

.delete-note-btn {
  background: transparent;
  border: 1px solid #e74c3c;
  color: #e74c3c;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.delete-note-btn:hover:not(:disabled) {
  background: #e74c3c;
  color: white;
}

.delete-note-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-note-btn svg {
  width: 18px;
  height: 18px;
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

.filter-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #2c2c2c;
}

.filter-btn {
  background: #121212;
  border: 1px solid #2c2c2c;
  color: #CDC7C6;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Vazirmatn', sans-serif;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: #2c2c2c;
  border-color: #702632;
}

.filter-btn.active {
  background: #702632;
  border-color: #702632;
  color: white;
}

.create-buttons-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px dashed #2c2c2c;
}

.create-post-btn,
.create-note-btn {
  background: #702632;
  color: white;
  border: 1px solid #702632;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Vazirmatn', sans-serif;
  transition: all 0.3s ease;
}

.create-post-btn:hover,
.create-note-btn:hover {
  background: #8b3a42;
  border-color: #8b3a42;
}

@media (max-width: 768px) {
  .create-buttons-section {
    flex-direction: column;
  }

  .create-post-btn,
  .create-note-btn {
    width: 100%;
  }
}

.note-card {
  border-left: 3px solid #702632;
}

.verse-reference {
  background: rgba(112, 38, 50, 0.2);
  color: #702632;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.75rem;
}

.note-image-preview {
  margin: 12px 0;
}

.note-image-preview img {
  max-width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #2c2c2c;
}

.note-voice {
  margin: 12px 0;
}

.note-voice audio {
  width: 100%;
}

.note-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.verse-context-section {
  margin: 12px 0;
  border: 1px solid rgba(205, 199, 198, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.verse-context-toggle {
  width: 100%;
  background: rgba(112, 38, 50, 0.1);
  border: none;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #CDC7C6;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.verse-context-toggle:hover {
  background: rgba(112, 38, 50, 0.2);
}

.verse-context-toggle .toggle-icon {
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.verse-context-toggle .toggle-icon svg {
  width: 16px;
  height: 16px;
}

.verse-context-toggle .toggle-icon.expanded {
  transform: rotate(180deg);
}

.verse-context-content {
  padding: 14px;
  background: rgba(0, 0, 0, 0.2);
  border-top: 1px solid rgba(205, 199, 198, 0.1);
}

.verse-context-item {
  margin-bottom: 10px;
  color: #ddd;
  font-size: 0.85rem;
  line-height: 1.6;
}

.verse-context-item:last-child {
  margin-bottom: 0;
}

.verse-context-item strong {
  color: #CDC7C6;
  margin-left: 6px;
}

.verse-text {
  margin-top: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  font-style: italic;
  color: #fff;
  line-height: 1.8;
  text-align: right;
  font-size: 0.9rem;
}

.note-tags .tag {
  background: rgba(112, 38, 50, 0.3);
  color: #702632;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 0.8rem;
}
</style>


