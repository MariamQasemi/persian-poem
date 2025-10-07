<template>
  <div class="result-list">
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


cd          <div class="poet-info">
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
          <!-- Desktop/Tablet: Two Column Layout -->
          <div class="poetry-columns desktop-layout">
            <div class="poetry-column">
              <div 
                v-for="(verse, index) in leftColumnVerses" 
                :key="`left-${index}`"
                class="poetry-line"
                :class="{ highlighted: verse.includes(searchStore.searchQuery) }"
                v-html="highlightSearchQuery(verse)"
              >
              </div>
            </div>
            <div class="poetry-column">
              <div 
                v-for="(verse, index) in rightColumnVerses" 
                :key="`right-${index}`"
                class="poetry-line"
                :class="{ highlighted: verse.includes(searchStore.searchQuery) }"
                v-html="highlightSearchQuery(verse)"
              >
              </div>
            </div>
          </div>
          
          <!-- Mobile: Single Column Layout with Sequential Order -->
          <div class="poetry-columns mobile-layout">
            <div class="poetry-column">
              <div 
                v-for="(verse, index) in currentPoem.verses" 
                :key="`mobile-${index}`"
                class="poetry-line"
                :class="{ highlighted: verse.includes(searchStore.searchQuery) }"
                v-html="highlightSearchQuery(verse)"
              >
              </div>
            </div>
          </div>
        </div>
        
        <!-- Navigation Arrows -->
        <div class="navigation-controls" v-if="searchStore.totalPages > 1">
          <button @click="prevPoem" :disabled="searchStore.currentPage === 1" class="nav-arrow nav-prev">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          
          <button @click="nextPoem" :disabled="searchStore.currentPage === searchStore.totalPages" class="nav-arrow nav-next">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <!-- Page Indicator -->
        <div class="page-indicator" v-if="searchStore.totalPages > 1">
          <div class="page-controls">
            <span class="page-label">صفحه:</span>
            <input 
              v-model.number="pageInput"
              @keyup.enter="goToPage"
              @blur="goToPage"
              type="number"
              :min="1"
              :max="searchStore.totalPages"
              class="page-input"
              :placeholder="searchStore.currentPage"
            />
            <span class="page-total">از {{ searchStore.totalPages }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useSearchStore } from '../stores/search'
import { ApiService } from '../services/api.js'

const searchStore = useSearchStore()
const pageInput = ref(searchStore.currentPage)

// Access store values directly to maintain reactivity
// Don't destructure reactive values as it breaks reactivity

// Current poem for single display
const currentPoem = computed(() => {
  if (!searchStore.filteredResults.length) return null
  return searchStore.filteredResults[searchStore.currentPage - 1]
})

// Split verses into two columns with zigzag pattern
// Right column: verses 2, 4, 6, 8... (even positions)
// Left column: verses 1, 3, 5, 7... (odd positions)
const rightColumnVerses = computed(() => {
  if (!currentPoem.value || !currentPoem.value.verses) return []
  const verses = currentPoem.value.verses
  return verses.filter((_, index) => index % 2 === 1) // 1, 3, 5, 7... (even positions: 2nd, 4th, 6th...)
})

const leftColumnVerses = computed(() => {
  if (!currentPoem.value || !currentPoem.value.verses) return []
  const verses = currentPoem.value.verses
  return verses.filter((_, index) => index % 2 === 0) // 0, 2, 4, 6... (odd positions: 1st, 3rd, 5th...)
})

// Navigation methods for single poem display
const nextPoem = () => {
  if (searchStore.currentPage < searchStore.totalPages) {
    searchStore.nextPage()
  }
}

const prevPoem = () => {
  if (searchStore.currentPage > 1) {
    searchStore.prevPage()
  }
}

// Go to specific page
const goToPage = () => {
  const page = parseInt(pageInput.value)
  if (page >= 1 && page <= searchStore.totalPages) {
    searchStore.setCurrentPage(page)
  } else {
    // Reset to current page if invalid input
    pageInput.value = searchStore.currentPage
  }
}

// Watch for changes in current page to update input
watch(() => searchStore.currentPage, (newPage) => {
  pageInput.value = newPage
})

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
    const results = await ApiService.searchPoems(searchStore.searchQuery, selectedPoetNames)
    searchStore.setSearchResults(results)
    
  } catch (err) {
    searchStore.setError(err.message)
  } finally {
    searchStore.setLoading(false)
  }
}

const copyPoetry = async (result) => {
  const poetryText = result.verses.join('\n')
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
  const poetryText = result.verses.join('\n')
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

.page-indicator {
  text-align: center;
  color: #888;
  font-size: 0.9rem;
  margin-top: 20px;
  padding: 10px;
  font-family: 'Vazirmatn', sans-serif;
}

.page-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.page-label {
  color: #CDC7C6;
  font-size: 0.9rem;
}

.page-input {
  width: 60px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid #CDC7C6;
  border-radius: 6px;
  color: #CDC7C6;
  font-size: 0.9rem;
  text-align: center;
  font-family: 'Vazirmatn', sans-serif;
  outline: none;
  transition: border-color 0.3s ease;
}

.page-input:focus {
  border-color: #702632;
  background: rgba(112, 38, 50, 0.1);
}

.page-input::placeholder {
  color: #888;
}

.page-total {
  color: #888;
  font-size: 0.9rem;
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

.poetry-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
  direction: rtl;
  width: 100%;
}

/* Desktop/Tablet Layout */
.desktop-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
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

.poetry-line {
  margin: 20px 0;
  padding: 15px 0;
  line-height: 2.8;
  color: #CDC7C6;
  font-size: 1.1rem;
  font-weight: 400;
  border-bottom: 1px solid #CDC7C6;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: visible;
  text-overflow: unset;
  min-height: 50px;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: none;
}

.poetry-line:hover {
  background: rgba(112, 38, 50, 0.1);
  padding-right: 10px;
  border-radius: 4px;
}

.poetry-line.highlighted {
  background: rgba(112, 38, 50, 0.2);
  border: 1px solid #702632;
  border-radius: 8px;
  padding: 15px;
  font-weight: 400;
  color: #CDC7C6;
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

.navigation-controls {
  position: fixed;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  z-index: 1000;
  background: rgba(21, 21, 21, 0.9);
  padding: 15px 25px;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(205, 199, 198, 0.2);
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
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
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
</style>
