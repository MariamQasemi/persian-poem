<template>
  <div class="poem-detail-page">
    <!-- Note Modal -->
    <NoteModal 
      :isOpen="isNoteModalOpen" 
      :verseId="selectedVerseId"
      @close="closeNoteModal"
      @created="handleNoteCreated"
    />

    <!-- Back Button -->
    <button @click="goBack" class="back-btn">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      بازگشت
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>در حال بارگذاری شعر کامل...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadPoem" class="retry-btn">تلاش مجدد</button>
    </div>

    <!-- Poem Content -->
    <div v-else-if="poem" class="poem-container">
      <!-- Poem Header -->
      <div class="poem-header">
        <h1 class="poet-name">{{ poem.poet || 'نامشخص' }}</h1>
        <h2 class="poem-title">{{ poem.title || '' }}</h2>
        <span class="poem-category">{{ poem.category || 'عمومی' }}</span>
      </div>

      <!-- Poem Content -->
      <div class="poem-content" v-if="poem.couplets && poem.couplets.length > 0">
        <!-- Desktop: Two Column Layout -->
        <div class="desktop-layout">
          <div 
            v-for="(couplet, cIndex) in poem.couplets" 
            :key="`couplet-${cIndex}`"
            class="couplet-row"
          >
            <!-- Full-width line (position -1) -->
            <div v-if="couplet.fullWidth" class="full-width-line">
              <div class="poetry-line-wrapper">
                <div 
                  class="poetry-line"
                  :class="{ 
                    highlighted: couplet.text && searchQuery && couplet.text.includes(searchQuery),
                    'liked-verse': isVerseLiked(couplet.verseId),
                    'has-voice-note': hasVoiceNote(couplet.verseId),
                    'clickable': authStore.isAuthenticated.value
                  }"
                  @click="handleVerseClick(couplet.verseId)"
                  v-html="highlightSearchQuery(couplet.text || '')"
                ></div>
                <button 
                  v-if="hasVoiceNote(couplet.verseId)"
                  @click.stop="playVoiceNote(couplet.verseId)"
                  class="play-voice-btn"
                  :title="isPlayingVoice(couplet.verseId) ? 'توقف' : 'پخش'"
                >
                  <svg v-if="!isPlayingVoice(couplet.verseId)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
                  </svg>
                </button>
                <button 
                  v-if="couplet.verseId && authStore.isAuthenticated.value"
                  @click="toggleLikeVerse(couplet.verseId)"
                  class="like-button"
                  :class="{ 'liked': isVerseLiked(couplet.verseId) }"
                  :title="isVerseLiked(couplet.verseId) ? 'حذف لایک' : 'لایک'"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" :fill="isVerseLiked(couplet.verseId) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <!-- Normal couplet (position 0 and 1) -->
            <div v-else class="poetry-columns">
              <div class="poetry-column">
                <div class="poetry-line-wrapper">
                  <div 
                    class="poetry-line"
                    :class="{ 
                      highlighted: getCoupletText(couplet, 0) && searchQuery && getCoupletText(couplet, 0).includes(searchQuery),
                      'liked-verse': isVerseLiked(getCoupletVerseId(couplet, 0)),
                      'has-voice-note': hasVoiceNote(getCoupletVerseId(couplet, 0)),
                      'clickable': authStore.isAuthenticated.value
                    }"
                    @click="handleVerseClick(getCoupletVerseId(couplet, 0))"
                    v-html="highlightSearchQuery(getCoupletText(couplet, 0) || '')"
                  ></div>
                  <button 
                    v-if="hasVoiceNote(getCoupletVerseId(couplet, 0))"
                    @click.stop="playVoiceNote(getCoupletVerseId(couplet, 0))"
                    class="play-voice-btn"
                    :title="isPlayingVoice(getCoupletVerseId(couplet, 0)) ? 'توقف' : 'پخش'"
                  >
                    <svg v-if="!isPlayingVoice(getCoupletVerseId(couplet, 0))" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button 
                    v-if="getCoupletVerseId(couplet, 0) && authStore.isAuthenticated.value"
                    @click="toggleLikeVerse(getCoupletVerseId(couplet, 0))"
                    class="like-button"
                    :class="{ 'liked': isVerseLiked(getCoupletVerseId(couplet, 0)) }"
                    :title="isVerseLiked(getCoupletVerseId(couplet, 0)) ? 'حذف لایک' : 'لایک'"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" :fill="isVerseLiked(getCoupletVerseId(couplet, 0)) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="poetry-column">
                <div class="poetry-line-wrapper">
                  <div 
                    class="poetry-line"
                    :class="{ 
                      highlighted: getCoupletText(couplet, 1) && searchQuery && getCoupletText(couplet, 1).includes(searchQuery),
                      'liked-verse': isVerseLiked(getCoupletVerseId(couplet, 1)),
                      'has-voice-note': hasVoiceNote(getCoupletVerseId(couplet, 1)),
                      'clickable': authStore.isAuthenticated.value
                    }"
                    @click="handleVerseClick(getCoupletVerseId(couplet, 1))"
                    v-html="highlightSearchQuery(getCoupletText(couplet, 1) || '')"
                  ></div>
                  <button 
                    v-if="hasVoiceNote(getCoupletVerseId(couplet, 1))"
                    @click.stop="playVoiceNote(getCoupletVerseId(couplet, 1))"
                    class="play-voice-btn"
                    :title="isPlayingVoice(getCoupletVerseId(couplet, 1)) ? 'توقف' : 'پخش'"
                  >
                    <svg v-if="!isPlayingVoice(getCoupletVerseId(couplet, 1))" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button 
                    v-if="getCoupletVerseId(couplet, 1) && authStore.isAuthenticated.value"
                    @click="toggleLikeVerse(getCoupletVerseId(couplet, 1))"
                    class="like-button"
                    :class="{ 'liked': isVerseLiked(getCoupletVerseId(couplet, 1)) }"
                    :title="isVerseLiked(getCoupletVerseId(couplet, 1)) ? 'حذف لایک' : 'لایک'"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" :fill="isVerseLiked(getCoupletVerseId(couplet, 1)) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile: Single Column Layout -->
        <div class="mobile-layout">
          <div 
            v-for="(couplet, cIndex) in poem.couplets" 
            :key="`mobile-couplet-${cIndex}`"
            class="couplet-row"
          >
            <!-- Full-width line (position -1) -->
            <div v-if="couplet.fullWidth" class="full-width-line">
              <div class="poetry-line-wrapper">
                <div 
                  class="poetry-line"
                  :class="{ 
                    highlighted: couplet.text && searchQuery && couplet.text.includes(searchQuery),
                    'liked-verse': isVerseLiked(couplet.verseId),
                    'has-voice-note': hasVoiceNote(couplet.verseId),
                    'clickable': authStore.isAuthenticated.value
                  }"
                  @click="handleVerseClick(couplet.verseId)"
                  v-html="highlightSearchQuery(couplet.text || '')"
                ></div>
                <button 
                  v-if="hasVoiceNote(couplet.verseId)"
                  @click.stop="playVoiceNote(couplet.verseId)"
                  class="play-voice-btn"
                  :title="isPlayingVoice(couplet.verseId) ? 'توقف' : 'پخش'"
                >
                  <svg v-if="!isPlayingVoice(couplet.verseId)" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
                  </svg>
                </button>
                <button 
                  v-if="couplet.verseId && authStore.isAuthenticated.value"
                  @click="toggleLikeVerse(couplet.verseId)"
                  class="like-button"
                  :class="{ 'liked': isVerseLiked(couplet.verseId) }"
                  :title="isVerseLiked(couplet.verseId) ? 'حذف لایک' : 'لایک'"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" :fill="isVerseLiked(couplet.verseId) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
            <!-- Normal couplet (position 0 and 1) -->
            <div v-else class="poetry-column">
              <div class="poetry-line-wrapper">
                <div 
                  class="poetry-line"
                  :class="{ 
                    highlighted: getCoupletText(couplet, 0) && searchQuery && getCoupletText(couplet, 0).includes(searchQuery),
                    'has-voice-note': hasVoiceNote(getCoupletVerseId(couplet, 0)),
                    'clickable': authStore.isAuthenticated.value
                  }"
                  @click="handleVerseClick(getCoupletVerseId(couplet, 0))"
                  v-html="highlightSearchQuery(getCoupletText(couplet, 0) || '')"
                ></div>
                <button 
                  v-if="hasVoiceNote(getCoupletVerseId(couplet, 0))"
                  @click.stop="playVoiceNote(getCoupletVerseId(couplet, 0))"
                  class="play-voice-btn"
                  :title="isPlayingVoice(getCoupletVerseId(couplet, 0)) ? 'توقف' : 'پخش'"
                >
                  <svg v-if="!isPlayingVoice(getCoupletVerseId(couplet, 0))" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
                  </svg>
                </button>
                <button 
                  v-if="getCoupletVerseId(couplet, 0)"
                  @click="toggleLikeVerse(getCoupletVerseId(couplet, 0))"
                  class="like-button"
                  :class="{ 'liked': isVerseLiked(getCoupletVerseId(couplet, 0)) }"
                  :title="isVerseLiked(getCoupletVerseId(couplet, 0)) ? 'حذف لایک' : 'لایک'"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" :fill="isVerseLiked(getCoupletVerseId(couplet, 0)) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              <div class="poetry-line-wrapper">
                <div 
                  class="poetry-line"
                  :class="{ 
                    highlighted: getCoupletText(couplet, 1) && searchQuery && getCoupletText(couplet, 1).includes(searchQuery),
                    'has-voice-note': hasVoiceNote(getCoupletVerseId(couplet, 1)),
                    'clickable': authStore.isAuthenticated.value
                  }"
                  @click="handleVerseClick(getCoupletVerseId(couplet, 1))"
                  v-html="highlightSearchQuery(getCoupletText(couplet, 1) || '')"
                ></div>
                <button 
                  v-if="hasVoiceNote(getCoupletVerseId(couplet, 1))"
                  @click.stop="playVoiceNote(getCoupletVerseId(couplet, 1))"
                  class="play-voice-btn"
                  :title="isPlayingVoice(getCoupletVerseId(couplet, 1)) ? 'توقف' : 'پخش'"
                >
                  <svg v-if="!isPlayingVoice(getCoupletVerseId(couplet, 1))" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 4H10V20H6V4ZM14 4H18V20H14V4Z" fill="currentColor"/>
                  </svg>
                </button>
                <button 
                  v-if="getCoupletVerseId(couplet, 1)"
                  @click="toggleLikeVerse(getCoupletVerseId(couplet, 1))"
                  class="like-button"
                  :class="{ 'liked': isVerseLiked(getCoupletVerseId(couplet, 1)) }"
                  :title="isVerseLiked(getCoupletVerseId(couplet, 1)) ? 'حذف لایک' : 'لایک'"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" :fill="isVerseLiked(getCoupletVerseId(couplet, 1)) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- No Content Message -->
      <div v-else class="no-content-message">
        <p>محتوای شعر در دسترس نیست.</p>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="copyPoem" class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
          </svg>
          کپی شعر
        </button>
        <button @click="sharePoem" class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12S8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5S19.66 2 18 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12S4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92S20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="currentColor"/>
          </svg>
          اشتراک‌گذاری
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '../services/api.js'
import { useSearchStore } from '../stores/search.js'
import { useAuthStore } from '../stores/auth.js'
import { LikedVersesManager } from '../utils/likedVersesManager.js'
import NoteModal from '../components/NoteModal.vue'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()
const authStore = useAuthStore()

