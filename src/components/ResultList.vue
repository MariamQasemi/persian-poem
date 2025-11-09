<template>
  <div class="result-list">
    <!-- Note Modal -->
    <NoteModal 
      :isOpen="isNoteModalOpen" 
      :verseId="selectedVerseId"
      @close="closeNoteModal"
      @created="handleNoteCreated"
    />
    <div v-if="searchStore.isLoading" class="loading-state">
      <p>در حال جستجو...</p>
    </div>
    
    <div v-else-if="searchStore.error" class="error-state">
      <p>{{ searchStore.error }}</p>
      <button @click="retrySearch" class="retry-btn">تلاش مجدد</button>
    </div>
    
    <div v-else-if="!searchStore.hasResults && searchStore.searchQuery" class="no-results">
      <h3>نتیجه‌ای یافت نشد</h3>
      <p>برای عبارت "{{ searchStore.searchQuery }}" هیچ شعری یافت نشد.</p>
    </div>
    
    <div v-else-if="!searchStore.searchQuery" class="welcome-state">
      <h3>به جستجوی شعر فارسی خوش آمدید</h3>
      <p>کلمه یا عبارت مورد نظر خود را در کادر بالا وارد کنید.</p>
    </div>
    
    <div v-else-if="searchStore.searchQuery && searchStore.searchResults && searchStore.searchResults.length > 0" class="results-container">
      <!-- Results Header -->
      <div class="results-header">
        <h2 class="selected-word-title">
          <span class="decorative">'</span>
          {{ searchStore.searchQuery }}
          <span class="decorative">'</span>
        </h2>
      </div>
      
      <!-- Single Poem Display -->
      <div class="poetry-results">
        <!-- Poet Header with Action Buttons -->
        <div class="poet-header">
          <div class="poet-info">
            <h3 class="poet-name">{{ currentPoem?.poetName || 'نامشخص' }}</h3>
            <div class="poet-details">
              <span class="category">{{ currentPoem?.category || 'عمومی' }}</span>
            </div>
          </div>
          
          <div class="action-buttons">
            <button @click="currentPoem && copyPoetry(currentPoem)" class="action-btn copy-btn" title="کپی">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
              </svg>
            </button>
            <button @click="currentPoem && sharePoetry(currentPoem)" class="action-btn share-btn" title="اشتراک‌گذاری">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12S8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5S19.66 2 18 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12S4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92S20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Separator Line -->
        <div class="separator-line"></div>
        
        <!-- Poetry Content in Two Columns -->
        <div class="poetry-content" v-if="currentPoem">
          <!-- Desktop/Tablet: Two Column Layout with Couplets -->
          <div class="desktop-layout">
            <div 
              v-for="(couplet, cIndex) in coupletsPreview" 
              :key="`couplet-${cIndex}`"
              class="couplet-row"
            >
              <!-- Full-width line (position -1) -->
              <div v-if="couplet.fullWidth" class="full-width-line">
                <div class="poetry-line-wrapper">
                  <div 
                    class="poetry-line"
                    :class="{ 
                      highlighted: couplet.text && couplet.text.includes(searchStore.searchQuery),
                      'liked-verse': isVerseLiked(couplet.verseId),
                      'clickable': authStore.isAuthenticated.value
                    }"
                    @click="handleVerseClick(couplet.verseId)"
                    v-html="highlightSearchQuery(couplet.text || '')"
                  ></div>
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
                        highlighted: getCoupletText(couplet, 0) && getCoupletText(couplet, 0).includes(searchStore.searchQuery),
                        'liked-verse': isVerseLiked(getCoupletVerseId(couplet, 0)),
                        'clickable': authStore.isAuthenticated.value
                      }"
                      @click="handleVerseClick(getCoupletVerseId(couplet, 0))"
                      v-html="highlightSearchQuery(getCoupletText(couplet, 0) || '')"
                    ></div>
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
                        highlighted: getCoupletText(couplet, 1) && getCoupletText(couplet, 1).includes(searchStore.searchQuery),
                        'liked-verse': isVerseLiked(getCoupletVerseId(couplet, 1)),
                        'clickable': authStore.isAuthenticated.value
                      }"
                      @click="handleVerseClick(getCoupletVerseId(couplet, 1))"
                      v-html="highlightSearchQuery(getCoupletText(couplet, 1) || '')"
                    ></div>
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
          
          <!-- Mobile: Single Column Layout with Sequential Order -->
          <div class="mobile-layout">
            <div 
              v-for="(couplet, cIndex) in coupletsPreview" 
              :key="`mobile-couplet-${cIndex}`"
              class="couplet-row"
            >
              <!-- Full-width line (position -1) -->
              <div v-if="couplet.fullWidth" class="full-width-line">
                <div class="poetry-line-wrapper">
                  <div 
                    class="poetry-line"
                    :class="{ 
                      highlighted: couplet.text && couplet.text.includes(searchStore.searchQuery),
                      'liked-verse': isVerseLiked(couplet.verseId)
                    }"
                    v-html="highlightSearchQuery(couplet.text || '')"
                  ></div>
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
                      highlighted: getCoupletText(couplet, 0) && getCoupletText(couplet, 0).includes(searchStore.searchQuery),
                      'clickable': authStore.isAuthenticated.value
                    }"
                    @click="handleVerseClick(getCoupletVerseId(couplet, 0))"
                    v-html="highlightSearchQuery(getCoupletText(couplet, 0) || '')"
                  ></div>
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
                <div class="poetry-line-wrapper">
                  <div 
                    class="poetry-line"
                    :class="{ 
                      highlighted: getCoupletText(couplet, 1) && getCoupletText(couplet, 1).includes(searchStore.searchQuery),
                      'clickable': authStore.isAuthenticated.value
                    }"
                    @click="handleVerseClick(getCoupletVerseId(couplet, 1))"
                    v-html="highlightSearchQuery(getCoupletText(couplet, 1) || '')"
                  ></div>
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
          
          <!-- View Full Poem Button -->
          <div class="view-full-btn-container">
            <button @click="viewFullPoem" class="view-full-btn">
              مشاهده شعر کامل
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5V19M12 19L5 12M12 19L19 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Pagination Controls - Always visible when there are results -->
        <div class="pagination-section" v-if="searchStore.hasResults">
          <div class="pagination-controls">
            <button @click="prevPoem" :disabled="searchStore.currentPage === 1" class="nav-arrow nav-prev">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            
            <div class="page-controls">
              <span class="page-label">صفحه</span>
              <input 
                v-model.number="pageInput"
                @keyup.enter="goToPage"
                @blur="goToPage"
                type="number"
                :min="1"
                :max="filteredResultsCount"
                class="page-input"
              />
              <span class="page-label">از {{ filteredResultsCount }}</span>
              <span v-if="isLoadingMore" class="loading-indicator">
                در حال بارگذاری نتایج بیشتر...
              </span>
              <span v-else-if="searchStore.totalResults > filteredResultsCount" class="results-info">
                ({{ searchStore.totalResults - filteredResultsCount }} نتیجه‌ی بیشتر موجود است)
              </span>
            </div>
            
            <button 
              @click="nextPoem" 
              :disabled="searchStore.currentPage >= filteredResultsCount" 
              class="nav-arrow nav-next"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSearchStore } from '../stores/search'
