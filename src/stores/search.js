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
  const apiPageNumber = ref(1) // Track which API page we're on

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
    
    // This is a new search - reset everything
    allResults.value = results
    searchResults.value = results
    apiPageNumber.value = 1
    
    console.log('Store searchResults.value after setting:', searchResults.value.length)
    console.log('Store allResults.value length:', allResults.value.length)
  }
  
  const appendSearchResults = (results) => {
    console.log('Store appendSearchResults called with:', results.length, 'results')
    allResults.value = [...allResults.value, ...results]
    searchResults.value = allResults.value
    apiPageNumber.value++
    console.log('Store total results now:', allResults.value.length)
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
    if (isLoading.value) {
      console.log('Already loading, skipping...')
      return
    }
    
    isLoading.value = true
    
    try {
      // Convert poet IDs to poet names for API call
      const selectedPoetNames = selectedPoets.value.map(poetId => {
        const poet = availablePoets.value.find(p => p.id === poetId)
        return poet ? poet.name : null
      }).filter(name => name !== null)
      
      const nextApiPage = apiPageNumber.value + 1
      console.log(`Loading API page ${nextApiPage}...`)
      
      const nextPageResults = await ApiService.searchPoems(searchQuery.value, selectedPoetNames, {
        page: nextApiPage,
        limit: 50
      })
      
      // Append new results
      allResults.value = [...allResults.value, ...nextPageResults.results]
      searchResults.value = allResults.value
      apiPageNumber.value = nextApiPage
      
      // Update total results if provided
      if (nextPageResults.totalResults) {
        totalResults.value = nextPageResults.totalResults
      }
      
      console.log('Load more results completed. Total results:', allResults.value.length)
    } catch (error) {
      console.error('Error loading more results:', error)
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
    // Navigate to next poem in loaded results
    console.log('nextPage called:', {
      currentPage: currentPage.value,
      totalLoaded: searchResults.value.length,
      canAdvance: currentPage.value < searchResults.value.length
    })
    if (currentPage.value < searchResults.value.length) {
      currentPage.value++
      console.log('Advanced to page:', currentPage.value)
    } else {
      console.log('Cannot advance - already at end')
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
    apiPageNumber.value = 1
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
    apiPageNumber,
    
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
    appendSearchResults,
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
