<template>
  <div class="filter-panel">
    <div ref="dropdownContainer" class="poet-dropdown-container">
      <div 
        @click="toggleDropdown"
        class="poet-dropdown-trigger"
      >
        <span class="selected-poet">{{ selectedPoetName || 'انتخاب شاعر' }}</span>
        <svg 
          class="dropdown-arrow"
          :class="{ 'rotated': showDropdown }"
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      
      <!-- Dropdown Menu -->
      <div v-if="showDropdown" class="dropdown-menu">
        <!-- Search Input -->
        <div class="poet-search-container">
          <input
            v-model="poetSearchQuery"
            type="text"
            id="poet-search-input"
            name="poet-search"
            placeholder="جستجو نام شاعر"
            class="poet-search-input"
          />
          <div class="search-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        
        <!-- Poet List -->
        <div class="poet-list">
          <div 
            v-for="poet in filteredPoets" 
            :key="poet.id"
            @click="selectPoet(poet)"
            class="poet-item"
            :class="{ 'selected': selectedPoets.includes(poet.id) }"
          >
            <div class="poet-info">
              <input 
                type="radio" 
                :id="`poet-${poet.id}`"
                :name="`poet-selection`"
                :checked="selectedPoets.includes(poet.id)"
                class="poet-radio"
                @click.stop="selectPoet(poet)"
              />
              <span class="poet-name">{{ poet.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Search Button -->
    <button 
      @click="performSearch"
      class="search-button"
    >
      جستجو
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useSearchStore } from '../stores/search'
import { ApiService } from '../services/api.js'

const searchStore = useSearchStore()
const availablePoets = ref([])
const showDropdown = ref(false)
const poetSearchQuery = ref('')
const dropdownContainer = ref(null)

const selectedPoets = computed({
  get: () => searchStore.selectedPoets,
  set: (value) => searchStore.setSelectedPoets(value)
})

const selectedPoetName = computed(() => {
  if (selectedPoets.value.length === 0) return ''
  if (selectedPoets.value.length === 1) {
    const poet = availablePoets.value.find(p => p.id === selectedPoets.value[0])
    return poet ? poet.name : ''
  }
  return `${selectedPoets.value.length} شاعر انتخاب شده`
})

const filteredPoets = computed(() => {
  if (!poetSearchQuery.value.trim()) {
    return availablePoets.value
  }
  return availablePoets.value.filter(poet => 
    poet.name.toLowerCase().includes(poetSearchQuery.value.toLowerCase())
  )
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

// Click outside handler
const handleClickOutside = (event) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
    showDropdown.value = false
  }
}

const selectPoet = (poet) => {
  if (selectedPoets.value.includes(poet.id)) {
    // Remove poet if already selected
    searchStore.removePoetFilter(poet.id)
  } else {
    // Clear all previous selections and add only this poet
    searchStore.clearFilters()
    searchStore.addPoetFilter(poet.id)
  }
  
  if (searchStore.searchQuery.trim()) {
    performSearch()
  }
}

const removeFilter = (poetId) => {
  searchStore.removePoetFilter(poetId)
  if (searchStore.searchQuery.trim()) {
    performSearch()
  }
}

const performSearch = async () => {
  // Check if there's a search query from SearchBar
  if (!searchStore.searchQuery.trim()) {
    // Show alert and trigger validation error
    alert('لطفاً کلمه مورد نظر را وارد کنید')
    searchStore.setError('لطفاً کلمه مورد نظر را وارد کنید')
    return
  }
  
  try {
    searchStore.setLoading(true)
    searchStore.clearError()
    
    // Convert poet IDs to poet names for API call
    const selectedPoetNames = searchStore.selectedPoets.map(poetId => {
      const poet = availablePoets.value.find(p => p.id === poetId)
      return poet ? poet.name : null
    }).filter(name => name !== null)
    
    // Use real API call
    console.log('Searching with query:', searchStore.searchQuery)
    console.log('Selected poet names:', selectedPoetNames)
    
    // Test API connectivity first
    try {
      const testResponse = await fetch('http://165.227.205.3/poets')
      console.log('Poets API test:', testResponse.ok)
    } catch (testErr) {
      console.error('Poets API test failed:', testErr)
    }
    
    const results = await ApiService.searchPoems(searchStore.searchQuery, selectedPoetNames)
    console.log('Search results:', results)
    searchStore.setSearchResults(results.results)
    searchStore.setTotalResults(results.totalResults)
    
  } catch (err) {
    console.error('Search error:', err)
    
    // Check if it's a CORS or network error
    if (err.message.includes('CORS') || err.message.includes('fetch')) {
      searchStore.setError('خطا در اتصال به سرور. لطفاً اتصال اینترنت خود را بررسی کنید.')
    } else {
      searchStore.setError(err.message)
    }
  } finally {
    searchStore.setLoading(false)
  }
}

onMounted(async () => {
  try {
    // Load poets from API
    const poets = await ApiService.getPoets()
    availablePoets.value = poets
    searchStore.setAvailablePoets(poets)
    
  } catch (err) {
    console.error('Error loading poets:', err)
    // Fallback to empty array if API fails
    availablePoets.value = []
    searchStore.setAvailablePoets([])
  }
  
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // Remove click outside listener
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.filter-panel {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.poet-dropdown-container {
  position: relative;
  width: 100%;
}

.poet-dropdown-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: transparent;
  border: 1px solid #CDC7C6;
  border-radius: 8px;
  padding: 15px 20px;
  cursor: pointer;
  transition: border-color 0.3s ease;
  min-height: 50px;
}

.poet-dropdown-trigger:hover {
  border-color: #702632;
}

.selected-poet {
  color: #CDC7C6;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  direction: rtl;
  text-align: right;
}

.dropdown-arrow {
  width: 20px;
  height: 20px;
  color: #CDC7C6;
  transition: transform 0.3s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #CDC7C6;
  border: 1px solid #CDC7C6;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  margin-top: 5px;
  padding: 15px;
}



.poem-count {
  color: #888;
  font-size: 0.9rem;
  font-family: 'Vazirmatn', sans-serif;
}

/* Poet Search Container */
.poet-search-container {
  position: relative;
  margin-bottom: 15px;
}

.poet-search-input {
  width: 100%;
  padding: 12px 24px 12px 15px;
  background: transparent;
  border: 0.5px solid #CDC7C6;
  border-radius: 6px;
  background:#ebebeb;
  font-size: 16px;
  direction: rtl;
  text-align: right;
  outline: none;
  font-family: 'Vazirmatn', sans-serif;
  height: 40px;
}

.poet-search-input::placeholder {
  color: #888;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #702632;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-icon svg {
  width: 16px;
  height: 16px;
}

/* Poet List */
.poet-list {
  max-height: 300px;
  overflow-y: auto;
}

.poet-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  margin-bottom: 8px;
  border: 1px solid #702632 !important;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.poet-item:hover {
  background: #B8B0AF;
}

.poet-item.selected {
  background: #B8B0AF;
}

.poet-radio {
  width: 16px !important;
  height: 16px !important;
  min-width: 16px !important;
  min-height: 16px !important;
  max-width: 16px !important;
  max-height: 16px !important;
  margin-right: 16px;
  background: transparent !important;
  border: 2px solid #702632 !important;
  border-radius: 50%;
  padding: 0 !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  position: relative;
  cursor: pointer;
  box-sizing: border-box !important;
}

.poet-radio:checked {
  background: #702632 !important;
}

.poet-radio:checked::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

.poet-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.poet-item .poet-name {
  color: #151515;
  font-weight: 500;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 16px;
  padding-right: 16px;
}

/* Search Button */
.search-button {
  width: 100%;
  background: #702632;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 15px 20px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 15px;
  min-height: 50px;
}

.search-button:hover {
  background: #5a1e28;
}


@media (max-width: 768px) {
  .poet-dropdown-trigger {
    padding: 12px 15px;
  }
  
  .dropdown-item {
    padding: 12px 15px;
  }
  
  .search-button {
    padding: 12px 15px;
  }
}
</style>
