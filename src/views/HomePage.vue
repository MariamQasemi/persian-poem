<template>
  <div class="app">
    <!-- Main Title Section -->
    <div class="title-section">
      <h1 class="main-title font-lalezar">کافیه کلمه رو سرچ کنی</h1>
      <p class="subtitle font-lalezar">شعر خودش تو را پیدا میکند...</p>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-filter-section">
      <SearchBar />
      <FilterPanel />
    </div>
    
    <!-- Results Section -->
    <div class="results-section">
      <ResultList />
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
  text-align: center;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 0;
  box-sizing: border-box;
  position: relative;
  left: 0;
  right: 0;
}

.title-section {
  margin-bottom: 60px;
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

.search-filter-section {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
}

.results-section {
  width: 100%;
  margin: 40px auto 0;
}

@media (max-width: 768px) {
  .app {
    padding: 0 15px;
  }
  
  .main-title {
    font-size: 1.8rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .search-filter-section {
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
</style>
