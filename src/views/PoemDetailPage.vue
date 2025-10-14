<template>
  <div class="poem-detail-page">
    <!-- Back Button -->
    <button @click="goBack" class="back-btn">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      بازگشت
    </button>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>در حال بارگذاری شعر کامل...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadPoem" class="retry-btn">تلاش مجدد</button>
    </div>

    <!-- Poem Content -->
    <div v-else-if="poem" class="poem-container">
      <!-- Poem Header -->
      <div class="poem-header">
        <h1 class="poet-name">{{ poem.poet || 'نامشخص' }}</h1>
        <h2 class="poem-title">{{ poem.title || '' }}</h2>
        <span class="poem-category">{{ poem.category || 'عمومی' }}</span>
      </div>

      <!-- Poem Content -->
      <div class="poem-content">
        <!-- Desktop: Two Column Layout -->
        <div class="desktop-layout">
          <div 
            v-for="(couplet, cIndex) in poem.couplets" 
            :key="`couplet-${cIndex}`"
            class="couplet-row"
          >
            <div class="poetry-columns">
              <div class="poetry-column">
                <div class="poetry-line">{{ couplet[0] }}</div>
              </div>
              <div class="poetry-column">
                <div class="poetry-line">{{ couplet[1] }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile: Single Column Layout -->
        <div class="mobile-layout">
          <div 
            v-for="(couplet, cIndex) in poem.couplets" 
            :key="`mobile-couplet-${cIndex}`"
            class="couplet-row"
          >
            <div class="poetry-column">
              <div class="poetry-line">{{ couplet[0] }}</div>
              <div class="poetry-line">{{ couplet[1] }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <button @click="copyPoem" class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
          </svg>
          کپی شعر
        </button>
        <button @click="sharePoem" class="action-btn">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12S8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5S19.66 2 18 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12S4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.34C15.11 18.55 15.08 18.77 15.08 19C15.08 20.61 16.39 21.92 18 21.92S20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" fill="currentColor"/>
          </svg>
          اشتراک‌گذاری
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '../services/api.js'

const route = useRoute()
const router = useRouter()
const poem = ref(null)
const loading = ref(false)
const error = ref(null)

const loadPoem = async () => {
  const poemId = route.params.id
  if (!poemId) {
    error.value = 'شناسه شعر یافت نشد'
    return
  }

  loading.value = true
  error.value = null

  try {
    console.log('Loading poem with ID:', poemId)
    const poemData = await ApiService.getFullPoem(poemId)
    console.log('Loaded poem:', poemData)
    poem.value = poemData
  } catch (err) {
    console.error('Error loading poem:', err)
    error.value = 'خطا در بارگذاری شعر. لطفاً دوباره تلاش کنید.'
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

const copyPoem = async () => {
  if (!poem.value) return

  const poetryText = poem.value.couplets
    .map(couplet => `${couplet[0]}    ${couplet[1]}`)
    .join('\n')
  const fullText = `${poem.value.poet}\n${poem.value.title}\n\n${poetryText}`

  try {
    await navigator.clipboard.writeText(fullText)
    alert('شعر کپی شد!')
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const sharePoem = async () => {
  if (!poem.value) return

  const poetryText = poem.value.couplets
    .map(couplet => `${couplet[0]}    ${couplet[1]}`)
    .join('\n')
  const shareText = `${poem.value.poet}\n${poem.value.title}\n\n${poetryText}`

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${poem.value.poet} - ${poem.value.title}`,
        text: shareText,
        url: window.location.href
      })
    } catch (err) {
      console.log('Share cancelled or failed:', err)
    }
  } else {
    copyPoem()
  }
}

onMounted(() => {
  loadPoem()
})
</script>

<style scoped>
.poem-detail-page {
  min-height: 100vh;
  background: #151515;
  padding: 40px 20px;
  direction: rtl;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 1px solid #CDC7C6;
  color: #CDC7C6;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

.back-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.back-btn svg {
  width: 20px;
  height: 20px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px 20px;
  color: #CDC7C6;
  font-size: 1.2rem;
  font-family: 'Vazirmatn', sans-serif;
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
  font-family: 'Vazirmatn', sans-serif;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.retry-btn:hover {
  background: #8b3a42;
}

.poem-container {
  max-width: 1400px;
  margin: 0 auto;
  background: #1a1a1a;
  border-radius: 12px;
  padding: 40px;
  border: 1px solid #CDC7C6;
}

.poem-header {
  text-align: center;
  padding-bottom: 30px;
  border-bottom: 1px solid rgba(205, 199, 198, 0.2);
  margin-bottom: 40px;
}

.poet-name {
  font-size: 2.5rem;
  font-weight: bold;
  color: #CDC7C6;
  margin: 0 0 10px 0;
  font-family: 'Vazirmatn', sans-serif;
}

.poem-title {
  font-size: 1.5rem;
  color: #CDC7C6;
  margin: 0 0 10px 0;
  font-family: 'Vazirmatn', sans-serif;
  opacity: 0.8;
}

.poem-category {
  color: #888;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
}

.poem-content {
  margin-bottom: 40px;
}

.couplet-row {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(205, 199, 198, 0.15);
}

.couplet-row:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.poetry-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 100px;
  direction: rtl;
  width: 100%;
}

.desktop-layout {
  display: block;
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
  margin: 5px 0;
  padding: 8px 10px;
  line-height: 2.2;
  color: #CDC7C6;
  font-size: 1.2rem;
  font-weight: 400;
  transition: all 0.3s ease;
  white-space: normal;
  min-height: 40px;
  display: flex;
  align-items: center;
  width: 100%;
}

.poetry-line:hover {
  background: rgba(112, 38, 50, 0.1);
  border-radius: 4px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 30px;
  border-top: 1px solid rgba(205, 199, 198, 0.2);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: transparent;
  color: #CDC7C6;
  border: 1px solid #CDC7C6;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.action-btn svg {
  width: 20px;
  height: 20px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .poem-detail-page {
    padding: 20px 15px;
  }

  .poem-container {
    padding: 20px;
  }

  .poet-name {
    font-size: 1.8rem;
  }

  .poem-title {
    font-size: 1.2rem;
  }

  .desktop-layout {
    display: none;
  }

  .mobile-layout {
    display: block;
  }

  .couplet-row {
    margin-bottom: 12px;
    padding-bottom: 8px;
  }

  .poetry-line {
    font-size: 1rem;
    margin: 5px 0;
    padding: 6px 8px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 15px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>

