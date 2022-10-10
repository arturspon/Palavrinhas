<template>
  <nav class="navbar navbar-expand-lg navbar-light fixed-top">
    <div class="container-md">
      <router-link
        v-if="$route.name != 'home'"
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
