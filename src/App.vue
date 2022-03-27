<script>
import DefaultNavbar from '@/components/layout/DefaultNavbar.vue'
import { useAuthStore } from './store/AuthStore'

export default {
  components: {
    DefaultNavbar,
  },

  data() {
    return {
      authStore: useAuthStore(),
    }
  },

  created() {
    this.authStore.attachAuthStateChangeListener()
  },

  watch: {
    $route(to, from) {
      if (window?.ReactNativeWebView?.postMessage) {
        window.ReactNativeWebView.postMessage(
          JSON.stringify({
            type: 'routeUpdate',
            data: to.name,
          })
        )
      }
    },
  },
}
</script>

<template>
  <div id="app">
    <div v-if="$route.name != 'home'">
      <DefaultNavbar />
    </div>
    <div :class="$route.name != 'home' ? 'mt-5 pt-2' : ''">
      <router-view :key="$route.fullPath" />
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fredoka&display=swap');

#app {
  font-family: 'Fredoka', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

body {
  background-image: url('~@/assets/images/bgtile3.png');
  background-repeat: repeat;
  background-size: 8rem;
}

.card {
  border-radius: 1rem;
}

.vertical-center {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90vh;
}
</style>
