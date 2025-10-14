<template>
  <div class="app">
    <!-- Filter Sidebar -->
    <FilterPanel />
    
    <!-- Main Content -->
    <div class="main-content">
      <!-- Mobile: Filter Toggle Button will be here from FilterPanel -->
      
      <!-- Main Title Section -->
      <div class="title-section">
        <h1 class="main-title font-lalezar">کافیه کلمه رو سرچ کنی</h1>
        <p class="subtitle font-lalezar">شعر خودش تو را پیدا میکند...</p>
      </div>

      <!-- Search Section -->
      <div class="search-section">
        <SearchBar />
      </div>
      
      <!-- Results Section -->
      <div class="results-section">
        <ResultList />
      </div>
    </div>
  </div>
</template>

<script setup>
import SearchBar from '../components/SearchBar.vue'
import FilterPanel from '../components/FilterPanel.vue'
import ResultList from '../components/ResultList.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  background: #151515;
  direction: rtl;
  display: flex;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  position: relative;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  margin-right: 320px;
  transition: margin-right 0.3s ease;
}

.title-section {
  margin-bottom: 60px;
  text-align: center;
}

.main-title {
  padding-top: 100px;
  margin-top: 50px;
  font-size: 2.2rem;
  font-weight: 400;
  color: #CDC7C6;
  margin: 0 0 15px 0;
  line-height: 1.3;
  font-family: 'Lalezar', cursive;
}

.subtitle {
  font-size: 1.1rem;
  color: #CDC7C6;
  margin: 0;
  font-weight: 400;
  opacity: 0.8;
  font-family: 'Lalezar', cursive;
}

.search-section {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.results-section {
  width: 100%;
  max-width: 1400px;
  margin: 40px auto 0;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .app {
    flex-direction: column;
  }
  
  .main-content {
    margin-right: 0;
    padding: 15px;
    width: 100%;
    padding-top: 80px; /* Space for toggle button */
  }
  
  .main-title {
    font-size: 1.8rem;
    padding-top: 20px;
    margin-top: 0;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .search-section {
    max-width: 100%;
    width: 100%;
  }
  
  .results-section {
    max-width: 100%;
    width: 100%;
    margin: 20px auto 0;
  }
  
  .title-section {
    margin-bottom: 40px;
  }
}

/* Large Desktop */
@media (min-width: 1920px) {
  .results-section {
    max-width: 1800px;
  }
}
</style>
