<template>
  <div class="filter-panel">
    <!-- Sidebar Toggle Button (Mobile) -->
    <button 
      @click="toggleSidebar"
      class="sidebar-toggle-btn"
      :class="{ 'active': showSidebar }"
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>فیلترها</span>
    </button>

    <!-- Overlay (Mobile) -->
    <div 
      v-if="showSidebar" 
      class="sidebar-overlay"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar -->
    <div 
      ref="sidebar"
      class="filter-sidebar"
      :class="{ 'open': showSidebar }"
    >
      <!-- Sidebar Header -->
      <div class="sidebar-header">
        <h3 class="sidebar-title">فیلترها</h3>
        <button 
          @click="closeSidebar"
          class="close-btn"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Filters Content -->
      <div class="sidebar-content">
        <!-- Poet Filter Section -->
        <div class="filter-section">
          <h4 class="filter-section-title">نام شاعر</h4>
          
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
          
          <!-- Debug Info -->
          <div class="debug-info" style="color: #888; font-size: 0.8rem; margin-bottom: 10px;">
            تعداد کل شاعران: {{ availablePoets.length }}
          </div>
          
          <!-- Selected Count -->
          <div v-if="selectedPoets.length > 0" class="selected-count">
            {{ selectedPoets.length }} شاعر انتخاب شده
          </div>
          
          <!-- Loading State -->
          <div v-if="availablePoets.length === 0" class="loading-poets">
            در حال بارگذاری شاعران...
          </div>
          
          <!-- Poet List -->
          <div v-else class="poet-list">
            <div 
              v-for="(poet, index) in filteredPoets" 
              :key="poet.id"
            >
              <!-- Separator between selected and unselected -->
              <div 
                v-if="index > 0 && selectedPoets.includes(filteredPoets[index - 1].id) && !selectedPoets.includes(poet.id)"
                class="poet-list-separator"
              >
                <span class="separator-line"></span>
              </div>
              
              <div 
                @click="selectPoet(poet)"
                class="poet-item"
                :class="{ 'selected': selectedPoets.includes(poet.id) }"
              >
                <div class="poet-info">
                  <input 
                    type="checkbox" 
                    :id="`poet-${poet.id}`"
                    :checked="selectedPoets.includes(poet.id)"
                    class="poet-checkbox"
                    @click.stop="selectPoet(poet)"
                  />
                  <label :for="`poet-${poet.id}`" class="poet-name">{{ poet.name }}</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar Footer -->
      <div class="sidebar-footer">
        <button 
          v-if="selectedPoets.length > 0"
          @click="clearAllFilters"
          class="clear-btn"
        >
          پاک کردن همه
        </button>
        <button 
          @click="closeSidebar"
          class="close-sidebar-btn"
        >
          بستن
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useSearchStore } from '../stores/search'
import { ApiService } from '../services/api.js'

const searchStore = useSearchStore()
const availablePoets = ref([])
const showSidebar = ref(false)
const poetSearchQuery = ref('')
const sidebar = ref(null)

const selectedPoets = computed({
  get: () => searchStore.selectedPoets,
  set: (value) => searchStore.setSelectedPoets(value)
})

const filteredPoets = computed(() => {
  let poets = availablePoets.value
  
  // Filter by search query if exists
  if (poetSearchQuery.value.trim()) {
    poets = poets.filter(poet => 
      poet.name.toLowerCase().includes(poetSearchQuery.value.toLowerCase())
    )
  }
  
  // Sort: selected poets first, then unselected
  return poets.sort((a, b) => {
    const aSelected = selectedPoets.value.includes(a.id)
    const bSelected = selectedPoets.value.includes(b.id)
    
    if (aSelected && !bSelected) return -1
    if (!aSelected && bSelected) return 1
    return 0
  })
})

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

const closeSidebar = () => {
  showSidebar.value = false
}

const selectPoet = async (poet) => {
  if (selectedPoets.value.includes(poet.id)) {
    // Remove poet if already selected
    searchStore.removePoetFilter(poet.id)
  } else {
    // Add poet to selection (allow multiple selections)
    searchStore.addPoetFilter(poet.id)
  }
  
  // Auto-apply filter when poet is selected/deselected
  if (searchStore.searchQuery.trim()) {
    await applyFilters()
  }
}

const clearAllFilters = async () => {
  searchStore.clearFilters()
  
  // Auto-apply filter after clearing
  if (searchStore.searchQuery.trim()) {
    await applyFilters()
  }
}

const applyFilters = async () => {
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
    console.log('FilterPanel: Loading poets from API...')
    // Load poets from API
    const poets = await ApiService.getPoets()
    console.log('FilterPanel: Received poets:', poets)
    console.log('FilterPanel: Number of poets:', poets.length)
    availablePoets.value = poets
    searchStore.setAvailablePoets(poets)
    console.log('FilterPanel: availablePoets.value set to:', availablePoets.value)
    
    // Set default selected poets only if no poets are currently selected
    if (searchStore.selectedPoets.length === 0 && poets.length > 0) {
      // Default poets: حافظ، سعدی، فردوسی، مولوی، خیام
      const defaultPoetNames = ['حافظ', 'سعدی', 'فردوسی', 'مولوی', 'خیام']
      console.log('FilterPanel: Looking for default poets:', defaultPoetNames)
      const defaultPoets = poets
        .filter(poet => defaultPoetNames.includes(poet.name))
        .map(poet => poet.id)
      
      console.log('FilterPanel: Found default poets:', defaultPoets)
      if (defaultPoets.length > 0) {
        searchStore.setSelectedPoets(defaultPoets)
      }
    }
    
  } catch (err) {
    console.error('FilterPanel: Error loading poets:', err)
    console.error('FilterPanel: Error details:', err.message, err.stack)
    // Fallback to empty array if API fails
    availablePoets.value = []
    searchStore.setAvailablePoets([])
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>

<style scoped>
.filter-panel {
  position: relative;
}

/* Toggle Button (Mobile) */
.sidebar-toggle-btn {
  display: none;
  align-items: center;
  gap: 8px;
  background: #702632;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin: 0 auto 20px;
  position: fixed;
  top: 15px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 900;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.sidebar-toggle-btn svg {
  width: 20px;
  height: 20px;
}

.sidebar-toggle-btn:hover {
  background: #8b3a42;
}

.sidebar-toggle-btn.active {
  background: #8b3a42;
}

/* Overlay (Mobile) */
.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  backdrop-filter: blur(4px);
}

/* Sidebar */
.filter-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: #1a1a1a;
  border-left: 1px solid #CDC7C6;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  transition: transform 0.3s ease;
}

