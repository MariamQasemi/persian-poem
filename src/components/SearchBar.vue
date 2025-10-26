<template>
  <div class="search-bar">
    <div class="search-container" :class="{ 'error': error }">
      <input
        v-model="localQuery"
        @keyup.enter="performSearch"
        @input="onInput"
        type="text"
        id="search-input"
        name="search-query"
        placeholder="جستجوی کلمه"
        class="search-input"
        :disabled="isLoading"
      />
      <button 
        @click="performSearch" 
        class="search-button"
        :disabled="isLoading || !localQuery.trim()"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
    </div>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSearchStore } from '../stores/search'
import { ApiService } from '../services/api.js'

const searchStore = useSearchStore()
const localQuery = ref(searchStore.searchQuery)

const { isLoading, error } = searchStore

// Watch for external changes to search query
watch(() => searchStore.searchQuery, (newQuery) => {
  localQuery.value = newQuery
})

const onInput = () => {
  searchStore.setSearchQuery(localQuery.value)
  searchStore.clearError()
}

const performSearch = async () => {
  if (!localQuery.value.trim()) return
  
  let response = null
  
  try {
    searchStore.setLoading(true)
    searchStore.clearError()
    searchStore.resetPagination()
    
    // IMPORTANT: Set the search query in the store
    searchStore.setSearchQuery(localQuery.value)
    
    // Get poet names from selected poet IDs
    const selectedPoetNames = searchStore.selectedPoets.map(poetId => {
      const poet = searchStore.availablePoets.find(p => p.id === poetId)
      return poet ? poet.name : null
    }).filter(name => name !== null)
    
    // Fetch first page of results (50 poems per page - max allowed by API)
    response = await ApiService.searchPoems(localQuery.value, selectedPoetNames, {
      page: 1,
      limit: 50
    })
    
    console.log('SearchBar received response:', response)
    console.log('SearchBar response.results:', response.results?.length)
    console.log('SearchBar response.totalResults:', response.totalResults)
    console.log('SearchBar response.totalPages:', response.totalPages)
    
    // Set initial results immediately so user can see results right away
    searchStore.setSearchResults(response.results)
    searchStore.setTotalResults(response.totalResults || response.results.length)
    if (response.totalPages) {
      searchStore.setTotalPages(response.totalPages)
    }
    
    // Clear loading state immediately so initial results show
    searchStore.setLoading(false)
    
    console.log('SearchBar set initial results:', response.results?.length, 'total pages:', response.totalPages)
    
    // If there are more pages, load them in the background
    if (response.totalPages > 1) {
      console.log('More pages available, loading additional results in background...')
      
      // Don't set loading to true again - let results show while we fetch more
      
      // Fetch remaining pages in background
      const backgroundFetch = async () => {
        const allResults = [response.results]
        
        for (let page = 2; page <= response.totalPages; page++) {
          try {
            const pageResult = await ApiService.searchPoems(localQuery.value, selectedPoetNames, {
              page: page,
              limit: 50
            })
            
            if (pageResult.results && pageResult.results.length > 0) {
              allResults.push(pageResult.results)
              console.log(`Background loaded page ${page}/${response.totalPages}`)
              
              // Update results as we get them
              const mergedResults = allResults.flat()
              searchStore.setSearchResults(mergedResults)
              console.log(`Total results so far: ${mergedResults.length}`)
            }
            
            // Small delay between requests to avoid rate limiting
            if (page < response.totalPages) {
              await new Promise(resolve => setTimeout(resolve, 300))
            }
          } catch (error) {
            console.error(`Error loading page ${page}:`, error)
            // Continue with remaining pages even if one fails
          }
        }
        
        console.log('All background results loaded')
        searchStore.setLoading(false)
      }
      
      // Start background fetching without waiting
      backgroundFetch().catch(err => {
        console.error('Background fetch error:', err)
        searchStore.setLoading(false)
      })
    }
    
  } catch (err) {
    console.error('SearchBar error:', err)
    console.error('Error message:', err.message)
    
    // If we have partial results, show them instead of showing error
    if (searchStore.searchResults.length > 0) {
      console.log('Showing partial results despite error')
      searchStore.clearError()
    } else {
      searchStore.setError(err.message)
    }
  } finally {
    // Loading state is already cleared after initial results
    // No need to do anything here
  }
}
</script>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.search-container {
  display: flex;
  background: transparent;
  border: 1px solid #CDC7C6;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.3s ease;
  width: 100%;
  min-height: 50px;
}

.search-container:focus-within {
  border-color: #702632;
}

.search-container.error {
  border-color: #ff6b6b;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  background: transparent;
  border: none;
  color: #CDC7C6;
  font-size: 1rem;
  direction: rtl;
  text-align: right;
  outline: none;
  font-family: 'Vazirmatn', sans-serif;
}

.search-input::placeholder {
  color: #888;
}

.search-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.search-button {
  width: 50px;
  background: #CDC7C6 !important;
  color: #702632;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
  align-self: stretch;
}

.search-button:hover:not(:disabled) {
  background: #B8B0AF;
}

.search-button:disabled {
  background: #555;
  cursor: not-allowed;
}

.search-button svg {
  width: 20px;
  height: 20px;
}

.error-message {
  color: #ff6b6b;
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 4px;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: row;
    min-height: 50px;
    align-items: stretch;
  }
  
  .search-button {
    width: 50px;
    height: auto;
    flex-shrink: 0;
    align-self: stretch;
    min-height: 50px;
  }
  
  .search-input {
    padding: 15px 15px;
    font-size: 0.9rem;
    flex: 1;
  }
}
</style>