import { useAuthStore } from '../stores/auth.js'
import { ApiService } from '../services/api.js'
import { LikedVersesManager } from '../utils/likedVersesManager.js'
import NoteModal from './NoteModal.vue'

const router = useRouter()
const searchStore = useSearchStore()
const authStore = useAuthStore()
const pageInput = ref(searchStore.currentPage)
const isNoteModalOpen = ref(false)
const selectedVerseId = ref(null)

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

// Computed property for total results count (use all search results, not filtered)
const filteredResultsCount = computed(() => {
  return searchStore.searchResults.length
})

// Access store values directly to maintain reactivity
// Don't destructure reactive values as it breaks reactivity

// Current poem for single display (use all search results for navigation)
const currentPoem = computed(() => {
  console.log('ResultList - searchResults:', searchStore.searchResults)
  console.log('ResultList - current page:', searchStore.currentPage)
  if (!searchStore.searchResults.length) {
    console.log('ResultList - No search results')
    return null
  }
  const poem = searchStore.searchResults[searchStore.currentPage - 1]
  console.log('ResultList - currentPoem:', poem)
  return poem
})

// Get all couplets for the current poem
const allCouplets = computed(() => {
  if (!currentPoem.value || !currentPoem.value.couplets) return []
  return currentPoem.value.couplets
})