const poem = ref(null)
const loading = ref(false)
const error = ref(null)
const isNoteModalOpen = ref(false)
const selectedVerseId = ref(null)
const verseNotes = ref({}) // Map of verseId -> notes array
const playingVoiceNote = ref(null) // Currently playing voice note verseId
const audioPlayer = ref(null) // Audio element for voice playback

// Get search query from store for highlighting
const searchQuery = computed(() => searchStore.searchQuery)

// Helper function to get couplet text (handles both old array format and new object format)
const getCoupletText = (couplet, index) => {
  if (couplet.fullWidth) {
    return couplet.text
  }
  // New format: object with text array
  if (couplet.text && Array.isArray(couplet.text)) {
    return couplet.text[index] || ''
  }
  // Old format: array directly
  if (Array.isArray(couplet)) {
    return couplet[index] || ''
  }
  return ''
}

// Helper function to get verse ID (handles both old array format and new object format)
const getCoupletVerseId = (couplet, index) => {
  if (couplet.fullWidth) {
    return couplet.verseId || null
  }
  // New format: object with verseIds array
  if (couplet.verseIds && Array.isArray(couplet.verseIds)) {
    return couplet.verseIds[index] || null
  }
  return null
}

// Check if verse is liked
const isVerseLiked = (verseId) => {
  return LikedVersesManager.isVerseLiked(verseId)
}

