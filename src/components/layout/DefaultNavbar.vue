<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light fixed-top">
    <div class="container-md">
      <router-link
        class="btn btn-secondary btn-sm"
        :to="{ name: 'home' }"
      >
        {{ '\u003C' }}
        <span class="ms-1">Voltar</span>
      </router-link>
      <router-link
        class="navbar-brand me-0"
        :to="{ name: 'home' }"
      >
        Palavrinhas
      </router-link>
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

@media (max-width: 700px) {
  .navbar > .container-md {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
