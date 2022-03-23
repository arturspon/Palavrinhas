<template>
  <div id="app">
    <div v-if="$route.name != 'home'">
      <DefaultNavbar />
    </div>
    <div :class="$route.name != 'home' ? 'mt-5 pt-2' : ''">
      <router-view />
    </div>
  </div>
</template>

<script>
import DefaultNavbar from '@/components/layout/DefaultNavbar'
export default {
  components: {
    DefaultNavbar,
  },

  watch: {
    $route(to, from) {
      if (window?.ReactNativeWebView?.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'routeUpdate',
          data: to.name,
        }))
      }
    },
  },
}
</script>

<style lang="scss">
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

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

.card {
  border-radius: 1rem;
}
</style>
