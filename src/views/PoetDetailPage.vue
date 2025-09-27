<template>
  <div class="poet-detail-page">
    <div class="poet-header">
      <router-link to="/" class="back-link">← بازگشت به جستجو</router-link>
      <h1 class="poet-name">{{ poet?.name || 'در حال بارگذاری...' }}</h1>
      <p class="poet-info" v-if="poet">
        تعداد اشعار: {{ poet.poemCount }}
      </p>
    </div>
    
    <div class="poet-content" v-if="poet">
      <div class="poet-bio">
        <h2>درباره شاعر</h2>
        <p>{{ poet.bio || 'اطلاعات بیوگرافی در دسترس نیست.' }}</p>
      </div>
      
      <div class="poet-poems">
        <h2>اشعار</h2>
        <div class="poems-list" v-if="poems.length > 0">
          <div 
            v-for="poem in poems" 
            :key="poem.id" 
            class="poem-item"
          >
            <h3 class="poem-title">{{ poem.title }}</h3>
            <div class="poem-verses">
              <p v-for="verse in poem.verses" :key="verse" class="verse">
                {{ verse }}
              </p>
            </div>
          </div>
        </div>
        <p v-else class="no-poems">اشعاری یافت نشد.</p>
      </div>
    </div>
    
    <div v-else-if="isLoading" class="loading">
      در حال بارگذاری...
    </div>
    
    <div v-else-if="error" class="error">
      خطا در بارگذاری اطلاعات: {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ApiService } from '../services/api.js'

const route = useRoute()
const poetId = route.params.id

const poet = ref(null)
const poems = ref([])
const isLoading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    isLoading.value = true
    // For now, using mock data. Replace with actual API call when backend is ready
    const mockPoets = ApiService.getMockPoets()
    poet.value = mockPoets.find(p => p.id == poetId)
    
    if (!poet.value) {
      error.value = 'شاعر یافت نشد'
      return
    }
    
    // Mock poems data
    poems.value = [
      {
        id: 1,
        title: 'غزل شماره ۱',
        verses: [
          'بیا تا گل برافشانیم و می در ساغر اندازیم',
          'فلک را سقف ببندیم و طرحی نو دراندازیم'
        ]
      },
      {
        id: 2,
        title: 'غزل شماره ۲',
        verses: [
          'صبحدم از عشق تو گفتم که چه کردم',
          'گفتا که چه کردی که چه کردی که چه کردی'
        ]
      }
    ]
  } catch (err) {
    error.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.poet-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  direction: rtl;
  text-align: right;
}

.poet-header {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.back-link {
  color: #007bff;
  text-decoration: none;
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: inline-block;
}

.back-link:hover {
  text-decoration: underline;
}

.poet-name {
  color: #2c3e50;
  font-size: 2.5rem;
  margin: 0 0 10px 0;
  font-weight: 300;
}

.poet-info {
  color: #6c757d;
  font-size: 1.2rem;
  margin: 0;
}

.poet-content {
  display: grid;
  gap: 30px;
}

.poet-bio,
.poet-poems {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.poet-bio h2,
.poet-poems h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 20px;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.poems-list {
  display: grid;
  gap: 20px;
}

.poem-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
}

.poem-title {
  color: #495057;
  font-size: 1.3rem;
  margin-bottom: 15px;
}

.poem-verses {
  line-height: 2;
}

.verse {
  margin: 8px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 1.2rem;
}

.error {
  color: #dc3545;
}

.no-poems {
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 768px) {
  .poet-detail-page {
    padding: 10px;
  }
  
  .poet-header,
  .poet-bio,
  .poet-poems {
    padding: 20px;
  }
  
  .poet-name {
    font-size: 2rem;
  }
}
</style>
