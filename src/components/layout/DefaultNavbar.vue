<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-md">
      <button
        class="btn btn-secondary btn-sm"
        @click="$router.go(-1)"
      >
        {{ '\u003C' }}
        <span class="ms-1">Voltar</span>
      </button>
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