/* Sidebar Header */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(205, 199, 198, 0.2);
}

.sidebar-title {
  color: #CDC7C6;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
  font-family: 'Vazirmatn', sans-serif;
}

.close-btn {
  display: none;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #CDC7C6;
  border-radius: 50%;
  color: #CDC7C6;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #702632;
  border-color: #702632;
}

.close-btn svg {
  width: 16px;
  height: 16px;
}

/* Sidebar Content */
.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Filter Section */
.filter-section {
  margin-bottom: 30px;
}

.filter-section-title {
  color: #CDC7C6;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 15px 0;
  font-family: 'Vazirmatn', sans-serif;
}

/* Selected Count */
.selected-count {
  color: #702632;
  font-size: 0.9rem;
  font-family: 'Vazirmatn', sans-serif;
  margin-bottom: 10px;
  font-weight: 500;
}

/* Poet Search Container */
.poet-search-container {
  position: relative;
  margin-bottom: 15px;
}

.poet-search-input {
  width: 100%;
  padding: 12px 40px 12px 15px;
  background: #2a2a2a;
  border: 1px solid #CDC7C6;
  border-radius: 6px;
  color: #CDC7C6;
  font-size: 0.95rem;
  direction: rtl;
  text-align: right;
  outline: none;
  font-family: 'Vazirmatn', sans-serif;
  transition: border-color 0.3s ease;
}

.poet-search-input:focus {
  border-color: #702632;
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
  color: #CDC7C6;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.search-icon svg {
  width: 16px;
  height: 16px;
}

/* Poet List */
.poet-list {
  max-height: calc(100vh - 400px);
  overflow-y: auto;
  padding-right: 5px;
}

.poet-list-separator {
  margin: 15px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.poet-list-separator .separator-line {
  width: 100%;
  height: 1px;
  background: linear-gradient(to left, transparent, #CDC7C6 50%, transparent);
  opacity: 0.3;
}

/* Custom scrollbar */
.poet-list::-webkit-scrollbar {
  width: 6px;
}

.poet-list::-webkit-scrollbar-track {
  background: #2a2a2a;
  border-radius: 3px;
}

.poet-list::-webkit-scrollbar-thumb {
  background: #702632;
  border-radius: 3px;
}

.poet-list::-webkit-scrollbar-thumb:hover {
  background: #8b3a42;
}

.poet-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #2a2a2a;
  border: 1px solid rgba(205, 199, 198, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.poet-item:hover {
  background: #353535;
  border-color: #702632;
}

.poet-item.selected {
  background: rgba(112, 38, 50, 0.2);
  border-color: #702632;
}

.poet-checkbox {
  width: 18px !important;
  height: 18px !important;
  min-width: 18px !important;
  min-height: 18px !important;
  max-width: 18px !important;
  max-height: 18px !important;
  margin-left: 12px;
  background: transparent !important;
  border: 2px solid #CDC7C6 !important;
  border-radius: 4px;
  padding: 0 !important;
  appearance: none !important;
  -webkit-appearance: none !important;
  -moz-appearance: none !important;
  position: relative;
  cursor: pointer;
  box-sizing: border-box !important;
  transition: all 0.2s ease;
}

.poet-checkbox:checked {
  background: #702632 !important;
  border-color: #702632 !important;
}

.poet-checkbox:checked::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}

.poet-info {
  display: flex;
  align-items: center;
  flex: 1;
  direction: rtl;
}

.poet-name {
  color: #CDC7C6;
  font-weight: 400;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 0.95rem;
  cursor: pointer;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(205, 199, 198, 0.2);
  display: flex;
  gap: 10px;
  flex-direction: column;
}

.clear-btn {
  width: 100%;
  background: transparent;
  color: #CDC7C6;
  border: 1px solid #CDC7C6;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(205, 199, 198, 0.1);
  border-color: #702632;
  color: #702632;
}

.close-sidebar-btn {
  display: none;
  width: 100%;
  background: #702632;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 0.95rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.close-sidebar-btn:hover {
  background: #8b3a42;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar-toggle-btn {
    display: flex;
  }

  .sidebar-overlay {
    display: block;
    animation: fadeIn 0.3s ease;
  }

  .filter-sidebar {
    transform: translateX(100%);
    width: 100%;
    max-width: 100%;
  }

  .filter-sidebar.open {
    transform: translateX(0);
  }

  .close-btn {
    display: flex;
  }
  
  .close-sidebar-btn {
    display: block;
  }

  .poet-list {
    max-height: calc(100vh - 300px);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Desktop - Sidebar always visible */
@media (min-width: 769px) {
  .sidebar-overlay {
    display: none !important;
  }
  
  .filter-sidebar {
    transform: translateX(0);
  }
}
</style>
