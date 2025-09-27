<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
// Main app component - routing is handled by Vue Router
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;200;300;400;500;600;700;800;900&family=Lalezar&display=swap');

#app {
  font-family: 'Vazirmatn', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #CDC7C6;
  background: #151515;
  min-height: 100vh;
  direction: rtl;
  text-align: center;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  background: #151515;
  color: #CDC7C6;
  font-family: 'Vazirmatn', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  width: 100%;
  overflow-x: hidden;
}

html {
  width: 100%;
  margin: 0;
  padding: 0;
}

/* Header font class */
.font-lalezar {
  font-family: 'Lalezar', cursive;
}
</style>
