import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Error handling for app mount
try {
  app.mount('#app')
  console.log('✅ App mounted successfully')
} catch (error) {
  console.error('❌ Error mounting app:', error)
  document.getElementById('app').innerHTML = `
    <div style="padding: 20px; color: #ff6b6b; text-align: center; font-family: 'Vazirmatn', sans-serif;">
      <h1>خطا در بارگذاری برنامه</h1>
      <p>لطفاً صفحه را رفرش کنید یا با پشتیبانی تماس بگیرید.</p>
      <p style="font-size: 0.9rem; color: #888; margin-top: 20px;">Error: ${error.message}</p>
    </div>
  `
}