// Preview versions (only first 3 couplets)
const coupletsPreview = computed(() => {
  return allCouplets.value.slice(0, 3)
})

// Initialize liked verses from current poem data
// This syncs API data with localStorage
const initializeLikedVerses = () => {
  if (!currentPoem.value || !currentPoem.value.couplets) {
    return
  }
  
  // Sync liked verses from API response with localStorage
  LikedVersesManager.syncFromPoemData(currentPoem.value)
}

// Loading state for fetching more results
const isLoadingMore = ref(false)

// Navigation methods for single poem display
const nextPoem = async () => {
  const currentCount = filteredResultsCount.value
  const currentPage = searchStore.currentPage
  
  // Check if we need to load more results when near the end of current batch
  // Load more when we're within 10 poems of the end and there are more results available
  if (currentPage >= currentCount - 10 && searchStore.totalResults > currentCount) {
    console.log('📥 Loading more results as user approaches end...')
    console.log('Current loaded:', currentCount, 'Total available:', searchStore.totalResults)
    isLoadingMore.value = true
    try {
      await searchStore.loadMoreResults()
      console.log('Loaded more results, now have:', searchStore.searchResults.length)
    } catch (error) {
      console.error('Failed to load more results:', error)
    } finally {
      isLoadingMore.value = false
    }
  }
  
  // Always try to go to next page (it will check bounds internally)
  searchStore.nextPage()
  
  console.log('After nextPage, currentPage is now:', searchStore.currentPage)
}

const prevPoem = () => {
  if (searchStore.currentPage > 1) {
    searchStore.prevPage()
  }
}

// Go to specific page
const goToPage = async () => {
  const page = parseInt(pageInput.value)
  const currentCount = filteredResultsCount.value
  
  // Validate page number
  if (isNaN(page) || page < 1) {
    pageInput.value = searchStore.currentPage
    return
  }
  
  // If page is at or beyond the boundary of currently loaded results, load more first
  // This ensures the next button is enabled when navigating to pages near the end
  if (page >= currentCount && searchStore.totalResults > currentCount) {
    console.log(`📥 Loading more results to reach page ${page}...`)
    console.log(`Current loaded: ${currentCount}, Requested page: ${page}, Total available: ${searchStore.totalResults}`)
    
    isLoadingMore.value = true
    try {
      // Keep loading more results until we have enough for the requested page + buffer
      // The buffer ensures next button is enabled
      const targetCount = Math.max(page + 1, currentCount + 50) // Load at least one more page
      while (searchStore.searchResults.length < targetCount && searchStore.searchResults.length < searchStore.totalResults) {
        const countBeforeLoad = searchStore.searchResults.length
        await searchStore.loadMoreResults()
        
        // Check if we've made progress
        if (searchStore.searchResults.length === countBeforeLoad) {
          console.warn('No new results loaded, breaking loop')
          break
        }
        
        // If we now have enough results for the requested page, break
        if (searchStore.searchResults.length >= page) {
          break
        }
      }
      
      console.log(`Loaded results, now have: ${searchStore.searchResults.length} results`)
    } catch (error) {
      console.error('Failed to load more results:', error)
      // Reset to current page if loading failed
      pageInput.value = searchStore.currentPage
      return
    } finally {
      isLoadingMore.value = false
    }
  }
  
  // Now check if the page is valid with updated results
  const updatedCount = searchStore.searchResults.length
  if (page >= 1 && page <= updatedCount) {
    searchStore.setCurrentPage(page)
  } else if (page > updatedCount && page <= searchStore.totalResults) {
    // Page is valid but we haven't loaded it yet - this shouldn't happen after loading above
    console.log(`Page ${page} is valid but not yet loaded. Setting to last available.`)
    searchStore.setCurrentPage(updatedCount)
    pageInput.value = updatedCount
  } else {
    // Invalid page - reset to current page
    pageInput.value = searchStore.currentPage
  }
}

// Watch for changes in current page to update input
watch(() => searchStore.currentPage, (newPage) => {
  pageInput.value = newPage
  // Initialize liked verses when poem changes
  initializeLikedVerses()
})

// Watch for changes in current poem to initialize liked verses
watch(() => currentPoem.value, () => {
  initializeLikedVerses()
}, { immediate: true })

