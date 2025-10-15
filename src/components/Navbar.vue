<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo and Welcome Message -->
      <div class="navbar-brand">
        <!-- Mobile Sidebar Toggle -->
        <button 
          @click="toggleSidebar"
          class="sidebar-toggle-btn"
          :class="{ 'active': showSidebar }"
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="logo-icon">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="logo-text">شعر یاب</span>
        </div>
      </div>

      <!-- Auth Buttons -->
      <div class="navbar-auth">
        <router-link to="/login" class="auth-btn login-btn">
          ورود
        </router-link>
        <router-link to="/register" class="auth-btn register-btn">
          ثبت نام
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const showSidebar = ref(false)

const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
  // Emit event to parent components to handle sidebar toggle
  // This will be handled by the FilterPanel component
  window.dispatchEvent(new CustomEvent('toggleSidebar'))
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 85px;
  background: #1a1a1a;
  border-bottom: 1px solid #CDC7C6;
  z-index: 1000;
  direction: rtl;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.sidebar-toggle-btn {
  display: none;
  background: transparent;
  border: 1px solid #CDC7C6;
  border-radius: 6px;
  padding: 8px;
  color: #CDC7C6;
  cursor: pointer;
  transition: all 0.3s ease;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.sidebar-toggle-btn.active {
  background: #702632;
  border-color: #702632;
  color: white;
}

.sidebar-toggle-btn svg {
  width: 18px;
  height: 18px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  width: 24px;
  height: 24px;
  color: #702632;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #CDC7C6;
  font-family: 'Vazirmatn', sans-serif;
}

.welcome-message {
  display: flex;
  align-items: center;
}

.welcome-text {
  font-size: 0.9rem;
  color: #888;
  font-family: 'Vazirmatn', sans-serif;
}

.navbar-auth {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 80px;
   /* 80px margin from left edge (RTL) */
  max-width: 200px;
}

.auth-btn {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  font-size: 0.9rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 80px;
}

.login-btn {
  background: transparent;
  color: #CDC7C6;
  border: 1px solid #CDC7C6;
}

.login-btn:hover {
  background: #702632;
  border-color: #702632;
  color: white;
}

.register-btn {
  background: #702632;
  color: white;
  border: 1px solid #702632;
}

.register-btn:hover {
  background: #8b3a42;
  border-color: #8b3a42;
}

/* Desktop Styles */
@media (min-width: 769px) {
  .navbar-container {
    padding-left: 20px;
    padding-right: 80px; /* Max 80px margin from left edge (RTL) */
  }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 15px;
  }
  
  .navbar-auth {
    margin-right: 0; /* Remove margin on mobile */
  }
  
  .sidebar-toggle-btn {
    display: flex;
  }
  
  .navbar-brand {
    gap: 10px;
  }
  
  .logo-text {
    font-size: 1rem;
  }
  
  .navbar-auth {
    gap: 8px;
  }
  
  .auth-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
    min-width: 70px;
  }
}

/* Very small screens */
@media (max-width: 480px) {
  .welcome-message {
    display: none;
  }
  
  .logo-text {
    font-size: 0.9rem;
  }
  
  .auth-btn {
    padding: 6px 10px;
    font-size: 0.75rem;
    min-width: 60px;
  }
}
</style>