// Toggle like for a verse
const toggleLikeVerse = async (verseId) => {
  if (!verseId || !authStore.isAuthenticated.value) return
  
  const isLiked = LikedVersesManager.isVerseLiked(verseId)
  
  try {
    if (isLiked) {
      // Unlike: use DELETE method
      await ApiService.unlikeVerse(verseId)
      LikedVersesManager.removeLikedVerse(verseId)
    } else {
      // Like: use POST method
      await ApiService.likeVerse(verseId)
      LikedVersesManager.addLikedVerse(verseId)
    }
  } catch (err) {
    console.error('Error toggling like:', err)
    alert(isLiked ? 'خطا در حذف لایک بیت. لطفاً دوباره تلاش کنید.' : 'خطا در لایک کردن بیت. لطفاً دوباره تلاش کنید.')
  }
}

const loadPoem = async () => {
  const poemId = route.params.id
  if (!poemId) {
    error.value = 'شناسه شعر یافت نشد'
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log('Loading poem with ID:', poemId)
    const poemData = await ApiService.getFullPoem(poemId)
    console.log('Loaded poem:', poemData)
    poem.value = poemData
    
    // Sync liked verses from API response with localStorage
    if (poemData.couplets) {
      LikedVersesManager.syncFromPoemData(poemData)
      const likedVerses = LikedVersesManager.getLikedVerses()
      console.log('Initialized liked verses from API and localStorage:', Array.from(likedVerses))
    }
  } catch (err) {
    console.error('Error loading poem:', err)
    error.value = 'خطا در بارگذاری شعر. لطفاً دوباره تلاش کنید.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const copyPoem = async () => {
  if (!poem.value || !poem.value.couplets || poem.value.couplets.length === 0) {
    alert('شعری برای کپی وجود ندارد')
    return
  }

  const poetryText = poem.value.couplets
    .map(couplet => {
      if (couplet.fullWidth) {
        return couplet.text
      } else {
        const text1 = getCoupletText(couplet, 0)
        const text2 = getCoupletText(couplet, 1)
        return `${text1}    ${text2}`
      }
    })
    .join('\n')
  const fullText = `${poem.value.poet}\n${poem.value.title}\n\n${poetryText}`

  try {
    await navigator.clipboard.writeText(fullText)
    alert('شعر کپی شد!')
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const sharePoem = async () => {
  if (!poem.value || !poem.value.couplets || poem.value.couplets.length === 0) {
    alert('شعری برای اشتراک‌گذاری وجود ندارد')
    return
  }

  const poetryText = poem.value.couplets
    .map(couplet => {
      if (couplet.fullWidth) {
        return couplet.text
      } else {
        const text1 = getCoupletText(couplet, 0)
        const text2 = getCoupletText(couplet, 1)
        return `${text1}    ${text2}`
      }
    })
    .join('\n')
  const shareText = `${poem.value.poet}\n${poem.value.title}\n\n${poetryText}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${poem.value.poet} - ${poem.value.title}`,
        text: shareText,
        url: window.location.href
      })
    } catch (err) {
      console.log('Share cancelled or failed:', err)
    }
  } else {
    copyPoem()
  }
}

