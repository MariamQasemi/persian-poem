import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ApiService } from '../services/api.js'

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
  const totalPages = ref(0)
  const allResults = ref([]) // Store all results for client-side pagination

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
  
  const hasMorePages = computed(() => {
    return currentPage.value < totalPages.value
  })
  
  const canLoadMore = computed(() => {
    return allResults.value.length < totalResults.value
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
    
    // Merge with existing results if this is a pagination load
    if (allResults.value.length > 0 && currentPage.value > 1) {
      // This is a paginated load, merge with existing results
      allResults.value = [...allResults.value, ...results]
    } else {
      // This is a new search or first page
      allResults.value = results
    }
    
    searchResults.value = allResults.value
    console.log('Store searchResults.value after setting:', searchResults.value.length)
    console.log('Store allResults.value length:', allResults.value.length)
  }
  
  const setTotalPages = (pages) => {
    totalPages.value = pages
    console.log('Store setTotalPages called with:', pages)
  }
  
  const setTotalResults = (total) => {
    totalResults.value = total
    console.log('Store setTotalResults called with:', total)
  }
  
  const loadMoreResults = async () => {
    if (!canLoadMore.value || isLoading.value) {
      return
    }
    
    isLoading.value = true
    currentPage.value++
    
    try {
      const nextPageResults = await ApiService.searchPoems(searchQuery.value, selectedPoets.value, {
        page: currentPage.value,
        limit: 50
      })
      
      // Append new results to allResults
      allResults.value = [...allResults.value, ...nextPageResults.results]
      searchResults.value = allResults.value
      
      // Update total results if provided
      if (nextPageResults.totalResults) {
        totalResults.value = nextPageResults.totalResults
      }
      
      console.log('Load more results completed. Total results:', allResults.value.length)
    } catch (error) {
      console.error('Error loading more results:', error)
      currentPage.value-- // Revert page increment on error
    } finally {
      isLoading.value = false
    }
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
    totalPages.value = 0
    allResults.value = []
    searchResults.value = []
  }

  const clearResults = () => {
    searchResults.value = []
    allResults.value = []
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
    totalPages,
    allResults,
    
    // Getters
    hasResults,
    filteredResults,
    hasMorePages,
    canLoadMore,
    
    // Actions
    setSearchQuery,
    setSelectedPoets,
    addPoetFilter,
    removePoetFilter,
    clearFilters,
    setSearchResults,
    setTotalPages,
    setTotalResults,
    setAvailablePoets,
    setLoading,
    setError,
    clearError,
    setCurrentPage,
    nextPage,
    prevPage,
    resetPagination,
    clearResults,
    loadMoreResults
  }
})
