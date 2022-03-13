<template>
  <nav class="navbar navbar-light">
    <div class="container">
      <div class="container-fluid text-center">
        <router-link class="navbar-brand me-0" :to="{ name: 'home' }"
          >Palavrinhas</router-link
        >
      </div>
    </div>
  </nav>
</template>

<script>
export default {}
</script>

<style scoped>
.navbar {
  background-color: #eeeeee;
}
</style>