// Function to highlight search query in poetry text
const highlightSearchQuery = (text) => {
  if (!searchQuery.value || !text) return text
  
  const query = searchQuery.value.trim()
  if (!query) return text
  
  // Escape special regex characters in the search query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  // Create regex with global flag and case insensitive
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  
  // Replace matches with bold tags
  return text.replace(regex, '<strong>$1</strong>')
}

// Handle verse click to open note modal
const handleVerseClick = (verseId) => {
  if (!verseId || !authStore.isAuthenticated.value) return
  selectedVerseId.value = verseId
  isNoteModalOpen.value = true
}

// Close note modal
const closeNoteModal = () => {
  isNoteModalOpen.value = false
  selectedVerseId.value = null
}

// Handle note created
const handleNoteCreated = async (note) => {
  // Reload notes for the verse
  if (selectedVerseId.value) {
    await loadNotesForVerse(selectedVerseId.value)
  }
}

// Load notes for a specific verse
const loadNotesForVerse = async (verseId) => {
  if (!verseId || !authStore.isAuthenticated.value) return
  
  try {
    const notes = await ApiService.getNotesByVerse(verseId)
    verseNotes.value[verseId] = notes || []
  } catch (err) {
    console.error('Error loading notes for verse:', err)
    verseNotes.value[verseId] = []
  }
}

