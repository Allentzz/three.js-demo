<script setup>
</script>

<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<style scoped>
nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
