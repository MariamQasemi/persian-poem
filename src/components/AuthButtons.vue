<template>
  <div class="auth-buttons">
    <router-link to="/login" class="auth-btn login-btn">
      ورود
    </router-link>
    <router-link to="/register" class="auth-btn register-btn">
      ثبت نام
    </router-link>
  </div>
</template>

<script setup>
// No additional logic needed - just navigation buttons
</script>

<style scoped>
.auth-buttons {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.auth-btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 1rem;
  font-family: 'Vazirmatn', sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  min-width: 120px;
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
  transform: translateY(-2px);
}

.register-btn {
  background: #702632;
  color: white;
  border: 1px solid #702632;
}

.register-btn:hover {
  background: #8b3a42;
  border-color: #8b3a42;
  transform: translateY(-2px);
}

/* Mobile Styles */
@media (max-width: 768px) {
  .auth-buttons {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  
  .auth-btn {
    width: 200px;
    padding: 10px 20px;
    font-size: 0.95rem;
  }
}
</style>