// Load notes for all verses in the poem
const loadAllVerseNotes = async () => {
  if (!poem.value || !authStore.isAuthenticated.value) return
  
  try {
    // Get all verse IDs from the poem
    const verseIds = []
    if (poem.value.couplets) {
      poem.value.couplets.forEach(couplet => {
        if (couplet.fullWidth && couplet.verseId) {
          verseIds.push(couplet.verseId)
        } else if (couplet.verseIds && Array.isArray(couplet.verseIds)) {
          couplet.verseIds.forEach(id => {
            if (id) verseIds.push(id)
          })
        }
      })
    }
    
    // Load notes for all verses
    for (const verseId of verseIds) {
      await loadNotesForVerse(verseId)
    }
  } catch (err) {
    console.error('Error loading verse notes:', err)
  }
}

// Check if verse has voice note
const hasVoiceNote = (verseId) => {
  if (!verseId) return false
  const notes = verseNotes.value[verseId] || []
  return notes.some(note => note.file_type === 'voice' && note.file_url)
}

// Check if voice note is currently playing
const isPlayingVoice = (verseId) => {
  return playingVoiceNote.value === verseId
}

// Play voice note
const playVoiceNote = async (verseId) => {
  if (!verseId) return
  
  const notes = verseNotes.value[verseId] || []
  const voiceNote = notes.find(note => note.file_type === 'voice' && note.file_url)
  
  if (!voiceNote || !voiceNote.file_url) return
  
  // If already playing this verse, pause it
  if (playingVoiceNote.value === verseId && audioPlayer.value) {
    audioPlayer.value.pause()
    playingVoiceNote.value = null
    audioPlayer.value = null
    return
  }
  
  // Stop any currently playing audio
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value = null
  }
  
  // Create and play new audio
  const audio = new Audio(voiceNote.file_url)
  audioPlayer.value = audio
  playingVoiceNote.value = verseId
  
  audio.onended = () => {
    playingVoiceNote.value = null
    audioPlayer.value = null
  }
  
  audio.onerror = () => {
    console.error('Error playing voice note:', voiceNote.file_url)
    playingVoiceNote.value = null
    audioPlayer.value = null
  }
  
  try {
    await audio.play()
  } catch (err) {
    console.error('Error playing audio:', err)
    playingVoiceNote.value = null
    audioPlayer.value = null
  }
}

onMounted(async () => {
  await loadPoem()
  // Load notes after poem is loaded
  if (authStore.isAuthenticated.value) {
    await loadAllVerseNotes()
  }
})
</script>

<style scoped>
.poem-detail-page {
  min-height: 100vh;
  background: #151515;
  padding: 40px 20px;
  direction: rtl;
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
  font-family: 'Vazirmatn', sans-serif;
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
  font-family: 'Vazirmatn', sans-serif;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #8b3a42;
}

.poem-container {
  max-width: 1400px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 12px;
  padding: 40px;
  border: 1px solid #CDC7C6;
}

