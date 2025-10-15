<template>
  <div class="login-page">
    <!-- Navbar -->
    <Navbar />
    
    <div class="page-container">
      <div class="back-link">
        <router-link to="/" class="back-btn">
          ← بازگشت به صفحه اصلی
        </router-link>
      </div>
      <AuthForm :initial-tab="'login'" />
    </div>
  </div>
</template>

<script setup>
import AuthForm from '../components/AuthForm.vue'
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #151515;
  display: flex;
  flex-direction: column;
  padding-top: 85px; /* Navbar height */
}

.page-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.back-link {
  margin-bottom: 20px;
  text-align: center;
}

.back-btn {
  color: #CDC7C6;
  text-decoration: none;
  font-family: 'Vazirmatn', sans-serif;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #702632;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .login-page {
    padding: 15px;
  }
}
</style>
