import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSearchStore = defineStore('search', () => {
  // State
  const searchQuery = ref('')
  const selectedPoets = ref([])
  const searchResults = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const availablePoets = ref([])
  const currentPage = ref(1)
  const totalResults = ref(0)

  // Getters
  const hasResults = computed(() => {
    const result = searchResults.value.length > 0
    console.log('hasResults computed:', result, 'searchResults.value.length:', searchResults.value.length)
    return result
  })
  const filteredResults = computed(() => {
    if (selectedPoets.value.length === 0) {
      return searchResults.value
    }
    
    const filtered = searchResults.value.filter(result => 
      selectedPoets.value.includes(result.poetId)
    )
    return filtered
  })
  
  const totalPages = computed(() => {
    return totalResults.value // 1 poem per page, so total pages = total results
  })
  
  const hasMorePages = computed(() => {
    return currentPage.value < totalPages.value
  })

  // Actions
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const setSelectedPoets = (poets) => {
    selectedPoets.value = poets
  }

  const addPoetFilter = (poetId) => {
    if (!selectedPoets.value.includes(poetId)) {
      selectedPoets.value.push(poetId)
    }
  }

  const removePoetFilter = (poetId) => {
    const index = selectedPoets.value.indexOf(poetId)
    if (index > -1) {
      selectedPoets.value.splice(index, 1)
    }
  }

  const clearFilters = () => {
    selectedPoets.value = []
  }

  const setSearchResults = (results) => {
    console.log('Store setSearchResults called with:', results.length, 'results')
    searchResults.value = results
    console.log('Store searchResults.value after setting:', searchResults.value.length)
  }

  const setAvailablePoets = (poets) => {
    availablePoets.value = poets
  }

  const setLoading = (loading) => {
    isLoading.value = loading
  }

  const setError = (err) => {
    error.value = err
  }

  const clearError = () => {
    error.value = null
  }
  
  const setTotalResults = (total) => {
    totalResults.value = total
  }
  
  const setCurrentPage = (page) => {
    currentPage.value = page
  }
  
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }
  
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }
  
  const resetPagination = () => {
    currentPage.value = 1
    totalResults.value = 0
  }

  const clearResults = () => {
    searchResults.value = []
    error.value = null
  }

  return {
    // State
    searchQuery,
    selectedPoets,
    searchResults,
    isLoading,
    error,
    availablePoets,
    currentPage,
    totalResults,
    
    // Getters
    hasResults,
    filteredResults,
    totalPages,
    hasMorePages,
    
    // Actions
    setSearchQuery,
    setSelectedPoets,
    addPoetFilter,
    removePoetFilter,
    clearFilters,
    setSearchResults,
    setAvailablePoets,
    setLoading,
    setError,
    clearError,
    setTotalResults,
    setCurrentPage,
    nextPage,
    prevPage,
    resetPagination,
    clearResults
  }
})