.poem-header {
  text-align: center;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(205, 199, 198, 0.2);
  margin-bottom: 40px;
}

.poet-name {
  font-size: 2.5rem;
  font-weight: bold;
  color: #CDC7C6;
  margin: 0 0 10px 0;
  font-family: 'Vazirmatn', sans-serif;
}

.poem-title {
  font-size: 1.5rem;
  color: #CDC7C6;
  margin: 0 0 10px 0;
  font-family: 'Vazirmatn', sans-serif;
  opacity: 0.8;
}

.poem-category {
  color: #888;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
}

.poem-content {
  margin-bottom: 40px;
}

.no-content-message {
  text-align: center;
  padding: 60px 20px;
  color: #888;
  font-size: 1.1rem;
  font-family: 'Vazirmatn', sans-serif;
}

.couplet-row {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(205, 199, 198, 0.15);
}

.couplet-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.poetry-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
  direction: rtl;
  width: 100%;
}

.full-width-line {
  width: 100%;
  direction: rtl;
  text-align: center;
}

.full-width-line .poetry-line {
  text-align: center;
  width: 100%;
  max-width: 100%;
}

.desktop-layout {
  display: block;
}

.mobile-layout {
  display: none;
}

.poetry-column {
  text-align: right;
  min-width: 0;
  flex: 1;
  width: 100%;
}

.poetry-line-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.poetry-line {
  margin: 5px 0;
  padding: 8px 10px;
  line-height: 2.2;
  color: #CDC7C6;
  font-size: 1.2rem;
  font-weight: 400;
  transition: all 0.3s ease;
  white-space: normal;
  min-height: 40px;
  display: flex;
  align-items: center;
  flex: 1;
}

.poetry-line:hover {
  background: rgba(112, 38, 50, 0.1);
  border-radius: 4px;
}

.poetry-line.clickable {
  cursor: pointer;
}

.poetry-line.has-voice-note {
  padding-right: 45px;
}

.poetry-line.highlighted {
  background: rgba(112, 38, 50, 0.2);
  border: 1px solid #702632;
  border-radius: 8px;
  padding: 8px 10px;
  font-weight: 400;
  color: #CDC7C6;
}

.poetry-line.liked-verse {
  background: rgba(112, 38, 50, 0.15);
  border-left: 3px solid #702632;
  border-radius: 4px;
  padding-left: 12px;
  position: relative;
}

.poetry-line.liked-verse::before {
  content: '❤️';
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  opacity: 0.7;
}

.poetry-line strong {
  font-weight: 700;
  color: #702632;
  background: rgba(112, 38, 50, 0.3);
  padding: 2px 4px;
  border-radius: 3px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 30px;
  border-top: 1px solid rgba(205, 199, 198, 0.2);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: #CDC7C6;
  border: 1px solid #CDC7C6;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

.like-button {
  background: transparent;
  border: 1px solid #CDC7C6;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #CDC7C6;
  transition: all 0.3s ease;
  flex-shrink: 0;
  padding: 0;
}

.like-button:hover {
  background: rgba(112, 38, 50, 0.2);
  border-color: #702632;
  color: #702632;
  transform: scale(1.1);
}

.like-button.liked {
  color: #702632;
  border-color: #702632;
  background: rgba(112, 38, 50, 0.2);
}

.like-button svg {
  width: 18px;
  height: 18px;
}

.play-voice-btn {
  background: transparent;
  border: 1px solid #702632;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #702632;
  transition: all 0.3s ease;
  flex-shrink: 0;
  padding: 0;
}

.play-voice-btn:hover {
  background: rgba(112, 38, 50, 0.2);
  transform: scale(1.1);
}

.play-voice-btn svg {
  width: 16px;
  height: 16px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .poem-detail-page {
    padding: 20px 15px;
  }

  .poem-container {
    padding: 20px;
  }

  .poet-name {
    font-size: 1.8rem;
  }

  .poem-title {
    font-size: 1.2rem;
  }

  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .couplet-row {
    margin-bottom: 12px;
    padding-bottom: 8px;
  }

  .poetry-line {
    font-size: 1rem;
    margin: 5px 0;
    padding: 6px 8px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

