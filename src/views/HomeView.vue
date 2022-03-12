<template>
  <div class="home vh-100 d-flex align-items-center justify-content-center">
    <div>
      <h1>Palavrinhas</h1>
      <div class="mt-3">
        <button
          class="btn btn-primary btn-lg"
          :disabled="isLoading.gameCreation"
          @click="play()"
        >
          <template v-if="isLoading.gameCreation">
            <span
              class="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
            <span class="visually-hidden">Carregando...</span>
          </template>
          <template v-else>JOGAR</template>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { createMatch } from '@/services/match'

export default {
  name: 'HomeView',

  data() {
    return {
      isLoading: {
        gameCreation: false,
      },
    }
  },

  methods: {
    async play() {
      this.isLoading.gameCreation = true

      const docRef = await createMatch(this.$db)

      this.$router.push({
        name: 'game',
        params: {
          gameId: docRef.id,
        }
      })
    },
  },
}
</script>