// Function to highlight search query in poetry text
const highlightSearchQuery = (text) => {
  if (!searchStore.searchQuery || !text) return text
  
  const query = searchStore.searchQuery.trim()
  if (!query) return text
  
  // Escape special regex characters in the search query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  // Create regex with global flag and case insensitive
  const regex = new RegExp(`(${escapedQuery})`, 'gi')
  
  // Replace matches with bold tags
  return text.replace(regex, '<strong>$1</strong>')
}

const retrySearch = async () => {
  if (!searchStore.searchQuery.trim()) return
  
  try {
    searchStore.setLoading(true)
    searchStore.clearError()
    
    // Get poet names from selected poet IDs
    const selectedPoetNames = searchStore.selectedPoets.map(poetId => {
      const poet = searchStore.availablePoets.find(p => p.id === poetId)
      return poet ? poet.name : null
    }).filter(name => name !== null)
    
    // Use real API call
    const response = await ApiService.searchPoems(searchStore.searchQuery, selectedPoetNames, {
      page: 1,
      limit: 50
    })
    
    // Set initial results (only first 50)
    searchStore.setSearchResults(response.results)
    searchStore.setTotalResults(response.totalResults || response.results.length)
    
  } catch (err) {
    console.error('Retry search error:', err)
    searchStore.setError(err.message || 'خطا در جستجو. لطفاً دوباره تلاش کنید.')
  } finally {
    searchStore.setLoading(false)
  }
}

const copyPoetry = async (result) => {
  // Convert couplets to text: handle both normal couplets and full-width lines
  const poetryText = result.couplets
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
  const fullText = `${result.poetName}\n\n${poetryText}`
  
  try {
    await navigator.clipboard.writeText(fullText)
    // You could add a toast notification here
    console.log('Poetry copied to clipboard')
  } catch (err) {
    console.error('Failed to copy poetry:', err)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = fullText
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

const sharePoetry = async (result) => {
  // Convert couplets to text: handle both normal couplets and full-width lines
  const poetryText = result.couplets
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
  const shareText = `${result.poetName}\n\n${poetryText}`
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: `شعر ${result.poetName}`,
        text: shareText,
        url: window.location.href
      })
    } catch (err) {
      console.log('Share cancelled or failed:', err)
    }
  } else {
    // Fallback: copy to clipboard
    copyPoetry(result)
  }
}

// Navigate to full poem page
const viewFullPoem = () => {
  if (!currentPoem.value || !currentPoem.value.id) {
    console.error('No current poem to display')
    return
  }
  
  console.log('Navigating to poem:', currentPoem.value.id)
  router.push(`/poem/${currentPoem.value.id}`)
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
const handleNoteCreated = (note) => {
  // Note created successfully, modal will close automatically
  console.log('Note created:', note)
}

// Load liked verses from localStorage on component mount
onMounted(() => {
  const likedVerses = LikedVersesManager.getLikedVerses()
  console.log('📖 Loaded liked verses from localStorage:', likedVerses.size, 'verses')
})
</script>

<style scoped>
.result-list {
  min-height: 400px;
  padding-bottom: 80px;
}

.loading-state,
.error-state,
.no-results,
.welcome-state {
  
  text-align: center;
  padding: 60px 20px;
  color: #CDC7C6;
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

.no-results h3,
.welcome-state h3 {
  color: #CDC7C6;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.results-container {
  background: #151515;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.results-header {
  text-align: center;
  padding: 40px 20px;
  border-bottom: 1px solid #CDC7C6;
}

.selected-word-title {
  font-size: 2rem;
  font-weight: bold;
  color: #CDC7C6;
  margin: 0;
  line-height: 1.2;
}

.decorative {
  color: #702632;
  font-size: 2.5rem;
  margin: 0 10px;
}

.poetry-results {
  padding: 40px 20px;
  margin-bottom: 40px;
}



.poetry-section {
  margin-bottom: 40px;
}

.poetry-section:last-child {
  margin-bottom: 0;
}

.separator-line {
  height: 1px;
  background: #CDC7C6;
  margin: 20px 0;
  opacity: 0.3;
}

.poet-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px 0;
  padding: 0 20px;
  gap: 20px;
}

.poet-info {
  flex: 1;
  text-align: center;
}

.poet-name {
  font-size: 1.8rem;
  font-weight: bold;
  color: #CDC7C6;
  margin: 0 0 5px 0;
  font-family: 'Vazirmatn', sans-serif;
}

.poet-details {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.category {
  color: #888;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
}

.page-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex-wrap: nowrap;
}

.results-info {
  color: #888;
  font-size: 0.85rem;
  direction: rtl;
  white-space: nowrap;
}

.loading-indicator {
  color: #702632;
  font-size: 0.85rem;
  direction: rtl;
  white-space: nowrap;
  font-weight: 500;
}

.page-label {
  color: #CDC7C6;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  white-space: nowrap;
}

.page-input {
  width: 70px;
  padding: 10px 14px;
  background: #2a2a2a;
  border: 2px solid #702632;
  border-radius: 8px;
  color: #CDC7C6;
  font-size: 1rem;
  text-align: center;
  font-family: 'Vazirmatn', sans-serif;
  outline: none;
  transition: all 0.3s ease;
  font-weight: 600;
}

.page-input:focus {
  border-color: #8b3a42;
  background: #353535;
  box-shadow: 0 0 0 3px rgba(112, 38, 50, 0.2);
}

.page-input:hover {
  border-color: #8b3a42;
  background: #353535;
}

/* Remove number input spinners */
.page-input::-webkit-outer-spin-button,
.page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.page-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid #CDC7C6;
  border-radius: 50%;
  color: #CDC7C6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
  transform: scale(1.1);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.poetry-content {
  max-width: 95vw;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
}

.couplet-row {
  margin-bottom: 30px;
  padding-bottom: 20px;
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

/* Desktop/Tablet Layout */
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
  margin: 10px 0;
  padding: 15px;
  line-height: 2.2;
  color: #CDC7C6;
  font-size: 1.1rem;
  font-weight: 400;
  transition: all 0.3s ease;
  white-space: normal;
  overflow: visible;
  text-overflow: unset;
  min-height: 50px;
  display: flex;
  align-items: center;
  flex: 1;
  width: 100%;
  max-width: none;
  border-bottom: none;
}

.poetry-line:hover {
  background: rgba(112, 38, 50, 0.1);
  padding-right: 10px;
  border-radius: 4px;
}

.poetry-line.clickable {
  cursor: pointer;
}

.poetry-line.highlighted {
  background: rgba(112, 38, 50, 0.2);
  border: 1px solid #702632;
  border-radius: 8px;
  padding: 15px;
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

.nav-arrow {
  width: 40px;
  height: 40px;
  background: #702632;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.nav-arrow:hover:not(:disabled) {
  background: #8b3a42;
  transform: scale(1.1);
}

.nav-arrow:disabled {
  background: #555;
  cursor: not-allowed;
  opacity: 0.6;
}

.nav-arrow svg {
  width: 20px;
  height: 20px;
}

.pagination-section {
  margin-top: 40px;
  padding: 20px 0;
  border-top: 1px solid rgba(205, 199, 198, 0.2);
}

.pagination-controls {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  z-index: 1000;
  background: rgba(21, 21, 21, 0.95);
  padding: 15px 30px;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid #702632;
  box-shadow: 0 4px 20px rgba(112, 38, 50, 0.3);
}

@media (min-width: 1920px) {
  .poetry-content {
    max-width: 98vw;
    padding: 0 40px;
  }
  
  .poetry-columns {
    gap: 120px;
  }
  
  .poetry-line {
    font-size: 1.2rem;
  }
}

@media (min-width: 2560px) {
  .poetry-content {
    max-width: 99vw;
    padding: 0 60px;
  }
  
  .poetry-columns {
    gap: 150px;
  }
  
  .poetry-line {
    font-size: 1.3rem;
  }
}

@media (max-width: 768px) {
  .selected-word-title {
    font-size: 1.5rem;
  }
  
  .decorative {
    font-size: 2rem;
  }
  
  .poet-header {
    flex-direction: row;
    gap: 10px;
    padding: 0 10px;
  }
  
  .poet-name {
    font-size: 1.4rem;
  }
  
  .category {
    font-size: 0.9rem;
  }
  
  .action-buttons {
    justify-content: center;
  }
  
  .action-btn {
    width: 35px;
    height: 35px;
  }
  
  .action-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .nav-arrow {
    width: 35px;
    height: 35px;
  }
  
  .nav-arrow svg {
    width: 18px;
    height: 18px;
  }
  
  .navigation-controls {
    bottom: 20px;
    gap: 20px;
    padding: 12px 20px;
    border-radius: 40px;
  }
  
  .row-details {
    flex-direction: column;
    gap: 10px;
  }
  
  .poem-title {
    font-size: 1.1rem;
  }
  
  .poetry-line {
    font-size: 1rem;
  }
  
  .poetry-content {
    max-width: 100%;
    padding: 0 20px;
  }
  
  /* Show mobile layout, hide desktop layout */
  .desktop-layout {
    display: none;
  }
  
  .mobile-layout {
    display: block;
  }
  
  .couplet-row {
    margin-bottom: 25px;
    padding-bottom: 15px;
  }
  
  .poetry-columns {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .poetry-line {
    white-space: normal;
    font-size: 1rem;
    margin: 15px 0;
    padding: 12px 0;
    line-height: 2.2;
    min-height: 40px;
  }
  
  .page-indicator {
    font-size: 0.8rem;
  }
  
  .page-controls {
    gap: 8px;
  }
  
  .page-input {
    width: 50px;
    padding: 6px 8px;
    font-size: 0.8rem;
  }
  
  .page-label,
  .page-total {
    font-size: 0.8rem;
  }
}

/* View Full Poem Button */
.view-full-btn-container {
  display: flex;
  justify-content: center;
  margin-top: 30px;
  padding: 20px 0;
}

.view-full-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #702632;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(112, 38, 50, 0.3);
}

.view-full-btn:hover {
  background: #8b3a42;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(112, 38, 50, 0.4);
}

.view-full-btn svg {
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #151515;
  border: 1px solid #CDC7C6;
  border-radius: 16px;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(205, 199, 198, 0.2);
}

.modal-title-section {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.modal-poet-name {
  font-size: 1.8rem;
  font-weight: bold;
  color: #CDC7C6;
  margin: 0;
  font-family: 'Vazirmatn', sans-serif;
}

.modal-poem-title {
  font-size: 1.1rem;
  color: #CDC7C6;
  margin: 5px 0;
  font-family: 'Vazirmatn', sans-serif;
  opacity: 0.8;
}

.modal-category {
  color: #888;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
}

.modal-loading {
  text-align: center;
  padding: 60px 20px;
  color: #CDC7C6;
  font-size: 1.1rem;
  font-family: 'Vazirmatn', sans-serif;
}

.modal-close-btn {
  width: 40px;
  height: 40px;
  background: transparent;
  border: 1px solid #CDC7C6;
  border-radius: 50%;
  color: #CDC7C6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.modal-close-btn:hover {
  background: #702632;
  border-color: #702632;
  transform: scale(1.1);
}

.modal-close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

.modal-body .poetry-columns {
  gap: 100px;
}

.modal-body .poetry-line {
  margin: 18px 0;
  padding: 15px 0;
}

/* Custom scrollbar for modal */
.modal-body::-webkit-scrollbar {
  width: 8px;
}

.modal-body::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #702632;
  border-radius: 4px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #8b3a42;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 20px 30px;
  border-top: 1px solid rgba(205, 199, 198, 0.2);
}

.modal-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  color: #CDC7C6;
  border: 1px solid #CDC7C6;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 0.95rem;
  font-family: 'Vazirmatn', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-action-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.modal-action-btn svg {
  width: 18px;
  height: 18px;
}

/* Modal Mobile Styles */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
  }
  
  .modal-content {
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-poet-name {
    font-size: 1.4rem;
  }
  
  .modal-category {
    font-size: 0.9rem;
  }
  
  .modal-close-btn {
    width: 36px;
    height: 36px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .modal-body .poetry-columns {
    gap: 40px;
  }
  
  .modal-body .poetry-line {
    white-space: normal;
    font-size: 1rem;
    margin: 15px 0;
    padding: 12px 0;
  }
  
  .modal-footer {
    padding: 15px 20px;
    gap: 10px;
  }
  
  .modal-action-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  
  .view-full-btn {
    padding: 12px 24px;
    font-size: 0.95rem;
  }
}
</style>
